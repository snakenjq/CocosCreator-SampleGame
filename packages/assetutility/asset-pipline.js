const fs = require('fire-fs');
const path = require('fire-path');

class AssetPipline {

  get current() {
    return this.queue.length ? this.queue[this.queue.length - 1] : [];
  }

  constructor() {
    this.allfiles = {};
    this.queue = [];
    this.selected = null;
  }

  static start(onReady) {
    const pip = new AssetPipline();
    pip.queryFiles(onReady);
  }

  queryFiles(onReady) {
    Editor.assetdb.queryAssets('db://assets/**/*', null, (err, results) => {
      results.forEach(r => {
        // Editor.log(Editor.assetdb.uuidToUrl(r.uuid), r.type);
        if (!this.allfiles.hasOwnProperty(r.type)) {
          this.allfiles[r.type] = [r];
        }
        else {
          this.allfiles[r.type].push(r);
        }
      });
      if (onReady) {
        // Editor.log('allfiles:', this.allfiles);
        onReady(this);
      }
    })
  }

  gather(...types) {
    const files = [];
    types.forEach(t => {
      if (this.allfiles.hasOwnProperty(t)) {
        files.push(...this.allfiles[t]);
      }
    })

    this.queue.push(files);
    return this;
  }

  gatherExclude(...types){
    const files = [];
    Object.keys(this.allfiles).forEach(k=>{
      if (!types.includes(k)){
        files.push(...this.allfiles[k]);
      }
    })

    this.queue.push(files);
    return this;
  }

  findUnused(ignoreDirs = []) {
    if (this.queue.length < 2) {
      Editor.error('group not enough');
      return this;
    }
    const src = this.queue[this.queue.length - 2];
    const tar = this.queue[this.queue.length - 1].slice();
    ignoreDirs = ignoreDirs.concat('internal');

    src.forEach(s => {
      if (s.type == 'sprite-atlas') return;
      try {
        const f = this._readFileCfg(s);
        for (let i = tar.length - 1; i >= 0; i--) {
          const t = tar[i];
          if (s.type == 'dragonbones-atlas'){
            if (f.includes(cc.path.basename(t.url))){
              tar.splice(i, 1);
            }
          }
          else{
            const uuids = [t.uuid];
            if (this._is(t.uuid, 'texture')){
              const subuuid = this.getTextureSubuuid(t);
              if (subuuid){
                uuids.push(subuuid);
              }
  
              if (this.allfiles.hasOwnProperty('sprite-atlas')){
                const atlasUrl = `${path.dirname(t.url)}/${path.basenameNoExt(t.url)}.plist`;
                this.allfiles['sprite-atlas'].forEach(a=>{
                  if (a.url == atlasUrl){
                    uuids.push(a.uuid);
                  }
                })
              }
            }
            const ignore = ignoreDirs.some(path => Editor.assetdb.uuidToUrl(t.uuid).startsWith(`db://${path}`));
            if (ignore || uuids.some(id=> f.includes(id))) {
              tar.splice(i, 1);
            }
          }
        }
      } catch (error) {
      }
    })

    this.queue.push(tar);
    return this;
  }

  select(fileUuid){
    const f = Editor.assetdb.assetInfoByUuid(fileUuid);
    // Editor.log('select', f);
    this.selected = Object.assign({}, f);
    this.selected.rawuuid = fileUuid;
    if (this._isScript(this.selected.type)){
      this.selected.uuid = Editor.Utils.UuidUtils.compressUuid(fileUuid);
      this.selected.isScript = true;
    }
    if (this.selected.type == 'texture'){
      const subuuid = this.getTextureSubuuid(this.selected);
      if (subuuid){
        this.selected.subuuid = subuuid;
      }
    }
    return this;
  }

  getTextureSubuuid(file){
    const metaPath = Editor.assetdb.uuidToFspath(file.uuid);
    const metaUrl = `${metaPath}.meta`;
    const metaInfo = this._readFile(metaUrl);
    if (metaInfo){
      const meta = JSON.parse(metaInfo);
      const subMeta = meta.subMetas[path.basenameNoExt(metaPath)];
      return subMeta && subMeta.uuid;
    }
    return undefined;
  }

