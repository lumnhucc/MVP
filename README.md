# MVP Sổ đăng ký giấy phép hành nghề chuyên môn

Hệ thống quản lý và xác thực chứng chỉ / giấy phép hành nghề chuyên môn trên nền tảng Ethereum Sepolia Testnet.

## 1. Thông tin triển khai chính thức (Hợp đồng triển khai chính thức v2)

- **Mạng:** Ethereum Sepolia Testnet
- **Chain ID:** `11155111`
- **Địa chỉ hợp đồng:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
- **Giao dịch triển khai:** `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a`
- **Block triển khai:** `11557021`
- **Trình biên dịch:** Solidity `0.8.34`
- **Phiên bản EVM:** `Osaka`
- **URL frontend công khai:** [https://professional-license-mvp-uit.netlify.app/](https://professional-license-mvp-uit.netlify.app/)
- **Bằng chứng triển khai:** ảnh chụp từ Remix IDE và Sepolia Etherscan do người dùng cung cấp tại `evidence/intergration/deployment-evidence/`.

### Trạng thái Kiểm chứng Dự án

```text
Triển khai hợp đồng: ĐÃ XÁC MINH
Build frontend: ĐÃ XÁC MINH (bản build production Vite v7.3.6 đạt)
Triển khai công khai: ĐÃ XÁC MINH (https://professional-license-mvp-uit.netlify.app/)
Kiểm thử E2E người dùng: ĐÃ XÁC MINH (toàn bộ ca 0 đến ca 10)
Kiểm thử trên nhiều thiết bị: ĐÃ XÁC MINH (Ca 10 — Cross-Device Share / QR)
```

---

## 2. Yêu cầu tiên quyết và Môi trường thực thi

- **Node.js:** Phiên bản `>= 18.0.0` (môi trường kiểm thử chuẩn: `v24.19.0`)
- **npm:** Phiên bản `>= 9.0.0` (môi trường kiểm thử chuẩn: `11.17.0`)
- **MetaMask:** Tiện ích mở rộng trình duyệt kết nối mạng **Ethereum Sepolia Testnet** (`Chain ID: 11155111`).
- **Sepolia ETH:** Nhận từ các faucet công khai (dành cho Admin/Publisher khi thực hiện transaction cấp phép hoặc quản lý vòng đời).

> ⚠️ **CẢNH BÁO BẢO MẬT:** Tuyệt đối **KHÔNG** đưa private key, seed phrase, API key hoặc bất kỳ thông tin cá nhân/bí mật nhạy cảm nào vào mã nguồn hoặc repository dưới mọi hình thức.

---

## 3. Cài đặt và chạy frontend

### Bước 1: Cài đặt thư viện phụ thuộc

```bash
cd frontend
npm ci
```

### Bước 2: Chạy máy chủ phát triển (Local Dev Server)

```bash
npm run dev
```

Ứng dụng sẽ khởi chạy tại `http://localhost:5173`.

### Bước 3: Tạo bản build production và triển khai lên Netlify

```bash
npm run build
```

- Bundle tĩnh tối ưu sẽ được xuất ra thư mục **`frontend/dist/`**.
- **Hướng dẫn triển khai Netlify (kéo và thả):** Chỉ kéo thả đúng thư mục **`frontend/dist/`** vào giao diện triển khai của Netlify. Tuyệt đối không kéo thư mục `frontend/`, `evidence/` hoặc thư mục gốc của repository.

> **Ghi chú về việc lưu metadata:**
> - Metadata được lưu trong `localStorage` (hỗ trợ tự động chuyển dữ liệu từ `sessionStorage` cũ), giúp dữ liệu không bị mất khi đóng và mở lại trên cùng trình duyệt/nguồn gốc.
> - `localStorage` không áp dụng giữa các trình duyệt hoặc thiết bị; khi chia sẻ sang trình duyệt/thiết bị khác, người dùng sử dụng tính năng **Chia sẻ / mã QR** mang tham số metadata `m`.

---

## 4. Vòng đời chứng chỉ (Mô hình trạng thái v2.0)

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
- **`REVOKED` (Enum: 2):** Thu hồi vĩnh viễn (**trạng thái kết thúc**). Không thể khôi phục dưới mọi hình thức. Cấp lại bắt buộc tạo `LicenseID` mới.
- **`EXPIRED` (động):** Suy diễn động từ timestamp `expiry` (`expiry != 0 && now >= expiry`), không lưu trong enum.

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

## 5. Kiến trúc hợp đồng thông minh và giao thức

- **Mã nguồn hợp đồng:** [ProfessionalLicenseRegistry.sol](ProfessionalLicenseRegistry.sol)
- **Các hàm:**
  - `registerPublisher(address publisher)` — Quản trị Publisher (chỉ Admin).
  - `removePublisher(address publisher)` — Gỡ quyền Publisher (chỉ Admin).
  - `issueLicense(address owner, string credentialName, uint256 expiry, uint256[] requiredQualificationIds, bytes32 metadataHash)` — Cấp chứng chỉ (chỉ Publisher).
  - `suspendLicense(uint256 licenseId)` — Tạm đình chỉ (Chỉ Issuer là Publisher hợp lệ).
  - `restoreLicense(uint256 licenseId)` — Khôi phục (Chỉ Issuer là Publisher hợp lệ).
  - `revokeLicense(uint256 licenseId)` — Thu hồi vĩnh viễn (Chỉ Issuer là Publisher hợp lệ).
  - `verifyLicense(uint256 licenseId, address owner)` — Xác thực chứng chỉ (Public view).
  - `checkLicenseRequirements(address owner, uint256[] qualificationIds)` — Kiểm tra điều kiện tiên quyết (Public view).

---

## 6. Đánh giá MVP và chi phí giao dịch

Dưới đây là bảng thống kê tài nguyên và chi phí thực tế đo lường trên mạng Ethereum Sepolia Testnet đối với toàn bộ các thao tác ghi state trong quá trình kiểm thử E2E:

| Ca | Thao tác | Gas used | Transaction fee |
|---|---|---:|---:|
| Ca 1 | issue Qualification #5 | 171,353 | 0.000427209318662672 ETH |
| Ca 2 | issue Professional License #6 | 237,412 | 0.00060562140740472 ETH |
| Ca 3 | suspend Qualification #3 | 53,562 | 0.000133565890729452 ETH |
| Ca 4 | restore Qualification #3 | 31,661 | 0.000081656445866947 ETH |
| Ca 5 | revoke License #6 | 53,710 | 0.00014026979750038 ETH |
| Ca 6 | failed suspend License #6 | 30,799 | 0.00007820829615916 ETH |
| Ca 7 | issue expired License #9 | 289,343 | 0.000743587443027946 ETH |

### Nhận xét và phân tích chi phí:

- **Tổng gas tiêu thụ của 7 transaction:** `867,840 gas`.
- **Tổng phí giao dịch của 7 transaction:** `0.00221011859935128 ETH` (đã bao gồm giao dịch Ca 6 bị revert).
- **Tỷ lệ giao dịch:** Có 6 transaction thành công và 1 transaction thất bại có chủ đích (Ca 6).
- **Phí giao dịch khi revert:** Giao dịch Ca 6 (`failed suspend License #6`) vẫn tiêu hao `30,799 gas` do máy ảo EVM phải thực thi các bước kiểm tra điều kiện trước khi revert; transaction revert bảo vệ tính toàn vẹn và không làm thay đổi trạng thái lưu trữ trên chuỗi.
- **Thao tác đọc không phát sinh phí on-chain (View/Read-only calls):** Các thao tác kết nối ví (connect wallet), xác minh chứng chỉ (`verifyLicense`), đọc danh sách chứng chỉ, tạo mã QR và chia sẻ URL xác thực hoàn toàn là các lời gọi view/read-only tới node RPC hoặc xử lý phía client; không phát sinh transaction ghi state và không phát sinh phí gas on-chain cho người dùng.
- **Ghi nhận Timestamp & Audit:** Block number và timestamp trong báo cáo đóng vai trò là bằng chứng kiểm toán on-chain bất biến; không coi timestamp là "thời gian xác nhận" (confirmation latency) khi chưa có hệ thống đo lường độ trễ độc lập.

### Bảng ánh xạ vòng đời và sự kiện On-chain:

- **Issue** ➔ Phát ra event `LicenseIssued` ➔ License mới khởi tạo ở trạng thái `ACTIVE`.
- **Suspend** ➔ Phát ra event `LicenseStatusChanged` ➔ Chuyển trạng thái `ACTIVE → SUSPENDED`.
- **Restore** ➔ Phát ra event `LicenseStatusChanged` ➔ Chuyển trạng thái `SUSPENDED → ACTIVE`.
- **Revoke** ➔ Phát ra event `LicenseStatusChanged` ➔ Chuyển trạng thái `ACTIVE → REVOKED` hoặc `SUSPENDED → REVOKED`.
- **Expiry** ➔ Trạng thái `EXPIRED` được suy diễn động khi verify (`expiry != 0 && now >= expiry`), không lưu trong enum on-chain để tối ưu gas.
- **Ca 6 (Bảo vệ trạng thái kết thúc)** ➔ Gọi `suspendLicense` trên license đã `REVOKED` bị transaction revert với lý do `"License not active"`, không phát event on-chain và trạng thái giữ nguyên `REVOKED`.

---

## 7. Khả năng tái lập và Hướng dẫn thực nghiệm

README cung cấp hướng dẫn tái lập thủ công qua Remix IDE và MetaMask. Quy trình tự động một lệnh và kiểm chứng độc lập trên máy sạch chưa được thiết lập:

### 7.1. Kiểm thử đơn vị Smart Contract (Solidity Unit Testing)

1. Truy cập [Remix IDE](https://remix.ethereum.org/).
2. Tải các file mã nguồn vào không gian làm việc:
   - Contract chính: [ProfessionalLicenseRegistry.sol](ProfessionalLicenseRegistry.sol)
   - Bộ test: [evidence/unit-test/ProfessionalLicenseRegistry_test.sol](evidence/unit-test/ProfessionalLicenseRegistry_test.sol)
   - Hợp đồng phụ trợ: [evidence/unit-test/LifecycleCaller.sol](evidence/unit-test/LifecycleCaller.sol)
3. Kích hoạt plugin **Solidity Unit Testing** trên Remix IDE.
4. Chọn compiler Solidity `0.8.34`, EVM `Osaka`.
5. Chọn file `ProfessionalLicenseRegistry_test.sol` và bấm **Run**.
6. **Kết quả:** Đạt **21/21 test cases PASS** (0 FAIL), chi tiết tại [unit-test-report.txt](evidence/unit-test/unit-test-report.txt).

### 7.2. Phân tích tĩnh và Kiểm tra bảo mật (Static Analysis)

1. Kích hoạt plugin **Solidity Static Analysis** trên Remix IDE hoặc sử dụng công cụ **Slither** CLI:
   ```bash
   slither ProfessionalLicenseRegistry.sol
   ```
2. **Kết quả:** Không phát hiện lỗ hổng nghiêm trọng, xác nhận kiểm soát quyền kép và bảo vệ Terminal State đạt chuẩn (đối chiếu [static-analysis-report.md](evidence/static-analysis/static-analysis-report.md)).

### 7.3. Cấu hình mạng và Hợp đồng chính thức

Frontend được cấu hình sẵn với contract chính thức:
- **Mạng:** Ethereum Sepolia Testnet
- **Chain ID:** `11155111`
- **Địa chỉ hợp đồng:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
- **Giao dịch triển khai:** `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a` (Block `11557021`)
- **ABI File:** `frontend/src/abi.json`
- **Cấu hình mẫu:** [`.env.example`](.env.example) (template an toàn cho nhà phát triển)

> **Lưu ý cấu hình Frontend & Giới hạn M9:**
> - Frontend hiện tại liên kết trực tiếp với địa chỉ hợp đồng chính thức trong `frontend/src/main.js` mà không đọc `.env` runtime; khi tái triển khai trên môi trường mới cần cập nhật thủ công biến cấu hình và tệp ABI tương ứng.
> - Deployment chính thức của dự án được thực hiện thủ công qua Remix IDE và MetaMask.
> - Dữ liệu demo được tạo thủ công qua giao diện frontend và Remix IDE.
> - Dự án **chưa có script deploy/seed tự động** trong phạm vi MVP; đây là giới hạn đã được ghi nhận của tiêu chí M9 và tiêu chí M9 hiện giữ trạng thái **`ĐẠT MỘT PHẦN`**.

### 7.4. Quy trình triển khai lại hợp đồng trong môi trường cấp phép (Redeployment)

1. Mở Remix IDE, chọn compiler Solidity `0.8.34`, EVM `Osaka`, Optimizer: `No`.
2. Tại tab *Deploy & Run Transactions*, chọn Environment: `Injected Provider - MetaMask` (chọn mạng Sepolia).
3. Bấm **Deploy** `ProfessionalLicenseRegistry` (tài khoản deploy tự động trở thành `Admin`).
4. Từ tài khoản Admin, gọi hàm `registerPublisher(address publisher)` để cấp quyền cho ví Publisher.
5. **Cập nhật sau deploy:** Cập nhật địa chỉ hợp đồng mới vào biến cấu hình contract trong `frontend/src/main.js` và đồng bộ ABI vào `frontend/src/abi.json`.

### 7.5. Tạo dữ liệu demo và Reset dữ liệu

- **Tạo dữ liệu an toàn:**
  1. Kết nối ví Publisher đã được Admin ủy quyền.
  2. Cấp Qualification trước: điền Form cấp chứng chỉ, để trống danh sách Qualification tiên quyết (`[]`).
  3. Cấp Professional License: điền Form cấp chứng chỉ, chọn/nhập ID của các Qualification đã cấp.
- **Reset dữ liệu Frontend:**
  - Xóa `localStorage` trên origin frontend của trình duyệt (hoặc mở chế độ Ẩn danh / Trình duyệt mới). Thao tác này sẽ xóa cache metadata lưu cục bộ.
  - **Lưu ý On-chain:** Dữ liệu trên blockchain Ethereum Sepolia là bất biến (immutable), không thể xóa hay rollback dữ liệu on-chain. Khi cần bộ dữ liệu mới hoàn toàn từ License #1, cần triển khai instance contract mới.

### 7.6. Quy trình Demo chuẩn E2E (Ca 0 – Ca 10)

| Ca | Kịch bản | Thao tác thực hiện | Kết quả kiểm chứng |
|---|---|---|---|
| **Ca 0** | Kết nối ví Publisher | Kết nối ví Publisher `0xd1F7...Dc82` trên Sepolia | Role nhận diện `PUBLISHER`, hiển thị dashboard quản lý |
| **Ca 1** | Cấp Qualification | Cấp `CompTIA Security+` (ID `#5`), expiry `2029`, required `[]` | Transaction thành công, hiển thị `ACTIVE` trong QUALIFICATIONS |
| **Ca 2** | Cấp Professional License | Cấp `SOC Analyst 2` (ID `#6`), required `[3, 5]` | Transaction thành công, verify trả về `VALID`, 2 requirements `PASS` |
| **Ca 3** | Tạm đình chỉ Qualification | Nhập ID `#3`, bấm **Suspend** | Trạng thái `#3` thành `SUSPENDED / INVALID`; License phụ thuộc `#6` verify thành `INVALID` |
| **Ca 4** | Khôi phục Qualification | Nhập ID `#3`, bấm **Restore** | Trạng thái `#3` trở lại `ACTIVE`; License `#6` tự động verify trở lại `VALID` |
| **Ca 5** | Thu hồi Professional License | Nhập ID `#6`, bấm **Revoke** | Trạng thái `#6` thành `REVOKED`; verify trả về `REVOKED / INVALID` |
| **Ca 6** | Bảo vệ trạng thái kết thúc | Kiểm tra form thao tác với License `#6` đã `REVOKED` | Form UI tự động khóa; gọi trực tiếp contract bị REVERT (`"License not active"`) |
| **Ca 7** | License hết hạn | Kiểm tra License `#9` (`SOC Analysist 1`, expiry `26/8/2026`) | Dashboard hiển thị nhãn `EXPIRED`; verify trả về `EXPIRED / INVALID` |
| **Ca 8** | Metadata bị can thiệp | Sửa tham số `m` trên URL verify của License `#1` | Verify hiển thị `UNTRUSTED / INTEGRITY FAILED` (hash không khớp on-chain) |
| **Ca 9** | Thiếu Metadata | Mở URL verify License `#1` không có tham số `m` trên trình duyệt mới | Verify hiển thị `UNVERIFIABLE` |
| **Ca 10** | Chia sẻ / QR đa thiết bị | Bấm **Share / QR** License `#9` trên desktop, mở/quét trên mobile | Mobile (chế độ USER, không ví) verify thành công `VALID`, cascade đủ 3 qualifications |

### 7.7. Phân biệt dữ liệu demo On-chain

- Toàn bộ bằng chứng E2E hiện tại (License `#1` đến `#9`, Publisher `0xd1F7...Dc82`, Owner `0x4136...9923`) gắn liền với hợp đồng chính thức `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37` trên mạng Sepolia Testnet.
- Khi triển khai một hợp đồng mới, ID sẽ đếm lại từ `#1` và không mang theo dữ liệu lịch sử của contract cũ.

---

## 8. Bằng chứng, báo cáo và lưu ý lịch sử

- **Báo cáo kiểm thử đơn vị:** [unit-test-report.txt](evidence/unit-test/unit-test-report.txt) (21/21 hàm kiểm thử đạt trên plugin kiểm thử Solidity của Remix; 0 lỗi).
- **Bằng chứng triển khai:** [deployment-evidence.md](evidence/intergration/deployment-evidence/deployment-evidence.md).
- **Báo cáo phân tích tĩnh:** [static-analysis-report.md](evidence/static-analysis/static-analysis-report.md).
- **Danh sách kiểm thử E2E:** [E2E_EVIDENCE.md](evidence/e2e/E2E_EVIDENCE.md) (đầy đủ 11 kịch bản từ Ca 0 đến Ca 10).
- **Tài liệu tổng hợp bằng chứng:** [EVIDENCE.md](EVIDENCE.md) (bản tổng hợp toàn diện 12 mục).

> **Ghi chú về file nguồn lịch sử:**
> `evidence/security/ProfessionalLicenseRegistry-180826.sol` chỉ là mã nguồn lịch sử, không được dùng khi chạy, triển khai hoặc trong frontend.

---

## 9. Giấy phép mã nguồn (License)

This project is released under the MIT License.
See [LICENSE](LICENSE) for details.
