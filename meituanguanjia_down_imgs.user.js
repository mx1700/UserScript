// ==UserScript==
// @name        美团管家批量下载图片
// @namespace   Violentmonkey Scripts
// @match       https://pos.meituan.com/web/operation/goods/list*
// @grant       none
// @version     1.0
// @author      -
// @description 2024/7/15 20:56:14
// @grant        GM_download
// @grant        GM_notification
// ==/UserScript==

(function() {
  'use strict';

  const pageSize = 100;
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

  async function startDownload() {
    const foods = await getAllFood();
    console.log(foods);
    for(var food of foods) {
      if(food.imgUrl && food.imgUrl.length > 0) {
        const fileName = `${food.name}.jpg`
        GM_download(food.imgUrl, fileName);
      }
    }
  }

  async function getAllFood() {
    var allFood = [];
    for(var i = 1; i <= 10; i++) {
      const resp = await callApi(i);
      const goods = resp.data.goods;
      allFood.push(...goods);
      if(goods.length != pageSize) {
        break;
      }
    }
    return allFood;
  }

  function callApi(page) {
    return fetch("https://pos.meituan.com/web/api/v1/admin/poi/goods/filter-es?yodaReady=h5&csecplatform=4&csecversion=2.4.0", {
      "headers": {
        "appcode": "49",
        "model": "chrome",
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{\"showTaxRateDepartment\":1,\"pageNo\":" + page +",\"pageSize\":" + pageSize + ",\"orQuery\":{\"showBox\":2,\"showSide\":2},\"queryTarget\":0,\"extraInfo\":{\"showComboGroupDetail\":2,\"showPrintConfig\":1,\"showOperatorName\":1}}",
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


})();


