// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MemoryFragments is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    Counters.Counter private _storyIds;
    
    enum QualityLevel { LOW, MEDIUM, HIGH, PREMIUM }
    
    struct MemoryFragment {
        uint256 id;
        address owner;
        string contentHash;
        uint256 timestamp;
        string[] tags;
        bool isPublic;
        uint256 emotionScore;
        string fragmentType;
        uint256 qualityScore;
        uint256 stakeAmount;
        QualityLevel quality;
        uint256 communityVotes;
        uint256 reportCount;
        bool isVerified;
    }
    
    struct MemoryStory {
        uint256 storyId;
        address creator;
        uint256[] fragmentIds;
        string storyHash;
        uint256 mintTimestamp;
        bool isNFTMinted;
        string title;
        uint256 emotionalIntensity;
    }
    
    struct UserReputation {
        uint256 totalSubmissions;
        uint256 verifiedSubmissions;
        uint256 totalReports;
        uint256 reputationScore;
        bool isBanned;
        uint256 bannedUntil;
    }
    
    mapping(uint256 => MemoryFragment) public memoryFragments;
    mapping(uint256 => MemoryStory) public memoryStories;
    mapping(address => UserReputation) public userReputations;
    mapping(address => uint256[]) public userFragments;
    mapping(address => uint256[]) public userStories;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public hasReported;
    
    uint256 public constant MIN_STAKE_AMOUNT = 0.001 ether;
    uint256 public constant MAX_STAKE_AMOUNT = 0.01 ether;
    uint256 public constant QUALITY_THRESHOLD = 70;
    uint256 public constant REPORT_THRESHOLD = 3;
    uint256 public constant MIN_REPUTATION = 100;
    
    uint256 public rewardPool;
    uint256 public qualityBonusPool;
    
    event FragmentUploaded(
        uint256 indexed fragmentId,
        address indexed owner,
        uint256 qualityScore,
        uint256 stakeAmount
    );
    
    event StoryCreated(
        uint256 indexed storyId,
        address indexed creator,
        uint256[] fragmentIds,
        string title
    );
    
    event StoryNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed storyId,
        address indexed creator
    );
    
    event FragmentVerified(uint256 indexed fragmentId, bool isValid);
    event FragmentReported(uint256 indexed fragmentId, address reporter);
    event ReputationUpdated(address indexed user, uint256 newScore);
    
    constructor() ERC721("Memory Fragments", "MEMORY") {
        // 初始化創始人信譽
        userReputations[msg.sender].reputationScore = 1000;
    }
    
    function calculateStakeAmount(uint256 qualityScore) public pure returns (uint256) {
        if (qualityScore >= QUALITY_THRESHOLD) {
            return 0;
        }
        
        uint256 deficit = QUALITY_THRESHOLD - qualityScore;
        uint256 stakeAmount = MIN_STAKE_AMOUNT + (deficit * MIN_STAKE_AMOUNT / 10);
        
        if (stakeAmount > MAX_STAKE_AMOUNT) {
            stakeAmount = MAX_STAKE_AMOUNT;
        }
        
        return stakeAmount;
    }
    
    modifier notBanned(address user) {
        require(!userReputations[user].isBanned || 
                block.timestamp > userReputations[user].bannedUntil, 
                "User is banned");
        _;
    }
    
    function uploadFragment(
        string memory _contentHash,
        string[] memory _tags,
        bool _isPublic,
        uint256 _emotionScore,
        string memory _fragmentType,
        uint256 _qualityScore
    ) public payable nonReentrant notBanned(msg.sender) returns (uint256) {
        
        uint256 requiredStake = calculateStakeAmount(_qualityScore);
        require(msg.value >= requiredStake, "Insufficient stake amount");
        
        _tokenIds.increment();
        uint256 newFragmentId = _tokenIds.current();
        
        QualityLevel quality = QualityLevel.LOW;
        if (_qualityScore >= 90) {
            quality = QualityLevel.PREMIUM;
        } else if (_qualityScore >= 80) {
            quality = QualityLevel.HIGH;
        } else if (_qualityScore >= 60) {
            quality = QualityLevel.MEDIUM;
        }
        
        MemoryFragment memory newFragment = MemoryFragment({
            id: newFragmentId,
            owner: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            tags: _tags,
            isPublic: _isPublic,
            emotionScore: _emotionScore,
            fragmentType: _fragmentType,
            qualityScore: _qualityScore,
            stakeAmount: msg.value,
            quality: quality,
            communityVotes: 0,
            reportCount: 0,
            isVerified: _qualityScore >= QUALITY_THRESHOLD
        });
        
        memoryFragments[newFragmentId] = newFragment;
        userFragments[msg.sender].push(newFragmentId);
        
        _updateUserReputation(msg.sender, true);
        
        if (msg.value > requiredStake) {
            payable(msg.sender).transfer(msg.value - requiredStake);
        }
        
        emit FragmentUploaded(newFragmentId, msg.sender, _qualityScore, requiredStake);
        
        return newFragmentId;
    }
    
    function createStory(
        uint256[] memory _fragmentIds,
        string memory _aiStoryHash,
        string memory _title,
        uint256 _emotionalIntensity
    ) public returns (uint256) {
        for (uint i = 0; i < _fragmentIds.length; i++) {
            require(
                memoryFragments[_fragmentIds[i]].owner == msg.sender,
                "You don't own all fragments"
            );
        }
        
        _storyIds.increment();
        uint256 newStoryId = _storyIds.current();
        
        MemoryStory memory newStory = MemoryStory({
            storyId: newStoryId,
            creator: msg.sender,
            fragmentIds: _fragmentIds,
            storyHash: _aiStoryHash,
            mintTimestamp: block.timestamp,
            isNFTMinted: false,
            title: _title,
            emotionalIntensity: _emotionalIntensity
        });
        
        memoryStories[newStoryId] = newStory;
        userStories[msg.sender].push(newStoryId);
        
        emit StoryCreated(newStoryId, msg.sender, _fragmentIds, _title);
        
        return newStoryId;
    }
    
    function mintStoryNFT(uint256 _storyId) public returns (uint256) {
        require(memoryStories[_storyId].creator == msg.sender, "Not your story");
        require(!memoryStories[_storyId].isNFTMinted, "Already minted");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, memoryStories[_storyId].storyHash);
        
        memoryStories[_storyId].isNFTMinted = true;
        
        emit StoryNFTMinted(newTokenId, _storyId, msg.sender);
        
        return newTokenId;
    }
    
    function _updateUserReputation(address _user, bool _positive) internal {
        UserReputation storage reputation = userReputations[_user];
        
        reputation.totalSubmissions++;
        
        if (_positive) {
            reputation.verifiedSubmissions++;
            if (reputation.reputationScore < 1000) {
                reputation.reputationScore += 10;
            }
        } else {
            reputation.totalReports++;
            if (reputation.reputationScore > 20) {
                reputation.reputationScore -= 20;
            }
        }
        
        emit ReputationUpdated(_user, reputation.reputationScore);
    }
    
    function getUserFragments(address _user) public view returns (uint256[] memory) {
        return userFragments[_user];
    }
    
    function getUserStories(address _user) public view returns (uint256[] memory) {
        return userStories[_user];
    }
    
    function getPublicFragments() public view returns (uint256[] memory) {
        uint256[] memory publicFragments = new uint256[](_tokenIds.current());
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (memoryFragments[i].isPublic && memoryFragments[i].owner != address(0)) {
                publicFragments[counter] = i;
                counter++;
            }
        }
        
        uint256[] memory result = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            result[i] = publicFragments[i];
        }
        
        return result;
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
