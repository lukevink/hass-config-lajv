import logging
import voluptuous as vol
from homeassistant.components import http, websocket_api
from homeassistant.core import callback
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv
from homeassistant.components.cast.media_player import KNOWN_CHROMECAST_INFO_KEY
import random
import time

_VERSION = '3.1.1'
DOMAIN = 'spotcast'

_LOGGER = logging.getLogger(__name__)

CONF_SPOTIFY_DEVICE_ID = 'spotify_device_id'
CONF_DEVICE_NAME = 'device_name'
CONF_ENTITY_ID = 'entity_id'
CONF_SPOTIFY_URI = 'uri'
CONF_ACCOUNTS = 'accounts'
CONF_SPOTIFY_ACCOUNT = 'account'
CONF_FORCE_PLAYBACK = 'force_playback'
CONF_RANDOM = 'random_song'
CONF_REPEAT = 'repeat'
CONF_SHUFFLE = 'shuffle'
CONF_OFFSET = 'offset'
CONF_SP_DC = 'sp_dc'
CONF_SP_KEY = 'sp_key'

WS_TYPE_SPOTCAST_PLAYLISTS = "spotcast/playlists"

SCHEMA_PLAYLISTS = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {vol.Required("type"): WS_TYPE_SPOTCAST_PLAYLISTS}
)

SERVICE_START_COMMAND_SCHEMA = vol.Schema({
    vol.Optional(CONF_DEVICE_NAME): cv.string,
    vol.Optional(CONF_SPOTIFY_DEVICE_ID): cv.string,
    vol.Optional(CONF_ENTITY_ID): cv.string,
    vol.Optional(CONF_SPOTIFY_URI): cv.string,
    vol.Optional(CONF_SPOTIFY_ACCOUNT): cv.string,
    vol.Optional(CONF_FORCE_PLAYBACK, default=False): cv.boolean,
    vol.Optional(CONF_RANDOM, default=False): cv.boolean,
    vol.Optional(CONF_REPEAT, default='off'): cv.string,
    vol.Optional(CONF_SHUFFLE, default=False): cv.boolean,
    vol.Optional(CONF_OFFSET, default=0): cv.string
})

ACCOUNTS_SCHEMA = vol.Schema({
    vol.Required(CONF_SP_DC): cv.string,
    vol.Required(CONF_SP_KEY): cv.string,
})

CONFIG_SCHEMA = vol.Schema({
    DOMAIN: vol.Schema({
        vol.Required(CONF_SP_DC): cv.string,
        vol.Required(CONF_SP_KEY): cv.string,
        vol.Optional(CONF_ACCOUNTS): cv.schema_with_slug_keys(ACCOUNTS_SCHEMA),
    }),
}, extra=vol.ALLOW_EXTRA)


