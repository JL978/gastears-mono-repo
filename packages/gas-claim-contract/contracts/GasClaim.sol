//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GasClaim {
    uint256 public availableFunds = 0;

    // constructor() {
    //     greeting = _greeting;
    // }

    function fund(uint256 _amount) public returns (uint256) {
        availableFunds += _amount;
        return availableFunds;
    }

    function withdraw(uint256 _amount) public returns (uint256) {
        int256 leftover = int256(availableFunds) - int256(_amount);
        require(
            leftover >= 0,
            "Trying to withdraw more tokens than the contract has"
        );
        availableFunds -= _amount;
        return availableFunds;
    }
}
