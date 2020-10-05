const { ccclass, property } = cc._decorator;

@ccclass
export default class PauseBoard extends cc.Component {
  @property(cc.Node)
  mainGameNode: cc.Node = null;

  @property(cc.Node)
  soundNode: cc.Node = null;

  @property(cc.Button)
  musicButton: cc.Button = null;

  @property(cc.Button)
  soundButton: cc.Button = null;

  @property(cc.Button)
  continueButton: cc.Button = null;

  onLoad() {
    this.node.scale = 0;
  }

  onMusic() {
    this.soundNode.getComponent('SoundControl').playButton();
    if (this.soundNode.getComponent('SoundControl').musicOn) {
      this.soundNode.getComponent('SoundControl').setMusicOnOff();
      cc.tween(this.musicButton.node)
        .to(0.05, { scale: 1.2 })
        .to(0.05, { scale: 1 })
        .call(() => {
          cc.resources.load(
            'main-game-scene/pause_music_off_button',
            cc.SpriteFrame,
            (err: any, spriteFrame: cc.SpriteFrame) => {
              this.musicButton.normalSprite = spriteFrame;
              this.musicButton.pressedSprite = spriteFrame;
              this.musicButton.hoverSprite = spriteFrame;
              this.musicButton.disabledSprite = spriteFrame;
            },
          );
        })
        .start();
    } else {
      this.soundNode.getComponent('SoundControl').setMusicOnOff();
      cc.tween(this.musicButton.node)
        .to(0.05, { scale: 1.2 })
        .to(0.05, { scale: 1 })
        .call(() => {
          cc.resources.load(
            'main-game-scene/pause_music_on_button',
            cc.SpriteFrame,
            (err: any, spriteFrame: cc.SpriteFrame) => {
              this.musicButton.normalSprite = spriteFrame;
              this.musicButton.pressedSprite = spriteFrame;
              this.musicButton.hoverSprite = spriteFrame;
              this.musicButton.disabledSprite = spriteFrame;
            },
          );
        })
        .start();
    }
  }

  onSound() {
    this.soundNode.getComponent('SoundControl').playButton();
    if (this.soundNode.getComponent('SoundControl').soundOn) {
      this.soundNode.getComponent('SoundControl').setSoundOnOff();
      cc.tween(this.soundButton.node)
        .to(0.05, { scale: 1.2 })
        .to(0.05, { scale: 1 })
        .call(() => {
          cc.resources.load(
            'main-game-scene/pause_sound_off_button',
            cc.SpriteFrame,
            (err: any, spriteFrame: cc.SpriteFrame) => {
              this.soundButton.normalSprite = spriteFrame;
              this.soundButton.pressedSprite = spriteFrame;
              this.soundButton.hoverSprite = spriteFrame;
              this.soundButton.disabledSprite = spriteFrame;
            },
          );
        })
        .start();
    } else {
      this.soundNode.getComponent('SoundControl').setSoundOnOff();
      this.soundNode.getComponent('SoundControl').playButton();
      cc.tween(this.soundButton.node)
        .to(0.05, { scale: 1.2 })
        .to(0.05, { scale: 1 })
        .call(() => {
          cc.resources.load(
            'main-game-scene/pause_sound_on_button',
            cc.SpriteFrame,
            (err: any, spriteFrame: cc.SpriteFrame) => {
              this.soundButton.normalSprite = spriteFrame;
              this.soundButton.pressedSprite = spriteFrame;
              this.soundButton.hoverSprite = spriteFrame;
              this.soundButton.disabledSprite = spriteFrame;
            },
          );
        })
        .start();
    }
  }

  onShowBoard() {
    this.soundNode.getComponent('SoundControl').playButton();
    if (this.node.scale === 1) {
      this.mainGameNode.getComponent('MainGameScene').startTimeSchedule();
      cc.tween(this.node).to(0.1, { scale: 0 }).start();
    } else {
      this.node.active = true;
      this.mainGameNode.getComponent('MainGameScene').pauseSchedule();
      cc.tween(this.node).to(0.1, { scale: 1 }).start();
    }
  }

  start() {
    this.soundNode.getComponent('SoundControl').allMusicStart();
  }
}
