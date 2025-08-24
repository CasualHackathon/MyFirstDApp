// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Asset3DNFT} from "../src/Asset3DNFT.sol";
import {IAsset3DNFT} from "../src/interfaces/IAsset3DNFT.sol";

contract Asset3DNFTTest is Test {
    Asset3DNFT public asset3d;
    address public admin;
    address public minter;
    address public user1;
    address public user2;
    address public creator;

    string constant BASE_URI = "https://api.example.com/metadata/";
    string constant NAME = "3D Asset NFT";
    string constant SYMBOL = "3DNFT";

    function setUp() public {
        admin = address(this);
        minter = makeAddr("minter");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        creator = makeAddr("creator");

        // Deploy contract
        asset3d = new Asset3DNFT(NAME, SYMBOL, BASE_URI, admin);

        // Grant minter role
        asset3d.grantRole(asset3d.MINTER_ROLE(), minter);
    }

    function test_ConstructorSetsCorrectValues() public view {
        assertEq(asset3d.name(), NAME);
        assertEq(asset3d.symbol(), SYMBOL);
        assertTrue(asset3d.hasRole(asset3d.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(asset3d.hasRole(asset3d.MINTER_ROLE(), admin));
        assertTrue(asset3d.hasRole(asset3d.MINTER_ROLE(), minter));
    }

    function test_MintSingleAsset() public {
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();

        vm.prank(minter);
        uint256 tokenId = asset3d.mint(user1, metadata);

        assertEq(tokenId, 1);
        assertEq(asset3d.ownerOf(tokenId), user1);
        assertEq(asset3d.totalSupply(), 1);

        // Check metadata
        IAsset3DNFT.Asset3DMetadata memory storedMetadata = asset3d.getAssetMetadata(tokenId);
        assertEq(storedMetadata.name, metadata.name);
        assertEq(storedMetadata.creator, metadata.creator);
        assertEq(storedMetadata.meshyTaskId, metadata.meshyTaskId);
    }

    function test_BatchMint() public {
        IAsset3DNFT.Asset3DMetadata[] memory metadataArray = new IAsset3DNFT.Asset3DMetadata[](3);

        for (uint256 i = 0; i < 3; i++) {
            metadataArray[i] = _createTestMetadata();
            metadataArray[i].meshyTaskId = string(abi.encodePacked("task-", vm.toString(i + 1)));
            metadataArray[i].name = string(abi.encodePacked("Asset ", vm.toString(i + 1)));
        }

        vm.prank(minter);
        uint256[] memory tokenIds = asset3d.batchMint(user1, metadataArray);

        assertEq(tokenIds.length, 3);
        assertEq(asset3d.totalSupply(), 3);

        for (uint256 i = 0; i < 3; i++) {
            assertEq(asset3d.ownerOf(tokenIds[i]), user1);
        }
    }

    function test_UpgradeAsset() public {
        // Mint preview asset
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();
        metadata.mode = 0; // preview mode

        vm.prank(minter);
        uint256 tokenId = asset3d.mint(user1, metadata);

        // Upgrade to refine
        string memory newModelUrl = "https://models.example.com/refined.glb";
        uint256 newPolycount = 20000;

        vm.prank(admin); // Admin has UPGRADER_ROLE
        asset3d.upgradeAsset(tokenId, newModelUrl, newPolycount);

        // Check upgraded metadata
        IAsset3DNFT.Asset3DMetadata memory upgradedMetadata = asset3d.getAssetMetadata(tokenId);
        assertEq(upgradedMetadata.modelUrl, newModelUrl);
        assertEq(upgradedMetadata.polycount, newPolycount);
        assertEq(upgradedMetadata.mode, 1); // refine mode
    }

    function test_UpdateTexture() public {
        // Mint asset
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();

        vm.prank(minter);
        uint256 tokenId = asset3d.mint(user1, metadata);

        // Update texture
        string[] memory newTextures = new string[](2);
        newTextures[0] = "https://textures.example.com/base.png";
        newTextures[1] = "https://textures.example.com/normal.png";

        vm.prank(admin); // Admin has UPGRADER_ROLE
        asset3d.updateTexture(tokenId, newTextures);

        // Check updated metadata
        IAsset3DNFT.Asset3DMetadata memory updatedMetadata = asset3d.getAssetMetadata(tokenId);
        assertEq(updatedMetadata.textureUrls.length, 2);
        assertEq(updatedMetadata.textureUrls[0], newTextures[0]);
        assertTrue(updatedMetadata.hasTexture);
    }

    function test_GetAssetsByCreator() public {
        // Mint multiple assets for the same creator
        for (uint256 i = 0; i < 3; i++) {
            IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();
            metadata.meshyTaskId = string(abi.encodePacked("task-", vm.toString(i + 1)));

            vm.prank(minter);
            asset3d.mint(user1, metadata);
        }

        uint256[] memory creatorAssets = asset3d.getAssetsByCreator(creator);
        assertEq(creatorAssets.length, 3);
    }

    function test_RoyaltyInfo() public {
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();
        metadata.royaltyBps = 1000; // 10%

        vm.prank(minter);
        uint256 tokenId = asset3d.mint(user1, metadata);

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = asset3d.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, creator);
        assertEq(royaltyAmount, 0.1 ether); // 10% of 1 ether
    }

    function test_CanUpgrade() public {
        // Test preview asset (can upgrade)
        IAsset3DNFT.Asset3DMetadata memory previewMetadata = _createTestMetadata();
        previewMetadata.mode = 0; // preview

        vm.prank(minter);
        uint256 previewTokenId = asset3d.mint(user1, previewMetadata);

        assertTrue(asset3d.canUpgrade(previewTokenId));

        // Test refine asset (cannot upgrade)
        IAsset3DNFT.Asset3DMetadata memory refineMetadata = _createTestMetadata();
        refineMetadata.mode = 1; // refine
        refineMetadata.meshyTaskId = "task-refine";

        vm.prank(minter);
        uint256 refineTokenId = asset3d.mint(user1, refineMetadata);

        assertFalse(asset3d.canUpgrade(refineTokenId));
    }

    function test_RevertMintDuplicateMeshyTask() public {
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();

        vm.prank(minter);
        asset3d.mint(user1, metadata);

        // Try to mint same Meshy task ID again
        vm.prank(minter);
        vm.expectRevert("Asset3DNFT: Meshy task already minted");
        asset3d.mint(user2, metadata);
    }

    function test_RevertMintWithoutRole() public {
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();

        vm.prank(user1);
        vm.expectRevert();
        asset3d.mint(user1, metadata);
    }

    function test_RevertUpgradeRefinedAsset() public {
        // Mint refine asset
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();
        metadata.mode = 1; // refine mode

        vm.prank(minter);
        uint256 tokenId = asset3d.mint(user1, metadata);

        // Try to upgrade refine asset
        vm.prank(admin);
        vm.expectRevert("Asset3DNFT: Asset cannot be upgraded");
        asset3d.upgradeAsset(tokenId, "new-url", 20000);
    }

    function test_Pause() public {
        // Pause contract
        vm.prank(admin); // Admin has PAUSER_ROLE
        asset3d.pause();

        // Try to mint while paused
        IAsset3DNFT.Asset3DMetadata memory metadata = _createTestMetadata();

        vm.prank(minter);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        asset3d.mint(user1, metadata);

        // Unpause
        vm.prank(admin);
        asset3d.unpause();

        // Mint should work now
        vm.prank(minter);
        uint256 tokenId = asset3d.mint(user1, metadata);
        assertEq(tokenId, 1);
    }

    function _createTestMetadata() internal view returns (IAsset3DNFT.Asset3DMetadata memory) {
        string[] memory textureUrls = new string[](1);
        textureUrls[0] = "https://textures.example.com/default.png";

        return IAsset3DNFT.Asset3DMetadata({
            name: "Test Asset",
            description: "A test 3D asset",
            meshyTaskId: "test-task-123",
            modelUrl: "https://models.example.com/test.glb",
            textureUrls: textureUrls,
            thumbnailUrl: "https://thumbnails.example.com/test.jpg",
            videoUrl: "https://videos.example.com/test.mp4",
            artStyle: 0, // realistic
            mode: 0, // preview
            hasTexture: true,
            polycount: 5000,
            creator: creator,
            royaltyBps: 500, // 5%
            createdAt: block.timestamp
        });
    }
}
