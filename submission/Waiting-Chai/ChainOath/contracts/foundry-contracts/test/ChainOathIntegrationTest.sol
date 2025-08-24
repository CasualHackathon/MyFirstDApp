// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ChainOathSecure.sol";
import "../src/ChainOathNFT.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ChainOath集成测试
 * @dev 测试ChainOathSecure和ChainOathNFT合约的协同工作
 * 涵盖完整的用户旅程和成就系统
 */
contract ChainOathIntegrationTest is Test {
    ChainOathSecure public oathContract;
    ChainOathNFT public nftContract;
    TestToken public token;
    
    address public owner = address(0x1);
    address public creater = address(0x2);
    address public committer = address(0x3);
    address public user1 = address(0x4);
    address public user2 = address(0x5);
    
    uint256 public constant STAKE_AMOUNT = 1000 * 10**18;
    uint256 public constant DEADLINE_DURATION = 7 days;
    
    event OathCreated(uint256 indexed oathId, address indexed creater, address indexed committer);
    event OathEvaluated(uint256 indexed oathId, bool isCompleted, address evaluator);
    event AchievementMinted(address indexed user, ChainOathNFT.AchievementType indexed achievementType, uint256 indexed tokenId);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // 部署测试代币
        token = new TestToken();
        
        // 部署NFT合约
        nftContract = new ChainOathNFT();
        
        // 部署主合约
        oathContract = new ChainOathSecure();
        
        // 设置NFT合约的主合约地址
        nftContract.setOathContract(address(oathContract));
        
        // 设置主合约的NFT合约地址
        oathContract.setNFTContract(address(nftContract));
        
        vm.stopPrank();
        
        // 为测试用户分配代币
        _distributeTokens();
    }
    
    /**
     * 场景1: 创建第一个誓约，获得First Oath成就
     * 验证: 用户创建誓约后立即获得FIRST_OATH NFT
     */
    function testScenario1_FirstOathAchievement() public {
        console.log("=== Scenario 1: Create first oath and get First Oath achievement ===");
        
        // 1. Verify user initial state
        assertEq(nftContract.balanceOf(creater), 0, "User should have no NFT initially");
        assertFalse(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.FIRST_OATH), "User should not have First Oath achievement initially");
        
        // 2. Create first oath
        vm.startPrank(creater);
        token.approve(address(oathContract), STAKE_AMOUNT);
        
        string[] memory checkpoints = new string[](2);
        checkpoints[0] = "Complete project design";
        checkpoints[1] = "Submit final code";
        
        vm.expectEmit(true, true, true, false);
        emit OathCreated(0, creater, committer);
        
        uint256 oathId = oathContract.createOath(
            "My First Blockchain Project",
            "Promise to complete DeFi project development within a week",
            committer,
            address(token),
            STAKE_AMOUNT,
            block.timestamp + DEADLINE_DURATION,
            checkpoints
        );
        vm.stopPrank();
        
        // 3. Verify oath creation success
        assertEq(oathId, 0, "Should create first oath");
        assertEq(oathContract.oathCounter(), 1, "Total oath count should be 1");
        
        // 4. Verify First Oath achievement obtained
        assertEq(nftContract.balanceOf(creater), 2, "User should get 2 NFTs (FIRST_OATH + EARLY_ADOPTER)");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.FIRST_OATH), "User should get First Oath achievement");
        
        // 5. Verify NFT metadata
        uint256[] memory userTokens = nftContract.getUserTokens(creater);
        assertTrue(userTokens.length > 0, "User should have tokens");
        string memory tokenURI = nftContract.tokenURI(userTokens[0]);
        assertTrue(bytes(tokenURI).length > 0, "NFT should have metadata");
        
        console.log("Scenario 1 completed: User successfully created first oath and got First Oath achievement");
    }
    
    /**
     * 场景2: 完成多个誓约，获得Oath Keeper成就
     * 验证: 用户完成2个誓约后获得OATH_KEEPER NFT
     */
    function testScenario2_OathKeeperAchievement() public {
        console.log("=== Scenario 2: Complete multiple oaths and get Oath Keeper achievement ===");
        
        // 1. Create and complete first oath
        _createAndCompleteOath(creater, committer, "First Oath", true);
        
        // Verify First Oath achievement
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.FIRST_OATH));
        assertFalse(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.OATH_KEEPER));
        
        // 2. Create and complete second oath
        _createAndCompleteOath(creater, committer, "Second Oath", true);
        
        // 3. Verify Oath Keeper achievement obtained
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.OATH_KEEPER), "User should get Oath Keeper achievement");
        assertTrue(nftContract.balanceOf(creater) >= 2, "User should have at least 2 NFTs");
        
        // 4. Verify user statistics
        (uint256 totalOaths, uint256 completedOaths, uint256 totalUpvotes) = oathContract.getUserStats(creater);
        assertEq(totalOaths, 2, "Total oaths should be 2");
        assertEq(completedOaths, 2, "Completed oaths should be 2");
        // Success rate = completedOaths * 100 / totalOaths
        uint256 successRate = totalOaths > 0 ? (completedOaths * 100) / totalOaths : 0;
        assertEq(successRate, 100, "Success rate should be 100%");
        
        console.log("Scenario 2 completed: User completed 2 oaths and got Oath Keeper achievement");
    }
    
    /**
     * 场景3: 获得社区认可，解锁Trusted Creater成就
     * 验证: 用户的誓约获得2个赞后获得TRUSTED_CREATER NFT
     */
    function testScenario3_TrustedCreaterAchievement() public {
        console.log("=== Scenario 3: Get community recognition and unlock Trusted Creater achievement ===");
        
        // 1. Create oath
        uint256 oathId = _createTestOath(creater, committer, "Community Project Oath");
        
        // 2. Different users like the oath
        vm.prank(user1);
        oathContract.likeOath(oathId);
        
        vm.prank(user2);
        oathContract.likeOath(oathId);
        
        // 3. Verify like count
        ChainOathSecure.Oath memory oathWithLikes = oathContract.getOath(oathId);
        assertEq(oathWithLikes.upvotes, 2, "Oath should have 2 likes");
        
        // 4. Verify Trusted Creater achievement obtained
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.TRUSTED_CREATER), "User should get Trusted Creater achievement");
        
        console.log("Scenario 3 completed: User got community recognition and unlocked Trusted Creater achievement");
    }
    
    /**
     * 场景4: 社交达人，解锁Community Star成就
     * 验证: 用户点赞5次后获得COMMUNITY_STAR NFT
     */
    function testScenario4_CommunityStarAchievement() public {
        console.log("=== Scenario 4: Social expert, unlock Community Star achievement ===");
        
        // 1. Create 5 different oaths for users to like
        uint256[] memory oathIds = new uint256[](5);
        for (uint i = 0; i < 5; i++) {
            address tempCreater = address(uint160(0x100 + i));
            address tempCommitter = address(uint160(0x200 + i));
            
            // Allocate tokens to temporary creater
            vm.prank(owner);
            token.transfer(tempCreater, STAKE_AMOUNT);
            
            oathIds[i] = _createTestOath(tempCreater, tempCommitter, string(abi.encodePacked("Oath", vm.toString(i + 1))));
        }
        
        // 2. user1 likes all oaths
        vm.startPrank(user1);
        for (uint i = 0; i < 5; i++) {
            oathContract.likeOath(oathIds[i]);
        }
        vm.stopPrank();
        
        // 3. Verify Community Star achievement obtained
        assertTrue(nftContract.hasAchievement(user1, ChainOathNFT.AchievementType.COMMUNITY_STAR), "User should get Community Star achievement");
        
        console.log("Scenario 4 completed: User became social expert and unlocked Community Star achievement");
    }
    
    /**
     * 场景5: 里程碑大师，解锁Milestone Master成就
     * 验证: 用户完成5个誓约后获得MILESTONE_MASTER NFT
     */
    function testScenario5_MilestoneMasterAchievement() public {
        console.log("=== Scenario 5: Milestone master, unlock Milestone Master achievement ===");
        
        // 1. Create and complete 5 oaths
        for (uint i = 0; i < 5; i++) {
            _createAndCompleteOath(creater, committer, string(abi.encodePacked("Milestone Oath", vm.toString(i + 1))), true);
        }
        
        // 2. Verify all related achievements
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.FIRST_OATH), "Should have First Oath achievement");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.OATH_KEEPER), "Should have Oath Keeper achievement");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.MILESTONE_MASTER), "Should have Milestone Master achievement");
        
        // 3. Verify user statistics
        (uint256 totalOaths, uint256 completedOaths, uint256 totalUpvotes) = oathContract.getUserStats(creater);
        assertEq(totalOaths, 5, "Total oaths should be 5");
        assertEq(completedOaths, 5, "Completed oaths should be 5");
        // Success rate = completedOaths * 100 / totalOaths
        uint256 successRate = totalOaths > 0 ? (completedOaths * 100) / totalOaths : 0;
        assertEq(successRate, 100, "Success rate should be 100%");
        
        console.log("Scenario 5 completed: User became milestone master and unlocked Milestone Master achievement");
    }
    
    /**
     * 场景6: 早期采用者，解锁Early Adopter成就
     * 验证: 在合约部署24小时内创建誓约的用户获得EARLY_ADOPTER NFT
     */
    function testScenario6_EarlyAdopterAchievement() public {
        console.log("=== Scenario 6: Early adopter, unlock Early Adopter achievement ===");
        
        // 1. Verify current time is within 24 hours (test environment default satisfies)
        assertTrue(block.timestamp <= nftContract.deployTime() + 24 hours, "Should be within 24 hours after deployment");
        
        // 2. Create oath
        uint256 oathId = _createTestOath(user1, user2, "Early Adopter Oath");
        
        // 3. Verify Early Adopter achievement obtained
        assertTrue(nftContract.hasAchievement(user1, ChainOathNFT.AchievementType.EARLY_ADOPTER), "User should get Early Adopter achievement");
        assertTrue(nftContract.hasAchievement(user1, ChainOathNFT.AchievementType.FIRST_OATH), "User should also get First Oath achievement");
        
        console.log("Scenario 6 completed: User became early adopter and unlocked Early Adopter achievement");
    }
    
    /**
     * 场景7: 誓约失败处理
     * 验证: 誓约失败时的资金处理和统计更新
     */
    function testScenario7_OathFailureHandling() public {
        console.log("=== Scenario 7: Oath failure handling ===");
        
        // 1. Create oath
        uint256 oathId = _createTestOath(creater, committer, "Potentially Failed Oath");
        
        // 2. Record initial balances
        uint256 createrInitialBalance = token.balanceOf(creater);
        uint256 committerInitialBalance = token.balanceOf(committer);
        
        // 3. Submit failure assessment
        vm.prank(creater);
        vm.expectEmit(true, false, false, false);
        emit OathEvaluated(oathId, false, creater);
        oathContract.evaluateCompletion(oathId, false, "Project failed to complete on time");
        
        // 4. Verify fund allocation (creater gets refund on failure)
        assertEq(token.balanceOf(creater), createrInitialBalance + STAKE_AMOUNT, "Creater gets refund");
        assertEq(token.balanceOf(committer), committerInitialBalance, "Committer balance unchanged");
        
        // 5. Verify statistics update
        (uint256 totalOaths, uint256 completedOaths, uint256 totalUpvotes) = oathContract.getUserStats(creater);
        assertEq(totalOaths, 1, "Total oaths should be 1");
        assertEq(completedOaths, 0, "Completed oaths should be 0 (failed)");
        // Success rate = completedOaths * 100 / totalOaths
        uint256 successRate = totalOaths > 0 ? (completedOaths * 100) / totalOaths : 0;
        assertEq(successRate, 0, "Success rate should be 0%");
        
        console.log("Scenario 7 completed: Oath failure handling correct");
    }
    
    /**
     * 场景8: 社交功能综合测试
     * 验证: 点赞、评论、排行榜功能
     */
    function testScenario8_SocialFeatures() public {
        console.log("=== Scenario 8: Social features comprehensive test ===");
        
        // 1. Create oath
        uint256 oathId = _createTestOath(creater, committer, "Social Features Test Oath");
        
        // 2. Multiple users like
        vm.prank(user1);
        oathContract.likeOath(oathId);
        
        vm.prank(user2);
        oathContract.likeOath(oathId);
        
        // 3. Add comments
        vm.prank(user1);
        oathContract.addComment(oathId, "This project looks promising!");
        
        vm.prank(user2);
        oathContract.addComment(oathId, "Looking forward to the final results");
        
        // 4. Verify social data
        ChainOathSecure.Oath memory oathAfterSocial = oathContract.getOath(oathId);
        ChainOathSecure.Comment[] memory comments = oathContract.getOathComments(oathId);
        assertEq(oathAfterSocial.upvotes, 2, "Should have 2 likes");
        assertEq(comments.length, 2, "Should have 2 comments");
        
        // 5. Verify users cannot like twice
        vm.prank(user1);
        vm.expectRevert("Already liked");
        oathContract.likeOath(oathId);
        
        console.log("Scenario 8 completed: Social features working properly");
    }
    
    /**
     * 场景9: 权限控制测试
     * 验证: 只有相关角色才能执行特定操作
     */
    function testScenario9_AccessControl() public {
        console.log("=== Scenario 9: Access control test ===");
        
        // 1. Create oath
        uint256 oathId = _createTestOath(creater, committer, "Access Control Test Oath");
        
        // 2. Verify non-creater cannot evaluate completion
        vm.prank(user1);
        vm.expectRevert("Only creater can evaluate");
        oathContract.evaluateCompletion(oathId, true, "Attempting illegal evaluation");
        
        // 3. Verify non-owner cannot pause contract
        vm.prank(user1);
        vm.expectRevert();
        oathContract.emergencyPause();
        
        // 4. Verify creater and committer cannot be the same
        vm.startPrank(creater);
        token.approve(address(oathContract), STAKE_AMOUNT);
        
        string[] memory checkpoints = new string[](1);
        checkpoints[0] = "Test checkpoint";
        
        vm.expectRevert("Creater and committer must be different");
        oathContract.createOath(
            "Illegal Oath",
            "Creater and committer are the same",
            creater, // Error: same as creater
            address(token),
            STAKE_AMOUNT,
            block.timestamp + DEADLINE_DURATION,
            checkpoints
        );
        vm.stopPrank();
        
        console.log("Scenario 9 completed: Access control working properly");
    }
    
    /**
     * Scenario 10: Achievement system integrity test
     * Verify: All achievement types can be unlocked and queried correctly
     */
    function testScenario10_AchievementSystemIntegrity() public {
        console.log("=== Scenario 10: Achievement system integrity test ===");
        
        // 1. Get all achievements
        // First Oath + Early Adopter
        _createTestOath(creater, committer, "First Oath");
        
        // Oath Keeper (requires 2 completed oaths)
        _createAndCompleteOath(creater, user1, "Second Oath", true);
        
        // Trusted Creater (requires 2 likes)
        uint256 oathId = _createTestOath(creater, user2, "Trusted Oath");
        vm.prank(user1);
        oathContract.likeOath(oathId);
        vm.prank(user2);
        oathContract.likeOath(oathId);
        
        // Community Star (requires 5 like actions)
        for (uint i = 0; i < 5; i++) {
            address tempCreater = address(uint160(0x300 + i));
            vm.prank(owner);
            token.transfer(tempCreater, STAKE_AMOUNT);
            uint256 tempOathId = _createTestOath(tempCreater, committer, string(abi.encodePacked("Temp Oath", vm.toString(i))));
            vm.prank(creater);
            oathContract.likeOath(tempOathId);
        }
        
        // Milestone Master (requires 5 completed oaths)
        for (uint i = 0; i < 3; i++) {
            _createAndCompleteOath(creater, user1, string(abi.encodePacked("Milestone Oath", vm.toString(i))), true);
        }
        
        // 2. Verify all achievements are obtained
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.FIRST_OATH), "Should have First Oath");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.EARLY_ADOPTER), "Should have Early Adopter");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.OATH_KEEPER), "Should have Oath Keeper");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.TRUSTED_CREATER), "Should have Trusted Creater");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.COMMUNITY_STAR), "Should have Community Star");
        assertTrue(nftContract.hasAchievement(creater, ChainOathNFT.AchievementType.MILESTONE_MASTER), "Should have Milestone Master");
        
        // 3. Verify NFT count
        assertEq(nftContract.balanceOf(creater), 6, "User should have 6 achievement NFTs");
        
        // 4. Verify achievement query function
        uint256[] memory userTokens = nftContract.getUserTokens(creater);
        assertEq(userTokens.length, 6, "Should have 6 achievement tokens");
        
        console.log("Scenario 10 completed: Achievement system integrity verified");
    }
    
    // ==================== Helper Functions ====================
    
    function _distributeTokens() internal {
        vm.startPrank(owner);
        token.transfer(creater, STAKE_AMOUNT * 10);
        token.transfer(committer, STAKE_AMOUNT * 5);
        token.transfer(user1, STAKE_AMOUNT * 5);
        token.transfer(user2, STAKE_AMOUNT * 5);
        vm.stopPrank();
    }
    
    function _createTestOath(address _creater, address _committer, string memory title) internal returns (uint256) {
        vm.startPrank(_creater);
        token.approve(address(oathContract), STAKE_AMOUNT);
        
        string[] memory checkpoints = new string[](1);
        checkpoints[0] = "Complete test task";
        
        uint256 oathId = oathContract.createOath(
            title,
            "Test oath description",
            _committer,
            address(token),
            STAKE_AMOUNT,
            block.timestamp + DEADLINE_DURATION,
            checkpoints
        );
        vm.stopPrank();
        
        return oathId;
    }
    
    function _createAndCompleteOath(address _creater, address _committer, string memory title, bool success) internal returns (uint256) {
        uint256 oathId = _createTestOath(_creater, _committer, title);
        
        vm.prank(_creater);
        oathContract.evaluateCompletion(oathId, success, success ? "Task completed successfully" : "Task failed");
        
        return oathId;
    }
}

/**
 * @dev Test ERC20 token
 */
contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}