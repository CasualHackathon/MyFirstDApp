// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Counter {
    uint256 public number;

    /**
     * @notice 合约拥有者地址
     */
    address public owner;

    /**
     * @notice 每次外部调用要发送的固定收款人和金额
     */
    address payable public payoutRecipient;
    uint256 public payoutAmount;

    /**
     * @notice 转账事件
     * @param to 接收者地址
     * @param amount 转账金额（wei）
     */
    event EtherTransferred(address indexed to, uint256 amount);

    /**
     * @notice 配置变更事件
     * @param recipient 收款人
     * @param amount 固定转账金额（wei）
     */
    event PayoutConfigured(address indexed recipient, uint256 amount);

    /**
     * @notice 每次调用触发的固定转账事件
     * @param caller 调用者
     * @param recipient 收款人
     * @param amount 固定转账金额（wei）
     */
    event PayoutTriggered(address indexed caller, address indexed recipient, uint256 amount);

    /**
     * @notice 仅限合约拥有者的修饰器
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @notice 构造函数，设置合约拥有者
     */
    constructor() {
        owner = msg.sender;
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }

    function decrement() public {
        number--;
    }

    function count() public view returns (uint256) {
        return number;
    }

    /**
     * @notice 接收原生币（ETH/主币）
     */
    receive() external payable {}

    /**
     * @notice 显式充值方法
     */
    function deposit() external payable {}

    /**
     * @notice 由合约向指定地址转账一定金额
     * @dev 仅合约拥有者可调用；使用 call 转账以避免 2300 gas 限制
     * @param to 接收者地址（payable）
     * @param amount 转账金额（wei）
     * @return success 是否成功
     */
    function transferEther(address payable to, uint256 amount) external onlyOwner returns (bool success) {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");

        emit EtherTransferred(to, amount);
        return true;
    }

    /**
     * @notice 设置固定收款人和每次调用的固定转账金额
     * @dev 仅合约拥有者可调用
     * @param recipient 收款人
     * @param amount 转账金额（wei）
     */
    function setPayoutConfig(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        payoutRecipient = recipient;
        payoutAmount = amount;
        emit PayoutConfigured(recipient, amount);
    }

    /**
     * @notice 任何外部调用都会触发：由合约向已配置的收款人汇出固定金额
     * @dev 使用 call 进行转账；需要保证合约余额充足
     * @return success 是否成功
     */
    function triggerPayout() external returns (bool success) {
        require(payoutRecipient != address(0), "Recipient not set");
        
        require(payoutAmount > 0, "Amount not set");
        require(address(this).balance >= payoutAmount, "Insufficient balance");

        (bool sent, ) = payoutRecipient.call{value: payoutAmount}("");
        require(sent, "Payout failed");

        emit PayoutTriggered(msg.sender, payoutRecipient, payoutAmount);
        return true;
    }
}
