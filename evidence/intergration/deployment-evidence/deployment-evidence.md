# Bằng chứng triển khai — ProfessionalLicenseRegistry (Hợp đồng triển khai chính thức)

## 1. Thông tin triển khai chính thức (Hợp đồng ProfessionalLicenseRegistry)

| Thông tin | Giá trị |
|---|---|
| Mạng | Ethereum Sepolia Testnet |
| Chain ID | `11155111` |
| Hợp đồng thông minh | `ProfessionalLicenseRegistry` |
| Mô hình trạng thái | Mô hình trạng thái vòng đời (`ACTIVE`, `SUSPENDED`, `REVOKED`) |
| Địa chỉ hợp đồng | `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37` |
| Giao dịch triển khai | `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a` |
| Block triển khai | `11557021` |
| Trạng thái giao dịch | Thành công (tạo hợp đồng) |
| Trình biên dịch | Solidity 0.8.34 |
| Phiên bản EVM | **Osaka** |
| Tối ưu hóa | **Tắt** |
| Bằng chứng triển khai | ảnh chụp Remix và Sepolia Etherscan do người dùng cung cấp |

---

## 2. Trạng thái xác minh

```text
Triển khai hợp đồng: ĐÃ XÁC MINH
Tích hợp frontend: ĐÃ XÁC MINH (bản build production Vite đạt)
Kiểm thử E2E người dùng: ĐÃ XÁC MINH (toàn bộ ca 0 đến ca 10)
Kiểm thử trên nhiều thiết bị: ĐÃ XÁC MINH (Ca 10 — Cross-Device Share / QR)
```

---

## 3. Bằng chứng trực quan do người dùng cung cấp

- Ảnh chụp màn hình triển khai từ Remix IDE trên Sepolia Testnet: [`hinh-anh-remix-deploy.png`](hinh-anh-remix-deploy.png)
- Ảnh chụp màn hình cấu hình trình biên dịch (Solidity 0.8.34, EVM Osaka, Optimizer Off): [`compiler-setting.png`](compiler-setting.png)
- Ảnh chụp màn hình giao dịch triển khai trên Sepolia Etherscan (`0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a`): [`transaction-evidence.png`](transaction-evidence.png)
- Các bằng chứng trực quan này được lưu giữ và tham chiếu nguyên bản, không sửa đổi hay ghi đè.

---

## 4. Cấu hình tích hợp frontend

Frontend đã được trỏ trực tiếp và đồng bộ với contract chính thức:

```text
Mạng: Ethereum Sepolia Testnet
Chain ID: 11155111
Địa chỉ hợp đồng: 0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37
Block triển khai: 11557021
File ABI: frontend/src/abi.json
```
