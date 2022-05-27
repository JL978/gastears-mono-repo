//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Ownable.sol";

contract GasClaim is Ownable {
    uint256 public availableFunds = 0;
    uint256 public externalFunds = 0;
    uint256 public timeBetweenClaim;

    mapping(address => uint256) public wallets;

    constructor(uint256 _timeBetweenClaim) {
        timeBetweenClaim = _timeBetweenClaim;
    }

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

    function claim(address _address, uint256 _amount) public onlyOwner {
        require(wallets[_address] > 0, "Address not available");
        bool sufficientFunds = availableFunds >= _amount;
        require(sufficientFunds, "Not enough funds");
        require(
            block.timestamp - wallets[_address] >= timeBetweenClaim,
            "Claim too soon"
        );
        availableFunds -= _amount;
        wallets[_address] = block.timestamp;
        payable(_address).transfer(_amount);
    }

    function setTimeBetweenClaim(uint256 _timeBetweenClaim) public onlyOwner {
        timeBetweenClaim = _timeBetweenClaim;
    }
}
