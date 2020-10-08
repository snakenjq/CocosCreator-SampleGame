'use strict';
const AssetPipline = require('./asset-pipline.js');

function findUnusedFiles(del){
  Editor.info(`▣ 查找无用图片`);
  const ignoreDirs = Editor.Profile.load('profile://local/assetutility.json').data.paths || [];

  AssetPipline.start(pip=>{ pip
    .gatherExclude('texture', 'sprite-frame', 'folder')
    .gather('texture')
    .findUnused(ignoreDirs)
    .toUrls()
    .sort()
    .output()
    .call(()=>{ if(del) pip.delFiles()});

    Editor.log('............................................................');
  });
}

function findAssetReference(fileuuid){
  const filePath = Editor.assetdb.uuidToUrl(fileuuid);
  Editor.info(`♻ 资源管理器: ${filePath}`);

  AssetPipline.start(pip=>{ pip
    .gatherExclude('texture', 'sprite-frame', 'folder')
    .select(fileuuid)
    .findDependencies()
    .toUrls()
    .sort()
    .output();

    Editor.Scene.callSceneScript('assetutility', 'find-asset-reference', pip.selected, null);
  })
}

function findReference(){
  const activateFile = Editor.Selection.curGlobalActivate();
  if (!activateFile || !activateFile.id){
    Editor.warn('需要选中资源文件或层级节点');
    return;
  }
  
  if (activateFile.type == 'asset'){
    findAssetReference(activateFile.id);
  }
  else if (activateFile.type == 'node'){
    Editor.Scene.callSceneScript('assetutility', 'find-node-reference', activateFile.id, null);
  }
}


module.exports = {
  messages: {
    'find-unused' () {
      try {
        findUnusedFiles(false);
      } catch (error) {
        Editor.log('err:', error);
      }
    },
    'find-unused-and-del' () {
      try {
        findUnusedFiles(true);
      } catch (error) {
        Editor.log('err:', error);
      }
    },
    'set-ignore-path' () {
      Editor.Panel.open('assetutility');
    },
    'find-reference' () {
      try {
        findReference();
      } catch (error) {
        Editor.log('err:', error);
      }
    },
    'test-node' () {
      const activateFile = Editor.Selection.curGlobalActivate();
      Editor.Scene.callSceneScript('assetutility', 'test-node', activateFile.id, null);
    }
  }
};