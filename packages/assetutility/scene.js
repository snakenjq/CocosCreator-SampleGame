
const CONTINUE   = 0;
const HANDLED    = 1;
const HIT_RESULT = 2;

function testNode(instanceId){
  const activateFile = Editor.Selection.curGlobalActivate();
  Editor.log('select', activateFile, Editor.Utils.UuidUtils.compressUuid(activateFile.id));

  const node = cc.engine.getInstanceById(instanceId);
  node && Editor.log('node', instanceId, node._id, node);
}

function findNodeReference(instanceId) {
  const node = cc.engine.getInstanceById(instanceId);
  Editor.info('☁ 层级管理器:', nodePath(node));

  const uuidList = node._components.map(c=> c._id).concat(node._id);
  const indexs = [];

  const results = _findReference(
    (item)=>{
      if (item._id == instanceId){
        return HANDLED;
      }
      return CONTINUE;
    },
    (obj, serObj)=>{
      if (indexs.length == 0){
        indexs.push(...uuidList.map(uuid=> serObj.findIndex(s=> s._id == uuid)));
      }
      if (obj.__id__ && indexs.includes(obj.__id__)){
        return HIT_RESULT;
      }
      return CONTINUE;
    });

  output();

  function output(){
    results.forEach(r=>{
      Editor.log(`.  ${r}`);
    })
    Editor.log(`✦ Count：${results.length}`);
    Editor.log('............................................................');
  }
}

function findAssetReference(file){
  if (!file){
    return;
  }
  Editor.info('☁ 层级管理器:'
    // , file
    );

  const uuidList = file.subuuid ? [file.uuid, file.subuuid]: [file.uuid];

  const results = _findReference(
    (item)=>{
      if (file.isScript){
        if (item.__type__ == file.uuid){
          return HIT_RESULT;
        }
        return HANDLED;
      }
      return CONTINUE;
    },
    (obj)=>{
      if (obj.__uuid__ && uuidList.includes(obj.__uuid__)){
        return HIT_RESULT;
      }
    },
    (prefab)=>{
      if (prefab && prefab.asset.__uuid__ == file.uuid){
        return HIT_RESULT;
      }
    });

  output();

  function output(){
    results.forEach(r=>{
      if (file.isScript){
        Editor.log(`.  ${r}`.replace(file.uuid, file.name));  
      }
      else{
        Editor.log(`.  ${r}`);
      }
    })
    Editor.log(`✦ Count：${results.length}`);
    Editor.log('............................................................');
  }
}

/**
 * @param {*} customItemCheck return value: 0.contiue, 1.handled, 2.hit result
 * @param {*} customObjCheck  return value: 0.contiue, 1.handled, 2.hit result
 */
