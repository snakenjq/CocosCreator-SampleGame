import { getRandomInt, getGameCountDown } from './Global';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainGameScene extends cc.Component {
  @property(cc.Sprite)
  _background: cc.Sprite = null;

  @property(cc.Label)
  _gameCountDown: cc.Label = null;

  @property(cc.Node)
  gameOverBoard: cc.Node = null;

  _countTimerNum: number = 0;
  @property({
    visible: false,
  })
  get countTimerLabel() {
    return this._countTimerNum;
  }

  set countTimerLabel(value: number) {
    this._countTimerNum = value;
    this._gameCountDown.string = this._countTimerNum + '';
  }

  onLoad() {
    this.node.getComponent('SceneSwitch').fadeIn(0.5);

    this._background = this.node
      .getChildByName('background')
      .getComponent(cc.Sprite);

    this._gameCountDown = cc
      .find('Canvas/background/sp_timer/label_timer')
      .getComponent(cc.Label);
  }

  start() {
    this.getRandomBackground();
    this.refreshSchedule();
  }

  getRandomBackground() {
    let randomInt = getRandomInt(1, 6);
    let bgSpriteFrameName = 'main-game-scene/background_' + randomInt;
    cc.resources.load(
      bgSpriteFrameName,
      cc.SpriteFrame,
      (err: any, spriteFrame: cc.SpriteFrame) => {
        this._background.spriteFrame = spriteFrame;
      },
    );
  }

  startTimeSchedule() {
    this._gameCountDown.schedule(() => {
      if (this.countTimerLabel > 0) {
        this.countTimerLabel--;
      } else {
        this._gameCountDown.unscheduleAllCallbacks();
        this.showGameOverBoard();
      }
    }, 1);
  }

  pauseSchedule() {
    this._gameCountDown.unscheduleAllCallbacks();
  }

  showGameOverBoard() {
    this.gameOverBoard.getComponent('GameOverBoard').showBoard();
  }

  refreshSchedule() {
    this.pauseSchedule();
    this.countTimerLabel = getGameCountDown();
    this.startTimeSchedule();
  }

  restartGame() {
    this.getRandomBackground();
    this.refreshSchedule();
    let gameControl = cc.find('Canvas/board').getComponent('GameControl');
    gameControl.refreshData();
    gameControl.initBoardData();
    gameControl.initGameBoard();
  }

  backToStartScene() {
    this.node.getComponent('SceneSwitch').fadeOut('start-menu-scene', 0.5);
  }
}
