const { ethers } = require("hardhat");

async function main() {
  const StackupFoundingMembership = await ethers.getContractFactory(
    "StackupFoundingMembership"
  );
  const stackupFoundingMembership = await StackupFoundingMembership.deploy(
    "StackupFoundingMembership",
    "SFFM"
  );

  try {
    await stackupFoundingMembership.deployed();
    console.log(
      `Success! Contract deployed to ${stackupFoundingMembership.address}`
    );
  } catch (err) {
    console.log(`deployment error: ${err.message}`);
  }

  // CID from Pinata for json metadata file
  try {
    const newItemId = await stackupFoundingMembership.mint(
      "https://ipfs.io/ipfs/QmPRZPfNuwoVy7Y2VtvMvucZqnRfMBzGzYbqTnsWVQsB88"
    );
    console.log(`NFT succesfully minted! :::: ${newItemId}`);
  } catch (err) {
    console.log(`minting error: ${err.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
