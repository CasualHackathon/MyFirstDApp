# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
## 目录结构
```
MyFirstDapp
    |-blockchain-social    #前端
        |-src
            |-components
            |-router
            |-services
            |-store
    
    |-hardhat       #合约
        |-contracts   #合约代码
        |-deploy      #部署脚本

## 运行
1. 启动节点    npx hardhat node
2. 部署合约    npx hardhat run scripts/deploy.js --network localhost
3. 启动前端    cd blockchain-social && npm run dev

## 可视化界面
http://101.43.109.191/login