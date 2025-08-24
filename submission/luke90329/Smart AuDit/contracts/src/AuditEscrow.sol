// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Network: Sepolia (11155111) or local Anvil (31337)
 * SERVICE_ADDRESS must be configured at deployment.
 * Invariants:
 * - Pull payment pattern; funds held per job until completion or refund.
 * - complete, refund, markFailed are mutually consistent.
 * - Refund allowed immediately if failed, or after REFUND_DELAY if pending.
 */
contract AuditEscrow {
	struct Job {
		address user;
		uint256 amount; // in wei
		uint64 paidAt; // block timestamp when paid
		bool completed;
		bool failed; // mark audit failed; user can refund immediately
		string reportCID; // IPFS/hash or URL (on completed)
	}

	event JobPaid(uint256 indexed id, address indexed user, uint256 amount);
	event JobCompleted(uint256 indexed id, string reportCID);
	event JobRefunded(uint256 indexed id, address indexed to, uint256 amount);
	event JobFailed(uint256 indexed id, string reason);

	address public immutable service; // service operator allowed to complete/markFailed
	uint256 public constant REFUND_DELAY = 5 minutes;

	mapping(uint256 => Job) public jobs; // public getter for frontend on-chain verification

	modifier onlyService() {
		require(msg.sender == service, "ONLY_SERVICE");
		_;
	}

	constructor(address serviceAddress) {
		require(serviceAddress != address(0), "SERVICE_REQUIRED");
		service = serviceAddress;
	}

	/**
	 * Create a job and pay in a single transaction.
	 * Caller is the user who pays and becomes the job owner.
	 */
	function createAndPay(uint256 id) external payable {
		require(msg.value > 0, "NO_PAYMENT");
		Job storage job = jobs[id];
		require(job.user == address(0), "JOB_EXISTS");

		job.user = msg.sender;
		job.amount = msg.value;
		job.paidAt = uint64(block.timestamp);

		emit JobPaid(id, msg.sender, msg.value);
	}

	/**
	 * Mark a job as completed. Only service can complete; attaches report location (CID/URL).
	 */
	function complete(uint256 id, string calldata reportCID) external onlyService {
		Job storage job = jobs[id];
		require(job.user != address(0), "JOB_NOT_FOUND");
		require(!job.completed, "ALREADY_COMPLETED");
		require(!job.failed, "JOB_FAILED");

		job.completed = true;
		job.reportCID = reportCID;

		// Funds are considered earned by the service; pull to service
		uint256 amount = job.amount;
		job.amount = 0;
		(bool ok, ) = payable(service).call{value: amount}("");
		require(ok, "TRANSFER_FAILED");

		emit JobCompleted(id, reportCID);
	}

	/**
	 * Mark a job as failed. Only service can mark; enables immediate refund by user.
	 */
	function markFailed(uint256 id, string calldata reason) external onlyService {
		Job storage job = jobs[id];
		require(job.user != address(0), "JOB_NOT_FOUND");
		require(!job.completed, "ALREADY_COMPLETED");
		require(!job.failed, "ALREADY_FAILED");

		job.failed = true;
		emit JobFailed(id, reason);
	}

	/**
	 * Refund to the original user if failed or not completed after REFUND_DELAY.
	 */
	function refund(uint256 id) external {
		Job storage job = jobs[id];
		require(job.user != address(0), "JOB_NOT_FOUND");
		require(!job.completed, "ALREADY_COMPLETED");
		require(job.amount > 0, "ALREADY_REFUNDED");
		require(msg.sender == job.user || msg.sender == service, "NOT_AUTHORIZED");
		bool refundable = job.failed || (block.timestamp >= uint256(job.paidAt) + REFUND_DELAY);
		require(refundable, "NOT_REFUNDABLE_YET");

		uint256 amount = job.amount;
		job.amount = 0;
		(bool ok, ) = payable(job.user).call{value: amount}("");
		require(ok, "REFUND_FAILED");

		emit JobRefunded(id, job.user, amount);
	}
}
