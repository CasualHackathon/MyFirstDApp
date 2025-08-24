//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/WeatherNFT.sol";

contract WeatherNFTTest is Test {
    WeatherNFT public weatherNFT;
    address public owner;
    address public user1;
    address public user2;
    
    // 测试数据
    string constant CITY = "Beijing";
    string constant DATE = "2024-08-22";
    string constant WEATHER = "Sunny";
    int256 constant TEMPERATURE = 25;
    string constant TIME_OF_DAY = "afternoon";
    string constant TOKEN_URI = "ipfs://QmTestHash123/metadata.json";
    
    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        weatherNFT = new WeatherNFT(owner);
    }
    
    function testMint() public {
        // 测试正常铸造
        uint256 tokenId = weatherNFT.mintWithURI(
            user1,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        // 验证NFT信息
        assertEq(tokenId, 1);
        assertEq(weatherNFT.ownerOf(tokenId), user1);
        assertEq(weatherNFT.tokenURI(tokenId), TOKEN_URI);
        assertEq(weatherNFT.totalSupply(), 1);
        
        // 验证天气数据
        WeatherNFT.WeatherData memory data = weatherNFT.getWeatherData(tokenId);
        assertEq(data.city, CITY);
        assertEq(data.date, DATE);
        assertEq(data.weather, WEATHER);
        assertEq(data.temperature, TEMPERATURE);
        assertEq(data.timeOfDay, TIME_OF_DAY);
        assertEq(data.minter, user1);
        
        // 验证铸造状态
        assertTrue(weatherNFT.hasAlreadyMinted(user1, CITY, DATE));
    }
    
    function testCannotMintTwice() public {
        // 第一次铸造成功
        weatherNFT.mintWithURI(
            user1,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        // 第二次铸造应该失败
        vm.expectRevert(WeatherNFT.AlreadyMintedToday.selector);
        weatherNFT.mintWithURI(
            user1,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
    }
    
    function testDifferentUserCanMintSameCityDate() public {
        // user1铸造
        uint256 tokenId1 = weatherNFT.mintWithURI(
            user1,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        // user2可以铸造相同城市和日期
        uint256 tokenId2 = weatherNFT.mintWithURI(
            user2,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(weatherNFT.ownerOf(tokenId1), user1);
        assertEq(weatherNFT.ownerOf(tokenId2), user2);
    }
    
    function testSameUserCanMintDifferentDate() public {
        // 第一天铸造
        uint256 tokenId1 = weatherNFT.mintWithURI(
            user1,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        // 第二天铸造
        uint256 tokenId2 = weatherNFT.mintWithURI(
            user1,
            CITY,
            "2024-08-23",
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(weatherNFT.ownerOf(tokenId1), user1);
        assertEq(weatherNFT.ownerOf(tokenId2), user1);
    }
    
    function testSameUserCanMintDifferentCity() public {
        // 北京铸造
        uint256 tokenId1 = weatherNFT.mintWithURI(
            user1,
            "Beijing",
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        // 上海铸造
        uint256 tokenId2 = weatherNFT.mintWithURI(
            user1,
            "Shanghai",
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            TOKEN_URI
        );
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(weatherNFT.ownerOf(tokenId1), user1);
        assertEq(weatherNFT.ownerOf(tokenId2), user1);
    }
    
    function testEmptyTokenURIReverts() public {
        vm.expectRevert(WeatherNFT.EmptyTokenURI.selector);
        weatherNFT.mintWithURI(
            user1,
            CITY,
            DATE,
            WEATHER,
            TEMPERATURE,
            TIME_OF_DAY,
            ""
        );
    }
    
    function testGetOwnedTokens() public {
        // user1铸造2个NFT
        weatherNFT.mintWithURI(user1, "Beijing", "2024-08-22", WEATHER, TEMPERATURE, TIME_OF_DAY, TOKEN_URI);
        weatherNFT.mintWithURI(user1, "Shanghai", "2024-08-22", WEATHER, TEMPERATURE, TIME_OF_DAY, TOKEN_URI);
        
        // user2铸造1个NFT
        weatherNFT.mintWithURI(user2, "Guangzhou", "2024-08-22", WEATHER, TEMPERATURE, TIME_OF_DAY, TOKEN_URI);
        
        // 检查user1拥有的tokens
        uint256[] memory user1Tokens = weatherNFT.getOwnedTokens(user1);
        assertEq(user1Tokens.length, 2);
        assertEq(user1Tokens[0], 1);
        assertEq(user1Tokens[1], 2);
        
        // 检查user2拥有的tokens
        uint256[] memory user2Tokens = weatherNFT.getOwnedTokens(user2);
        assertEq(user2Tokens.length, 1);
        assertEq(user2Tokens[0], 3);
        
        // 检查没有NFT的地址
        uint256[] memory emptyTokens = weatherNFT.getOwnedTokens(address(0x999));
        assertEq(emptyTokens.length, 0);
    }
    
    function testTotalSupply() public {
        assertEq(weatherNFT.totalSupply(), 0);
        
        weatherNFT.mintWithURI(user1, CITY, DATE, WEATHER, TEMPERATURE, TIME_OF_DAY, TOKEN_URI);
        assertEq(weatherNFT.totalSupply(), 1);
        
        weatherNFT.mintWithURI(user2, "Shanghai", DATE, WEATHER, TEMPERATURE, TIME_OF_DAY, TOKEN_URI);
        assertEq(weatherNFT.totalSupply(), 2);
    }
}