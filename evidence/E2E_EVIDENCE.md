# Hướng dẫn & Biểu mẫu Bằng chứng E2E Testing (User Verification Template)

## 1. Thông tin Môi trường Kiểm thử

- **Network:** Ethereum Sepolia Testnet (`Chain ID: 11155111`)
- **Official Contract:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
- **Deployment Tx:** `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a`
- **Deployment Block:** `11557021`

### Trạng thái Kiểm chứng Dự án

```text
Contract deployment: VERIFIED
Frontend integration: VERIFIED (Vite production build passed)
E2E user testing: NOT VERIFIED - RESERVED FOR USER
Cross-device testing: NOT VERIFIED - RESERVED FOR USER
```

---

## 2. Kịch bản E2E Dành cho Người dùng thực hiện trên Sepolia

Dưới đây là 10 kịch bản chuẩn để người dùng thực hiện kiểm thử thực tế trên giao diện Frontend:

| # | Kịch bản Kiểm thử | Thao tác trên Frontend | Kết quả Mong đợi | Trạng thái Thực hiện |
|---|---|---|---|---|
| 1 | **Issue Qualification** | Publisher issue credential với Qualifications rỗng | Transaction thành công, hiển thị trong nhóm QUALIFICATIONS với status `ACTIVE` | `RESERVED FOR USER` |
| 2 | **Issue Professional License** | Publisher issue license kèm ID của Qualification ở bước 1 | Transaction thành công, hiển thị trong PROFESSIONAL LICENSES, verify trả về `VALID` | `RESERVED FOR USER` |
| 3 | **Suspend Qualification** | Publisher nhập ID Qualification vào Lifecycle form, bấm **Suspend** | Status đổi sang `SUSPENDED`. Verify Qualification trả về `SUSPENDED / INVALID`. Verify Professional License phụ thuộc trả về `INVALID` | `RESERVED FOR USER` |
| 4 | **Restore Qualification** | Publisher nhập ID Qualification, bấm **Restore** | Status đổi lại `ACTIVE`. Verify Qualification và Professional License đều trả về `VALID` | `RESERVED FOR USER` |
| 5 | **Revoke Professional License** | Publisher nhập ID Professional License, bấm **Revoke** | Status đổi sang `REVOKED`. Verify trả về `REVOKED / INVALID` | `RESERVED FOR USER` |
| 6 | **Guard: Chặn Restore/Suspend License đã REVOKED** | Nhập ID License đã REVOKED vào Lifecycle form | UI tự động ẩn/disable nút Restore và Suspend; nếu gọi trực tiếp contract sẽ REVERT | `RESERVED FOR USER` |
| 7 | **License hết hạn (Expired)** | Issue License với ngày hết hạn hoặc kiểm tra License đã qua thời gian `expiry` | Frontend hiển thị badge `EXPIRED`, Verify trả về `EXPIRED / INVALID` | `RESERVED FOR USER` |
| 8 | **Tampered Metadata** | Sửa giá trị trong tham số `m` trên URL | Verify hiển thị `UNTRUSTED / INTEGRITY FAILED` (hash không khớp on-chain) | `RESERVED FOR USER` |
| 9 | **Missing Metadata** | Mở URL verify không có tham số `m` trên trình duyệt mới (không có sessionStorage) | Verify hiển thị `UNVERIFIABLE` | `RESERVED FOR USER` |
| 10 | **Cross-Device Share / QR** | Bấm **Share / QR**, quét QR bằng điện thoại hoặc mở URL trên trình duyệt khác | Trang Verify mở đúng License ID, tự động giải mã metadata và xác thực `VALID` | `RESERVED FOR USER` |

---

## 3. Ghi chú Thu thập Bằng chứng (Screenshots)

Sau khi thực hiện từng bước trên Sepolia, người dùng lưu ảnh chụp màn hình tương ứng vào thư mục `evidence/` để hoàn thiện hồ sơ nghiệm thu:
1. `issue-qualification.png`
2. `issue-license-with-req.png`
3. `suspend-qualification.png`
4. `restore-qualification.png`
5. `revoke-license.png`
6. `restore-revoked-blocked.png`
7. `verify-expired.png`
8. `tampered-metadata-untrusted.png`
9. `missing-metadata-unverifiable.png`
10. `qr-cross-device-scan.png`
