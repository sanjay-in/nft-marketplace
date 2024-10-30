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
        uint256 indexed tokenId,
        address indexed owner,
        address indexed seller,
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

    modifier listingPriceMatch() {
        if (msg.value != i_listingPrice) {
            revert NFTMarketplace__ListingPriceNotEqual();
        }
        _;
    }

    constructor(uint256 listingPrice) ERC721("NFTMarketplace", "NFT") {
        i_owner = payable(msg.sender);
        i_listingPrice = listingPrice;
    }

    /**
     * @notice This function mints a token, sets the tokenURI and increments the tokenId
     * Checks if price entered is not zero
     * Checks if listing price is same as declared
     * @param _tokenURI the tokenURI is received from frontend as string
     * @param _price at which the creator wishes to sell the NFT (in ether)
     * @return s_tokenId
     */
    function createToken(
        string memory _tokenURI,
        uint256 _price
    )
        external
        payable
        priceNotZero(_price)
        listingPriceMatch
        returns (uint256)
    {
        s_tokenId++;

        // Mints the NFT to the sender
        _safeMint(msg.sender, s_tokenId);
        _setTokenURI(s_tokenId, _tokenURI);

        createTokenListed(s_tokenId, _price);

        return s_tokenId;
    }

    /**
     * @notice This function is called by createToken function
     * Maps the tokenId with ListedToken, transfers token to contract and emits TokenListed event
     * @param _tokenId incremented token id
     * @param _price price is passed from the user
     */
    function createTokenListed(uint256 _tokenId, uint256 _price) internal {
        s_tokenIdToListedToken[_tokenId] = ListedToken(
            _tokenId,
            payable(address(this)),
            payable(msg.sender),
            _price,
            false
        );
        // Transfers to token to the contract to be listed and lets the contract sell on creator's behalf
        _transfer(msg.sender, address(this), _tokenId);
        emit TokenListed(_tokenId, address(this), msg.sender, _price, false);
    }

    // Getter functions
    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getListingPrice() external view returns (uint256) {
        return i_listingPrice;
    }
}
