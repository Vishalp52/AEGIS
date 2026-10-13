// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {AegisRegistry} from "../src/AegisRegistry.sol";

interface VmDeploy {
    function envAddress(string calldata name) external returns (address);
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract Deploy {
    VmDeploy constant vm = VmDeploy(address(uint160(uint256(keccak256("hevm cheat code")))));
    function run() external returns (AegisRegistry registry) {
        require(block.chainid == 10143 || block.chainid == 31337, "Testnet or local deployment only");
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        vm.startBroadcast();
        registry = new AegisRegistry(oracle);
        vm.stopBroadcast();
    }
}
