import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const solc = require('c:/Users/nhatn/Downloads/MVP/evidence/intergration/intergration-client/node_modules/solc');
const { ethers } = require('c:/Users/nhatn/Downloads/MVP/evidence/intergration/intergration-client/node_modules/ethers');

const SEPOLIA_RPC = process.env.SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";
const privateKey = process.argv[2] || process.env.PRIVATE_KEY;

if (!privateKey) {
  console.error("Usage: node deploy_sepolia.mjs <PRIVATE_KEY>");
  console.error("Or set PRIVATE_KEY in environment variables.");
  process.exit(1);
}

const contractSource = fs.readFileSync('ProfessionalLicenseRegistry.sol', 'utf8');

const input = {
  language: 'Solidity',
  sources: { 'ProfessionalLicenseRegistry.sol': { content: contractSource } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: 'paris',
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }
  }
};

console.log("Compiling ProfessionalLicenseRegistry.sol...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contractData = output.contracts['ProfessionalLicenseRegistry.sol']['ProfessionalLicenseRegistry'];
const abi = contractData.abi;
const bytecode = contractData.evm.bytecode.object;

async function deploy() {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  
  console.log(`Deployer address: ${wallet.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`Network: Sepolia (Chain ID: 11155111)`);

  if (balance === 0n) {
    console.error("Error: Insufficient funds on Sepolia Testnet.");
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log("Sending deployment transaction...");
  const contract = await factory.deploy();
  console.log(`Deployment Tx: ${contract.deploymentTransaction().hash}`);
  
  console.log("Waiting for block confirmation...");
  const receipt = await contract.deploymentTransaction().wait(1);
  const deployedAddress = await contract.getAddress();

  console.log("=========================================");
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log(`Contract Address: ${deployedAddress}`);
  console.log(`Transaction Hash: ${receipt.hash}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log("=========================================");
}

deploy().catch(console.error);

