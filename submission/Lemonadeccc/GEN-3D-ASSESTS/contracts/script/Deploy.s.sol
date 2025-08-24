// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Asset3DNFT} from "../src/Asset3DNFT.sol";

contract DeployAsset3DNFT is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        string memory baseUri = vm.envOr("BASE_URI", string("https://api.3dnft.example.com/metadata/"));
        string memory name = vm.envOr("NFT_NAME", string("3D Asset NFT"));
        string memory symbol = vm.envOr("NFT_SYMBOL", string("3DNFT"));

        console.log("Deploying Asset3DNFT...");
        console.log("Deployer:", deployer);
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Base URI:", baseUri);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Asset3DNFT contract
        Asset3DNFT asset3d = new Asset3DNFT(
            name,
            symbol,
            baseUri,
            deployer // deployer as default admin
        );

        vm.stopBroadcast();

        console.log("Asset3DNFT deployed at:", address(asset3d));
        console.log("Default admin:", deployer);

        // Verify roles
        console.log("Has DEFAULT_ADMIN_ROLE:", asset3d.hasRole(asset3d.DEFAULT_ADMIN_ROLE(), deployer));
        console.log("Has MINTER_ROLE:", asset3d.hasRole(asset3d.MINTER_ROLE(), deployer));
        console.log("Has UPGRADER_ROLE:", asset3d.hasRole(asset3d.UPGRADER_ROLE(), deployer));
        console.log("Has PAUSER_ROLE:", asset3d.hasRole(asset3d.PAUSER_ROLE(), deployer));

        // Save deployment info
        string memory deploymentInfo = string(
            abi.encodePacked(
                "{\n",
                '  "contractAddress": "',
                vm.toString(address(asset3d)),
                '",\n',
                '  "deployer": "',
                vm.toString(deployer),
                '",\n',
                '  "name": "',
                name,
                '",\n',
                '  "symbol": "',
                symbol,
                '",\n',
                '  "baseURI": "',
                baseUri,
                '",\n',
                '  "blockNumber": ',
                vm.toString(block.number),
                ",\n",
                '  "timestamp": ',
                vm.toString(block.timestamp),
                "\n",
                "}"
            )
        );

        vm.writeFile("deployment-asset3dnft.json", deploymentInfo);
        console.log("Deployment info saved to deployment-asset3dnft.json");
    }
}

contract SetupRoles is Script {
    function run() external {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        uint256 adminPrivateKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(adminPrivateKey);

        address minterAddress = vm.envOr("MINTER_ADDRESS", admin);
        address upgraderAddress = vm.envOr("UPGRADER_ADDRESS", admin);

        console.log("Setting up roles for Asset3DNFT at:", contractAddress);
        console.log("Admin:", admin);
        console.log("Minter:", minterAddress);
        console.log("Upgrader:", upgraderAddress);

        Asset3DNFT asset3d = Asset3DNFT(contractAddress);

        vm.startBroadcast(adminPrivateKey);

        // Grant minter role if different from admin
        if (minterAddress != admin) {
            asset3d.grantRole(asset3d.MINTER_ROLE(), minterAddress);
            console.log("Granted MINTER_ROLE to:", minterAddress);
        }

        // Grant upgrader role if different from admin
        if (upgraderAddress != admin) {
            asset3d.grantRole(asset3d.UPGRADER_ROLE(), upgraderAddress);
            console.log("Granted UPGRADER_ROLE to:", upgraderAddress);
        }

        vm.stopBroadcast();

        console.log("Role setup completed");
    }
}
