module.exports = async function({deployments, getNamedAccounts}){
    const {one,two} = await getNamedAccounts();
    const {deploy} = deployments;
    await deploy('Tiezi',{
        from: one,
        args: [],
        log: true,
        waitConfirmations: 1
    })
}
module.exports.tags = ['Tiezi']