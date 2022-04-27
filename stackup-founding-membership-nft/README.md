# Stackup Founding Membership NFT

This Hardhat project contains a ERC-721 smart contract for the Stackup Founding Membership NFT, found under the 'contracts' folder.

## Hardhat task reference commands:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

## Setup
1) Create a new '.env' file in the root folder.
2) Copy the contents of '.env.example' and paste them into the '.env' file.
3) Fill in the environment variable values
4) To compile the contract, run 'npx hardhat compile'
5) To deploy the contract see the below command (no need to compile as it does this implicitly)

## Deploy contracts
npx hardhat run --network mumbai scripts/deploy.js