function _findReference(customItemCheck, customObjCheck, customPrefabCheck=null){
  const results = [];
  const root = getRoot();
  const serObj = JSON.parse(Editor.serialize(root));
  const itemWalked = [];
  const nodePaths = [];
  let propPaths = [];

  serObj.forEach(checkSeriaItem);
  return results;

  function checkSeriaItem(item, idx){
    if (item.__type__ == 'cc.Scene' || item.__type__ == 'cc.PrefabInfo'){
      return;
    }
    if (itemWalked.includes(idx)){
      return;
    }
    itemWalked.push(idx);

    let saveNodePath = false;
    let savePropPath = false;

    const cls = getItemClass(item);
    const isComponent = cc.js.isChildClassOf(cls, cc.Component);
    if (isComponent){
      nodePaths.push(item);
      saveNodePath = true;

      propPaths.push({type:'Component', path:` ➥ [${cls.type}]`});
      savePropPath = true;
    }
    else if (item.__type__ == 'cc.Node') {
      nodePaths.push(item);
      saveNodePath = true;
      if (isRootPrefab(item) && customPrefabCheck && customPrefabCheck(serObj[item._prefab.__id__]) == HIT_RESULT){
        saveResult();
        return;
      }
    }

    const itemCheck = customItemCheck && customItemCheck(item);
    if (itemCheck == HIT_RESULT){
      saveResult();
    }
    else if (!itemCheck){
      Object.keys(item)
        .filter(k=>checkIgnoreKey(k))
        .forEach(k=>{
          const obj = item[k];
          if (Array.isArray(obj)){
            obj.forEach((j,i)=>{
              if (j){
                if (k != '_components') propPaths.push({type:'Property', path:` ➥ ${k}[${i}]`});
                checkSeriaObject(j);
                if (k != '_components') propPaths.pop();
              }
            })
          }
          else{
            propPaths.push({type:'Property', path:` ➥ ${pname(k)}`, obj:obj});
            checkSeriaObject(obj);
            propPaths.pop();
          }
        })

    }
    
    if (savePropPath) propPaths.pop();
    if (saveNodePath) nodePaths.pop();

    function checkIgnoreKey(k){
      let result = true;
      if (isComponent){
        result = k != 'node';
      }
      else if (item.__type__ == 'cc.Node'){
        result = k != '_parent' && k != '_children';
      }

      return result && item[k] && typeof(item[k]) == 'object'
    }

    function pname(k){
      if (k == '_N$file' && item.__type__ == 'cc.Label') return 'font';
      return k.replace('_N$', '');
    }

    function isRootPrefab(n){
      return n._prefab && (!n._parent || !serObj[n._parent.__id__]._prefab);
    }
  }

  function checkSeriaObject(obj){
    const objCheck = customObjCheck && customObjCheck(obj, serObj);
    if (objCheck == HIT_RESULT){
      saveResult();
    }
    else if(!objCheck){
      if (obj.__id__){
        checkSeriaItem(serObj[obj.__id__], obj.__id__);
      }  
    }
  }

  function saveResult(){
    results.push(curNodePath() + curPropPath());
  }

  function getItemClass(item){
    if (!item){
      return null;
    }
    if (Editor.Utils.UuidUtils.isUuid(item.__type__)){
      const cls = cc.js._getClassById(item.__type__);
      cls.type = cls.name;
      return cls;
    }
    const cls = cc.js.getClassByName(item.__type__);
    cls.type = item.__type__;
    return cls;
  }

  function curNodePath(){
    if (nodePaths.length == 0){
      return '';
    }
    const curNode = nodePaths[nodePaths.length-1];
    const arr = [];
    let node;
    
    if (curNode.__type__ == 'cc.Node'){
      node = curNode;
    }
    else if (curNode.node){
      node = serObj[curNode.node.__id__];
    }

    while(node && node.__type__ != 'cc.Scene'){
      arr.push(node._name);
      node = node._parent && serObj[node._parent.__id__];
    }
    return arr.reverse().join('/');
  }

  function curPropPath(){
    const paths = propPaths.slice();
    for(let i = paths.length-1; i >= 0; i--){
      if (paths[i].type == 'Component'){
        paths.splice(0,i);
        break;
      }
    }
    if (!paths.length){
      return '';
    }
    const prop = paths[paths.length-1];
    const cls = (prop.obj && prop.obj.__id__) && getItemClass(serObj[prop.obj.__id__]);
    return paths.map(p=> p.path).join('') + (cls? ` ✻ [${cls.type}]`:'');
  }
}

function nodePath(n){
  const nodes = [];
  let node = n;
  while (node && !(node instanceof cc.Scene)){
    nodes.push(node.name);
    node = node.parent;
  }
  return nodes.reverse().join('/');
}

function getRoot(){
  return cc.director.getScene().children.find(c=> c.name != 'Editor Scene Foreground' && c.name != 'Editor Scene Background');
}


module.exports = {
  'find-node-reference': function (event, param) {
    findNodeReference(param);
  },
  'find-asset-reference': function (event, param) {
    findAssetReference(param);
  },
  'test-node': function(event, param){
    testNode(param);
  }
};