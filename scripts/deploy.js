const hre = require("hardhat");

async function main() {
  const LostFound = await hre.ethers.getContractFactory("LostFound");
  const lostFound = await LostFound.deploy();
  await lostFound.waitForDeployment();
  console.log("LostFound deployed to:", await lostFound.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});