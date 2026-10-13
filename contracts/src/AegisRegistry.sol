// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AegisRegistry {
    struct RiskRecord {
        uint8 score;
        uint64 expiresAt;
        bytes32 evidenceHash;
        uint8 decision;
    }

    // Administration
    address public owner;
    address public pendingOwner;
    address public oracle;
    mapping(address => RiskRecord) private records;

    error Unauthorized();
    error InvalidRecord();
    error ZeroAddress();
    event AccessRequested(address indexed wallet, bytes32 indexed resourceId);
    event RiskUpdated(address indexed wallet, uint8 score, uint64 expiresAt, uint8 decision, bytes32 evidenceHash);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event OwnershipProposed(address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOracle) {
        if (initialOracle == address(0)) revert ZeroAddress();
        owner = msg.sender;
        oracle = initialOracle;
    }

    function setOracle(address nextOracle) external {
        if (msg.sender != owner) revert Unauthorized();
        if (nextOracle == address(0)) revert ZeroAddress();
        emit OracleUpdated(oracle, nextOracle);
        oracle = nextOracle;
    }

    function proposeOwner(address nextOwner) external {
        if (msg.sender != owner) revert Unauthorized();
        if (nextOwner == address(0)) revert ZeroAddress();
        pendingOwner = nextOwner;
        emit OwnershipProposed(nextOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }

    // Minimal evidence registry
    function requestAccess(bytes32 resourceId) external {
        emit AccessRequested(msg.sender, resourceId);
    }

    function updateRisk(address wallet, uint8 score, uint64 expiresAt, bytes32 evidenceHash, uint8 decision) external {
        if (msg.sender != oracle) revert Unauthorized();
        if (wallet == address(0)) revert ZeroAddress();
        if (score > 100 || decision > 3 || expiresAt <= block.timestamp || evidenceHash == bytes32(0)) {
            revert InvalidRecord();
        }
        records[wallet] = RiskRecord(score, expiresAt, evidenceHash, decision);
        emit RiskUpdated(wallet, score, expiresAt, decision, evidenceHash);
    }

    function getRisk(address wallet) external view returns (RiskRecord memory) {
        return records[wallet];
    }

    function isAllowed(address wallet) external view returns (bool) {
        RiskRecord memory record = records[wallet];
        return record.expiresAt > block.timestamp && record.decision == 0;
    }
}
