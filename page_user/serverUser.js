const express = require("express");
const http = require("http");
const app = express();
const review = require('./router/review.js')
const home = require('./router/home.js')
const cart = require('./router/cart.js')
const order = require('./router/order.js')

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
function serverUser() {
    http.createServer(app).listen(3000, function () {
        console.log("example app listening at http://localhost:3000");
    });
}

app.use(review);
app.use(home);
app.use(cart);
app.use(order);

// 핸드폰 번호 입력받는 화면
app.get("/", function (req, res) {
  res.render("./main");
});
app.get("/main", function (req, res) {
  res.render("./main");
});

module.exports = serverUser;