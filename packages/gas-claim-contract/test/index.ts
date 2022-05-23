import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { GasClaim } from "../typechain";

describe("Gas Claim Contract", function () {
  let GasClaimContract, gasClaim: GasClaim;

  before(async function () {
    GasClaimContract = await ethers.getContractFactory("GasClaim");
    gasClaim = await GasClaimContract.deploy();
    await gasClaim.deployed();
  })

  it("Should initialize to have 0 funds and fund the correct amount", async function () {
    await gasClaim.fund(10);
    const availableFunds = await gasClaim.availableFunds()
    expect(availableFunds).to.equal(10);
  });

  it("Should not allow to withdraw more than the contract has", async function () {
    try {
      await gasClaim.withdraw(11);
      assert.fail("The transaction should have thrown an error");
    }
    catch (err) {
    }
  })

  it("Should withdraw the correct amount", async function () {
    await gasClaim.withdraw(10);
    const availableFunds = await gasClaim.availableFunds()
    expect(availableFunds).to.equal(0)
  })
});
