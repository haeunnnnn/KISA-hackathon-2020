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


// 홈 화면
router.get("/home", function (req, res) {
    res.render("./home/home-1");
});
  
// 각 휴게소 정보 화면
router.get("/restAreaInfo", function (req, res) {
    res .render("./home/restAreaInfo");
});
  
// 각 휴게소 별 메뉴 목록 화면
router.get("/menulist", function (request, response) {
    response.render("./home/menulist");
});

// 모든 휴게소 출력 화면
router.get("/arealist", function (req, res) {
    res.render("./home/arealist");
});


// 사용자 앱에서 휴게서 위도,경도 요청시 값 보내주기 - 홈 화면(지도, 리스트)
router.post("/requestRestAreaLatLong", function (req, res) {
    connection.query("SELECT area_code, area_nm, road_nm, latitude, longitude FROM restarea_info_tb", function (error, result, fields) {
        if (error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});
  
// 사용자 앱에서 휴게소 하나 선택시, 휴게소 정보 값 보내주기 - 휴게소 정보 화면(휴게소 정보)
router.post("/requestRestAreaInfo", function (req, res) {
    const areaCode = req.body.area_code;
    const areaName = req.body.area_name;
    connection.query(
        `SELECT '-' AS area_code
            , '-' AS area_nm
            , '-' AS road_type
            , '-' AS road_no
            , AVG(score) AS road_nm
            , '-' AS road_way
            , '-' AS latitude
            , '-' AS longitude
            , '-' AS parking_space_cnt
            , '-' AS maintenance_yn
            , '-' AS lpg_yn
            , '-' AS gas_yn
            , '-' AS electric_yn
            , '-' AS bus_transfer_yn
            , '-' AS shelter_yn
            , '-' AS restroom_yn
            , '-' AS pharmacy_yn
            , '-' AS nursing_room_yn
            , '-' AS store_yn
            , '-' AS restaurant_yn
            , '-' AS area_pn
        FROM review_info_tb
        WHERE area_nm LIKE ?
        GROUP BY area_nm
        UNION ALL
        SELECT * 
        FROM restarea_info_tb 
        WHERE area_code = ?`
        , [areaName, areaCode]
        , function (error, result, fields) {
        if (error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});
  
// 휴게소이름에 따라 메뉴리스트 보여주기
router.post("/requestMenuInfo", function(req, res) {
    let area_nm = req.body.area_nm + '휴게소';
    console.log(area_nm);
    connection.query('SELECT * FROM food_info_tb WHERE stdRestNm LIKE ?', [area_nm], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            // console.log(result);
            res.send(JSON.stringify(result));
        }
    });
});
  
// 전체 휴게소 목록
router.post('/showAllRestareaList', function(req,res) {
    let road_nm = (req.body.road_nm == '전체' ? '%' : req.body.road_nm);
    console.log(road_nm);
    connection.query('SELECT * FROM restarea_info_tb WHERE road_nm LIKE ? ORDER BY area_nm', [road_nm], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});
  
// 전체 도로 목록
router.post('/showRoadList', function(req,res) {
    connection.query('SELECT DISTINCT(road_nm) FROM restarea_info_tb', function(error, results, fields) {
        if(error) {
            throw(error);
        } else {
            res.send( JSON.stringify(results) );
        }
    });
});


module.exports = router;