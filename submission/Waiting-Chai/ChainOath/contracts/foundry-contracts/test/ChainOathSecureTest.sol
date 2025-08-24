// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ChainOathSecure.sol";
import "../src/ChainOathNFT.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ChainOathSecure 合约测试
 * @dev 测试角色系统、资金管理、社交功能和生命周期管理
 */
contract ChainOathSecureTest is Test {
    ChainOathSecure public oathContract;
    ChainOathNFT public nftContract;
    TestToken public token;
    
    address public owner = address(0x1);
    address public creater = address(0x2);
    address public committer = address(0x3);
    address public user1 = address(0x4);
    address public user2 = address(0x5);
    
    uint256 public constant REWARD_AMOUNT = 1000 * 10**18;
    uint256 public constant DURATION = 7 days;
    
    // 事件定义
    event OathCreated(uint256 indexed oathId, address indexed creater, address indexed committer);
    event OathEvaluated(uint256 indexed oathId, bool isCompleted, address evaluator);
    event OathLiked(uint256 indexed oathId, address indexed user);
    event CommentAdded(uint256 indexed oathId, uint256 indexed commentId, address indexed author);
    event FundsReleased(uint256 indexed oathId, address indexed recipient, uint256 amount);
    
    function setUp() public {
        // 设置测试账户
        vm.startPrank(owner);
        
        // 部署合约
        oathContract = new ChainOathSecure();
        nftContract = new ChainOathNFT();
        token = new TestToken();
        
        // 设置NFT合约地址
        oathContract.setNFTContract(address(nftContract));
        nftContract.setOathContract(address(oathContract));
        
        vm.stopPrank();
        
        // 给测试账户分配代币
        token.mint(creater, 10000 * 10**18);
        token.mint(committer, 10000 * 10**18);
        token.mint(user1, 10000 * 10**18);
        token.mint(user2, 10000 * 10**18);
    }
    
    /**
     * 测试1：合约初始化
     */
    function testInitialization() public {
        assertEq(oathContract.oathCounter(), 0);
        assertEq(oathContract.commentCounter(), 0);
        assertEq(oathContract.nftContract(), address(nftContract));
        assertEq(oathContract.owner(), owner);
    }
    
    /**
     * 测试2：创建誓约 - 基础功能
     */
    function testCreateOath() public {
        string memory title = "Test Oath";
        string memory description = "Test Description";
        string[] memory checkpoints = new string[](2);
        checkpoints[0] = "Checkpoint 1";
        checkpoints[1] = "Checkpoint 2";
        
        // 授权代币
        vm.prank(creater);
        token.approve(address(oathContract), REWARD_AMOUNT);
        
        // 创建誓约
        vm.prank(creater);
        vm.expectEmit(true, true, true, true);
        emit OathCreated(0, creater, committer);
        
        uint256 oathId = oathContract.createOath(
            title,
            description,
            committer,
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
        
        // 验证誓约数据
        ChainOathSecure.Oath memory oath = oathContract.getOath(oathId);
        assertEq(oath.title, title);
        assertEq(oath.description, description);
        assertEq(oath.creater, creater);
        assertEq(oath.committer, committer);
        assertEq(oath.amount, REWARD_AMOUNT);
        assertEq(oath.tokenAddress, address(token));
        assertEq(uint256(oath.completionStatus), uint256(ChainOathSecure.CompletionStatus.PENDING));
        assertEq(oath.upvotes, 0);
        assertEq(oath.checkpoints.length, 2);
        assertTrue(oath.isActive);
        
        // 验证计数器更新
        assertEq(oathContract.oathCounter(), 1);
        
        // 验证用户记录更新
        uint256[] memory createdOaths = oathContract.getUserCreatedOaths(creater);
        assertEq(createdOaths.length, 1);
        assertEq(createdOaths[0], oathId);
        
        uint256[] memory committedOaths = oathContract.getUserCommittedOaths(committer);
        assertEq(committedOaths.length, 1);
        assertEq(committedOaths[0], oathId);
    }
    
    /**
     * 测试3：角色验证 - 创建者和守约人不能是同一人
     */
    function testCreateOathSameAddress() public {
        string memory title = "Test Oath";
        string memory description = "Test Description";
        string[] memory checkpoints = new string[](1);
        checkpoints[0] = "Checkpoint 1";
        
        vm.prank(creater);
        token.approve(address(oathContract), REWARD_AMOUNT);
        
        vm.prank(creater);
        vm.expectRevert("Creater and committer must be different");
        oathContract.createOath(
            title,
            description,
            creater, // 同一个地址
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
    }
    
    /**
     * 测试4：参数验证
     */
    function testCreateOathInvalidParams() public {
        string[] memory checkpoints = new string[](1);
        checkpoints[0] = "Checkpoint 1";
        
        vm.startPrank(creater);
        token.approve(address(oathContract), REWARD_AMOUNT);
        
        // 空标题
        vm.expectRevert("Title cannot be empty");
        oathContract.createOath(
            "",
            "Description",
            committer,
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
        
        // 空描述
        vm.expectRevert("Description cannot be empty");
        oathContract.createOath(
            "Title",
            "",
            committer,
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
        
        // 无效守约人地址
        vm.expectRevert("Invalid committer address");
        oathContract.createOath(
            "Title",
            "Description",
            address(0),
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
        
        // 金额为0
        vm.expectRevert("Amount must be greater than 0");
        oathContract.createOath(
            "Title",
            "Description",
            committer,
            address(token),
            0,
            block.timestamp + DURATION,
            checkpoints
        );
        
        // 过期时间
        vm.expectRevert("Deadline must be in the future");
        oathContract.createOath(
            "Title",
            "Description",
            committer,
            address(token),
            REWARD_AMOUNT,
            block.timestamp - 1,
            checkpoints
        );
        
        vm.stopPrank();
    }
    
    /**
     * 测试5：评估完成 - 成功完成
     */
    function testEvaluateCompletionSuccess() public {
        uint256 oathId = _createTestOath();
        
        // 评估为完成
        vm.prank(creater);
        vm.expectEmit(true, true, true, true);
        emit OathEvaluated(oathId, true, creater);
        
        oathContract.evaluateCompletion(oathId, true, "Well done!");
        
        // 验证状态更新
        ChainOathSecure.Oath memory oath = oathContract.getOath(oathId);
        assertEq(uint256(oath.completionStatus), uint256(ChainOathSecure.CompletionStatus.COMPLETED));
        assertFalse(oath.isActive);
        
        // 验证代币转移到守约人
        assertEq(token.balanceOf(committer), 10000 * 10**18 + REWARD_AMOUNT);
    }
    
    /**
     * 测试6：评估完成 - 未完成
     */
    function testEvaluateCompletionFailed() public {
        uint256 oathId = _createTestOath();
        
        // 评估为未完成
        vm.prank(creater);
        vm.expectEmit(true, true, true, true);
        emit OathEvaluated(oathId, false, creater);
        
        oathContract.evaluateCompletion(oathId, false, "Not completed");
        
        // 验证状态更新
        ChainOathSecure.Oath memory oath = oathContract.getOath(oathId);
        assertEq(uint256(oath.completionStatus), uint256(ChainOathSecure.CompletionStatus.FAILED));
        assertFalse(oath.isActive);
        
        // 验证代币退还给创建者
        assertEq(token.balanceOf(creater), 10000 * 10**18);
    }
    
    /**
     * 测试7：权限验证 - 只有创建者可以评估
     */
    function testEvaluateCompletionOnlyCreater() public {
        uint256 oathId = _createTestOath();
        
        vm.prank(committer);
        vm.expectRevert("Only creater can evaluate");
        oathContract.evaluateCompletion(oathId, true, "Feedback");
    }
    
    /**
     * 测试8：点赞功能
     */
    function testLikeOath() public {
        uint256 oathId = _createTestOath();
        
        // 用户1点赞
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit OathLiked(oathId, user1);
        
        oathContract.likeOath(oathId);
        
        // 验证点赞数量
        ChainOathSecure.Oath memory oath = oathContract.getOath(oathId);
        assertEq(oath.upvotes, 1);
        assertTrue(oathContract.hasUserLiked(oathId, user1));
        
        // 重复点赞应该失败
        vm.prank(user1);
        vm.expectRevert("Already liked");
        oathContract.likeOath(oathId);
    }
    
    /**
     * 测试9：评论功能
     */
    function testAddComment() public {
        uint256 oathId = _createTestOath();
        string memory content = "Great oath!";
        
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit CommentAdded(oathId, 0, user1);
        
        oathContract.addComment(oathId, content);
        
        // 验证评论
        ChainOathSecure.Comment[] memory comments = oathContract.getOathComments(oathId);
        assertEq(comments.length, 1);
        assertEq(comments[0].content, content);
        assertEq(comments[0].author, user1);
        assertEq(comments[0].oathId, oathId);
    }
    
    /**
     * 测试10：过期处理
     */
    function testExpiredOath() public {
        uint256 oathId = _createTestOath();
        
        // 时间快进到过期后
        vm.warp(block.timestamp + DURATION + 1);
        
        vm.prank(creater);
        vm.expectRevert("Oath has expired");
        oathContract.evaluateCompletion(oathId, true, "Too late");
        
        // 处理过期誓约
        vm.prank(creater);
        oathContract.handleExpiredOath(oathId);
        
        // 验证状态
        ChainOathSecure.Oath memory oath = oathContract.getOath(oathId);
        assertEq(uint256(oath.completionStatus), uint256(ChainOathSecure.CompletionStatus.EXPIRED));
        assertFalse(oath.isActive);
    }
    
    /**
     * 测试11：用户统计信息
     */
    function testGetUserStats() public {
        // 创建多个誓约
        uint256 oathId1 = _createTestOath();
        uint256 oathId2 = _createTestOath();
        
        // 完成一个誓约
        vm.prank(creater);
        oathContract.evaluateCompletion(oathId1, true, "Completed");
        
        // 点赞
        vm.prank(user1);
        oathContract.likeOath(oathId1);
        vm.prank(user2);
        oathContract.likeOath(oathId2);
        
        // 检查创建者统计
        (uint256 createdOaths, uint256 completedOaths, uint256 totalUpvotes) = oathContract.getUserStats(creater);
        assertEq(createdOaths, 2);
        assertEq(totalUpvotes, 2);
        
        // 检查守约人统计
        (createdOaths, completedOaths, totalUpvotes) = oathContract.getUserStats(committer);
        assertEq(createdOaths, 0);
        assertEq(completedOaths, 1);
        assertEq(totalUpvotes, 0);
    }
    
    /**
     * 测试12：暂停功能
     */
    function testPauseFunctionality() public {
        vm.prank(owner);
        oathContract.emergencyPause();
        
        string[] memory checkpoints = new string[](1);
        checkpoints[0] = "Checkpoint 1";
        
        vm.prank(creater);
        token.approve(address(oathContract), REWARD_AMOUNT);
        
        vm.prank(creater);
        vm.expectRevert("Pausable: paused");
        oathContract.createOath(
            "Title",
            "Description",
            committer,
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
    }
    
    // ========== 辅助函数 ==========
    
    function _createTestOath() internal returns (uint256) {
        string memory title = "Test Oath";
        string memory description = "Test Description";
        string[] memory checkpoints = new string[](2);
        checkpoints[0] = "Checkpoint 1";
        checkpoints[1] = "Checkpoint 2";
        
        vm.prank(creater);
        token.approve(address(oathContract), REWARD_AMOUNT);
        
        vm.prank(creater);
        return oathContract.createOath(
            title,
            description,
            committer,
            address(token),
            REWARD_AMOUNT,
            block.timestamp + DURATION,
            checkpoints
        );
    }
}

/**
 * @title 测试用ERC20代币
 */
contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}