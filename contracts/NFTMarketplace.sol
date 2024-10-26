// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketplace is ERC721URIStorage {
    address payable private immutable i_owner;

    constructor() ERC721("NFTMarketplace", "NFT") {
        i_owner = payable(msg.sender);
    }
}
