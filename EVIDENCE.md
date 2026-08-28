# Bằng chứng Tổng hợp Đầy đủ (Evidence Document)
## MVP Sổ đăng ký Giấy phép Hành nghề Chuyên môn (Professional License Registry)

---

## 1. Thông tin tài liệu

- **Tên dự án:** MVP Sổ đăng ký giấy phép hành nghề chuyên môn (Professional License Registry)
- **Ngày thu thập bằng chứng:** `26/08/2026 & 27/08/2026` (ghi nhận từ các phiên kiểm thử E2E và triển khai Sepolia)
- **Phạm vi tài liệu:** Báo cáo tổng hợp toàn bộ bằng chứng thực nghiệm của phiên bản MVP, bao gồm: triển khai Smart Contract thực tế trên mạng thử nghiệm công khai, tích hợp ứng dụng frontend, kiểm thử đơn vị tự động (Unit Test), phân tích tĩnh bảo mật (Static Analysis), kiểm thử luồng người dùng đầu-cuối (E2E Ca 0 – Ca 10), và đo lường tài nguyên tiêu thụ.
- **Bản chất tài liệu:** Đây là bản tổng hợp (Evidence Synthesis Document) trích xuất từ dữ liệu thực tế trong mã nguồn và thư mục `evidence/`. Toàn bộ bằng chứng gốc (ảnh chụp màn hình giao diện, log giao dịch Sepolia Etherscan, log kiểm thử Remix IDE, cấu hình biên dịch) được lưu giữ nguyên bản và liên kết trực tiếp trong tài liệu này.

---

## 2. Network và deployment

Bảng thông tin cấu hình triển khai Smart Contract chính thức trên mạng công khai:

| Trường thông tin | Giá trị xác nhận | Nguồn kiểm chứng / Bằng chứng gốc |
|---|---|---|
| **Network** | Ethereum Sepolia Testnet | [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md) |
| **Chain ID** | `11155111` | [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md), [`frontend/src/main.js`](frontend/src/main.js) |
| **Contract Address** | `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37` | [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md) |
| **Deployment Transaction** | `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a` | [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md), [`evidence/intergration/deployment-evidence/transaction-evidence.png`](evidence/intergration/deployment-evidence/transaction-evidence.png) |
| **Deployment Block** | `11557021` | [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md), [`evidence/intergration/deployment-evidence/transaction-evidence.png`](evidence/intergration/deployment-evidence/transaction-evidence.png) |
| **Solidity Compiler** | `0.8.34` (`0.8.34+commit.80d5c536`) | [`evidence/intergration/deployment-evidence/compiler-setting.png`](evidence/intergration/deployment-evidence/compiler-setting.png) |
| **EVM Version** | `Osaka` (`default (osaka)`) | [`evidence/intergration/deployment-evidence/compiler-setting.png`](evidence/intergration/deployment-evidence/compiler-setting.png) |
| **Optimizer** | `Disabled / Off` (Tắt) | [`evidence/intergration/deployment-evidence/compiler-setting.png`](evidence/intergration/deployment-evidence/compiler-setting.png), [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md) |
| **Public Frontend URL** | [https://professional-license-mvp-uit.netlify.app/](https://professional-license-mvp-uit.netlify.app/) | [`README.md`](README.md) |

---

## 3. Source và cấu hình

### Danh mục tệp mã nguồn và cấu hình cốt lõi

1. [`ProfessionalLicenseRegistry.sol`](ProfessionalLicenseRegistry.sol)
   - **Vai trò:** Mã nguồn Smart Contract chính thức (Solidity v0.8.34) thực thi toàn bộ logic nghiệp vụ của sổ đăng ký: quản lý vai trò Admin/Publisher, cấp phát chứng chỉ (Qualification và Professional License), kiểm tra ràng buộc điều kiện tiên quyết (cascade dependency), và quản lý chuyển đổi trạng thái vòng đời (`ACTIVE`, `SUSPENDED`, `REVOKED`, suy diễn động `EXPIRED`).
2. [`frontend/src/main.js`](frontend/src/main.js)
   - **Vai trò:** Mã nguồn xử lý logic client-side của Single Page Application (SPA), tích hợp thư viện Ethers.js để tương tác với ví Web3 (MetaMask) và node RPC Sepolia, chuẩn hóa canonical metadata, tính toán keccak256 hash, mã hóa/giải mã tham số chia sẻ URL (`m`), và kết nối tạo mã QR qua QRCode.js.
3. [`frontend/src/style.css`](frontend/src/style.css)
   - **Vai trò:** Hệ thống giao diện tùy biến hoàn chỉnh bằng Vanilla CSS (chủ đề Dark Mode hiện đại, bố cục dạng lưới responsive, các thẻ trạng thái, bảng biểu và thanh tiến trình xác thực).
4. [`frontend/src/abi.json`](frontend/src/abi.json)
   - **Vai trò:** Giao diện nhị phân ứng dụng (ABI) của hợp đồng thông minh `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`, cung cấp định nghĩa hàm và sự kiện cho client.
5. [`frontend/index.html`](frontend/index.html)
   - **Vai trò:** Bộ khung cấu trúc HTML5 ngữ nghĩa cho toàn bộ giao diện ứng dụng.
6. [`frontend/package.json`](frontend/package.json)
   - **Vai trò:** Khai báo cấu hình dự án frontend, danh sách thư viện phụ thuộc (`ethers ^6.15.0`, `qrcode ^1.5.4`, `vite ^7.1.3`) và kịch bản thực thi (`dev`, `build`, `preview`).
7. [`frontend/package-lock.json`](frontend/package-lock.json)
   - **Vai trò:** Cố định chi tiết cây phụ thuộc của npm, đảm bảo tính tái lập 100% khi thiết lập môi trường qua `npm ci`.
8. **Các tệp bản quyền / cấu hình mẫu bổ sung khác:** `[Chưa có trong repository]` (dự án sử dụng cấu hình mặc định trực tiếp từ Vite CLI và npm mà không cần tệp cấu hình phụ trợ).

### Nguyên tắc bảo mật dữ liệu và cấu hình
- **Bảo mật tuyệt đối:** Không lưu trữ private key, mnemonic seed phrase, API key hoặc bất kỳ thông tin bí mật/dữ liệu cá nhân nhạy cảm nào vào mã nguồn, cấu hình hoặc tài liệu evidence.
- **Tính chất dữ liệu công khai:** Địa chỉ ví Admin, ví Publisher, địa chỉ Contract và các Transaction Hash trên mạng Sepolia Testnet là dữ liệu công khai trên blockchain explorer, hoàn toàn không phải private key hay thông tin bí mật.

---

## 4. Mapping thao tác nghiệp vụ → transaction/event/state

Bảng ánh xạ chi tiết các thao tác nghiệp vụ tới hàm Smart Contract, sự kiện on-chain và trạng thái hệ thống:

| Thao tác nghiệp vụ | Hàm / Luồng thực thi | Trạng thái hoặc Event kỳ vọng | Bằng chứng gốc |
|---|---|---|---|
| **Register publisher** | `registerPublisher(address publisher)` (chỉ Admin) | Event `PublisherRegistered(publisher, actor)`; gán `publishers[publisher] = true` | [`evidence/e2e/E2E_EVIDENCE.md#ca-0-quan-tri-admin--ket-noi-vi-publisher-tren-sepolia`](evidence/e2e/E2E_EVIDENCE.md#ca-0-quan-tri-admin--ket-noi-vi-publisher-tren-sepolia) |
| **Issue qualification** | `issueLicense(...)` với `requiredQualificationIds` rỗng (`[]`) | Event `LicenseIssued(...)`; License mới lưu ở trạng thái `ACTIVE` | [`evidence/e2e/E2E_EVIDENCE.md#ca-1-cap-qualification-thanh-cong-comptia-security`](evidence/e2e/E2E_EVIDENCE.md#ca-1-cap-qualification-thanh-cong-comptia-security) |
| **Issue professional license** | `issueLicense(...)` kèm danh sách `requiredQualificationIds` hợp lệ | Event `LicenseIssued(...)`; `_checkRequirements` đạt; License lưu `ACTIVE`; Verify `VALID` | [`evidence/e2e/E2E_EVIDENCE.md#ca-2-cap-professional-license-thanh-cong-soc-analyst-2`](evidence/e2e/E2E_EVIDENCE.md#ca-2-cap-professional-license-thanh-cong-soc-analyst-2) |
| **Suspend qualification** | `suspendLicense(uint256 licenseId)` | Event `LicenseStatusChanged(id, ACTIVE, SUSPENDED, actor, timestamp)`; Qualification chuyển `SUSPENDED`; Professional License phụ thuộc verify trả về `INVALID` | [`evidence/e2e/E2E_EVIDENCE.md#ca-3-tam-dinh-chi-qualification-3-suspend-va-tac-dong-den-professional-license-6`](evidence/e2e/E2E_EVIDENCE.md#ca-3-tam-dinh-chi-qualification-3-suspend-va-tac-dong-den-professional-license-6) |
| **Restore qualification** | `restoreLicense(uint256 licenseId)` | Event `LicenseStatusChanged(id, SUSPENDED, ACTIVE, actor, timestamp)`; Qualification chuyển `ACTIVE`; Professional License phụ thuộc tự động khôi phục `VALID` | [`evidence/e2e/E2E_EVIDENCE.md#ca-4-khoi-phuc-qualification-3-restore-va-tai-hop-le-hoa-professional-license-6`](evidence/e2e/E2E_EVIDENCE.md#ca-4-khoi-phuc-qualification-3-restore-va-tai-hop-le-hoa-professional-license-6) |
| **Revoke license** | `revokeLicense(uint256 licenseId)` | Event `LicenseStatusChanged(id, oldStatus, REVOKED, actor, timestamp)`; Trạng thái chuyển `REVOKED`; Verify trả về `REVOKED / INVALID` | [`evidence/e2e/E2E_EVIDENCE.md#ca-5-thu-hoi-professional-license-6-thanh-cong-revoke`](evidence/e2e/E2E_EVIDENCE.md#ca-5-thu-hoi-professional-license-6-thanh-cong-revoke) |
| **Block revoked transition** | Gọi `suspendLicense` hoặc `restoreLicense` trên license đã `REVOKED` | Transaction REVERT với lý do `"License not active"` hoặc `"License not suspended"`; không phát event; trạng thái giữ nguyên `REVOKED` | [`evidence/e2e/E2E_EVIDENCE.md#ca-6-chan-thao-tac-tren-license-da-revoked-terminal-state-protection`](evidence/e2e/E2E_EVIDENCE.md#ca-6-chan-thao-tac-tren-license-da-revoked-terminal-state-protection) |
| **Expiry verification** | `verifyLicense` trên chứng chỉ có `expiry != 0 && now >= expiry` | On-chain trả về `false`; Frontend hiển thị badge `EXPIRED` và kết quả xác minh `EXPIRED / INVALID` | [`evidence/e2e/E2E_EVIDENCE.md#ca-7-license-het-han-dynamic-expired-status--verification`](evidence/e2e/E2E_EVIDENCE.md#ca-7-license-het-han-dynamic-expired-status--verification) |
| **Tampered metadata** | Sửa đổi chuỗi base64 trong tham số `m` trên URL xác thực | Client băm lại metadata và đối chiếu `metadataHash` on-chain; phát hiện sai lệch trả về `UNTRUSTED / INTEGRITY FAILED` | [`evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9-kiem-thu-tinh-toan-ven-metadata`](evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9-kiem-thu-tinh-toan-ven-metadata) |
| **Missing metadata** | Mở URL xác thực không có tham số `m` trên môi trường không có cache `localStorage` | Không tìm thấy thông tin metadata ngoài chuỗi để đối chiếu hash; trả về `UNVERIFIABLE` | [`evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9-kiem-thu-tinh-toan-ven-metadata`](evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9-kiem-thu-tinh-toan-ven-metadata) |
| **Share / QR verification** | Tạo mã QR / URL Share từ Desktop và quét/mở trên thiết bị di động | Client di động ở chế độ `USER` (không cần ví) giải mã metadata từ URL, đọc on-chain và trả về `VALID` với đầy đủ dependencies `PASS` | [`evidence/e2e/E2E_EVIDENCE.md#ca-10-chia-se--qr-tren-nhieu-thiet-bi-cross-device-share--qr`](evidence/e2e/E2E_EVIDENCE.md#ca-10-chia-se--qr-tren-nhieu-thiet-bi-cross-device-share--qr) |

*Ghi chú: Các tên sự kiện (`event`) được ghi nhận chính xác theo khai báo trong mã nguồn Smart Contract: `LicenseIssued`, `LicenseStatusChanged`, `PublisherRegistered`, `PublisherRemoved`.*

---

## 5. Transaction và event evidence

Bảng thống kê các giao dịch đại diện trên mạng Ethereum Sepolia Testnet được ghi nhận từ dữ liệu thực tế (đây là số đo của lần kiểm thử E2E hiện tại, không đại diện cho production):

| Case | Thao tác (Action) | Transaction Hash | Block | Gas Used | Transaction Fee | Event phát ra | Thay đổi trạng thái On-chain | Link evidence gốc |
|---|---|---|---|---|---|---|---|---|
| **Deploy** | Khởi tạo Hợp đồng (`Deployment`) | `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a` | `11557021` | `2,188,350` | `0.00548950077119385 ETH` | `[Chưa có trong evidence tổng hợp]` *(Khởi tạo hợp đồng không phát custom event)* | Tạo contract `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`, `admin = 0xd01A...4432` | [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md), [`evidence/intergration/deployment-evidence/transaction-evidence.png`](evidence/intergration/deployment-evidence/transaction-evidence.png) |
| **Ca 0** | Đăng ký Publisher (`registerPublisher`) | `0x2b0b6ee8d327d5ffd21c0e593d44a36344a581e3dfe08ca409c702bd02ecca9e` | `11557152` | `[Chưa có trong evidence tổng hợp]` | `[Chưa có trong evidence tổng hợp]` | `PublisherRegistered` | `publishers[0xd1F7...Dc82] = true` | [`evidence/e2e/E2E_EVIDENCE.md#ca-0-quan-tri-admin--ket-noi-vi-publisher-tren-sepolia`](evidence/e2e/E2E_EVIDENCE.md#ca-0-quan-tri-admin--ket-noi-vi-publisher-tren-sepolia) |
| **Ca 1** | Cấp Qualification #5 (`CompTIA Security+`) | `0xf47f03886285384250fd6dfdff29ab0f696a053623978625fe72b1b8ece76d10` | `11570139` | `171,353` | `0.000427209318662672 ETH` | `LicenseIssued` | Tạo License `#5`, `status = ACTIVE`, `requiredQualificationIds = []` | [`evidence/e2e/E2E_EVIDENCE.md#ca-1-cap-qualification-thanh-cong-comptia-security`](evidence/e2e/E2E_EVIDENCE.md#ca-1-cap-qualification-thanh-cong-comptia-security) |
| **Ca 2** | Cấp Professional License #6 (`SOC Analyst 2`) | `0xe419af18723c0a232da967f63fa330da17b0a748f89b0b850e7fb8f330fa138a` | `11570210` | `237,412` | `0.00060562140740472 ETH` | `LicenseIssued` | Tạo License `#6`, `status = ACTIVE`, `requiredQualificationIds = [3, 5]` | [`evidence/e2e/E2E_EVIDENCE.md#ca-2-cap-professional-license-thanh-cong-soc-analyst-2`](evidence/e2e/E2E_EVIDENCE.md#ca-2-cap-professional-license-thanh-cong-soc-analyst-2) |
| **Ca 3** | Tạm đình chỉ Qualification #3 (`suspendLicense`) | `0x2e18e0a3f3692c26783ab56460561dcb3c625f1922bb15951b0b834a0c242e1c` | `11570292` | `53,562` | `0.000133565890729452 ETH` | `LicenseStatusChanged` (`ACTIVE` ➔ `SUSPENDED`) | Qualification `#3` chuyển sang `SUSPENDED` | [`evidence/e2e/E2E_EVIDENCE.md#ca-3-tam-dinh-chi-qualification-3-suspend-va-tac-dong-den-professional-license-6`](evidence/e2e/E2E_EVIDENCE.md#ca-3-tam-dinh-chi-qualification-3-suspend-va-tac-dong-den-professional-license-6) |
| **Ca 4** | Khôi phục Qualification #3 (`restoreLicense`) | `0x4e706d19b7f11f7e51d89439eaa594667a75675fcaff264ced1e2b056fa9aa2f` | `11570347` | `31,661` | `0.000081656445866947 ETH` | `LicenseStatusChanged` (`SUSPENDED` ➔ `ACTIVE`) | Qualification `#3` khôi phục về `ACTIVE` | [`evidence/e2e/E2E_EVIDENCE.md#ca-4-khoi-phuc-qualification-3-restore-va-tai-hop-le-hoa-professional-license-6`](evidence/e2e/E2E_EVIDENCE.md#ca-4-khoi-phuc-qualification-3-restore-va-tai-hop-le-hoa-professional-license-6) |
| **Ca 5** | Thu hồi Professional License #6 (`revokeLicense`) | `0xb1dac95aebf5a36c6c780583f7ed690a1e1e3c05cce4172716a8cf837bd1c736` | `11570408` | `53,710` | `0.00014026979750038 ETH` | `LicenseStatusChanged` (`ACTIVE` ➔ `REVOKED`) | License `#6` chuyển sang terminal state `REVOKED` | [`evidence/e2e/E2E_EVIDENCE.md#ca-5-thu-hoi-professional-license-6-thanh-cong-revoke`](evidence/e2e/E2E_EVIDENCE.md#ca-5-thu-hoi-professional-license-6-thanh-cong-revoke) |
| **Ca 6** | Thử suspend License đã revoke (`suspendLicense(6)`) | `0xe887937d1e49f981395ff84dbf7149979340a4572052af1ff3fa2d9a92e66520` | `11570437` | `30,799` | `0.00007820829615916 ETH` | `[Chưa có trong evidence tổng hợp]` *(Giao dịch Revert không phát event)* | Không thay đổi; giữ nguyên `REVOKED`; Revert lý do: `"License not active"` | [`evidence/e2e/E2E_EVIDENCE.md#ca-6-chan-thao-tac-tren-license-da-revoked-terminal-state-protection`](evidence/e2e/E2E_EVIDENCE.md#ca-6-chan-thao-tac-tren-license-da-revoked-terminal-state-protection) |
| **Ca 7** | Cấp License có thời hạn (`issueLicense` #9) | `[Chưa có trong evidence tổng hợp]` | `11571252` *(Block phát hành)* | `289,343` | `0.000743587443027946 ETH` | `LicenseIssued` | Tạo License `#9`, `status = ACTIVE`, suy diễn động `EXPIRED` | [`evidence/e2e/E2E_EVIDENCE.md#ca-7-license-het-han-dynamic-expired-status--verification`](evidence/e2e/E2E_EVIDENCE.md#ca-7-license-het-han-dynamic-expired-status--verification) |

---

## 6. E2E evidence Ca 0–10

Tóm tắt toàn bộ 11 ca kiểm thử người dùng đầu-cuối (E2E) trên mạng Sepolia Testnet. Toàn bộ tên credential được giữ nguyên bản theo bằng chứng gốc (`CompTIA Security+`, `SOC Analyst 2`, `SOC Analysist 1`):

| Case | Kịch bản kiểm thử | Kết quả thực tế | Bằng chứng tài liệu & Hình ảnh trực quan |
|---|---|---|---|
| **Ca 0** | **Quản trị Admin & Kết nối ví Publisher** | Admin đăng ký ví Publisher thành công; Publisher kết nối ứng dụng hiển thị đúng vai trò `PUBLISHER` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-0`](evidence/e2e/E2E_EVIDENCE.md#ca-0-quan-tri-admin--ket-noi-vi-publisher-tren-sepolia)<br>- Ảnh Admin cấp quyền: [`evidence/e2e/e2e-00-admin-register-publisher-success.png`](evidence/e2e/e2e-00-admin-register-publisher-success.png)<br>- Ảnh Publisher kết nối: [`evidence/e2e/e2e-00-publisher-sepolia-connected.png`](evidence/e2e/e2e-00-publisher-sepolia-connected.png) |
| **Ca 1** | **Cấp Qualification (`CompTIA Security+`)** | Cấp thành công Qualification ID `#5`, danh sách required IDs rỗng (`[]`), hiển thị thẻ `ACTIVE` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-1`](evidence/e2e/E2E_EVIDENCE.md#ca-1-cap-qualification-thanh-cong-comptia-security)<br>- Form cấp phát: [`evidence/e2e/e2e-01-issue-qualification-success.png`](evidence/e2e/e2e-01-issue-qualification-success.png)<br>- Danh sách Qualification `ACTIVE`: [`evidence/e2e/e2e-01-qualification-active.png`](evidence/e2e/e2e-01-qualification-active.png)<br>- Sepolia Etherscan: [`evidence/e2e/e2e-01-transaction-etherscan.png`](evidence/e2e/e2e-01-transaction-etherscan.png) |
| **Ca 2** | **Cấp Professional License (`SOC Analyst 2`)** | Cấp thành công Professional License ID `#6` phụ thuộc Qualifications `[3, 5]`; Verify trả về `VALID` (2 requirements `PASS`) | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-2`](evidence/e2e/E2E_EVIDENCE.md#ca-2-cap-professional-license-thanh-cong-soc-analyst-2)<br>- Form cấp phát: [`evidence/e2e/e2e-02-issue-license-success.png`](evidence/e2e/e2e-02-issue-license-success.png)<br>- Danh sách License `ACTIVE`: [`evidence/e2e/e2e-02-license-active.png`](evidence/e2e/e2e-02-license-active.png)<br>- Màn hình Verify `VALID` 2/2 `PASS`: [`evidence/e2e/e2e-02-license-valid-requirements-pass.png`](evidence/e2e/e2e-02-license-valid-requirements-pass.png)<br>- Sepolia Etherscan: [`evidence/e2e/e2e-02-transaction-etherscan.png`](evidence/e2e/e2e-02-transaction-etherscan.png) |
| **Ca 3** | **Tạm đình chỉ Qualification #3 (Suspend)** | Qualification `#3` chuyển sang `SUSPENDED`; Verify `#3` trả về `SUSPENDED / INVALID`; Professional License `#6` tự động bị vô hiệu hóa khi verify (`INVALID` do dependency `#3` `FAIL`) | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-3`](evidence/e2e/E2E_EVIDENCE.md#ca-3-tam-dinh-chi-qualification-3-suspend-va-tac-dong-den-professional-license-6)<br>- Form Suspend thành công: [`evidence/e2e/e2e-03-suspend-qualification-success.png`](evidence/e2e/e2e-03-suspend-qualification-success.png)<br>- Danh sách `#3` `SUSPENDED`: [`evidence/e2e/e2e-03-qualification-suspended.png`](evidence/e2e/e2e-03-qualification-suspended.png)<br>- Verify `#3` `SUSPENDED / INVALID`: [`evidence/e2e/e2e-03-qualification-verify-invalid.png`](evidence/e2e/e2e-03-qualification-verify-invalid.png)<br>- Danh sách `#6` on-chain `ACTIVE`: [`evidence/e2e/e2e-03-dependent-license-list-active.png`](evidence/e2e/e2e-03-dependent-license-list-active.png)<br>- Verify `#6` bị `INVALID`: [`evidence/e2e/e2e-03-dependent-license-invalid.png`](evidence/e2e/e2e-03-dependent-license-invalid.png)<br>- Sepolia Etherscan: [`evidence/e2e/e2e-03-transaction-etherscan.png`](evidence/e2e/e2e-03-transaction-etherscan.png) |
| **Ca 4** | **Khôi phục Qualification #3 (Restore)** | Qualification `#3` khôi phục về `ACTIVE`; Verify `#3` trở lại `VALID`; Professional License `#6` tự động tái hợp lệ (`VALID`, 2/2 requirements `PASS`) | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-4`](evidence/e2e/E2E_EVIDENCE.md#ca-4-khoi-phuc-qualification-3-restore-va-tai-hop-le-hoa-professional-license-6)<br>- Danh sách `#3` `ACTIVE`: [`evidence/e2e/e2e-04-qualification-active-list.png`](evidence/e2e/e2e-04-qualification-active-list.png)<br>- Thẻ `#3` `ACTIVE`: [`evidence/e2e/e2e-04-qualification-active.png`](evidence/e2e/e2e-04-qualification-active.png)<br>- Verify `#3` `VALID`: [`evidence/e2e/e2e-04-qualification-valid.png`](evidence/e2e/e2e-04-qualification-valid.png)<br>- Verify `#6` tự động phục hồi `VALID`: [`evidence/e2e/e2e-04-dependent-license-valid.png`](evidence/e2e/e2e-04-dependent-license-valid.png)<br>- Sepolia Etherscan: [`evidence/e2e/e2e-04-transaction-etherscan.png`](evidence/e2e/e2e-04-transaction-etherscan.png) |
| **Ca 5** | **Thu hồi Professional License #6 (Revoke)** | Thu hồi vĩnh viễn License `#6`; trạng thái on-chain chuyển `REVOKED`; Verify trả về `REVOKED / INVALID` kèm cảnh báo thu hồi vĩnh viễn | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-5`](evidence/e2e/E2E_EVIDENCE.md#ca-5-thu-hoi-professional-license-6-thanh-cong-revoke)<br>- Form Revoke thành công: [`evidence/e2e/e2e-05-revoke-license-success.png`](evidence/e2e/e2e-05-revoke-license-success.png)<br>- Danh sách `#6` `REVOKED`: [`evidence/e2e/e2e-05-license-revoked-list.png`](evidence/e2e/e2e-05-license-revoked-list.png)<br>- Verify `#6` `REVOKED / INVALID`: [`evidence/e2e/e2e-05-license-revoked-invalid.png`](evidence/e2e/e2e-05-license-revoked-invalid.png)<br>- Sepolia Etherscan: [`evidence/e2e/e2e-05-transaction-etherscan.png`](evidence/e2e/e2e-05-transaction-etherscan.png) |
| **Ca 6** | **Bảo vệ trạng thái kết thúc (Terminal State)** | Giao diện tự động khóa các nút vòng đời trên License `#6` đã `REVOKED`; gọi trực tiếp contract bị EVM REVERT với lỗi `"License not active"` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-6`](evidence/e2e/E2E_EVIDENCE.md#ca-6-chan-thao-tac-tren-license-da-revoked-terminal-state-protection)<br>- Form UI khóa nút thao tác: [`evidence/e2e/e2e-06-revoked-lifecycle-buttons-blocked.png`](evidence/e2e/e2e-06-revoked-lifecycle-buttons-blocked.png)<br>- Remix Revert: [`evidence/e2e/e2e-06-revoked-direct-call-terminal-reverted.png`](evidence/e2e/e2e-06-revoked-direct-call-terminal-reverted.png)<br>- Sepolia Etherscan Revert: [`evidence/e2e/e2e-06-revoked-direct-call-etherscan.png`](evidence/e2e/e2e-06-revoked-direct-call-etherscan.png) |
| **Ca 7** | **License hết hạn (Dynamic Expired Status)** | License `#9` (`SOC Analysist 1`) có thời hạn qua thời điểm `expiry` (`26/8/2026`); dashboard hiển thị nhãn `EXPIRED`; verify trả về `EXPIRED / INVALID` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-7`](evidence/e2e/E2E_EVIDENCE.md#ca-7-license-het-han-dynamic-expired-status--verification)<br>- Dashboard nhãn `EXPIRED`: [`evidence/e2e/e2e-07-license-expired-list.png`](evidence/e2e/e2e-07-license-expired-list.png)<br>- Verify `EXPIRED / INVALID`: [`evidence/e2e/e2e-07-license-expired-invalid.png`](evidence/e2e/e2e-07-license-expired-invalid.png) |
| **Ca 8** | **Metadata bị can thiệp (Tampered Metadata)** | Sửa đổi giá trị tham số `m` trên URL xác thực; client phát hiện không khớp `metadataHash` on-chain, trả về `UNTRUSTED / INTEGRITY FAILED` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9`](evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9-kiem-thu-tinh-toan-ven-metadata)<br>- Màn hình Integrity Failed: [`evidence/e2e/e2e-08-tampered-metadata-untrusted.jpg`](evidence/e2e/e2e-08-tampered-metadata-untrusted.jpg) |
| **Ca 9** | **Thiếu Metadata (Missing Metadata)** | Mở URL xác thực không chứa tham số `m` trên trình duyệt mới (không có cache `localStorage`); hệ thống trả về `UNVERIFIABLE` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9`](evidence/e2e/E2E_EVIDENCE.md#ca-8--ca-9-kiem-thu-tinh-toan-ven-metadata)<br>- Màn hình Unverifiable: [`evidence/e2e/e2e-09-missing-metadata-unverifiable.jpg`](evidence/e2e/e2e-09-missing-metadata-unverifiable.jpg) |
| **Ca 10** | **Chia sẻ / QR đa thiết bị (Cross-Device)** | Tạo mã QR cho License `#9` trên Desktop; mở/quét trên điện thoại di động (chế độ `USER`, không kết nối ví); xác thực thành công `VALID` với 3/3 qualifications `PASS` | - Chi tiết: [`evidence/e2e/E2E_EVIDENCE.md#ca-10`](evidence/e2e/E2E_EVIDENCE.md#ca-10-chia-se--qr-tren-nhieu-thiet-bi-cross-device-share--qr)<br>- QR Desktop Modal: [`evidence/e2e/e2e-10-share-qr-generated.png`](evidence/e2e/e2e-10-share-qr-generated.png)<br>- Mobile Verify `VALID` (3/3 `PASS`): [`evidence/e2e/e2e-10-cross-device-verify-valid.png`](evidence/e2e/e2e-10-cross-device-verify-valid.png) |

---

## 7. Automated test và security evidence

### 7.1. Bằng chứng kiểm thử đơn vị Smart Contract (Unit Testing)
- **Nền tảng thực thi:** Plugin **Solidity Unit Testing** trên Remix IDE.
- **Tệp kiểm thử chính:** [`evidence/unit-test/ProfessionalLicenseRegistry_test.sol`](evidence/unit-test/ProfessionalLicenseRegistry_test.sol) cùng hợp đồng phụ trợ [`evidence/unit-test/LifecycleCaller.sol`](evidence/unit-test/LifecycleCaller.sol).
- **Kết quả thực thi:** Đạt **21/21 test cases PASS (0 FAIL)** trong thời gian 1.32 giây (đối chiếu [`evidence/unit-test/unit-tests-pass21-fail0.txt`](evidence/unit-test/unit-tests-pass21-fail0.txt)).
- **Số lệnh kiểm tra (Assertions):** 87 câu lệnh assertion trong mã nguồn kiểm thử (đếm tĩnh trong tệp test).
- **Phạm vi kiểm thử tự động bao phủ 7 nhóm:**
  1. *Triển khai & Phân quyền Admin:* Xác minh tài khoản deploy là Admin; kiểm tra validation zero-address; từ chối đăng ký trùng lặp hoặc caller không phải admin.
  2. *Cấp & Xác minh Qualification:* Cấp phát License ID tuần tự; kiểm tra lưu trữ trường dữ liệu và metadataHash; xác minh đúng/sai owner.
  3. *Cấp Professional License & Requirement:* Kiểm tra trước điều kiện tiên quyết (`checkLicenseRequirements`); từ chối Professional License lồng nhau làm qualification requirement.
  4. *Quản lý Vòng đời State Machine:* Chuyển đổi `ACTIVE ➔ SUSPENDED ➔ ACTIVE`, `ACTIVE ➔ REVOKED`, `SUSPENDED ➔ REVOKED`; bảo vệ Terminal State (mọi thao tác trái phép trên license đã `REVOKED` đều bị REVERT).
  5. *Cascade Dependency & Thời hạn Expiry:* Qualification bị suspend, revoke hoặc expired làm Professional License phụ thuộc mất hiệu lực; khôi phục qualification sẽ khôi phục hiệu lực license; kiểm thử thời hạn vĩnh viễn (`expiry == 0`) và có thời hạn (`expiry > 0`).
  6. *Kiểm soát quyền kép (Dual Access Control):* Non-publisher không thể gọi hàm vòng đời; Publisher không phải Issuer ban đầu không thể can thiệp license của Issuer khác; Publisher bị Admin gỡ quyền (`removePublisher`) lập tức mất quyền quản lý.
  7. *Cấp lại sau khi Revoke (Re-issuance):* Cấp lại bắt buộc tạo License ID tuần tự mới; License ID cũ đã thu hồi vẫn vĩnh viễn mất hiệu lực.
- **Giới hạn của bộ Unit Test:** Theo ghi nhận tại [`evidence/unit-test/unit-test-report.txt`](evidence/unit-test/unit-test-report.txt), 21 test case hiện tại tập trung kiểm tra state logic và revert reason, **chưa bao gồm assertion chi tiết cho toàn bộ các trường dữ liệu của Event logs**.

### 7.2. Bằng chứng phân tích tĩnh (Static Analysis)
- **Công cụ thực hiện:** Plugin Solidity Static Analysis trên Remix IDE (đối chiếu [`evidence/static-analysis/static-analysis-report.md`](evidence/static-analysis/static-analysis-report.md) và [`evidence/static-analysis/static-analysis-result.txt`](evidence/static-analysis/static-analysis-result.txt)). Evidence hiện có ghi nhận kết quả phân tích tĩnh trên contract; chưa có log Slither CLI độc lập trong repository.
- **Kết luận phân tích tĩnh:** *"Không phát hiện vấn đề nghiêm trọng trong phạm vi phân tích được ghi nhận."*
- **Chi tiết đánh giá kỹ thuật:**
  - *Access Control kép:* Bảo đảm các hàm `suspendLicense`, `restoreLicense`, `revokeLicense` bắt buộc thỏa mãn cả 2 điều kiện `publishers[msg.sender]` và `license.issuer == msg.sender`.
  - *State Machine Integrity:* Ràng buộc chặt chẽ điều kiện chuyển đổi trạng thái; ngăn chặn tuyệt đối việc chuyển đổi ra khỏi trạng thái terminal `REVOKED`.
  - *Reentrancy & External Calls:* Không phát hiện đường gọi bên ngoài hoặc chuyển ETH trong contract; do đó không ghi nhận bề mặt reentrancy trong phạm vi MVP.

### 7.3. Đánh giá rủi ro còn lại (Residual Risks)
1. **Phụ thuộc Timestamp (`block.timestamp`):** Smart Contract sử dụng `block.timestamp` để ghi nhận ngày phát hành (`issueDate`), so sánh ngày hết hạn (`expiry`) và timestamp trong event. Do độ lệch timestamp của miner/validator trên Ethereum bị giới hạn trong khoảng 15 giây, mức độ rủi ro này là không đáng kể đối với chứng chỉ hành nghề có thời hạn tính theo ngày/tháng/năm, hoàn toàn chấp nhận được trong phạm vi MVP.
2. **Vòng lặp mảng động (`requiredQualificationIds`):** Hàm `_checkRequirements` duyệt tuần tự qua mảng các qualification tiên quyết. Với chứng chỉ thực tế có số lượng qualification phụ thuộc nhỏ (thường từ 1 đến 5 điều kiện), chi phí gas nằm trong tầm kiểm soát. Nếu số lượng dependency quá lớn, chi phí gas sẽ tăng tuyến tính.
3. **Niềm tin đối với Issuer (Issuer Trust Boundary):** Blockchain bảo đảm tính toàn vẹn và bất biến của dữ liệu đã ghi, nhưng không thể tự động xác minh tính xác thực ngoài đời thực của tổ chức phát hành (Publisher) hay tính chính xác của tài liệu gốc đầu vào.
4. **Metadata ngoài chuỗi (Off-chain Metadata Management):** Dữ liệu metadata chi tiết được lưu trữ ngoài chuỗi (`localStorage` hoặc mã hóa trong tham số URL `m`). Nếu người dùng chia sẻ URL không kèm tham số `m` sang thiết bị khác, hệ thống sẽ rơi vào trạng thái `UNVERIFIABLE`.
5. **Quản lý khóa bí mật (Key Management):** Tính an toàn của hệ thống phụ thuộc vào việc bảo vệ an toàn private key của tài khoản Admin và các Publisher được ủy quyền ngoài đời thực.

---

## 8. Security, privacy và trust boundary

### 8.1. Tài sản cần bảo vệ (Assets)
- Sổ đăng ký chứng chỉ / giấy phép hành nghề chuyên môn on-chain.
- Tính toàn vẹn và bất biến của lịch sử cấp phát, tạm đình chỉ, khôi phục và thu hồi.
- Ràng buộc quan hệ phụ thuộc (Cascade Dependency) giữa Qualification và Professional License.
- Tính xác thực của thông tin chứng chỉ thông qua băm toàn vẹn `metadataHash` (Keccak256).

### 8.2. Mô hình phân quyền 4 vai trò
- **Admin:** Tài khoản quản trị cấp cao nhất (mặc định là ví deploy hợp đồng), có quyền ủy quyền (`registerPublisher`) hoặc gỡ bỏ quyền (`removePublisher`) của các tổ chức phát hành.
- **Publisher:** Tổ chức/cơ quan cấp phép được Admin ủy quyền, có quyền cấp phát chứng chỉ mới (`issueLicense`) và quản lý vòng đời đối với các chứng chỉ do chính mình phát hành.
- **Holder (Chủ sở hữu):** Người hành nghề nhận chứng chỉ vào địa chỉ ví cá nhân; có quyền sở hữu, lưu trữ và chia sẻ mã QR / liên kết xác thực.
- **Verifier (Người xác minh công khai):** Bất kỳ cá nhân hoặc tổ chức nào có nhu cầu kiểm tra tính hợp lệ của chứng chỉ; có thể xác thực trực tiếp trên blockchain hoàn toàn miễn phí mà không cần kết nối ví hay có tài khoản.

### 8.3. Cơ chế kiểm soát an ninh cốt lõi
- **Kiểm soát quyền kép (Dual Guard Access Control):** Mọi thao tác thay đổi vòng đời chứng chỉ bắt buộc người gọi phải là Publisher đang hoạt động (`publishers[msg.sender] == true`) và đồng thời phải là người phát hành ban đầu của chứng chỉ đó (`license.issuer == msg.sender`).
- **Bảo vệ Trạng thái Kết thúc (Terminal REVOKED State):** Khi đã bị `REVOKED`, chứng chỉ bị đóng băng vĩnh viễn on-chain. Không có bất kỳ hàm hoặc quyền hạn nào (kể cả Admin) có thể khôi phục lại chứng chỉ đã thu hồi. Việc cấp lại bắt buộc phải tạo License ID mới.
- **Vô hiệu hóa phụ thuộc tự động (Cascade Dependency Invalidation):** Hàm xác thực `verifyLicense` tự động kiểm tra trạng thái thời gian thực của toàn bộ qualification tiên quyết; nếu bất kỳ qualification nào bị tạm đình chỉ, thu hồi hoặc hết hạn, Professional License lập tức bị coi là không hợp lệ.
- **Kiểm tra toàn vẹn Metadata Hash:** Dữ liệu metadata phong phú (tên chứng chỉ, mô tả, thông tin chi tiết) được băm bằng thuật toán `keccak256` và lưu on-chain. Trình duyệt client tự động băm lại dữ liệu off-chain để đối chiếu; mọi hành vi can thiệp trái phép đều bị phát hiện ngay lập tức (`UNTRUSTED / INTEGRITY FAILED`).

### 8.4. Quyền riêng tư và Ranh giới Tin cậy (Privacy & Trust Boundary)
- **Quyền riêng tư dữ liệu On-chain:** Không lưu trữ tài liệu thô, hình ảnh căn cước, thông tin định danh cá nhân nhạy cảm (PII) hoặc private key lên public blockchain. Chuỗi khối chỉ lưu trữ địa chỉ ví (`address`), số nhận dạng tuần tự (`uint256`), nhãn thời gian (`timestamp`), trạng thái enum và giá trị băm `metadataHash`.
- **Ranh giới tin cậy của Blockchain:** Smart Contract bảo đảm tính toàn vẹn và bất biến về mặt kỹ thuật, nhưng không thể tự động xác minh tính hợp pháp ngoài đời thực của Publisher. Trách nhiệm thẩm định tổ chức phát hành thuộc về Admin và quy trình pháp lý ngoài chuỗi.
- **Ranh giới lưu trữ Metadata Off-chain:** Dữ liệu metadata off-chain được lưu cục bộ trong `localStorage` của trình duyệt phát hành và truyền tải qua tham số `m` trên URL chia sẻ; dữ liệu này có rủi ro bị mất hoặc phân mảnh nếu người dùng xóa cache trình duyệt mà không lưu trữ URL chia sẻ hoặc mã QR.

---

## 9. Chi phí và thao tác read-only

### 9.1. Thống kê tài nguyên 7 giao dịch thay đổi trạng thái (State-Changing Transactions)
Dưới đây là bảng tổng hợp chi phí gas và phí giao dịch thực tế đo lường trên mạng Ethereum Sepolia Testnet trong quá trình kiểm thử E2E (đây là số đo của lần kiểm thử E2E hiện tại, không đại diện cho production):

| Ca kiểm thử | Thao tác thực hiện | Gas Used | Transaction Fee (ETH) | Ghi chú trạng thái |
|---|---|---:|---:|---|
| **Ca 1** | Issue Qualification #5 (`CompTIA Security+`) | `171,353` | `0.000427209318662672 ETH` | Thành công |
| **Ca 2** | Issue Professional License #6 (`SOC Analyst 2`) | `237,412` | `0.000605621407404720 ETH` | Thành công (kèm 2 qualification IDs) |
| **Ca 3** | Suspend Qualification #3 | `53,562` | `0.000133565890729452 ETH` | Thành công |
| **Ca 4** | Restore Qualification #3 | `31,661` | `0.000081656445866947 ETH` | Thành công |
| **Ca 5** | Revoke Professional License #6 | `53,710` | `0.000140269797500380 ETH` | Thành công |
| **Ca 6** | Thử suspend License #6 đã bị REVOKED | `30,799` | `0.000078208296159160 ETH` | **Revert có chủ đích** (`"License not active"`) |
| **Ca 7** | Issue Expired License #9 (`SOC Analysist 1`) | `289,343` | `0.000743587443027946 ETH` | Thành công (kèm 3 qualification IDs) |

### 9.2. Phân tích chi phí và hiệu quả vận hành
- **Tổng số giao dịch ghi:** 7 transactions (gồm 6 giao dịch thành công và 1 giao dịch bị revert có chủ đích trong lần kiểm thử E2E hiện tại; không đại diện cho chi phí production).
- **Tổng lượng Gas tiêu thụ:** `867,840 gas` (số đo thực tế của lần kiểm thử E2E hiện tại, không đại diện cho production).
- **Tổng chi phí giao dịch:** `0.00221011859935128 ETH` (khoảng ~$5.50 - $6.50 theo giá ETH tham chiếu. Chi phí được ghi nhận trong lần kiểm thử này; chưa đủ dữ liệu để kết luận tối ưu hoặc đại diện cho chi phí production).
- **Phân tích giao dịch Revert (Ca 6):** Giao dịch Ca 6 bị revert nhưng vẫn tiêu tốn `30,799 gas` do EVM phải thực thi các bước kiểm tra điều kiện bảo vệ trước khi kích hoạt lệnh revert. Giao dịch revert bảo vệ tính toàn vẹn của sổ đăng ký và không làm thay đổi trạng thái lưu trữ trên chuỗi.
- **Thao tác đọc không phát sinh phí Gas (View / Read-Only Calls):** Các thao tác kết nối ví (Connect Wallet), xác minh chứng chỉ (`verifyLicense`), kiểm tra trước điều kiện (`checkLicenseRequirements`), đọc danh sách chứng chỉ từ mapping lưu trữ, tạo mã QR và chia sẻ URL xác thực hoàn toàn là các lời gọi view/read-only tới node RPC hoặc xử lý cục bộ trên client; **hoàn toàn không tạo giao dịch on-chain và không phát sinh bất kỳ khoản phí gas nào cho người dùng cuối (Verifiers/Holders)**.
- **Lưu ý về Timestamp & Audit:** Block number và timestamp trong báo cáo là bằng chứng kiểm toán bất biến trên chuỗi; không coi đây là số liệu đo lường độ trễ mạng (confirmation latency) hay thông lượng (throughput) do chưa thiết lập hệ thống đo kiểm benchmark độc lập.

---

## 10. Reproducibility

### 10.1. Yêu cầu tiên quyết (Prerequisites)
- **Node.js:** Phiên bản `>= 18.0.0` (môi trường kiểm thử chuẩn: `v24.19.0`).
- **npm:** Phiên bản `>= 9.0.0` (môi trường kiểm thử chuẩn: `11.17.0`).
- **Trình duyệt Web & Ví Web3:** Google Chrome / Brave / Edge có cài đặt tiện ích mở rộng **MetaMask**.
- **Mạng thử nghiệm:** Kết nối mạng **Ethereum Sepolia Testnet** (`Chain ID: 11155111`).
- **Sepolia ETH:** Nhận từ các Faucet công khai (dành cho tài khoản Admin/Publisher thực hiện giao dịch ghi).

### 10.2. Hướng dẫn chạy và xây dựng Frontend Client
1. **Cài đặt thư viện phụ thuộc:**
   ```bash
   cd frontend
   npm ci
   ```
2. **Chạy máy chủ phát triển cục bộ (Local Dev Server):**
   ```bash
   npm run dev
   ```
   Ứng dụng khởi chạy tại địa chỉ: `http://localhost:5173`.
3. **Tạo bản build Production:**
   ```bash
   npm run build
   ```
   Bundle tĩnh tối ưu sẽ được xuất ra thư mục `frontend/dist/` (sẵn sàng kéo thả triển khai lên Netlify).

### 10.3. Hướng dẫn kiểm thử Smart Contract trên Remix IDE
1. Truy cập [Remix IDE](https://remix.ethereum.org/).
2. Tải các tệp mã nguồn vào không gian làm việc:
   - [`ProfessionalLicenseRegistry.sol`](ProfessionalLicenseRegistry.sol)
   - [`evidence/unit-test/ProfessionalLicenseRegistry_test.sol`](evidence/unit-test/ProfessionalLicenseRegistry_test.sol)
   - [`evidence/unit-test/LifecycleCaller.sol`](evidence/unit-test/LifecycleCaller.sol)
3. Kích hoạt plugin **Solidity Unit Testing** trên Remix IDE.
4. Chọn cấu hình: Compiler Solidity `0.8.34`, EVM `Osaka`.
5. Chọn tệp `ProfessionalLicenseRegistry_test.sol` và bấm nút **Run**.
6. **Kết quả kỳ vọng:** Đạt **21/21 test cases PASS (0 FAIL)** trong ~1.32s.

### 10.4. Cấu hình Sepolia và Quy trình Triển khai lại (Redeployment)
1. Mở Remix IDE, chọn compiler `0.8.34`, EVM `Osaka`, Optimizer: `No`.
2. Tại tab *Deploy & Run Transactions*, chọn môi trường `Injected Provider - MetaMask` (chọn mạng Sepolia).
3. Bấm **Deploy** `ProfessionalLicenseRegistry` (tài khoản deploy tự động trở thành Admin).
4. Từ tài khoản Admin, gọi hàm `registerPublisher(address publisher)` để cấp quyền cho ví Publisher.
5. Cập nhật địa chỉ hợp đồng mới vào biến cấu hình trong [`frontend/src/main.js`](frontend/src/main.js) và đồng bộ tệp ABI [`frontend/src/abi.json`](frontend/src/abi.json).

### 10.5. Xác minh, Chia sẻ và Đặt lại dữ liệu Cache
- **Xác minh & Chia sẻ:** Truy cập tab *Verify License*, nhập ID và địa chỉ Owner (hoặc mở liên kết chia sẻ / quét mã QR chứa tham số `m`).
- **Đặt lại cache Metadata cục bộ:** Xóa `localStorage` trên origin của trình duyệt (hoặc mở cửa sổ Ẩn danh mới). *Lưu ý: Dữ liệu trên blockchain Sepolia là bất biến (immutable) và không thể xóa bỏ.*

### 10.6. Đánh giá Mức độ Tái lập (Reproducibility Assessment)
- **Trạng thái tiêu chí M9:** Hiện được đánh giá là **`ĐẠT MỘT PHẦN`**.
- **Lý do & Giới hạn:**
  - Quy trình tái lập hiện tại dựa trên các bước thủ công có hướng dẫn rõ ràng qua Remix IDE, MetaMask và npm CLI.
  - Dự án **chưa thiết lập pipeline tự động một lệnh (One-command automated pipeline)** từ khâu biên dịch, deploy đến chạy kiểm thử E2E tự động.
  - Quy trình chưa được kiểm chứng độc lập trên máy sạch hoàn toàn không có cấu hình sẵn (Clean-machine verified).
  - Hoạt động phụ thuộc vào tính sẵn sàng của các node RPC công khai Sepolia và kết nối mạng ngoài.

---

## 11. Evidence index

Danh mục liên kết tương đối tới toàn bộ các tệp bằng chứng và mã nguồn trong repository (Đường dẫn nội bộ được kiểm tra ở mức trỏ tới file tồn tại):

### 11.1. Bằng chứng Kiểm thử E2E
- **Báo cáo tổng hợp E2E:** [`evidence/e2e/E2E_EVIDENCE.md`](evidence/e2e/E2E_EVIDENCE.md)
- **Ca 0 (Admin & Publisher Connection):**
  - [`evidence/e2e/e2e-00-admin-register-publisher-success.png`](evidence/e2e/e2e-00-admin-register-publisher-success.png)
  - [`evidence/e2e/e2e-00-publisher-sepolia-connected.png`](evidence/e2e/e2e-00-publisher-sepolia-connected.png)
- **Ca 1 (Issue Qualification):**
  - [`evidence/e2e/e2e-01-issue-qualification-success.png`](evidence/e2e/e2e-01-issue-qualification-success.png)
  - [`evidence/e2e/e2e-01-qualification-active.png`](evidence/e2e/e2e-01-qualification-active.png)
  - [`evidence/e2e/e2e-01-transaction-etherscan.png`](evidence/e2e/e2e-01-transaction-etherscan.png)
- **Ca 2 (Issue Professional License):**
  - [`evidence/e2e/e2e-02-issue-license-success.png`](evidence/e2e/e2e-02-issue-license-success.png)
  - [`evidence/e2e/e2e-02-license-active.png`](evidence/e2e/e2e-02-license-active.png)
  - [`evidence/e2e/e2e-02-license-valid-requirements-pass.png`](evidence/e2e/e2e-02-license-valid-requirements-pass.png)
  - [`evidence/e2e/e2e-02-transaction-etherscan.png`](evidence/e2e/e2e-02-transaction-etherscan.png)
- **Ca 3 (Suspend Qualification):**
  - [`evidence/e2e/e2e-03-suspend-qualification-success.png`](evidence/e2e/e2e-03-suspend-qualification-success.png)
  - [`evidence/e2e/e2e-03-qualification-suspended.png`](evidence/e2e/e2e-03-qualification-suspended.png)
  - [`evidence/e2e/e2e-03-qualification-verify-invalid.png`](evidence/e2e/e2e-03-qualification-verify-invalid.png)
  - [`evidence/e2e/e2e-03-dependent-license-list-active.png`](evidence/e2e/e2e-03-dependent-license-list-active.png)
  - [`evidence/e2e/e2e-03-dependent-license-invalid.png`](evidence/e2e/e2e-03-dependent-license-invalid.png)
  - [`evidence/e2e/e2e-03-transaction-etherscan.png`](evidence/e2e/e2e-03-transaction-etherscan.png)
- **Ca 4 (Restore Qualification):**
  - [`evidence/e2e/e2e-04-qualification-active-list.png`](evidence/e2e/e2e-04-qualification-active-list.png)
  - [`evidence/e2e/e2e-04-qualification-active.png`](evidence/e2e/e2e-04-qualification-active.png)
  - [`evidence/e2e/e2e-04-qualification-valid.png`](evidence/e2e/e2e-04-qualification-valid.png)
  - [`evidence/e2e/e2e-04-dependent-license-valid.png`](evidence/e2e/e2e-04-dependent-license-valid.png)
  - [`evidence/e2e/e2e-04-transaction-etherscan.png`](evidence/e2e/e2e-04-transaction-etherscan.png)
- **Ca 5 (Revoke Professional License):**
  - [`evidence/e2e/e2e-05-revoke-license-success.png`](evidence/e2e/e2e-05-revoke-license-success.png)
  - [`evidence/e2e/e2e-05-license-revoked-list.png`](evidence/e2e/e2e-05-license-revoked-list.png)
  - [`evidence/e2e/e2e-05-license-revoked-invalid.png`](evidence/e2e/e2e-05-license-revoked-invalid.png)
  - [`evidence/e2e/e2e-05-transaction-etherscan.png`](evidence/e2e/e2e-05-transaction-etherscan.png)
- **Ca 6 (Terminal State Protection Revert):**
  - [`evidence/e2e/e2e-06-revoked-lifecycle-buttons-blocked.png`](evidence/e2e/e2e-06-revoked-lifecycle-buttons-blocked.png)
  - [`evidence/e2e/e2e-06-revoked-direct-call-terminal-reverted.png`](evidence/e2e/e2e-06-revoked-direct-call-terminal-reverted.png)
  - [`evidence/e2e/e2e-06-revoked-direct-call-etherscan.png`](evidence/e2e/e2e-06-revoked-direct-call-etherscan.png)
- **Ca 7 (License Expired):**
  - [`evidence/e2e/e2e-07-license-expired-list.png`](evidence/e2e/e2e-07-license-expired-list.png)
  - [`evidence/e2e/e2e-07-license-expired-invalid.png`](evidence/e2e/e2e-07-license-expired-invalid.png)
- **Ca 8 & Ca 9 (Metadata Tampering & Missing Metadata):**
  - [`evidence/e2e/e2e-08-tampered-metadata-untrusted.jpg`](evidence/e2e/e2e-08-tampered-metadata-untrusted.jpg)
  - [`evidence/e2e/e2e-09-missing-metadata-unverifiable.jpg`](evidence/e2e/e2e-09-missing-metadata-unverifiable.jpg)
- **Ca 10 (Cross-Device Share / QR):**
  - [`evidence/e2e/e2e-10-share-qr-generated.png`](evidence/e2e/e2e-10-share-qr-generated.png)
  - [`evidence/e2e/e2e-10-cross-device-verify-valid.png`](evidence/e2e/e2e-10-cross-device-verify-valid.png)

### 11.2. Bằng chứng Triển khai (Deployment Evidence)
- **Báo cáo triển khai:** [`evidence/intergration/deployment-evidence/deployment-evidence.md`](evidence/intergration/deployment-evidence/deployment-evidence.md)
- **Ảnh cấu hình trình biên dịch:** [`evidence/intergration/deployment-evidence/compiler-setting.png`](evidence/intergration/deployment-evidence/compiler-setting.png)
- **Ảnh biên nhận giao dịch triển khai Sepolia:** [`evidence/intergration/deployment-evidence/transaction-evidence.png`](evidence/intergration/deployment-evidence/transaction-evidence.png)
- **Ảnh chụp triển khai Remix IDE:** [`evidence/intergration/deployment-evidence/hinh-anh-remix-deploy.png`](evidence/intergration/deployment-evidence/hinh-anh-remix-deploy.png)
- **Tệp ABI hợp đồng triển khai:** [`evidence/intergration/ProfessionalLicenseRegistry.abi.json`](evidence/intergration/ProfessionalLicenseRegistry.abi.json)

### 11.3. Bằng chứng Kiểm thử đơn vị (Unit Test Evidence)
- **Tệp mã nguồn Unit Test:** [`evidence/unit-test/ProfessionalLicenseRegistry_test.sol`](evidence/unit-test/ProfessionalLicenseRegistry_test.sol)
- **Hợp đồng phụ trợ kiểm thử:** [`evidence/unit-test/LifecycleCaller.sol`](evidence/unit-test/LifecycleCaller.sol)
- **Báo cáo kiểm thử đơn vị:** [`evidence/unit-test/unit-test-report.txt`](evidence/unit-test/unit-test-report.txt)
- **Log thực thi 21/21 PASS:** [`evidence/unit-test/unit-tests-pass21-fail0.txt`](evidence/unit-test/unit-tests-pass21-fail0.txt)

### 11.4. Bằng chứng Phân tích tĩnh (Static Analysis Evidence)
- **Báo cáo phân tích tĩnh:** [`evidence/static-analysis/static-analysis-report.md`](evidence/static-analysis/static-analysis-report.md)
- **Kết quả phân tích tĩnh tóm tắt:** [`evidence/static-analysis/static-analysis-result.txt`](evidence/static-analysis/static-analysis-result.txt)
- **Đánh giá rà soát phân tích tĩnh:** [`evidence/static-analysis/static-analysis-review.md`](evidence/static-analysis/static-analysis-review.md)

### 11.5. Bằng chứng Đánh giá Bảo mật (Security Audit Evidence)
- **Kết luận bảo mật:** [`evidence/security/security-conclusion.txt`](evidence/security/security-conclusion.txt)
- **Đánh giá Access Control:** [`evidence/security/authorization-access-control.txt`](evidence/security/authorization-access-control.txt)
- **Kiểm thử tiêu cực phân quyền:** [`evidence/security/authorization-negative-testst.txt`](evidence/security/authorization-negative-testst.txt)
- **Bảo mật quy trình cấp phát:** [`evidence/security/issuance-security.txt`](evidence/security/issuance-security.txt)
- **Bảo mật vòng đời chứng chỉ:** [`evidence/security/license-lifecycle-security.txt`](evidence/security/license-lifecycle-security.txt)
- **Kiểm thử bảo mật phủ định:** [`evidence/security/negative-security-tests.txt`](evidence/security/negative-security-tests.txt)
- **Bảo mật phụ thuộc Requirement:** [`evidence/security/requirement-dependency-security.txt`](evidence/security/requirement-dependency-security.txt)
- **Thông tin môi trường kiểm thử bảo mật:** [`evidence/security/0-environment.txt`](evidence/security/0-environment.txt)
- **Bằng chứng triển khai bảo mật:** [`evidence/security/1-deployment-evidence..txt`](evidence/security/1-deployment-evidence..txt)
- **Kiểm tra sau triển khai (Sanity Check):** [`evidence/security/2-post-deployment-sanity-check.txt`](evidence/security/2-post-deployment-sanity-check.txt)
- **Mã nguồn lịch sử phục vụ kiểm toán:** [`evidence/security/ProfessionalLicenseRegistry-180826.sol`](evidence/security/ProfessionalLicenseRegistry-180826.sol) *(Lưu ý: Không dùng trong runtime)*

### 11.6. Mã nguồn & Tài liệu Gốc của Repository
- **Mã nguồn Smart Contract chính thức:** [`ProfessionalLicenseRegistry.sol`](ProfessionalLicenseRegistry.sol)
- **Mã nguồn Logic Frontend:** [`frontend/src/main.js`](frontend/src/main.js)
- **Định kiểu Giao diện Frontend:** [`frontend/src/style.css`](frontend/src/style.css)
- **Tệp ABI Frontend:** [`frontend/src/abi.json`](frontend/src/abi.json)
- **Khung giao diện HTML:** [`frontend/index.html`](frontend/index.html)
- **Cấu hình gói Node.js:** [`frontend/package.json`](frontend/package.json)
- **Khóa phụ thuộc npm:** [`frontend/package-lock.json`](frontend/package-lock.json)
- **Tài liệu Hướng dẫn Dự án:** [`README.md`](README.md)
- **Giấy phép mã nguồn:** [`LICENSE`](LICENSE)
- **Cấu hình môi trường mẫu:** [`.env.example`](.env.example)

---

## 12. Evidence limitations

1. **Bằng chứng hình ảnh (Screenshots):** Ảnh chụp màn hình đóng vai trò chứng minh giao diện hiển thị thực tế tại thời điểm thực hiện kiểm thử; hình ảnh không thay thế hoàn toàn cho biên nhận mật mã (cryptographic receipt) và log sự kiện được xác nhận on-chain trên blockchain explorer.
2. **Giới hạn kiểm thử đơn vị (Unit Tests):** Kết quả 21/21 hàm kiểm thử đơn vị đạt chứng minh tính đúng đắn của logic máy trạng thái, kiểm soát quyền và các điều kiện rẽ nhánh trong hợp đồng; kết quả này không đồng nghĩa với việc đã thực hiện assertion độc lập cho tất cả các trường dữ liệu của toàn bộ Event logs.
3. **Giới hạn phân tích tĩnh (Static Analysis):** Phân tích tĩnh chứng minh không phát hiện lỗi nghiêm trọng trong các mẫu kiểm tra đã định nghĩa; phân tích tĩnh không thể chứng minh hệ thống an toàn tuyệt đối trước mọi kịch bản tấn công logic phức tạp ngoài phạm vi kiểm tra.
4. **Tính phụ thuộc dữ liệu E2E (Dataset Dependency):** Toàn bộ dữ liệu kiểm thử E2E hiện tại gắn liền với thực thể hợp đồng `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37` và bộ tài khoản kiểm thử cụ thể trên mạng Sepolia Testnet.
5. **Giới hạn lưu trữ Metadata ngoài chuỗi (Off-chain Persistence):** Dữ liệu metadata chi tiết phụ thuộc vào bộ nhớ cục bộ trình duyệt (`localStorage`) hoặc tham số URL được truyền qua mã QR; việc chia sẻ thiếu tham số `m` sang môi trường mới sẽ làm giảm khả năng kiểm chứng chi tiết tên chứng chỉ.
6. **Xác minh các tuyên bố (Claims Verification):** Toàn bộ các tuyên bố và chỉ số không có bằng chứng trực tiếp trong kho lưu trữ được ghi nhận rõ ràng là `[Chưa xác minh]` hoặc `[Chưa có trong evidence tổng hợp]`.
7. **Kiểm tra liên kết (Link Verification):** Đường dẫn nội bộ được kiểm tra ở mức trỏ tới file tồn tại.