  findDependencies(){
    const files = [];
    if (this.selected){
      this.current.forEach(r=>{
        if (r.uuid != this.selected.uuid){
          const f = this._readFileCfg(r);
          if (r.type == 'dragonbones-atlas'){
            if (f.includes(cc.path.basename(this.selected.url))){
              files.push(r);
            }
          }
          else if (f.includes(this.selected.uuid) ||
            (this.selected.parentUuid && f.includes(this.selected.parentUuid)) ||
            (this.selected.subuuid && f.includes(this.selected.subuuid))
          ){
            files.push(r);
          }
        }
      })
    }
    else{
      Editor.warn('no select file');
    }
    this.queue.push(files);
    return this;
  }

  toUrls() {
    const urls = this.current.map(r => {
      if (r.type == 'sprite-frame' && this._is(r.parentUuid, 'texture')){
        return path.dirname(Editor.assetdb.uuidToUrl(r.uuid));
      }
      return Editor.assetdb.uuidToUrl(r.uuid);
    });
    this.queue.push(urls);
    return this;
  }

  toDirname() {
    const dirs = this.current.map(r => path.dirname(r));
    this.queue.push(dirs);
    return this;
  }

  sort(){
    this.current.sort((a,b)=> a.toLowerCase().localeCompare(b.toLowerCase()));
    return this;
  }

  call(cb){
    cb();
    return this;
  }

  delFiles() {
    if (0 == Editor.Dialog.messageBox({
      buttons: [Editor.T("MESSAGE.delete"), Editor.T("MESSAGE.cancel")],
      title: Editor.T("MESSAGE.assets.delete_title"),
      message: '是否删除查找到的无用资源？',
      defaultId: 0,
      cancelId: 1,
    })) {

      const urls = this.current.filter(u=> !u.includes('.plist'));
      // Editor.log('delete:', urls);
      function deleteFiles(){
        Editor.assetdb.delete(urls, function(err, results){
          Editor.log('已删除，刷新目录中...');
          refreshDirs();
        })
      }

      function refreshDirs(){
        const dirs = [];
        urls.forEach(url => {
          let dirname = path.dirname(url);
          if (!dirs.includes(dirname)){
            dirs.push(dirname);
          }
        })

        dirs.sort((a,b)=> a.length - b.length);

        for(let i = dirs.length-1; i >= 1; i--){
          for(let j = i-1; j >= 0; j--){
            if (dirs[i].startsWith(dirs[j])){
              dirs.splice(i,1);
              break;
            }
          }
        }

        for(let i = 0; i < dirs.length; i++){
          Editor.log(`刷新 ${dirs[i]} ...`);
          Editor.assetdb.refresh(dirs[i], function(err1,results1){
            if (i == dirs.length-1){
              Editor.log('刷新完毕');
            }
          });
        }
      }

      deleteFiles();
    }
  }

  output() {
    this.current.forEach(r => {
      Editor.log(`.  ${r.substr(5)}`);
    })
    Editor.log(`✦ Count：${this.current.length}`);
    return this;
  }

  _readFileCfg(file){
    let url = Editor.assetdb.uuidToFspath(file.uuid);
    // Editor.log('>', url, file.type);
    if (file.type == 'label-atlas' || file.type == 'bitmap-font' || file.type == 'sprite-atlas') url += '.meta';

    return this._readFile(url);
  }

  _readFile(url){
    return fs.existsSync(url) ? fs.readFileSync(url, 'utf8'): '';
  }

  _is(uuid, type){
    return this.allfiles.hasOwnProperty(type) && this.allfiles[type].some(sp=> sp.uuid == uuid);
  }

  _isScript(t){
    return "javascript" === t || "coffeescript" === t || "typescript" === t;
  }
}

module.exports = AssetPipline;