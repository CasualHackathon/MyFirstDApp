// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 tokenId;
        address nftContract;
        address seller;
        uint256 price;
        bool active;
    }

    mapping(bytes32 => Listing) public listings;
    mapping(address => mapping(uint256 => bytes32)) public tokenToListingId;
    
    uint256 public marketplaceFee = 250; // 2.5% fee
    uint256 private constant BASIS_POINTS = 10000;
    
    event NFTListed(
        bytes32 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    
    event NFTSold(
        bytes32 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 tokenId,
        uint256 price
    );
    
    event NFTDelisted(
        bytes32 indexed listingId,
        address indexed seller,
        uint256 tokenId
    );

    constructor() Ownable(msg.sender) {}

    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            IERC721(nftContract).getApproved(tokenId) == address(this) ||
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: msg.sender,
            price: price,
            active: true
        });
        
        tokenToListingId[nftContract][tokenId] = listingId;
        
        emit NFTListed(listingId, msg.sender, nftContract, tokenId, price);
    }

    function buyNFT(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        address nftContract = listing.nftContract;
        uint256 tokenId = listing.tokenId;
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Mark as inactive before transfer
        listing.active = false;
        delete tokenToListingId[nftContract][tokenId];
        
        // Calculate fees
        uint256 fee = (price * marketplaceFee) / BASIS_POINTS;
        uint256 sellerAmount = price - fee;
        
        // Transfer NFT
        IERC721(nftContract).transferFrom(seller, msg.sender, tokenId);
        
        // Transfer payments
        payable(seller).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit NFTSold(listingId, msg.sender, seller, tokenId, price);
    }

    function delistNFT(bytes32 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.active = false;
        delete tokenToListingId[listing.nftContract][listing.tokenId];
        
        emit NFTDelisted(listingId, msg.sender, listing.tokenId);
    }

    function updatePrice(bytes32 listingId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than 0");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.price = newPrice;
        
        emit NFTListed(listingId, msg.sender, listing.nftContract, listing.tokenId, newPrice);
    }

    function getListing(bytes32 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getListingByToken(address nftContract, uint256 tokenId) external view returns (bytes32, Listing memory) {
        bytes32 listingId = tokenToListingId[nftContract][tokenId];
        return (listingId, listings[listingId]);
    }

    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = newFee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
