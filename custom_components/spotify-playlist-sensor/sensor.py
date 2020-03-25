"""
Home Assistant component that loads user's Spotify playlists in a sensor.

For more details, go to:
https://github.com/dnguyen800/Spotify-Playlist-Sensor
"""


from datetime import timedelta
from dateutil import parser
from time import strftime
import logging

import voluptuous as vol

from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv
from homeassistant.components.switch import (PLATFORM_SCHEMA)
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import callback

DEPENDENCIES = ['http']
REQUIREMENTS = ['spotipy-homeassistant==2.4.4.dev1']

__version__ = '0.0.2'
_LOGGER = logging.getLogger(__name__)

AUTH_CALLBACK_NAME = 'api:spotify'
AUTH_CALLBACK_PATH = '/api/spotify'


CONF_CLIENT_ID = 'client_id'
CONF_CLIENT_SECRET = 'client_secret'
CONF_CACHE_PATH = 'cache_path'
CONF_NUMBER_OF_PLAYLISTS = 'number_of_playlists'
CONF_OFFSET = 'offset'
CONF_NAME = 'name'

CONFIGURATOR_DESCRIPTION = 'To link your Spotify account, ' \
                           'click the link, login, and authorize:'
CONFIGURATOR_LINK_NAME = 'Link Spotify account'
CONFIGURATOR_SUBMIT_CAPTION = 'I authorized successfully'


DEFAULT_NAME = 'SpotifyPlaylist'
DEFAULT_NUMBER_OF_PLAYLISTS = 6

DOMAIN = 'spotify-playlist'
DEFAULT_OFFSET = 0
DEFAULT_CACHE_PATH = '.spotifyplaylist-token-cache'


DOMAIN = 'spotify-playlist'

ICON = 'mdi:spotify'

SCAN_INTERVAL = timedelta(hours=1)

SCOPE = 'user-read-playback-state user-modify-playback-state user-read-private playlist-read-private'

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_CLIENT_ID): cv.string,
    vol.Required(CONF_CLIENT_SECRET): cv.string,
    vol.Optional(CONF_NAME,
                 default=DEFAULT_NAME): cv.string,
    vol.Optional(CONF_NUMBER_OF_PLAYLISTS,
                 default=DEFAULT_NUMBER_OF_PLAYLISTS): cv.positive_int,
    vol.Optional(CONF_OFFSET,
                 default=DEFAULT_OFFSET): cv.positive_int,
})

def request_configuration(hass, config, add_devices, oauth):
    """Request Spotify authorization."""
    _LOGGER.info("request_configuration called")
    configurator = hass.components.configurator
    hass.data[DOMAIN] = configurator.request_config(
        DEFAULT_NAME, lambda _: None,
        link_name=CONFIGURATOR_LINK_NAME,
        link_url=oauth.get_authorize_url(),
        description=CONFIGURATOR_DESCRIPTION,
        submit_caption=CONFIGURATOR_SUBMIT_CAPTION)

