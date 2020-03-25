// For learning purposes, I studied the following cards:
// https://github.com/robmarkoski/ha-clockwork-card/blob/master/clockwork-card.js


// Examples of using an HA entity's attributes:
// This example looks into HA entity (sensor.spotify_playlist), the attribute called 'Unorganized', and sub attribute 'name'
// const entityId = this.config.entity;
// const playlist = hass.states[entityId].attributes;
// ${playlist['Unorganized']['name']}
// ${playlist['Unorganized']['image']}
// ${playlist['Unorganized']['uri']}


class SpotifyPlaylistCard extends HTMLElement {

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    setConfig(config) {
      const root = this.shadowRoot;
      if (root.lastChild) root.removeChild(root.lastChild);
  
      // Contains values of this Lovelace card configuration
      const cardConfig = Object.assign({}, config);

      // Default values of config options. Uses ternary statements
      const columns = config.columns ? config.columns : 3;
      const gradientLevel = config.gradient_level ? config.gradient_level : 0.8;
      const gridGap = config.grid_gap ? config.grid_gap : '8px';
      // changes opacity to 0 to hide playlist title
      const showPlaylistTitles = config.show_playlist_titles ? 1 : 0;


      if (!config.sensor) {
        throw new Error('Please define the name of the Spotify Playlist sensor.');
      }


      const card = document.createElement('div');
      const content = document.createElement('div');
      const style = document.createElement('style');

      // Ideas: if 'column' and/or 'row' are not defined in options, then use this CSS to automatically organize playlists:
      //   'grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));'

      style.textContent = `
      .outercontainer {
        margin:auto;
        display: grid;
        grid-template-columns: repeat(${columns}, 1fr);
        grid-gap: ${gridGap};
      }

      .grid-item {
        position: relative;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
        border-radius: 3px;
      }

      .grid-item::before {
        content: '';
        display: block;
        padding-top: 100%;
      }

      .content {
        border-radius: 0 0 3px 3px;
        position: absolute;
        bottom: 0;
        opacity: ${showPlaylistTitles};
        width: 100%;
        padding: 20px 10px 10px 10px;
        border: 0;
        text-align: left;
        color: rgba(255,255,255,1);
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
	white-space: nowrap;
        background: rgb(0,0,0);
        background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,${gradientLevel}) 30%, rgba(0,0,0,${gradientLevel}) 100%);
        background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,${gradientLevel}) 30%,rgba(0,0,0,${gradientLevel}) 100%);
        background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,${gradientLevel}) 30%,rgba(0,0,0,${gradientLevel}) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#db000000',GradientType=0 );
      }
      `; 


      content.innerHTML = `
      <div id='content'>
      </div>
      `;
      
      card.appendChild(content);
      card.appendChild(style);
      root.appendChild(card);
      this.config = cardConfig;
    }
  
 
    set hass(hass) {
      const config = this.config;
      const root = this.shadowRoot;
      const card = root.lastChild;
      let card_content = ``;
      let playlist = {};
      this.myhass = hass;

      try {
        playlist = hass.states[config.sensor].attributes;   
        // Beginning of CSS grid
        card_content += `
        <div class="outercontainer">
          `;
         
        for (let entry in playlist) {
          // Sanity check that attributes in Spotify Playlist sensor are valid playlists
          if (entry !== "friendly_name" && entry !== "icon" && entry !== "homebridge_hidden") {
            card_content += `
            <div class="grid-item" id ="playlist${playlist[entry]['id']}" style="background-image:url(${playlist[entry]['image']});">
              <div class="content">${playlist[entry]['name']}</div>
            </div>
            `;
          }
        } 
        // End of CSS grid
        card_content += `</div>`;
      }
      catch(err) {
        throw new Error(`Error detected: ${err}`);
      }

      root.lastChild.hass = hass;
      root.getElementById('content').innerHTML = card_content;


      // Add a click event to any CSS objects that has an ID: playlist01, playlist02, etc.
      try {
        // need to redefine 'playlist' as it was walked through in entirety in prev for loop.
        playlist = hass.states[config.sensor].attributes;
        const playbackMethod = config.playback_method ? config.playback_method : "default";
        const speakerEntity = config.speaker_entity ? config.speaker_entity : "media_player.spotify";
        const shuffleBoolean = config.shuffle ? config.shuffle : true;
        const shuffleParameters = { "entity_id": speakerEntity, "shuffle": shuffleBoolean };
        let playlistParameters = {};

        // Learn about: 
        // hass.callService: https://developers.home-assistant.io/docs/en/frontend_data.html#hassuser
        for (let entry in playlist) {
          if (entry !== "friendly_name" && entry !== "icon" && entry !== "homebridge_hidden") {
            card.querySelector(`#playlist${playlist[entry]['id']}`).addEventListener('click', event => {
              if (playbackMethod == "alexa") {
                this.myhass.callService('media_player', 'shuffle_set', shuffleParameters); 
                playlistParameters = {"entity_id": speakerEntity, "media_content_type": "SPOTIFY", "media_content_id": `${playlist[entry]['name']}`};      
                this.myhass.callService('media_player', 'play_media', playlistParameters);                
              }
              else if (playbackMethod == "spotcast") {
                this.myhass.callService('media_player', 'shuffle_set', shuffleParameters); 
                playlistParameters = {"entity_id": speakerEntity, "uri": `${playlist[entry]['uri']}`, "random_song": shuffleBoolean };
                this.myhass.callService('spotcast', 'start', playlistParameters);
              }
              else {
                this.myhass.callService('media_player', 'shuffle_set', shuffleParameters);   
                playlistParameters = {"entity_id": speakerEntity, "media_content_type": "playlist", "media_content_id": `${playlist[entry]['uri']}`};
                this.myhass.callService('media_player', 'play_media', playlistParameters); 
              }
            });            
          }  
        }
      }
      catch(err) {
        throw new Error(`Error detected: ${err}`);
      }

      
    }
    getCardSize() {
      return 1;
    }
}
  
customElements.define('spotify-playlist-card', SpotifyPlaylistCard);
