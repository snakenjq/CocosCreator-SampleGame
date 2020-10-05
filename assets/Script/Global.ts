const BOARD_ROW = 8;
const BOARD_COL = 10;
const GAME_COUNT_DOWN = 15;

//修改动态合图散图的限制，默认512
cc.dynamicAtlasManager.maxFrameSize = 720;

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
