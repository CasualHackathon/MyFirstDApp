//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployWeatherNFT } from "./DeployWeatherNFT.s.sol";

/**
 * @notice Main deployment script for WeatherNFT contract
 * @dev Run this when you want to deploy WeatherNFT contract
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys WeatherNFT contract
        // Add new deployments here when needed

        // Deploy WeatherNFT contract
        DeployWeatherNFT deployWeatherNFT = new DeployWeatherNFT();
        deployWeatherNFT.run();
    }
}
