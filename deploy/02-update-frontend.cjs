const { deployments } = require("hardhat");
const fs = require("fs");
const ABIFilepath = "./src/constants/ABI.json";
const contractAddressFilepath = "./src/constants/contractAddress.json";

module.exports = async () => {
  if (process.env.UPDATE_FRONTEND === "true") {
    const contract = await deployments.get("NFTMarketplace");
    const ABI = contract.abi;
    const address = contract.address;

    fs.writeFileSync(ABIFilepath, JSON.stringify(ABI));
    fs.writeFileSync(contractAddressFilepath, JSON.stringify(address));
    console.log("Updated Frontend");
    console.log("..............................");
  }
};

module.exports.tags = ["all", "updateFrontend"];
