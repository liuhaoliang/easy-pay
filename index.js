const path = require("path");
const express = require("express");
const CryptoJS = require("crypto-js");
const { default: axios } = require("axios");

// 支付通知地址
const NotifyUrl = "";
// 支付返回地址，如果预支付没有传，就使用这个默认地址
const ReturnUrl = "";

// 存储客户端连接
const sseClients = new Set();

// 定时删除无效客户端
setInterval(() => {
  const clients = [...sseClients];
  for (const client of clients) {
    if (client.socket.destroyed) {
      // 根据socket状态，删除无效客户端
      sseClients.delete(client);
    }
  }
}, 200);

const port = 3030;
const discountUnit = 0.01; //折扣金额梯度
const salt = "zcwisg"; //用于加密的盐

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// 获取当前用户的折扣信息
const getPayInfo = ({ account, total }) => {
  let discount = 0;
  while (
    [...sseClients].find(
      (o) =>
        Number(o.query.total) - Number(o.query.discount) ===
        Number(total) - Number(discount)
    )
  ) {
    discount += discountUnit;
  }
  // 折扣后金额不能为0
  if (Number(total) === Number(discount)) {
    return null;
  }
  return {
    account,
    total,
    discount,
    sign: getPaySign({ account, total, discount }),
  };
};

const getPaySign = ({ account, discount, total }) => {
  return CryptoJS.MD5(account + discount + total + salt).toString();
};

const checkPaySign = ({ account, discount, total, sign }) => {
  return getPaySign({ account, discount, total }) === sign;
};

/**
 * 对接app的回调接口
 */
app.get("/pay-hook", (req, res) => {
  try {
    const data = JSON.parse(req.query.extra.replace(/\\/g, ""));
    const { pay_type: payType, msg_time: payTime, text, app_name } = data;
    const money = text.match(/收款(\d{1,}.\d{1,})元/)[1];
    if (["wxpay", "alipay"].includes(payType)) {
      const { returnUrl = ReturnUrl, ...rest } = client.query;
      const callbackData = {
        ...rest,
        returnUrl,
        payType,
        payTime,
      };

      // 回调通知
      if (NotifyUrl) {
        axios.post(NotifyUrl, callbackData);
      }

      // 通知客户端
      const client = [...sseClients].find((o) => {
        const { total, discount } = o.query;
        return Number(money) === Number(total) - Number(discount);
      });
      if (client) {
        const text = JSON.stringify(callbackData);
        client.write("data: " + text + "\n\n");
      }
    }
  } catch (error) {
    console.log("支付信息解析失败", error);
  }
  res.send("ok");
});

/**
 * 预支付，根据用户和金额，判断需要折扣的金额
 */
app.post("/prepare-pay", (req, res) => {
  const { account, total } = req.body;
  if (!account || !total) {
    res.json({
      status: false,
      msg: "请完善表单",
    });
    return;
  }
  if (isNaN(total) || Number(total) === 0) {
    res.json({
      status: false,
      msg: "请输入支付金额",
    });
    return;
  }
  const payInfo = getPayInfo({ account, total });
  if (!payInfo) {
    res.json({
      status: false,
      msg: "请稍后再试",
    });
    return;
  }
  res.json({
    status: true,
    data: payInfo,
  });
});

/**
 * 支付页面的消息推送接口
 */
app.get("/in-pay", (req, res) => {
  // 校验支付信息是否正确
  if (!checkPaySign(req.query)) {
    res.json({
      status: false,
      msg: "无效的支付",
    });
    return;
  }
  // 防止有重复金额的客户端连接
  if (
    [...sseClients].find(
      (o) =>
        Number(o.query.total) - Number(o.query.discount) ===
        Number(req.query.total) - Number(req.query.discount)
    )
  ) {
    res.json({
      status: false,
      msg: "请先调用预支付接口",
    });
    return;
  }
  res.header({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  // 将连接参数存储下来
  res.query = req.query;
  // 添加新的连接
  sseClients.add(res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
