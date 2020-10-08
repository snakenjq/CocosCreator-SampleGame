'use strict';

function findReference() {
  const activateFile = Editor.Selection.curGlobalActivate();
  Editor.log('select', activateFile);
  if (!activateFile || !activateFile.id) {
    
    return;
  }

  // if (activateFile.type == 'asset') {
  //   findAssetReference(activateFile.id);
  // } else if (activateFile.type == 'node') {
  //   Editor.Scene.callSceneScript('assetutility', 'find-node-reference', activateFile.id, null);
  // }
}

module.exports = {
  // register your ipc messages here
  messages: {
    'open'() {
      // open entry panel registered in package.json
      Editor.Panel.open('reference-finder');
    },
    'say-hello'() {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('reference-finder', 'reference-finder:hello');
    },
    'clicked'() {
      Editor.log('Button clicked!');
    },
    'search'() {
      Editor.Panel.open('reference-finder');
      findReference()
    }
  },
};