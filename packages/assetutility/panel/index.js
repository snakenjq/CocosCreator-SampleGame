// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h2>设置忽略路径</h2>
    <hr />
    <div>多个路径以换行分隔</div>
    <hr />
    <textarea id='paths' placeholder="" style="width:100%; height:160px"></textarea>
    <hr/>
    <ui-button id="btn">保存</ui-button>
  `,

  // element and variable binding
  $: {
    btn: '#btn',
    text: '#paths'
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    Editor.Profile.load('profile://local/assetutility.json', (e,t)=>{
      t.data.paths = t.data.paths || [];
      if (t.data.paths.length){
        this.$text.value = t.data.paths.join('\n');
      }
    });

    this.$btn.addEventListener('confirm', () => {
      // Editor.Ipc.sendToMain('assetutility:clicked');
      Editor.Profile.load('profile://local/assetutility.json', (e,t)=>{
        t.data.paths.splice(0);
        const paths = this.$text.value.split('\n').filter(s=> !!s);
        if(paths.length){
          t.data.paths.push(...paths);
        }
        t.save();
        Editor.Dialog.messageBox({
          buttons: ['确定'],
          title: '设置忽略路径',
          message: '已保存'
        })
      });
    });
  },

  // register your ipc messages here
  messages: {
    'assetutility:hello' (event) {
      // this.$label.innerText = 'Hello!';
    }
  }
});