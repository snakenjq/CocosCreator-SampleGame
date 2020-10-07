const { ccclass, property } = cc._decorator;

@ccclass
export default class StartMenuScene extends cc.Component {
  @property(cc.Node)
  logo: cc.Node = null;

  onLoad() {
    this.node.getComponent('SceneSwitch').fadeIn(0.5);
    this.logo.scale = 0.1;
  }

  start() {
    this.logoAnim();
    cc.assetManager.loadBundle('background');
  }

  onDestroy() {
    this.node.stopAllActions();
  }

  onPlay() {
    cc.assetManager.loadBundle(
      'main-game-scene',
      (err: any, bundle: cc.AssetManager.Bundle) => {
        bundle.loadScene('main-game-scene', (err: any, scene: cc.Scene) => {
          this.node.getComponent('SceneSwitch').fadeOutFromBundle(scene, 0.5);
        });
      },
    );
  }

  logoAnim() {
    cc.tween(this.logo).to(0.5, { scale: 1, angle: 720 }).start();
  }
}
