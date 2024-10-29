const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.js");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("NFT Marketplace", () => {
      let expect;
      let contract, nft;
      let deployer, addresses;
      beforeEach(async () => {
        const chai = await import("chai");
        expect = chai.expect;
        await deployments.fixture(["all"]);

        addresses = await ethers.getSigners();
        deployer = addresses[0].address;

        contract = await deployments.get("NFTMarketplace");
        nft = await ethers.getContractAt(contract.abi, contract.address);
      });

      describe("constructor", () => {
        it("checks if name is correct", async () => {
          const definedName = "NFTMarketplace";
          const nameFromERC721 = await nft.name();
          expect(definedName).to.equal(nameFromERC721);
        });

        it("checks if symbol is correct", async () => {
          const definedSymbol = "NFT";
          const symbolFromERC721 = await nft.symbol();
          expect(definedSymbol).to.equal(symbolFromERC721);
        });

        it("checks if deployer is the owner", async () => {
          const owner = await nft.getOwner();
          expect(owner).to.equal(deployer);
        });
      });
    });
