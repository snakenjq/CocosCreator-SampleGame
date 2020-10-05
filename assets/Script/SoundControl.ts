const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundControl extends cc.Component {
  @property(cc.AudioSource)
  buttonSound: cc.AudioSource = null;

  @property(cc.AudioSource)
  explosionSound: cc.AudioSource = null;

  @property(cc.AudioSource)
  dropSound: cc.AudioSource = null;

  @property(cc.AudioSource)
  bgMusic: cc.AudioSource = null;

  musicOn = false;
  soundOn = false;

  start() {
    this.musicOn = true;
    this.soundOn = true;
  }

  //所有声音关闭
  setMusicOnOff() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) {
      this.allMusicStart();
    } else {
      this.allMusicPause();
    }
  }

  setSoundOnOff() {
    this.soundOn = !this.soundOn;
  }

  allMusicStart() {
    this.bgMusic.play();
  }

  allMusicPause() {
    this.bgMusic.pause();
  }

  allSoundPause() {
    this.buttonSound.pause();
    this.explosionSound.pause();
    this.dropSound.pause();
  }

  playButton() {
    if (this.soundOn) this.buttonSound.play();
  }

  playExplosion() {
    if (this.soundOn) this.explosionSound.play();
  }

  playDrop() {
    if (this.soundOn) this.dropSound.play();
  }
}
