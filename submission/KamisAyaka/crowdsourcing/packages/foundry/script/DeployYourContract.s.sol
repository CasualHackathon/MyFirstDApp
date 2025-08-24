// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/TaskToken.sol";
import "../contracts/DisputeResolver.sol";
import "../contracts/UserInfo.sol";
import "../contracts/task/FixedPaymentTask.sol";
import "../contracts/task/BiddingTask.sol";
import "../contracts/task/MilestonePaymentTask.sol";

/**
 * @notice Deploy script for YourContract contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployYourContract.s.sol  # local anvil chain
 * yarn deploy --file DeployYourContract.s.sol --network optimism # live network (requires keystore)
 */
contract DeployYourContract is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
        // Deploy TaskToken contract
        TaskToken taskToken = new TaskToken("Task Token", "TASK", 18);
        console.log("TaskToken deployed to:", address(taskToken));

        // Deploy DisputeResolver contract
        DisputeResolver disputeResolver = new DisputeResolver(taskToken);
        console.log("DisputeResolver deployed to:", address(disputeResolver));

        // Deploy UserInfo contract
        UserInfo userInfo = new UserInfo();
        console.log("UserInfo deployed to:", address(userInfo));

        // Deploy FixedPaymentTask contract
        FixedPaymentTask fixedPaymentTask = new FixedPaymentTask(taskToken, IDisputeResolver(address(disputeResolver)));
        console.log("FixedPaymentTask deployed to:", address(fixedPaymentTask));

        // Deploy BiddingTask contract
        BiddingTask biddingTask = new BiddingTask(taskToken, IDisputeResolver(address(disputeResolver)));
        console.log("BiddingTask deployed to:", address(biddingTask));

        // Deploy MilestonePaymentTask contract
        MilestonePaymentTask milestonePaymentTask =
            new MilestonePaymentTask(taskToken, IDisputeResolver(address(disputeResolver)));
        console.log("MilestonePaymentTask deployed to:", address(milestonePaymentTask));

        // Output deployment information
        console.log("=====================================");
        console.log("All contracts deployed successfully:");
        console.log("- TaskToken: ", address(taskToken));
        console.log("- DisputeResolver: ", address(disputeResolver));
        console.log("- UserInfo: ", address(userInfo));
        console.log("- FixedPaymentTask: ", address(fixedPaymentTask));
        console.log("- BiddingTask: ", address(biddingTask));
        console.log("- MilestonePaymentTask: ", address(milestonePaymentTask));
        console.log("=====================================");
    }
}
