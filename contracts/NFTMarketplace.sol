// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Errors
error NFTMarketplace__NotOwner();
error NFTMarketplace__PriceCannotBeZero();
error NFTMarketplace__ListingPriceNotEqual();

contract NFTMarketplace is ERC721URIStorage {
    // Type declaration
    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool sold;
    }

    // State variables
    address payable private immutable i_owner;
    uint256 private immutable i_listingPrice;
    uint256 private s_tokenId;
    uint256 private s_itemSold;
    mapping(uint256 => ListedToken) private s_tokenIdToListedToken;

    //Events
    event TokenListed(
        uint256 tokenId,
        address payable owner,
        address payable seller,
        uint256 price,
        bool sold
    );

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert NFTMarketplace__NotOwner();
        }
        _;
    }

    modifier priceNotZero(uint256 _price) {
        if (_price <= 0) {
            revert NFTMarketplace__PriceCannotBeZero();
        }
        _;
    }

    modifier listingPriceMatch(uint256 _price) {
        if (msg.value != i_listingPrice) {
            revert NFTMarketplace__ListingPriceNotEqual();
        }
        _;
    }

    constructor(uint256 listingPrice) ERC721("NFTMarketplace", "NFT") {
        i_owner = payable(msg.sender);
        i_listingPrice = listingPrice;
    }

    // Getter functions
    function getOwner() external view returns (address) {
        return i_owner;
    }
}
