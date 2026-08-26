# Professional License Registry MVP

Hệ thống quản lý và xác thực chứng chỉ / giấy phép hành nghề chuyên môn trên nền tảng Ethereum Sepolia Testnet.

## 1. Thông tin Triển khai Chính thức (Official Deployed Contract v2)

- **Network:** Ethereum Sepolia Testnet
- **Chain ID:** `11155111`
- **Contract Address:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
- **Deployment Transaction:** `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a`
- **Deployment Block:** `11557021`
- **Compiler:** Solidity `0.8.34`
- **EVM Version:** `Osaka`
- **Optimizer:** `Disabled`
- **Public Frontend URL:** [https://professional-license-mvp-uit.netlify.app/](https://professional-license-mvp-uit.netlify.app/)
- **Deployment Evidence:** Remix IDE + Sepolia Etherscan screenshots do người dùng cung cấp tại `evidence/intergration/deployment-evidence/`.

### Trạng thái Kiểm chứng Dự án

```text
Contract deployment: VERIFIED
Frontend build: VERIFIED (Vite v7.3.6 production build passed)
Public deployment: VERIFIED (https://professional-license-mvp-uit.netlify.app/)
E2E user testing: NOT VERIFIED - RESERVED FOR USER
Cross-device testing: NOT VERIFIED - RESERVED FOR USER
```

---

## 2. Yêu cầu Tiên quyết (Prerequisites)

- **Node.js:** Phiên bản `>= 18.0.0`
- **npm:** Phiên bản `>= 9.0.0`
- **MetaMask:** Tiện ích mở rộng trình duyệt kết nối mạng **Ethereum Sepolia Testnet**.
- **Sepolia ETH:** (Dành cho Admin/Publisher khi thực hiện transaction cấp phép hoặc quản lý trạng thái).

---

## 3. Cài đặt & Chạy Frontend

### Bước 1: Cài đặt Dependencies

```bash
cd frontend
npm ci
```

### Bước 2: Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ khởi chạy tại `http://localhost:5173`.

### Bước 3: Build Production & Deploy Netlify

```bash
npm run build
```

- Bundle tĩnh tối ưu sẽ được xuất ra thư mục **`frontend/dist/`**.
- **Hướng dẫn deploy Netlify (Drag-and-Drop):** Chỉ kéo thả đúng thư mục **`frontend/dist/`** vào giao diện Deploy của Netlify. Tuyệt đối không kéo thư mục `frontend/`, `evidence/` hoặc repository root.

> **Ghi chú về Metadata Persistence:**
> - Metadata được lưu trong `localStorage` (hỗ trợ tự động migrate từ `sessionStorage` cũ) giúp dữ liệu không bị mất khi đóng và mở lại trên cùng browser/origin.
> - `localStorage` không áp dụng cho cross-browser hoặc cross-device; khi chia sẻ sang trình duyệt/thiết bị khác, người dùng sử dụng tính năng **Share / QR link** mang tham số metadata `m`.

---

## 4. Vòng đời Chứng chỉ (State Machine v2.0)

Hệ thống triển khai mô hình 4 trạng thái:

```text
       ┌───────────────────────────────┐
       │                               │
       ▼                               │
  ┌──────────┐   suspendLicense   ┌───────────┐
  │  ACTIVE  │ ─────────────────► │ SUSPENDED │
  └──────────┘ ◄───────────────── └───────────┘
       │          restoreLicense       │
       │                               │
       │ revokeLicense                 │ revokeLicense
       ▼                               ▼
  ┌───────────────────────────────────────────┐
  │             REVOKED (Terminal)            │
  └───────────────────────────────────────────┘
```

- **`ACTIVE` (Enum: 0):** Chứng chỉ hợp lệ và đang hoạt động (khi chưa hết hạn và thỏa mãn các qualification tiên quyết).
- **`SUSPENDED` (Enum: 1):** Tạm đình chỉ hiệu lực, có thể khôi phục về `ACTIVE` bởi chính Publisher phát hành.
- **`REVOKED` (Enum: 2):** Thu hồi vĩnh viễn (**Terminal State**). Không thể khôi phục dưới mọi hình thức. Cấp lại bắt buộc tạo `LicenseID` mới.
- **`EXPIRED` (Dynamic):** Suy diễn động từ timestamp `expiry` (`expiry != 0 && now >= expiry`), không lưu trong enum.

### Chuyển đổi trạng thái cho phép:
- `ACTIVE → SUSPENDED` (qua `suspendLicense`)
- `SUSPENDED → ACTIVE` (qua `restoreLicense`)
- `ACTIVE → REVOKED` (qua `revokeLicense`)
- `SUSPENDED → REVOKED` (qua `revokeLicense`)

### Chuyển đổi trạng thái bị cấm (Transaction Revert):
- `REVOKED → ACTIVE`
- `REVOKED → SUSPENDED`
- `ACTIVE → ACTIVE`
- `SUSPENDED → SUSPENDED`
- `REVOKED → REVOKED`

---

## 5. Kiến trúc Smart Contract & Giao thức

- **Contract Source:** [ProfessionalLicenseRegistry.sol](ProfessionalLicenseRegistry.sol)
- **Functions:**
  - `registerPublisher(address publisher)` — Quản trị Publisher (Admin only).
  - `removePublisher(address publisher)` — Gỡ quyền Publisher (Admin only).
  - `issueLicense(address owner, string credentialName, uint256 expiry, uint256[] requiredQualificationIds, bytes32 metadataHash)` — Cấp chứng chỉ (Publisher only).
  - `suspendLicense(uint256 licenseId)` — Tạm đình chỉ (Chỉ Issuer là Publisher hợp lệ).
  - `restoreLicense(uint256 licenseId)` — Khôi phục (Chỉ Issuer là Publisher hợp lệ).
  - `revokeLicense(uint256 licenseId)` — Thu hồi vĩnh viễn (Chỉ Issuer là Publisher hợp lệ).
  - `verifyLicense(uint256 licenseId, address owner)` — Xác thực chứng chỉ (Public view).
  - `checkLicenseRequirements(address owner, uint256[] qualificationIds)` — Kiểm tra điều kiện tiên quyết (Public view).

---

## 6. Hướng dẫn Sử dụng Deployment Script (Tùy chọn)

Nếu cần triển khai contract lên mạng Sepolia thông qua script hỗ trợ `evidence/intergration/deploy_sepolia.mjs`, hãy sử dụng biến môi trường tạm thời để đảm bảo an toàn bí mật:

```powershell
$env:PRIVATE_KEY = "your_sepolia_private_key_here"
node .\evidence\intergration\deploy_sepolia.mjs
Remove-Item Env:\PRIVATE_KEY
```

> **Lưu ý bảo mật:** Tuyệt đối không hardcode private key vào mã nguồn và không truyền private key trực tiếp qua command-line argument.

---

## 7. Bằng chứng, Báo cáo & Lưu ý Lịch sử

- **Unit Test Report:** [unit-test-report.txt](evidence/unit-test/unit-test-report.txt) (58/58 assertions passed trên local EVM runner).
- **Deployment Evidence:** [deployment-evidence.md](evidence/intergration/deployment-evidence/deployment-evidence.md).
- **Static Analysis Report:** [static-analysis-report.md](evidence/static-analysis/static-analysis-report.md).
- **E2E Testing Checklist:** [E2E_EVIDENCE.md](evidence/E2E_EVIDENCE.md) (Biểu mẫu 10 kịch bản kiểm thử dành cho người dùng thực hiện).
- **Project Status Handoff:** [PROJECT_STATUS_HANDOFF.md](PROJECT_STATUS_HANDOFF.md).

> **Ghi chú về file nguồn lịch sử:**
> `evidence/security/ProfessionalLicenseRegistry-180826.sol is historical only and is not used by runtime, deployment or frontend.`
