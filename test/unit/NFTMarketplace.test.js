const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.js");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("NFT Marketplace", () => {
      let expect;
      let contract, nft;
      let deployer, addresses;
      const tokenURI =
        "https://v2.emblemvault.io/v3/meta/0x7E6027a6A84fC1F6Db6782c523EFe62c923e46ff/42741568268271627005603014856691612673583670625740997034891561691910895568241";
      const price = 0.01;
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

        it("checks if listing price matches", async () => {
          const listingPrice = ethers.parseEther("0.001");
          const fetchedListingPrice = await nft.getListingPrice();
          expect(listingPrice).to.equal(fetchedListingPrice);
        });
      });

      describe("createToken", () => {
        it("reverts if price is zero", async () => {
          await expect(nft.createToken(tokenURI, 0)).to.be.revertedWithCustomError(nft, "NFTMarketplace__PriceCannotBeZero");
        });
      });
    });