def setup(hass, config):
    """Setup the Spotcast service."""
    conf = config[DOMAIN]

    sp_dc = conf[CONF_SP_DC]
    sp_key = conf[CONF_SP_KEY]
    accounts = conf.get(CONF_ACCOUNTS)

    @callback
    def websocket_handle_playlists(hass, connection, msg):
        """Handle get playlist"""
        import spotipy
        access_token, expires = get_spotify_token(sp_dc=sp_dc, sp_key=sp_key)
        client = spotipy.Spotify(auth=access_token)
        resp = client._get('views/made-for-x?content_limit=10&locale=en&platform=web&types=album%2Cplaylist%2Cartist%2Cshow%2Cstation', limit=10,
                           offset=0)
        connection.send_message(
            websocket_api.result_message(msg["id"], resp)
        )

    def get_spotify_token(sp_dc, sp_key):
        import spotify_token as st
        data = st.start_session(sp_dc, sp_key)
        access_token = data[0]
        # token_expires = data[1]
        expires = data[1] - int(time.time())
        return access_token, expires

    def play(client, spotify_device_id, uri, random_song, repeat, shuffle, position):
        # import spotipy
        # import http.client as http_client
        # spotipy.trace = True
        # spotipy.trace_out = True
        # http_client.HTTPConnection.debuglevel = 1

        _LOGGER.debug('Version: %s, playing URI: %s on device-id: %s', _VERSION, uri, spotify_device_id)
        if uri.find('track') > 0:
            _LOGGER.debug('Playing track using uris= for uri: %s', uri)
            client.start_playback(device_id=spotify_device_id, uris=[uri])
        else:
            if uri == 'random':
                _LOGGER.debug('Cool, you found the easter egg with playing a random playlist')
                playlists = client.user_playlists('me', 50)
                no_playlists = len(playlists['items'])
                uri = playlists['items'][random.randint(0, no_playlists - 1)]['uri']
            kwargs = {'device_id': spotify_device_id, 'context_uri': uri}
            if random_song:
                if uri.find('album') > 0:
                    results = client.album_tracks(uri)
                    position = random.randint(0, results['total'] - 1)
                elif uri.find('playlist') > 0:
                    results = client.playlist_tracks(uri)
                    position = random.randint(0, results['total'] - 1)
                _LOGGER.debug('Start playback at random position: %s', position)
            if uri.find('artist') < 1:
                kwargs['offset'] = {'position': position}
            _LOGGER.debug('Playing context uri using context_uri for uri: "%s" (random_song: %s)', uri, random_song)
            client.start_playback(**kwargs)
        if shuffle or repeat:
            time.sleep(3)
            if shuffle:
                _LOGGER.debug('Turning shuffle on')
                time.sleep(2)
                client.shuffle(state=shuffle, device_id=spotify_device_id)
            if repeat:
                _LOGGER.debug('Turning repeat on')
                time.sleep(2)
                client.repeat(state=repeat, device_id=spotify_device_id)

    def get_account_credentials(call):
        """ Get credentials for account """
        account = call.data.get(CONF_SPOTIFY_ACCOUNT)
        dc = sp_dc
        key = sp_key
        if account is not None:
            _LOGGER.debug('setting up with different account than default %s', account)
            dc = accounts.get(account).get(CONF_SP_DC)
            key = accounts.get(account).get(CONF_SP_KEY)
        return dc, key

    def getSpotifyConnectDeviceId(client, device_name):
        devices_available = client.devices()
        for device in devices_available['devices']:
            if device['name'] == device_name:
                return device['id']
        return None

    def start_casting(call):
        """service called."""
        import spotipy

        uri = call.data.get(CONF_SPOTIFY_URI)
        random_song = call.data.get(CONF_RANDOM, False)
        repeat = call.data.get(CONF_REPEAT)
        shuffle = call.data.get(CONF_SHUFFLE)
        spotify_device_id = call.data.get(CONF_SPOTIFY_DEVICE_ID)
        position = call.data.get(CONF_OFFSET)
        force_playback = call.data.get(CONF_FORCE_PLAYBACK)

        # Account
        dc, key = get_account_credentials(call)

        # login as real browser to get powerful token
        access_token, expires = get_spotify_token(sp_dc=dc, sp_key=key)

        # get the spotify web api client
        client = spotipy.Spotify(auth=access_token)

        # first, rely on spotify id given in config
        if not spotify_device_id:
            # if not present, check if there's a spotify connect device with that name
            spotify_device_id = getSpotifyConnectDeviceId(client, call.data.get(CONF_DEVICE_NAME))
        if not spotify_device_id:
            # if still no id available, check cast devices and launch the app on chromecast
            spotify_cast_device = SpotifyCastDevice(hass, call.data.get(CONF_DEVICE_NAME), call.data.get(CONF_ENTITY_ID))
            spotify_cast_device.startSpotifyController(access_token, expires)
            spotify_device_id = spotify_cast_device.getSpotifyDeviceId(client)

        if uri is None or uri.strip() == '':
            _LOGGER.debug('Transfering playback')
            current_playback = client.current_playback()
            if current_playback is not None:
                _LOGGER.debug('Current_playback from spotipy: %s', current_playback)
                force_playback = True
            _LOGGER.debug('Force playback: %s', force_playback)
            client.transfer_playback(device_id=spotify_device_id, force_play=force_playback)
        else:
            play(client, spotify_device_id, uri, random_song, repeat, shuffle, position)

    # Register websocket and service
    hass.components.websocket_api.async_register_command(
        WS_TYPE_SPOTCAST_PLAYLISTS, websocket_handle_playlists, SCHEMA_PLAYLISTS
    )

    hass.services.register(DOMAIN, 'start', start_casting,
                                 schema=SERVICE_START_COMMAND_SCHEMA)

    return True


