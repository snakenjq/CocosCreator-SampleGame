const BOARD_ROW = 8;
const BOARD_COL = 10;
const GAME_COUNT_DOWN = 15;

export let ACCESS_TOKEN = '';
export let REFRESH_TOKEN = '';

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

const setAccessToken = (value: string) => {
  ACCESS_TOKEN = value;
};

const setRefreshToken = (value: string) => {
  REFRESH_TOKEN = value;
};

export {
  getBoardCol,
  getBoardRow,
  getRandomInt,
  getGameCountDown,
  setAccessToken,
  setRefreshToken,
};

/**
 * 简单封装了XMLHTTPREQUEST 只包含 GET 和 POST 方法
 * @param option
 */
export const request = (option: any) => {
  if (String(option) !== '[object Object]') return undefined;
  option.method = option.method ? option.method.toUpperCase() : 'GET';
  option.data = option.data || {};
  option.data = JSON.stringify(option.data);

  let xhr = new XMLHttpRequest();
  xhr.responseType = option.responseType || 'json';
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 400) {
        if (option.success && typeof option.success === 'function') {
          option.success(xhr.response);
        }
      } else {
        if (option.error && typeof option.error === 'function') {
          option.error();
        }
      }
    }
  };
  xhr.open(option.method, option.url, true);
  if (option.method === 'POST') {
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  }
  if (option.authorization && typeof option.authorization === 'string') {
    xhr.setRequestHeader('authorization', option.authorization);
  }
  xhr.send(option.method === 'POST' ? option.data : null);
};
