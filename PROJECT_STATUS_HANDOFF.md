# Project Status Handoff — Professional License Lifecycle Update

## A. Project Overview

- **Project:** Professional License Registry MVP.
- **Goal:** Issue, store, manage, verify, and share professional credentials on Ethereum with a robust 4-state lifecycle model without storing raw PDF files on-chain.
- **Roles:**
  - **Admin:** Registers and removes Publishers. Contract deployer is the initial Admin.
  - **Publisher:** Issues credentials, can suspend, restore, or revoke credentials issued by that Publisher (provided they remain an authorized Publisher).
  - **Owner:** Address stored in each credential; represents credential subject.
  - **Verifier:** Any public user reading and verifying credentials on blockchain.
- **Network:** Ethereum Sepolia Testnet, chain ID `11155111`.

---

## B. Official Deployed Contract (Sepolia)

- **Network:** Ethereum Sepolia Testnet
- **Chain ID:** `11155111`
- **Contract Address:** `0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37`
- **Deployment Transaction:** `0x795e492c90802447bd64ce0fc6d2003a0f115b90146fe632df9e74604341c58a`
- **Deployment Block:** `11557021`
- **Compiler:** Solidity 0.8.34
- **EVM Version:** Osaka
- **Optimizer:** Disabled
- **Deployment Evidence:** Remix + Sepolia Etherscan screenshots do người dùng cung cấp

### Verification Statuses

```text
Contract deployment: VERIFIED
Frontend integration: VERIFIED (Vite production build cleanly passed)
E2E user testing: NOT YET VERIFIED (Dành riêng cho người dùng tự kiểm tra và ghi lại evidence)
Cross-device testing: NOT YET VERIFIED (Dành riêng cho người dùng tự kiểm tra và ghi lại evidence)
```

---

## C. State Machine & Lifecycle Model

