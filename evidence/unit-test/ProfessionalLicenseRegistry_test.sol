// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "remix_tests.sol";
import "remix_accounts.sol";
import "../ProfessionalLicenseRegistry.sol";


// =========================================================
// TEST SUITE
// =========================================================

contract ProfessionalLicenseRegistryTest {

    address private owner;
    address private otherOwner;


    // =====================================================
    // HELPERS
    // =====================================================

    function _addresses() internal {
        owner = TestsAccounts.getAccount(2);
        otherOwner = TestsAccounts.getAccount(3);
    }


    function _newRegistry()
        internal
        returns (ProfessionalLicenseRegistry registry)
    {
        registry = new ProfessionalLicenseRegistry();

        // Test contract là publisher hợp lệ.
        registry.registerPublisher(address(this));
    }


    function _issueQualification(
        ProfessionalLicenseRegistry registry
    )
        internal
        returns (uint256)
    {
        uint256[] memory noRequirements =
            new uint256[](0);

        return registry.issueLicense(
            owner,
            0,
            noRequirements
        );
    }


    function _issueProfessionalLicense(
        ProfessionalLicenseRegistry registry,
        uint256 qualificationId
    )
        internal
        returns (uint256)
    {
        uint256[] memory requirements =
            new uint256[](1);

        requirements[0] = qualificationId;

        return registry.issueLicense(
            owner,
            0,
            requirements
        );
    }


    // =====================================================
    // 01 + 02. DEPLOYMENT / PUBLISHER AUTHORIZATION
    // =====================================================

    function testDeploymentAndPublisherAuthorization()
        public
    {
        ProfessionalLicenseRegistry registry =
            new ProfessionalLicenseRegistry();

        Assert.equal(
            registry.admin(),
            address(this),
            "Admin should be deployer"
        );

        Assert.equal(
            registry.publishers(address(this)),
            false,
            "Publisher should initially be false"
        );

        registry.registerPublisher(address(this));

        Assert.equal(
            registry.publishers(address(this)),
            true,
            "Publisher registration failed"
        );
    }


    // =====================================================
    // 03. ISSUE QUALIFICATION
    // =====================================================

    function testIssueQualification()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 qualificationId =
            _issueQualification(registry);

        (
            address qualificationOwner,
            address issuer,
            uint256 issueDate,
            uint256 expiry,
            ProfessionalLicenseRegistry.Status status
        ) = registry.licenses(qualificationId);

        Assert.equal(
            qualificationId,
            uint256(1),
            "First license ID should be 1"
        );

        Assert.equal(
            qualificationOwner,
            owner,
            "Qualification owner incorrect"
        );

        Assert.equal(
            issuer,
            address(this),
            "Qualification issuer incorrect"
        );

        Assert.notEqual(
            issueDate,
            uint256(0),
            "Issue date should be set"
        );

        Assert.equal(
            expiry,
            uint256(0),
            "Qualification should not expire"
        );

        Assert.equal(
            uint8(status),
            uint8(
                ProfessionalLicenseRegistry.Status.ACTIVE
            ),
            "Qualification should be ACTIVE"
        );
    }


    // =====================================================
    // 04. VERIFY QUALIFICATION
    // =====================================================

    function testVerifyQualification()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 qualificationId =
            _issueQualification(registry);

        // Đúng owner
        Assert.equal(
            registry.verifyLicense(
                qualificationId,
                owner
            ),
            true,
            "Qualification should be valid"
        );

        // Sai owner
        Assert.equal(
            registry.verifyLicense(
                qualificationId,
                otherOwner
            ),
            false,
            "Wrong owner should fail"
        );

        // License ID không tồn tại
        Assert.equal(
            registry.verifyLicense(
                999999,
                owner
            ),
            false,
            "Non-existent license should fail"
        );
    }


    // =====================================================
    // 05 + 06. ISSUE + VERIFY PROFESSIONAL LICENSE
    // =====================================================

    function testIssueAndVerifyProfessionalLicense()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 qualificationId =
            _issueQualification(registry);

        uint256 licenseId =
            _issueProfessionalLicense(
                registry,
                qualificationId
            );

        (
            address licenseOwner,
            address issuer,
            uint256 issueDate,
            uint256 expiry,
            ProfessionalLicenseRegistry.Status status
        ) = registry.licenses(licenseId);

        Assert.equal(
            licenseId,
            uint256(2),
            "Professional license ID should be 2"
        );

        Assert.equal(
            licenseOwner,
            owner,
            "License owner incorrect"
        );

        Assert.equal(
            issuer,
            address(this),
            "License issuer incorrect"
        );

        Assert.notEqual(
            issueDate,
            uint256(0),
            "Issue date should be set"
        );

        Assert.equal(
            expiry,
            uint256(0),
            "License should not expire"
        );

        Assert.equal(
            uint8(status),
            uint8(
                ProfessionalLicenseRegistry.Status.ACTIVE
            ),
            "Professional license should be ACTIVE"
        );

        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "Professional license should be valid"
        );

        Assert.equal(
            registry.verifyLicense(
                licenseId,
                otherOwner
            ),
            false,
            "Wrong owner should fail"
        );
    }


    // =====================================================
    // 07. PRE-CHECK REQUIREMENTS
    // =====================================================

    function testRequirementChecks()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 qualificationId =
            _issueQualification(registry);

        uint256[] memory requirements =
            new uint256[](1);

        requirements[0] = qualificationId;

        // Requirement hợp lệ
        Assert.equal(
            registry.checkLicenseRequirements(
                owner,
                requirements
            ),
            true,
            "Valid requirement should pass"
        );

        // Sai owner
        Assert.equal(
            registry.checkLicenseRequirements(
                otherOwner,
                requirements
            ),
            false,
            "Wrong owner requirement should fail"
        );

        // ID không tồn tại
        requirements[0] = 999999;

        Assert.equal(
            registry.checkLicenseRequirements(
                owner,
                requirements
            ),
            false,
            "Non-existent requirement should fail"
        );
    }


    // =====================================================
    // 08 + 09 + 10 + 11
    // QUALIFICATION LIFECYCLE
    // =====================================================

    function testQualificationLifecycleAffectsLicense()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 qualificationId =
            _issueQualification(registry);

        uint256 licenseId =
            _issueProfessionalLicense(
                registry,
                qualificationId
            );

        // Ban đầu hợp lệ
        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "License should initially be valid"
        );

        // ACTIVE -> INACTIVE
        registry.deactivateLicense(
            qualificationId
        );

        (
            ,
            ,
            ,
            ,
            ProfessionalLicenseRegistry.Status statusAfterDeactivate
        ) = registry.licenses(qualificationId);

        Assert.equal(
            uint8(statusAfterDeactivate),
            uint8(
                ProfessionalLicenseRegistry.Status.INACTIVE
            ),
            "Qualification should be INACTIVE"
        );

        // License phải invalid
        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            false,
            "License should be invalid after qualification deactivation"
        );

        // INACTIVE -> ACTIVE
        registry.reactivateLicense(
            qualificationId
        );

        (
            ,
            ,
            ,
            ,
            ProfessionalLicenseRegistry.Status statusAfterReactivate
        ) = registry.licenses(qualificationId);

        Assert.equal(
            uint8(statusAfterReactivate),
            uint8(
                ProfessionalLicenseRegistry.Status.ACTIVE
            ),
            "Qualification should be ACTIVE again"
        );

        // License valid trở lại
        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "License should be valid after reactivation"
        );
    }


    // =====================================================
    // 12. LICENSE EXPIRY
    // =====================================================

    function testLicenseExpiry()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256[] memory noRequirements =
            new uint256[](0);

        // expiry = 0 -> không hết hạn
        uint256 permanentLicense =
            registry.issueLicense(
                owner,
                0,
                noRequirements
            );

        Assert.equal(
            registry.verifyLicense(
                permanentLicense,
                owner
            ),
            true,
            "Zero expiry should mean no expiry"
        );

        // expiry trong tương lai
        uint256 futureExpiry =
            block.timestamp + 100000;

        uint256 futureLicense =
            registry.issueLicense(
                owner,
                futureExpiry,
                noRequirements
            );

        Assert.equal(
            registry.verifyLicense(
                futureLicense,
                owner
            ),
            true,
            "Future expiry should be valid"
        );

        // expiry = 1 -> chắc chắn hết hạn
        uint256 expiredLicense =
            registry.issueLicense(
                owner,
                1,
                noRequirements
            );

        Assert.equal(
            registry.verifyLicense(
                expiredLicense,
                owner
            ),
            false,
            "Expired license should fail"
        );
    }


    // =====================================================
    // 13. QUALIFICATION EXPIRY
    // =====================================================

    function testQualificationExpiry()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256[] memory noRequirements =
            new uint256[](0);

        // Qualification đã hết hạn
        uint256 expiredQualification =
            registry.issueLicense(
                owner,
                1,
                noRequirements
            );

        Assert.equal(
            registry.verifyLicense(
                expiredQualification,
                owner
            ),
            false,
            "Expired qualification should be invalid"
        );

        // Qualification còn hiệu lực
        uint256 validQualification =
            registry.issueLicense(
                owner,
                0,
                noRequirements
            );

        uint256[] memory requirements =
            new uint256[](1);

        requirements[0] = validQualification;

        uint256 licenseId =
            registry.issueLicense(
                owner,
                0,
                requirements
            );

        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "License with valid qualification should pass"
        );
    }


    // =====================================================
    // 14. LICENSE LIFECYCLE
    // =====================================================

    function testLicenseLifecycle()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 licenseId =
            _issueQualification(registry);

        // ACTIVE
        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "License should initially be valid"
        );

        // ACTIVE -> INACTIVE
        registry.deactivateLicense(
            licenseId
        );

        (
            ,
            ,
            ,
            ,
            ProfessionalLicenseRegistry.Status inactiveStatus
        ) = registry.licenses(licenseId);

        Assert.equal(
            uint8(inactiveStatus),
            uint8(
                ProfessionalLicenseRegistry.Status.INACTIVE
            ),
            "License should be INACTIVE"
        );

        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            false,
            "Inactive license should fail"
        );

        // INACTIVE -> ACTIVE
        registry.reactivateLicense(
            licenseId
        );

        (
            ,
            ,
            ,
            ,
            ProfessionalLicenseRegistry.Status activeStatus
        ) = registry.licenses(licenseId);

        Assert.equal(
            uint8(activeStatus),
            uint8(
                ProfessionalLicenseRegistry.Status.ACTIVE
            ),
            "License should be ACTIVE again"
        );

        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "Reactivated license should be valid"
        );
    }



    // =====================================================
    // EXTRA: MULTIPLE REQUIREMENTS
    // =====================================================

    function testMultipleRequirements()
        public
    {
        _addresses();

        ProfessionalLicenseRegistry registry =
            _newRegistry();

        uint256 qualificationA =
            _issueQualification(registry);

        uint256 qualificationB =
            _issueQualification(registry);

        uint256[] memory requirements =
            new uint256[](2);

        requirements[0] = qualificationA;
        requirements[1] = qualificationB;

        // Cả hai hợp lệ
        Assert.equal(
            registry.checkLicenseRequirements(
                owner,
                requirements
            ),
            true,
            "Multiple valid requirements should pass"
        );

        // Issue Professional License
        uint256 licenseId =
            registry.issueLicense(
                owner,
                0,
                requirements
            );

        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            true,
            "License with multiple valid requirements should pass"
        );

        // Deactivate một qualification
        registry.deactivateLicense(
            qualificationA
        );

        // Một requirement fail => toàn bộ license fail
        Assert.equal(
            registry.verifyLicense(
                licenseId,
                owner
            ),
            false,
            "One invalid requirement should invalidate license"
        );
    }
}