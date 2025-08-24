// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyFirstNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    mapping(address => bool) public hasClaimedFreeNFT;
    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event FreeNFTClaimed(address indexed claimer, uint256 indexed tokenId);

    constructor() ERC721("MyFirstNFT", "MFNFT") Ownable(msg.sender) {}

    function mint(address to) public {
        require(to != address(0), "Cannot mint to zero address");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);
        emit NFTMinted(to, tokenId);
    }

    function claimFreeNFT() public {
        require(!hasClaimedFreeNFT[msg.sender], "Already claimed");
        hasClaimedFreeNFT[msg.sender] = true;
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _addTokenToOwnerEnumeration(msg.sender, tokenId);
        
        emit FreeNFTClaimed(msg.sender, tokenId);
        emit NFTMinted(msg.sender, tokenId);
    }

    function getTokensOwnedBy(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        _removeTokenFromOwnerEnumeration(from, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);
        super.transferFrom(from, to, tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        _ownedTokens[from].pop();
        delete _ownedTokensIndex[tokenId];
    }
}
