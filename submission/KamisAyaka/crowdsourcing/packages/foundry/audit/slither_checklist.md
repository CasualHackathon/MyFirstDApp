**THIS CHECKLIST IS NOT COMPLETE**. Use `--show-ignored-findings` to show all the results.
Summary
 - [reentrancy-no-eth](#reentrancy-no-eth) (1 results) (Medium)
 - [shadowing-local](#shadowing-local) (2 results) (Low)
 - [calls-loop](#calls-loop) (1 results) (Low)
 - [reentrancy-events](#reentrancy-events) (6 results) (Low)
 - [timestamp](#timestamp) (10 results) (Low)
 - [assembly](#assembly) (2 results) (Informational)
 - [pragma](#pragma) (1 results) (Informational)
 - [costly-loop](#costly-loop) (1 results) (Informational)
 - [solc-version](#solc-version) (4 results) (Informational)
 - [naming-convention](#naming-convention) (114 results) (Informational)
 - [constable-states](#constable-states) (3 results) (Optimization)
 - [immutable-states](#immutable-states) (4 results) (Optimization)
## reentrancy-no-eth
Impact: Medium
Confidence: Medium
 - [ ] ID-0
Reentrancy in [MilestonePaymentTask.terminateTask(uint256)](contracts/task/MilestonePaymentTask.sol#L402-L456):
	External calls:
	- [submitDispute(_taskId,worker,task.creator,task.totalreward,milestones[i].workProof.proof)](contracts/task/MilestonePaymentTask.sol#L431-L437)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	State variables written after the call(s):
	- [payMilestone(_taskId,i)](contracts/task/MilestonePaymentTask.sol#L444)
		- [milestone.paid = true](contracts/task/MilestonePaymentTask.sol#L383)
	[MilestonePaymentTask.taskMilestones](contracts/task/MilestonePaymentTask.sol#L27) can be used in cross function reentrancies:
	- [MilestonePaymentTask.InvalidMilestoneIndex(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L112-L118)
	- [MilestonePaymentTask.addMilestone(uint256,string,uint256)](contracts/task/MilestonePaymentTask.sol#L206-L256)
	- [MilestonePaymentTask.approveMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L309-L332)
	- [MilestonePaymentTask.completeTask(uint256)](contracts/task/MilestonePaymentTask.sol#L338-L353)
	- [MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L466-L513)
	- [MilestonePaymentTask.getMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L530-L535)
	- [MilestonePaymentTask.getMilestonesCount(uint256)](contracts/task/MilestonePaymentTask.sol#L520-L522)
	- [MilestonePaymentTask.payMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L360-L396)
	- [MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)](contracts/task/MilestonePaymentTask.sol#L264-L302)
	- [MilestonePaymentTask.taskMilestones](contracts/task/MilestonePaymentTask.sol#L27)
	- [MilestonePaymentTask.terminateTask(uint256)](contracts/task/MilestonePaymentTask.sol#L402-L456)
	- [payMilestone(_taskId,i)](contracts/task/MilestonePaymentTask.sol#L444)
		- [tasks[_taskId].totalreward -= milestone.reward](contracts/task/MilestonePaymentTask.sol#L384)
	[BaseTask.tasks](contracts/BaseTask.sol#L77) can be used in cross function reentrancies:
	- [MilestonePaymentTask.addMilestone(uint256,string,uint256)](contracts/task/MilestonePaymentTask.sol#L206-L256)
	- [MilestonePaymentTask.addWorker(uint256,address,uint256)](contracts/task/MilestonePaymentTask.sol#L171-L198)
	- [BaseTask.changedeadline(uint256,uint256)](contracts/BaseTask.sol#L211-L222)
	- [MilestonePaymentTask.completeTask(uint256)](contracts/task/MilestonePaymentTask.sol#L338-L353)
	- [MilestonePaymentTask.createTask(string,string,uint256)](contracts/task/MilestonePaymentTask.sol#L136-L163)
	- [MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L466-L513)
	- [BaseTask.getTask(uint256)](contracts/BaseTask.sol#L244-L246)
	- [BaseTask.increaseReward(uint256,uint256)](contracts/BaseTask.sol#L224-L237)
	- [BaseTask.onlyTaskCreator(uint256)](contracts/BaseTask.sol#L87-L92)
	- [MilestonePaymentTask.onlyTaskInProgress(uint256)](contracts/task/MilestonePaymentTask.sol#L105-L110)
	- [MilestonePaymentTask.payMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L360-L396)
	- [BaseTask.submitDispute(uint256,address,address,uint256,string)](contracts/BaseTask.sol#L144-L168)
	- [MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)](contracts/task/MilestonePaymentTask.sol#L264-L302)
	- [BaseTask.tasks](contracts/BaseTask.sol#L77)
	- [MilestonePaymentTask.terminateTask(uint256)](contracts/task/MilestonePaymentTask.sol#L402-L456)
	- [task.totalreward = 0](contracts/task/MilestonePaymentTask.sol#L451)
	[BaseTask.tasks](contracts/BaseTask.sol#L77) can be used in cross function reentrancies:
	- [MilestonePaymentTask.addMilestone(uint256,string,uint256)](contracts/task/MilestonePaymentTask.sol#L206-L256)
	- [MilestonePaymentTask.addWorker(uint256,address,uint256)](contracts/task/MilestonePaymentTask.sol#L171-L198)
	- [BaseTask.changedeadline(uint256,uint256)](contracts/BaseTask.sol#L211-L222)
	- [MilestonePaymentTask.completeTask(uint256)](contracts/task/MilestonePaymentTask.sol#L338-L353)
	- [MilestonePaymentTask.createTask(string,string,uint256)](contracts/task/MilestonePaymentTask.sol#L136-L163)
	- [MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L466-L513)
	- [BaseTask.getTask(uint256)](contracts/BaseTask.sol#L244-L246)
	- [BaseTask.increaseReward(uint256,uint256)](contracts/BaseTask.sol#L224-L237)
	- [BaseTask.onlyTaskCreator(uint256)](contracts/BaseTask.sol#L87-L92)
	- [MilestonePaymentTask.onlyTaskInProgress(uint256)](contracts/task/MilestonePaymentTask.sol#L105-L110)
	- [MilestonePaymentTask.payMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L360-L396)
	- [BaseTask.submitDispute(uint256,address,address,uint256,string)](contracts/BaseTask.sol#L144-L168)
	- [MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)](contracts/task/MilestonePaymentTask.sol#L264-L302)
	- [BaseTask.tasks](contracts/BaseTask.sol#L77)
	- [MilestonePaymentTask.terminateTask(uint256)](contracts/task/MilestonePaymentTask.sol#L402-L456)
	- [payMilestone(_taskId,i)](contracts/task/MilestonePaymentTask.sol#L444)
		- [totalPlatformRevenue += fee](contracts/task/MilestonePaymentTask.sol#L381)
	[BaseTask.totalPlatformRevenue](contracts/BaseTask.sol#L68) can be used in cross function reentrancies:
	- [MilestonePaymentTask.payMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L360-L396)
	- [BaseTask.totalPlatformRevenue](contracts/BaseTask.sol#L68)

contracts/task/MilestonePaymentTask.sol#L402-L456


## shadowing-local
Impact: Low
Confidence: High
 - [ ] ID-1
[TaskToken.constructor(string,string,uint8)._symbol](contracts/TaskToken.sol#L24) shadows:
	- [ERC20._symbol](lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol#L37) (state variable)

contracts/TaskToken.sol#L24


 - [ ] ID-2
[TaskToken.constructor(string,string,uint8)._name](contracts/TaskToken.sol#L23) shadows:
	- [ERC20._name](lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol#L36) (state variable)

contracts/TaskToken.sol#L23


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-3
[BaseTask.submitDispute(uint256,address,address,uint256,string)](contracts/BaseTask.sol#L144-L168) has external calls inside a loop: [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Calls stack containing the loop:
		MilestonePaymentTask.terminateTask(uint256)

contracts/BaseTask.sol#L144-L168


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-4
Reentrancy in [FixedPaymentTask.fileDisputeByWorker(uint256)](contracts/task/FixedPaymentTask.sol#L321-L354):
	External calls:
	- [submitDispute(_taskId,msg.sender,task.creator,task.totalreward,proof.proof)](contracts/task/FixedPaymentTask.sol#L345-L351)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Event emitted after the call(s):
	- [FixedPaymentTask_DisputeFiledByWorker(_taskId,msg.sender)](contracts/task/FixedPaymentTask.sol#L353)

contracts/task/FixedPaymentTask.sol#L321-L354


 - [ ] ID-5
Reentrancy in [MilestonePaymentTask.terminateTask(uint256)](contracts/task/MilestonePaymentTask.sol#L402-L456):
	External calls:
	- [submitDispute(_taskId,worker,task.creator,task.totalreward,milestones[i].workProof.proof)](contracts/task/MilestonePaymentTask.sol#L431-L437)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Event emitted after the call(s):
	- [MilestonePaymentTask_MilestonePaid(_taskId,_milestoneIndex,payment,fee)](contracts/task/MilestonePaymentTask.sol#L390-L395)
		- [payMilestone(_taskId,i)](contracts/task/MilestonePaymentTask.sol#L444)
	- [MilestonePaymentTask_TaskCancelled(_taskId)](contracts/task/MilestonePaymentTask.sol#L455)

contracts/task/MilestonePaymentTask.sol#L402-L456


 - [ ] ID-6
Reentrancy in [BiddingTask.terminateTask(uint256)](contracts/task/BiddingTask.sol#L266-L302):
	External calls:
	- [submitDispute(_taskId,worker,task.creator,task.totalreward,proof.proof)](contracts/task/BiddingTask.sol#L291-L297)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Event emitted after the call(s):
	- [BiddingTask_TaskCancelled(_taskId)](contracts/task/BiddingTask.sol#L301)

contracts/task/BiddingTask.sol#L266-L302


 - [ ] ID-7
Reentrancy in [MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L466-L513):
	External calls:
	- [submitDispute(_taskId,msg.sender,task.creator,task.totalreward,proof.proof)](contracts/task/MilestonePaymentTask.sol#L504-L510)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Event emitted after the call(s):
	- [MilestonePaymentTask_DisputeFiledByWorker(_taskId,msg.sender)](contracts/task/MilestonePaymentTask.sol#L512)

contracts/task/MilestonePaymentTask.sol#L466-L513


 - [ ] ID-8
Reentrancy in [BiddingTask.fileDisputeByWorker(uint256)](contracts/task/BiddingTask.sol#L402-L435):
	External calls:
	- [submitDispute(_taskId,msg.sender,task.creator,task.totalreward,proof.proof)](contracts/task/BiddingTask.sol#L426-L432)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Event emitted after the call(s):
	- [BiddingTask_DisputeFiledByWorker(_taskId,msg.sender)](contracts/task/BiddingTask.sol#L434)

contracts/task/BiddingTask.sol#L402-L435


 - [ ] ID-9
Reentrancy in [FixedPaymentTask.terminateTask(uint256)](contracts/task/FixedPaymentTask.sol#L185-L221):
	External calls:
	- [submitDispute(_taskId,worker,task.creator,task.totalreward,proof.proof)](contracts/task/FixedPaymentTask.sol#L208-L214)
		- [disputeResolver.fileDispute(address(this),_taskId,_worker,_taskCreator,_rewardAmount,_proofOfWork)](contracts/BaseTask.sol#L160-L167)
	Event emitted after the call(s):
	- [FixedPaymentTask_TaskCancelled(_taskId)](contracts/task/FixedPaymentTask.sol#L220)

contracts/task/FixedPaymentTask.sol#L185-L221


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-10
[FixedPaymentTask.fileDisputeByWorker(uint256)](contracts/task/FixedPaymentTask.sol#L321-L354) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < proof.submittedAt + minTimeBeforeDispute](contracts/task/FixedPaymentTask.sol#L340)

contracts/task/FixedPaymentTask.sol#L321-L354


 - [ ] ID-11
[MilestonePaymentTask.createTask(string,string,uint256)](contracts/task/MilestonePaymentTask.sol#L136-L163) uses timestamp for comparisons
	Dangerous comparisons:
	- [_deadline < block.timestamp](contracts/task/MilestonePaymentTask.sol#L141)

contracts/task/MilestonePaymentTask.sol#L136-L163


 - [ ] ID-12
[FixedPaymentTask.createTask(string,string,uint256)](contracts/task/FixedPaymentTask.sol#L117-L144) uses timestamp for comparisons
	Dangerous comparisons:
	- [_deadline < block.timestamp](contracts/task/FixedPaymentTask.sol#L122)

contracts/task/FixedPaymentTask.sol#L117-L144


 - [ ] ID-13
[BiddingTask.submitProofOfWork(uint256,string)](contracts/task/BiddingTask.sol#L309-L334) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp >= task.deadline](contracts/task/BiddingTask.sol#L314)

contracts/task/BiddingTask.sol#L309-L334


 - [ ] ID-14
[BiddingTask.createTask(string,string,uint256)](contracts/task/BiddingTask.sol#L136-L158) uses timestamp for comparisons
	Dangerous comparisons:
	- [_deadline < block.timestamp](contracts/task/BiddingTask.sol#L141)

contracts/task/BiddingTask.sol#L136-L158


 - [ ] ID-15
[BiddingTask.fileDisputeByWorker(uint256)](contracts/task/BiddingTask.sol#L402-L435) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < proof.submittedAt + minTimeBeforeDispute](contracts/task/BiddingTask.sol#L421)

contracts/task/BiddingTask.sol#L402-L435


 - [ ] ID-16
[MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)](contracts/task/MilestonePaymentTask.sol#L264-L302) uses timestamp for comparisons
	Dangerous comparisons:
	- [tasks[_taskId].deadline < block.timestamp](contracts/task/MilestonePaymentTask.sol#L280)

contracts/task/MilestonePaymentTask.sol#L264-L302


 - [ ] ID-17
[FixedPaymentTask.submitProofOfWork(uint256,string)](contracts/task/FixedPaymentTask.sol#L228-L253) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp >= task.deadline](contracts/task/FixedPaymentTask.sol#L233)

contracts/task/FixedPaymentTask.sol#L228-L253


 - [ ] ID-18
[BiddingTask.submitBid(uint256,uint256,string,uint256)](contracts/task/BiddingTask.sol#L167-L205) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp > task.deadline](contracts/task/BiddingTask.sol#L190)

contracts/task/BiddingTask.sol#L167-L205


 - [ ] ID-19
[MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L466-L513) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < proof.submittedAt + minTimeBeforeDispute](contracts/task/MilestonePaymentTask.sol#L499)

contracts/task/MilestonePaymentTask.sol#L466-L513


## assembly
Impact: Informational
Confidence: High
 - [ ] ID-20
[SafeERC20._callOptionalReturn(IERC20,bytes)](lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L173-L191) uses assembly
	- [INLINE ASM](lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L176-L186)

lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L173-L191


 - [ ] ID-21
[SafeERC20._callOptionalReturnBool(IERC20,bytes)](lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L201-L211) uses assembly
	- [INLINE ASM](lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L205-L209)

lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L201-L211


## pragma
Impact: Informational
Confidence: High
 - [ ] ID-22
4 different versions of Solidity are used:
	- Version constraint ^0.8.20 is used by:
		-[^0.8.20](contracts/BaseTask.sol#L2)
		-[^0.8.20](contracts/DisputeResolver.sol#L2)
		-[^0.8.20](contracts/TaskToken.sol#L2)
		-[^0.8.20](contracts/task/BiddingTask.sol#L2)
		-[^0.8.20](contracts/task/FixedPaymentTask.sol#L2)
		-[^0.8.20](contracts/task/MilestonePaymentTask.sol#L2)
		-[^0.8.20](lib/openzeppelin-contracts/contracts/access/Ownable.sol#L4)
		-[^0.8.20](lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol#L4)
		-[^0.8.20](lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L4)
		-[^0.8.20](lib/openzeppelin-contracts/contracts/utils/Context.sol#L4)
		-[^0.8.20](lib/openzeppelin-contracts/contracts/utils/Pausable.sol#L4)
		-[^0.8.20](lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol#L4)
	- Version constraint >=0.6.2 is used by:
		-[>=0.6.2](lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol#L4)
		-[>=0.6.2](lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4)
	- Version constraint >=0.4.16 is used by:
		-[>=0.4.16](lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol#L4)
		-[>=0.4.16](lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol#L4)
		-[>=0.4.16](lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol#L4)
		-[>=0.4.16](lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol#L4)
	- Version constraint >=0.8.4 is used by:
		-[>=0.8.4](lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol#L3)

contracts/BaseTask.sol#L2


## costly-loop
Impact: Informational
Confidence: Medium
 - [ ] ID-23
[MilestonePaymentTask.payMilestone(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L360-L396) has costly operations inside a loop:
	- [totalPlatformRevenue += fee](contracts/task/MilestonePaymentTask.sol#L381)
	Calls stack containing the loop:
		MilestonePaymentTask.terminateTask(uint256)

contracts/task/MilestonePaymentTask.sol#L360-L396


## solc-version
Impact: Informational
Confidence: High
 - [ ] ID-24
Version constraint >=0.8.4 contains known severe issues (https://solidity.readthedocs.io/en/latest/bugs.html)
	- FullInlinerNonExpressionSplitArgumentEvaluationOrder
	- MissingSideEffectsOnSelectorAccess
	- AbiReencodingHeadOverflowWithStaticArrayCleanup
	- DirtyBytesArrayToStorage
	- DataLocationChangeInInternalOverride
	- NestedCalldataArrayAbiReencodingSizeValidation
	- SignedImmutables.
It is used by:
	- [>=0.8.4](lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol#L3)

lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol#L3


 - [ ] ID-25
Version constraint ^0.8.20 contains known severe issues (https://solidity.readthedocs.io/en/latest/bugs.html)
	- VerbatimInvalidDeduplication
	- FullInlinerNonExpressionSplitArgumentEvaluationOrder
	- MissingSideEffectsOnSelectorAccess.
It is used by:
	- [^0.8.20](contracts/BaseTask.sol#L2)
	- [^0.8.20](contracts/DisputeResolver.sol#L2)
	- [^0.8.20](contracts/TaskToken.sol#L2)
	- [^0.8.20](contracts/task/BiddingTask.sol#L2)
	- [^0.8.20](contracts/task/FixedPaymentTask.sol#L2)
	- [^0.8.20](contracts/task/MilestonePaymentTask.sol#L2)
	- [^0.8.20](lib/openzeppelin-contracts/contracts/access/Ownable.sol#L4)
	- [^0.8.20](lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol#L4)
	- [^0.8.20](lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol#L4)
	- [^0.8.20](lib/openzeppelin-contracts/contracts/utils/Context.sol#L4)
	- [^0.8.20](lib/openzeppelin-contracts/contracts/utils/Pausable.sol#L4)
	- [^0.8.20](lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol#L4)

contracts/BaseTask.sol#L2


 - [ ] ID-26
Version constraint >=0.4.16 contains known severe issues (https://solidity.readthedocs.io/en/latest/bugs.html)
	- DirtyBytesArrayToStorage
	- ABIDecodeTwoDimensionalArrayMemory
	- KeccakCaching
	- EmptyByteArrayCopy
	- DynamicArrayCleanup
	- ImplicitConstructorCallvalueCheck
	- TupleAssignmentMultiStackSlotComponents
	- MemoryArrayCreationOverflow
	- privateCanBeOverridden
	- SignedArrayStorageCopy
	- ABIEncoderV2StorageArrayWithMultiSlotElement
	- DynamicConstructorArgumentsClippedABIV2
	- UninitializedFunctionPointerInConstructor_0.4.x
	- IncorrectEventSignatureInLibraries_0.4.x
	- ExpExponentCleanup
	- NestedArrayFunctionCallDecoder
	- ZeroFunctionSelector.
It is used by:
	- [>=0.4.16](lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol#L4)
	- [>=0.4.16](lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol#L4)
	- [>=0.4.16](lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol#L4)
	- [>=0.4.16](lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol#L4)

lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol#L4


 - [ ] ID-27
Version constraint >=0.6.2 contains known severe issues (https://solidity.readthedocs.io/en/latest/bugs.html)
	- MissingSideEffectsOnSelectorAccess
	- AbiReencodingHeadOverflowWithStaticArrayCleanup
	- DirtyBytesArrayToStorage
	- NestedCalldataArrayAbiReencodingSizeValidation
	- ABIDecodeTwoDimensionalArrayMemory
	- KeccakCaching
	- EmptyByteArrayCopy
	- DynamicArrayCleanup
	- MissingEscapingInFormatting
	- ArraySliceDynamicallyEncodedBaseType
	- ImplicitConstructorCallvalueCheck
	- TupleAssignmentMultiStackSlotComponents
	- MemoryArrayCreationOverflow.
It is used by:
	- [>=0.6.2](lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol#L4)
	- [>=0.6.2](lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4)

lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol#L4


## naming-convention
Impact: Informational
Confidence: High
 - [ ] ID-28
Parameter [DisputeResolver.fileDispute(address,uint256,address,address,uint256,string)._taskCreator](contracts/DisputeResolver.sol#L204) is not in mixedCase

contracts/DisputeResolver.sol#L204


 - [ ] ID-29
Parameter [BaseTask.updatePlatformFee(uint256)._newFee](contracts/BaseTask.sol#L174) is not in mixedCase

contracts/BaseTask.sol#L174


 - [ ] ID-30
Parameter [BiddingTask.fileDisputeByWorker(uint256)._taskId](contracts/task/BiddingTask.sol#L403) is not in mixedCase

contracts/task/BiddingTask.sol#L403


 - [ ] ID-31
Parameter [BiddingTask.getBid(uint256,uint256)._bidIndex](contracts/task/BiddingTask.sol#L454) is not in mixedCase

contracts/task/BiddingTask.sol#L454


 - [ ] ID-32
Event [MilestonePaymentTask.MilestonePaymentTask_TaskCancelled(uint256)](contracts/task/MilestonePaymentTask.sol#L56) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L56


 - [ ] ID-33
Parameter [DisputeResolver.approveProposal(uint256)._disputeId](contracts/DisputeResolver.sol#L339) is not in mixedCase

contracts/DisputeResolver.sol#L339


 - [ ] ID-34
Parameter [BiddingTask.payTask(uint256)._taskId](contracts/task/BiddingTask.sol#L369) is not in mixedCase

contracts/task/BiddingTask.sol#L369


 - [ ] ID-35
Parameter [BiddingTask.submitBid(uint256,uint256,string,uint256)._estimatedTime](contracts/task/BiddingTask.sol#L171) is not in mixedCase

contracts/task/BiddingTask.sol#L171


 - [ ] ID-36
Parameter [BiddingTask.submitBid(uint256,uint256,string,uint256)._amount](contracts/task/BiddingTask.sol#L169) is not in mixedCase

contracts/task/BiddingTask.sol#L169


 - [ ] ID-37
Event [BiddingTask.BiddingTask_ProofOfWorkSubmitted(uint256,address,string)](contracts/task/BiddingTask.sol#L68-L72) is not in CapWords

contracts/task/BiddingTask.sol#L68-L72


 - [ ] ID-38
Parameter [DisputeResolver.fileDispute(address,uint256,address,address,uint256,string)._rewardAmount](contracts/DisputeResolver.sol#L205) is not in mixedCase

contracts/DisputeResolver.sol#L205


 - [ ] ID-39
Parameter [BaseTask.submitDispute(uint256,address,address,uint256,string)._proofOfWork](contracts/BaseTask.sol#L149) is not in mixedCase

contracts/BaseTask.sol#L149


 - [ ] ID-40
Parameter [FixedPaymentTask.submitProofOfWork(uint256,string)._taskId](contracts/task/FixedPaymentTask.sol#L229) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L229


 - [ ] ID-41
Parameter [MilestonePaymentTask.completeTask(uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L338) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L338


 - [ ] ID-42
Parameter [BiddingTask.createTask(string,string,uint256)._title](contracts/task/BiddingTask.sol#L137) is not in mixedCase

contracts/task/BiddingTask.sol#L137


 - [ ] ID-43
Parameter [MilestonePaymentTask.addWorker(uint256,address,uint256)._worker](contracts/task/MilestonePaymentTask.sol#L173) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L173


 - [ ] ID-44
Event [FixedPaymentTask.FixedPaymentTask_DisputeFiledByWorker(uint256,address)](contracts/task/FixedPaymentTask.sol#L60-L63) is not in CapWords

contracts/task/FixedPaymentTask.sol#L60-L63


 - [ ] ID-45
Parameter [DisputeResolver.voteOnDispute(uint256,uint256)._workerShare](contracts/DisputeResolver.sol#L252) is not in mixedCase

contracts/DisputeResolver.sol#L252


 - [ ] ID-46
Parameter [MilestonePaymentTask.getMilestone(uint256,uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L531) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L531


 - [ ] ID-47
Parameter [BiddingTask.submitBid(uint256,uint256,string,uint256)._taskId](contracts/task/BiddingTask.sol#L168) is not in mixedCase

contracts/task/BiddingTask.sol#L168


 - [ ] ID-48
Parameter [MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)._milestoneIndex](contracts/task/MilestonePaymentTask.sol#L266) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L266


 - [ ] ID-49
Parameter [BaseTask.submitDispute(uint256,address,address,uint256,string)._taskId](contracts/BaseTask.sol#L145) is not in mixedCase

contracts/BaseTask.sol#L145


 - [ ] ID-50
Modifier [MilestonePaymentTask.InvalidMilestoneIndex(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L112-L118) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L112-L118


 - [ ] ID-51
Parameter [BiddingTask.acceptBid(uint256,uint256)._taskId](contracts/task/BiddingTask.sol#L213) is not in mixedCase

contracts/task/BiddingTask.sol#L213


 - [ ] ID-52
Parameter [FixedPaymentTask.approveProofOfWork(uint256,address)._worker](contracts/task/FixedPaymentTask.sol#L262) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L262


 - [ ] ID-53
Parameter [MilestonePaymentTask.getMilestonesCount(uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L520) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L520


 - [ ] ID-54
Parameter [DisputeResolver.voteOnDispute(uint256,uint256)._disputeId](contracts/DisputeResolver.sol#L251) is not in mixedCase

contracts/DisputeResolver.sol#L251


 - [ ] ID-55
Parameter [MilestonePaymentTask.addMilestone(uint256,string,uint256)._reward](contracts/task/MilestonePaymentTask.sol#L209) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L209


 - [ ] ID-56
Parameter [BaseTask.submitDispute(uint256,address,address,uint256,string)._taskCreator](contracts/BaseTask.sol#L147) is not in mixedCase

contracts/BaseTask.sol#L147


 - [ ] ID-57
Parameter [DisputeResolver.processVotes(uint256)._disputeId](contracts/DisputeResolver.sol#L292) is not in mixedCase

contracts/DisputeResolver.sol#L292


 - [ ] ID-58
Parameter [BiddingTask.terminateTask(uint256)._taskId](contracts/task/BiddingTask.sol#L267) is not in mixedCase

contracts/task/BiddingTask.sol#L267


 - [ ] ID-59
Event [BiddingTask.BiddingTask_TaskWorkerAdded(uint256,address)](contracts/task/BiddingTask.sol#L55-L58) is not in CapWords

contracts/task/BiddingTask.sol#L55-L58


 - [ ] ID-60
Event [BiddingTask.BiddingTask_TaskCancelled(uint256)](contracts/task/BiddingTask.sol#L60) is not in CapWords

contracts/task/BiddingTask.sol#L60


 - [ ] ID-61
Event [FixedPaymentTask.FixedPaymentTask_ProofOfWorkSubmitted(uint256,address,string)](contracts/task/FixedPaymentTask.sol#L51-L55) is not in CapWords

contracts/task/FixedPaymentTask.sol#L51-L55


 - [ ] ID-62
Parameter [BaseTask.changedeadline(uint256,uint256)._deadline](contracts/BaseTask.sol#L211) is not in mixedCase

contracts/BaseTask.sol#L211


 - [ ] ID-63
Parameter [DisputeResolver.getDispute(uint256)._disputeId](contracts/DisputeResolver.sol#L524) is not in mixedCase

contracts/DisputeResolver.sol#L524


 - [ ] ID-64
Parameter [DisputeResolver.fileDispute(address,uint256,address,address,uint256,string)._taskContract](contracts/DisputeResolver.sol#L201) is not in mixedCase

contracts/DisputeResolver.sol#L201


 - [ ] ID-65
Parameter [FixedPaymentTask.payTask(uint256)._taskId](contracts/task/FixedPaymentTask.sol#L288) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L288


 - [ ] ID-66
Event [MilestonePaymentTask.MilestonePaymentTask_TaskWorkerAdded(uint256,address)](contracts/task/MilestonePaymentTask.sol#L52-L55) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L52-L55


 - [ ] ID-67
Event [DisputeResolver.DisputeResolver_FundsDistributed(uint256,address,uint256,address)](contracts/DisputeResolver.sol#L122-L127) is not in CapWords

contracts/DisputeResolver.sol#L122-L127


 - [ ] ID-68
Parameter [DisputeResolver.distributeFunds(uint256)._disputeId](contracts/DisputeResolver.sol#L386) is not in mixedCase

contracts/DisputeResolver.sol#L386


 - [ ] ID-69
Parameter [BaseTask.increaseReward(uint256,uint256)._taskId](contracts/BaseTask.sol#L224) is not in mixedCase

contracts/BaseTask.sol#L224


 - [ ] ID-70
Event [FixedPaymentTask.FixedPaymentTask_TaskWorkerRemoved(uint256,address)](contracts/task/FixedPaymentTask.sol#L41-L44) is not in CapWords

contracts/task/FixedPaymentTask.sol#L41-L44


 - [ ] ID-71
Event [FixedPaymentTask.FixedPaymentTask_TaskWorkerAdded(uint256,address)](contracts/task/FixedPaymentTask.sol#L37-L40) is not in CapWords

contracts/task/FixedPaymentTask.sol#L37-L40


 - [ ] ID-72
Parameter [DisputeResolver.fileDispute(address,uint256,address,address,uint256,string)._taskId](contracts/DisputeResolver.sol#L202) is not in mixedCase

contracts/DisputeResolver.sol#L202


 - [ ] ID-73
Parameter [BiddingTask.getBid(uint256,uint256)._taskId](contracts/task/BiddingTask.sol#L453) is not in mixedCase

contracts/task/BiddingTask.sol#L453


 - [ ] ID-74
Parameter [BiddingTask.submitProofOfWork(uint256,string)._taskId](contracts/task/BiddingTask.sol#L310) is not in mixedCase

contracts/task/BiddingTask.sol#L310


 - [ ] ID-75
Parameter [BiddingTask.addWorker(uint256,address,uint256)._worker](contracts/task/BiddingTask.sol#L243) is not in mixedCase

contracts/task/BiddingTask.sol#L243


 - [ ] ID-76
Parameter [DisputeResolver.rejectProposal(uint256)._disputeId](contracts/DisputeResolver.sol#L466) is not in mixedCase

contracts/DisputeResolver.sol#L466


 - [ ] ID-77
Event [BiddingTask.BiddingTask_ProofOfWorkApproved(uint256,address)](contracts/task/BiddingTask.sol#L74-L77) is not in CapWords

contracts/task/BiddingTask.sol#L74-L77


 - [ ] ID-78
Parameter [MilestonePaymentTask.addWorker(uint256,address,uint256)._reward](contracts/task/MilestonePaymentTask.sol#L174) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L174


 - [ ] ID-79
Parameter [BiddingTask.submitBid(uint256,uint256,string,uint256)._description](contracts/task/BiddingTask.sol#L170) is not in mixedCase

contracts/task/BiddingTask.sol#L170


 - [ ] ID-80
Parameter [MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)._taskId](contracts/task/MilestonePaymentTask.sol#L265) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L265


 - [ ] ID-81
Parameter [MilestonePaymentTask.createTask(string,string,uint256)._deadline](contracts/task/MilestonePaymentTask.sol#L139) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L139


 - [ ] ID-82
Event [BiddingTask.BiddingTask_BidSubmitted(uint256,address,uint256)](contracts/task/BiddingTask.sol#L49-L53) is not in CapWords

contracts/task/BiddingTask.sol#L49-L53


 - [ ] ID-83
Parameter [MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L467) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L467


 - [ ] ID-84
Parameter [BaseTask.submitDispute(uint256,address,address,uint256,string)._rewardAmount](contracts/BaseTask.sol#L148) is not in mixedCase

contracts/BaseTask.sol#L148


 - [ ] ID-85
Parameter [BaseTask.getTask(uint256)._taskId](contracts/BaseTask.sol#L244) is not in mixedCase

contracts/BaseTask.sol#L244


 - [ ] ID-86
Parameter [BaseTask.submitDispute(uint256,address,address,uint256,string)._worker](contracts/BaseTask.sol#L146) is not in mixedCase

contracts/BaseTask.sol#L146


 - [ ] ID-87
Parameter [FixedPaymentTask.createTask(string,string,uint256)._description](contracts/task/FixedPaymentTask.sol#L119) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L119


 - [ ] ID-88
Event [DisputeResolver.DisputeResolver_AdminStaked(address,uint256)](contracts/DisputeResolver.sol#L131) is not in CapWords

contracts/DisputeResolver.sol#L131


 - [ ] ID-89
Event [MilestonePaymentTask.MilestonePaymentTask_MilestoneApproved(uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L57-L60) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L57-L60


 - [ ] ID-90
Event [MilestonePaymentTask.MilestonePaymentTask_MilestonePaid(uint256,uint256,uint256,uint256)](contracts/task/MilestonePaymentTask.sol#L61-L66) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L61-L66


 - [ ] ID-91
Event [DisputeResolver.DisputeResolver_ProposalApprovedByCreator(uint256,address)](contracts/DisputeResolver.sol#L117-L120) is not in CapWords

contracts/DisputeResolver.sol#L117-L120


 - [ ] ID-92
Parameter [BaseTask.increaseReward(uint256,uint256)._reward](contracts/BaseTask.sol#L224) is not in mixedCase

contracts/BaseTask.sol#L224


 - [ ] ID-93
Event [DisputeResolver.DisputeResolver_DisputeResolved(uint256,uint256)](contracts/DisputeResolver.sol#L107-L110) is not in CapWords

contracts/DisputeResolver.sol#L107-L110


 - [ ] ID-94
Event [FixedPaymentTask.FixedPaymentTask_ProofOfWorkApproved(uint256,address)](contracts/task/FixedPaymentTask.sol#L56-L59) is not in CapWords

contracts/task/FixedPaymentTask.sol#L56-L59


 - [ ] ID-95
Event [BiddingTask.BiddingTask_TaskPaid(uint256,uint256,uint256)](contracts/task/BiddingTask.sol#L62-L66) is not in CapWords

contracts/task/BiddingTask.sol#L62-L66


 - [ ] ID-96
Event [MilestonePaymentTask.MilestonePaymentTask_DisputeFiledByWorker(uint256,address)](contracts/task/MilestonePaymentTask.sol#L72-L75) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L72-L75


 - [ ] ID-97
Event [FixedPaymentTask.FixedPaymentTask_TaskCancelled(uint256)](contracts/task/FixedPaymentTask.sol#L45) is not in CapWords

contracts/task/FixedPaymentTask.sol#L45


 - [ ] ID-98
Event [DisputeResolver.DisputeResolver_ProposalRejected(uint256)](contracts/DisputeResolver.sol#L129) is not in CapWords

contracts/DisputeResolver.sol#L129


 - [ ] ID-99
Event [FixedPaymentTask.FixedPaymentTask_TaskPaid(uint256,uint256,uint256)](contracts/task/FixedPaymentTask.sol#L46-L50) is not in CapWords

contracts/task/FixedPaymentTask.sol#L46-L50


 - [ ] ID-100
Parameter [MilestonePaymentTask.createTask(string,string,uint256)._title](contracts/task/MilestonePaymentTask.sol#L137) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L137


 - [ ] ID-101
Event [DisputeResolver.DisputeResolver_AdminWithdrawn(address,uint256)](contracts/DisputeResolver.sol#L133) is not in CapWords

contracts/DisputeResolver.sol#L133


 - [ ] ID-102
Parameter [BiddingTask.approveProofOfWork(uint256,address)._worker](contracts/task/BiddingTask.sol#L343) is not in mixedCase

contracts/task/BiddingTask.sol#L343


 - [ ] ID-103
Parameter [FixedPaymentTask.addWorker(uint256,address,uint256)._taskId](contracts/task/FixedPaymentTask.sol#L152) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L152


 - [ ] ID-104
Parameter [FixedPaymentTask.terminateTask(uint256)._taskId](contracts/task/FixedPaymentTask.sol#L186) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L186


 - [ ] ID-105
Parameter [MilestonePaymentTask.payMilestone(uint256,uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L361) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L361


 - [ ] ID-106
Parameter [FixedPaymentTask.fileDisputeByWorker(uint256)._taskId](contracts/task/FixedPaymentTask.sol#L322) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L322


 - [ ] ID-107
Parameter [BiddingTask.addWorker(uint256,address,uint256)._reward](contracts/task/BiddingTask.sol#L244) is not in mixedCase

contracts/task/BiddingTask.sol#L244


 - [ ] ID-108
Event [BiddingTask.BiddingTask_DisputeFiledByWorker(uint256,address)](contracts/task/BiddingTask.sol#L79-L82) is not in CapWords

contracts/task/BiddingTask.sol#L79-L82


 - [ ] ID-109
Parameter [FixedPaymentTask.submitProofOfWork(uint256,string)._proof](contracts/task/FixedPaymentTask.sol#L230) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L230


 - [ ] ID-110
Parameter [MilestonePaymentTask.terminateTask(uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L403) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L403


 - [ ] ID-111
Event [MilestonePaymentTask.MilestonePaymentTask_MilestoneAdded(uint256,uint256,string,uint256)](contracts/task/MilestonePaymentTask.sol#L76-L81) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L76-L81


 - [ ] ID-112
Parameter [BiddingTask.acceptBid(uint256,uint256)._bidIndex](contracts/task/BiddingTask.sol#L214) is not in mixedCase

contracts/task/BiddingTask.sol#L214


 - [ ] ID-113
Parameter [BiddingTask.createTask(string,string,uint256)._deadline](contracts/task/BiddingTask.sol#L139) is not in mixedCase

contracts/task/BiddingTask.sol#L139


 - [ ] ID-114
Parameter [BiddingTask.createTask(string,string,uint256)._description](contracts/task/BiddingTask.sol#L138) is not in mixedCase

contracts/task/BiddingTask.sol#L138


 - [ ] ID-115
Parameter [BiddingTask.approveProofOfWork(uint256,address)._taskId](contracts/task/BiddingTask.sol#L342) is not in mixedCase

contracts/task/BiddingTask.sol#L342


 - [ ] ID-116
Parameter [FixedPaymentTask.addWorker(uint256,address,uint256)._worker](contracts/task/FixedPaymentTask.sol#L153) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L153


 - [ ] ID-117
Parameter [MilestonePaymentTask.fileDisputeByWorker(uint256,uint256)._milestoneIndex](contracts/task/MilestonePaymentTask.sol#L468) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L468


 - [ ] ID-118
Parameter [FixedPaymentTask.createTask(string,string,uint256)._deadline](contracts/task/FixedPaymentTask.sol#L120) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L120


 - [ ] ID-119
Parameter [DisputeResolver.getAdminStake(address)._admin](contracts/DisputeResolver.sol#L534) is not in mixedCase

contracts/DisputeResolver.sol#L534


 - [ ] ID-120
Parameter [MilestonePaymentTask.addWorker(uint256,address,uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L172) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L172


 - [ ] ID-121
Event [MilestonePaymentTask.MilestonePaymentTask_ProofOfWorkSubmitted(uint256,address,string)](contracts/task/MilestonePaymentTask.sol#L67-L71) is not in CapWords

contracts/task/MilestonePaymentTask.sol#L67-L71


 - [ ] ID-122
Event [DisputeResolver.DisputeResolver_ProposalApprovedByWorker(uint256,address)](contracts/DisputeResolver.sol#L112-L115) is not in CapWords

contracts/DisputeResolver.sol#L112-L115


 - [ ] ID-123
Parameter [DisputeResolver.fileDispute(address,uint256,address,address,uint256,string)._worker](contracts/DisputeResolver.sol#L203) is not in mixedCase

contracts/DisputeResolver.sol#L203


 - [ ] ID-124
Parameter [MilestonePaymentTask.approveMilestone(uint256,uint256)._milestoneIndex](contracts/task/MilestonePaymentTask.sol#L311) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L311


 - [ ] ID-125
Parameter [FixedPaymentTask.approveProofOfWork(uint256,address)._taskId](contracts/task/FixedPaymentTask.sol#L261) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L261


 - [ ] ID-126
Event [DisputeResolver.DisputeResolver_DisputeFiled(uint256,uint256,address,address,address)](contracts/DisputeResolver.sol#L99-L105) is not in CapWords

contracts/DisputeResolver.sol#L99-L105


 - [ ] ID-127
Parameter [MilestonePaymentTask.createTask(string,string,uint256)._description](contracts/task/MilestonePaymentTask.sol#L138) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L138


 - [ ] ID-128
Parameter [MilestonePaymentTask.submitMilestoneProofOfWork(uint256,uint256,string)._proof](contracts/task/MilestonePaymentTask.sol#L267) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L267


 - [ ] ID-129
Parameter [MilestonePaymentTask.addMilestone(uint256,string,uint256)._description](contracts/task/MilestonePaymentTask.sol#L208) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L208


 - [ ] ID-130
Parameter [MilestonePaymentTask.getMilestone(uint256,uint256)._milestoneIndex](contracts/task/MilestonePaymentTask.sol#L532) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L532


 - [ ] ID-131
Parameter [DisputeResolver.fileDispute(address,uint256,address,address,uint256,string)._proofOfWork](contracts/DisputeResolver.sol#L206) is not in mixedCase

contracts/DisputeResolver.sol#L206


 - [ ] ID-132
Parameter [MilestonePaymentTask.approveMilestone(uint256,uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L310) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L310


 - [ ] ID-133
Parameter [BiddingTask.submitProofOfWork(uint256,string)._proof](contracts/task/BiddingTask.sol#L311) is not in mixedCase

contracts/task/BiddingTask.sol#L311


 - [ ] ID-134
Parameter [FixedPaymentTask.addWorker(uint256,address,uint256)._reward](contracts/task/FixedPaymentTask.sol#L154) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L154


 - [ ] ID-135
Parameter [MilestonePaymentTask.payMilestone(uint256,uint256)._milestoneIndex](contracts/task/MilestonePaymentTask.sol#L362) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L362


 - [ ] ID-136
Parameter [BaseTask.changedeadline(uint256,uint256)._taskId](contracts/BaseTask.sol#L211) is not in mixedCase

contracts/BaseTask.sol#L211


 - [ ] ID-137
Event [DisputeResolver.DisputeResolver_AdminVoted(uint256,address,uint256)](contracts/DisputeResolver.sol#L135-L139) is not in CapWords

contracts/DisputeResolver.sol#L135-L139


 - [ ] ID-138
Parameter [MilestonePaymentTask.addMilestone(uint256,string,uint256)._taskId](contracts/task/MilestonePaymentTask.sol#L207) is not in mixedCase

contracts/task/MilestonePaymentTask.sol#L207


 - [ ] ID-139
Parameter [BiddingTask.addWorker(uint256,address,uint256)._taskId](contracts/task/BiddingTask.sol#L242) is not in mixedCase

contracts/task/BiddingTask.sol#L242


 - [ ] ID-140
Parameter [BiddingTask.getBidCount(uint256)._taskId](contracts/task/BiddingTask.sol#L442) is not in mixedCase

contracts/task/BiddingTask.sol#L442


 - [ ] ID-141
Parameter [FixedPaymentTask.createTask(string,string,uint256)._title](contracts/task/FixedPaymentTask.sol#L118) is not in mixedCase

contracts/task/FixedPaymentTask.sol#L118


## constable-states
Impact: Optimization
Confidence: High
 - [ ] ID-142
[DisputeResolver.adminStakeAmount](contracts/DisputeResolver.sol#L63) should be constant 

contracts/DisputeResolver.sol#L63


 - [ ] ID-143
[BaseTask.minTimeBeforeDispute](contracts/BaseTask.sol#L62) should be constant 

contracts/BaseTask.sol#L62


 - [ ] ID-144
[DisputeResolver.disputeProcessingRewardBps](contracts/DisputeResolver.sol#L66) should be constant 

contracts/DisputeResolver.sol#L66


## immutable-states
Impact: Optimization
Confidence: High
 - [ ] ID-145
[TaskToken._decimals](contracts/TaskToken.sol#L14) should be immutable 

contracts/TaskToken.sol#L14


 - [ ] ID-146
[BaseTask.taskToken](contracts/BaseTask.sol#L71) should be immutable 

contracts/BaseTask.sol#L71


 - [ ] ID-147
[DisputeResolver.taskToken](contracts/DisputeResolver.sol#L57) should be immutable 

contracts/DisputeResolver.sol#L57


 - [ ] ID-148
[BaseTask.disputeResolver](contracts/BaseTask.sol#L74) should be immutable 

contracts/BaseTask.sol#L74


