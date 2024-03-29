const {networkConfig, developmentChains} = require("../helper-hardhat-config")
const {network} = require("hardhat")
const {verify} = require("../utils/verify")
require("dotenv").config()
// const ethUsdPriceFeedAddress = networkConfig[network.name]["ethUsdPriceFeed"]

// export Hardhat Runtime Environment
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()

    let ethUsdPriceFeedAddress
    if(developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("-----------------------------------------------------")
    log("Deploying FundMe contract and waiting for confirmations...")
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // price feed address by chain
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("FundMe deployed to ${fundMe.address")

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }

    log("-----------------------------------------------------")
}
module.exports.tags = ["all", "fundme"]