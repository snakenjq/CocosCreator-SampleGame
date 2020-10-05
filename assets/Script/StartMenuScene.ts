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
  }

  onDestroy() {
    this.node.stopAllActions();
  }

  onPlay() {
    this.node.getComponent('SceneSwitch').fadeOut('main-game-scene', 0.5);
  }

  logoAnim() {
    cc.tween(this.logo).to(0.5, { scale: 1, angle: 720 }).start();
  }

  onExitGame() {
    cc.game.end();
  }
}
