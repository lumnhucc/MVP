import { ethers } from "ethers";
import QRCode from "qrcode";
import abi from "./abi.json";
import "./style.css";

const ADDRESS = "0xddcd1fb5b165b5a73a970a2adbe4354d638e1f37";
const SEPOLIA = 11155111n;
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
  "https://rpc2.sepolia.org"
];
const DEPLOYMENT_BLOCK = 11557021;
const rpcProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
const STATUS = { ACTIVE: 0, SUSPENDED: 1, REVOKED: 2 };
const LICENSES_MAPPING_SLOT = 0n;
const LICENSE_QUALIFICATIONS_OFFSET = 7n;

let provider = null;
let signer = null;
let readContract = new ethers.Contract(ADDRESS, abi, rpcProvider);
let contract = null;
let account = null;
let role = "user";
let roleLoading = false;
let licenseCache = null;
let professionalLicensesExpanded = true;
let qualificationsExpanded = true;

const pages = {
  home: { label: "Trang chủ", icon: "⌂", title: "Trang chủ", subtitle: "Tự động hiển thị theo quyền của ví đang kết nối" },
  verify: { label: "Verify License", icon: "◇", title: "Verify License", subtitle: "Kiểm tra tính hợp lệ của license" },
  license: { label: "License Management", icon: "▧", title: "License Management", subtitle: "Phát hành và quản lý trạng thái license" },
  publishers: { label: "Publishers", icon: "♙", title: "Publishers", subtitle: "Quản lý publisher được ủy quyền" },
  guide: { label: "Hướng dẫn", icon: "?", title: "Hướng dẫn sử dụng", subtitle: "Quy trình sử dụng integration client" },
};


function getExpirySeconds() {
  const checkbox = document.querySelector('#expiryNoLimit, [name="expiryNoLimit"]');
  const input = document.querySelector('#expiry, [name="expiry"]');
  if (checkbox?.checked) return 0;
  const value = input?.value?.trim();
  if (!value) throw new Error('Ngày hết hạn là bắt buộc, hoặc chọn "Không có thời hạn".');
  const selected = new Date(`${value}T23:59:59`);
  if (Number.isNaN(selected.getTime())) throw new Error('Ngày hết hạn không hợp lệ.');
  const today = new Date();
  today.setHours(0,0,0,0);
  if (selected < today) throw new Error('Ngày hết hạn không được ở trong quá khứ.');
  return Math.floor(selected.getTime() / 1000);
}

function $(id) { return document.getElementById(id); }
function setText(id, text) { const el = $(id); if (el) el.textContent = text; }
function shortAddress(value) { return value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "—"; }
function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
function roleLabel(value) { return ({ admin: "ADMIN", publisher: "PUBLISHER", user: "USER" })[value] || "USER"; }
function toast(msg) { const old = document.querySelector(".toast"); if (old) old.remove(); const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 4500); }
function requireContract() { if (!contract) throw new Error("Hãy kết nối MetaMask trước."); }
function requireRole(allowed) { if (!allowed.includes(role)) throw new Error("Ví hiện tại không có quyền thực hiện chức năng này."); }
function isValidAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value); }

function canonicalMetadata({ credentialName, owner, expiry, qualificationIds }) {
  return JSON.stringify({
    credentialName: credentialName.trim(),
    owner: ethers.getAddress(owner),
    expiry: String(expiry),
    requiredQualificationIds: qualificationIds.map(String)
  });
}

function metadataHash(metadata) {
  return ethers.keccak256(ethers.toUtf8Bytes(metadata));
}

function metadataStorageKey(id) { return `professional-license-metadata:${ADDRESS}:${id}`; }

function saveLicenseMetadata(id, metadata) {
  const key = metadataStorageKey(id);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, metadata);
    }
  } catch (e) {
    console.warn("Không thể lưu metadata vào localStorage:", e);
  }
}

