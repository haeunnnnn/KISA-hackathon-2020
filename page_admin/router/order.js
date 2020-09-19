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


// 휴게소 관리 페이지 - 홈 화면
router.get("/", function (req, res) {
    res.render("./admin");
});  
router.get("/admin", function (req, res) {
    res.render("./admin");
});
  
// 휴게소 관리 페이지 - 주문상세 팝업
router.get("/orderDetail", function (req, res) {
    res.render("./orderDetail");
});


// 휴게소 관리 페이지 - 휴게소 목록 출력
router.post("/showAreaList", function (req, res) {
    connection.query("SELECT area_nm FROM restarea_info_tb", function (error, result, fields) {
        if (error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});
  
// 휴게소 관리 페이지 - 각 휴게소의 주문 목록 출력
router.post("/showOrderList", function(req, res) {
    const area_nm = (req.body.area_nm == '전체' ? '%' : req.body.area_nm);
    connection.query('SELECT * FROM order_info_tb WHERE area_nm LIKE ? ORDER BY order_time DESC', [area_nm], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});
  
// 휴게소 관리 페이지 - 각 주문의 상세내용 출력
router.post("/orderDetailInfo", function (req, res) {
    const order_no = req.body.order_no;
    connection.query('SELECT * FROM order_food_info_tb WHERE order_no = ?', [order_no], function(error, result, fields) {
        if(error) { 
            throw error;
        } else {
            res.send(result);      
        }
    });
})

// 휴게소 관리 페이지 - 확인 버튼 클릭 시 주문 내용 수정
router.post("/updateOrderInfo", function(req, res) {
    const orderNo = req.body.order_no;
    connection.query('UPDATE order_info_tb SET serving_yn = ? WHERE order_no = ?', ['Y', orderNo], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
        }
    });
});

module.exports = router;