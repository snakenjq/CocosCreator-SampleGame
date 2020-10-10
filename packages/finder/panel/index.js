const fs = require('fire-fs');
const path = require('fire-path');

Editor.Panel.extend({

  style: fs.readFileSync(Editor.url('packages://finder/panel/index.css'), 'utf-8'),
  template: fs.readFileSync(Editor.url('packages://finder/panel/index.html'), 'utf-8'),

  ready() {
    this.plugin = new window.Vue({
      el: this.shadowRoot,

      data: {
        topInfo: '',
        pathInfo: '',
        referenceInfos: [],
        showReference: false
      },

      created() {
        this.getNodeInfo();
        this.findReference();
      },

      methods: {
        _getCurNode() {
          return Editor.Selection.curGlobalActivate();
        },

        getNodeInfo() {
          const activateFile = this._getCurNode()
          if (!activateFile || !activateFile.id) {
            return '需要选中资源文件或层级节点';
          }
          Editor.Scene.callSceneScript('finder', 'get-node-name', activateFile, (err, name) => {
            this.topInfo = `当前选中:  ${name}  信息:  ${JSON.stringify(activateFile)}`
          });
        },

        findReference() {
          const activateFile = this._getCurNode()
          if (!activateFile || !activateFile.id) return;

          if (activateFile.type == 'node') {
            Editor.Scene.callSceneScript('finder', 'find-node-reference', activateFile.id, null);
          } else if (activateFile.type == 'asset') {
            // findAssetReference(activateFile.id);
          }
        },

        onClick(event, uuid) {
          event.stopPropagation();
          // Editor.log(uuid);
          Editor.Selection.select('node', uuid)
        },

      }
    })
  },

  // register your ipc messages here
  messages: {
    'setPathInfo'(event, data) {
      this.plugin.pathInfo = data;
    },

    'setReferenceInfo'(event, data) {
      this.plugin.showReference = true;

      data.map((item) => {
        let items = item.split('##');
        let nodeInfo = {
          info: items[0],
          uuid: items[1]
        }
        this.plugin.referenceInfos.push(nodeInfo);
      })
    }
  }
});