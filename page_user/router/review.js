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


// 리뷰 보기 화면
router.get("/readReview", function(request, response){
    response.render("./review/readReview");
});
  
//리뷰 쓰기 화면
router.get("/writeReview", function(request, response){
    response.render("./review/writeReview");
});


// 리뷰 작성
router.post('/writeReview', function(req, res) {
    const data = req.body;
    const order_no = data.orderNumber;
    let flag = '';
    const SQL = {
        order_no: order_no,
        orderer_pn: data.phoneNumber,
        area_nm: data.areaName,
        score: data.rate,
        comments: data.message,
        write_time: data.date,
    }
    connection.query('INSERT INTO review_info_tb SET ?', SQL, function(error, results, fields) {
        if(error) {
            flag = 'Fail';
            throw(error);
        } else {
            console.log('insert ok');
            // 입력 후 주문 테이블 수정
            connection.query('UPDATE order_info_tb SET review_yn = ? WHERE order_no = ?',['Y', order_no], function(error, results, fields) {
                if(error) {
                    flag = 'Fail';
                    throw(error);
                } else {
                    console.log('update ok');
                    flag = 'Success';
                    res.send(flag);
                }
            });
        }
    });
});
  
// 리뷰 보기
router.post('/readReview', function(req, res) {
    const data = req.body;
    const area_nm = data.area_nm;       
    connection.query(
        `SELECT '합계' AS order_no
            , '-' AS orderer_pn
            , AVG(score) AS score
            , '-' AS comments
            , '-' AS write_time
        FROM review_info_tb
        WHERE area_nm LIKE ?
        GROUP BY area_nm
        UNION ALL
        SELECT order_no
            , orderer_pn
            , score
            , comments
            , write_time
        FROM review_info_tb
        WHERE area_nm LIKE ?`
        , [area_nm, area_nm]
        , function(error, results, fields) {
        if(error) {
            throw(error);
        } else {
            let result = JSON.stringify(results);
            res.send(result);
        }
    });
});
  
// 리뷰보기 화면에서 주문번호 마다 먹은 음식 가져오기
router.post('/readReviewFood', function(req, res) {
    const order_no = req.body.order_no;
    connection.query('SELECT food_nm FROM order_food_info_tb WHERE order_no = ?', [order_no], function(error, results, fields) {
        if(error) {
            throw(error);
        } else {
            res.send(JSON.stringify(results));
        }
    });
});
  

module.exports = router;