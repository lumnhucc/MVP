/**
 * Script triển khai hợp đồng ProfessionalLicenseRegistry trên mạng cục bộ (Local Development Chain)
 *
 * ⚠️ QUY TẮC AN TOÀN BẮT BUỘC:
 * - Script này CHỈ cho phép thực thi trên Local EVM Node với Chain ID đã whitelist: 1337, 31337, 5777.
 * - Script TỰ ĐỘNG TỪ CHỐI mọi Chain ID khác (bao gồm Sepolia 11155111, Mainnet 1, Holesky, v.v.).
 * - Không chứa bất kỳ private key thật, seed phrase, API key hay RPC secret nào.
 * - Hoàn toàn tách biệt và KHÔNG ảnh hưởng đến hợp đồng chính thức đã deploy trên Sepolia.
 *
 * Cách sử dụng:
 * 1. Khởi động local node: npm run node:local (hoặc npx --prefix frontend ganache --port 8545)
 * 2. Chạy lệnh: npm run deploy:local (hoặc node scripts/deploy-local.mjs)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const solc = require(path.resolve(__dirname, "../frontend/node_modules/solc"));
const { ethers } = require(path.resolve(__dirname, "../frontend/node_modules/ethers"));

// Danh sách Chain ID mạng cục bộ được phép thực thi
const ALLOWED_LOCAL_CHAIN_IDS = [1337n, 31337n, 5777n];

export async function deployLocal() {
  const rpcUrl = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
  console.log("================================================================");
  console.log("     TRIỂN KHAI HỢP ĐỒNG TRÊN LOCAL CHAIN (REPRODUCIBILITY)     ");
  console.log("================================================================");
  console.log(`🔗 Đang kết nối tới Local RPC: ${rpcUrl}`);

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getBlockNumber();
  } catch (err) {
    console.error(`\n❌ LỖI KẾT NỐI: Không thể kết nối tới local node tại ${rpcUrl}.`);
    console.error("Vui lòng khởi động local chain trước khi chạy script này.");
    console.error("Lệnh khởi động Ganache: npm run node:local\n");
    process.exit(1);
  }

  const network = await provider.getNetwork();
  const chainId = network.chainId;
  console.log(`🆔 Network Chain ID: ${chainId.toString()}`);

  // KIỂM TRA AN TOÀN CHẶT CHẼ: Chỉ cho phép Chain ID trong danh sách whitelist
  if (!ALLOWED_LOCAL_CHAIN_IDS.includes(chainId)) {
    console.error(`\n🚫 LỖI AN TOÀN: Chain ID ${chainId.toString()} KHÔNG nằm trong danh sách local whitelist (1337, 31337, 5777).`);
    console.error("Script từ chối thực thi để bảo vệ an toàn các mạng công khai (Sepolia, Mainnet, Testnets).");
    console.error("Deployment trên Sepolia được thực hiện thủ công qua Remix/MetaMask theo hồ sơ kiểm toán.\n");
    process.exit(1);
  }

  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0) {
    console.error("\n❌ LỖI: Local node không có sẵn tài khoản đã mở khóa.");
    process.exit(1);
  }

  const adminSigner = await provider.getSigner(0);
  console.log(`👤 Tài khoản Deployer (Admin): ${adminSigner.address}`);

  // Biên dịch hợp đồng ProfessionalLicenseRegistry.sol từ mã nguồn gốc
  const sourcePath = path.resolve(__dirname, "../ProfessionalLicenseRegistry.sol");
  console.log(`\n🔨 Đang biên dịch mã nguồn hợp đồng: ${path.basename(sourcePath)}`);
  const sourceContent = fs.readFileSync(sourcePath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "ProfessionalLicenseRegistry.sol": { content: sourceContent }
    },
    settings: {
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === "error");
    if (errors.length > 0) {
      console.error("❌ Lỗi biên dịch Solidity:", errors);
      process.exit(1);
    }
  }

  const contractData = output.contracts["ProfessionalLicenseRegistry.sol"]["ProfessionalLicenseRegistry"];
  const abi = contractData.abi;
  const bytecode = contractData.evm.bytecode.object;

  console.log("✅ Biên dịch thành công (Solidity compiler tương thích 0.8.28 / 0.8.34).");

  // Thực hiện triển khai hợp đồng trên local node
  console.log("🚀 Đang gửi giao dịch khởi tạo hợp đồng lên local chain...");
  const factory = new ethers.ContractFactory(abi, bytecode, adminSigner);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  const receipt = await deployTx.wait();

  console.log("\n================================================================");
  console.log("               KẾT QUẢ TRIỂN KHAI LOCAL CHAIN                   ");
  console.log("================================================================");
  console.log(`📍 Local Contract Address: ${contractAddress}`);
  console.log(`🏷️ Giao dịch triển khai:   ${deployTx.hash}`);
  console.log(`📦 Block triển khai:       ${receipt.blockNumber}`);
  console.log(`⛽ Gas tiêu thụ:           ${receipt.gasUsed.toString()}`);
  console.log(`🌐 Mạng:                   Local Development Chain (${chainId.toString()})`);
  console.log("================================================================");
  console.log("\n💡 Để cấp dữ liệu demo mẫu lên contract cục bộ này, hãy chạy:");
  console.log(`   npm run seed:local -- ${contractAddress}`);
  console.log(`   (hoặc: node scripts/seed-local.mjs ${contractAddress})\n`);

  return {
    contractAddress,
    chainId: chainId.toString(),
    deployTxHash: deployTx.hash,
    admin: adminSigner.address
  };
}

if (process.argv[1] && process.argv[1].endsWith("deploy-local.mjs")) {
  deployLocal().catch(err => {
    console.error("Lỗi thực thi script deploy-local:", err);
    process.exit(1);
  });
}
