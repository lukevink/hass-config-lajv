class TextElement extends HTMLElement {
  setConfig(config) {
    if (!config.text) { 
      throw new Error("You need to define a 'text:' in your configuration")
    }
    this.config = config;
    const card = document.createElement('text-element');
    this.innerHTML = this.config.text;
  }
  getCardSize() {
    return 1;
  }
}
customElements.define('text-element', TextElement);