class SpotifyCastDevice:
    """Represents a spotify device."""
    hass = None
    castDevice = None
    spotifyController = None

    def __init__(self, hass, call_device_name, call_entity_id):
        """Initialize a spotify cast device."""
        self.hass = hass

        # Get device name from either device_name or entity_id
        device_name = None
        if call_device_name is None:
            entity_id = call_entity_id
            if entity_id is None:
                raise HomeAssistantError('Either entity_id or device_name must be specified')
            entity_states = hass.states.get(entity_id)
            if entity_states is None:
                _LOGGER.error('Could not find entity_id: %s', entity_id)
            else:
                device_name = entity_states.attributes.get('friendly_name')
        else:
            device_name = call_device_name

        if device_name is None or device_name.strip() == '':
            raise HomeAssistantError('device_name is empty')

        # Find chromecast device
        self.castDevice = self.getChromecastDevice(device_name)
        _LOGGER.debug('Found cast device: %s', self.castDevice)
        self.castDevice.wait()

    def getChromecastDevice(self, device_name):
        import pychromecast

        # Get cast from discovered devices of cast platform
        known_devices = self.hass.data.get(KNOWN_CHROMECAST_INFO_KEY, [])
        cast_info = next((x for x in known_devices if x.friendly_name == device_name), None)
        _LOGGER.debug('cast info: %s', cast_info)

        if cast_info:
            return pychromecast._get_chromecast_from_host((
                cast_info.host, cast_info.port, cast_info.uuid,
                cast_info.model_name, cast_info.friendly_name
            ))
        _LOGGER.error('Could not find device %s from hass.data, falling back to pychromecast scan', device_name)

        # Discover devices manually
        chromecasts = pychromecast.get_chromecasts()
        for _cast in chromecasts:
            if _cast.name == device_name:
                _LOGGER.debug('Fallback, found cast device: %s', _cast)
                return _cast

        raise HomeAssistantError('Could not find device with name {}'.format(device_name))

    def startSpotifyController(self, access_token, expires):
        from pychromecast.controllers.spotify import SpotifyController
        # get the volume so we can remove the bloink
        # volume = self.castDevice.status.volume_level
        # self.castDevice.set_volume(0)

        sp = SpotifyController(access_token, expires)
        self.castDevice.register_handler(sp)
        sp.launch_app()

        # reset the volume
        # self.castDevice.set_volume(volume)

        if not sp.is_launched and not sp.credential_error:
            raise HomeAssistantError('Failed to launch spotify controller due to timeout')
        if not sp.is_launched and sp.credential_error:
            raise HomeAssistantError('Failed to launch spotify controller due to credentials error')

        self.spotifyController = sp

    def getSpotifyDeviceId(self, client):
        # Look for device
        spotify_device_id = None
        devices_available = client.devices()
        for device in devices_available['devices']:
            if device['id'] == self.spotifyController.device:
                spotify_device_id = device['id']
                break

        if not spotify_device_id:
            _LOGGER.error('No device with id "{}" known by Spotify'.format(self.spotifyController.device))
            _LOGGER.error('Known devices: {}'.format(devices_available['devices']))
            raise HomeAssistantError('Failed to get device id from Spotify')
        return spotify_device_id
