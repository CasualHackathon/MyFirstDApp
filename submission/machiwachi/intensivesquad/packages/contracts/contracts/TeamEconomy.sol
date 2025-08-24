// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITeamManager {
    function accountTeam(address account) external view returns (uint256);

    function teams(
        uint256 teamId
    ) external view returns (string memory name, uint256 activeMemberCount);

    function members(
        uint256 teamId,
        address account
    )
        external
        view
        returns (
            uint8 status,
            uint64 joinedAt,
            uint64 eliminatedAt,
            uint64 cooldownEndsAt
        );

    function getTeamSize(uint256 teamId) external view returns (uint256);
}

interface IIdoToken {
    function mint(address to, uint256 amount) external;
}

interface IWedoToken {
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;
}

interface ITeamEconomyHooks {
    function onJoin(uint256 teamId, address account) external;

    function onLeave(uint256 teamId, address account) external;
}

contract TeamEconomy is AccessControl, ReentrancyGuard, ITeamEconomyHooks {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PARAM_ROLE = keccak256("PARAM_ROLE");

    IIdoToken public immutable ido;
    IWedoToken public immutable wedo;
    ITeamManager public teamManager;

    // L 值配置
    uint256 public LMin = 1000; // 默认最小 L (1e3 precision)
    uint256 public LMax = 1500; // 默认最大 L (1e3 precision)

    // per team accounting
    mapping(uint256 => uint256) public teamWedoBalance; // raw WEDO units
    mapping(uint256 => uint256) public accIdoPerSurvivor; // 1e18 precision
    mapping(uint256 => uint256) public residual; // dust leftover per team

    // per user accounting (MasterChef-style)
    mapping(uint256 => mapping(address => uint256)) public userRewardDebt; // shares * acc
    mapping(uint256 => mapping(address => uint256)) public userAccrued; // accumulated pending separated from acc
    mapping(uint256 => mapping(address => uint8)) public userShares; // 0 or 1 (survivor flag)

    // Stage scalar S (1e3) with optional delayed activation
    uint256 public stageScalar = 1000; // current S (1e3)
    uint256 public pendingStageScalar; // pending S
    uint256 public stageScalarEffectiveAt; // timestamp when pending takes effect
    uint256 public immutable stageUpdateDelay; // seconds

    event StageScalarUpdated(uint256 newS, uint256 effectiveAt);
    event LConfigUpdated(uint256 LMin, uint256 LMax);
    event TeamCredited(uint256 indexed teamId, uint256 amount);
    event PersonalCredited(address indexed account, uint256 amount);
    event TeamWithdraw(
        uint256 indexed teamId,
        address indexed caller,
        uint256 amountWEDO,
        uint256 L,
        uint256 mintIdo,
        uint256 R
    );
    event Claimed(
        uint256 indexed teamId,
        address indexed account,
        uint256 amount
    );

    constructor(
        address ido_,
        address wedo_,
        address teamManager_,
        uint256 initialS,
        uint256 stageUpdateDelaySeconds,
        address admin
    ) {
        ido = IIdoToken(ido_);
        wedo = IWedoToken(wedo_);
        teamManager = ITeamManager(teamManager_);
        stageScalar = initialS; // 1e18
        stageUpdateDelay = stageUpdateDelaySeconds;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        _grantRole(PARAM_ROLE, admin);

        emit StageScalarUpdated(initialS, block.timestamp);
    }

    function setTeamManager(
        address teamManager_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        teamManager = ITeamManager(teamManager_);
    }

    function setLConfig(
        uint256 _LMin,
        uint256 _LMax
    ) external onlyRole(PARAM_ROLE) {
        require(_LMin >= 1e3 && _LMax >= _LMin, "invalid L range");
        LMin = _LMin;
        LMax = _LMax;
        emit LConfigUpdated(_LMin, _LMax);
    }

    function getStageScalar() public view returns (uint256) {
        if (
            pendingStageScalar != 0 && block.timestamp >= stageScalarEffectiveAt
        ) {
            return pendingStageScalar;
        }
        return stageScalar;
    }

    function setStageScalar(uint256 newS) external onlyRole(PARAM_ROLE) {
        if (stageUpdateDelay == 0) {
            stageScalar = newS;
            pendingStageScalar = 0;
            stageScalarEffectiveAt = 0;
            emit StageScalarUpdated(newS, block.timestamp);
        } else {
            pendingStageScalar = newS;
            stageScalarEffectiveAt = block.timestamp + stageUpdateDelay;
            emit StageScalarUpdated(newS, stageScalarEffectiveAt);
        }
    }

    // distributor: mint WEDO into vault and track per-team balance
    function creditTeamWEDO(
        uint256 teamId,
        uint256 amount
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        require(amount > 0, "zero amount");
        wedo.mint(address(this), amount);
        teamWedoBalance[teamId] += amount;
        emit TeamCredited(teamId, amount);
    }

    // distributor: mint IDO directly to account (personal share)
    function creditPersonalIDO(
        address account,
        uint256 amount
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        require(amount > 0, "zero amount");
        ido.mint(account, amount);
        emit PersonalCredited(account, amount);
    }

    function _syncStage() internal {
        if (
            pendingStageScalar != 0 && block.timestamp >= stageScalarEffectiveAt
        ) {
            stageScalar = pendingStageScalar;
            pendingStageScalar = 0;
            stageScalarEffectiveAt = 0;
        }
    }

    function getR(uint256 teamId) public view returns (uint256 R) {
        (, R) = teamManager.teams(teamId);
    }

    function getTeamL(uint256 teamId) public view returns (uint256 L) {
        (, uint256 R) = teamManager.teams(teamId);
        uint256 n0 = teamManager.getTeamSize(teamId);
        if (n0 == 0) return 0;
        uint256 S = getStageScalar();
        // L = S * (lMin + (lMax - lMin) * R / n0) / 1e3
        uint256 delta = LMax - LMin;
        uint256 linear = LMin + (delta * R) / n0;
        L = (S * linear) / 1e3;
    }

    function withdraw(uint256 teamId, uint256 amountWEDO) public nonReentrant {
        require(amountWEDO > 0, "zero amount");
        require(teamWedoBalance[teamId] >= amountWEDO, "insufficient");

        // must be active member
        uint256 userTeam = teamManager.accountTeam(msg.sender);
        require(userTeam == teamId, "not member");
        (uint8 status, , , ) = teamManager.members(teamId, msg.sender);
        require(status == 1, "inactive");

        _syncStage();

        uint256 R = getR(teamId);
        require(R > 0, "R=0");
        uint256 L = getTeamL(teamId); // already includes S and fixed point 1e3

        // burn WEDO and update balance
        teamWedoBalance[teamId] -= amountWEDO;
        wedo.burn(address(this), amountWEDO);

        // mintable IDO = amountWEDO * L / 1e3
        uint256 mintIdo = (amountWEDO * L) / 1e3;
        uint256 perCapita = mintIdo / R; // floor
        residual[teamId] += mintIdo - (perCapita * R);

        accIdoPerSurvivor[teamId] += perCapita; // 1e18 precision inherited from L and decimals alignment

        emit TeamWithdraw(teamId, msg.sender, amountWEDO, L, mintIdo, R);
    }

    function withdrawAll(uint256 teamId) external {
        uint256 amount = teamWedoBalance[teamId];
        withdraw(teamId, amount);
    }

    function pendingIdo(
        uint256 teamId,
        address account
    ) public view returns (uint256) {
        uint256 shares = userShares[teamId][account];
        uint256 acc = accIdoPerSurvivor[teamId];
        uint256 debt = userRewardDebt[teamId][account];
        uint256 accrued = userAccrued[teamId][account];
        uint256 current = (shares * acc);
        if (current < debt) return accrued; // should not happen but guard
        return accrued + (current - debt);
    }

    function claim(uint256 teamId) public nonReentrant {
        uint256 amount = pendingIdo(teamId, msg.sender);
        if (amount == 0) {
            // still reset debt to latest baseline
            userRewardDebt[teamId][msg.sender] =
                userShares[teamId][msg.sender] *
                accIdoPerSurvivor[teamId];
            return;
        }
        userAccrued[teamId][msg.sender] = 0;
        userRewardDebt[teamId][msg.sender] =
            userShares[teamId][msg.sender] *
            accIdoPerSurvivor[teamId];
        ido.mint(msg.sender, amount);
        emit Claimed(teamId, msg.sender, amount);
    }

    function claimMany(uint256[] calldata teamIds) external {
        for (uint256 i = 0; i < teamIds.length; i++) {
            claim(teamIds[i]);
        }
    }

    // -------- Hooks from TeamManager to keep survivor shares in sync --------
    function onJoin(uint256 teamId, address account) external override {
        require(msg.sender == address(teamManager), "only TM");
        // settle before changing shares
        uint256 pending = pendingIdo(teamId, account);
        userAccrued[teamId][account] = pending;
        userShares[teamId][account] = 1;
        userRewardDebt[teamId][account] = accIdoPerSurvivor[teamId];
    }

    function onLeave(uint256 teamId, address account) external override {
        require(msg.sender == address(teamManager), "only TM");
        // settle pending into accrued, then drop shares
        uint256 pending = pendingIdo(teamId, account);
        userAccrued[teamId][account] = pending;
        userShares[teamId][account] = 0;
        userRewardDebt[teamId][account] = 0;
    }
}
