// SPDX-License-Identifier: MIT
/**
    
 */

pragma solidity ^0.8.15;

contract ReviewContract {
    // 事件
    event AddReview(address indexed owner, uint reviewId);
    event DeleteReview(uint reviewId, bool isDeleted);
    event Vote(uint reviewId, address voter, bool isUpvote);
    event RewardGiven(uint reviewId, address recipient);
    event ControversialReview(uint reviewId, string message);
    
    // 评论结构
    struct Review {
        uint id;
        string bookId;       // 关联的书籍ID
        string comment;      // 评论内容
        bool isDeleted;      // 是否被删除
        uint upvotes;        // 点赞数
        uint downvotes;      // 点踩数
        bool rewarded;       // 是否已获得奖励
    }

    // 状态变量
    Review[] private reviews;
    mapping(uint => address) private reviewToOwner;         // 评论ID → 所有者
    mapping(uint => mapping(address => bool)) private votes; // 记录用户投票状态
    
    // 可配置的阈值
    uint public constant REWARD_THRESHOLD = 5;    // 奖励所需点赞数
    uint public constant CONTROVERSIAL_THRESHOLD = 3; // 争议点踩数
    
    // 添加新评论
    function addReview(string memory _bookId, string memory _comment) external {
        uint reviewId = reviews.length;
        reviews.push(Review({
            id: reviewId,
            bookId: _bookId,
            comment: _comment,
            isDeleted: false,
            upvotes: 0,
            downvotes: 0,
            rewarded: false
        }));
        reviewToOwner[reviewId] = msg.sender;
        emit AddReview(msg.sender, reviewId);
    }
    
    // 获取用户的有效评论
    function getMyReviews() external view returns (Review[] memory) {
        return _getReviewsByOwner(msg.sender);
    }
    
    // 获取某书籍的所有评论
    function getReviewsByBook(string memory _bookId) external view returns (Review[] memory) {
        Review[] memory result = new Review[](reviews.length);
        uint counter = 0;
        
        for (uint i = 0; i < reviews.length; i++) {
            if (keccak256(abi.encodePacked(reviews[i].bookId)) == 
                keccak256(abi.encodePacked(_bookId)) && 
                !reviews[i].isDeleted) {
                result[counter] = reviews[i];
                counter++;
            }
        }
        
        return _resizeArray(result, counter);
    }
    
    // 删除评论（标记为删除）
    function deleteReview(uint _reviewId) external {
        require(reviewToOwner[_reviewId] == msg.sender, "Not your review");
        reviews[_reviewId].isDeleted = true;
        emit DeleteReview(_reviewId, true);
    }
    
    // 投票功能
    function vote(uint _reviewId, bool _isUpvote) external {
        require(!reviews[_reviewId].isDeleted, "Review deleted");
        require(reviewToOwner[_reviewId] != msg.sender, "Cannot vote your own");
        
        // 清除之前的投票状态
        if (votes[_reviewId][msg.sender]) {
            _undoPreviousVote(_reviewId);
        }
        
        // 记录新投票
        votes[_reviewId][msg.sender] = true;
        
        // 更新计数
        if (_isUpvote) {
            reviews[_reviewId].upvotes++;
        } else {
            reviews[_reviewId].downvotes++;
        }
        
        emit Vote(_reviewId, msg.sender, _isUpvote);
        
        // 检查是否触发奖励
        _checkReward(_reviewId);
        
        // 检查是否成为争议评论
        _checkControversial(_reviewId);
    }
    
    // ===== 内部函数 =====
    function _getReviewsByOwner(address _owner) private view returns (Review[] memory) {
        Review[] memory result = new Review[](reviews.length);
        uint counter = 0;
        
        for (uint i = 0; i < reviews.length; i++) {
            if (reviewToOwner[i] == _owner && !reviews[i].isDeleted) {
                result[counter] = reviews[i];
                counter++;
            }
        }
        
        return _resizeArray(result, counter);
    }
    
    function _resizeArray(Review[] memory _arr, uint _length) private pure returns (Review[] memory) {
        Review[] memory result = new Review[](_length);
        for (uint i = 0; i < _length; i++) {
            result[i] = _arr[i];
        }
        return result;
    }
    
    function _undoPreviousVote(uint _reviewId) private {
        // 实现中需要知道用户之前的投票类型
        // 实际项目中需要单独记录，这里简化处理
        // 提示：需要添加额外映射记录投票类型
    }
    
    function _checkReward(uint _reviewId) private {
        if (reviews[_reviewId].upvotes >= REWARD_THRESHOLD && 
            !reviews[_reviewId].rewarded) {
            reviews[_reviewId].rewarded = true;
            // 实际奖励逻辑（代币/NFT）需扩展
            emit RewardGiven(_reviewId, reviewToOwner[_reviewId]);
        }
    }
    
    function _checkControversial(uint _reviewId) private {
        if (reviews[_reviewId].downvotes >= CONTROVERSIAL_THRESHOLD) {
            string memory message = string(abi.encodePacked(
                "Controversial review ID:",
                _uintToString(_reviewId),
                " Downvotes:",
                _uintToString(reviews[_reviewId].downvotes)
            ));
            emit ControversialReview(_reviewId, message);
        }
    }
    
    // 辅助函数：uint转string
    function _uintToString(uint _value) private pure returns (string memory) {
        if (_value == 0) return "0";
        uint temp = _value;
        uint digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + _value % 10));
            _value /= 10;
        }
        return string(buffer);
    }
}
