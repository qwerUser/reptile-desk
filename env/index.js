/*
 * @Description: 
 * @Date: 2025-04-27 17:36:36
 * @LastEditTime: 2025-04-28 08:43:44
 */

const devEnv = require('./env.development.js');
const prodEnv = require('./env.production.js');
module.exports = process.env.NODE_ENV === 'development' ? devEnv : prodEnv