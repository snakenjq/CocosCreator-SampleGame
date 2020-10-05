import { getRandomInt, getBoardCol, getBoardRow } from './Global';

const ICON_STATE_NORMAL = Symbol('ICON_STATE_NORMAL');
const ICON_STATE_MOVE = Symbol('ICON_STATE_MOVE');
const ICON_STATE_PRECANCEL = Symbol('ICON_STATE_PRECANCEL');
const ICON_STATE_PRECANCEL2 = Symbol('ICON_STATE_PRECANCEL2');
const ICON_STATE_CANCEL = Symbol('ICON_STATE_CANCEL');
const ICON_STATE_CANCELED = Symbol('ICON_STATE_CANCELED');

const DIRECTION_LEFT = Symbol('DIRECTION_LEFT');
const DIRECTION_UP = Symbol('DIRECTION_UP');
const DIRECTION_RIGHT = Symbol('DIRECTION_RIGHT');
const DIRECTION_DOWN = Symbol('DIRECTION_DOWN');

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameControl extends cc.Component {
  row: number = getBoardRow();
  col: number = getBoardCol();

  typeNum: number = 6; //方块类型数量
  isControl: boolean = false; //是否控制着小方块
  chooseIconPos = cc.v2(-1, -1); //控制的小方块的列表位置
  deltaPos = cc.v2(0, 0); //相差坐标
  score = 0;
  cancelNum = 0;
  moveNum = 0;

  iconsDataTable = [];
  iconsTable = [];
  iconsAnimTable = [];
  iconsPosTable = [];

  @property(cc.Prefab)
  iconPrefab: cc.Prefab = null;

  @property(cc.Node)
  board: cc.Node = null;

  @property(cc.Label)
  scoreLabel: cc.Label = null;

  @property(cc.Node)
  soundNode: cc.Node = null;

  onLoad() {
    this.initBoardData();
    this.initGameBoard();
    this.board.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    this.board.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.board.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onTouchBegan(event: cc.Event.EventTouch) {
    let touches = event.getTouches();
    let touchLoc = touches[0].getLocation();
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.iconsTable[i][j].getBoundingBoxToWorld().contains(touchLoc)) {
          this.isControl = true;
          this.chooseIconPos.x = i;
          this.chooseIconPos.y = j;
          this.deltaPos.x = this.iconsTable[i][j].getPosition().x - touchLoc.x;
          this.deltaPos.y = this.iconsTable[i][j].getPosition().y - touchLoc.y;
          this.iconsTable[i][j].zIndex = 1;
          break;
        }
      }
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (this.isControl) {
      let touches = event.getTouches();
      let touchLoc = touches[0].getLocation();
      let startTouchLoc = touches[0].getStartLocation();
      let deltaX = touchLoc.x - startTouchLoc.x;
      let deltaY = touchLoc.y - startTouchLoc.y;
      let deltaX2 = deltaX * deltaX;
      let deltaY2 = deltaY * deltaY;
      let deltaDistance = deltaX2 + deltaY2;
      let direction = DIRECTION_LEFT;
      //获得点击方向
      if (deltaX2 > deltaY2) {
        if (deltaX < 0) {
          direction = DIRECTION_LEFT;
        } else {
          direction = DIRECTION_RIGHT;
        }
      } else {
        if (deltaY > 0) {
          direction = DIRECTION_UP;
        } else {
          direction = DIRECTION_DOWN;
        }
      }
      //判断拖动区域是否出界
      if (this.chooseIconPos.x === 0 && direction === DIRECTION_LEFT) {
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
          this.iconsPosTable[this.chooseIconPos.x][this.chooseIconPos.y],
        );
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].zIndex = 0;
        this.isControl = false;
        return;
      } else if (
        this.chooseIconPos.x === this.row - 1 &&
        direction === DIRECTION_RIGHT
      ) {
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
          this.iconsPosTable[this.chooseIconPos.x][this.chooseIconPos.y],
        );
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].zIndex = 0;
        this.isControl = false;
        return;
      } else if (
        this.chooseIconPos.y === this.col - 1 &&
        direction === DIRECTION_UP
      ) {
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
          this.iconsPosTable[this.chooseIconPos.x][this.chooseIconPos.y],
        );
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].zIndex = 0;
        this.isControl = false;
        return;
      } else if (this.chooseIconPos.y === 0 && direction === DIRECTION_DOWN) {
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
          this.iconsPosTable[this.chooseIconPos.x][this.chooseIconPos.y],
        );
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].zIndex = 0;
        this.isControl = false;
        return;
      }

      if (deltaDistance > 6400) {
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
          this.iconsPosTable[this.chooseIconPos.x][this.chooseIconPos.y],
        );
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].zIndex = 0;
        this.isControl = false;
        this.handelMessage('exchange', {
          pos: touchLoc,
          direction: direction,
        });
      } else {
        this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
          cc.v2(touchLoc.x + this.deltaPos.x, touchLoc.y + this.deltaPos.y),
        );
      }
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (this.isControl) {
      let touches = event.getTouches();
      let touchLoc = touches[0].getLocation();
      let startTouchLoc = touches[0].getStartLocation();
      let deltaX = touchLoc.x - startTouchLoc.x;
      let deltaY = touchLoc.y - startTouchLoc.y;
      let deltaX2 = deltaX * deltaX;
      let deltaY2 = deltaY * deltaY;
      let direction = DIRECTION_LEFT;
      if (deltaX2 > deltaY2) {
        if (deltaX < 0) {
          direction = DIRECTION_LEFT;
        } else {
          direction = DIRECTION_RIGHT;
        }
      } else {
        if (deltaY > 0) {
          direction = DIRECTION_UP;
        } else {
          direction = DIRECTION_DOWN;
        }
      }
      this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].setPosition(
        this.iconsPosTable[this.chooseIconPos.x][this.chooseIconPos.y],
      );
      this.iconsTable[this.chooseIconPos.x][this.chooseIconPos.y].zIndex = 0;
      this.isControl = false;
      this.handelMessage('exchange', {
        pos: touchLoc,
        anchor: direction,
      });
    }
  }

  handelMessage(message: string, data?: any) {
    switch (message) {
      case 'exchange':
        //交换
        if (this.exchangeIcon(data.direction)) {
          this.handelMessage('cancel');
        } else {
          this.exchangeBack(data.direction);
        }
        break;
      case 'check':
        //检测
        let isCancelV = false;
        let isCancelH = false;
        for (let i = 0; i < this.row; i++) {
          if (this.checkCancelV(i)) isCancelV = true;
        }
        if (isCancelV) this.setCancelEnsure();
        for (let j = 0; j < this.col; j++) {
          if (this.checkCancelH(j)) isCancelH = true;
        }
        if (isCancelH) this.setCancelEnsure();
        if (isCancelV || isCancelH) this.handelMessage('cancel');
        break;
      case 'cancel':
        //消除
        this.cancelNum = 0;
        this.board.getParent().getComponent('MainGameScene').refreshSchedule();
        for (let i = 0; i < this.row; i++) {
          for (let j = 0; j < this.col; j++) {
            if (this.iconsDataTable[i][j].state === ICON_STATE_PRECANCEL2) {
              this.soundNode.getComponent('SoundControl').playExplosion();
              this.score = this.score + 1;
              this.cancelNum = this.cancelNum + 1;
              this.setIconState(i, j, ICON_STATE_CANCEL);
            }
          }
        }
        break;
      case 'produce':
        this.refreshScoreLabel();
        this.moveNum = 0;
        for (let i = 0; i < this.row; i++) {
          for (let j = 0; j < this.col; j++) {
            if (this.iconsDataTable[i][j].state === ICON_STATE_CANCELED) {
              this.moveNum = this.moveNum + 1;
              this.setIconState(i, j, ICON_STATE_MOVE);
              this.iconsDataTable[i][j].moveNum = 0;
              let isFind = false;
              if (j !== this.col) {
                for (let k = j + 1; k < this.col; k++) {
                  this.iconsDataTable[i][j].moveNum =
                    this.iconsDataTable[i][j].moveNum + 1;
                  if (this.iconsDataTable[i][k].state !== ICON_STATE_CANCELED) {
                    this.iconsDataTable[i][k].state = ICON_STATE_CANCELED;
                    isFind = true;
                    this.iconsDataTable[i][j].iconType = this.iconsDataTable[i][
                      k
                    ].iconType;
                    break;
                  }
                }
              }
              if (!isFind) {
                this.iconsDataTable[i][j].iconType = this.getNewIconType(i, j);
              }
            }
          }
        }
        this.handelMessage('move');
        break;
      case 'move':
        for (let i = 0; i < this.row; i++) {
          for (let j = 0; j < this.col; j++) {
            if (this.iconsDataTable[i][j].state === ICON_STATE_MOVE) {
              this.soundNode.getComponent('SoundControl').playDrop();
              this.setIconNormalAnimObj(this.iconsDataTable[i][j]);
              let pos = this.iconsTable[i][j].getPosition();
              let num = this.iconsDataTable[i][j].moveNum;
              this.iconsTable[i][j].setPosition(
                this.iconsTable[i][j + num].getPosition(),
              );
              cc.tween(this.iconsTable[i][j])
                .to(0.1, { position: pos })
                .call(() => {
                  this.moveNum--;
                  if (this.moveNum <= 0) {
                    this.handelMessage('check');
                  }
                })
                .start();
            }
          }
        }
        break;
      default:
        break;
    }
  }

  refreshData() {
    this.isControl = false;
    this.chooseIconPos = cc.v2(-1, -1);
    this.deltaPos = cc.v2(0, 0);
    this.score = 0;
    this.cancelNum = 0;
    this.moveNum = 0;
    this.iconsDataTable = [];
    this.iconsTable = [];
    this.iconsAnimTable = [];
    this.iconsPosTable = [];
    this.board.removeAllChildren();
    this.refreshScoreLabel();
  }
  //初始化棋盘的数据
  initBoardData() {
    for (let i = 0; i < this.row; i++) {
      this.iconsDataTable[i] = [];
      for (let j = 0; j < this.col; j++) {
        this.iconsDataTable[i][j] = {
          state: ICON_STATE_NORMAL,
          iconType: 1,
          obj: null,
        };
        this.iconsDataTable[i][j].iconType = this.getNewIconType(i, j);
      }
    }
  }

  //生成棋子的类型，棋子类型不与左和上相同
  getNewIconType(i: number, j: number) {
    let exTypeTable = [-1, -1];
    if (i > 0) {
      exTypeTable[0] = this.iconsDataTable[i - 1][j].iconType;
    }
    if (j > 0) {
      exTypeTable[1] = this.iconsDataTable[i][j - 1].iconType;
    }
    let typeTable = [];
    let max = 0;
    for (let i = 1; i <= this.typeNum; i++) {
      if (i !== exTypeTable[0] && i !== exTypeTable[1]) {
        max++;
        typeTable[max] = i;
      }
    }
    return typeTable[getRandomInt(1, max + 1)];
  }

  //初始化棋盘
  initGameBoard() {
    for (let i = 0; i < this.row; i++) {
      this.iconsTable[i] = [];
      this.iconsPosTable[i] = [];
      this.iconsAnimTable[i] = [];
      for (let j = 0; j < this.col; j++) {
        let item = cc.instantiate(this.iconPrefab);
        this.iconsTable[i][j] = item;
        this.iconsAnimTable[i][j] = item.getComponent(cc.Animation);
        this.board.addChild(item);
        let x = -283 + 81 * i;
        let y = -366 + 81 * j;
        this.iconsPosTable[i][j] = cc.v2(x, y);
        item.setPosition(x, y);
      }
    }
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        this.iconsDataTable[i][j].obj = this.iconsAnimTable[i][j];
        this.setIconNormalAnim(i, j);
      }
    }
  }

  refreshScoreLabel() {
    if (!this.scoreLabel) return;
    this.scoreLabel.string = '' + this.score;
  }

  exchangeIcon(direction: Symbol) {
    let oneIcon = this.iconsDataTable[this.chooseIconPos.x][
      this.chooseIconPos.y
    ];
    let anotherIcon: any;
    if (direction === DIRECTION_LEFT) {
      anotherIcon = this.iconsDataTable[this.chooseIconPos.x - 1][
        this.chooseIconPos.y
      ];
    } else if (direction === DIRECTION_UP) {
      anotherIcon = this.iconsDataTable[this.chooseIconPos.x][
        this.chooseIconPos.y + 1
      ];
    } else if (direction === DIRECTION_RIGHT) {
      anotherIcon = this.iconsDataTable[this.chooseIconPos.x + 1][
        this.chooseIconPos.y
      ];
    } else if (direction === DIRECTION_DOWN) {
      anotherIcon = this.iconsDataTable[this.chooseIconPos.x][
        this.chooseIconPos.y - 1
      ];
    }
    if (!anotherIcon) return;
    let typeVal = oneIcon.iconType;
    oneIcon.iconType = anotherIcon.iconType;
    anotherIcon.iconType = typeVal;
    this.setIconNormalAnimObj(oneIcon);
    this.setIconNormalAnimObj(anotherIcon);
    let isCancel = [false, false, false];
    //根据不同的方向交换物块
    switch (direction) {
      case DIRECTION_LEFT:
        isCancel[0] = this.checkCancelH(this.chooseIconPos.y);
        this.setCancelEnsure();
        isCancel[1] = this.checkCancelV(this.chooseIconPos.x);
        this.setCancelEnsure();
        isCancel[2] = this.checkCancelV(this.chooseIconPos.x - 1);
        break;
      case DIRECTION_UP:
        isCancel[0] = this.checkCancelH(this.chooseIconPos.y);
        this.setCancelEnsure();
        isCancel[1] = this.checkCancelH(this.chooseIconPos.y + 1);
        this.setCancelEnsure();
        isCancel[2] = this.checkCancelV(this.chooseIconPos.x);
        break;
      case DIRECTION_RIGHT:
        isCancel[0] = this.checkCancelH(this.chooseIconPos.y);
        this.setCancelEnsure();
        isCancel[1] = this.checkCancelV(this.chooseIconPos.x);
        this.setCancelEnsure();
        isCancel[2] = this.checkCancelV(this.chooseIconPos.x + 1);
        break;
      case DIRECTION_DOWN:
        isCancel[0] = this.checkCancelH(this.chooseIconPos.y);
        this.setCancelEnsure();
        isCancel[1] = this.checkCancelH(this.chooseIconPos.y - 1);
        this.setCancelEnsure();
        isCancel[2] = this.checkCancelV(this.chooseIconPos.x);
        break;
      default:
        break;
    }
    this.setCancelEnsure();
    return isCancel[0] || isCancel[1] || isCancel[2];
  }

  exchangeBack(direction: Symbol) {
    let oneIconData = this.iconsDataTable[this.chooseIconPos.x][
      this.chooseIconPos.y
    ];
    let oneIconItem = this.iconsTable[this.chooseIconPos.x][
      this.chooseIconPos.y
    ];
    let anotherIconData = null;
    let anotherIconItem = null;
    if (direction === DIRECTION_LEFT) {
      anotherIconData = this.iconsDataTable[this.chooseIconPos.x - 1][
        this.chooseIconPos.y
      ];
      anotherIconItem = this.iconsTable[this.chooseIconPos.x - 1][
        this.chooseIconPos.y
      ];
    } else if (direction === DIRECTION_UP) {
      anotherIconData = this.iconsDataTable[this.chooseIconPos.x][
        this.chooseIconPos.y + 1
      ];
      anotherIconItem = this.iconsTable[this.chooseIconPos.x][
        this.chooseIconPos.y + 1
      ];
    } else if (direction === DIRECTION_RIGHT) {
      anotherIconData = this.iconsDataTable[this.chooseIconPos.x + 1][
        this.chooseIconPos.y
      ];
      anotherIconItem = this.iconsTable[this.chooseIconPos.x + 1][
        this.chooseIconPos.y
      ];
    } else if (direction === DIRECTION_DOWN) {
      anotherIconData = this.iconsDataTable[this.chooseIconPos.x][
        this.chooseIconPos.y - 1
      ];
      anotherIconItem = this.iconsTable[this.chooseIconPos.x][
        this.chooseIconPos.y - 1
      ];
    }
    if (!anotherIconItem) return;
    let pos1 = oneIconItem.getPosition();
    let pos2 = anotherIconItem.getPosition();
    anotherIconItem.zIndex = 1;
    cc.log('anotherIconItem', oneIconItem.zIndex);
    cc.log('anotherIconItem', anotherIconItem.zIndex);
    cc.tween(oneIconItem)
      .to(0.3, { position: pos2 })
      .call(() => {
        let typeVal = oneIconData.iconType;
        oneIconData.iconType = anotherIconData.iconType;
        anotherIconData.iconType = typeVal;
        this.setIconNormalAnimObj(oneIconData);
        this.setIconNormalAnimObj(anotherIconData);
        oneIconItem.setPosition(pos1);
        anotherIconItem.setPosition(pos2);
        anotherIconItem.zIndex = 0;
      })
      .start();
    cc.tween(anotherIconItem).to(0.2, { position: pos1 }).start();
  }

  setIconAnimObj(obj: cc.Animation, name: string) {
    obj.play(name);
  }

  setIconNormalAnim(i: number, j: number) {
    this.setIconAnimObj(
      this.iconsAnimTable[i][j],
      'normal0' + this.iconsDataTable[i][j].iconType,
    );
  }

  setIconCancelAnimObj(data: any) {
    this.setIconAnimObj(data.obj, 'cancel0' + data.iconType);
  }

  setIconNormalAnimObj(data: any) {
    this.setIconAnimObj(data.obj, 'normal0' + data.iconType);
  }

  setIconState(i: number, j: number, state: Symbol) {
    if (this.iconsDataTable[i][j].state !== state) {
      if (
        this.iconsDataTable[i][j].state === ICON_STATE_PRECANCEL2 &&
        (state === ICON_STATE_NORMAL || state === ICON_STATE_PRECANCEL)
      ) {
        return;
      }
      this.iconsDataTable[i][j].state = state;
      let callBack = function () {
        this.iconsDataTable[i][j].obj.targetOff(this);
        this.setIconState(i, j, ICON_STATE_CANCELED);

        this.cancelNum = this.cancelNum - 1;
        // cc.log('this.cancelNum->' + this.cancelNum);
        if (this.cancelNum === 0) {
          this.handelMessage('produce');
        }
      };
      if (state === ICON_STATE_CANCEL) {
        this.iconsDataTable[i][j].obj.on('finished', callBack, this);
        this.setIconCancelAnimObj(this.iconsDataTable[i][j]);
      }
    }
  }

  setCancelEnsure() {
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        if (this.iconsDataTable[i][j].state === ICON_STATE_PRECANCEL) {
          this.setIconState(i, j, ICON_STATE_PRECANCEL2);
        }
      }
    }
  }

  checkCancelH(col: number) {
    let cancelNum = 1;
    let iconType = this.iconsDataTable[0][col].iconType;
    let isCancel = false;
    this.setIconState(0, col, ICON_STATE_PRECANCEL);
    for (let i = 1; i < this.row; i++) {
      if (iconType === this.iconsDataTable[i][col].iconType) {
        cancelNum = cancelNum + 1;
        this.setIconState(i, col, ICON_STATE_PRECANCEL);
        if (cancelNum >= 3) {
          isCancel = true;
          if (cancelNum === 3) {
            this.score = this.score + 3;
          } else if (cancelNum === 4) {
            this.score = this.score + 6;
          } else if (cancelNum >= 5) {
            this.score = this.score + 10;
          }
        }
      } else {
        if (cancelNum < 3) {
          for (let k = i - 1; k >= 0; k--) {
            if (iconType === this.iconsDataTable[k][col].iconType) {
              this.setIconState(k, col, ICON_STATE_NORMAL);
            } else {
              break;
            }
          }
        }
        if (i < this.row - 2) {
          cancelNum = 1;
          iconType = this.iconsDataTable[i][col].iconType;
          this.setIconState(i, col, ICON_STATE_PRECANCEL);
        } else {
          break;
        }
      }
    }
    return isCancel;
  }

  checkCancelV(row: number) {
    let cancelNum = 1;
    let iconType = this.iconsDataTable[row][0].iconType;
    let isCancel = false;
    this.setIconState(row, 0, ICON_STATE_PRECANCEL);
    for (let i = 1; i < this.col; i++) {
      if (iconType === this.iconsDataTable[row][i].iconType) {
        cancelNum = cancelNum + 1;
        this.setIconState(row, i, ICON_STATE_PRECANCEL);
        if (cancelNum >= 3) {
          isCancel = true;
        }
        if (cancelNum === 3) {
          this.score = this.score + 3;
        } else if (cancelNum === 4) {
          this.score = this.score + 6;
        } else if (cancelNum >= 5) {
          this.score = this.score + 10;
        }
      } else {
        if (cancelNum < 3) {
          for (let k = i - 1; k >= 0; k--) {
            if (iconType === this.iconsDataTable[row][k].iconType) {
              this.setIconState(row, k, ICON_STATE_NORMAL);
            } else {
              break;
            }
          }
        }
        if (i < this.col - 2) {
          cancelNum = 1;
          iconType = this.iconsDataTable[row][i].iconType;
          this.setIconState(row, i, ICON_STATE_PRECANCEL);
        } else {
          break;
        }
      }
    }
    return isCancel;
  }
}
