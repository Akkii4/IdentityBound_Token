const { ethers } = require("hardhat");

async function main() {
  const IdentityTokensContract = await ethers.getContractFactory(
    "IdentityTokens"
  );
  const name = "Identity Tokens";
  const symbol = "IDT";
  const identityTokens = await IdentityTokensContract.deploy(name, symbol);
  await identityTokens.deployed();
  console.log(`IdentityTokens contract deployed to: ${identityTokens.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