```
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

### State Semantics
1. **`ACTIVE` (Enum: 0):** Credential is valid provided it is not expired and its dependencies (if any) are valid.
2. **`SUSPENDED` (Enum: 1):** Credential is temporarily suspended by the issuing Publisher. Can be restored back to `ACTIVE`.
3. **`REVOKED` (Enum: 2):** Credential is permanently revoked. **`REVOKED` is terminal.** No function can restore or suspend a revoked credential.
4. **`EXPIRED` (Dynamic):** Evaluated at runtime when `expiry != 0 && block.timestamp >= expiry`. Not stored in enum.

### Re-issuance Policy
- If a professional requires a new credential after revocation, a new `LicenseID` must be issued via `issueLicense()`.
- Old revoked licenses cannot be resurrected.

---

## D. Smart Contract Specification

- **Source:** [ProfessionalLicenseRegistry.sol](ProfessionalLicenseRegistry.sol)
- **Enum:**
  ```solidity
  enum Status {
      ACTIVE,
      SUSPENDED,
      REVOKED
  }
  ```

### Functions
- `registerPublisher(address publisher)`: Admin only.
- `removePublisher(address publisher)`: Admin only.
- `issueLicense(address owner, string credentialName, uint256 expiry, uint256[] requiredQualificationIds, bytes32 metadataHash)`: Only authorized Publisher.
- `checkLicenseRequirements(address owner, uint256[] qualificationIds)`: Public view pre-check.
- `suspendLicense(uint256 licenseId)`:
  - Access Control: Requires caller to be an active authorized publisher AND original issuer (`msg.sender == license.issuer && publishers[msg.sender]`).
  - Guard: Requires `license.status == Status.ACTIVE`.
  - State Transition: `ACTIVE -> SUSPENDED`.
- `restoreLicense(uint256 licenseId)`:
  - Access Control: Requires caller to be an active authorized publisher AND original issuer (`msg.sender == license.issuer && publishers[msg.sender]`).
  - Guard: Requires `license.status == Status.SUSPENDED`.
  - State Transition: `SUSPENDED -> ACTIVE`.
- `revokeLicense(uint256 licenseId)`:
  - Access Control: Requires caller to be an active authorized publisher AND original issuer (`msg.sender == license.issuer && publishers[msg.sender]`).
  - Guard: Requires `license.status == Status.ACTIVE || license.status == Status.SUSPENDED`.
  - State Transition: `ACTIVE/SUSPENDED -> REVOKED`.
- `verifyLicense(uint256 licenseId, address owner)`: Public view function. Checks owner, `status == Status.ACTIVE`, expiry, and recursive qualification dependencies.

### Events
- `LicenseIssued(uint256 indexed licenseId, address indexed owner, address indexed issuer, string credentialName, bytes32 metadataHash)`
- `LicenseStatusChanged(uint256 indexed licenseId, Status oldStatus, Status newStatus, address indexed actor, uint256 timestamp)`
- `PublisherRegistered(address indexed publisher, address indexed actor)`
- `PublisherRemoved(address indexed publisher, address indexed actor)`

---

## E. Verification Logic

Frontend verification executes in strict order to avoid masking error causes:

1. **Existence Check:** `storedOwner != address(0)`. If zero, returns `KHÔNG TỒN TẠI`.
2. **Missing Metadata:** If metadata payload is absent from URL and session storage, returns `UNVERIFIABLE`.
3. **Hash Mismatch:** If `keccak256(metadata) != onChainMetadataHash`, returns `UNTRUSTED / INTEGRITY FAILED`.
4. **Owner Mismatch:** If `storedOwner != inputOwner`, returns `WRONG OWNER`.
5. **Revoked Status:** If `status == STATUS.REVOKED`, returns `REVOKED / INVALID`.
6. **Suspended Status:** If `status == STATUS.SUSPENDED`, returns `SUSPENDED / INVALID`.
7. **Expired Status:** If `status == STATUS.ACTIVE && expiry != 0 && now >= expiry`, returns `EXPIRED / INVALID`.
8. **Active Status & Qualification Dependencies:**
   - Evaluates each qualification in `requiredQualificationIds`:
     - Missing / wrong owner -> `MISSING`
     - Revoked -> `REVOKED`
     - Suspended -> `SUSPENDED`
     - Expired -> `EXPIRED`
     - Active -> `VALID`
   - Calls `verifyLicense(id, owner)` on-chain.
   - If passes: returns `VALID`.

---

## F. Frontend Client

- Source: [main.js](frontend/src/main.js), [abi.json](frontend/src/abi.json), [style.css](frontend/src/style.css).
- Status Pills: `ACTIVE` (green), `SUSPENDED` (orange), `REVOKED` (red), `EXPIRED` (amber).
- Actions: `Suspend` (orange), `Restore` (blue/primary), `Revoke` (red/danger).
- UI Guards:
  - `Restore` is hidden/disabled for `REVOKED` and `ACTIVE`.
  - `Suspend` is hidden/disabled for `SUSPENDED` and `REVOKED`.
  - Lifecycle actions are completely inaccessible to users without Publisher role on that license.
- Metadata Persistence: Stored in `localStorage` with automatic fallback migration from legacy `sessionStorage`.
- Cross-Device Share/QR: Encodes canonical metadata as base64 in `m` URL parameter. Verification is independent of local `localStorage`.
- Audit History: Decodes `LicenseIssued` and `LicenseStatusChanged` with timestamp and state transitions, with Sepolia RPC retry & fallback against transient errors.

---

## G. Test Suite & Verification Results

### Unit Test Results
- Test Runner: [test_runner.mjs](file:///c:/Users/nhatn/Downloads/MVP/scratch/test_runner.mjs) & [ProfessionalLicenseRegistry_test.sol](evidence/unit-test/ProfessionalLicenseRegistry_test.sol)
- Result: **58/58 PASSED, 0 FAILED**

### Frontend Build
- Build command: `cd frontend && npm run build`
- Output: `frontend/dist/`
- Result: **PASS** (202 modules transformed, 0 errors).

---

## H. Requirements Coverage Matrix

| Yêu cầu | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|
| Enum `ACTIVE, SUSPENDED, REVOKED` | DONE | Contract, ABI, Frontend | `INACTIVE` bị loại bỏ hoàn toàn |
| State transitions hợp lệ | DONE | Unit test 20, 29, 32, 36 | 100% test pass |
| State transitions bị cấm bị revert | DONE | Unit test 50-57 | Revert có thông báo cụ thể |
| Revoke là terminal | DONE | Unit test 39, 52-54 | Không thể restore sau khi revoke |
| Cấp lại tạo License ID mới | DONE | Unit test 37-40 | ID tăng tuần tự, license cũ giữ REVOKED |
| Access control kép (issuer + publisher) | DONE | Contract, Unit test 43-49 | Caller phải là issuer và publisher hợp lệ |
| Event `LicenseStatusChanged` có timestamp | DONE | Contract, ABI, Unit test 23-28 | Ghi lại timestamp và actor |
| Thứ tự kiểm tra Verify | DONE | `main.js`, E2E test | Không che lấp nguyên nhân |
| Frontend lifecycle actions (Suspend, Restore, Revoke) | DONE | `main.js`, UI build | Giao diện phân tách nút rõ ràng |
| UI Guard ngăn thao tác sai trạng thái/quyền | DONE | `main.js` | Ẩn/disable nút theo trạng thái thực tế |
| QR/Share cross-device độc lập sessionStorage | DONE | `main.js` | URL payload mang đầy đủ metadata |
| Static analysis trên source mới | DONE | `static-analysis-report.md` | Đã rà soát trên contract mới |
| Unit test toàn diện | DONE | `test_runner.mjs` (58 pass) | Không skip/làm yếu assertion |

---

## I. Limitations & Security Boundary

1. **Off-chain PDF Storage:** No database or IPFS service is integrated; metadata is anchored via Keccak256 hash in URL/QR payload.
2. **Blockchain Boundary:** Blockchain guarantees cryptographic integrity, non-repudiation, and immutability of status history recorded on-chain. It does not authenticate real-world professional identity beyond the publisher's authorized signature.
3. **E2E Testing:** E2E user testing and cross-device testing on the official Sepolia contract are reserved for user execution.