def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the Spotify platform."""
    _LOGGER.info("setup_platform called")
    import spotipy.oauth2

    callback_url = '{}{}'.format(hass.config.api.base_url, AUTH_CALLBACK_PATH)
    cache = config.get(CONF_CACHE_PATH, hass.config.path(DEFAULT_CACHE_PATH))
    oauth = spotipy.oauth2.SpotifyOAuth(
        config.get(CONF_CLIENT_ID), config.get(CONF_CLIENT_SECRET),
        callback_url, scope=SCOPE,
        cache_path=cache)
    _LOGGER.info("oauth completed")
    token_info = oauth.get_cached_token()
    _LOGGER.info("oauth.get_cached_token() run")
    if not token_info:
        _LOGGER.info("no token; requesting authorization")
        hass.http.register_view(SpotifyAuthCallbackView(
            config, add_devices, oauth))
        request_configuration(hass, config, add_devices, oauth)
        return
    if hass.data.get(DOMAIN):
        configurator = hass.components.configurator
        configurator.request_done(hass.data.get(DOMAIN))
        del hass.data[DOMAIN]
    _LOGGER.info("about to run add_devices([SpotifyPlaylistSensor])")
    add_devices([SpotifyPlaylistSensor(hass, oauth, config)])


class SpotifyAuthCallbackView(HomeAssistantView):
    """Spotify Authorization Callback View."""
    requires_auth = False
    url = AUTH_CALLBACK_PATH
    name = AUTH_CALLBACK_NAME

    def __init__(self, config, add_devices, oauth):
        """Initialize."""
        _LOGGER.info("SpotifyAuthCallbackView __init__ called")
        self.config = config
        self.add_devices = add_devices
        self.oauth = oauth

    @callback
    def get(self, request):
        """Receive authorization token."""
        hass = request.app['hass']
        self.oauth.get_access_token(request.query['code'])
        hass.async_add_job(
            setup_platform, hass, self.config, self.add_devices)




class SpotifyPlaylistSensor(Entity):
    def __init__(self, hass, oauth, config):
        _LOGGER.info("SpotifyPlaylistSensor __init__ called")
        self.hass = hass
        self._name = config[CONF_NAME]
        self._client_id = config[CONF_CLIENT_ID]
        self._client_secret = config[CONF_CLIENT_SECRET]

        self._number_of_playlists = config[CONF_NUMBER_OF_PLAYLISTS]
        self._offset = config[CONF_OFFSET]

        self._state = None
        self._spotify = None
        self._oauth = oauth
        _LOGGER.info("self._oauth = auth should have run...")
        self._token_info = self._oauth.get_cached_token()
        # This is where the playlist data will be stored.
        self.hass.data[self._name] = {}
        self.update()

    def refresh_playlist_instance(self):
        """Fetch a new spotify instance."""
        _LOGGER.info("SpotifyPlaylistSensor refresh_playlist_instance called")
        import spotipy
        token_refreshed = False
        _LOGGER.info("about to call need_token and self._oauth.is_token_expired")
        need_token = (self._token_info is None or
                      self._oauth.is_token_expired(self._token_info))
        if need_token:
            new_token = \
                self._oauth.refresh_access_token(
                    self._token_info['refresh_token'])
            # skip when refresh failed
            if new_token is None:
                return

            self._token_info = new_token
            token_refreshed = True
        if self._spotify is None or token_refreshed:
            self._spotify = \
                spotipy.Spotify(auth=self._token_info.get('access_token'))


    def update(self):
        """Update state and attributes."""
        _LOGGER.info("SpotifyPlaylistSensor update called")
        self.refresh_playlist_instance()


        # Don't true update when token is expired
        _LOGGER.info("in update, about to call self._oauth.is_token_expired")
        if self._oauth.is_token_expired(self._token_info):
            _LOGGER.warning("Spotify failed to update, token expired.")
            return        

        # Execute code if token is available
        playlists = self._spotify.current_user_playlists(limit=self._number_of_playlists,
                                                offset=self._offset)
        self._state = self._number_of_playlists
        
        _LOGGER.info("clearing existing data in sensor")
        self.hass.data[self._name] = {}

        _LOGGER.info("updating playlists")
        for i,playlist in enumerate(playlists['items']):
            name = playlist['name']
            try: 
                image = playlist['images'][0]['url']
            except:
                image = ''
            uri = playlist['uri']
            id = i
            self.hass.data[self._name][name] = {}
            self.hass.data[self._name][name]['name'] = name
            self.hass.data[self._name][name]['image'] = image
            self.hass.data[self._name][name]['uri'] = uri
            self.hass.data[self._name][name]['id'] = id

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return self._state

    @property
    def icon(self):
        return ICON

    @property
    def device_state_attributes(self):
        return self.hass.data[self._name]


