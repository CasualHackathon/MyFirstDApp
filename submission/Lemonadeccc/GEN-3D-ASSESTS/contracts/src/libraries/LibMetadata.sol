// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAsset3DNFT} from "../interfaces/IAsset3DNFT.sol";

/**
 * @title LibMetadata
 * @dev Library for handling 3D asset metadata operations
 */
library LibMetadata {
    /**
     * @dev Validates asset metadata
     * @param metadata Metadata to validate
     */
    function validateMetadata(IAsset3DNFT.Asset3DMetadata calldata metadata) internal pure {
        require(bytes(metadata.name).length > 0, "LibMetadata: Name cannot be empty");
        require(bytes(metadata.modelUrl).length > 0, "LibMetadata: Model URL cannot be empty");
        require(metadata.creator != address(0), "LibMetadata: Creator cannot be zero address");
        require(metadata.royaltyBps <= 10000, "LibMetadata: Royalty cannot exceed 100%");
        require(metadata.artStyle <= 1, "LibMetadata: Invalid art style");
        require(metadata.mode <= 1, "LibMetadata: Invalid mode");
        require(metadata.polycount > 0, "LibMetadata: Polycount must be positive");
    }

    /**
     * @dev Generates token URI from metadata
     * @param tokenId Token ID
     * @param baseUri Base URI for metadata
     * @return uri Complete token URI
     */
    function generateTokenUri(uint256 tokenId, IAsset3DNFT.Asset3DMetadata memory, /* metadata */ string memory baseUri)
        internal
        pure
        returns (string memory uri)
    {
        // For now, return baseUri + tokenId
        // In production, this could generate full JSON metadata
        return string(abi.encodePacked(baseUri, _toString(tokenId)));
    }

    /**
     * @dev Calculates royalty amount
     * @param salePrice Sale price
     * @param royaltyBps Royalty in basis points
     * @return royaltyAmount Calculated royalty amount
     */
    function calculateRoyalty(uint256 salePrice, uint96 royaltyBps) internal pure returns (uint256 royaltyAmount) {
        return (salePrice * royaltyBps) / 10000;
    }

    /**
     * @dev Converts uint256 to string
     * @param value Value to convert
     * @return String representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Checks if an asset can be upgraded
     * @param metadata Asset metadata
     * @return canUpgrade Whether the asset can be upgraded
     */
    function canUpgradeAsset(IAsset3DNFT.Asset3DMetadata memory metadata) internal pure returns (bool canUpgrade) {
        // Only preview mode assets can be upgraded to refine
        return metadata.mode == 0; // 0 = preview
    }

    /**
     * @dev Creates upgrade metadata
     * @param originalMetadata Original asset metadata
     * @param newModelUrl New model URL
     * @param newPolycount New polygon count
     * @return upgradedMetadata Updated metadata
     */
    function createUpgradeMetadata(
        IAsset3DNFT.Asset3DMetadata memory originalMetadata,
        string calldata newModelUrl,
        uint256 newPolycount
    ) internal pure returns (IAsset3DNFT.Asset3DMetadata memory upgradedMetadata) {
        upgradedMetadata = originalMetadata;
        upgradedMetadata.modelUrl = newModelUrl;
        upgradedMetadata.polycount = newPolycount;
        upgradedMetadata.mode = 1; // Set to refine mode

        return upgradedMetadata;
    }
}
