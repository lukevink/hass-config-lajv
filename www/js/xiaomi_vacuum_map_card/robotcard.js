import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@0.6.5/lit-element.js?module';

const styles = html`
  <style>
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
    ha-card {
      flex-direction: column;
      flex: 1;
      position: relative;
      padding: 0px;
      border-radius: 4px;
      overflow: hidden;
    }
    .preview {
      background: #319ef9; /* fallback for old browsers */
      background: -webkit-linear-gradient(to bottom, #319ef9, #1566ba); /* Chrome 10-25, Safari 5.1-6 */
      background: linear-gradient(to bottom, #319ef9, #1566ba); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
      cursor: pointer;
      overflow: hidden;
      position: relative;
    }
    .vacuum {
      display: block;
      max-width: 90%;
      image-rendering: crisp-edges;
      margin: 30px auto 20px auto;
    }
    .fill-gap {
      flex-grow: 1;
    }
    .vacuum.cleaning {
      animation: cleaning 1s steps(5, end) infinite;
    }
    .battery {
      text-align: right;
      font-weight: bold;
      padding: 15px;
    }
    .status {
      font-weight: bold;
      padding: 15px 20px;
      text-align: left;
    }
    .stats {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }
    .stats-block {
      margin: 10px 0px;
      text-align: center;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      flex-grow: 1;
    }
    .stats-block:last-child {
      border: 0px;
    }
    .stats-hours {
      font-size: 20px;
      font-weight: bold;
    }
    @keyframes cleaning {
      0% {
        transform: translate(0);
      }
      20% {
        transform: translate(-2px, 2px);
      }
      40% {
        transform: translate(-2px, -2px);
      }
      60% {
        transform: translate(2px, 2px);
      }
      80% {
        transform: translate(2px, -2px);
      }
      100% {
        transform: translate(0);
      }
    }
    ha-icon {
      color: #fff;
    }
    .toolbar {
      background: #fff;
      min-height: 30px;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }
    .toolbar paper-icon-button {
      color: #319ef9;
      flex-direction: column;
      width: 44px;
      height: 54px;
      margin-right: 10px;
      padding: 10px;
    }
    .toolbar paper-button {
      color: #319ef9;
      flex-direction: column;
      margin-right: 10px;
      padding: 15px 10px;
      cursor: pointer;
    }
    .toolbar paper-icon-button:last-child {
      margin-right: 0px;
    }
    .toolbar paper-icon-button:active, .toolbar paper-button:active {
      opacity: 0.4;
      background: rgba(0, 0, 0, 0.1);
    }
    .toolbar paper-button {
      color: #319ef9;
      flex-direction: row;
    }
    .toolbar ha-icon {
      color: #319ef9;
      padding-right: 15px;
    }
    .header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .source-menu {
      padding: 0;
      margin-top: 15px;
    }
    .toolbar-split {
      padding-right: 15px;
    }
  </style>
`

class VacuumCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      mapUrl: String
    }
  }

  get entity() {
    return this.hass.states[this.config.entity]
  }

  get map() {
    return this.hass.states[this.config.map]
  }

  firstUpdated() {
    this.refresh()
  }

  refresh() {
    const cleaning = this.entity.state !== 'docked'

    const url = this.map.attributes.entity_picture + `&t=${(new Date()).getTime()}`
    const img = new Image();
    img.onload = () => {
      this.mapUrl = url
      this.requestUpdate();
      setTimeout(() => this.refresh(), cleaning ? 1000 : 5000)
    }
    img.src = url
  }

  handleMore() {
    const e = new Event('hass-more-info', { bubbles: true, composed: true })
    e.detail = { entityId: this.entity.entity_id }
    this.dispatchEvent(e);
  }

  handleSpeed(e) {
    const fan_speed = e.target.getAttribute('value');
    this.callService('set_fan_speed', {
      fan_speed
    });
  }

  callService(service, options = {}) {
    this.hass.callService('vacuum', service, {
      entity_id: this.config.entity,
      ...options
    });
  }

  renderSource() {
    const {
      attributes: {
        fan_speed: source,
        fan_speed_list: sources
      }
    } = this.entity;

    const selected = sources.indexOf(source);
    return html`
      <paper-menu-button class='source-menu' slot='dropdown-trigger'
        .horizontalAlign=${'right'} .verticalAlign=${'top'}
        .verticalOffset=${40} .noAnimations=${true}
        @click='${(e) => e.stopPropagation()}'>
        <paper-button class='source-menu__button' slot='dropdown-trigger'>
          <span class='source-menu__source' show=${true}>
            ${source}
          </span>
          <ha-icon icon="mdi:fan"></ha-icon>
        </paper-button>
        <paper-listbox slot='dropdown-content' selected=${selected}
          @click='${(e) => this.handleSpeed(e)}'>
          ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  renderVacuumStats() {
    const {
      attributes: {
        main_brush_left,
        side_brush_left,
        filter_left,
        sensor_dirty_left
      }
    } = this.entity

    return html`
      <div class="stats-block">
        <span class="stats-hours">${filter_left}</span> <sup>hours</sup>
        <div class="stats-subtitle">Filter</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${side_brush_left}</span> <sup>hours</sup>
        <div class="stats-subtitle">Side brush</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${main_brush_left}</span> <sup>hours</sup>
        <div class="stats-subtitle">Main brush</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${sensor_dirty_left}</span> <sup>hours</sup>
        <div class="stats-subtitle">Sensors</div>
      </div>
    `
  }

  renderCleaningStats() {
    const {
      attributes: {
        cleaned_area,
        cleaning_time
      }
    } = this.entity

    return html`
      <div class="stats-block">
        <span class="stats-hours">${cleaned_area}</span> m<sup>2</sup>
        <div class="stats-subtitle">Cleaning area</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${cleaning_time}</span> minutes
        <div class="stats-subtitle">Cleaning time</div>
      </div>
    `
  }

  renderCleaningToolbar() {
    return html`
      <div class="toolbar">
        <paper-button @click='${(e) => this.callService('return_to_base')}'>
          <ha-icon icon="hass:home-map-marker" ></ha-icon>
          Return to dock
        </paper-button>
      </div>
    `
  }

  renderDockedToolbar() {
    const { actions } = this.config
    const buttons = actions.map(({ name, service, icon }) => {
      const execute = () => {
        const args = service.split('.')
        this.hass.callService(args[0], args[1]);
      }
      return html`<paper-icon-button icon="${icon}" title="${name}" @click='${execute}'></paper-icon-button>`
    })

    return html`
      <div class="toolbar">
        <paper-icon-button  icon="hass:play"
                            title="Clean" class="toolbar-icon"
                            @click='${(e) => this.callService('start')}'>
        </paper-icon-button>
        <paper-icon-button  icon="mdi:crosshairs-gps"
                            title="Locate vacuum" class="toolbar-split"
                            @click='${(e) => this.callService('locate')}'>
        </paper-icon-button>
        <div class="fill-gap"></div>
        ${buttons}
      </div>
    `
  }

  render() {
    const {
      state,
      attributes: {
        status,
        battery_level,
        battery_icon,
      }
    } = this.entity

    const cleaning = state !== 'docked'

    return html`
      ${styles}
      <ha-card>
        <div class="preview" @click='${(e) => this.handleMore()}' ?more-info=true>
          <div class="header">
            <div class="status">${status}</div>
            <div>
              ${this.renderSource()}
            </div>
            <div class="battery">
              ${battery_level}% <ha-icon icon="${battery_icon}"></ha-icon>
            </div>
          </div>
          <img class="vacuum" src="${this.mapUrl}" />
          <div class="stats">
            ${cleaning ? this.renderCleaningStats() : this.renderVacuumStats()}
          </div>
        </div>
        ${cleaning ? this.renderCleaningToolbar() : this.renderDockedToolbar()}
      </ha-card>
    `
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('vacuum-card', VacuumCard);
