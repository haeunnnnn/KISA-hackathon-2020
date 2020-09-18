const createTable = require("./create/createTable.js");
const insertArea = require("./insert/insertArea.js");
const insertMenu = require("./insert/insertMenu.js");
const mysql = require("mysql");

// local DB 정보
const password = "dksgkdms"; // 로컬 DB 비밀번호
const name = "kisa-hackathon"; // 생성한 스키마 이름

// DB connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: password,
  database: name,
});

// DB setting
async function settingDB(connection) {
  // TABLE 생성
  console.log("[CREATE]: START");
  await createTable(connection);
  console.log("[CREATE]: END");

  // 휴게소 DATA 삽입
  console.log("[INSERT]: START");
  await insertArea(connection);
  console.log("[INSERT]: END");

  // 휴게소 DATA 삽입
  console.log("[INSERT]: START");
  await insertMenu(connection);
  console.log("[INSERT]: END");

  connection.end();
}

settingDB(connection);
