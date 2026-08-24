# Professional License Integration Client

Frontend integration client for `ProfessionalLicenseRegistry` on Ethereum Sepolia Testnet.

## Mô hình Vai trò (Role Model)

- **ADMIN**: quản lý quyền Publisher (`registerPublisher`, `removePublisher`); không có quyền phát hành License.
- **PUBLISHER**: Issue License và quản lý vòng đời (`suspendLicense`, `restoreLicense`, `revokeLicense`) cho license do chính Publisher phát hành.
- **USER**: không có quyền quản trị/phát hành; trang chủ hiển thị **My Licenses**, lọc theo `license.owner == connected account`, kèm QR và Verify.
- **OWNER**: Địa chỉ nhận chứng chỉ, được lưu trong trường `owner` của từng License.
- **VERIFIER**: Bất kỳ người dùng nào cũng có thể kiểm tra tính hợp lệ của chứng chỉ.

## Vòng đời Chứng chỉ (State Machine v2.0)

- `ACTIVE`: Chứng chỉ hợp lệ nếu chưa hết hạn.
- `SUSPENDED`: Tạm đình chỉ hiệu lực, có thể khôi phục bởi Issuer.
- `REVOKED`: Thu hồi vĩnh viễn (Terminal State, không thể khôi phục).
- `EXPIRED`: Suy diễn động từ timestamp `expiry`.

## Chức năng Verify

Thứ tự kiểm tra:
1. Thiếu metadata -> `UNVERIFIABLE`.
2. Hash không khớp -> `UNTRUSTED / INTEGRITY FAILED`.
3. Trạng thái `REVOKED` -> `REVOKED / INVALID`.
4. Trạng thái `SUSPENDED` -> `SUSPENDED / INVALID`.
5. `ACTIVE` nhưng hết hạn -> `EXPIRED / INVALID`.
6. `ACTIVE` và còn hạn -> `VALID` (kèm kiểm tra các chứng chỉ tiên quyết).

## Run & Build

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```
