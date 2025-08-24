import { defineConfig } from "@wagmi/cli";
import { erc20Abi } from "viem";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "packages/webapps/lib/contracts/generated.ts",
  plugins: [
    react(),
    hardhat({
      // include: ["TeamEconomy.sol/*.json"],
      artifacts: "ignition/deployments/chain-11155111/artifacts",
      project: "./packages/contracts",
      deployments: {
        // IDOToken: "0x0000000000000000000000000000000000000000",
        // WEDOToken: "0x0000000000000000000000000000000000000000",
        // IDOToken: "0xfa32948220D3F4E6401491cf88636a7E1e38F3cE",
        // TeamManager: "0xb757719939fC8D21fbbe9bd24c91E1288F7f7018",
        // WEDOToken: "0xD14DF4ff6B468410A43fDAFf959EE30d6e4f5E41",
        // TeamEconomy: "0x7fC80105C7F1a0a55fceF85D78e1A306eBA9A81a",
        // IDOToken: "0x89490Dc1049bb0f21811c520F53a23eb776954AD",
        // TeamManager: "0xEDc75E0b88605D4a8396F76F267361AC5160578c",
        // WEDOToken: "0x97d21571896535ceC6D9Ab73F4199f9bcd98731e",
        // TeamEconomy: "0xcC59b9B03Fd3632727A7a37B59CeFF3C2Aad042d",
        IDOToken: "0xcCe76481522f01E9e79448cF635432D84b92d38A",
        TeamManager: "0xc23536a8B777B025b4708760857B87FeDfA7b773",
        WEDOToken: "0x0568Ac3966fF048b76C4b0dE495E5ea346B28683",
        TeamEconomy: "0x29416cd2F992B5E334b7952566A61C49aebA91E9",
      },
    }),
  ],
});
