// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract ProfessionalLicenseRegistry {

    // =========================
    // ENUMS
    // =========================

    enum Status {
        ACTIVE,
        INACTIVE
    }

    // =========================
    // DATA MODEL
    // =========================

    struct License {
        address owner;
        address issuer;
        uint256 issueDate;
        uint256 expiry;
        Status status;
        uint256[] requiredQualificationIds;
    }

    // =========================
    // STORAGE
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
    // CONSTRUCTOR
    // =========================

    constructor() {
        admin = msg.sender;
    }

    // =========================
    // EVENTS
    // =========================

    event LicenseIssued(
        uint256 indexed licenseId,
        address indexed owner,
        address indexed issuer
    );

    event LicenseStatusChanged(
        uint256 indexed licenseId,
        Status oldStatus,
        Status newStatus,
        address indexed actor
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
    // MODIFIERS
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
    // PUBLISHER AUTHORIZATION
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
    // ISSUE LICENSE
    // =========================

    function issueLicense(
        address owner,
        uint256 expiry,
        uint256[] calldata requiredQualificationIds
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

        license.owner = owner;
        license.issuer = msg.sender;
        license.issueDate = block.timestamp;
        license.expiry = expiry;
        license.status = Status.ACTIVE;

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
            msg.sender
        );
    }

    // =========================
    // QUALIFICATION CHECK
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
    // REQUIREMENT CHECK
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
    // PRE-CHECK REQUIREMENTS
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
    // LICENSE LIFECYCLE
    // =========================

    function deactivateLicense(
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
        // mới được deactivate License đó.
        require(
            license.issuer == msg.sender,
            "Not license issuer"
        );

        require(
            license.status == Status.ACTIVE,
            "License already inactive"
        );

        Status oldStatus = license.status;

        license.status = Status.INACTIVE;

        emit LicenseStatusChanged(
            licenseId,
            oldStatus,
            Status.INACTIVE,
            msg.sender
        );
    }

    function reactivateLicense(
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
        // mới được reactivate License đó.
        require(
            license.issuer == msg.sender,
            "Not license issuer"
        );

        require(
            license.status == Status.INACTIVE,
            "License already active"
        );

        Status oldStatus = license.status;

        license.status = Status.ACTIVE;

        emit LicenseStatusChanged(
            licenseId,
            oldStatus,
            Status.ACTIVE,
            msg.sender
        );
    }

    // =========================
    // LICENSE VERIFICATION
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