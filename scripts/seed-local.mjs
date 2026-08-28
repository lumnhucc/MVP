/**
 * Script cấp phát dữ liệu mẫu (Seed Data) trên hợp đồng cục bộ (Local Development Chain)
 *
 * ⚠️ QUY TẮC AN TOÀN BẮT BUỘC:
 * - Script này CHỈ cho phép thực thi trên Local EVM Node với Chain ID đã whitelist: 1337, 31337, 5777.
 * - Script TỰ ĐỘNG TỪ CHỐI thực thi nếu địa chỉ hợp đồng là contract chính thức trên Sepolia (0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37).
 * - Script TỰ ĐỘNG TỪ CHỐI thực thi nếu địa chỉ cung cấp không chứa bytecode hợp lệ trên node cục bộ.
 * - Không chứa bất kỳ private key thật, seed phrase, API key hay RPC secret nào.
 * - Dữ liệu thực thi hoàn toàn cục bộ, KHÔNG ghi đè hay thay đổi bất kỳ file nào trong thư mục evidence/.
 *
 * Cách sử dụng:
 *   npm run seed:local -- <LOCAL_CONTRACT_ADDRESS>
 *   (hoặc: node scripts/seed-local.mjs <LOCAL_CONTRACT_ADDRESS>)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const { ethers } = require(path.resolve(__dirname, "../frontend/node_modules/ethers"));

// Danh sách Chain ID mạng cục bộ được phép thực thi
const ALLOWED_LOCAL_CHAIN_IDS = [1337n, 31337n, 5777n];
const OFFICIAL_SEPOLIA_ADDRESS = "0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37".toLowerCase();

export async function seedLocal(targetAddress) {
  const rpcUrl = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
  const contractAddress = targetAddress || process.env.LOCAL_CONTRACT_ADDRESS || process.argv[2];

  console.log("================================================================");
  console.log("      CẤP DỮ LIỆU DEMO MẪU TRÊN LOCAL CHAIN (HAPPY PATH)        ");
  console.log("================================================================");

  if (!contractAddress) {
    console.error("❌ LỖI: Thiếu địa chỉ hợp đồng cục bộ (Local Contract Address).");
    console.error("Cách sử dụng: npm run seed:local -- <LOCAL_CONTRACT_ADDRESS>");
    console.error("Ví dụ: npm run seed:local -- 0x5FbDB2315678afecb367f032d93F642f64180aa3\n");
    process.exit(1);
  }

  // KIỂM TRA AN TOÀN 1: Chặn tuyệt đối gọi vào contract chính thức trên Sepolia
  if (contractAddress.toLowerCase() === OFFICIAL_SEPOLIA_ADDRESS) {
    console.error("\n🚫 LỖI AN TOÀN NGHIÊM TRỌNG: Địa chỉ cung cấp trùng với Contract chính thức trên Ethereum Sepolia!");
    console.error("Hợp đồng trên Sepolia đã được bảo toàn nguyên bản cho đợt nộp bài. Script seed chỉ chạy trên instance cục bộ.\n");
    process.exit(1);
  }

  console.log(`🔗 Đang kết nối tới Local RPC: ${rpcUrl}`);
  let provider;
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getBlockNumber();
  } catch (err) {
    console.error(`\n❌ LỖI KẾT NỐI: Không thể kết nối tới local node tại ${rpcUrl}.`);
    process.exit(1);
  }

  const network = await provider.getNetwork();
  const chainId = network.chainId;
  console.log(`🆔 Network Chain ID: ${chainId.toString()}`);

  // KIỂM TRA AN TOÀN 2: Chỉ cho phép Chain ID trong danh sách whitelist
  if (!ALLOWED_LOCAL_CHAIN_IDS.includes(chainId)) {
    console.error(`\n🚫 LỖI AN TOÀN: Chain ID ${chainId.toString()} KHÔNG nằm trong danh sách local whitelist (1337, 31337, 5777).`);
    console.error("Script từ chối thực thi để bảo vệ an toàn các mạng công khai.\n");
    process.exit(1);
  }

  // KIỂM TRA AN TOÀN 3: Xác minh địa chỉ mục tiêu thực sự có bytecode hợp lệ
  const code = await provider.getCode(contractAddress);
  if (!code || code === "0x" || code === "0x0") {
    console.error(`\n❌ LỖI: Địa chỉ ${contractAddress} không có bytecode hợp đồng trên local node.`);
    console.error("Vui lòng đảm bảo contract đã được deploy trước khi seed (chạy: npm run deploy:local).\n");
    process.exit(1);
  }
  console.log(`🔍 Xác minh Bytecode: Hợp lệ (${(code.length - 2) / 2} bytes bytecode trên node)`);

  const accounts = await provider.listAccounts();
  if (accounts.length < 3) {
    console.error("❌ LỖI: Local node cần tối thiểu 3 tài khoản mở khóa để đóng vai Admin, Publisher, Holder.");
    process.exit(1);
  }

  const adminSigner = await provider.getSigner(0);
  const publisherSigner = await provider.getSigner(1);
  const holderSigner = await provider.getSigner(2);

  console.log(`👤 Admin Account:     ${adminSigner.address}`);
  console.log(`🏢 Publisher Account: ${publisherSigner.address}`);
  console.log(`🎓 Holder Account:    ${holderSigner.address}`);
  console.log(`📍 Target Contract:   ${contractAddress}\n`);

  // Tải ABI hợp đồng
  const abiPath = path.resolve(__dirname, "../frontend/src/abi.json");
  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const contract = new ethers.Contract(contractAddress, abi, adminSigner);

  // Bước 1: Admin đăng ký Publisher
  console.log("----------------------------------------------------------------");
  console.log("1️⃣ [ADMIN] Đăng ký Publisher...");
  const isPubBefore = await contract.publishers(publisherSigner.address);
  if (!isPubBefore) {
    const txReg = await contract.registerPublisher(publisherSigner.address);
    const rcReg = await txReg.wait();
    console.log(`   ✅ Đã cấp quyền Publisher! Tx: ${txReg.hash} (Gas: ${rcReg.gasUsed.toString()})`);
  } else {
    console.log("   ℹ️ Tài khoản Publisher đã được cấp quyền trước đó.");
  }

  // Bước 2: Publisher cấp Qualification #1 (CompTIA Security+)
  console.log("\n2️⃣ [PUBLISHER] Cấp Qualification #1 (CompTIA Security+)...");
  const pubContract = contract.connect(publisherSigner);
  const qualMetaHash = ethers.keccak256(ethers.toUtf8Bytes("CompTIA Security+ Official Qualification Certificate"));

  const txQ = await pubContract.issueLicense(
    holderSigner.address,
    "CompTIA Security+",
    0, // Expiry = 0 (vĩnh viễn)
    [], // Không có qualification tiên quyết
    qualMetaHash
  );
  const rcQ = await txQ.wait();
  console.log(`   ✅ Qualification đã cấp! ID: #1 | Tx: ${txQ.hash} (Gas: ${rcQ.gasUsed.toString()})`);

  // Bước 3: Publisher cấp Professional License #2 (SOC Analyst 2, yêu cầu Qualification #1)
  console.log("\n3️⃣ [PUBLISHER] Cấp Professional License #2 (SOC Analyst 2)...");
  const licMetaHash = ethers.keccak256(ethers.toUtf8Bytes("SOC Analyst 2 Professional License"));

  const txL = await pubContract.issueLicense(
    holderSigner.address,
    "SOC Analyst 2",
    0, // Expiry = 0
    [1], // Yêu cầu Qualification #1
    licMetaHash
  );
  const rcL = await txL.wait();
  console.log(`   ✅ Professional License đã cấp! ID: #2 | Tx: ${txL.hash} (Gas: ${rcL.gasUsed.toString()})`);

  // Bước 4: Kiểm tra xác minh kết quả on-chain
  console.log("\n4️⃣ [VERIFIER] Kiểm tra xác minh Professional License #2...");
  const isValid = await contract.verifyLicense(2, holderSigner.address);
  const reqCheck = await contract.checkLicenseRequirements(holderSigner.address, [1]);

  console.log(`   🔍 Kết quả verifyLicense(2, holder): ${isValid ? "VALID (Hợp lệ)" : "INVALID (Không hợp lệ)"}`);
  console.log(`   🔍 Kết quả checkLicenseRequirements:  ${reqCheck ? "PASS (Thỏa mãn)" : "FAIL (Không thỏa mãn)"}`);

  console.log("\n================================================================");
  console.log("         HOÀN THÀNH CẤP PHÁT DỮ LIỆU MẪU CỤC BỘ (LOCAL)         ");
  console.log("================================================================");
  console.log("🎉 Toàn bộ kịch bản happy path đã chạy thành công trên local chain!");
  console.log("ℹ️ Bằng chứng chính thức trên Ethereum Sepolia vẫn được bảo toàn nguyên bản.\n");

  return {
    contractAddress,
    qualificationId: 1,
    licenseId: 2,
    isValid
  };
}

if (process.argv[1] && process.argv[1].endsWith("seed-local.mjs")) {
  seedLocal().catch(err => {
    console.error("Lỗi thực thi script seed-local:", err);
    process.exit(1);
  });
}
