/*
 * @Description: description
 * @Author: Ask
 * @LastEditors  : Ask
 * @Date: 2019-06-06 14:52:57
 * @LastEditTime : 2019-12-23 23:37:55
 */

var ws = require("nodejs-websocket");
const port = 4000; // 端口信息
const sig_no = 50003; // 返回消息的信令号
let currentPage = 3; // 模拟数据库记录的页码信息

// 处理业务逻辑
function onMessage(conn, data) {
  switch (data.type) {
    case "getImage":
      send(conn, { type: "getImage", ...getImage() });
      break;
    case "nextPage":
      currentPage++;
      // send(conn, { type: "nextPage", currentPage });
      console.log(data);
      boardcastOther(conn, { type: "nextPage", currentPage });
      break;
    case "prevPage":
      currentPage--;
      // send(conn, { type: "prevPage", currentPage });
      boardcastOther(conn, { type: "prevPage", currentPage });
      break;
    case "gotoPage":
      currentPage = data.currentPage;
      // send(conn, { type: "prevPage", currentPage });
      boardcastOther(conn, { type: "gotoPage", currentPage });
      break;
    default:
      break;
  }
  console.log("text", data);
}

function onClose(e) {
  console.log("close", e);
}

function onError(err) {
  console.log("error", err);
}

function getImage() {
  return { currentPage };
}

// server 建立
var server = ws
  .createServer(function(conn) {
    conn.on("text", function(str) {
      if (str === "#9#") {
        conn.sendText("#10#");
        return;
      }
      const res = JSON.parse(str);
      onMessage(conn, res.data);
      // boardcast(str);
    });

    conn.on("close", function(e) {
      onClose(e);
      boardcast(
        JSON.stringify({
          type: "close"
        })
      );
    });

    conn.on("error", function(err) {
      onError(err);
    });
  })
  .listen(port);

function boardcast(str) {
  server.connections.forEach(function(conn) {
    conn.sendText(str);
  });
}

function boardcastOther(cur, data) {
  let res = server.connections.filter(item => item !== cur);
  res.forEach(function(conn) {
    send(conn, data);
  });
  console.log(server.connections);
}
/**
 * @Description: 发送单条消息
 * @param {connector}
 * @param {json}
 * @return: null
 */
function send(conn, data) {
  conn.sendText(JSON.stringify({ sig_no, data }));
}

console.log("websocket server listen port is " + port);
