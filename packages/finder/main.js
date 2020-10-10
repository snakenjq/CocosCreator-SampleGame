'use strict';

module.exports = {
  messages: {
    'open'() {
      // open entry panel registered in package.json
      Editor.Panel.open('finder');
    },
    'say-hello'() {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToAll('scene:is-ready', '816bde9d-5a89-4021-8b22-508d60ad3262');
      // Editor.Scene.callSceneScript('finder', 'change-scene');
    },
    'clicked'() {
      Editor.log('Button clicked!');
    }
  },
};