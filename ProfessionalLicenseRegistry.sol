// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract ProfessionalLicenseRegistry {

    // =========================
    // KIỂU LIỆT KÊ
    // =========================

    enum Status {
        ACTIVE,
        SUSPENDED,
        REVOKED
    }

    // =========================
    // MÔ HÌNH DỮ LIỆU
    // =========================

    struct License {
        string credentialName;
        address owner;
        address issuer;
        uint256 issueDate;
        uint256 expiry;
        Status status;
        bytes32 metadataHash;
        uint256[] requiredQualificationIds;
    }

    // =========================
    // LƯU TRỮ
    // =========================

    // Một asset model duy nhất:
    // Qualification và Professional License
    // đều được lưu dưới dạng License.
    mapping(uint256 => License) public licenses;

    // Danh sách Publisher được phép phát hành License.
    mapping(address => bool) public publishers;

    // Admin ban đầu là account deploy contract.
    address public admin;

    // Sequential ID: 1, 2, 3, ...
    uint256 private nextLicenseId = 1;

    // =========================
    // HÀM KHỞI TẠO
    // =========================

    constructor() {
        admin = msg.sender;
    }

    // =========================
    // EVENT
    // =========================

    event LicenseIssued(
        uint256 indexed licenseId,
        address indexed owner,
        address indexed issuer,
        string credentialName,
        bytes32 metadataHash
    );

    event LicenseStatusChanged(
        uint256 indexed licenseId,
        Status oldStatus,
        Status newStatus,
        address indexed actor,
        uint256 timestamp
    );

    event PublisherRegistered(
        address indexed publisher,
        address indexed actor
    );

    event PublisherRemoved(
        address indexed publisher,
        address indexed actor
    );

    // =========================
    // BỘ ĐIỀU KIỆN
    // =========================

    modifier onlyAdmin() {
        require(
            msg.sender == admin,
            "Not authorized admin"
        );
        _;
    }

    modifier onlyPublisher() {
        require(
            publishers[msg.sender],
            "Not authorized publisher"
        );
        _;
    }

    // =========================
    // PHÂN QUYỀN PUBLISHER
    // =========================

    function registerPublisher(
        address publisher
    )
        external
        onlyAdmin
    {
        require(
            publisher != address(0),
            "Invalid publisher"
        );

        require(
            !publishers[publisher],
            "Already publisher"
        );

        publishers[publisher] = true;

        emit PublisherRegistered(
            publisher,
            msg.sender
        );
    }

    function removePublisher(
        address publisher
    )
        external
        onlyAdmin
    {
        require(
            publishers[publisher],
            "Not a publisher"
        );

        publishers[publisher] = false;

        emit PublisherRemoved(
            publisher,
            msg.sender
        );
    }

    // =========================
    // CẤP LICENSE
    // =========================

    function issueLicense(
        address owner,
        string calldata credentialName,
        uint256 expiry,
        uint256[] calldata requiredQualificationIds,
        bytes32 metadataHash
    )
        external
        onlyPublisher
        returns (uint256 licenseId)
    {
        require(
            owner != address(0),
            "Invalid owner"
        );

        // Nếu có Required Qualifications,
        // phải kiểm tra toàn bộ requirements.
        if (requiredQualificationIds.length > 0) {
            require(
                _checkRequirements(
                    owner,
                    requiredQualificationIds
                ),
                "Requirements not satisfied"
            );
        }

        // Sequential License ID
        licenseId = nextLicenseId;
        nextLicenseId++;

        License storage license = licenses[licenseId];

        license.credentialName = credentialName;
        license.owner = owner;
        license.issuer = msg.sender;
        license.issueDate = block.timestamp;
        license.expiry = expiry;
        license.status = Status.ACTIVE;
        license.metadataHash = metadataHash;

        for (
            uint256 i = 0;
            i < requiredQualificationIds.length;
            i++
        ) {
            license.requiredQualificationIds.push(
                requiredQualificationIds[i]
            );
        }

        emit LicenseIssued(
            licenseId,
            owner,
            msg.sender,
            credentialName,
            metadataHash
        );
    }

    // =========================
    // KIỂM TRA QUALIFICATION
    // =========================

    // Qualification được xác định duy nhất bởi:
    // requiredQualificationIds.length == 0
    function _isQualification(
        uint256 licenseId
    )
        internal
        view
        returns (bool)
    {
        return
            licenses[licenseId]
                .requiredQualificationIds
                .length == 0;
    }

    // =========================
    // KIỂM TRA REQUIREMENT
    // =========================

    function _checkRequirements(
    address owner,
    uint256[] memory qualificationIds
    )
        internal
        view
        returns (bool)
    {
        for (
            uint256 i = 0;
            i < qualificationIds.length;
            i++
        ) {
            uint256 qualificationId = qualificationIds[i];

            License storage qualification =
                licenses[qualificationId];

            // 1. Qualification phải tồn tại.
            if (qualification.owner == address(0)) {
                return false;
            }

            // 2. ID phải trỏ tới Qualification,
            // không phải Professional License.
            if (!_isQualification(qualificationId)) {
                return false;
            }

            // 3. Qualification phải thuộc cùng Owner
            // với Professional License đang được cấp.
            if (qualification.owner != owner) {
                return false;
            }

            // 4. Qualification phải đang ACTIVE.
            if (qualification.status != Status.ACTIVE) {
                return false;
            }

            // 5. Kiểm tra expiry.
            // expiry == 0: không hết hạn.
            // expiry > 0 và đã tới expiry: hết hạn.
            if (
                qualification.expiry != 0 &&
                block.timestamp >= qualification.expiry
            ) {
                return false;
            }
        }

        return true;
    }

    // =========================
    // KIỂM TRA TRƯỚC REQUIREMENT
    // =========================

    // Frontend có thể gọi view này trước khi
    // gửi transaction issueLicense().
    function checkLicenseRequirements(
        address owner,
        uint256[] calldata qualificationIds
    )
        external
        view
        returns (bool)
    {
        return _checkRequirements(
            owner,
            qualificationIds
        );
    }

    // =========================
    // VÒNG ĐỜI LICENSE
    // =========================

    function suspendLicense(
        uint256 licenseId
    )
        external
        onlyPublisher
    {
        License storage license = licenses[licenseId];

        require(
            license.owner != address(0),
            "License does not exist"
        );

        // Chỉ Publisher đã phát hành License
        // mới được suspend License đó.
        require(
            license.issuer == msg.sender,
            "Not license issuer"
        );

        require(
            license.status == Status.ACTIVE,
            "License not active"
        );

        license.status = Status.SUSPENDED;

        emit LicenseStatusChanged(
            licenseId,
            Status.ACTIVE,
            Status.SUSPENDED,
            msg.sender,
            block.timestamp
        );
    }

    function restoreLicense(
        uint256 licenseId
    )
        external
        onlyPublisher
    {
        License storage license = licenses[licenseId];

        require(
            license.owner != address(0),
            "License does not exist"
        );

        // Chỉ Publisher đã phát hành License
        // mới được restore License đó.
        require(
            license.issuer == msg.sender,
            "Not license issuer"
        );

        require(
            license.status == Status.SUSPENDED,
            "License not suspended"
        );

        license.status = Status.ACTIVE;

        emit LicenseStatusChanged(
            licenseId,
            Status.SUSPENDED,
            Status.ACTIVE,
            msg.sender,
            block.timestamp
        );
    }

    function revokeLicense(
        uint256 licenseId
    )
        external
        onlyPublisher
    {
        License storage license = licenses[licenseId];

        require(
            license.owner != address(0),
            "License does not exist"
        );

        // Chỉ Publisher đã phát hành License
        // mới được revoke License đó.
        require(
            license.issuer == msg.sender,
            "Not license issuer"
        );

        require(
            license.status == Status.ACTIVE || license.status == Status.SUSPENDED,
            "License already revoked"
        );

        Status oldStatus = license.status;

        license.status = Status.REVOKED;

        emit LicenseStatusChanged(
            licenseId,
            oldStatus,
            Status.REVOKED,
            msg.sender,
            block.timestamp
        );
    }

    // =========================
    // XÁC MINH LICENSE
    // =========================

    function verifyLicense(
        uint256 licenseId,
        address owner
    )
        external
        view
        returns (bool)
    {
        License storage license = licenses[licenseId];

        // 1. License phải tồn tại.
        if (license.owner == address(0)) {
            return false;
        }

        // 2. Owner phải đúng.
        if (license.owner != owner) {
            return false;
        }

        // 3. License phải ACTIVE.
        if (license.status != Status.ACTIVE) {
            return false;
        }

        // 4. Kiểm tra expiry.
        if (
            license.expiry != 0 &&
            block.timestamp >= license.expiry
        ) {
            return false;
        }

        // 5. Nếu là Professional License,
        // kiểm tra toàn bộ Qualification dependency.
        if (license.requiredQualificationIds.length > 0) {
            return _checkRequirements(
                license.owner,
                license.requiredQualificationIds
            );
        }

        // Qualification không có dependency.
        return true;
    }
}
