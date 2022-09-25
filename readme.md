# easy-pay免签支付方案实现
通过 [双卡助手App](https://smshelper.wisg.cn) 实现支付宝、微信、云闪付免签支付方案。
### 在线demo地址：[https://pay.cozylife.tech](https://pay.cozylife.tech)  

## 独立部署：

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

### 访问前台支付页面地址： [http://localhost:3030](http://ip:3030)

## App端配置：
- 下载 [双卡助手App](https://smshelper.wisg.cn)，打开功能面板
- 在要转发的内容，勾选收款信息
- 在转发方式，勾选网络转发，并点击后边的设置
- 配置转发通道，选择自定义和Get
- 填写支付回调地址，http://[你的服务ip]:3030/pay-hook?extra={{extra}}并点击添加


## 高级选项
程序支持自定义部分参数，修改 index.js 文件变量：
- Port 服务端口
- NotifyUrl 支付通知地址
- ReturnUrl 支付返回地址（如果预支付没有传，就使用这个默认地址）
- DiscountUnit 折扣金额梯度
- MaxDiscount 最大折扣金额
- RandomDiscountMode 使用随机折扣模式/使用梯度折扣模式
- Salt 用于加密的盐

## 交流群
QQ群：761323808
