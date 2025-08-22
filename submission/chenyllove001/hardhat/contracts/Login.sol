// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Nft.sol";

contract Login {

	struct UserInfo{
		string username;
		string password;
		string imgipfs;
		string otheripfs;
		address addre;
	}

	//用于存储账户信息,username为key,password为value
	mapping(string => UserInfo) userInfos;
	uint256  public totalUsers ;

	//用于存储用户信息,value为ipfs地址
	//mapping(string => UserInfo) users;
	//存储登录用户,是否登录,1登录,0未登录
	mapping(string => uint) userLogins;
	//在线用户
	string[] zxyh;

	// NFT 合约实例
    Nft public nftContract;
	// 构造函数传入 NFT 合约地址
    constructor(address _nftAddress) {
        nftContract = Nft(_nftAddress);
    }
	
	
	//注册用户
	function register(string memory _username, string memory _password, string memory _img, string memory _other) public {
		//判断用户是否已经注册
		//require(bytes(users[msg.sender]).length == 0, "The user has already registered");//用户已经注册

		//保存用户信息
		//users[msg.sender] = _username;
		//存储账户信息
		userInfos[_username] = UserInfo({
				username: _username,
				password: _password,
				imgipfs: _img,
				otheripfs: _other,
				addre: msg.sender
        	});
		totalUsers++;
	}

	//通过钱包登录
	function loginByAdd(address _address) public returns(UserInfo memory) { 
		string memory _username = Strings.toHexString(uint160(_address), 20);
		if(bytes(userInfos[_username].username).length == 0){
			userInfos[_username] = UserInfo({
				username: _username,
				password: "123",
				imgipfs: "",
				otheripfs: "",
				addre: msg.sender
        	});
		    totalUsers++;
		}
		userLogins[_username] = 1;
		zxyh.push(_username);
		return userInfos[_username];
	}

	//通过用户名登录
	function loginByUsername (string memory _username, string memory _password) public returns(UserInfo memory){ 
		require(bytes(userInfos[_username].username).length != 0, "The user has not registered");//用户未注册
		require(keccak256(abi.encodePacked(userInfos[_username].password)) == keccak256(abi.encodePacked(_password)), "The password is incorrect");//密码错误
		userLogins[_username] = 1;
		zxyh.push(_username);
		return userInfos[_username];
	}

	function logout(string memory _username) public{
		require(userLogins[_username] == 1, "The user has not logged in");//用户未登录
		userLogins[_username] = 0;
		for (uint i = 0; i < zxyh.length; i++) {
			if (keccak256(abi.encodePacked(zxyh[i])) == keccak256(abi.encodePacked(_username))) {
				zxyh[i] = zxyh[zxyh.length-1];
				zxyh.pop();
				return;
			}
		}
	}

	function getZxs() public view returns(uint256){
		return zxyh.length;
	}

	function getUserName(address _address) internal view returns(string memory){
		for (uint i = 0; i < zxyh.length; i++) {
			if (userInfos[zxyh[i]].addre == _address) {
				return userInfos[zxyh[i]].username;
			}
		}
		return Strings.toHexString(uint160(_address), 20);
	}

	function getNft(string memory _username) public{
		if(bytes(userInfos[_username].otheripfs).length > 0){
			nftContract.shouquan(userInfos[_username].addre);
			nftContract.safeMint(userInfos[_username].addre, userInfos[_username].otheripfs );
		}
	}
}
