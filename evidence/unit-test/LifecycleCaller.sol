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
}
