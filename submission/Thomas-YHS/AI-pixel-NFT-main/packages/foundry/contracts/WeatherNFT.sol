//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "forge-std/console.sol";

/**
 * WeatherNFT - 基于实时天气和地理位置生成的独特NFT
 * 每个NFT记录一个"此地此刻"的数字纪念
 * @author AI-Moment-NFT Team
 */
contract WeatherNFT is ERC721, ERC721URIStorage, Ownable {
    
    // 计数器用于生成唯一的tokenId
    uint256 private _tokenIdCounter = 1;
    
    // 存储每个NFT的元数据
    struct WeatherData {
        string city;           // 城市名称
        string date;           // 铸造日期 (YYYY-MM-DD)
        string weather;        // 天气状况
        int256 temperature;    // 温度 (摄氏度)
        string timeOfDay;      // 时间段 (morning/afternoon/evening/night)
        uint256 timestamp;     // 铸造时间戳
        address minter;        // 铸造者地址
    }
    
    // tokenId => WeatherData 映射
    mapping(uint256 => WeatherData) public weatherData;
    
    // 防止重复铸造: address + city + date => bool
    mapping(bytes32 => bool) public mintedCombinations;
    
    // 事件
    event WeatherNFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string city,
        string date,
        string tokenURI
    );
    
    // 自定义错误
    error AlreadyMintedToday();
    error InvalidTokenId();
    error EmptyTokenURI();
    
    constructor(address initialOwner) 
        ERC721("WeatherNFT", "WNFT") 
        Ownable(initialOwner) 
    {}
    
    /**
     * 铸造WeatherNFT
     * @param to 接收者地址
     * @param city 城市名称
     * @param date 日期 (YYYY-MM-DD格式)
     * @param weather 天气状况
     * @param temperature 温度
     * @param timeOfDay 时间段
     * @param _tokenURI IPFS上的metadata URI
     */
    function mintWithURI(
        address to,
        string memory city,
        string memory date,
        string memory weather,
        int256 temperature,
        string memory timeOfDay,
        string memory _tokenURI
    ) public returns (uint256) {
        // 验证tokenURI不为空
        if (bytes(_tokenURI).length == 0) {
            revert EmptyTokenURI();
        }
        
        // 生成防重复铸造的key
        bytes32 mintKey = keccak256(abi.encodePacked(to, city, date));
        
        // 检查是否已经铸造过
        if (mintedCombinations[mintKey]) {
            revert AlreadyMintedToday();
        }
        
        // 标记为已铸造
        mintedCombinations[mintKey] = true;
        
        // 获取当前tokenId并自增
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // 铸造NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // 存储天气数据
        weatherData[tokenId] = WeatherData({
            city: city,
            date: date,
            weather: weather,
            temperature: temperature,
            timeOfDay: timeOfDay,
            timestamp: block.timestamp,
            minter: to
        });
        
        // 打印调试信息
        console.log("WeatherNFT minted:");
        console.log("TokenId:", tokenId);
        console.log("City:", city);
        console.log("Date:", date);
        
        // 发出事件
        emit WeatherNFTMinted(tokenId, to, city, date, _tokenURI);
        
        return tokenId;
    }
    
    /**
     * 检查指定地址、城市和日期的组合是否已经铸造过
     */
    function hasAlreadyMinted(address user, string memory city, string memory date) 
        public 
        view 
        returns (bool) 
    {
        bytes32 mintKey = keccak256(abi.encodePacked(user, city, date));
        return mintedCombinations[mintKey];
    }

    /**
     * 获取指定tokenId的天气数据
     */
    function getWeatherData(uint256 tokenId) 
        public 
        view 
        returns (WeatherData memory) 
    {
        if (_ownerOf(tokenId) == address(0)) {
            revert InvalidTokenId();
        }
        return weatherData[tokenId];
    }
    
    /**
     * 获取当前总铸造数量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * 获取用户拥有的所有tokenId (简单实现，适合小规模使用)
     * 注意：这个实现在大规模使用时会消耗大量gas，实际生产中建议使用事件索引
     */
    function getOwnedTokens(address owner) public view returns (uint256[] memory) {
        uint256 totalTokens = totalSupply();
        uint256 ownedCount = balanceOf(owner);
        
        if (ownedCount == 0) {
            return new uint256[](0);
        }
        
        uint256[] memory ownedTokens = new uint256[](ownedCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalTokens && currentIndex < ownedCount; i++) {
            if (_ownerOf(i) != address(0) && ownerOf(i) == owner) {
                ownedTokens[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return ownedTokens;
    }
    
    // 重写必要的函数
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    

}