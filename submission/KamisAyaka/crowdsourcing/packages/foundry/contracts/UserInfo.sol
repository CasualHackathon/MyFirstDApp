// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title User Info
 * @notice 存储和管理众包平台用户信息的合约
 * @dev 使用mapping将钱包地址映射到用户个人信息
 */
contract UserInfo {
    /**
     * @notice 众包平台用户信息结构体
     * @dev 定义了众包平台用户的信息字段
     */
    struct UserProfile {
        uint256 registeredAt; // 注册时间
        bool exists; // 用户是否存在
        address wallet; // 用户钱包地址
        string name; // 用户姓名
        string email; // 用户邮箱
        string bio; // 用户简介/个人传记
        string website; // 用户网站
        string[] skills; // 用户技能列表
    }

    // 用户信息映射 - 钱包地址到用户信息
    mapping(address => UserProfile) private _userProfiles;

    // 用户总数统计
    uint256 public userCount;

    // 用户注册事件
    event UserRegistered(address indexed user, string name);

    // 用户信息更新事件
    event UserProfileUpdated(address indexed user);

    /**
     * @notice 用户注册函数
     * @param name 用户姓名
     * @param email 用户邮箱
     * @param bio 用户简介
     * @param website 用户网站
     * @param skills 用户技能列表
     */
    function registerUser(
        string memory name,
        string memory email,
        string memory bio,
        string memory website,
        string[] memory skills
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!_userProfiles[msg.sender].exists, "User already registered");

        UserProfile storage newUser = _userProfiles[msg.sender];
        newUser.name = name;
        newUser.email = email;
        newUser.bio = bio;
        newUser.website = website;
        newUser.skills = skills;
        newUser.registeredAt = block.timestamp;
        newUser.exists = true;
        newUser.wallet = msg.sender;

        userCount++;
        emit UserRegistered(msg.sender, name);
    }

    /**
     * @notice 更新用户基本信息
     * @param name 用户姓名
     * @param email 用户邮箱
     * @param bio 用户简介
     * @param website 用户网站
     */
    function updateUserProfile(string memory name, string memory email, string memory bio, string memory website)
        external
    {
        require(_userProfiles[msg.sender].exists, "User not registered");
        require(msg.sender == _userProfiles[msg.sender].wallet, "Unauthorized");
        require(bytes(name).length > 0, "Name cannot be empty");

        UserProfile storage user = _userProfiles[msg.sender];
        user.name = name;
        user.email = email;
        user.bio = bio;
        user.website = website;

        emit UserProfileUpdated(msg.sender);
    }

    /**
     * @notice 更新用户技能
     * @param skills 用户技能列表
     */
    function updateUserSkills(string[] memory skills) external {
        require(_userProfiles[msg.sender].exists, "User not registered");
        require(msg.sender == _userProfiles[msg.sender].wallet, "Unauthorized");

        _userProfiles[msg.sender].skills = skills;

        emit UserProfileUpdated(msg.sender);
    }

    /**
     * @notice 根据地址获取用户信息
     * @param userAddress 用户地址
     * @return UserProfile 用户信息结构体
     */
    function getUserProfile(address userAddress) external view returns (UserProfile memory) {
        return _userProfiles[userAddress];
    }

    /**
     * @notice 检查用户是否已注册
     * @param userAddress 用户地址
     * @return bool 用户是否存在
     */
    function isUserRegistered(address userAddress) external view returns (bool) {
        return _userProfiles[userAddress].exists;
    }

    /**
     * @notice 获取当前用户信息
     * @return UserProfile 用户信息结构体
     */
    function getMyProfile() external view returns (UserProfile memory) {
        return _userProfiles[msg.sender];
    }

    /**
     * @notice 获取用户技能列表
     * @param userAddress 用户地址
     * @return string[] 用户技能列表
     */
    function getUserSkills(address userAddress) external view returns (string[] memory) {
        return _userProfiles[userAddress].skills;
    }
}
