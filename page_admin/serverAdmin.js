const express = require("express");
const http = require("http");
const app = express();
const menu = require('./router/menu.js');
const order = require('./router/order.js');

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

app.use(menu);
app.use(order);

module.exports = serverAdmin;