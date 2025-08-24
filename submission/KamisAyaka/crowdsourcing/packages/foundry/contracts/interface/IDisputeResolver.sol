// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDisputeResolver {
    function fileDispute(
        address _taskContract,
        uint256 _taskId,
        address _worker,
        address _taskCreator,
        uint256 _rewardAmount,
        string memory _proofOfWork
    ) external;
}
