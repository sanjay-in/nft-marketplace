const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat.config.js");
const verify = require("../utils/verify/verify.js");
const { networks } = require("../hardhat.config");

module.exports = async () => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const listingPrice = ethers.parseEther("0.001");

  const args = [listingPrice];

  log("Deploying NFT Marketplace contract....");

  const nftMarketplace = await deploy("NFTMarketplace", {
    from: deployer,
    args,
    log: true,
    waitConfirmation: networks[network.name].blockConfirmation || 1,
  });

  log("Deployed contract....");

  if (!developmentChains.includes(network.name)) {
    await verify(nftMarketplace.address, args);
  }
};

module.exports.tags = ["all", "nftMarketplace"];
