const { run } = require("hardhat");

module.exports = async (contractAddress, args) => {
  console.log("Verifying contract....");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(error);
    }
  }
};
