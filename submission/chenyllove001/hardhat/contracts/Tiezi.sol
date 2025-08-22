// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import  "./Login.sol";

contract Tiezi { 
    //自增id
    uint256 tieziId;
    //今日帖子数量
	uint256 toDayTiezi;
	//记录帖子内容
	mapping(uint256 => TieziVo) tiezis;
	//记录作者发布过哪些帖子
	mapping(string => uint256[]) tieziAuthors;

    //记录跟帖
    mapping(uint256 => uint256[]) tieziReplies;
    //记录每天的帖子数量
    mapping (string => uint) rqtz;

constructor(){
    tieziId = 0;
    toDayTiezi = 0;
}
event dashanglog(uint256 id, uint256 money,address to);

	struct TieziVo {
		uint256 id;
		uint256 parentid;
		string title;
		string content;
		string lx;
		uint256 time;
		uint256 status;
		string username;

		uint256 voteCount;
		uint256 dashang;
        address owner;
	}

    function getId() private returns(uint256) {
        tieziId++;
        return tieziId;
    }

	function publishtiezi(string memory _title, string memory _content,string memory _lx,string memory _username) public{
		require(bytes(_title).length > 0,"Title cannot be empty");//标题不能为空
        require(bytes(_content).length > 0,"Content cannot be empty");//内容不能为空
        require(bytes(_lx).length > 0,"lx cannot be empty");//内容不能为空
        TieziVo memory _tiezi;
        _tiezi.id = getId();
        _tiezi.time = block.timestamp;
        _tiezi.status = 1;
        _tiezi.voteCount = 0;
        _tiezi.dashang = 0;
        _tiezi.username = _username;
        _tiezi.content = _content;
        _tiezi.title = _title;
        _tiezi.lx = _lx;
        _tiezi.owner = msg.sender;
        tiezis[_tiezi.id] = _tiezi;

        tieziAuthors[_tiezi.username].push(_tiezi.id);

        //跟帖
        if(_tiezi.parentid > 0){
            tieziReplies[_tiezi.parentid].push(_tiezi.id);
        }

        toDayTiezi++;
	}

    //记录今日帖子并将今日帖子记录清零,前端00:00定时调用
    function jrtz(string memory _date) public{
        rqtz[_date] = toDayTiezi;
        toDayTiezi = 0;
    }

    function queryList(string memory _lx, string memory _title) public view returns(TieziVo[] memory) {
        // 先计算符合条件的帖子数量
            uint count = 0;
            for (uint i = 1; i <= tieziId; i++) {
                if (
                    (bytes(_lx).length == 0 || keccak256(abi.encodePacked(tiezis[i].lx)) == keccak256(abi.encodePacked(_lx))) && 
                    (bytes(_title).length == 0 || keccak256(abi.encodePacked(tiezis[i].title)) == keccak256(abi.encodePacked(_title)))) {
                    count++;
                }
            }
            
            // 创建固定大小的数组
            TieziVo[] memory list = new TieziVo[](count);
            
            // 填充数组
            uint index = 0;
            for (uint i = 1; i <= tieziId; i++) {
                if (tiezis[i].status == 1 && 
                    (bytes(_lx).length == 0 || keccak256(abi.encodePacked(tiezis[i].lx)) == keccak256(abi.encodePacked(_lx))) && 
                    (bytes(_title).length == 0 || keccak256(abi.encodePacked(tiezis[i].title)) == keccak256(abi.encodePacked(_title)))) {
                    list[index] = tiezis[i];
                    index++;
                }
        }
        
        return list;
    }

    function dianzan(uint256 _id) public { 
        tiezis[_id].voteCount++;
    }

    function dashang(uint _id,uint amount) public payable{
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= amount, "Insufficient ETH sent");
        address payable receiver = payable(tiezis[_id].owner);
        receiver.transfer(amount);
        tiezis[_id].dashang+=amount;
        emit dashanglog(_id,amount,msg.sender);
    }
}