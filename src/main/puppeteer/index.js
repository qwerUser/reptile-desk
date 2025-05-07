/*
 * @Description: 
 * @Date: 2025-04-29 08:29:07
 * @LastEditTime: 2025-05-07 17:20:04
 */
// const puppeteerCore = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createWorker } = require('tesseract.js');
const customFun = require('./customFun');
const sharp = require('sharp');

puppeteer.use(stealthPlugin());

const delay = (time) => {
  return new Promise(resolve => {
    let timer = setTimeout(() => {
      resolve(true)
      clearTimeout(timer);
      timer = null;
    }, time)
  })
}
// type === '1' 跳转页面
const gotoPage = async (page, data) => {
  const { pageUrl } = data;
  return new Promise(async resolve => {
    console.log('gotoPage------');
    await page.goto(pageUrl);
    // await page.waitForNavigation();
    await delay(3000);
    resolve(true)
  })
}
// type === '2' 点击
const handleClick = async (page, data) => {
  const { selector } = data;
  return new Promise(async resolve => {
    console.log('handleClick------')
    await page.waitForSelector(selector);
    // await page.type('#rcmloginuser', 'super@seatquick.site');
    // await page.type('#rcmloginpwd', 'd=iU0fbg#d345o0');
    await page.click(selector);
    await delay(500);
    resolve(true)
  })
}
// type === '3' 输入
const typeInputVal = async (page, data) => {
  const { selector, inputVal } = data;
  return new Promise(async resolve => {
    await page.waitForSelector(selector);
    console.log('typeInputVal------')
    await page.waitForSelector(selector);
    await page.type(selector, inputVal);
    await delay(500);
    resolve(true);
  })
}
// type === '4' 接口拦截
const apiIntercept = async (page, data) => {
  const { apiUrl } = data;
  return new Promise(async resolve => {
    resolve(true)
  })
}

const preprocessImage = async (imagePath, outputPath) => {
  await sharp(imagePath)
  .grayscale() // 转换为灰度图像
  .threshold(128) // 二值化处理
  .toFile(outputPath); // 保存处理后的图像
  
  console.log('图像已处理并保存为: ' + outputPath);
  }
// 获取图片验证码
const getImageStr = async (page, data) => {
  console.log('data-----', data);
  const { imgSelector, selector, codeLength = 4, code = '' } = data;
  return new Promise(async resolve => {
    await page.waitForSelector(imgSelector);
    if(!code) {
      const imgSrc = await page.evaluate((imgSelector) => {
        console.log('imgSelector-----', imgSelector)
        const image = document.querySelector(imgSelector);
        const canvas = document.createElement('canvas');
        canvas.width = image.width * window.devicePixelRatio;
        canvas.height = image.height * window.devicePixelRatio;
        canvas.style.width = image.width + 'px';
        canvas.style.height = image.height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 1.0);
        const img = document.createElement('img');
        img.src = imageData;
        document.body.insertBefore(img, document.getElementById('#app'));
        return imageData;
      }, imgSelector);
      console.log('imgSrc----', imgSrc);
      if(imgSrc) {

        // const outputPath = `./a.jpg`;
        // console.log('outputPath',outputPath)
        // await preprocessImage(imgSrc, outputPath);
  
        const worker = await createWorker('eng', 1, {
          logger: (m) => console.log(m),
        });
        const ret = await worker.recognize(imgSrc, 'eng');
        console.log(ret);
        console.log(ret.data.text);
        // const iterator = ret.getIterator();
  
        // iterator.forEachWord((word) => {
        //   const text = word.getText();
        //   const confidence = word.getConfidence();
        //   const bbox = word.getBoundingBox(); // 获取边界框 {x0, y0, x1, y1}
        //   console.log(`文字: ${text}, 置信度: ${confidence}, 位置: ${bbox}`);
        // });
        console.log('codeLength:', codeLength);
        console.log(ret.data.text.replace(/\\n/g, ''))
        console.log(ret.data.text.replace(/\\n/g, '').length)
        // 不进行code输入
        resolve({ imgData: imgSrc, type: 'waitCode' });
        return;
        if(ret.data.text.replace(/\\n/g, '').length !== Number(codeLength)) {
          resolve({ imgData: imgSrc, type: 'waitCode' });
          return;
        } else {
          await typeInputVal(page, {selector, inputVal: ret.data.text})
        }
        
        await worker.terminate();
      }
    } else {
      await typeInputVal(page, {selector, inputVal: code})
    }
    await delay(500);
    resolve(true);
  })
  
}

