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

    mapping(uint256 => License) public licenses;

    mapping(address => bool) public publishers;

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
    // ISSUANCE
    // =========================

    function checkLicenseRequirements(
        address owner,
        uint256[] calldata requiredQualificationIds
    )
        external
        view
        returns (bool)
    {
        // TODO
    }

    function issueLicense(
        address owner,
        uint256 expiry,
        uint256[] calldata requiredQualificationIds
    )
        external
    {
        // TODO
    }

    // =========================
    // LIFECYCLE
    // =========================

    function deactivateLicense(
        uint256 licenseId
    )
        external
    {
        // TODO
    }

    function reactivateLicense(
        uint256 licenseId
    )
        external
    {
        // TODO
    }

    // =========================
    // VERIFICATION
    // =========================

    function verifyLicense(
        uint256 licenseId
    )
        external
        view
        returns (bool)
    {
        // TODO
    }

    // =========================
    // INTERNAL
    // =========================

    function _checkRequirements(
        address owner,
        uint256[] memory requiredQualificationIds
    )
        internal
        view
        returns (bool)
    {
        // TODO
    }
}