function getLicenseMetadata(id) {
  const key = metadataStorageKey(id);
  let metadata = null;
  try {
    if (typeof localStorage !== "undefined") {
      metadata = localStorage.getItem(key);
    }
  } catch (e) {
    console.warn("Không thể đọc metadata từ localStorage:", e);
  }
  if (!metadata) {
    try {
      if (typeof sessionStorage !== "undefined") {
        const legacyData = sessionStorage.getItem(key);
        if (legacyData) {
          metadata = legacyData;
          try {
            if (typeof localStorage !== "undefined") {
              localStorage.setItem(key, legacyData);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return metadata;
}

function encodeMetadata(metadata) {
  const bytes = new TextEncoder().encode(metadata);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeMetadata(payload) {
  const binary = atob(payload.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((payload.length + 3) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

function sharedMetadataFromHash() {
  return new URLSearchParams(location.hash.split("?")[1] || "").get("m");
}

async function readRequiredQualificationIds(licenseId) {
  const mappingSlot = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256"],
    [BigInt(licenseId), LICENSES_MAPPING_SLOT]
  ));
  const arrayLengthSlot = BigInt(mappingSlot) + LICENSE_QUALIFICATIONS_OFFSET;
  const length = Number(BigInt(await rpcProvider.getStorage(ADDRESS, arrayLengthSlot)));
  if (!length) return [];

  const firstElementSlot = BigInt(ethers.keccak256(ethers.zeroPadValue(ethers.toBeHex(arrayLengthSlot), 32)));
  return Promise.all(Array.from({ length }, async (_, index) => {
    const value = await rpcProvider.getStorage(ADDRESS, firstElementSlot + BigInt(index));
    return BigInt(value).toString();
  }));
}

function allowedPages() {
  if (role === "admin") return ["home", "verify", "publishers", "guide"];
  if (role === "publisher") return ["home", "verify", "license", "guide"];
  return ["home", "verify", "guide"];
}

function pageShell(content, active) {
  return `<div class="page-content"><div class="page-heading"><div><h2>${pages[active].title}</h2><p>${pages[active].subtitle}</p></div><span class="role-badge role-${role}">${roleLabel(role)}</span></div>${content}</div>`;
}

function render() {
  const requested = (location.hash.replace(/^#\/?/, "").split("?")[0]) || "home";
  const active = allowedPages().includes(requested) ? requested : "home";
  const content = { home: renderHome(), verify: renderVerify(), license: renderLicense(), publishers: renderPublishers(), guide: renderGuide() }[active];
  const navPages = allowedPages();

  document.querySelector("#app").innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand"><div class="logo">♜</div><div><strong>Professional</strong><span>License Registry</span></div></div>
        <nav class="nav">${navPages.map(key => { const p = pages[key]; return `<a href="#${key}" class="nav-link ${active === key ? "active" : ""}"><span class="icon">${p.icon}</span>${p.label}</a>`; }).join("")}</nav>
        <div class="side-contract"><h4>◈ &nbsp; Contract</h4><div class="contract-row"><span class="eth">♦</span><span>${shortAddress(ADDRESS)}</span><button id="copyContract" class="btn icon-btn">□</button></div><div class="side-meta"><span class="dot"></span>Sepolia Testnet</div><button id="explorer" class="explorer">Xem trên Etherscan ↗</button></div>
        <div class="version"><b>Client v2.0.0</b>Professional License MVP</div>
      </aside>
      <main class="main">
        <div class="topbar"><div class="title"><h1>Professional License Registry</h1><p>Integration client — Ethereum Sepolia</p></div><div class="top-actions"><div class="network">♦ &nbsp; Sepolia Testnet <span class="green-dot"></span></div><button id="connect" class="connect">🦊 &nbsp; ${account ? "Đã kết nối" : "Kết nối MetaMask"}</button></div></div>
        <section class="status">
          <div class="status-item"><div class="status-icon">▣</div><div><h3 id="connTitle">${account ? "Đã kết nối" : "Chưa kết nối"}</h3><p id="connHint">${account ? "Đã tự động kiểm tra quyền từ smart contract" : "Kết nối MetaMask để tự động xác định quyền"}</p></div></div>
          <div class="status-item"><div><p>Account</p><div id="account" class="value">${esc(account || "—")}</div></div></div>
          <div class="status-item"><div><p>Role</p><div id="roleValue" class="value role-text">${account ? roleLabel(role) : "—"}</div></div></div>
        </section>
        ${pageShell(content, active)}
        <footer>© 2026 Professional License MVP • Ethereum Sepolia Testnet</footer>
      </main>
    </div>`;

  bindCommon();
  bindPage(active);
}

function renderHome() {
  if (role === "admin") {
    return `<section class="card overview-card"><div class="card-head"><div class="card-icon">♜</div><div><h3>Admin Control Center</h3><p>Chỉ Admin mới thấy và sử dụng các chức năng quản trị publisher.</p></div></div>
      <div class="two-col-info"><div class="info-box"><div class="small">Admin của contract</div><div id="adminValue" class="value">Đang đọc...</div></div><div class="info-box"><div class="small">Ví hiện tại</div><div class="value">${esc(shortAddress(account))} · ADMIN</div></div></div>
      <div class="contract-large"><div class="small">Publisher authorization</div><div class="admin-check-row"><div><b>Publisher của ví hiện tại</b><div id="publisherCheck" class="muted-line">Đang kiểm tra...</div></div><a class="btn" href="#publishers">Quản lý Publisher →</a></div></div>
      <div class="home-actions"><a href="#publishers" class="btn primary">♙ &nbsp; Cấp phép / gỡ Publisher</a><a href="#verify" class="btn">◇ &nbsp; Verify License</a></div>
    </section>`;
  }

  if (role === "publisher") {
    return `<section class="card overview-card"><div class="card-head"><div class="card-icon orange">▤</div><div><h3>Publisher Workspace</h3><p>Ví hiện tại đã được Admin ủy quyền phát hành và quản lý license.</p></div></div>
      <div class="two-col-info"><div class="info-box"><div class="small">Role</div><div class="value">PUBLISHER</div></div><div class="info-box"><div class="small">Issuer</div><div class="value">${esc(shortAddress(account))}</div></div></div>
      <div class="home-actions"><a href="#license" class="btn issue-btn">▤ &nbsp; Issue / Lifecycle</a><a href="#verify" class="btn">◇ &nbsp; Verify License</a></div></section>
      ${renderLicenseList("issuer")}`;
  }

  return `<section class="card overview-card"><div class="card-head"><div class="card-icon green">✓</div><div><h3>My Licenses</h3><p>Các Professional License mà địa chỉ ví hiện tại đang sở hữu.</p></div></div>
    <div class="user-note">User không có quyền quản trị hoặc phát hành license. Danh sách dưới đây được lọc theo <b>license.owner = địa chỉ ví đang kết nối</b>. Chức năng Verify vẫn public và có thể sử dụng với bất kỳ license ID nào.</div></section>${renderLicenseList("owner")}`;
}

function renderLicenseList(filterMode = "all") {
  const title = filterMode === "owner" ? "My Licenses" : filterMode === "issuer" ? "Danh sách License & Qualification" : "Danh sách License & Qualification";
  const subtitle = filterMode === "owner"
    ? "Chỉ hiển thị license có owner trùng với ví đang kết nối."
    : filterMode === "issuer"
      ? "Hiển thị các License và Qualification do Publisher hiện tại phát hành."
      : "Đọc trực tiếp từ smart contract.";
  return `<section class="card license-list-card"><div class="list-head"><div><h3>${title}</h3><p>${subtitle}</p></div><button id="refreshLicenses" class="btn">↻ Làm mới</button></div><div id="licenseList" class="license-list"><div class="loading-box">Đang tải dữ liệu license từ Sepolia...</div></div></section>`;
}

function renderVerify() {
  return `<section class="card single-card"><div class="card-head"><div class="card-icon green">✓</div><div><h3>Verify License</h3><p>Kiểm tra tính hợp lệ của license trực tiếp từ smart contract.</p></div></div>
    <div class="form-grid verify-grid">
      <div><label>License ID</label><input id="verifyId" inputmode="numeric" placeholder="Nhập license ID"></div>
      <div><label>Owner address</label><input id="verifyOwner" placeholder="0x..."></div>
      <div class="wide"><button id="verifyBtn" class="btn green full">⌕ &nbsp; Verify License</button></div>
    </div>
    <div id="verifyResult" class="result"><strong>Kết quả</strong><span>Nhập License ID và Owner address để kiểm tra.</span></div><section class="audit-card"><h3>Audit / Event History</h3><div id="auditHistory">Chọn License để tải lịch sử event.</div></section></section>`;
}

function renderLicense() {
  return `<div class="license-stack"><section class="card"><div class="card-head"><div class="card-icon orange">▤</div><div><h3>Issue License</h3><p>Chỉ Publisher được ủy quyền mới có thể phát hành license.</p></div></div>
    <div class="form-grid"><div><label>Credential Name</label><input id="issueCredentialName" placeholder="Ví dụ: Medical Degree"></div><div><label>Owner address</label><input id="issueOwner" placeholder="0x..."></div><div>
      <label>Ngày hết hạn</label>
      <input id="issueExpiry" type="text" inputmode="numeric" autocomplete="off" placeholder="dd/mm/yyyy" maxlength="10">
      <label class="checkbox-row"><input id="issueNoExpiry" type="checkbox"><span>Không có thời hạn</span></label>
    </div><div class="wide"><label>Qualification IDs (cách nhau bằng dấu phẩy)</label><input id="issueQuals" placeholder="vd: 1,2,3"></div><div class="wide"><button id="issueBtn" class="btn issue-btn full">♙ &nbsp; Issue License</button></div></div><div id="issueResult" class="transaction-result">Transaction chưa thực hiện.</div></section>
    <section class="card"><div class="card-head"><div class="card-icon purple">↻</div><div><h3>License Lifecycle</h3><p>Thay đổi trạng thái license (Chỉ Publisher đã phát hành license mới được thực hiện).</p></div></div>
      <label>License ID</label><input id="lifeId" inputmode="numeric" placeholder="Nhập license ID">
      <div id="lifeGuardHint" class="muted-line" style="margin: 6px 0 10px; font-size: 12px;"></div>
      <div class="actions lifecycle-actions">
        <button id="suspendBtn" class="btn btn-suspend">⏸ &nbsp; Suspend</button>
        <button id="restoreBtn" class="btn primary">▷ &nbsp; Restore</button>
        <button id="revokeBtn" class="btn red">⏻ &nbsp; Revoke</button>
      </div>
      <div id="lifeResult" class="transaction-result">Transaction chưa thực hiện.</div>
    </section></div>`;
}

function renderPublishers() {
  return `<section class="card single-card"><div class="card-head"><div class="card-icon">♧</div><div><h3>Publisher Authorization</h3><p>Chỉ Admin của contract mới được cấp hoặc gỡ quyền Publisher.</p></div></div>
    <div class="publisher-form"><div><label>Publisher address</label><input id="pubAddress" placeholder="0x..."></div><div class="actions publisher-actions"><button id="registerBtn" class="btn green">♙ &nbsp; Register</button><button id="removeBtn" class="btn red">♙ &nbsp; Remove</button></div></div>
    <div id="pubResult" class="transaction-result">Chưa thực hiện transaction.</div><div class="permission-warning">Authorization vẫn được kiểm tra trong smart contract; frontend chỉ ẩn/hiện chức năng theo role.</div></section>`;
}

function renderGuide() {
  return `<section class="card single-card guide-card"><div class="card-head"><div class="card-icon">?</div><div><h3>Quy trình Integration</h3><p>Role được phát hiện tự động từ smart contract.</p></div></div><div class="guide-list">
    <div><b>01 — Connect</b><span>MetaMask được kiểm tra bằng eth_accounts; nếu đã cấp quyền, app tự khôi phục phiên sau F5.</span></div>
    <div><b>02 — Role detection</b><span>Đọc admin() và publishers(account) trên contract để xác định ADMIN / PUBLISHER / USER.</span></div>
    <div><b>03 — Verify</b><span>Bất kỳ người dùng nào cũng có thể kiểm tra license theo License ID; dữ liệu được đọc lại từ blockchain.</span></div>
    <div><b>04 — Publisher</b><span>Admin cấp hoặc gỡ quyền Publisher. Chỉ contract mới quyết định transaction có hợp lệ hay không.</span></div>
    <div><b>05 — License</b><span>Publisher phát hành license và quản lý Suspend / Restore / Revoke (Revoke là terminal, không thể khôi phục).</span></div>
    <div><b>06 — QR</b><span>QR mở trực tiếp route Verify của license; người quét không cần quyền Publisher hoặc role đặc biệt.</span></div>
  </div></section>`;
}

function bindCommon() {
  $("connect").onclick = () => connect(true).catch(e => toast(errorMessage(e)));
  $("copyContract").onclick = () => navigator.clipboard.writeText(ADDRESS).then(() => toast("Đã copy contract address.")).catch(() => toast("Không thể copy tự động."));
  $("explorer").onclick = () => window.open(`https://sepolia.etherscan.io/address/${ADDRESS}`, "_blank", "noopener,noreferrer");
  if ($("refreshLicenses")) $("refreshLicenses").onclick = () => loadLicenseList(true);
}

function bindIssueExpiry() {
  const input = $("issueExpiry");
  const checkbox = $("issueNoExpiry");
  if (!input || !checkbox) return;

  const sync = () => {
    const disabled = checkbox.checked;
    input.disabled = disabled;
    input.required = !disabled;
    input.setAttribute("aria-disabled", String(disabled));
    if (disabled) input.value = "";
  };

  checkbox.onchange = sync;
  input.oninput = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    event.target.value = formatted;
  };

  sync();
}

function bindPage(page) {
  if (page === "home") {
    if (role === "admin") loadAdminHome();
    if ((role === "publisher" || role === "user") && account) loadLicenseList();
  }
  if (page === "verify") {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    if (params.get("id")) $("verifyId").value = params.get("id");
    if (params.get("owner")) $("verifyOwner").value = params.get("owner");
    if (params.get("id") && !params.get("owner")) loadSharedLicense(params.get("id"));
    $("verifyBtn").onclick = () => verifyLicense().catch(e => showVerifyError(e));
    if (params.get("id")) loadAuditHistory(params.get("id"));
  }
  if (page === "license") {
    bindIssueExpiry();
    $("issueBtn").onclick = () => issueLicense().catch(e => showTxError("issueResult", e));
    $("suspendBtn").onclick = () => lifecycleTx("suspendLicense", "lifeResult").catch(e => showTxError("lifeResult", e));
    $("restoreBtn").onclick = () => lifecycleTx("restoreLicense", "lifeResult").catch(e => showTxError("lifeResult", e));
    $("revokeBtn").onclick = () => lifecycleTx("revokeLicense", "lifeResult").catch(e => showTxError("lifeResult", e));

    const checkGuards = async () => {
      const id = $("lifeId")?.value.trim();
      const sBtn = $("suspendBtn");
      const rBtn = $("restoreBtn");
      const kBtn = $("revokeBtn");
      const hint = $("lifeGuardHint");
      if (!id || !/^\d+$/.test(id) || !readContract || !sBtn || !rBtn || !kBtn) return;
      try {
        const data = await readContract.licenses(id);
        const owner = data.owner ?? data[1];
        const issuer = data.issuer ?? data[2];
        const status = Number(data.status ?? data[5]);
        if (!owner || owner.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
          if (hint) hint.textContent = `License #${id} không tồn tại trên contract.`;
          sBtn.style.display = ""; sBtn.disabled = true;
          rBtn.style.display = ""; rBtn.disabled = true;
          kBtn.style.display = ""; kBtn.disabled = true;
          return;
        }
        const isMyIssuer = account && issuer.toLowerCase() === account.toLowerCase();
        if (!isMyIssuer) {
          if (hint) hint.textContent = `Chỉ Issuer (${shortAddress(issuer)}) mới có quyền thay đổi trạng thái License #${id}.`;
          sBtn.style.display = ""; sBtn.disabled = true;
          rBtn.style.display = ""; rBtn.disabled = true;
          kBtn.style.display = ""; kBtn.disabled = true;
          return;
        }
        if (status === STATUS.REVOKED) {
          if (hint) hint.textContent = `License #${id} đã bị REVOKED vĩnh viễn (Terminal state — không thể thao tác).`;
          sBtn.style.display = "none"; sBtn.disabled = true;
          rBtn.style.display = "none"; rBtn.disabled = true;
          kBtn.style.display = "none"; kBtn.disabled = true;
        } else if (status === STATUS.SUSPENDED) {
          if (hint) hint.textContent = `License #${id} đang SUSPENDED (Có thể Restore hoặc Revoke).`;
          sBtn.style.display = "none"; sBtn.disabled = true;
          rBtn.style.display = ""; rBtn.disabled = false;
          kBtn.style.display = ""; kBtn.disabled = false;
        } else if (status === STATUS.ACTIVE) {
          if (hint) hint.textContent = `License #${id} đang ACTIVE (Có thể Suspend hoặc Revoke).`;
          sBtn.style.display = ""; sBtn.disabled = false;
          rBtn.style.display = "none"; rBtn.disabled = true;
          kBtn.style.display = ""; kBtn.disabled = false;
        }
      } catch {
        // ignore
      }
    };
    $("lifeId").oninput = checkGuards;
    $("lifeId").onchange = checkGuards;
  }
  if (page === "publishers") {
    $("registerBtn").onclick = () => publisherTx("registerPublisher").catch(e => showTxError("pubResult", e));
    $("removeBtn").onclick = () => publisherTx("removePublisher").catch(e => showTxError("pubResult", e));
  }
}

async function loadSharedLicense(id) {
  const ownerInput = $("verifyOwner");
  if (!readContract || !ownerInput) return;

  try {
    if (!/^\d+$/.test(id) || BigInt(id) <= 0n) throw new Error("License ID không hợp lệ.");
    const data = await readContract.licenses(id);
    const owner = data.owner ?? data[1];
    if (!owner || owner.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
      throw new Error(`Không tìm thấy License #${id}.`);
    }
    ownerInput.value = owner;
  } catch (e) {
    showVerifyError(e);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchContractEventsWithFallback(licenseId) {
  const candidates = [];
  if (provider && readContract) {
    candidates.push({ name: "browserProvider", contract: readContract });
  }
  for (const rpcUrl of SEPOLIA_RPCS) {
    try {
      const p = new ethers.JsonRpcProvider(rpcUrl);
      candidates.push({ name: rpcUrl, contract: new ethers.Contract(ADDRESS, abi, p) });
    } catch {
      // ignore invalid provider setup
    }
  }

  let lastError = null;
  const MAX_RETRIES_PER_ENDPOINT = 2;

  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_ENDPOINT; attempt++) {
      try {
        const issuedFilter = candidate.contract.filters.LicenseIssued(licenseId);
        const statusFilter = candidate.contract.filters.LicenseStatusChanged(licenseId);
        const [issued, statusChanges] = await Promise.all([
          candidate.contract.queryFilter(issuedFilter, DEPLOYMENT_BLOCK, "latest"),
          candidate.contract.queryFilter(statusFilter, DEPLOYMENT_BLOCK, "latest")
        ]);
        return { issued, statusChanges };
      } catch (err) {
        lastError = err;
        console.warn(`Query events failed on ${candidate.name} (attempt ${attempt}/${MAX_RETRIES_PER_ENDPOINT}):`, err);
        if (attempt < MAX_RETRIES_PER_ENDPOINT) {
          await sleep(250 * attempt);
        }
      }
    }
  }

  throw lastError || new Error("Mọi RPC Sepolia đều không thể tải logs.");
}

async function loadAuditHistory(id) {
  const box = $("auditHistory");
  if (!box) return;
  if (!id || !/^\d+$/.test(id) || BigInt(id) <= 0n) {
    box.innerHTML = "<span>License ID không hợp lệ.</span>";
    return;
  }
  box.innerHTML = `<span class="loading">Đang tải lịch sử event...</span>`;
  try {
    const { issued, statusChanges } = await fetchContractEventsWithFallback(id);
    const events = [];
    for (const event of issued) {
      events.push({
        type: "LicenseIssued",
        licenseId: event.args.licenseId.toString(),
        actor: event.args.issuer,
        owner: event.args.owner,
        detail: `${event.args.credentialName} · ${event.args.metadataHash}`,
        event
      });
    }
    const statusNames = { 0: "ACTIVE", 1: "SUSPENDED", 2: "REVOKED", 0n: "ACTIVE", 1n: "SUSPENDED", 2n: "REVOKED" };
    for (const event of statusChanges) {
      const oldStatusLabel = statusNames[event.args.oldStatus] || String(event.args.oldStatus);
      const newStatusLabel = statusNames[event.args.newStatus] || String(event.args.newStatus);
      const timestampStr = event.args.timestamp ? ` · ${new Date(Number(event.args.timestamp) * 1000).toLocaleString("vi-VN")}` : "";
      events.push({
        type: "LicenseStatusChanged",
        licenseId: event.args.licenseId.toString(),
        actor: event.args.actor,
        detail: `${oldStatusLabel} → ${newStatusLabel}${timestampStr}`,
        event
      });
    }
    events.sort((left, right) => (left.event.blockNumber || 0) - (right.event.blockNumber || 0));
    box.innerHTML = events.length ? events.map(renderAuditEvent).join("") : "<span>Không có event history.</span>";
  } catch (e) {
    console.error("Load audit history error:", e);
    box.innerHTML = `<span>Không thể tải event history: ${esc(errorMessage(e))}</span>`;
  }
}

function renderAuditEvent(item) {
  const tx = item.event.transactionHash;
  return `<div class="audit-event"><div><b>${esc(item.type)}</b><span>Block ${item.event.blockNumber}</span></div><div><span>License ID: <b>${esc(item.licenseId || "—")}</b></span><span>Owner: <b>${esc(shortAddress(item.owner))}</b></span><span>Actor: <b>${esc(shortAddress(item.actor))}</b></span><span>${esc(item.detail || "")}</span></div><a href="https://sepolia.etherscan.io/tx/${tx}" target="_blank" rel="noopener noreferrer">Tx ↗</a></div>`;
}

async function connect(requestPermission = false) {
  if (!window.ethereum) throw new Error("Không tìm thấy MetaMask.");
  provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = requestPermission ? await provider.send("eth_requestAccounts", []) : await provider.send("eth_accounts", []);
  if (!accounts.length) { account = null; signer = null; contract = null; role = "user"; render(); return; }
  const net = await provider.getNetwork();
  if (net.chainId !== SEPOLIA) throw new Error("Hãy chuyển MetaMask sang Ethereum Sepolia.");
  account = ethers.getAddress(accounts[0]);
  signer = await provider.getSigner();
  readContract = new ethers.Contract(ADDRESS, abi, provider);
  contract = new ethers.Contract(ADDRESS, abi, signer);
  await detectRole();
  render();
  toast(`Kết nối thành công — quyền: ${roleLabel(role)}`);
}

async function detectRole() {
  if (!account || !readContract) return;
  roleLoading = true;
  const adminAddress = ethers.getAddress(await readContract.admin());
  const publisher = await readContract.publishers(account);
  role = account.toLowerCase() === adminAddress.toLowerCase() ? "admin" : (publisher ? "publisher" : "user");
  roleLoading = false;
}

async function autoRestoreConnection() {
  if (!window.ethereum) return;
  try { await connect(false); } catch (e) { if (e.code !== 4001) console.warn("Auto connection skipped:", e); }
}

async function loadAdminHome() {
  try {
    if (!readContract) return;
    setText("adminValue", await readContract.admin());
    setText("publisherCheck", await readContract.publishers(account) ? "ĐƯỢC ỦY QUYỀN" : "KHÔNG PHẢI PUBLISHER");
  } catch (e) { setText("adminValue", "Không đọc được contract"); setText("publisherCheck", errorMessage(e)); }
}

function licenseCacheKey() {
  return `${role}:${account?.toLowerCase() || "anonymous"}`;
}

async function loadLicenseList(force = false) {
  const box = $("licenseList");
  if (!box) return;
  if (!readContract) {
    box.innerHTML = `<div class="empty-box">Hãy kết nối MetaMask để tải danh sách license.</div>`;
    return;
  }

  const cacheKey = licenseCacheKey();
  if (!force && licenseCache?.key === cacheKey) {
    renderLicenseListData(licenseCache.items);
    return;
  }

  const mode = role === "user" ? "owner" : role === "publisher" ? "issuer" : "all";
  box.innerHTML = `<div class="loading-box">Đang đọc danh sách License trực tiếp từ smart contract...</div>`;

  try {
    const licenses = [];
    const MAX_SCAN = 1000;

    for (let id = 1; id <= MAX_SCAN; id++) {
      let data;
      try {
        data = await readContract.licenses(id);
      } catch (e) {
        console.warn(`Không đọc được license #${id}:`, e);
        throw new Error(`Không thể đọc License #${id} từ Sepolia: ${errorMessage(e)}`);
      }

      const owner = data.owner ?? data[1];
      if (!owner || owner.toLowerCase() === ethers.ZeroAddress.toLowerCase()) break;

      const issuer = data.issuer ?? data[2];
      const matchesOwner = account && owner.toLowerCase() === account.toLowerCase();
      const matchesIssuer = account && issuer.toLowerCase() === account.toLowerCase();

      if (
        (mode === "owner" && matchesOwner) ||
        (mode === "issuer" && matchesIssuer) ||
        mode === "all"
      ) {
        licenses.push({
          id: String(id),
          owner,
          issuer,
          issueDate: Number(data.issueDate ?? data[3]),
          expiry: Number(data.expiry ?? data[4]),
          status: Number(data.status ?? data[5]),
          quals: await readRequiredQualificationIds(id),
          credentialName: data.credentialName ?? data[0],
          metadataHash: data.metadataHash ?? data[6]
        });
      }
    }

    licenses.sort((a, b) => Number(b.id) - Number(a.id));
    licenseCache = { key: cacheKey, items: licenses };
    renderLicenseListData(licenses);
  } catch (e) {
    console.error("License list load failed:", e);
    const message = errorMessage(e);
    box.innerHTML = `<div class="empty-box error">Không thể tải danh sách License từ Sepolia.<br><small>${esc(message)}</small><br><button id="refreshLicensesInline" class="btn">↻ Thử lại</button></div>`;
    $("refreshLicensesInline")?.addEventListener("click", () => loadLicenseList(true));
  }
}

function renderLicenseListData(licenses) {
  const box = $("licenseList");
  if (!box) return;

  if (!licenses.length) {
    const mode = role === "user" ? "owner" : role === "publisher" ? "issuer" : "all";
    const emptyMessage = mode === "owner"
      ? "Ví hiện tại chưa sở hữu license nào."
      : mode === "issuer"
        ? "Publisher hiện tại chưa phát hành license nào."
        : "Chưa tìm thấy license nào trên contract.";
    box.innerHTML = `<div class="empty-box">${emptyMessage}</div>`;
    return;
  }

  const professionalLicenses = licenses.filter(item => item.quals.length > 0);
  const qualifications = licenses.filter(item => item.quals.length === 0);
  box.innerHTML = `${renderLicenseGroup("PROFESSIONAL LICENSES", professionalLicenses, professionalLicensesExpanded, "professional")}${renderLicenseGroup("QUALIFICATIONS", qualifications, qualificationsExpanded, "qualifications")}`;
  box.querySelectorAll("[data-collapse]").forEach(button => {
    button.onclick = () => {
      if (button.dataset.collapse === "professional") professionalLicensesExpanded = !professionalLicensesExpanded;
      if (button.dataset.collapse === "qualifications") qualificationsExpanded = !qualificationsExpanded;
      renderLicenseListData(licenses);
    };
  });
  box.querySelectorAll("[data-qr]").forEach(btn => {
    btn.onclick = () => showQr(btn.dataset.qr, btn.dataset.owner).catch(e => toast(errorMessage(e)));
  });
  box.querySelectorAll("[data-verify]").forEach(btn => {
    btn.onclick = () => {
      const owner = btn.dataset.owner || "";
      location.hash = `verify?id=${encodeURIComponent(btn.dataset.verify)}&owner=${encodeURIComponent(owner)}`;
    };
  });
}

function renderLicenseGroup(title, items, expanded, key) {
  if (!items.length) return "";
  return `<section class="license-group"><div class="license-group-head"><h4>${title}</h4><button class="btn" data-collapse="${key}">${expanded ? "Thu gọn" : "Mở rộng"}</button></div>${expanded ? items.map(renderLicenseItem).join("") : ""}</section>`;
}

function renderLicenseItem(item) {
  const displayStatus = quickStatus(item.expiry, item.status);
  const statusClass = displayStatus.toLowerCase();
  return `<article class="license-item"><div class="license-main"><div class="license-id">#${item.id}</div><div class="license-data"><div><span>Credential Name</span><b>${esc(item.credentialName || "—")}</b></div><div><span>Owner</span><b>${esc(shortAddress(item.owner))}</b></div><div><span>Issuer</span><b>${esc(shortAddress(item.issuer))}</b></div><div><span>Issue Date</span><b>${new Date(item.issueDate * 1000).toLocaleDateString("vi-VN")}</b></div><div><span>Expiry</span><b>${item.expiry ? new Date(item.expiry * 1000).toLocaleDateString("vi-VN") : "Không giới hạn"}</b></div><div><span>Status</span><b class="status-pill ${statusClass}">${displayStatus}</b></div></div></div><div class="license-actions"><button class="btn" data-verify="${item.id}" data-owner="${esc(item.owner)}">Verify</button><button class="btn primary" data-qr="${item.id}" data-owner="${esc(item.owner)}">Share / QR</button></div></article>`;
}

function quickStatus(expiry, status) {
  if (status === STATUS.REVOKED) return "REVOKED";
  if (status === STATUS.SUSPENDED) return "SUSPENDED";
  if (expiry !== 0 && Math.floor(Date.now() / 1000) >= expiry) return "EXPIRED";
  return "ACTIVE";
}

async function showQr(id, owner) {
  const data = await readContract.licenses(id);
  const credentialName = data.credentialName ?? data[0];
  const storedOwner = data.owner ?? data[1];
  const expiry = String(data.expiry ?? data[4]);
  const qualificationIds = await readRequiredQualificationIds(id);
  const metadata = canonicalMetadata({ credentialName, owner: storedOwner || owner, expiry, qualificationIds });
  const payload = encodeMetadata(metadata);
  if (payload.length > 1800) throw new Error("Metadata quá lớn để tạo URL/QR an toàn.");
  const url = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(id)}&owner=${encodeURIComponent(storedOwner || owner)}&m=${encodeURIComponent(payload)}`;
  const dataUrl = await QRCode.toDataURL(url, { width: 280, margin: 2 });
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<div class="qr-modal"><button class="modal-close">×</button><div class="card-icon green qr-icon">⌁</div><h3>QR License #${esc(id)}</h3><p>Quét mã để mở trang Verify License.</p><img src="${dataUrl}" alt="QR License ${esc(id)}"><code>${esc(url)}</code><button class="btn primary full modal-copy">Copy link Verify</button></div>`;
  document.body.appendChild(modal);
  modal.querySelector(".modal-close").onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  modal.querySelector(".modal-copy").onclick = () => navigator.clipboard.writeText(url).then(() => toast("Đã copy link Verify."));
}

async function verifyLicense() {
  if (!readContract) throw new Error("Chưa kết nối MetaMask.");
  const id = $("verifyId").value.trim();
  const owner = $("verifyOwner").value.trim();

  if (!id || !/^\d+$/.test(id) || BigInt(id) <= 0n) {
    throw new Error("License ID phải là số nguyên dương.");
  }
  if (!isValidAddress(owner)) {
    throw new Error("Owner address không hợp lệ.");
  }

  const result = $("verifyResult");
  result.className = "result loading";
  result.innerHTML = "<strong>Đang kiểm tra...</strong><span>Đọc trạng thái trực tiếp từ smart contract trên Sepolia.</span>";
  loadAuditHistory(id).catch(e => {
    console.error("Load audit history error:", e);
    const box = $("auditHistory");
    if (box) box.innerHTML = `<span>Không thể tải event history: ${esc(errorMessage(e))}</span>`;
  });

  try {
    const data = await readContract.licenses(id);

    const credentialName = data.credentialName ?? data[0];
    const storedOwner = data.owner ?? data[1];
    const issuer = data.issuer ?? data[2];
    const issueDateRaw = data.issueDate ?? data[3];
    const expiryRaw = data.expiry ?? data[4];
    const statusRaw = data.status ?? data[5];
    const onChainMetadataHash = data.metadataHash ?? data[6];

    if (
      credentialName == null ||
      storedOwner == null ||
      issuer == null ||
      issueDateRaw == null ||
      expiryRaw == null ||
      statusRaw == null
    ) {
      throw new Error("ABI của frontend không khớp với contract ProfessionalLicenseRegistry.");
    }

    if (!storedOwner || storedOwner.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
      result.className = "result error";
      result.innerHTML = `
        <strong>KHÔNG TỒN TẠI</strong>
        <span>Không tìm thấy License #${esc(id)} trên smart contract.</span>
        <div class="verify-detail"><span>License ID: <b>${esc(id)}</b></span></div>`;
      return;
    }

    // 1. Missing metadata -> UNVERIFIABLE
    let metadata = null;
    const payload = sharedMetadataFromHash();
    if (payload) {
      try { metadata = decodeMetadata(payload); } catch (e) { metadata = null; }
    }
    if (!metadata) metadata = getLicenseMetadata(id);
    if (!metadata) {
      result.className = "result error";
      result.innerHTML = `<strong>UNVERIFIABLE</strong><span>Không lấy được metadata off-chain để kiểm tra integrity.</span><div class="verify-detail"><span>License ID: <b>${esc(id)}</b></span><span>Credential Name: <b>${esc(credentialName)}</b></span><span>On-chain metadataHash: <b>${esc(onChainMetadataHash)}</b></span></div>`;
      return;
    }

    // 2. Hash mismatch -> UNTRUSTED / INTEGRITY FAILED
    if (metadataHash(metadata).toLowerCase() !== onChainMetadataHash.toLowerCase()) {
      result.className = "result error";
      result.innerHTML = `<strong>UNTRUSTED / INTEGRITY FAILED</strong><span>INTEGRITY FAILED: metadata hash không khớp dữ liệu on-chain.</span><div class="verify-detail"><span>License ID: <b>${esc(id)}</b></span><span>Credential Name: <b>${esc(credentialName)}</b></span></div>`;
      return;
    }

    // 3. Wrong owner -> WRONG OWNER
    if (storedOwner.toLowerCase() !== owner.toLowerCase()) {
      result.className = "result error";
      result.innerHTML = `
        <strong>WRONG OWNER</strong>
        <span>License tồn tại nhưng thông tin owner không khớp với thông tin xác minh.</span>
        <div class="verify-detail">
          <span>License ID: <b>${esc(id)}</b></span>
          <span>On-chain Owner: <b>${esc(storedOwner)}</b></span>
          <span>Entered Owner: <b>${esc(owner)}</b></span>
        </div>`;
      return;
    }

    const issueDate = Number(issueDateRaw);
    const expiry = Number(expiryRaw);
    const status = Number(statusRaw);

    // 4. Status REVOKED -> REVOKED / INVALID
    if (status === STATUS.REVOKED) {
      result.className = "result error";
      result.innerHTML = `
        <strong>REVOKED / INVALID</strong>
        <span>License đã bị thu hồi vĩnh viễn (REVOKED) và không thể khôi phục.</span>
        <div class="verify-detail">
          <span>License ID: <b>${esc(id)}</b></span>
          <span>Credential Name: <b>${esc(credentialName)}</b></span>
          <span>Owner: <b>${esc(storedOwner)}</b></span>
          <span>Status: <b class="status-pill revoked">REVOKED</b></span>
        </div>`;
      return;
    }

    // 5. Status SUSPENDED -> SUSPENDED / INVALID
    if (status === STATUS.SUSPENDED) {
      result.className = "result error";
      result.innerHTML = `
        <strong>SUSPENDED / INVALID</strong>
        <span>License đang bị tạm đình chỉ hiệu lực (SUSPENDED) bởi Publisher.</span>
        <div class="verify-detail">
          <span>License ID: <b>${esc(id)}</b></span>
          <span>Credential Name: <b>${esc(credentialName)}</b></span>
          <span>Owner: <b>${esc(storedOwner)}</b></span>
          <span>Status: <b class="status-pill suspended">SUSPENDED</b></span>
        </div>`;
      return;
    }

    // 6. Active + expired -> EXPIRED / INVALID
    if (status === STATUS.ACTIVE && expiry !== 0 && Math.floor(Date.now() / 1000) >= expiry) {
      result.className = "result error";
      result.innerHTML = `
        <strong>EXPIRED / INVALID</strong>
        <span>License đã hết hạn theo thời gian hiệu lực.</span>
        <div class="verify-detail">
          <span>License ID: <b>${esc(id)}</b></span>
          <span>Credential Name: <b>${esc(credentialName)}</b></span>
          <span>Expiry: <b>${new Date(expiry * 1000).toLocaleDateString("vi-VN")}</b></span>
          <span>Status: <b class="status-pill expired">EXPIRED</b></span>
        </div>`;
      return;
    }

    // 7. Active + valid -> VALID (kèm qualification dependencies)
    const qualificationIds = await readRequiredQualificationIds(id);
    const qualifications = await Promise.all(qualificationIds.map(async qualificationId => {
      const qualificationData = await readContract.licenses(qualificationId);
      const qualificationOwner = qualificationData.owner ?? qualificationData[1];
      const qualificationExpiry = Number(qualificationData.expiry ?? qualificationData[4]);
      const qualificationStatus = Number(qualificationData.status ?? qualificationData[5]);
      let qualificationStatusLabel = "VALID";
      if (!qualificationOwner || qualificationOwner.toLowerCase() === ethers.ZeroAddress.toLowerCase() || qualificationOwner.toLowerCase() !== storedOwner.toLowerCase()) {
        qualificationStatusLabel = "MISSING";
      } else if (qualificationStatus === STATUS.REVOKED) {
        qualificationStatusLabel = "REVOKED";
      } else if (qualificationStatus === STATUS.SUSPENDED) {
        qualificationStatusLabel = "SUSPENDED";
      } else if (qualificationExpiry !== 0 && Math.floor(Date.now() / 1000) >= qualificationExpiry) {
        qualificationStatusLabel = "EXPIRED";
      } else if (qualificationStatus === STATUS.ACTIVE) {
        qualificationStatusLabel = "VALID";
      }
      return { id: qualificationId, status: qualificationStatusLabel };
    }));

    const ok = await readContract.verifyLicense(id, owner);
    const qualificationSection = qualifications.length
      ? `<div class="verify-section"><h4>REQUIRED QUALIFICATIONS</h4>${qualifications.map(item => `<div class="qualification-result"><span>Qualification #${esc(item.id)}</span><b class="status-pill ${item.status === "VALID" ? "active" : item.status === "SUSPENDED" ? "suspended" : item.status === "REVOKED" ? "revoked" : item.status === "EXPIRED" ? "expired" : "missing"}">${item.status}</b><strong>${item.status === "VALID" ? "PASS" : "FAIL"}</strong></div>`).join("")}</div>`
      : `<div class="verify-section"><h4>REQUIRED QUALIFICATIONS</h4><span>No required qualifications</span></div>`;

    result.className = `result ${ok ? "" : "error"}`;
    result.innerHTML = `
      <div class="verify-section"><h4>LICENSE</h4><strong>${ok ? "VALID" : "INVALID"}</strong><span>${ok ? "License hợp lệ và đang hoạt động." : "License không hợp lệ."}</span></div>
      <div class="verify-detail">
        <span>License ID: <b>${esc(id)}</b></span>
        <span>Credential Name: <b>${esc(credentialName)}</b></span>
        <span>Owner: <b>${esc(storedOwner)}</b></span>
        <span>Issuer: <b>${esc(issuer)}</b></span>
        <span>Issue Date: <b>${new Date(Number(issueDateRaw) * 1000).toLocaleDateString("vi-VN")}</b></span>
        <span>Status: <b class="status-pill active">ACTIVE</b></span>
        <span>Expiry: <b>${expiry === 0 ? "Không giới hạn" : new Date(expiry * 1000).toLocaleDateString("vi-VN")}</b></span>
      </div>${qualificationSection}`;
  } catch (e) {
    console.error("Verify license failed:", e);
    throw new Error(`Không thể verify License #${id}: ${errorMessage(e)}`);
  }
}

async function issueLicense() {
  requireContract(); requireRole(["publisher"]);
  const owner = $("issueOwner").value.trim();
  const credentialName = $("issueCredentialName").value.trim();
  const expiryInput = $("issueExpiry");
  const noExpiry = $("issueNoExpiry")?.checked;
  const expiryText = expiryInput.value.trim();
  const quals = ($("issueQuals").value || "").split(",").map(v => v.trim()).filter(Boolean);
  if (!isValidAddress(owner)) throw new Error("Owner address không hợp lệ.");
  if (!credentialName) throw new Error("Credential Name là bắt buộc.");

  let expiry = "0";
  if (!noExpiry) {
    const match = expiryText.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) throw new Error("Ngày hết hạn phải có dạng dd/mm/yyyy (ví dụ: 17/09/2026).");

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const selected = new Date(year, month - 1, day, 23, 59, 59);

    if (
      selected.getFullYear() !== year ||
      selected.getMonth() !== month - 1 ||
      selected.getDate() !== day
    ) {
      throw new Error("Ngày hết hạn không hợp lệ.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) throw new Error("Ngày hết hạn không được ở trong quá khứ.");

    expiry = String(Math.floor(selected.getTime() / 1000));
  }

  if (quals.some(v => !/^\d+$/.test(v))) throw new Error("Qualification IDs phải là số, cách nhau bằng dấu phẩy.");
  const metadata = canonicalMetadata({ credentialName, owner, expiry, qualificationIds: quals });
  const hash = metadataHash(metadata);
  const receipt = await runTx(() => contract.issueLicense(owner, credentialName, expiry, quals, hash), "issueResult");
  if (receipt?.logs) {
    const issued = receipt.logs.find(log => log.fragment?.name === "LicenseIssued");
    if (issued) saveLicenseMetadata(issued.args.licenseId.toString(), metadata);
  }
  await loadLicenseList(true);
}

async function lifecycleTx(method, outId) {
  requireContract(); requireRole(["publisher"]);
  const id = $("lifeId").value.trim();
  if (!/^\d+$/.test(id)) throw new Error("License ID phải là số nguyên.");
  await runTx(() => contract[method](id), outId);
  await loadLicenseList(true);
}

async function publisherTx(method) {
  requireContract(); requireRole(["admin"]);
  const address = $("pubAddress").value.trim();
  if (!isValidAddress(address)) throw new Error("Publisher address không hợp lệ.");
  await runTx(() => contract[method](address), "pubResult");
}

async function runTx(fn, outId) {
  const t = await fn();
  setText(outId, `Transaction: ${t.hash} — đang chờ xác nhận...`);
  const receipt = await t.wait();
  setText(outId, `Transaction: ${t.hash}\nBlock: ${receipt.blockNumber}\nStatus: ${receipt.status === 1 ? "SUCCESS" : "FAILED"}`);
  toast("Transaction đã được xác nhận.");
  return receipt;
}

function showTxError(id, e) { setText(id, errorMessage(e)); toast(errorMessage(e)); }
function showVerifyError(e) { const result = $("verifyResult"); if (!result) return; result.className = "result error"; result.innerHTML = `<strong>Lỗi</strong><span>${esc(errorMessage(e))}</span>`; }
function errorMessage(e) { return e?.shortMessage || e?.reason || e?.message || "Đã xảy ra lỗi."; }

window.addEventListener("hashchange", render);
if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", () => autoRestoreConnection());
  window.ethereum.on?.("chainChanged", () => autoRestoreConnection());
}
render();
autoRestoreConnection();
