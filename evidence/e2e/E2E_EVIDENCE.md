# Hướng dẫn và biểu mẫu bằng chứng kiểm thử E2E (biểu mẫu xác minh người dùng)

## 1. Thông tin môi trường kiểm thử

- **Mạng:** Ethereum Sepolia Testnet (`Chain ID: 11155111`)
- **Hợp đồng chính thức:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
- **Giao dịch triển khai:** `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a`
- **Block triển khai:** `11557021`

### Trạng thái Kiểm chứng Dự án

```text
Triển khai hợp đồng: ĐÃ XÁC MINH
Tích hợp frontend: ĐÃ XÁC MINH (bản build production Vite đạt)
Kiểm thử E2E người dùng: ĐÃ XÁC MINH (toàn bộ ca 0 đến ca 10)
Kiểm thử trên nhiều thiết bị: ĐÃ XÁC MINH (Ca 10 — Cross-Device Share / QR)
```

**Evidence đã thu thập và xác minh (2026-08-26 & 2026-08-27):**
- **Ca 0 — Quản trị Admin & Kết nối Publisher trên Sepolia:** Ví Admin (`0xd01A6AD60aD342C9fBbbb4c342bB2884c2cE4432`) đăng ký và cấp quyền Publisher thành công cho ví `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82`; ví Publisher kết nối thành công với role được nhận diện là `PUBLISHER`.
- **Ca 1 — Cấp Qualification:** Cấp thành công Qualification `CompTIA Security+` (License ID `#5`), trạng thái `ACTIVE`, không có qualification phụ thuộc (`requiredQualificationIds: []`).
- **Ca 2 — Cấp Professional License:** Cấp thành công Professional License `SOC Analyst 2` (License ID `#6`), phụ thuộc Qualifications `[3, 5]`, xác minh `VALID`, các qualifications đều `PASS`.
- **Ca 3 — Tạm đình chỉ Qualification:** Qualification #3 bị tạm đình chỉ (`ACTIVE` ➔ `SUSPENDED`). Khi verify Qualification #3 trả về `SUSPENDED / INVALID`. Professional License phụ thuộc (#6) vẫn giữ trạng thái lưu trữ on-chain là `ACTIVE`, nhưng kết quả verify thực tế chuyển sang `INVALID` do dependency #3 không còn hợp lệ (`SUSPENDED / FAIL`).
- **Ca 4 — Khôi phục Qualification:** Qualification #3 được Restore từ `SUSPENDED` về `ACTIVE`. Do dependency hợp lệ trở lại, Verify License #6 chuyển từ `INVALID` về `VALID` (cả 2 qualifications #3 và #5 đều `VALID / PASS`).
- **Ca 5 — Thu hồi Professional License:** Thu hồi vĩnh viễn Professional License `SOC Analyst 2` (License ID `#6`), trạng thái lưu trữ chuyển từ `ACTIVE` sang `REVOKED`. Kết quả verify hiển thị `REVOKED / INVALID`.
- **Ca 6 — Chặn thao tác trên License đã REVOKED:** License `#6` đã `REVOKED` (Terminal state) bị vô hiệu hóa form thao tác trên UI; gọi trực tiếp contract qua `suspendLicense(6)` bị REVERT với lỗi `"License not active"`, trạng thái giữ nguyên `REVOKED`.
- **Ca 7 — License hết hạn:** License `#9` (và `#7`, `#8`) có ngày hết hạn (`26/8/2026`) hiển thị nhãn `EXPIRED` trên danh sách dashboard; khi xác minh trả về `EXPIRED / INVALID` kèm thông báo *"License đã hết hạn theo thời gian hiệu lực."*
- **Ca 8 — Metadata bị can thiệp:** License #1 hiển thị `UNTRUSTED / INTEGRITY FAILED`.
- **Ca 9 (Thiếu Metadata):** License #1 hiển thị `UNVERIFIABLE`.
- **Ca 10 (Chia sẻ / QR trên nhiều thiết bị):** Publisher tạo QR/URL Share cho License `#9` (`SOC Analysist 1`). Thiết bị thứ hai (điện thoại di động, chế độ `USER`, không kết nối ví) mở URL Verify và xác minh thành công: kết quả `VALID`, 3 Qualifications (#3, #4, #5) đều `VALID / PASS`.

---

## 2. Kịch bản E2E để người dùng thực hiện trên Sepolia

Dưới đây là các kịch bản chuẩn để người dùng kiểm thử thực tế trên giao diện frontend:

| # | Kịch bản Kiểm thử | Thao tác trên Frontend | Kết quả Mong đợi | Trạng thái Thực hiện |
|---|---|---|---|---|
| 0 | **Quản trị Admin & Kết nối ví Publisher** | Admin đăng ký Publisher qua `registerPublisher`; Publisher kết nối ví trên Sepolia | Admin cấp quyền thành công; Publisher hiển thị trạng thái kết nối, Role `PUBLISHER`, địa chỉ contract `0xddcd...1f37` | `ĐÃ XÁC MINH - 2026-08-26` |
| 1 | **Cấp Qualification** | Publisher cấp credential với danh sách Qualification rỗng | Giao dịch thành công, hiển thị trong nhóm `QUALIFICATIONS` với trạng thái `ACTIVE` (License `#5`) | `ĐÃ XÁC MINH - 2026-08-26` |
| 2 | **Cấp Professional License** | Publisher cấp license kèm ID của Qualification ở bước 1 | Giao dịch thành công, hiển thị trong `PROFESSIONAL LICENSES`, xác minh trả về `VALID` (License `#6`) | `ĐÃ XÁC MINH - 2026-08-26` |
| 3 | **Tạm đình chỉ Qualification** | Publisher nhập ID Qualification vào biểu mẫu vòng đời, bấm **Suspend** | Trạng thái đổi sang `SUSPENDED`; xác minh Qualification trả về `SUSPENDED / INVALID`; Professional License phụ thuộc trả về `INVALID` (Qualification `#3` ➔ License `#6` `INVALID`) | `ĐÃ XÁC MINH - 2026-08-26` |
| 4 | **Khôi phục Qualification** | Publisher nhập ID Qualification, bấm **Restore** | Trạng thái đổi lại `ACTIVE`; Qualification và Professional License đều trả về `VALID` (Qualification `#3` ➔ License `#6` `VALID`) | `ĐÃ XÁC MINH - 2026-08-26` |
| 5 | **Thu hồi Professional License** | Publisher nhập ID Professional License, bấm **Revoke** | Trạng thái đổi sang `REVOKED`; xác minh trả về `REVOKED / INVALID` (License `#6`) | `ĐÃ XÁC MINH - 2026-08-26` |
| 6 | **Bảo vệ license đã REVOKED** | Nhập ID License đã `REVOKED` vào biểu mẫu vòng đời | Giao diện tự ẩn/vô hiệu hóa nút Restore và Suspend; gọi trực tiếp hợp đồng sẽ `REVERT` (Lỗi `"License not active"`) | `ĐÃ XÁC MINH - 2026-08-26` |
| 7 | **License hết hạn** | Cấp License có ngày hết hạn hoặc kiểm tra License đã qua thời điểm `expiry` | Frontend hiển thị nhãn `EXPIRED`, xác minh trả về `EXPIRED / INVALID` | `ĐÃ XÁC MINH - 2026-08-27` |
| 8 | **Metadata bị can thiệp** | Sửa giá trị trong tham số `m` trên URL | Xác minh hiển thị `UNTRUSTED / INTEGRITY FAILED` (hash không khớp trên blockchain) | `ĐÃ XÁC MINH - 2026-08-26` |
| 9 | **Thiếu Metadata** | Mở URL xác minh không có tham số `m` trên trình duyệt mới (không có metadata trong localStorage) | Xác minh hiển thị `UNVERIFIABLE` | `ĐÃ XÁC MINH - 2026-08-26` |
| 10 | **Chia sẻ / QR trên nhiều thiết bị** | Bấm **Chia sẻ / QR**, quét bằng điện thoại hoặc mở URL trên trình duyệt khác | Trang xác minh mở đúng License ID, tự giải mã metadata và xác thực `VALID` | `ĐÃ XÁC MINH - 2026-08-26` |

---

## 3. Chi tiết bằng chứng và dữ liệu On-chain đã xác minh

### Ca 0: Quản trị Admin & Kết nối ví Publisher trên Sepolia
- **Ảnh bằng chứng:**
  - Admin đăng ký/cấp quyền Publisher thành công: [`evidence/e2e-00-admin-register-publisher-success.png`](./e2e-00-admin-register-publisher-success.png)
  - Giao diện Publisher kết nối Sepolia thành công: [`evidence/e2e-00-publisher-sepolia-connected.png`](./e2e-00-publisher-sepolia-connected.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Địa chỉ ví Admin:** `0xd01A6AD60aD342C9fBbbb4c342bB2884c2cE4432`
  - **Địa chỉ ví Publisher:** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82`
  - **Mạng:** Ethereum Sepolia Testnet
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **Giao dịch cấp quyền Admin:** `0x2b0b6ee8d327d5ffd21c0e593d44a36344a581e3dfe08ca409c702bd02ecca9e` (Block: `11557152`, Status: `SUCCESS`)
  - **Hàm thực thi:** `registerPublisher(address publisher)` với `publisher = 0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82`
  - **Vai trò xác nhận từ Smart Contract:** `PUBLISHER` (đã được Admin cấp quyền và contract kích hoạt)

### Ca 1: Cấp Qualification thành công (`CompTIA Security+`)
- **Ảnh bằng chứng:**
  - Giao diện phát hành thành công: [`evidence/e2e-01-issue-qualification-success.png`](./e2e-01-issue-qualification-success.png)
  - Danh sách hiển thị License #5 `ACTIVE`: [`evidence/e2e-01-qualification-active.png`](./e2e-01-qualification-active.png)
  - Xác nhận giao dịch trên Sepolia Etherscan: [`evidence/e2e-01-transaction-etherscan.png`](./e2e-01-transaction-etherscan.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Transaction Hash:** `0xf47f03886285384250fd6dfdff29ab0f696a053623978625fe72b1b8ece76d10`
  - **Trạng thái giao dịch:** `Success` (Status 1)
  - **Block:** `11570139`
  - **Hàm thực thi:** `issueLicense(address owner, string credentialName, uint256 expiry, uint256[] requiredQualificationIds, bytes32 metadataHash)`
  - **Caller (Issuer):** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82`
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **License ID tạo thành:** `#5`
  - **Tên Credential:** `CompTIA Security+`
  - **Chủ sở hữu (Owner):** `0x4136aAbce08001be241ddBC275404096E92a9923`
  - **Ngày hết hạn (Expiry):** `29/12/2029` (`1893257999`)
  - **Required Qualifications:** Rỗng `[]` (Xác nhận phân loại là Qualification)
  - **Trạng thái trên chuỗi:** `ACTIVE` (Enum 0)
  - **Gas used:** `171,353` (Gas limit: `173,880`)
  - **Phí giao dịch:** `0.000427209318662672 ETH` (Gas price: `2.493153424 Gwei`)
  - **Metadata Hash:** `0x9c080bda69ebe5c1a062e0f3b86ddc701f9ea0d6f8a1d87cbc598628e6d39308`

### Ca 2: Cấp Professional License thành công (`SOC Analyst 2`)
- **Ảnh bằng chứng:**
  - Giao diện phát hành thành công: [`evidence/e2e-02-issue-license-success.png`](./e2e-02-issue-license-success.png)
  - Danh sách hiển thị License #6 `ACTIVE`: [`evidence/e2e-02-license-active.png`](./e2e-02-license-active.png)
  - Xác nhận giao dịch trên Sepolia Etherscan: [`evidence/e2e-02-transaction-etherscan.png`](./e2e-02-transaction-etherscan.png)
  - Kết quả Verify License #6 `VALID` và 2 Qualifications đều `PASS`: [`evidence/e2e-02-license-valid-requirements-pass.png`](./e2e-02-license-valid-requirements-pass.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Transaction Hash:** `0xe419af18723c0a232da967f63fa330da17b0a748f89b0b850e7fb8f330fa138a`
  - **Trạng thái giao dịch:** `Success` (Status 1)
  - **Block:** `11570210`
  - **Hàm thực thi:** `issueLicense(address owner, string credentialName, uint256 expiry, uint256[] requiredQualificationIds, bytes32 metadataHash)`
  - **Caller (Issuer):** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82`
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **License ID tạo thành:** `#6`
  - **Tên Credential:** `SOC Analyst 2`
  - **Chủ sở hữu (Owner):** `0x4136aAbce08001be241ddBC275404096E92a9923`
  - **Ngày hết hạn (Expiry):** `0` (Không có thời hạn)
  - **Required Qualifications on-chain:** `[3, 5]` (Độ dài mảng = 2)
  - **Trạng thái trên chuỗi:** `ACTIVE` (Enum 0)
  - **Kết quả Verify tại thời điểm phát hành:** `VALID` (Qualification #3: `VALID / PASS`, Qualification #5: `VALID / PASS`)
  - **Gas used:** `237,412` (Gas limit: `240,463`)
  - **Phí giao dịch:** `0.00060562140740472 ETH` (Gas price: `2.55093006 Gwei`)
  - **Metadata Hash:** `0x0344d9aac74e82f4fa79641fd5593b9e94a45b7a1c975818b71f0919a917e8c9`

### Ca 3: Tạm đình chỉ Qualification #3 (Suspend) và Tác động đến Professional License #6
- **Ảnh bằng chứng:**
  - Form thực hiện và thông báo thành công: [`evidence/e2e-03-suspend-qualification-success.png`](./e2e-03-suspend-qualification-success.png)
  - Danh sách hiển thị Qualification #3 chuyển trạng thái `SUSPENDED`: [`evidence/e2e-03-qualification-suspended.png`](./e2e-03-qualification-suspended.png)
  - Màn hình Verify trực tiếp Qualification #3 trả về `SUSPENDED / INVALID`: [`evidence/e2e-03-qualification-verify-invalid.png`](./e2e-03-qualification-verify-invalid.png)
  - Chi tiết giao dịch Suspend trên Sepolia Etherscan: [`evidence/e2e-03-transaction-etherscan.png`](./e2e-03-transaction-etherscan.png)
  - Danh sách License #6 vẫn hiển thị trạng thái lưu trữ `ACTIVE`: [`evidence/e2e-03-dependent-license-list-active.png`](./e2e-03-dependent-license-list-active.png)
  - Màn hình Verify License #6 bị `INVALID` do Qualification #3 `FAIL`: [`evidence/e2e-03-dependent-license-invalid.png`](./e2e-03-dependent-license-invalid.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Transaction Hash:** `0x2e18e0a3f3692c26783ab56460561dcb3c625f1922bb15951b0b834a0c242e1c`
  - **Trạng thái giao dịch:** `Success` (Status 1)
  - **Block:** `11570292`
  - **Hàm thực thi:** `suspendLicense(uint256 licenseId)` với `licenseId = 3`
  - **Caller (Actor):** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82` (Issuer của Qualification #3)
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **Event phát ra:** `LicenseStatusChanged(licenseId: 3, oldStatus: 0 (ACTIVE), newStatus: 1 (SUSPENDED), actor: 0xd1F7..., timestamp: 1787739900)`
  - **Phân loại Qualification #3:** Rỗng `[]` (Xác nhận là Qualification)
  - **Trạng thái Qualification #3 sau Tx:** `SUSPENDED` (Enum 1)
  - **Kết quả Verify Qualification #3:** `SUSPENDED / INVALID`
  - **Trạng thái lưu trữ của Professional License #6:** Vẫn giữ nguyên trên chuỗi là `ACTIVE` (Enum 0)
  - **Kết quả Verify thực tế của Professional License #6:** `INVALID` do kiểm tra cascade qualification dependencies phát hiện Qualification #3 là `SUSPENDED / FAIL` (trong khi Qualification #5 vẫn là `VALID / PASS`)
  - **Gas used:** `53,562` (Gas limit: `54,357`)
  - **Phí giao dịch:** `0.000133565890729452 ETH` (Gas price: `2.493668846 Gwei`)

### Ca 4: Khôi phục Qualification #3 (Restore) và Tái hợp lệ hóa Professional License #6
- **Ảnh bằng chứng:**
  - Danh sách hiển thị Qualification #3 trở lại `ACTIVE`: [`evidence/e2e-04-qualification-active-list.png`](./e2e-04-qualification-active-list.png)
  - Thẻ Qualification #3 chi tiết `ACTIVE`: [`evidence/e2e-04-qualification-active.png`](./e2e-04-qualification-active.png)
  - Màn hình Verify Qualification #3 trở lại `VALID`: [`evidence/e2e-04-qualification-valid.png`](./e2e-04-qualification-valid.png)
  - Màn hình Verify License #6 tự động trở lại `VALID` (Requirements đều `PASS`): [`evidence/e2e-04-dependent-license-valid.png`](./e2e-04-dependent-license-valid.png)
  - Chi tiết giao dịch Restore trên Sepolia Etherscan: [`evidence/e2e-04-transaction-etherscan.png`](./e2e-04-transaction-etherscan.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Transaction Hash:** `0x4e706d19b7f11f7e51d89439eaa594667a75675fcaff264ced1e2b056fa9aa2f`
  - **Trạng thái giao dịch:** `Success` (Status 1)
  - **Block:** `11570347`
  - **Hàm thực thi:** `restoreLicense(uint256 licenseId)` với `licenseId = 3`
  - **Caller (Actor):** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82` (Issuer của Qualification #3)
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **Event phát ra:** `LicenseStatusChanged(licenseId: 3, oldStatus: 1 (SUSPENDED), newStatus: 0 (ACTIVE), actor: 0xd1F7..., timestamp: 1787740620)`
  - **Trạng thái Qualification #3 sau Restore:** `ACTIVE` (Enum 0)
  - **Kết quả Verify trực tiếp Qualification #3:** `VALID`
  - **Kết quả Verify Professional License #6:** Chuyển từ `INVALID` trở lại `VALID` do dependency Qualification #3 đã `ACTIVE` (Qualification #3: `VALID / PASS`, Qualification #5: `VALID / PASS`)
  - **Gas used:** `31,661` (Gas limit: `36,482`)
  - **Phí giao dịch:** `0.000081656445866947 ETH` (Gas price: `2.579086127 Gwei`)

### Ca 5: Thu hồi Professional License #6 thành công (Revoke)
- **Ảnh bằng chứng:**
  - Form thực hiện và thông báo thành công: [`evidence/e2e-05-revoke-license-success.png`](./e2e-05-revoke-license-success.png)
  - Chi tiết giao dịch Revoke trên Sepolia Etherscan: [`evidence/e2e-05-transaction-etherscan.png`](./e2e-05-transaction-etherscan.png)
  - Danh sách hiển thị License #6 chuyển sang trạng thái `REVOKED`: [`evidence/e2e-05-license-revoked-list.png`](./e2e-05-license-revoked-list.png)
  - Màn hình Verify trực tiếp License #6 trả về `REVOKED / INVALID`: [`evidence/e2e-05-license-revoked-invalid.png`](./e2e-05-license-revoked-invalid.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Transaction Hash:** `0xb1dac95aebf5a36c6c780583f7ed690a1e1e3c05cce4172716a8cf837bd1c736`
  - **Trạng thái giao dịch:** `Success` (Status 1)
  - **Block:** `11570408`
  - **Timestamp:** `26/08/2026 10:49:12 UTC` (`1787741352`)
  - **Hàm thực thi:** `revokeLicense(uint256 licenseId)` với `licenseId = 6`
  - **Caller (Actor):** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82` (Issuer của License #6)
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **Event phát ra:** `LicenseStatusChanged(licenseId: 6, oldStatus: 0 (ACTIVE), newStatus: 2 (REVOKED), actor: 0xd1F7..., timestamp: 1787741352)`
  - **Tên Credential:** `SOC Analyst 2`
  - **Chủ sở hữu (Owner):** `0x4136aAbce08001be241ddBC275404096E92a9923`
  - **Trạng thái on-chain sau Tx:** `REVOKED` (Enum 2)
  - **Kết quả Verify sau Revoke:** `REVOKED / INVALID` (Thông báo: *"License đã bị thu hồi vĩnh viễn (REVOKED) và không thể khôi phục."*)
  - **Gas used:** `53,710` (Gas limit: `54,506`)
  - **Phí giao dịch:** `0.00014026979750038 ETH` (Gas price: `2.611614178 Gwei`)

### Ca 6: Chặn thao tác trên License đã REVOKED (Terminal State Protection)
- **Ảnh bằng chứng:**
  - Giao diện Frontend khóa/vô hiệu hóa form thao tác trên License #6: [`evidence/e2e-06-revoked-lifecycle-buttons-blocked.png`](./e2e-06-revoked-lifecycle-buttons-blocked.png)
  - Giao dịch gọi trực tiếp hợp đồng trên Remix IDE bị Revert: [`evidence/e2e-06-revoked-direct-call-terminal-reverted.png`](./e2e-06-revoked-direct-call-terminal-reverted.png)
  - Chi tiết giao dịch Revert trên Sepolia Etherscan: [`evidence/e2e-06-revoked-direct-call-etherscan.png`](./e2e-06-revoked-direct-call-etherscan.png)
- **Dữ liệu On-chain đối chiếu:**
  - **Transaction Hash:** `0xe887937d1e49f981395ff84dbf7149979340a4572052af1ff3fa2d9a92e66520`
  - **Trạng thái giao dịch:** `Failed — License not active` (Status 0 / REVERT)
  - **Block:** `11570437`
  - **Timestamp:** `26/08/2026 10:56:00 UTC`
  - **Hàm gọi:** `suspendLicense(uint256 licenseId)` với `licenseId = 6`
  - **Caller (Actor):** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82` (Publisher hợp lệ)
  - **Hợp đồng đích:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
  - **Lý do từ chối (Revert Reason):** `require(license.status == Status.ACTIVE, "License not active")` — do License #6 đang ở trạng thái terminal `REVOKED` (Enum 2), không phải `ACTIVE`.
  - **Hành vi trên giao diện UI:** Giao diện nhận diện `License #6 đã bị REVOKED vĩnh viễn (Terminal state — không thể thao tác)` và tự động ẩn/vô hiệu hóa các nút Suspend và Revoke.
  - **Trạng thái License #6 sau thao tác:** Vẫn giữ nguyên `REVOKED` (Enum 2).
  - **Gas used:** `30,799` (Gas limit: `3,000,000`)
  - **Phí giao dịch:** `0.00007820829615916 ETH` (Gas price: `2.53931284 Gwei`)

### Ca 7: License hết hạn (Dynamic Expired Status & Verification)
- **Ảnh bằng chứng:**
  - Danh sách License trên Dashboard hiển thị nhãn `EXPIRED`: [`evidence/e2e-07-license-expired-list.png`](./e2e-07-license-expired-list.png)
  - Màn hình Verify License #9 trả về `EXPIRED / INVALID`: [`evidence/e2e-07-license-expired-invalid.png`](./e2e-07-license-expired-invalid.png)
- **Dữ liệu đối chiếu & Cơ chế hoạt động:**
  - **License ID kiểm thử:** `#9` (cùng các License `#7`, `#8` có thời hạn tương tự)
  - **Tên Credential:** `SOC Analysist 1`
  - **Chủ sở hữu (Owner):** `0x4136aAbce08001be241ddBC275404096E92a9923` (`0x4136...9923`)
  - **Issuer:** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82` (`0xd1F7...Dc82`)
  - **Ngày phát hành (Issue Date):** `26/8/2026`
  - **Ngày hết hạn (Expiry):** `26/8/2026`
  - **Block phát hành (LicenseIssued):** `11571252`
  - **Metadata Hash:** `0x25c49494dd21c770c4a538cde137ac864f9fd1527bf829ecfa5f0c6b57cd3836`
  - **Trạng thái lưu trữ On-chain:** `ACTIVE` (Enum 0) — Smart contract không lưu trạng thái `EXPIRED` cố định trong enum nhằm tối ưu gas, tránh giao dịch cập nhật trạng thái định kỳ.
  - **Logic xác minh On-chain (`verifyLicense`):** Smart contract kiểm tra điều kiện `if (license.expiry != 0 && block.timestamp >= license.expiry) return false;`. Do `block.timestamp >= license.expiry`, kết quả xác minh từ hợp đồng trả về `false` (không hợp lệ).
  - **Hành vi trên Frontend Client:**
    - Hàm `deriveStatus(statusEnum, expiry)` tự động đối chiếu `Math.floor(Date.now() / 1000) >= expiry` và gán trạng thái động `EXPIRED`.
    - Danh sách License hiển thị badge `EXPIRED` màu cam/vàng.
    - Màn hình xác minh (`/verify`) hiển thị kết quả `EXPIRED / INVALID` với thông báo: *"License đã hết hạn theo thời gian hiệu lực."*

### Ca 8 & Ca 9: Kiểm thử tính toàn vẹn Metadata
- **Ca 8 (Metadata bị can thiệp):** [`evidence/e2e-08-tampered-metadata-untrusted.png`](./e2e-08-tampered-metadata-untrusted.png) — Khi sửa đổi giá trị hash trong tham số `m` trên URL xác minh, hệ thống đối chiếu với hash lưu trên smart contract và phát hiện không trùng khớp, trả về kết quả `UNTRUSTED / INTEGRITY FAILED`.
- **Ca 9 (Thiếu Metadata):** [`evidence/e2e-09-missing-metadata-unverifiable.png`](./e2e-09-missing-metadata-unverifiable.png) — Khi mở URL xác minh không có tham số `m` trên trình duyệt mới (không có dữ liệu trong `localStorage`), hệ thống không thể tải off-chain metadata và trả về kết quả `UNVERIFIABLE`.

### Ca 10: Chia sẻ / QR trên nhiều thiết bị (Cross-Device Share / QR)
- **Ảnh bằng chứng:**
  - QR Code License #9 trên thiết bị chính (giao diện Publisher): [`evidence/e2e-10-share-qr-generated.png`](./e2e-10-share-qr-generated.png)
  - Xác minh License #9 trên thiết bị thứ hai (điện thoại di động, chế độ USER): [`evidence/e2e-10-cross-device-verify-valid.png`](./e2e-10-cross-device-verify-valid.png)
- **Dữ liệu xác minh:**
  - **License ID:** `#9`
  - **Tên Credential:** `SOC Analysist 1`
  - **Chủ sở hữu (Owner):** `0x4136aAbce08001be241ddBC275404096E92a9923`
  - **Issuer:** `0xd1F7a4fB82383CF7Db52f985A327D2C25348Dc82`
  - **Trạng thái on-chain:** `ACTIVE`
  - **Ngày phát hành:** `26/8/2026`
  - **Ngày hết hạn:** `26/8/2026`
  - **Required Qualifications on-chain:** `[3, 4, 5]` (3 Qualifications)
  - **Block phát hành (LicenseIssued):** `11571252`
- **Quy trình kiểm thử Cross-Device:**
  1. **Thiết bị chính (Desktop, Publisher):** Publisher bấm nút **Share / QR** trên License `#9` trong giao diện quản lý. Modal hiển thị mã QR với URL verify đầy đủ bao gồm `id=9`, `owner`, và `m` (encoded metadata).
  2. **URL Share:** `https://professional-license-mvp-uit.netlify.app/#/verify?id=9&owner=0x4136aAbce08001be241ddBC275404096E92a9923&m=...` (metadata được mã hóa base64 trong tham số `m`).
  3. **Thiết bị thứ hai (Điện thoại di động):** Mở URL Verify trên trình duyệt di động. Giao diện tự động hiển thị ở chế độ `USER` (không cần kết nối ví Publisher). Thanh trạng thái mobile hiển thị rõ thiết bị di động (22:12, Bluetooth, WiFi, pin 92%).
  4. **Kết quả Verify trên thiết bị thứ hai:**
     - **Trạng thái tổng:** `VALID` — *"License hợp lệ và đang hoạt động."*
     - **Qualification #3:** `VALID / PASS`
     - **Qualification #4:** `VALID / PASS`
     - **Qualification #5:** `VALID / PASS`
     - **Metadata:** Tải và giải mã thành công từ tham số `m` trên URL.
     - **Audit / Event History:** Hiển thị đúng `LicenseIssued` tại Block `11571252` với Actor `0xd1F7...Dc82`.
  5. **Xác nhận Cross-Device:** Ảnh điện thoại là bằng chứng thiết bị thứ hai, chứng minh rằng URL Share/QR hoạt động đúng trên thiết bị khác với thiết bị tạo QR, không cần kết nối ví, và metadata được truyền tải đầy đủ qua URL.
