// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h3 style='color:yellow'>${{topInfo}}</h3>
    <hr />
    <div>State: <span id="label">--</span></div>
    <hr />
    <ui-button id="btn">Send To Main</ui-button>
  `,

  // element and variable binding
  $: {
    btn: '#btn',
    label: '#label',
  },

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.$btn.addEventListener('confirm', () => {
      Editor.Ipc.sendToMain('reference-finder:clicked');
    });
    new Window.Vue({
      el: this.shadowRoot,
      data: {
        topInfo
      }
    })
  },

  // register your ipc messages here
  messages: {
    'reference-finder:hello'(event) {
      this.$label.innerText = 'Hello!';
    }
  }
});