// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "../../ProfessionalLicenseRegistry.sol";

contract LifecycleCaller {
    ProfessionalLicenseRegistry private registry;
    uint256 private licenseId;

    constructor(
        ProfessionalLicenseRegistry registryAddress,
        uint256 licenseIdValue
    ) {
        registry = registryAddress;
        licenseId = licenseIdValue;
    }

    // Gọi các hàm của hợp đồng từ một địa chỉ caller khác để kiểm thử phân quyền.
    function trySuspend()
        external
        returns (bool)
    {
        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.suspendLicense.selector,
                licenseId
            )
        );
        return success;
    }

    function tryRestore()
        external
        returns (bool)
    {
        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.restoreLicense.selector,
                licenseId
            )
        );
        return success;
    }

    function tryRevoke()
        external
        returns (bool)
    {
        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.revokeLicense.selector,
                licenseId
            )
        );
        return success;
    }

    function tryRegisterPublisher(
        address publisher
    )
        external
        returns (bool)
    {
        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.registerPublisher.selector,
                publisher
            )
        );
        return success;
    }

    function tryRemovePublisher(
        address publisher
    )
        external
        returns (bool)
    {
        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.removePublisher.selector,
                publisher
            )
        );
        return success;
    }

    function tryIssueLicense(
        address licenseOwner,
        string calldata credentialName,
        uint256 expiry,
        uint256[] calldata requiredQualificationIds,
        bytes32 metadataHash
    )
        external
        returns (bool)
    {
        (bool success, ) = address(registry).call(
            abi.encodeWithSelector(
                registry.issueLicense.selector,
                licenseOwner,
                credentialName,
                expiry,
                requiredQualificationIds,
                metadataHash
            )
        );
        return success;
    }
}
