const mysql = require("mysql");
const axios = require("axios");
const { json } = require("body-parser");

// 숫자포맷
const formatNum = (number) => {
  let result;
  result = number < 10 ? '00' + number : (number < 100 ? '0' + number : number);
  return result;
}

// 각 휴게소 이름 가져오기
function getAreaName(connection) {
  return new Promise((resolve, reject) => {
    connection.query("SELECT area_nm FROM restarea_info_tb", function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        var names = new Array();
        for(var i in results) {
          names.push(results[i].area_nm);
        }
        resolve(names);
      }
    });
  });
}

// 메뉴 입력 반복문
async function insertLoop (connection) {
  var names = await getAreaName(connection);

  for(var j in names) {
    var menu = await getMenuInfo(names[j]);

    for(var i in menu) {
      const SQL = {
        food_code: menu[i].stdRestCd + 'F' + formatNum(i),
        food_nm: menu[i].foodNm,
        food_price: menu[i].foodCost,
        recommend_yn: menu[i].recommend_yn,
        best_yn: menu[i].bestfoodyn,
        premium_yn: menu[i].premiumyn,
        season_yn: menu[i].seasonMenu,
        stdRestCd: menu[i].stdRestCd,
        stdRestNm: menu[i].stdRestNm,
      }
  
      insertMenu(connection, SQL);
    }
  }
}

// 메뉴 insert
function insertMenu(connection, SQL) {
  connection.query('INSERT INTO food_info_tb SET ?', SQL, function(error, results, fields) {
    if(error) {
      throw error;
    } else {
      return results;
    }
  });
}

// 메뉴API(공공데이터) 사용해서 메뉴 가져오기
getMenuInfo = async (areaName) => {
  const API_KEY = "7027848923";

  var url = "http://data.ex.co.kr/openapi/restinfo/restBestfoodList";
  var queryParams = "?" + encodeURIComponent("key") + `=${API_KEY}`; /* Service Key*/
  queryParams += "&" + encodeURIComponent("type") + "=" + encodeURIComponent("json");
  queryParams += "&" + encodeURIComponent("stdRestNm") + "=" + encodeURIComponent(`${areaName}`);
  queryParams += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("100");

  const res = await axios.get(url + queryParams);
  // console.log(res.data.list);
  return res.data.list;
};


  module.exports = insertLoop;