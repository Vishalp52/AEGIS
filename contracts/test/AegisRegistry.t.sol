// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {AegisRegistry} from "../src/AegisRegistry.sol";

interface Vm {
    function prank(address) external;
    function warp(uint256) external;
    function expectRevert(bytes4) external;
}

contract AegisRegistryTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    AegisRegistry registry;
    address oracle = address(0xA11CE);
    address wallet = address(0xB0B);
    bytes32 evidence = keccak256("private evidence");

    function setUp() public { registry = new AegisRegistry(oracle); }

    function testUnknownWalletIsDenied() public view { require(!registry.isAllowed(wallet)); }

    function testAuthorizedUpdateAndExpiry() public {
        vm.warp(1000);
        vm.prank(oracle);
        registry.updateRisk(wallet, 20, 1600, evidence, 0);
        require(registry.isAllowed(wallet));
        AegisRegistry.RiskRecord memory record = registry.getRisk(wallet);
        require(record.score == 20 && record.evidenceHash == evidence && record.expiresAt == 1600);
        vm.warp(1600);
        require(!registry.isAllowed(wallet));
    }

    function testOnlyOracleCanWrite() public {
        vm.expectRevert(AegisRegistry.Unauthorized.selector);
        registry.updateRisk(wallet, 10, uint64(block.timestamp + 600), evidence, 0);
    }

    function testHeldDecisionsCannotGrantAccess() public {
        for (uint8 decision = 1; decision <= 3; decision++) {
            vm.prank(oracle);
            registry.updateRisk(wallet, 80, uint64(block.timestamp + 600), evidence, decision);
            require(!registry.isAllowed(wallet));
        }
    }

    function testInvalidScoreRejected() public {
        vm.expectRevert(AegisRegistry.InvalidRecord.selector);
        vm.prank(oracle);
        registry.updateRisk(wallet, 101, uint64(block.timestamp + 600), evidence, 0);
    }

    function testInvalidDecisionRejected() public {
        vm.expectRevert(AegisRegistry.InvalidRecord.selector);
        vm.prank(oracle);
        registry.updateRisk(wallet, 10, uint64(block.timestamp + 600), evidence, 4);
    }

    function testEmptyEvidenceRejected() public {
        vm.expectRevert(AegisRegistry.InvalidRecord.selector);
        vm.prank(oracle);
        registry.updateRisk(wallet, 10, uint64(block.timestamp + 600), bytes32(0), 0);
    }

    function testExpiredRecordRejected() public {
        vm.expectRevert(AegisRegistry.InvalidRecord.selector);
        vm.prank(oracle);
        registry.updateRisk(wallet, 10, uint64(block.timestamp), evidence, 0);
    }

    function testOracleRotationRevokesOldOracle() public {
        registry.setOracle(address(this));
        vm.expectRevert(AegisRegistry.Unauthorized.selector);
        vm.prank(oracle);
        registry.updateRisk(wallet, 10, uint64(block.timestamp + 600), evidence, 0);
        registry.updateRisk(wallet, 10, uint64(block.timestamp + 600), evidence, 0);
    }

    function testOwnershipRequiresAcceptance() public {
        registry.proposeOwner(wallet);
        require(registry.owner() == address(this));
        vm.prank(wallet);
        registry.acceptOwnership();
        require(registry.owner() == wallet);
        vm.expectRevert(AegisRegistry.Unauthorized.selector);
        registry.setOracle(address(this));
    }

    function testZeroOracleRejected() public {
        vm.expectRevert(AegisRegistry.ZeroAddress.selector);
        registry.setOracle(address(0));
    }

    function testFuzzValidRecords(uint8 score, uint8 decision, uint32 ttl) public {
        score = score % 101;
        decision = decision % 4;
        uint64 expiry = uint64(block.timestamp + uint256(ttl) + 1);
        vm.prank(oracle);
        registry.updateRisk(wallet, score, expiry, evidence, decision);
        require(registry.isAllowed(wallet) == (decision == 0));
    }
}
