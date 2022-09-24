const path = require("path");
const express = require("express");
const CryptoJS = require("crypto-js");
const { default: axios } = require("axios");

// 程序端口
const port = 3030;

// 支付通知地址
const NotifyUrl = "";
// 支付返回地址，如果预支付没有传，就使用这个默认地址
const ReturnUrl = "";
// 折扣金额梯度
const DiscountUnit = 0.01;
// 最大折扣金额
const MaxDiscount = 0.2;
// 使用随机折扣模式/使用梯度折扣模式
const RandomDiscountMode = false;
// 用于加密的盐
const Salt = "zcwisg";
// 存储客户端连接
const clientSet = new Set();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// 获取客户端
const getClients = () => [...clientSet];

// 获取支付签名参数
const getPaySign = ({ account, discount, total }) => CryptoJS.MD5(account + discount + total + Salt).toString();

// 检查签名是否正确
const checkPaySign = ({ account, discount, total, sign }) => getPaySign({ account, discount, total }) === sign;

// 定时删除无效客户端
setInterval(() => {
  const clients = getClients();
  clients.forEach((o) => {
    if (o.socket.destroyed) {
      // 根据socket状态，删除无效客户端
      clientSet.delete(o);
    }
  });
}, 200);

// 获取当前用户的折扣信息
const getPayInfo = ({ account, total }) => {
  let discount = 0;
  const historyRealPay = getClients().map(o => (Number(o.query.total) - Number(o.query.discount)).toFixed(2));

  if (!RandomDiscountMode) {
    // 顺序折扣模式
    while (
      historyRealPay.find(
        o => o === (Number(total) - Number(discount)).toFixed(2)
      )
    ) {
      discount = (discount + DiscountUnit).toFixed(2);
    }
  } else {
    // 随机折扣模式
    const priceCount = ((MaxDiscount / DiscountUnit) | 0) + 1;
    const availablePrices = Array(priceCount)
      .map((o, idx) => (total - idx * DiscountUnit).toFixed(2))
      .filter(o => historyRealPay.includes(o));
    if (availablePrices.length > 0) {
      const idx = (Math.random() * availablePrices.length) | 0;
      discount = (total - availablePrices[idx]).toFixed(2);
    } else {
      discount === total;
    }
  }

  // 折扣后金额不能为0
  if (total === discount) {
    return null;
  }
  // 折扣金额不能大于折扣上限
  if (discount > MaxDiscount) {
    return null;
  }
  return {
    account,
    total,
    discount,
    sign: getPaySign({ account, total, discount }),
  };
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
      const client = getClients().find((o) => {
        const { total, discount } = o.query;
        return Number(money) === Number(total) - Number(discount);
      });
      // 支付的网页客户端可不能关闭啊
      if (client) {
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
        const responseText = JSON.stringify(callbackData);
        client.write(`data: ${responseText}\n\n`);
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
    getClients().find(
      o => Number(o.query.total) - Number(o.query.discount)
        === Number(req.query.total) - Number(req.query.discount)
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
  clientSet.add(res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
