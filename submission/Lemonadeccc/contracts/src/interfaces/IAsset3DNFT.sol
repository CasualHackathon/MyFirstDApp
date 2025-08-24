// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IAsset3DNFT
 * @dev Interface for 3D Asset NFT contract
 */
interface IAsset3DNFT is IERC721 {
    /**
     * @dev 3D Asset metadata structure
     */
    struct Asset3DMetadata {
        string name; // Asset name
        string description; // Asset description
        string meshyTaskId; // Original Meshy task ID
        string modelUrl; // GLB model URL
        string[] textureUrls; // Texture URLs array
        string thumbnailUrl; // Thumbnail image URL
        string videoUrl; // Preview video URL
        uint8 artStyle; // 0: realistic, 1: sculpture
        uint8 mode; // 0: preview, 1: refine
        bool hasTexture; // Whether has custom texture
        uint256 polycount; // Polygon count
        address creator; // Original creator
        uint96 royaltyBps; // Royalty in basis points (max 10000 = 100%)
        uint256 createdAt; // Creation timestamp
    }

    /**
     * @dev Emitted when a new 3D asset is minted
     */
    event Asset3DMinted(uint256 indexed tokenId, address indexed creator, string meshyTaskId, uint8 mode);

    /**
     * @dev Emitted when an asset is upgraded from preview to refine
     */
    event AssetUpgraded(uint256 indexed tokenId, string newModelUrl, uint256 newPolycount);

    /**
     * @dev Emitted when texture is added/updated for an asset
     */
    event TextureUpdated(uint256 indexed tokenId, string[] textureUrls);

    /**
     * @dev Mint a new 3D asset NFT
     * @param to Address to mint the NFT to
     * @param metadata Asset metadata
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, Asset3DMetadata calldata metadata) external returns (uint256 tokenId);

    /**
     * @dev Batch mint multiple 3D assets
     * @param to Address to mint the NFTs to
     * @param metadataArray Array of asset metadata
     * @return tokenIds Array of newly minted token IDs
     */
    function batchMint(address to, Asset3DMetadata[] calldata metadataArray)
        external
        returns (uint256[] memory tokenIds);

    /**
     * @dev Upgrade asset from preview to refine mode
     * @param tokenId Token ID to upgrade
     * @param newModelUrl New refined model URL
     * @param newPolycount New polygon count
     */
    function upgradeAsset(uint256 tokenId, string calldata newModelUrl, uint256 newPolycount) external;

    /**
     * @dev Update texture URLs for an asset
     * @param tokenId Token ID to update
     * @param textureUrls New texture URLs
     */
    function updateTexture(uint256 tokenId, string[] calldata textureUrls) external;

    /**
     * @dev Get asset metadata
     * @param tokenId Token ID
     * @return metadata Asset metadata
     */
    function getAssetMetadata(uint256 tokenId) external view returns (Asset3DMetadata memory metadata);

    /**
     * @dev Get assets by creator
     * @param creator Creator address
     * @return tokenIds Array of token IDs created by the address
     */
    function getAssetsByCreator(address creator) external view returns (uint256[] memory tokenIds);

    /**
     * @dev Check if asset can be upgraded
     * @param tokenId Token ID
     * @return canUpgrade Whether the asset can be upgraded
     */
    function canUpgrade(uint256 tokenId) external view returns (bool canUpgrade);

    /**
     * @dev Get total supply of minted tokens
     * @return Total number of tokens minted
     */
    function totalSupply() external view returns (uint256);

    // Note: royaltyInfo is provided by ERC2981 implementation
}
