/*
 * @Description: 
 * @Date: 2025-04-28 14:35:38
 * @LastEditTime: 2025-04-28 14:53:24
 */
const UPPER_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER_STR = 'abcdefghijklmnopqrstuvwxyz';
module.exports = {
  getStrRandom: (num) => {
    if(!num || num < 1) {
      num = 5;
    }
    const str = UPPER_STR + LOWER_STR;
    const length = str.length;
    let result = '';
    for(let i = 0; i < num; i++) {
      result += str[Math.floor(Math.random() * length)];
    }

    return result;
  },
  getUpperStrRandom: (num) => {
    if(!num || num < 1) {
      num = 5;
    }
    const length = UPPER_STR.length;
    let result = '';
    for(let i = 0; i < num; i++) {
      result += UPPER_STR[Math.floor(Math.random() * length)];
    }

    return result;
  },
  getLowerStrRandom: (num) => {
    if(!num || num < 1) {
      num = 5;
    }
    const length = LOWER_STR.length;
    let result = '';
    for(let i = 0; i < num; i++) {
      result += LOWER_STR[Math.floor(Math.random() * length)];
    }

    return result;
  }
};