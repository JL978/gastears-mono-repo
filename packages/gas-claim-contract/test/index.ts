import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, assert } from "chai";
import { MockProvider } from "ethereum-waffle";
import { ethers, waffle } from "hardhat";
import { GasClaim } from "../typechain";

describe("Gas Claim Contract", function () {
  let provider: MockProvider, GasClaimContract, gasClaim: GasClaim;
  let ownerSigner: SignerWithAddress, signer0: SignerWithAddress;
  let fundedAmountEqual: (n: number) => Promise<void>, externalAmountEqual: (n: number) => Promise<void>;

  before(async function () {
    provider = waffle.provider;
    [ownerSigner, signer0] = await ethers.getSigners()

    GasClaimContract = await ethers.getContractFactory("GasClaim");
    gasClaim = await GasClaimContract.deploy();
    await gasClaim.deployed();

    fundedAmountEqual = async () => {
      expect(await gasClaim.availableFunds()).to.equal(0);
    }

    externalAmountEqual = async () => {
      expect(await gasClaim.externalFunds()).to.equal(0);
    }
  })

  it("Should initialize to have 0 funds", async function () {
    fundedAmountEqual(0)
  })

  it("Fund the correct amount", async function () {
    await gasClaim.fund({ value: 10 });
    fundedAmountEqual(10)
  });

  it("Accept external fundings", async function () {
    const externalFundingTransaction = {
      to: gasClaim.address,
      value: "0xA",
      gasLimit: "0x100000",
      gasPrice: "0x1000000000"
    }
    await signer0.sendTransaction(externalFundingTransaction)

    externalAmountEqual(10)
  })

  it("withdrawFunds should only withdraw the funded amount", async function () {
    await gasClaim.withdrawFunds();

    fundedAmountEqual(0)
    externalAmountEqual(10)
  })

  it("withdrawAll should withdraw everything in the contract", async function () {
    await gasClaim.withdrawAll();
    expect(await provider.getBalance(gasClaim.address)).to.equal(0);
    fundedAmountEqual(0)
    externalAmountEqual(0)
  })
});
