const express = require("express");
const sseClients = [];
const send = (text)=>{
  for (const sse of sseClients) {
    sse.write("data: " + text + "\n\n");
  }
}
const app = express();

const path = require("path");
const port = 3030;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.get("/pay", (req, res) => {
  send(req.query.extra)
  res.send("ok");
});

app.get("/sse", (req, res) => {
  sseClients.push(res);
  res.header({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
