// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "remix_tests.sol";
import "remix_accounts.sol";
import "../../ProfessionalLicenseRegistry.sol";
import "./LifecycleCaller.sol";

// =========================================================
// TEST SUITE: ProfessionalLicenseRegistryTest
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
        uint256[] memory noRequirements = new uint256[](0);

        return registry.issueLicense(
            owner,
            "Medical Degree",
            0,
            noRequirements,
            keccak256("medical-degree-metadata")
        );
    }

    function _issueProfessionalLicense(
        ProfessionalLicenseRegistry registry,
        uint256 qualificationId
    )
        internal
        returns (uint256)
    {
        uint256[] memory requirements = new uint256[](1);
        requirements[0] = qualificationId;

        return registry.issueLicense(
            owner,
            "Professional Information Security License",
            0,
            requirements,
            keccak256("professional-license-metadata")
        );
    }

    // =====================================================
    // 01. DEPLOYMENT / PUBLISHER AUTHORIZATION
    // =====================================================

    function testDeploymentAndPublisherAuthorization()
        public
    {
        ProfessionalLicenseRegistry registry = new ProfessionalLicenseRegistry();

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
    // 02. ISSUE QUALIFICATION (ACTIVE)
    // =====================================================

    function testIssueQualification()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationId = _issueQualification(registry);

        (
            string memory credentialName,
            address qualificationOwner,
            address issuer,
            uint256 issueDate,
            uint256 expiry,
            ProfessionalLicenseRegistry.Status status,
            bytes32 metadataHash
        ) = registry.licenses(qualificationId);

        Assert.equal(
            credentialName,
            "Medical Degree",
            "Qualification credential name incorrect"
        );

        Assert.equal(
            metadataHash,
            keccak256("medical-degree-metadata"),
            "Qualification metadata hash incorrect"
        );

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
            uint8(ProfessionalLicenseRegistry.Status.ACTIVE),
            "Qualification should be ACTIVE"
        );
    }

    // =====================================================
    // 03. VERIFY QUALIFICATION
    // =====================================================

    function testVerifyQualification()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationId = _issueQualification(registry);

        // Đúng owner -> valid
        Assert.equal(
            registry.verifyLicense(qualificationId, owner),
            true,
            "Qualification should be valid"
        );

        // Sai owner -> invalid
        Assert.equal(
            registry.verifyLicense(qualificationId, otherOwner),
            false,
            "Wrong owner should fail"
        );

        // Non-existent -> invalid
        Assert.equal(
            registry.verifyLicense(999999, owner),
            false,
            "Non-existent license should fail"
        );
    }

    // =====================================================
    // 04. ISSUE + VERIFY PROFESSIONAL LICENSE
    // =====================================================

    function testIssueAndVerifyProfessionalLicense()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationId = _issueQualification(registry);
        uint256 licenseId = _issueProfessionalLicense(registry, qualificationId);

        (
            string memory credentialName,
            address licenseOwner,
            address issuer,
            uint256 issueDate,
            uint256 expiry,
            ProfessionalLicenseRegistry.Status status,
            bytes32 metadataHash
        ) = registry.licenses(licenseId);

        Assert.equal(
            credentialName,
            "Professional Information Security License",
            "Professional license credential name incorrect"
        );

        Assert.equal(
            metadataHash,
            keccak256("professional-license-metadata"),
            "Professional license metadata hash incorrect"
        );

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
            uint8(ProfessionalLicenseRegistry.Status.ACTIVE),
            "Professional license should be ACTIVE"
        );

        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            true,
            "Professional license should be valid"
        );

        Assert.equal(
            registry.verifyLicense(licenseId, otherOwner),
            false,
            "Wrong owner should fail"
        );
    }

    // =====================================================
    // 05. PRE-CHECK REQUIREMENTS
    // =====================================================

    function testRequirementChecks()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationId = _issueQualification(registry);

        uint256[] memory requirements = new uint256[](1);
        requirements[0] = qualificationId;

        // Requirement hợp lệ
        Assert.equal(
            registry.checkLicenseRequirements(owner, requirements),
            true,
            "Valid requirement should pass"
        );

        // Sai owner
        Assert.equal(
            registry.checkLicenseRequirements(otherOwner, requirements),
            false,
            "Wrong owner requirement should fail"
        );

        // ID không tồn tại
        requirements[0] = 999999;
        Assert.equal(
            registry.checkLicenseRequirements(owner, requirements),
            false,
            "Non-existent requirement should fail"
        );
    }

    // =====================================================
    // 06. STATE MACHINE: ACTIVE -> SUSPENDED -> ACTIVE
    // =====================================================

    function testSuspendAndRestoreLifecycle()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 licenseId = _issueQualification(registry);

        // 1. Initial state: ACTIVE
        (,,,,, ProfessionalLicenseRegistry.Status s1,) = registry.licenses(licenseId);
        Assert.equal(
            uint8(s1),
            uint8(ProfessionalLicenseRegistry.Status.ACTIVE),
            "Initial status must be ACTIVE"
        );
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            true,
            "ACTIVE license must be valid"
        );

        // 2. ACTIVE -> SUSPENDED
        registry.suspendLicense(licenseId);

        (,,,,, ProfessionalLicenseRegistry.Status s2,) = registry.licenses(licenseId);
        Assert.equal(
            uint8(s2),
            uint8(ProfessionalLicenseRegistry.Status.SUSPENDED),
            "Status must be SUSPENDED"
        );
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            false,
            "SUSPENDED license must be invalid upon verification"
        );

        // 3. SUSPENDED -> ACTIVE
        registry.restoreLicense(licenseId);

        (,,,,, ProfessionalLicenseRegistry.Status s3,) = registry.licenses(licenseId);
        Assert.equal(
            uint8(s3),
            uint8(ProfessionalLicenseRegistry.Status.ACTIVE),
            "Status must be restored to ACTIVE"
        );
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            true,
            "Restored license must be valid again"
        );
    }

    // =====================================================
    // 07. STATE MACHINE: ACTIVE -> REVOKED (TERMINAL)
    // =====================================================

    function testRevokeFromActive()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 licenseId = _issueQualification(registry);

        // ACTIVE -> REVOKED
        registry.revokeLicense(licenseId);

        (,,,,, ProfessionalLicenseRegistry.Status s,) = registry.licenses(licenseId);
        Assert.equal(
            uint8(s),
            uint8(ProfessionalLicenseRegistry.Status.REVOKED),
            "Status must be REVOKED"
        );
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            false,
            "REVOKED license must be invalid"
        );
    }

    // =====================================================
    // 08. STATE MACHINE: SUSPENDED -> REVOKED (TERMINAL)
    // =====================================================

    function testRevokeFromSuspended()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 licenseId = _issueQualification(registry);

        registry.suspendLicense(licenseId);
        registry.revokeLicense(licenseId);

        (,,,,, ProfessionalLicenseRegistry.Status s,) = registry.licenses(licenseId);
        Assert.equal(
            uint8(s),
            uint8(ProfessionalLicenseRegistry.Status.REVOKED),
            "Status must be REVOKED from SUSPENDED"
        );
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            false,
            "REVOKED license must be invalid"
        );
    }

    // =====================================================
    // 09. REISSUE AFTER REVOCATION CREATES NEW LICENSE ID
    // =====================================================

    function testReissueAfterRevocation()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        // Issue license 1
        uint256 oldLicenseId = _issueQualification(registry);
        Assert.equal(oldLicenseId, uint256(1), "Old license ID should be 1");

        // Revoke license 1
        registry.revokeLicense(oldLicenseId);

        // Reissue creates new license with sequential ID = 2
        uint256 newLicenseId = _issueQualification(registry);
        Assert.equal(newLicenseId, uint256(2), "Reissued license ID must be new sequential ID (2)");

        // Check old remains REVOKED and invalid
        (,,,,, ProfessionalLicenseRegistry.Status oldStatus,) = registry.licenses(oldLicenseId);
        Assert.equal(
            uint8(oldStatus),
            uint8(ProfessionalLicenseRegistry.Status.REVOKED),
            "Old license must remain REVOKED"
        );
        Assert.equal(
            registry.verifyLicense(oldLicenseId, owner),
            false,
            "Old revoked license must remain invalid"
        );

        // Check new is ACTIVE and valid
        (,,,,, ProfessionalLicenseRegistry.Status newStatus,) = registry.licenses(newLicenseId);
        Assert.equal(
            uint8(newStatus),
            uint8(ProfessionalLicenseRegistry.Status.ACTIVE),
            "New reissued license must be ACTIVE"
        );
        Assert.equal(
            registry.verifyLicense(newLicenseId, owner),
            true,
            "New reissued license must be valid"
        );
    }

    // =====================================================
    // 10. QUALIFICATION LIFECYCLE AFFECTS PROFESSIONAL LICENSE
    // =====================================================

    function testQualificationLifecycleAffectsLicense()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationId = _issueQualification(registry);
        uint256 licenseId = _issueProfessionalLicense(registry, qualificationId);

        // Initial: valid
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            true,
            "License should initially be valid"
        );

        // Suspend qualification -> Professional License becomes invalid
        registry.suspendLicense(qualificationId);
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            false,
            "License must be invalid when required qualification is suspended"
        );

        // Restore qualification -> Professional License valid again
        registry.restoreLicense(qualificationId);
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            true,
            "License must be valid again after qualification is restored"
        );

        // Revoke qualification -> Professional License permanently invalid
        registry.revokeLicense(qualificationId);
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            false,
            "License must be permanently invalid after qualification is revoked"
        );
    }

    // =====================================================
    // 11. LICENSE & QUALIFICATION EXPIRY
    // =====================================================

    function testLicenseExpiry()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();
        uint256[] memory noRequirements = new uint256[](0);

        // expiry = 0 -> không hết hạn
        uint256 permanentLicense = registry.issueLicense(
            owner,
            "Permanent Qualification",
            0,
            noRequirements,
            keccak256("permanent-metadata")
        );
        Assert.equal(
            registry.verifyLicense(permanentLicense, owner),
            true,
            "Zero expiry should mean no expiry"
        );

        // expiry trong tương lai -> valid
        uint256 futureExpiry = block.timestamp + 100000;
        uint256 futureLicense = registry.issueLicense(
            owner,
            "Future Qualification",
            futureExpiry,
            noRequirements,
            keccak256("future-metadata")
        );
        Assert.equal(
            registry.verifyLicense(futureLicense, owner),
            true,
            "Future expiry should be valid"
        );

        // expiry = 1 -> expired (invalid)
        uint256 expiredLicense = registry.issueLicense(
            owner,
            "Expired Qualification",
            1,
            noRequirements,
            keccak256("expired-metadata")
        );
        Assert.equal(
            registry.verifyLicense(expiredLicense, owner),
            false,
            "Expired license should fail verification"
        );
    }

    function testQualificationExpiry()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();
        uint256[] memory noRequirements = new uint256[](0);

        uint256 expiredQualification = registry.issueLicense(
            owner,
            "Expired Qualification",
            1,
            noRequirements,
            keccak256("expired-qual-metadata")
        );

        uint256[] memory requirements = new uint256[](1);
        requirements[0] = expiredQualification;

        // Pre-check fails
        Assert.equal(
            registry.checkLicenseRequirements(owner, requirements),
            false,
            "Pre-check with expired qualification should fail"
        );
    }

    // =====================================================
    // 12. MULTIPLE REQUIREMENTS
    // =====================================================

    function testMultipleRequirements()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationA = _issueQualification(registry);
        uint256 qualificationB = _issueQualification(registry);

        uint256[] memory requirements = new uint256[](2);
        requirements[0] = qualificationA;
        requirements[1] = qualificationB;

        Assert.equal(
            registry.checkLicenseRequirements(owner, requirements),
            true,
            "Multiple valid requirements should pass"
        );

        uint256 licenseId = registry.issueLicense(
            owner,
            "Multiple Qualification License",
            0,
            requirements,
            keccak256("multi-qual-metadata")
        );

        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            true,
            "License with multiple valid requirements should pass"
        );

        // Suspend one qualification -> license fails
        registry.suspendLicense(qualificationA);
        Assert.equal(
            registry.verifyLicense(licenseId, owner),
            false,
            "One suspended requirement must invalidate whole license"
        );
    }

    // =====================================================
    // 13. PROFESSIONAL LICENSE CANNOT BE A REQUIREMENT
    // =====================================================

    function testProfessionalLicenseCannotBeRequiredQualification()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 qualificationId = _issueQualification(registry);
        uint256 professionalLicenseId = _issueProfessionalLicense(registry, qualificationId);

        uint256[] memory invalidRequirements = new uint256[](1);
        invalidRequirements[0] = professionalLicenseId;

        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.issueLicense.selector,
                owner,
                "License Depending On Professional License",
                0,
                invalidRequirements,
                keccak256("invalid-dependency-metadata")
            )
        );

        Assert.equal(
            success,
            false,
            "Professional License must not be accepted as required qualification"
        );
    }

    // =====================================================
    // 14. NEGATIVE: ACCESS CONTROL (NON-ISSUER / OTHER PUBLISHER)
    // =====================================================

    function testPublisherOtherThanIssuerCannotChangeLifecycle()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 licenseId = _issueQualification(registry);

        LifecycleCaller otherPublisher = new LifecycleCaller(registry, licenseId);
        registry.registerPublisher(address(otherPublisher));

        // Other publisher tries suspend -> REVERT
        Assert.equal(
            otherPublisher.trySuspend(),
            false,
            "Publisher other than issuer must not suspend license"
        );

        // Suspend legally by issuer
        registry.suspendLicense(licenseId);

        // Other publisher tries restore -> REVERT
        Assert.equal(
            otherPublisher.tryRestore(),
            false,
            "Publisher other than issuer must not restore license"
        );

        // Other publisher tries revoke -> REVERT
        Assert.equal(
            otherPublisher.tryRevoke(),
            false,
            "Publisher other than issuer must not revoke license"
        );
    }

    function testNonPublisherCannotChangeLifecycle()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 licenseId = _issueQualification(registry);

        // Non-publisher caller
        LifecycleCaller nonPublisher = new LifecycleCaller(registry, licenseId);

        Assert.equal(
            nonPublisher.trySuspend(),
            false,
            "Non-publisher must not suspend license"
        );

        Assert.equal(
            nonPublisher.tryRestore(),
            false,
            "Non-publisher must not restore license"
        );

        Assert.equal(
            nonPublisher.tryRevoke(),
            false,
            "Non-publisher must not revoke license"
        );
    }

    // =====================================================
    // 15. NEGATIVE: DISALLOWED STATE TRANSITIONS & GUARDS
    // =====================================================

    function testDisallowedStateTransitions()
        public
    {
        _addresses();
        ProfessionalLicenseRegistry registry = _newRegistry();

        uint256 licenseId = _issueQualification(registry);

        // 1. Restore from ACTIVE -> REVERT
        (bool restoreActiveSuccess, ) = address(registry).call(
            abi.encodeWithSelector(registry.restoreLicense.selector, licenseId)
        );
        Assert.equal(
            restoreActiveSuccess,
            false,
            "restoreLicense from ACTIVE must revert"
        );

        // 2. Suspend from ACTIVE -> SUCCESS
        registry.suspendLicense(licenseId);

        // 3. Suspend from SUSPENDED -> REVERT
        (bool suspendSuspendedSuccess, ) = address(registry).call(
            abi.encodeWithSelector(registry.suspendLicense.selector, licenseId)
        );
        Assert.equal(
            suspendSuspendedSuccess,
            false,
            "suspendLicense from SUSPENDED must revert"
        );

        // 4. Revoke from SUSPENDED -> SUCCESS
        registry.revokeLicense(licenseId);

        // 5. Revoke from REVOKED -> REVERT
        (bool revokeRevokedSuccess, ) = address(registry).call(
            abi.encodeWithSelector(registry.revokeLicense.selector, licenseId)
        );
        Assert.equal(
            revokeRevokedSuccess,
            false,
            "revokeLicense from REVOKED must revert"
        );

        // 6. Restore from REVOKED -> REVERT
        (bool restoreRevokedSuccess, ) = address(registry).call(
            abi.encodeWithSelector(registry.restoreLicense.selector, licenseId)
        );
        Assert.equal(
            restoreRevokedSuccess,
            false,
            "restoreLicense from REVOKED must revert"
        );

        // 7. Suspend from REVOKED -> REVERT
        (bool suspendRevokedSuccess, ) = address(registry).call(
            abi.encodeWithSelector(registry.suspendLicense.selector, licenseId)
        );
        Assert.equal(
            suspendRevokedSuccess,
            false,
            "suspendLicense from REVOKED must revert"
        );

        // 8. Lifecycle calls on non-existent license -> REVERT
        (bool nonExistentSuspend, ) = address(registry).call(
            abi.encodeWithSelector(registry.suspendLicense.selector, 999999)
        );
        Assert.equal(
            nonExistentSuspend,
            false,
            "suspendLicense on non-existent license must revert"
        );

        (bool nonExistentRestore, ) = address(registry).call(
            abi.encodeWithSelector(registry.restoreLicense.selector, 999999)
        );
        Assert.equal(
            nonExistentRestore,
            false,
            "restoreLicense on non-existent license must revert"
        );

        (bool nonExistentRevoke, ) = address(registry).call(
            abi.encodeWithSelector(registry.revokeLicense.selector, 999999)
        );
        Assert.equal(
            nonExistentRevoke,
            false,
            "revokeLicense on non-existent license must revert"
        );
    }
}