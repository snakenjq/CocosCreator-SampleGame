const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
  @property(cc.Sprite)
  logo: cc.Sprite = null;

  start() {
    if (this.logo) {
      cc.tween(this.logo.node)
        .to(1, { y: 50 }, { easing: 'bounceOut' })
        .call(() => {
          this.node
            .getComponent('SceneSwitch')
            .fadeOut('start-menu-scene', 0.5);
        })
        .start();
    }
  }
}
