// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value >= 0.01 ether, "Minimum ETH required");
        players.push(msg.sender);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function pickWinner() public {
        require(msg.sender == manager, "Only manager can pick");
        require(players.length > 0, "No players");

        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, players.length))
        );
        address winner = players[rand % players.length];
        payable(winner).transfer(address(this).balance);

        delete players;
    }
}