// 自定义方法
const customFuction = (page, data) => {
  const { funName } = data;
  return new Promise(async resolve => {
    if(customFun[funName]) {
      await customFun[funName]();
      resolve(true)
    } else {
      reject(new Error('funName not fund'));
    }
    
  })
}
const getChromiumExecPath = () => {
  return puppeteer.executablePath();
}

const checkApiUrl = (list = [], url = '') => {
  if(!url) {
    return false;
  }
  for(let i = 0; i < list.length; i++) {
    if(url.indexOf(list[i]) > -1) {
      return list[i];
    }
  }
  return false;
}
const browserCache = {};
module.exports = {
  runTask: async (list = [], randomStr, { stopPage = null, startIndex = 0, code = '' }) => {

    console.log('startIndex----------', startIndex, '-----', randomStr);
    console.log('a---------', browserCache);
    let apiResult = null;
    return new Promise(async (resolve, reject) => {
      try {
        // let browser = stopBrowser;
        browserCache[randomStr] = browserCache[randomStr] || null;
        let page = null;
        console.log('stopPage----', stopPage);
        if(stopPage) {
          page = stopPage;
        } else {
          browserCache[randomStr] = await puppeteer.launch({
            executablePath: getChromiumExecPath(),
            headless: false,
            ignoreHTTPSErrors: true,
            args: [
              '--ignore-certificate-errors'
            ]
          });
          page = await browserCache[randomStr].newPage();
          await page.setViewport({width: 1080, height: 1024});
        }
        
        const apiList = list.filter(item => item.type === '4').map(item => item.apiUrl);
        if(apiList && apiList.length > 0) {
          apiResult = {};
        }
        console.log('page---',page)
        page.on('response', async response => {
          const api = checkApiUrl(apiList, response.url());
          
          if(api) {
            console.log('============================');
            console.log(api);
            console.log('============================');
            const res = await response.text();
            if(!apiResult[api]) {
              apiResult[api] = [];
            }
            apiResult[api].push(res);
          }
          await delay(2000);
        });
        const actionFun = {
          '1': gotoPage,
          '2': handleClick,
          '3': typeInputVal,
          '4': apiIntercept,
          '5': customFuction,
          '6': getImageStr
        }
        for(let i = startIndex; i < list.length; i++) {
          const funData = await actionFun[list[i].type](page, { ...list[i], code });
          // 如果是输入验证码，并且返回了验证码图片，返回到页面手动输入验证码
          if(list[i].type === '6' && funData.imgData) {
            // 等待3s，等待接口数据返回
            await delay(3000);
            resolve({
              ...funData,
              page,
              // browser,
              randomStr,
              apiResult,
              startIndex: i
            })
            return;
          }
        }
        console.log('browser-----', browserCache[randomStr]);
        if(browserCache[randomStr]) {
          let timer = setTimeout(async () => {
            await browserCache[randomStr].close();
            delete browserCache[randomStr];
            clearTimeout(timer);
            timer = null;
            resolve({ apiResult, randomStr });
            console.log('run task finished!');
          }, 3000)
        } else {
          resolve({ apiResult, randomStr });
          console.log('run task finished!');
        }
      } catch(e) {
        reject(e);
        console.log('run task error!');
      }
    })
    
  }
}