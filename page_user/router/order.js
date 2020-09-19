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


//주문했었던 목록 화면(주문번호, 주문내역 확인)
router.get("/orderlist", function (request, response) {
    response.render("./orderlist/orderlist");
});

// 주문 상세 팝업 화면
router.get("/orderDetail", function (req, res) {
    res.render("./orderlist/orderDetail");
});

  
// 주문번호 받아서 주문상세 내역 반환
router.post("/requestOrderInfo", function (req, res) {
    const order_no = req.body.order_no;
    connection.query('SELECT * FROM order_food_info_tb WHERE order_no = ?', [order_no], function(error, result, fields) {
        if(error) { 
            throw error;
        } else {
            res.send(result);      
        }
    });
});

// 사용자 번호 입력받아서 주문내역 반환
router.post("/requestOrderList", function (req, res) {
    const phone_no = req.body.phone_no;
    const gigan = req.body.gigan;
    // 오늘 날짜 yyyymmdd 형태로 만들기
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const todayDate = year + (month < 10 ? "0" + month : month).toString() + (day < 10 ? "0" + day : day).toString();
    console.log("today:", todayDate);
  
    let searchGigan;
    if(gigan == '오늘') {
        searchGigan = '%' + todayDate + '%';
    } else {
        searchGigan = '%';
    }
    console.log(searchGigan);
  
    var formatted = phone_no.slice(0, 3) + "-" + phone_no.slice(3, 7) + "-" + phone_no.slice(7);
    console.log(formatted);
  
    connection.query("SELECT * FROM order_info_tb WHERE order_no LIKE ? AND orderer_pn = ? ORDER BY 1 DESC", [searchGigan, formatted], function (error, result, fields) {
        if (error) {
            throw error;
        } else {
            res.send(result);
        }
    });
})


module.exports = router;
