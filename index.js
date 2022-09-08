const path = require("path");
const express = require("express");
// 存储客户端连接
const sseClients = new Set();
// 发送sse消息
const send = (text) => {
  const clients = [...sseClients];
  for (const client of clients) {
    if (client.socket.destroyed) {
      // 根据socket状态，删除无效客户端
      sseClients.delete(client);
    } else {
      // 模拟sse发送格式
      client.write("data: " + text + "\n\n");
    }
  }
};
const app = express();
const port = 3030;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.get("/pay", (req, res) => {
  send(req.query.extra);
  res.send("ok");
});

app.get("/sse", (req, res) => {
  sseClients.add(res);
  res.header({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
