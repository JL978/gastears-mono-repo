//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Ownable.sol";

contract GasClaim is Ownable {
    uint256 public availableFunds = 0;
    uint256 public externalFunds = 0;
    mapping(address => uint256) public wallets;

    receive() external payable {
        externalFunds += msg.value;
    }

    function fund() public payable onlyOwner {
        availableFunds += msg.value;
    }

    function withdrawFunds() public payable onlyOwner {
        availableFunds = 0;
        payable(msg.sender).transfer(availableFunds);
    }

    function withdrawAll() public payable onlyOwner {
        availableFunds = 0;
        externalFunds = 0;
        payable(msg.sender).transfer(address(this).balance);
    }

    function addWallet(address _address) public onlyOwner {
        require(wallets[_address] == 0, "Address already added");
        wallets[_address] = block.timestamp;
    }

    function removeWallet(address _address) public onlyOwner {
        require(wallets[_address] > 0, "Address not available");
        delete wallets[_address];
    }
}
