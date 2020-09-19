const express = require("express");
const mysql = require("mysql");
const http = require("http");
const app = express();

// DB connection
const connection = mysql.createConnection({
  host: "db-4s657.pub-cdb.ntruss.com",
  user: "asap_user",
  password: "ASAP1!2@",
  database: "base",
  dateStrings: "date",
});

// views
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// ajax
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

// 이 과정을 거쳐야 내부폴더에 있는 파일을 접근할 수 있음
app.use(express.static(__dirname));


// 서버 Start
function serverAdmin() {
    http.createServer(app).listen(3001, function () {
        console.log("example app listening at http://localhost:3001");
    });
}


// 서버랑 클라이언트 소켓 통신해서 새로 주문 들어오면 자동으로 새로고침 하는 기능인데 현재 못하는중
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3100 });

orderCheck();

function orderCheck() {
  // 주문 들어온 경우
  wss.on('connection', function(ws) {
      ws.on('message', function(message) {
          if(message == 'orderIn') {
              console.log('[server] 사용자가 주문 함');

            }
      })
  })
  // cookStart();
}

function cookStart() {
  // 요리 하는 경우
  wss.on('connection', function(ws) {
    console.log('[server] 요리를 시작합니다');
    ws.send('cookStart');
  })
}

// =================================================== 휴 게 소 =========================================================

// 휴게소 측 홈 화면
app.get("/admin", function (req, res) {
  res.render("./admin");
});

// 휴게소 측 메뉴 관리 화면
app.get("/menu", function (req, res) {
  res.render("./menu");
});

// 휴게소 측 메뉴 관리 화면
app.get("/addMenuPopup", function (req, res) {
  res.render("./addMenuPopup");
});

// 결제 상세
app.get("/orderDetail", function (req, res) {
  res.render("./orderDetail");
});

// admin에서 휴게소 목록리스트 보여주기
app.post("/adminShowAreaList", function (req, res) {
  connection.query("SELECT area_nm FROM restarea_info_tb", function (
    error,
    result,
    fields
  ) {
    if (error) {
      throw error;
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

// admin 에서 휴게소이름에 따라 주문리스트 보여주기
app.post("/adminShowOrderList", function(req, res) {
  let area_nm = (req.body.area_nm == '전체' ? '%' : req.body.area_nm);
  console.log(area_nm);
  connection.query('SELECT * FROM order_info_tb WHERE area_nm LIKE ? ORDER BY order_time DESC', [area_nm], function(error, result, fields) {
    if(error) {
      throw error;
    } else {
      console.log(result);
      res.send(JSON.stringify(result));
    }
  });
})

// admin 에서 휴게소이름에 따라 주문리스트 수정하기
app.post("/adminUpdateOrderInfo", function(req, res) {
  const orderNo = req.body.order_no;
  console.log(orderNo);
  // 수정
  connection.query('UPDATE order_info_tb SET serving_yn = ? WHERE order_no = ?', ['Y', orderNo], function(error, result, fields) {
    if(error) {
      throw error;
    } else {
      console.log(result);
      cookStart();
    }
  });
})

// admin 에서 휴게소이름에 따라 메뉴리스트 보여주기
app.post("/adminShowMenuList", function(req, res) {
  let area_nm = req.body.area_nm + '휴게소';
  console.log(area_nm);
  connection.query('SELECT * FROM food_info_tb WHERE stdRestNm LIKE ?', [area_nm], function(error, result, fields) {
    if(error) {
      throw error;
    } else {
      console.log(result);
      res.send(JSON.stringify(result));
    }
  });
})

// admin에서 새로운 메뉴 추가
app.post('/adminAddMenu', function(req, res) {
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
      console.log(result);
      flag = 'Success';
    }
    res.send(flag);
  });
})

// admin에서 기존 메뉴 삭제
app.post('/adminDeleteMenuInfo', function(req, res) {

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
      console.log(result);
    }
    res.send(flag);
  });
})

// 주문번호 받아서 주문상세 내역 반환
app.post("/requestOrderInfo", function (req, res) {
  const order_no = req.body.order_no;
  
  connection.query('SELECT * FROM order_food_info_tb WHERE order_no = ?', [order_no], function(error, result, fields) {
    if(error) { 
      throw error;
    } else {
      res.send(result);      
    }
  });
})


module.exports = serverAdmin;