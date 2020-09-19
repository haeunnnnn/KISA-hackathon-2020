const express = require('express');
const mysql = require("mysql");
const BootpayRest = require('bootpay-rest-client');
const router = express.Router();

// DB connection
const connection = mysql.createConnection({
    host: "db-4s657.pub-cdb.ntruss.com",
    user: "asap_user",
    password: "ASAP1!2@",
    database: "base",
    dateStrings: "date",
});

// BootPay set
BootpayRest.setConfig(
	'5f34ea102fa5c20025eecac3',
	'QIE0I0o851JbjihaAoLetULpoWWKJ962pKcUfLC73No='
);


//장바구니 화면
router.get("/cart", function (request, response) {
    response.render("./cart/cart");
});

// 결제완료시 주문완료 화면
router.get("/cartOk", function (request, response) {
    response.render("./cart/cartOk");
});
  
  
// 주문번호 만들기
async function getOrderNo() {
    // 오늘 날짜 yyyymmdd 형태로 만들기
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const todayDate = year + (month < 10 ? "0" + month : month).toString() + (day < 10 ? "0" + day : day).toString();
    console.log("today:", todayDate);

    // 오늘 날짜 기준으로 주문 건수 계산해서 다음 번호 붙이기
    const cnt = await getOrderCnt(todayDate);
    console.log("count :", cnt);

    // 주문번호 만들기
    const orderNo = "OD" + todayDate + cnt;
    console.log("in order No:", orderNo);

    return orderNo;
}
  
// DB에서 오늘 날짜 기준으로 들어온 주문 건수 가져오기 (동기 처리 해야함)
function getOrderCnt(todayDate) {
    return new Promise((resolve, reject) => {
        let cnt = 0;
        connection.query("SELECT * FROM order_info_tb WHERE substr(order_no, 3, 8) = ?", [todayDate], function (error, result, fields) {
        if (error) {
            reject(error);
        } else {
            console.log("result length:", result.length);
            let temp = result.length + 1;
            cnt =
            temp < 10
                ? "0000" + temp
                : temp < 100
                ? "000" + temp
                : temp < 1000
                ? "00" + temp
                : temp < 10000
                ? "0" + temp
                : temp;
            console.log("getOrderCnt:", cnt);
            resolve(cnt);
        }
        });
    });
}
  
// 클라이언트에서 결제 요청
router.post('/requestPayment', async function(req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const phone = req.body.phone;
    const items = JSON.parse(req.body.items);
    const receiptId = req.body.receipt_id;
    const take = req.body.takeout;

    console.log("orderNo start");
    const orderNo = await getOrderNo();
    console.log("orderNo end");

    // 부트페이 결제
    BootpayRest.getAccessToken().then(function (response) {
        console.log(1);
        // Access Token을 발급 받았을 때
        if (response.status === 200 && response.data.token !== undefined) {
            console.log(2);
            // 부트페이 검증
            BootpayRest.verify(receiptId).then(function (_response) {
                console.log(3);
                // 검증 결과를 제대로 가져왔을 때
                if (_response.status === 200) {
                    // console.log(_response);
                    console.log(_response.status);
                    
                    // DB에 삽입
                    insertOrderList(name, price, phone, items, receiptId, orderNo, take);

                    const result = {
                        receipt_id: _response.data.receipt_id,
                        code: _response.status,
                        order_no: orderNo,
                    }
                    console.log(result);
                    res.send(result);
                }
            });
        }
    });
})
  
// 주문 확인시 주문테이블에 삽입
async function insertOrderList (name, price, phone, items, pay_id, orderNo, take) {
    const totalCost = price;
    const areaNm = name;
    const payId = pay_id;
    const phoneNo = phone;  
    const jsonData = items;
    const takeout_yn = take;

    // 결제가 완료되면 DB에 INSERT
    const SQL1 = {
        order_no: orderNo,
        orderer_pn: phoneNo,
        pay_id: payId,
        area_nm: areaNm,
        total_cost: totalCost,
        serving_yn: 'N',
        cancel_yn: 'N',
        takeout_yn: takeout_yn
    };

    // 주문정보 INSERT
    connection.query("INSERT INTO order_info_tb SET ? ", SQL1, function (error, result, fields) {
        if (error) {
            console.log("[ERR] 주문정보 ISNERT 실패");
            throw error;
        } else {
            console.log("[OK] 주문정보 INSERT");

            // 음식 리스트 INSERT
            for (i in jsonData) {
                console.log(jsonData[i]);
                const name = jsonData[i].item_name;
                const cnt = jsonData[i].qty;
                const price = jsonData[i].price;

                const SQL2 = {
                    order_no: orderNo,
                    food_nm: name,
                    food_cnt: cnt,
                    food_price: price,
                    total_price: price * cnt,
                };

                connection.query("INSERT INTO order_food_info_tb SET ?", SQL2, function (error, result, fields) {
                    if (error) {
                        console.log("[ERR] 음식정보 ISNERT 실패");
                        throw error;
                    } else {
                        console.log("[OK] 음식정보 INSERT 성공");
                    }
                });
            }
        }
    });
}
  
// 결제 취소 부분
router.post('/requestPayCancel', function(req, res) {
    const order_no = req.body.order_no;
    connection.query('SELECT * FROM order_info_tb WHERE order_no = ?', [order_no], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            console.log(result);
            const price = result[0].total_cost;
            const receiptID = result[0].pay_id;
            const ordererNo = result[0].orderer_pn;

            console.log(price, receiptID,ordererNo);
            // 취소 통신
            BootpayRest.getAccessToken().then(function (token) {
                if (token.status === 200) {
                BootpayRest.cancel(receiptID, price, ordererNo, '주문취소').then(function (response) {
                    // 결제 취소가 완료되었다면
                    if (response.status === 200) {
                        // TODO: 결제 취소에 관련된 로직을 수행하시면 됩니다.
                        connection.query('UPDATE order_info_tb SET cancel_yn = ? WHERE order_no = ?', ['Y', order_no], function(error, result, fiedls) {
                            if(error) {
                                throw error;
                            } else {
                                res.send('취소 성공');
                            }
                        })
                    }
                });
                }
            });
        }
    })
})

module.exports = router;