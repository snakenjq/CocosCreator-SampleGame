/**
 * Edited by Nathan.Niu
 * A simple scene switch effect with fadeIn&fadeOut
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneSwitch extends cc.Component {
  @property(cc.Prefab)
  fadeNode: cc.Prefab = null;

  /**
   * 场景渐出
   * @param {string} nextScene 切换场景名
   * @param {number} [interval=0.3] 效果时间，默认0.3
   * @memberof SceneSwitch
   */
  fadeOut(nextScene: string, interval: number = 0.3) {
    if (!this.fadeNode) return;
    let fadeMaskNode = cc.instantiate(this.fadeNode);
    fadeMaskNode.opacity = 0;
    this.node.addChild(fadeMaskNode);
    this.loadScene(fadeMaskNode, interval, nextScene);
  }

  /**
   * 场景渐进
   * @param {number} [interval=0.3] 效果时间，默认0.3
   * @memberof SceneSwitch
   */
  fadeIn(interval: number = 0.3) {
    if (!this.fadeNode) return;
    let fadeMaskNode = cc.instantiate(this.fadeNode);
    fadeMaskNode.opacity = 255;
    this.node.addChild(fadeMaskNode);
    this.fade(fadeMaskNode, interval);
  }

  loadScene(fadeMaskNode: cc.Node, interval: number = 0.3, nextScene?: string) {
    if (nextScene) {
      cc.director.preloadScene(nextScene, () => {
        this.fade(fadeMaskNode, interval, () => {
          cc.director.loadScene(nextScene);
        });
      });
    } else {
      this.fade(fadeMaskNode, interval);
    }
  }

  fade(fadeMaskNode: cc.Node, interval: number = 0.3, callback = () => {}) {
    if (this.isTransparent(fadeMaskNode)) {
      cc.tween(fadeMaskNode)
        .to(interval, { opacity: 255 })
        .call(callback)
        .start();
    } else {
      cc.tween(fadeMaskNode).to(interval, { opacity: 0 }).start();
    }
  }

  isTransparent(fadeMaskNode: cc.Node) {
    return !fadeMaskNode.opacity;
  }
}
