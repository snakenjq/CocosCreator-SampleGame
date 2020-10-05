const BOARD_ROW = 8;
const BOARD_COL = 10;
const GAME_COUNT_DOWN = 15;

if (
  cc.sys.platform === cc.sys.IPHONE ||
  cc.sys.platform === cc.sys.IPAD ||
  cc.sys.platform === cc.sys.MACOS ||
  cc.sys.platform === cc.sys.ANDROID ||
  cc.sys.platform === cc.sys.DESKTOP_BROWSER ||
  cc.sys.platform === cc.sys.MOBILE_BROWSER
) {
  cc.macro.CLEANUP_IMAGE_CACHE = false;
  cc.dynamicAtlasManager.enabled = true;
  cc.dynamicAtlasManager.maxFrameSize = 720;
}

const getBoardRow = (): number => {
  return BOARD_ROW;
};

const getBoardCol = (): number => {
  return BOARD_COL;
};

const getGameCountDown = (): number => {
  return GAME_COUNT_DOWN;
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export { getBoardCol, getBoardRow, getRandomInt, getGameCountDown };
