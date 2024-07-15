// ==UserScript==
// @name        美团点餐系统批量下载图片
// @namespace   Violentmonkey Scripts
// @match       https://e.passiontec.cn/irs-web/gaia/index.html*
// @grant       none
// @version     1.0
// @author      -
// @description 2024/7/15 15:23:05
// @grant        GM_download
// @grant        GM_notification
// ==/UserScript==
(function() {
    'use strict';

    // 创建按钮元素
    var button = document.createElement('button');
    button.innerHTML = '下载所有图片';
    button.style.position = 'fixed';
    button.style.top = '1px';
    button.style.right = '1px';
    button.style.zIndex = '1000';

    // 添加按钮点击事件
    button.addEventListener('click', function() {
      (async () => {
        try {
          GM_notification({
            text: '开始下载图片',
            title: '通知',
            timeout: 5000
          });

          button.disabled = true;
          button.innerHTML = "正在下载中";
          await startDownload();
          GM_notification({
            text: '所有图片下载完成',
            title: '通知',
            timeout: 5000
          });
        } catch (e) {
          console.error(e);
          alert(e);
        } finally {
          button.disabled = false;
          button.innerHTML = "下载所有图片";
        }
      })();
    });

    // 将按钮添加到页面
    document.body.appendChild(button);
})();

async function startDownload() {
  const foods = await getAllFood();
  console.log(foods);
  for(var food of foods) {
    if(food.introImg && food.introImg.length > 0) {
      const fileName = `${food.name}.jpg`
      GM_download(food.introImg, fileName);
    }
  }
}

const pageSize = 100;

async function getAllFood() {
  var allFood = [];
  for(var i = 0; i < 10; i++) {
    const resp = await callApi(i);
    allFood.push(...resp.data);
    if(resp.data.length != pageSize) {
      break;
    }
  }
  return allFood;
}

function callApi(page) {
  const start = page ? page * pageSize : 0;
  return fetch("https://e.passiontec.cn/irs-api/apollo-web/food/v2/get-food-list-with-category", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ja;q=0.5",
      "cache-control": "no-cache",
      "content-type": "application/json;charset=UTF-8",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Microsoft Edge\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    "referrer": "https://e.passiontec.cn/irs-web/gaia/index.html",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"name\":\"\",\"belong\":\"\",\"category\":\"\",\"size\":" + pageSize + ",\"start\":" + start + "}",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  }).then(response => {
      if (!response.ok) {
          throw new Error('网络响应错误');
      }
      return response.json();
  });
}
