// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DDToken.sol";

contract DDProject is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    DDToken public ddToken;
    address public factory;
    
    struct ProjectInfo {
        string name;
        address contractAddress;
        string website;
        string github;
        string apiDoc;
        string description;
        string category;
        uint256 createdAt;
        address creator;
        bool isActive;
        uint256 currentVersion;
    }
    
    struct UpdateRecord {
        uint256 versionId;
        uint256 timestamp;
        string name;
        address contractAddress;
        string website;
        string github;
        string apiDoc;
        string description;
        string category;
        address updater;
        uint256 stakeAmount;
        bool isChallenged;
        uint256 challengeDeadline;
        string updateReason;
        bool isVerified;
        bool isRolledBack;
    }
    
    struct Challenge {
        address challenger;
        uint256 stakeAmount;
        string reason;
        uint256 timestamp;
        bool isResolved;
        bool challengerWon;
    }
    
    ProjectInfo public projectInfo;
    mapping(uint256 => UpdateRecord) public updateRecords; // versionId => UpdateRecord
    mapping(uint256 => Challenge) public challenges; // versionId => Challenge
    
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18; // 100 DD
    uint256 public constant BASE_CHALLENGE_PERIOD = 7 days;
    uint256 public constant MAX_CHALLENGE_PERIOD = 30 days;
    uint256 public constant MIN_CHALLENGE_PERIOD = 1 days;
    
    event ProjectInfoUpdated(uint256 indexed versionId, address indexed updater, uint256 stakeAmount);
    event UpdateChallenged(uint256 indexed versionId, address indexed challenger, uint256 stakeAmount);
    event UpdateVerified(uint256 indexed versionId);
    event ChallengeSuccessful(uint256 indexed versionId, address indexed challenger, uint256 stakeAmount);
    event ChallengeFailed(uint256 indexed versionId, address indexed challenger, uint256 stakeAmount);
    event ProjectRollback(uint256 indexed fromVersion, uint256 indexed toVersion);
    event StakeReturned(address indexed user, uint256 amount);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "DDProject: only factory can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "DDProject: admin role required");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "DDProject: operator role required");
        _;
    }
    
    constructor(
        address _ddToken,
        address _factory,
        string memory _name,
        address _contractAddress,
        string memory _website,
        string memory _github,
        string memory _apiDoc,
        string memory _description,
        string memory _category,
        address _creator
    ) {
        ddToken = DDToken(_ddToken);
        factory = _factory;
        
        projectInfo = ProjectInfo({
            name: _name,
            contractAddress: _contractAddress,
            website: _website,
            github: _github,
            apiDoc: _apiDoc,
            description: _description,
            category: _category,
            createdAt: block.timestamp,
            creator: _creator,
            isActive: true,
            currentVersion: 0
        });
        
        _grantRole(DEFAULT_ADMIN_ROLE, _creator);
        _grantRole(ADMIN_ROLE, _creator);
        _grantRole(OPERATOR_ROLE, _creator);
    }
    
    function getProjectInfo() external view returns (ProjectInfo memory) {
        return projectInfo;
    }
    
    function updateProjectInfo(
        string memory _name,
        address _contractAddress,
        string memory _website,
        string memory _github,
        string memory _apiDoc,
        string memory _description,
        string memory _category,
        string memory _updateReason
    ) external payable nonReentrant {
        require(projectInfo.isActive, "Project is inactive");
        require(bytes(_updateReason).length > 0, "Update reason cannot be empty");
        
        // 检查用户是否有足够的质押（ETH 或 DD 代币）
        uint256 userStake = ddToken.getStakedAmount(msg.sender);
        uint256 ethStake = msg.value;
        
        // 用户可以通过 ETH 或 DD 代币进行质押
        require(userStake >= MIN_STAKE_AMOUNT || ethStake >= MIN_STAKE_AMOUNT, "Insufficient stake amount");
        
        // 使用 ETH 质押或 DD 代币质押中的较大值
        uint256 totalStake = userStake > ethStake ? userStake : ethStake;
        
        // 计算动态挑战期（质押越多，挑战期越短）
        uint256 challengePeriod = calculateChallengePeriod(totalStake);
        
        uint256 newVersionId = projectInfo.currentVersion + 1;
        
        updateRecords[newVersionId] = UpdateRecord({
            versionId: newVersionId,
            timestamp: block.timestamp,
            name: _name,
            contractAddress: _contractAddress,
            website: _website,
            github: _github,
            apiDoc: _apiDoc,
            description: _description,
            category: _category,
            updater: msg.sender,
            stakeAmount: totalStake,
            isChallenged: false,
            challengeDeadline: block.timestamp + challengePeriod,
            updateReason: _updateReason,
            isVerified: false,
            isRolledBack: false
        });
        
        projectInfo.currentVersion = newVersionId;
        
        emit ProjectInfoUpdated(newVersionId, msg.sender, totalStake);
    }
    
    function challengeUpdate(
        uint256 _versionId,
        string memory _reason
    ) external payable nonReentrant {
        UpdateRecord storage update = updateRecords[_versionId];
        require(update.versionId > 0, "Update does not exist");
        require(!update.isChallenged, "Update already challenged");
        require(block.timestamp < update.challengeDeadline, "Challenge period expired");
        require(msg.sender != update.updater, "Cannot challenge your own update");
        
        uint256 challengerStake = ddToken.getStakedAmount(msg.sender);
        uint256 ethStake = msg.value;
        
        // 用户可以通过 ETH 或 DD 代币进行质押
        require(challengerStake >= MIN_STAKE_AMOUNT || ethStake >= MIN_STAKE_AMOUNT, "Insufficient stake amount");
        
        // 使用 ETH 质押或 DD 代币质押中的较大值
        uint256 totalStake = challengerStake > ethStake ? challengerStake : ethStake;
        
        update.isChallenged = true;
        
        challenges[_versionId] = Challenge({
            challenger: msg.sender,
            stakeAmount: totalStake,
            reason: _reason,
            timestamp: block.timestamp,
            isResolved: false,
            challengerWon: false
        });
        
        emit UpdateChallenged(_versionId, msg.sender, totalStake);
    }
    
    function resolveChallenge(
        uint256 _versionId,
        bool _challengerWon
    ) external onlyOperator {
        Challenge storage challenge = challenges[_versionId];
        UpdateRecord storage update = updateRecords[_versionId];
        
        require(challenge.isResolved == false, "Challenge already resolved");
        require(update.isChallenged, "Update not challenged");
        
        challenge.isResolved = true;
        challenge.challengerWon = _challengerWon;
        
        if (_challengerWon) {
            // 挑战者获胜，更新被回滚
            update.isRolledBack = true;
            projectInfo.currentVersion = _versionId - 1;
            
            // 转移质押给挑战者
            ddToken.transferStakedTokens(update.updater, challenge.challenger, update.stakeAmount);
            
            emit ChallengeSuccessful(_versionId, challenge.challenger, challenge.stakeAmount);
            emit ProjectRollback(_versionId, _versionId - 1);
        } else {
            // 挑战者失败，更新被验证
            update.isVerified = true;
            
            // 转移质押给更新者
            ddToken.transferStakedTokens(challenge.challenger, update.updater, challenge.stakeAmount);
            
            emit ChallengeFailed(_versionId, challenge.challenger, challenge.stakeAmount);
            emit UpdateVerified(_versionId);
        }
    }
    
    function autoVerifyUpdate(uint256 _versionId) external {
        UpdateRecord storage update = updateRecords[_versionId];
        require(update.versionId > 0, "Update does not exist");
        require(!update.isChallenged, "Update is challenged");
        require(block.timestamp >= update.challengeDeadline, "Challenge period not expired");
        require(!update.isVerified, "Update already verified");
        
        update.isVerified = true;
        emit UpdateVerified(_versionId);
    }
    
    function rollbackToVersion(uint256 _versionId) external onlyAdmin {
        require(_versionId <= projectInfo.currentVersion, "Version does not exist");
        require(_versionId > 0, "Invalid version");
        
        uint256 currentVersion = projectInfo.currentVersion;
        projectInfo.currentVersion = _versionId;
        
        emit ProjectRollback(currentVersion, _versionId);
    }
    
    function calculateChallengePeriod(uint256 _stakeAmount) public view returns (uint256) {
        // 基础挑战期是7天，质押越多，挑战期越短
        // 最小挑战期是1天，最大挑战期是30天
        uint256 reduction = (_stakeAmount - MIN_STAKE_AMOUNT) * (BASE_CHALLENGE_PERIOD - MIN_CHALLENGE_PERIOD) / (ddToken.MAX_STAKE_AMOUNT() - MIN_STAKE_AMOUNT);
        
        if (reduction > BASE_CHALLENGE_PERIOD - MIN_CHALLENGE_PERIOD) {
            reduction = BASE_CHALLENGE_PERIOD - MIN_CHALLENGE_PERIOD;
        }
        
        uint256 challengePeriod = BASE_CHALLENGE_PERIOD - reduction;
        return challengePeriod < MIN_CHALLENGE_PERIOD ? MIN_CHALLENGE_PERIOD : challengePeriod;
    }
    
    function getUpdateRecord(uint256 _versionId) external view returns (UpdateRecord memory) {
        return updateRecords[_versionId];
    }
    
    function getChallenge(uint256 _versionId) external view returns (Challenge memory) {
        return challenges[_versionId];
    }
    
    function getProjectUpdateHistory() external view returns (UpdateRecord[] memory) {
        uint256 currentVersion = projectInfo.currentVersion;
        UpdateRecord[] memory history = new UpdateRecord[](currentVersion);
        
        for (uint256 i = 1; i <= currentVersion; i++) {
            history[i-1] = updateRecords[i];
        }
        
        return history;
    }
    
    function emergencyPause() external onlyAdmin {
        projectInfo.isActive = false;
    }
    
    function emergencyResume() external onlyAdmin {
        projectInfo.isActive = true;
    }
}
