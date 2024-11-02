const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.cjs");
const { expect, assert } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("NFT Marketplace", () => {
      let contract, nft;
      let deployer, addresses;
      const tokenURI =
        "https://v2.emblemvault.io/v3/meta/0x7E6027a6A84fC1F6Db6782c523EFe62c923e46ff/42741568268271627005603014856691612673583670625740997034891561691910895568241";
      const price = ethers.parseEther("0.01");
      const listingPrice = ethers.parseEther("0.001");
      beforeEach(async () => {
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

        it("reverts if listing prices dont match", async () => {
          const incorrectListingPrice = ethers.parseEther("0.0011");
          await expect(nft.createToken(tokenURI, price, { value: incorrectListingPrice })).to.be.revertedWithCustomError(
            nft,
            "NFTMarketplace__ListingPriceNotEqual"
          );
        });

        it("increments the tokenId", async () => {
          await nft.createToken(tokenURI, price, { value: listingPrice });
          const fetchedTokenCount = await nft.getTokenId();
          assert.equal(fetchedTokenCount, 1);
        });

        it("checks if token uri is set", async () => {
          await nft.createToken(tokenURI, price, { value: listingPrice });
          const fetchedTokenURI = await nft.tokenURI(1);
          assert.equal(tokenURI, fetchedTokenURI);
        });

        it("returns tokenId", async () => {
          const createToken = await nft.createToken.staticCall(tokenURI, price, { value: listingPrice });
          assert.equal(createToken, 1);
        });
      });

      describe("createTokenListed", () => {
        beforeEach(async () => {
          await nft.createToken(tokenURI, price, { value: listingPrice });
        });

        it("maps the tokenId to ListedToken", async () => {
          const fetchedMapping = await nft.getTokenToIdListed(1);
          const tokenID = 1;
          const ownerAddress = contract.address;
          const sellerAddress = deployer;
          const soldToken = false;
          assert.equal(fetchedMapping.tokenId, tokenID);
          assert.equal(fetchedMapping.owner, ownerAddress);
          assert.equal(fetchedMapping.seller, sellerAddress);
          assert.equal(fetchedMapping.price, price);
          assert.equal(fetchedMapping.sold, soldToken);
        });

        it("checks if token belongs to contract", async () => {
          const ownerOfToken = await nft.ownerOf(1);
          assert.equal(ownerOfToken, contract.address);
        });

        it("emits TokenListed event", async () => {
          const tokenID = 2;
          const ownerAddress = contract.address;
          const sellerAddress = deployer;
          const soldToken = false;
          await expect(nft.createToken(tokenURI, price, { value: listingPrice }))
            .to.emit(nft, "TokenListed")
            .withArgs(tokenID, ownerAddress, sellerAddress, price, soldToken);
        });
      });

      describe("buy NFT", () => {
        let tokenId, newBuyer;
        beforeEach(async () => {
          await nft.createToken(tokenURI, price, { value: listingPrice });
          tokenId = await nft.getTokenId();
          newBuyer = addresses[1];
          await nft.connect(newBuyer).buyNFT(tokenId, { value: price });
        });

        it("reverts when buy price is less then sell price", async () => {
          await nft.createToken(tokenURI, price, { value: listingPrice });
          const tokenId2 = await nft.getTokenId();
          await expect(nft.connect(newBuyer).buyNFT(tokenId2, { value: ethers.parseEther("0.009") })).to.be.revertedWithCustomError(
            nft,
            "NFTMarketplace__BuyNotSameAsSellPrice"
          );
        });

        it("checks if tokenIdToListedToken has been updated", async () => {
          const zeroAddress = ethers.ZeroAddress;
          const listedToken = await nft.getTokenToIdListed(tokenId);
          assert.equal(listedToken.tokenId, tokenId);
          assert.equal(listedToken.owner, newBuyer.address);
          assert.equal(listedToken.seller, zeroAddress);
          assert.equal(listedToken.price, listedToken.price);
          assert.equal(listedToken.sold, true);
        });

        it("increments the item sold vaiable", async () => {
          const itemsSold = await nft.getItemSold();
          assert.equal(itemsSold, 1);
        });

        it("transfers nft to buyer", async () => {
          const addressOfNFTOwner = await nft.ownerOf(tokenId);
          assert.equal(addressOfNFTOwner, newBuyer.address);
        });
      });
    });
