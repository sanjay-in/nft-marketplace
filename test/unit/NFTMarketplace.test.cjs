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
      const title = "New Title";
      const imgURL = "https://i.pinimg.com/736x/20/3e/bf/203ebf2a65c4ca014525972afe3fbae0.jpg";
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
          await expect(nft.createToken(tokenURI, 0, title, imgURL)).to.be.revertedWithCustomError(nft, "NFTMarketplace__PriceCannotBeZero");
        });

        it("reverts if listing prices dont match", async () => {
          const incorrectListingPrice = ethers.parseEther("0.0011");
          await expect(nft.createToken(tokenURI, price, title, imgURL, { value: incorrectListingPrice })).to.be.revertedWithCustomError(
            nft,
            "NFTMarketplace__ListingPriceNotEqual"
          );
        });

        it("increments the tokenId", async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          const fetchedTokenCount = await nft.getTokenId();
          assert.equal(fetchedTokenCount, 1);
        });

        it("checks if token uri is set", async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          const fetchedTokenURI = await nft.tokenURI(1);
          assert.equal(tokenURI, fetchedTokenURI);
        });

        it("returns tokenId", async () => {
          const createToken = await nft.createToken.staticCall(tokenURI, price, title, imgURL, { value: listingPrice });
          assert.equal(createToken, 1);
        });
      });

      describe("createTokenListed", () => {
        beforeEach(async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
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
          await expect(nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice }))
            .to.emit(nft, "TokenListed")
            .withArgs(tokenID, ownerAddress, sellerAddress, price, soldToken);
        });
      });

      describe("buy NFT", () => {
        let tokenId, newBuyer;
        beforeEach(async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          tokenId = await nft.getTokenId();
          newBuyer = addresses[1];
          await nft.connect(newBuyer).buyNFT(tokenId, { value: price });
        });

        it("reverts when buy price is less then sell price", async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
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

        // it("reverts when listing price transfer fails", async () => {
        //   const mockContract = await deployments.get("MockFail");
        //   const mockFail = await ethers.getContractAt(mockContract.abi, mockContract.address);

        //   // const { deploy } = deployments;
        //   // const mockNFTContract = await deploy("NFTMarketplace", {
        //   //   from: addresses[1].address,
        //   //   args: [listingPrice],
        //   //   log: false,
        //   //   waitConfirmations: 1,
        //   // });
        //   // const mockNFT = await ethers.getContractAt(mockNFTContract.abi, mockNFTContract.address);

        //   mockFail.runner.address = mockContract.address;
        //   console.log(mockFail.runner);

        //   const mockNFTContract = await ethers.getContractFactory("NFTMarketplace", mockContract);
        //   const mockNFT = await mockNFTContract.deploy(listingPrice);
        //   await mockNFT.waitForDeployment();

        //   // await mockNFT.createToken(tokenURI, price, { value: listingPrice });
        //   // await mockNFT.connect(addresses[1]).buyNFT(1, { value: price });

        //   const getOwner = await mockNFT.getOwner();
        //   const getOwnerNFT = await nft.getOwner();
        //   console.log("mockContract.address", mockContract.address);
        //   console.log("getOwner", getOwner);
        //   console.log("getOwnerNFT", getOwnerNFT);
        //   console.log("deployer", deployer);
        // });

        it("emits event after bought", async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          const tokenId2 = await nft.getTokenId();
          await expect(nft.connect(newBuyer).buyNFT(tokenId2, { value: price }))
            .to.emit(nft, "TokenPurchased")
            .withArgs(tokenId2, newBuyer, price);
        });
      });

      describe("fetchNFTs", () => {
        it("check if receive all NFTs user purchased", async () => {
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          await nft.createToken(tokenURI, price, title, imgURL, { value: listingPrice });

          const buyer1TokenIds = [];
          // Buys first NFT
          const tokenId1 = 1;
          const buyer1 = addresses[1];
          await nft.connect(buyer1).buyNFT(tokenId1, { value: price });
          buyer1TokenIds.push(tokenId1);

          // Other user buys second NFT
          const tokenId2 = 2;
          const buyer2 = addresses[2];
          await nft.connect(buyer2).buyNFT(tokenId2, { value: price });

          // Buyer 1 buys 3rd NFT
          const tokenId3 = 3;
          await nft.connect(buyer1).buyNFT(tokenId3, { value: price });
          buyer1TokenIds.push(tokenId3);

          const myNFTs = await nft.connect(buyer1).fetchMyNFTs();

          assert.equal(myNFTs.length, 2);
          for (let index = 0; index < myNFTs.length; index++) {
            assert.equal(buyer1TokenIds[index], myNFTs[index].tokenId);
          }
        });

        it("check if receive all listed NFTs", async () => {
          const buyer1 = addresses[1];
          const buyer2 = addresses[2];
          await nft.connect(buyer1).createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          await nft.connect(buyer2).createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          await nft.connect(buyer2).createToken(tokenURI, price, title, imgURL, { value: listingPrice });

          const allNFTs = await nft.fetchListedNFTs();

          assert.equal(allNFTs.length, 3);
          for (let index = 0; index < allNFTs.length; index++) {
            assert.equal(allNFTs[index].tokenId, index + 1);
          }
        });

        it("check if receive all unsold NFTs by a user", async () => {
          const buyer1 = addresses[1];
          const buyer2 = addresses[2];
          await nft.connect(buyer1).createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          await nft.connect(buyer1).createToken(tokenURI, price, title, imgURL, { value: listingPrice });
          await nft.connect(buyer1).createToken(tokenURI, price, title, imgURL, { value: listingPrice });

          await nft.connect(buyer2).buyNFT(1, { value: price });
          await nft.connect(buyer2).buyNFT(3, { value: price });

          const unsoldNFTs = await nft.connect(buyer1).fetchUserUnsoldNFTs();

          assert.equal(unsoldNFTs.length, 1);
          assert.equal(unsoldNFTs[0].tokenId, 2);

          const unsoldNFTsByByer2 = await nft.connect(buyer2).fetchUserUnsoldNFTs();
          assert.equal(unsoldNFTsByByer2, 0);
        });
      });

      describe("setter fucntion", () => {
        it("change listing price", async () => {
          const newlistingPrice = ethers.parseEther("0.05");
          await nft.setListingPrice(newlistingPrice);
          const latestListingPrice = await nft.getListingPrice();
          assert.equal(newlistingPrice, latestListingPrice);
        });

        it("reverts if non owner tries to set listing price", async () => {
          const newUser = addresses[1];
          const newlistingPrice = ethers.parseEther("0.05");
          await expect(nft.connect(newUser).setListingPrice(newlistingPrice)).to.be.revertedWithCustomError(nft, "NFTMarketplace__NotOwner");
        });
      });
    });
