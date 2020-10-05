const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Node)
  gameMainNode: cc.Node = null;

  @property(cc.Node)
  soundNode: cc.Node = null;

  @property(cc.Button)
  continueButton: cc.Button = null;

  onLoad() {
    this.node.scale = 0;
  }

  showBoard() {
    this.gameMainNode.getComponent('MainGameScene').pauseSchedule();
    if (this.node.scale === 1) {
      cc.tween(this.node).to(0.1, { scale: 0 }).start();
    } else {
      cc.tween(this.node).to(0.1, { scale: 1 }).start();
    }
  }

  onContinue() {
    this.showBoard();
    this.gameMainNode.getComponent('MainGameScene').restartGame();
  }

  onBack() {
    this.gameMainNode.getComponent('MainGameScene').backToStartScene();
  }
}
