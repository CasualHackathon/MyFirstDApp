import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { network } from "hardhat";

describe("TeamSystem", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [admin, alice, bob, carol] = await viem.getWalletClients();

  const deploy = async () => {
    const ido = await viem.deployContract("IDOToken", [
      "IDO Token",
      "IDO",
      admin.account.address,
    ]);
    const wedo = await viem.deployContract("WEDOToken", [
      "WEDO Token",
      "WEDO",
      admin.account.address,
    ]);
    const manager = await viem.deployContract("TeamManager", [
      admin.account.address,
      10n, // maxTeamCapacity
    ]);
    const economy = await viem.deployContract("TeamEconomy", [
      ido.address,
      wedo.address,
      manager.address,
      10n ** 18n,
      0n,
      admin.account.address,
    ]);

    await manager.write.setEconomy([economy.address], {
      account: admin.account,
    });

    // grant roles
    const MINTER_ROLE = await ido.read.DEFAULT_ADMIN_ROLE(); // default admin for simplicity
    await ido.write.grantRole([await ido.read.MINTER_ROLE(), economy.address], {
      account: admin.account,
    });
    await wedo.write.grantRole(
      [await wedo.read.MINTER_ROLE(), admin.account.address],
      { account: admin.account }
    );
    await wedo.write.grantRole(
      [await wedo.read.MINTER_ROLE(), economy.address],
      { account: admin.account }
    );

    await economy.write.grantRole(
      [await economy.read.DISTRIBUTOR_ROLE(), admin.account.address],
      { account: admin.account }
    );

    return { ido, wedo, manager, economy };
  };

  it("end-to-end: create team, join, credit, withdraw, claim", async () => {
    const { ido, wedo, manager, economy } = await deploy();

    // create team 1
    await manager.write.createTeam(["Team 1"], { account: admin.account });

    // join alice & bob
    await manager.write.join([1n], { account: alice.account });
    await manager.write.join([1n], { account: bob.account });

    // credit team WEDO = 100
    await economy.write.creditTeamWEDO([1n, 100n], { account: admin.account });

    // R=2, L = S*(lMin+(lMax-lMin)*R/n0) with S=1e18
    const L = await economy.read.getTeamL([1n]);
    assert.equal(L > 0n, true);

    // withdraw 60 WEDO
    await economy.write.withdraw([1n, 60n], { account: alice.account });

    // each should have some pending
    const pa = await economy.read.pendingIdo([1n, alice.account.address]);
    const pb = await economy.read.pendingIdo([1n, bob.account.address]);
    assert.equal(pa, pb);

    // claim for alice
    const balBefore = await ido.read.balanceOf([alice.account.address]);
    await economy.write.claim([1n], { account: alice.account });
    const balAfter = await ido.read.balanceOf([alice.account.address]);
    assert.equal(balAfter - balBefore, pa);
  });
});
