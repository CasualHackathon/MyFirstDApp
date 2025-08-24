// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface ITeamEconomyHooks {
    function onJoin(uint256 teamId, address account) external;

    function onLeave(uint256 teamId, address account) external;
}

contract TeamManager is AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    // 全局团队配置
    uint256 public maxTeamCapacity; // 最大团队容量

    struct TeamMeta {
        string name;
        uint256 activeMemberCount; // 当前活跃成员数
    }

    struct MemberMeta {
        uint8 status; // 0 未加入, 1 已加入, 2 淘汰/离队
        uint64 joinedAt;
        uint64 eliminatedAt;
        uint64 cooldownEndsAt;
    }

    event TeamCreated(uint256 indexed teamId, string name);
    event TeamConfigUpdated(uint256 maxTeamCapacity);
    event MemberJoined(uint256 indexed teamId, address indexed account);
    event MemberEliminated(uint256 indexed teamId, address indexed account);
    event MemberLeft(uint256 indexed teamId, address indexed account);

    mapping(uint256 => TeamMeta) public teams;
    mapping(uint256 => mapping(address => MemberMeta)) public members;
    mapping(address => uint256) public accountTeam; // 0 表示未加入

    uint256 public nextTeamId = 1;

    ITeamEconomyHooks public economy;

    event EconomySet(address indexed economy);

    constructor(address admin, uint256 _maxTeamCapacity) {
        require(_maxTeamCapacity > 0, "invalid team capacity");

        _grantRole(ADMIN_ROLE, admin);
        maxTeamCapacity = _maxTeamCapacity;

        emit TeamConfigUpdated(_maxTeamCapacity);
    }

    function setEconomy(address economy_) external onlyRole(ADMIN_ROLE) {
        economy = ITeamEconomyHooks(economy_);
        emit EconomySet(economy_);
    }

    function setTeamConfig(
        uint256 _maxTeamCapacity
    ) external onlyRole(ADMIN_ROLE) {
        require(_maxTeamCapacity > 0, "invalid team capacity");
        maxTeamCapacity = _maxTeamCapacity;
        emit TeamConfigUpdated(_maxTeamCapacity);
    }

    // Getter functions for team configuration
    function getTeamSize(uint256) external view returns (uint256) {
        return maxTeamCapacity;
    }

    function createTeam(
        string calldata name
    ) external returns (uint256 teamId) {
        require(accountTeam[msg.sender] == 0, "already in team");
        require(bytes(name).length > 0, "name required");

        teamId = nextTeamId++;
        teams[teamId] = TeamMeta({name: name, activeMemberCount: 0});
        emit TeamCreated(teamId, name);
    }

    function join(uint256 teamId) external {
        require(accountTeam[msg.sender] == 0, "already in team");
        TeamMeta storage t = teams[teamId];
        require(bytes(t.name).length > 0, "team not exist");
        require(t.activeMemberCount < maxTeamCapacity, "team full"); // 检查团队是否已满
        MemberMeta storage m = members[teamId][msg.sender];
        require(
            m.status == 0 ||
                (m.status == 2 && block.timestamp >= m.cooldownEndsAt),
            "cooldown"
        );
        m.status = 1;
        m.joinedAt = uint64(block.timestamp);
        m.eliminatedAt = 0;
        accountTeam[msg.sender] = teamId;
        t.activeMemberCount += 1;
        emit MemberJoined(teamId, msg.sender);
        if (address(economy) != address(0)) {
            economy.onJoin(teamId, msg.sender);
        }
    }

    function eliminate(
        uint256 teamId,
        address account,
        uint64 cooldownSeconds
    ) external onlyRole(ADMIN_ROLE) {
        require(accountTeam[account] == teamId, "not member");
        TeamMeta storage t = teams[teamId];
        MemberMeta storage m = members[teamId][account];
        require(m.status == 1, "not active");
        m.status = 2;
        m.eliminatedAt = uint64(block.timestamp);
        m.cooldownEndsAt = uint64(uint64(block.timestamp) + cooldownSeconds);
        accountTeam[account] = 0;
        t.activeMemberCount -= 1;
        emit MemberEliminated(teamId, account);
        if (address(economy) != address(0)) {
            economy.onLeave(teamId, account);
        }
    }

    function leave(uint256 cooldownSeconds) external {
        uint256 teamId = accountTeam[msg.sender];
        require(teamId != 0, "not in team");
        TeamMeta storage t = teams[teamId];
        MemberMeta storage m = members[teamId][msg.sender];
        require(m.status == 1, "not active");
        m.status = 2;
        m.eliminatedAt = uint64(block.timestamp);
        m.cooldownEndsAt = uint64(uint64(block.timestamp) + cooldownSeconds);
        accountTeam[msg.sender] = 0;
        t.activeMemberCount -= 1;
        emit MemberLeft(teamId, msg.sender);
        if (address(economy) != address(0)) {
            economy.onLeave(teamId, msg.sender);
        }
    }
}
