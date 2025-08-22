module.exports = async function({deployments, getNamedAccounts}){
    const {one,two} = await getNamedAccounts();
    const {deploy} = deployments;

    // 2. 部署 NFT 合约
    const nft = await deploy("Nft", {
        from: one,
        args: [one], // deployer 是管理员，login 是 minter
        log: true,
    });

    // 1. 部署 Login 合约
    const login = await deploy("Login", {
        from: one,
        args: [nft.address],
        log: true,
    });
}

module.exports.tags = ['Login']