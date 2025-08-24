// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ChainOath 成就NFT合约
 * @dev 实现ERC-721标准的成就系统，支持测试友好的低难度阈值
 */
contract ChainOathNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    // 成就类型枚举
    enum AchievementType {
        FIRST_OATH,      // 首次誓约 - 创建第一个誓约
        OATH_KEEPER,     // 守约达人 - 完成1个誓约（测试：原5个）
        TRUSTED_CREATER, // 信任创建者 - 创建的誓约获得2个点赞（测试：原20个）
        COMMUNITY_STAR,  // 社区之星 - 获得总计3个点赞（测试：原50个）
        MILESTONE_MASTER,// 里程碑大师 - 创建2个誓约（测试：原10个）
        EARLY_ADOPTER    // 早期采用者 - 在合约部署后24小时内创建誓约
    }
    
    // 成就信息结构体
    struct Achievement {
        AchievementType achievementType;
        string name;
        string description;
        string imageURI;
        uint256 mintTime;
        bool isActive;
    }
    
    // 状态变量
    uint256 public tokenCounter;
    address public oathContract;
    uint256 public deployTime;
    
    // 成就阈值映射（测试友好的低难度设置）
    mapping(AchievementType => uint256) public achievementThresholds;
    
    // 存储映射
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(AchievementType => bool)) public userAchievements;
    mapping(address => uint256[]) public userTokens;
    mapping(address => uint256) public userLikeCount;  // 用户点赞次数
    
    // 基础URI
    string private _baseTokenURI;
    
    // 事件定义
    event AchievementMinted(address indexed user, AchievementType indexed achievementType, uint256 indexed tokenId);
    event OathContractSet(address indexed oathContract);
    event BaseURIUpdated(string newBaseURI);
    
    constructor() ERC721("ChainOath Achievement", "COA") Ownable(msg.sender) {
        tokenCounter = 0;
        deployTime = block.timestamp;
        
        // 初始化测试友好的成就阈值
        achievementThresholds[AchievementType.FIRST_OATH] = 1;
        achievementThresholds[AchievementType.OATH_KEEPER] = 2;      // 测试：完成2个誓约
        achievementThresholds[AchievementType.TRUSTED_CREATER] = 2;  // 测试：获得2个点赞
        achievementThresholds[AchievementType.COMMUNITY_STAR] = 5;   // 测试：点赞5次
        achievementThresholds[AchievementType.MILESTONE_MASTER] = 5; // 测试：完成5个誓约
        achievementThresholds[AchievementType.EARLY_ADOPTER] = 1;
        
        // 设置默认基础URI
        _baseTokenURI = "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=";
    }
    
    /**
     * @dev 设置誓约合约地址
     */
    function setOathContract(address _oathContract) external onlyOwner {
        require(_oathContract != address(0), "Invalid oath contract address");
        oathContract = _oathContract;
        emit OathContractSet(_oathContract);
    }
    
    /**
     * @dev 设置基础URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev 更新成就阈值（仅限管理员）
     */
    function updateAchievementThreshold(AchievementType achievementType, uint256 threshold) external onlyOwner {
        achievementThresholds[achievementType] = threshold;
    }
    
    /**
     * @dev 检查并铸造成就NFT（由誓约合约调用）
     */
    function checkAndMintAchievements(address user) external {
        require(msg.sender == oathContract, "Only oath contract can call this function");
        
        // 获取用户统计数据
        (uint256 createdOaths, uint256 completedOaths, uint256 totalUpvotes) = _getUserStats(user);
        
        // 检查各种成就
        _checkFirstOath(user, createdOaths);
        _checkOathKeeper(user, completedOaths);
        _checkTrustedCreater(user, totalUpvotes);
        _checkCommunitystar(user, totalUpvotes);
        _checkMilestoneMaster(user, createdOaths);
        _checkEarlyAdopter(user, createdOaths);
    }
    
    /**
     * @dev 手动检查成就（用户可调用）
     */
    function checkMyAchievements() external {
        require(oathContract != address(0), "Oath contract not set");
        
        // 获取用户统计数据
        (uint256 createdOaths, uint256 completedOaths, uint256 totalUpvotes) = _getUserStats(msg.sender);
        
        // 检查各种成就
        _checkFirstOath(msg.sender, createdOaths);
        _checkOathKeeper(msg.sender, completedOaths);
        _checkTrustedCreater(msg.sender, totalUpvotes);
        _checkCommunitystar(msg.sender, totalUpvotes);
        _checkMilestoneMaster(msg.sender, createdOaths);
        _checkEarlyAdopter(msg.sender, createdOaths);
    }
    
    /**
     * @dev 获取用户统计数据（内部函数）
     */
    function _getUserStats(address user) internal view returns (
        uint256 createdOaths,
        uint256 completedOaths,
        uint256 totalUpvotes
    ) {
        if (oathContract == address(0)) {
            return (0, 0, 0);
        }
        
        // 调用誓约合约获取用户统计
        (bool success, bytes memory data) = oathContract.staticcall(
            abi.encodeWithSignature("getUserStats(address)", user)
        );
        
        if (success && data.length >= 96) {
            (createdOaths, completedOaths, totalUpvotes) = abi.decode(data, (uint256, uint256, uint256));
        }
        
        return (createdOaths, completedOaths, totalUpvotes);
    }
    
    /**
     * @dev 检查首次誓约成就
     */
    function _checkFirstOath(address user, uint256 createdOaths) internal {
        if (!userAchievements[user][AchievementType.FIRST_OATH] && 
            createdOaths >= achievementThresholds[AchievementType.FIRST_OATH]) {
            _mintAchievement(user, AchievementType.FIRST_OATH);
        }
    }
    
    /**
     * @dev 检查守约达人成就
     */
    function _checkOathKeeper(address user, uint256 completedOaths) internal {
        if (!userAchievements[user][AchievementType.OATH_KEEPER] && 
            completedOaths >= achievementThresholds[AchievementType.OATH_KEEPER]) {
            _mintAchievement(user, AchievementType.OATH_KEEPER);
        }
    }
    
    /**
     * @dev 检查信任创建者成就
     */
    function _checkTrustedCreater(address user, uint256 totalUpvotes) internal {
        if (!userAchievements[user][AchievementType.TRUSTED_CREATER] && 
            totalUpvotes >= achievementThresholds[AchievementType.TRUSTED_CREATER]) {
            _mintAchievement(user, AchievementType.TRUSTED_CREATER);
        }
    }
    
    /**
     * @dev 检查社区之星成就（基于用户点赞次数）
     */
    function _checkCommunitystar(address user, uint256 totalUpvotes) internal {
        if (!userAchievements[user][AchievementType.COMMUNITY_STAR] && 
            userLikeCount[user] >= achievementThresholds[AchievementType.COMMUNITY_STAR]) {
            _mintAchievement(user, AchievementType.COMMUNITY_STAR);
        }
    }
    
    /**
     * @dev 记录用户点赞行为（由主合约调用）
     */
    function recordUserLike(address user) external {
        require(msg.sender == oathContract, "Only oath contract can call");
        userLikeCount[user]++;
        _checkCommunitystar(user, 0);  // 检查社区之星成就
    }
    
    /**
     * @dev 检查里程碑大师成就
     */
    function _checkMilestoneMaster(address user, uint256 createdOaths) internal {
        if (!userAchievements[user][AchievementType.MILESTONE_MASTER] && 
            createdOaths >= achievementThresholds[AchievementType.MILESTONE_MASTER]) {
            _mintAchievement(user, AchievementType.MILESTONE_MASTER);
        }
    }
    
    /**
     * @dev 检查早期采用者成就
     */
    function _checkEarlyAdopter(address user, uint256 createdOaths) internal {
        if (!userAchievements[user][AchievementType.EARLY_ADOPTER] && 
            createdOaths >= achievementThresholds[AchievementType.EARLY_ADOPTER] &&
            block.timestamp <= deployTime + 24 hours) {
            _mintAchievement(user, AchievementType.EARLY_ADOPTER);
        }
    }
    
    /**
     * @dev 铸造成就NFT（内部函数）
     */
    function _mintAchievement(address user, AchievementType achievementType) internal {
        uint256 tokenId = tokenCounter++;
        
        // 铸造NFT
        _safeMint(user, tokenId);
        
        // 创建成就信息
        Achievement storage achievement = achievements[tokenId];
        achievement.achievementType = achievementType;
        achievement.mintTime = block.timestamp;
        achievement.isActive = true;
        
        // 设置成就名称、描述和图片
        (string memory name, string memory description, string memory imagePrompt) = _getAchievementInfo(achievementType);
        achievement.name = name;
        achievement.description = description;
        achievement.imageURI = _generateImageURI(imagePrompt);
        
        // 设置token URI
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
        
        // 更新用户成就状态
        userAchievements[user][achievementType] = true;
        userTokens[user].push(tokenId);
        
        emit AchievementMinted(user, achievementType, tokenId);
    }
    
    /**
     * @dev 获取成就信息
     */
    function _getAchievementInfo(AchievementType achievementType) internal pure returns (
        string memory name,
        string memory description,
        string memory imagePrompt
    ) {
        if (achievementType == AchievementType.FIRST_OATH) {
            return (
                "First Oath",
                "Created your first oath on ChainOath platform",
                "golden_medal_with_oath_symbol_and_blockchain_elements_digital_art_style&image_size=square_hd"
            );
        } else if (achievementType == AchievementType.OATH_KEEPER) {
            return (
                "Oath Keeper",
                "Successfully completed your first oath commitment",
                "silver_shield_with_checkmark_and_trust_symbols_modern_design&image_size=square_hd"
            );
        } else if (achievementType == AchievementType.TRUSTED_CREATER) {
            return (
                "Trusted Creater",
                "Your oaths have gained community trust and recognition",
                "bronze_star_with_thumbs_up_and_community_elements_vibrant_colors&image_size=square_hd"
            );
        } else if (achievementType == AchievementType.COMMUNITY_STAR) {
            return (
                "Community Star",
                "Achieved high community engagement and popularity",
                "platinum_crown_with_social_network_and_star_elements_luxury_style&image_size=square_hd"
            );
        } else if (achievementType == AchievementType.MILESTONE_MASTER) {
            return (
                "Milestone Master",
                "Reached significant milestones in oath creation",
                "diamond_trophy_with_milestone_markers_and_achievement_symbols_premium_design&image_size=square_hd"
            );
        } else if (achievementType == AchievementType.EARLY_ADOPTER) {
            return (
                "Early Adopter",
                "One of the first users to join the ChainOath platform",
                "vintage_badge_with_early_bird_and_blockchain_pioneer_elements_retro_style&image_size=square_hd"
            );
        }
        
        return ("", "", "");
    }
    
    /**
     * @dev 生成图片URI
     */
    function _generateImageURI(string memory imagePrompt) internal view returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, imagePrompt));
    }
    
    /**
     * @dev 生成token URI（JSON metadata）
     */
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        Achievement storage achievement = achievements[tokenId];
        
        string memory json = string(abi.encodePacked(
            '{',
            '"name": "', achievement.name, '",',
            '"description": "', achievement.description, '",',
            '"image": "', achievement.imageURI, '",',
            '"attributes": [',
            '{"trait_type": "Achievement Type", "value": "', _getAchievementTypeName(achievement.achievementType), '"},',
            '{"trait_type": "Mint Time", "value": ', achievement.mintTime.toString(), '},',
            '{"trait_type": "Rarity", "value": "', _getAchievementRarity(achievement.achievementType), '"}',
            ']',
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @dev 获取成就类型名称
     */
    function _getAchievementTypeName(AchievementType achievementType) internal pure returns (string memory) {
        if (achievementType == AchievementType.FIRST_OATH) return "First Oath";
        if (achievementType == AchievementType.OATH_KEEPER) return "Oath Keeper";
        if (achievementType == AchievementType.TRUSTED_CREATER) return "Trusted Creater";
        if (achievementType == AchievementType.COMMUNITY_STAR) return "Community Star";
        if (achievementType == AchievementType.MILESTONE_MASTER) return "Milestone Master";
        if (achievementType == AchievementType.EARLY_ADOPTER) return "Early Adopter";
        return "Unknown";
    }
    
    /**
     * @dev 获取成就稀有度
     */
    function _getAchievementRarity(AchievementType achievementType) internal pure returns (string memory) {
        if (achievementType == AchievementType.FIRST_OATH) return "Common";
        if (achievementType == AchievementType.OATH_KEEPER) return "Common";
        if (achievementType == AchievementType.TRUSTED_CREATER) return "Uncommon";
        if (achievementType == AchievementType.COMMUNITY_STAR) return "Rare";
        if (achievementType == AchievementType.MILESTONE_MASTER) return "Epic";
        if (achievementType == AchievementType.EARLY_ADOPTER) return "Legendary";
        return "Unknown";
    }
    
    /**
     * @dev Base64编码（简化版本）
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 32)
            
            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr( 6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(        input,  0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            
            mstore(result, encodedLen)
        }
        
        return result;
    }
    
    // ========== 查询函数 ==========
    
    /**
     * @dev 获取用户的所有成就NFT
     */
    function getUserTokens(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    /**
     * @dev 检查用户是否拥有特定成就
     */
    function hasAchievement(address user, AchievementType achievementType) external view returns (bool) {
        return userAchievements[user][achievementType];
    }
    
    /**
     * @dev 获取成就信息
     */
    function getAchievement(uint256 tokenId) external view returns (Achievement memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return achievements[tokenId];
    }
    
    /**
     * @dev 获取用户成就统计
     */
    function getUserAchievementStats(address user) external view returns (
        uint256 totalAchievements,
        bool[] memory achievementStatus
    ) {
        totalAchievements = userTokens[user].length;
        achievementStatus = new bool[](6); // 6种成就类型
        
        for (uint256 i = 0; i < 6; i++) {
            achievementStatus[i] = userAchievements[user][AchievementType(i)];
        }
        
        return (totalAchievements, achievementStatus);
    }
    
    // ========== 重写函数 ==========
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}