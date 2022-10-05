# easy-pay免签支付方案实现
通过 收款助手App 实现支付宝、微信、云闪付免签支付方案。
### 使用方式请查看[【在线文档】](https://www.showdoc.com.cn/p/b6277e11be0d96dd7dc933db6223f981)  
### 在线demo地址[【点击体验】](https://easypay.wisg.cn/service/demo/index.html)  

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
