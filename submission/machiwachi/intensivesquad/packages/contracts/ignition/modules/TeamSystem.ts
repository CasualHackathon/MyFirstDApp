import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TeamSystem = buildModule("TeamSystem", (m) => {
  const admin = m.getAccount(0);

  const ido = m.contract("IDOToken", ["IDO Token", "IDO", admin]);
  const wedo = m.contract("WEDOToken", ["WEDO Token", "WEDO", admin]);
  const manager = m.contract("TeamManager", [admin, 6n]);
  const economy = m.contract("TeamEconomy", [
    ido,
    wedo,
    manager,
    m.getParameter("initialS", 1000n),
    m.getParameter("sDelay", 0n),
    admin,
  ]);

  m.call(manager, "setEconomy", [economy]);

  // Grant MINTER_ROLE to admin for IDO token
  m.call(
    ido,
    "grantRole",
    [
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // MINTER_ROLE
      admin,
    ],
    { id: "grant_ido_minter_role_to_admin" }
  );

  // Grant MINTER_ROLE to TeamEconomy contract for IDO token
  m.call(
    ido,
    "grantRole",
    [
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // MINTER_ROLE
      economy,
    ],
    { id: "grant_ido_minter_role_to_economy" }
  );

  // Grant MINTER_ROLE to admin for WEDO token
  m.call(
    wedo,
    "grantRole",
    [
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // MINTER_ROLE
      admin,
    ],
    { id: "grant_wedo_minter_role_to_admin" }
  );

  // Grant MINTER_ROLE to TeamEconomy contract for WEDO token
  m.call(
    wedo,
    "grantRole",
    [
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // MINTER_ROLE
      economy,
    ],
    { id: "grant_wedo_minter_role_to_economy" }
  );

  return { ido, wedo, manager, economy };
});

export default TeamSystem;
