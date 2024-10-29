// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

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

    constructor() ERC721("NFTMarketplace", "NFT") {
        i_owner = payable(msg.sender);
    }

    // Getter functions
    function getOwner() external view returns (address) {
        return i_owner;
    }
}
