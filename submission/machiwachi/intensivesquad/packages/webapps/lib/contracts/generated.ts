import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDOToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const idoTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

export const idoTokenAddress =
  '0xcCe76481522f01E9e79448cF635432D84b92d38A' as const

export const idoTokenConfig = {
  address: idoTokenAddress,
  abi: idoTokenAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TeamEconomy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const teamEconomyAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'ido_', internalType: 'address', type: 'address' },
      { name: 'wedo_', internalType: 'address', type: 'address' },
      { name: 'teamManager_', internalType: 'address', type: 'address' },
      { name: 'initialS', internalType: 'uint256', type: 'uint256' },
      {
        name: 'stageUpdateDelaySeconds',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'LMin',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'LMax',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LConfigUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PersonalCredited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newS',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'effectiveAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StageScalarUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TeamCredited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountWEDO',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'L', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'mintIdo',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'R', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'TeamWithdraw',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DISTRIBUTOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LMax',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LMin',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PARAM_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'accIdoPerSurvivor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'teamId', internalType: 'uint256', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'teamIds', internalType: 'uint256[]', type: 'uint256[]' }],
    name: 'claimMany',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'creditPersonalIDO',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'creditTeamWEDO',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'teamId', internalType: 'uint256', type: 'uint256' }],
    name: 'getR',
    outputs: [{ name: 'R', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getStageScalar',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'teamId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTeamL',
    outputs: [{ name: 'L', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ido',
    outputs: [
      { name: '', internalType: 'contract IIdoToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamId', internalType: 'uint256', type: 'uint256' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'onJoin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamId', internalType: 'uint256', type: 'uint256' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'onLeave',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamId', internalType: 'uint256', type: 'uint256' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'pendingIdo',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingStageScalar',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'residual',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_LMin', internalType: 'uint256', type: 'uint256' },
      { name: '_LMax', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setLConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newS', internalType: 'uint256', type: 'uint256' }],
    name: 'setStageScalar',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamManager_', internalType: 'address', type: 'address' },
    ],
    name: 'setTeamManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stageScalar',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stageScalarEffectiveAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stageUpdateDelay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'teamManager',
    outputs: [
      { name: '', internalType: 'contract ITeamManager', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'teamWedoBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'userAccrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'userRewardDebt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'userShares',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'wedo',
    outputs: [
      { name: '', internalType: 'contract IWedoToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamId', internalType: 'uint256', type: 'uint256' },
      { name: 'amountWEDO', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'teamId', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const teamEconomyAddress =
  '0x29416cd2F992B5E334b7952566A61C49aebA91E9' as const

export const teamEconomyConfig = {
  address: teamEconomyAddress,
  abi: teamEconomyAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TeamManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const teamManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: '_maxTeamCapacity', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'economy',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EconomySet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MemberEliminated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MemberJoined',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MemberLeft',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'maxTeamCapacity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TeamConfigUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'teamId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'TeamCreated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accountTeam',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    name: 'createTeam',
    outputs: [{ name: 'teamId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'economy',
    outputs: [
      { name: '', internalType: 'contract ITeamEconomyHooks', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'teamId', internalType: 'uint256', type: 'uint256' },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'cooldownSeconds', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'eliminate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'getTeamSize',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'teamId', internalType: 'uint256', type: 'uint256' }],
    name: 'join',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cooldownSeconds', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'leave',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxTeamCapacity',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'members',
    outputs: [
      { name: 'status', internalType: 'uint8', type: 'uint8' },
      { name: 'joinedAt', internalType: 'uint64', type: 'uint64' },
      { name: 'eliminatedAt', internalType: 'uint64', type: 'uint64' },
      { name: 'cooldownEndsAt', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTeamId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'economy_', internalType: 'address', type: 'address' }],
    name: 'setEconomy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_maxTeamCapacity', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTeamConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'teams',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'activeMemberCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

export const teamManagerAddress =
  '0xc23536a8B777B025b4708760857B87FeDfA7b773' as const

export const teamManagerConfig = {
  address: teamManagerAddress,
  abi: teamManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEDOToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wedoTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

export const wedoTokenAddress =
  '0x0568Ac3966fF048b76C4b0dE495E5ea346B28683' as const

export const wedoTokenConfig = {
  address: wedoTokenAddress,
  abi: wedoTokenAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__
 */
export const useReadIdoToken = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadIdoTokenDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"MINTER_ROLE"`
 */
export const useReadIdoTokenMinterRole = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'MINTER_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIdoTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIdoTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIdoTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadIdoTokenGetRoleAdmin = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadIdoTokenHasRole = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadIdoTokenName = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIdoTokenSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIdoTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIdoTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__
 */
export const useWriteIdoToken = /*#__PURE__*/ createUseWriteContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIdoTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteIdoTokenGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteIdoTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteIdoTokenRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteIdoTokenRevokeRole = /*#__PURE__*/ createUseWriteContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIdoTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIdoTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__
 */
export const useSimulateIdoToken = /*#__PURE__*/ createUseSimulateContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIdoTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateIdoTokenGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateIdoTokenMint = /*#__PURE__*/ createUseSimulateContract({
  abi: idoTokenAbi,
  address: idoTokenAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateIdoTokenRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateIdoTokenRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIdoTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link idoTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIdoTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link idoTokenAbi}__
 */
export const useWatchIdoTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: idoTokenAbi,
  address: idoTokenAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link idoTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIdoTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link idoTokenAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchIdoTokenRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link idoTokenAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchIdoTokenRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link idoTokenAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchIdoTokenRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link idoTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIdoTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: idoTokenAbi,
    address: idoTokenAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__
 */
export const useReadTeamEconomy = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadTeamEconomyDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"DISTRIBUTOR_ROLE"`
 */
export const useReadTeamEconomyDistributorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'DISTRIBUTOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"LMax"`
 */
export const useReadTeamEconomyLMax = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'LMax',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"LMin"`
 */
export const useReadTeamEconomyLMin = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'LMin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"PARAM_ROLE"`
 */
export const useReadTeamEconomyParamRole = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'PARAM_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"accIdoPerSurvivor"`
 */
export const useReadTeamEconomyAccIdoPerSurvivor =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'accIdoPerSurvivor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"getR"`
 */
export const useReadTeamEconomyGetR = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'getR',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadTeamEconomyGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"getStageScalar"`
 */
export const useReadTeamEconomyGetStageScalar =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'getStageScalar',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"getTeamL"`
 */
export const useReadTeamEconomyGetTeamL = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'getTeamL',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadTeamEconomyHasRole = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"ido"`
 */
export const useReadTeamEconomyIdo = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'ido',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"pendingIdo"`
 */
export const useReadTeamEconomyPendingIdo = /*#__PURE__*/ createUseReadContract(
  {
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'pendingIdo',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"pendingStageScalar"`
 */
export const useReadTeamEconomyPendingStageScalar =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'pendingStageScalar',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"residual"`
 */
export const useReadTeamEconomyResidual = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'residual',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"stageScalar"`
 */
export const useReadTeamEconomyStageScalar =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'stageScalar',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"stageScalarEffectiveAt"`
 */
export const useReadTeamEconomyStageScalarEffectiveAt =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'stageScalarEffectiveAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"stageUpdateDelay"`
 */
export const useReadTeamEconomyStageUpdateDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'stageUpdateDelay',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadTeamEconomySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"teamManager"`
 */
export const useReadTeamEconomyTeamManager =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'teamManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"teamWedoBalance"`
 */
export const useReadTeamEconomyTeamWedoBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'teamWedoBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"userAccrued"`
 */
export const useReadTeamEconomyUserAccrued =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'userAccrued',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"userRewardDebt"`
 */
export const useReadTeamEconomyUserRewardDebt =
  /*#__PURE__*/ createUseReadContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'userRewardDebt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"userShares"`
 */
export const useReadTeamEconomyUserShares = /*#__PURE__*/ createUseReadContract(
  {
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'userShares',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"wedo"`
 */
export const useReadTeamEconomyWedo = /*#__PURE__*/ createUseReadContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'wedo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__
 */
export const useWriteTeamEconomy = /*#__PURE__*/ createUseWriteContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"claim"`
 */
export const useWriteTeamEconomyClaim = /*#__PURE__*/ createUseWriteContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'claim',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"claimMany"`
 */
export const useWriteTeamEconomyClaimMany =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'claimMany',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"creditPersonalIDO"`
 */
export const useWriteTeamEconomyCreditPersonalIdo =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'creditPersonalIDO',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"creditTeamWEDO"`
 */
export const useWriteTeamEconomyCreditTeamWedo =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'creditTeamWEDO',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteTeamEconomyGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"onJoin"`
 */
export const useWriteTeamEconomyOnJoin = /*#__PURE__*/ createUseWriteContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'onJoin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"onLeave"`
 */
export const useWriteTeamEconomyOnLeave = /*#__PURE__*/ createUseWriteContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
  functionName: 'onLeave',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteTeamEconomyRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteTeamEconomyRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"setLConfig"`
 */
export const useWriteTeamEconomySetLConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'setLConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"setStageScalar"`
 */
export const useWriteTeamEconomySetStageScalar =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'setStageScalar',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"setTeamManager"`
 */
export const useWriteTeamEconomySetTeamManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'setTeamManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteTeamEconomyWithdraw = /*#__PURE__*/ createUseWriteContract(
  {
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'withdraw',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"withdrawAll"`
 */
export const useWriteTeamEconomyWithdrawAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'withdrawAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__
 */
export const useSimulateTeamEconomy = /*#__PURE__*/ createUseSimulateContract({
  abi: teamEconomyAbi,
  address: teamEconomyAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"claim"`
 */
export const useSimulateTeamEconomyClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"claimMany"`
 */
export const useSimulateTeamEconomyClaimMany =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'claimMany',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"creditPersonalIDO"`
 */
export const useSimulateTeamEconomyCreditPersonalIdo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'creditPersonalIDO',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"creditTeamWEDO"`
 */
export const useSimulateTeamEconomyCreditTeamWedo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'creditTeamWEDO',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateTeamEconomyGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"onJoin"`
 */
export const useSimulateTeamEconomyOnJoin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'onJoin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"onLeave"`
 */
export const useSimulateTeamEconomyOnLeave =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'onLeave',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateTeamEconomyRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateTeamEconomyRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"setLConfig"`
 */
export const useSimulateTeamEconomySetLConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'setLConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"setStageScalar"`
 */
export const useSimulateTeamEconomySetStageScalar =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'setStageScalar',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"setTeamManager"`
 */
export const useSimulateTeamEconomySetTeamManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'setTeamManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateTeamEconomyWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamEconomyAbi}__ and `functionName` set to `"withdrawAll"`
 */
export const useSimulateTeamEconomyWithdrawAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    functionName: 'withdrawAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__
 */
export const useWatchTeamEconomyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"Claimed"`
 */
export const useWatchTeamEconomyClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'Claimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"LConfigUpdated"`
 */
export const useWatchTeamEconomyLConfigUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'LConfigUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"PersonalCredited"`
 */
export const useWatchTeamEconomyPersonalCreditedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'PersonalCredited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchTeamEconomyRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchTeamEconomyRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchTeamEconomyRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"StageScalarUpdated"`
 */
export const useWatchTeamEconomyStageScalarUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'StageScalarUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"TeamCredited"`
 */
export const useWatchTeamEconomyTeamCreditedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'TeamCredited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamEconomyAbi}__ and `eventName` set to `"TeamWithdraw"`
 */
export const useWatchTeamEconomyTeamWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamEconomyAbi,
    address: teamEconomyAddress,
    eventName: 'TeamWithdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__
 */
export const useReadTeamManager = /*#__PURE__*/ createUseReadContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useReadTeamManagerAdminRole = /*#__PURE__*/ createUseReadContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadTeamManagerDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"accountTeam"`
 */
export const useReadTeamManagerAccountTeam =
  /*#__PURE__*/ createUseReadContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'accountTeam',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"economy"`
 */
export const useReadTeamManagerEconomy = /*#__PURE__*/ createUseReadContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'economy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadTeamManagerGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"getTeamSize"`
 */
export const useReadTeamManagerGetTeamSize =
  /*#__PURE__*/ createUseReadContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'getTeamSize',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadTeamManagerHasRole = /*#__PURE__*/ createUseReadContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"maxTeamCapacity"`
 */
export const useReadTeamManagerMaxTeamCapacity =
  /*#__PURE__*/ createUseReadContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'maxTeamCapacity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"members"`
 */
export const useReadTeamManagerMembers = /*#__PURE__*/ createUseReadContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'members',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"nextTeamId"`
 */
export const useReadTeamManagerNextTeamId = /*#__PURE__*/ createUseReadContract(
  {
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'nextTeamId',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadTeamManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"teams"`
 */
export const useReadTeamManagerTeams = /*#__PURE__*/ createUseReadContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'teams',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__
 */
export const useWriteTeamManager = /*#__PURE__*/ createUseWriteContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"createTeam"`
 */
export const useWriteTeamManagerCreateTeam =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'createTeam',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"eliminate"`
 */
export const useWriteTeamManagerEliminate =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'eliminate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteTeamManagerGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"join"`
 */
export const useWriteTeamManagerJoin = /*#__PURE__*/ createUseWriteContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'join',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"leave"`
 */
export const useWriteTeamManagerLeave = /*#__PURE__*/ createUseWriteContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
  functionName: 'leave',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteTeamManagerRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteTeamManagerRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"setEconomy"`
 */
export const useWriteTeamManagerSetEconomy =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'setEconomy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"setTeamConfig"`
 */
export const useWriteTeamManagerSetTeamConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'setTeamConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__
 */
export const useSimulateTeamManager = /*#__PURE__*/ createUseSimulateContract({
  abi: teamManagerAbi,
  address: teamManagerAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"createTeam"`
 */
export const useSimulateTeamManagerCreateTeam =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'createTeam',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"eliminate"`
 */
export const useSimulateTeamManagerEliminate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'eliminate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateTeamManagerGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"join"`
 */
export const useSimulateTeamManagerJoin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'join',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"leave"`
 */
export const useSimulateTeamManagerLeave =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'leave',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateTeamManagerRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateTeamManagerRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"setEconomy"`
 */
export const useSimulateTeamManagerSetEconomy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'setEconomy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link teamManagerAbi}__ and `functionName` set to `"setTeamConfig"`
 */
export const useSimulateTeamManagerSetTeamConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    functionName: 'setTeamConfig',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__
 */
export const useWatchTeamManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"EconomySet"`
 */
export const useWatchTeamManagerEconomySetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'EconomySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"MemberEliminated"`
 */
export const useWatchTeamManagerMemberEliminatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'MemberEliminated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"MemberJoined"`
 */
export const useWatchTeamManagerMemberJoinedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'MemberJoined',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"MemberLeft"`
 */
export const useWatchTeamManagerMemberLeftEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'MemberLeft',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchTeamManagerRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchTeamManagerRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchTeamManagerRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"TeamConfigUpdated"`
 */
export const useWatchTeamManagerTeamConfigUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'TeamConfigUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link teamManagerAbi}__ and `eventName` set to `"TeamCreated"`
 */
export const useWatchTeamManagerTeamCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: teamManagerAbi,
    address: teamManagerAddress,
    eventName: 'TeamCreated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__
 */
export const useReadWedoToken = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadWedoTokenDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"MINTER_ROLE"`
 */
export const useReadWedoTokenMinterRole = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'MINTER_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadWedoTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadWedoTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadWedoTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadWedoTokenGetRoleAdmin = /*#__PURE__*/ createUseReadContract(
  {
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'getRoleAdmin',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadWedoTokenHasRole = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadWedoTokenName = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadWedoTokenSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadWedoTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadWedoTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__
 */
export const useWriteWedoToken = /*#__PURE__*/ createUseWriteContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteWedoTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteWedoTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteWedoTokenGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteWedoTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteWedoTokenRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteWedoTokenRevokeRole = /*#__PURE__*/ createUseWriteContract(
  { abi: wedoTokenAbi, address: wedoTokenAddress, functionName: 'revokeRole' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteWedoTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteWedoTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__
 */
export const useSimulateWedoToken = /*#__PURE__*/ createUseSimulateContract({
  abi: wedoTokenAbi,
  address: wedoTokenAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateWedoTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateWedoTokenBurn = /*#__PURE__*/ createUseSimulateContract(
  { abi: wedoTokenAbi, address: wedoTokenAddress, functionName: 'burn' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateWedoTokenGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateWedoTokenMint = /*#__PURE__*/ createUseSimulateContract(
  { abi: wedoTokenAbi, address: wedoTokenAddress, functionName: 'mint' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateWedoTokenRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateWedoTokenRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateWedoTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wedoTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateWedoTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wedoTokenAbi}__
 */
export const useWatchWedoTokenEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: wedoTokenAbi, address: wedoTokenAddress },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wedoTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchWedoTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wedoTokenAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchWedoTokenRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wedoTokenAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchWedoTokenRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wedoTokenAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchWedoTokenRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wedoTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchWedoTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wedoTokenAbi,
    address: wedoTokenAddress,
    eventName: 'Transfer',
  })
