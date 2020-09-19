const express = require('express');
const mysql = require("mysql");
const router = express.Router();

// DB connection
const connection = mysql.createConnection({
    host: "db-4s657.pub-cdb.ntruss.com",
    user: "asap_user",
    password: "ASAP1!2@",
    database: "base",
    dateStrings: "date",
});


// 휴게소 관리 페이지 - 메뉴 관리
router.get("/menu", function (req, res) {
    res.render("./menu");
});

// 휴게소 관리 페이지 - 메뉴 추가 팝업
router.get("/addMenuPopup", function (req, res) {
    res.render("./addMenuPopup");
});



// 휴게소 관리 페이지 - 메뉴 리스트 출력
router.post("/showMenuList", function(req, res) {
    let area_nm = req.body.area_nm + '휴게소';
    connection.query('SELECT * FROM food_info_tb WHERE stdRestNm LIKE ?', [area_nm], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});
  
// 휴게소 관리 페이지 - 메뉴 추가
router.post('/addMenu', function(req, res) {
    let data = req.body;
    let flag = '';
    const SQL = {
        food_code: data.food_code,
        food_nm: data.food_name,
        food_price: data.food_price,
        recommend_yn: data.recommend_yn,
        best_yn: data.best_yn,
        premium_yn: data.premium_yn,
        season_yn: data.season_yn,
        stdRestCd: data.stdRestCd,
        stdRestNm: data.stdRestNm
    }
    connection.query('INSERT INTO food_info_tb SET ?', SQL, function(error, result, fields) {
        if(error) {
            flag = 'Fail';
            throw(error);
        } else {
            flag = 'Success';
        }
    res.send(flag);
    });
});
  
// 휴게소 관리자 페이지 - 메뉴 삭제
router.post('/deleteMenu', function(req, res) {
    let data = req.body;
    let area_nm = data.area_name + '휴게소';
    let food_name = data.food_name;
    let flag = '';
    connection.query('DELETE FROM food_info_tb WHERE stdRestNm = ? AND food_nm = ?', [area_nm, food_name], function(error, result, fields) {
        if(error) {
            flag = 'Fail';
            throw(error);
        } else {
            flag = 'Success';
        }
    res.send(flag);
    });
})

module.exports = router;