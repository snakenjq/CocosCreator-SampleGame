import { request, setAccessToken, setRefreshToken } from './Global';

const { ccclass, property } = cc._decorator;

@ccclass
export default class StartMenuScene extends cc.Component {
  @property(cc.Node)
  logo: cc.Node = null;

  @property(cc.Button)
  btnLogin: cc.Button = null;

  @property(cc.Label)
  loginLabel: cc.Label = null;

  userName: string = null;
  password: string = null;

  onLoad() {
    this.loginLabel.string = '';
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

  onUserNameEnter(target: cc.EditBox) {
    this.userName = target.textLabel.string;
    cc.log(this.userName);
  }

  onPasswordEnter(target: cc.EditBox) {
    this.password = target.textLabel.string;
    cc.log(this.password);
  }

  onLogin() {
    request({
      url: 'http://localhost:3000/account/signIn',
      method: 'POST',
      data: {
        userName: this.userName,
        password: this.password,
      },
      success: (res: any) => {
        this.loginResult('登录成功');
        this.node.getChildByName('loginLayer').active = false;
        this.node.getChildByName('startbutton').active = true;
        setAccessToken(JSON.parse(JSON.stringify(res)).accessToken);
        setRefreshToken(JSON.parse(JSON.stringify(res)).refreshToken);
      },
      error: (res: any) => {
        this.loginResult('登录失败', false);
      },
    });
  }

  loginResult(result: string, isSuccess: boolean = true) {
    this.loginLabel.node.opacity = 255;
    this.loginLabel.string = result;
    if (isSuccess) {
      this.loginLabel.node.color = cc.Color.GREEN;
    } else {
      this.loginLabel.node.color = cc.Color.RED;
    }
    cc.tween(this.loginLabel.node).to(1, { opacity: 0 }).start();
  }
}
