# easy-pay免签支付方案实现
通过 [双卡助手App](https://smshelper.wisg.cn) 实现支付宝、微信、云闪付免签支付方案。
在线demo地址[https://pay.cozylife.tech](https://pay.cozylife.tech)  


## 运行代码：

```bash
# 克隆项目
git clone xxx

# 进入项目目录
cd easy-pay

# 安装依赖
npm install

# 启动服务
npm run start
```

### 前台支付页面地址 [http://localhost:3030](http://ip:3030)

## App端配置：
- 下载 [双卡助手App](https://smshelper.wisg.cn)，打开功能面板
- 在要转发的内容，勾选收款信息
- 在转发方式，勾选网络转发，并点击后边的设置
- 配置转发通道，选择自定义和Get
- 填写支付回调地址，http://[你的服务ip]:3030/pay-hook?extra={{extra}}并点击添加