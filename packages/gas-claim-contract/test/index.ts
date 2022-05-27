import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, assert } from "chai";
import { MockProvider } from "ethereum-waffle";
import { ethers, waffle } from "hardhat";
import { GasClaim } from "../typechain";

const TEST_CLAIM_TIME = 2 * 1000; // 5s converted to ms
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("Gas Claim Contract", function () {
  let provider: MockProvider, GasClaimContract, gasClaim: GasClaim;
  let ownerSigner: SignerWithAddress, signer0: SignerWithAddress;
  let fundedAmountEqual: (n: number) => Promise<void>, externalAmountEqual: (n: number) => Promise<void>;

  before(async function () {
    provider = waffle.provider;
    [ownerSigner, signer0] = await ethers.getSigners()

    GasClaimContract = await ethers.getContractFactory("GasClaim");
    gasClaim = await GasClaimContract.deploy(TEST_CLAIM_TIME);
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

  it("Add wallets to the contract", async function () {
    await gasClaim.addWallet(signer0.address);
    const walletTime = await gasClaim.wallets(signer0.address);
    const walletTimeNum = walletTime.toNumber()
    const latestBlock = await provider.getBlock("latest");
    expect(walletTimeNum).to.equal(latestBlock.timestamp)
  })

  it("Does not add a wallet that is already in the contract", async function () {
    await expect(gasClaim.addWallet(signer0.address)).to.be.revertedWith("Address already added");
  })

  it("Remove wallets from the contract", async function () {
    await gasClaim.removeWallet(signer0.address);
    const walletTime = await gasClaim.wallets(signer0.address);
    const walletTimeNum = walletTime.toNumber()
    expect(walletTimeNum).to.equal(0)
  })

  it("Does not remove a wallet that is not already in the contract", async function () {
    await expect(gasClaim.removeWallet(signer0.address)).to.be.revertedWith("Address not available");
  })

  it("Does not allow claim if wallet not set", async function () {
    await expect(gasClaim.claim(signer0.address, 10)).to.be.revertedWith("Address not available");
  })

  it("Does not allow claim if there is insufficient funds in contract", async function () {
    await gasClaim.fund({ value: 10 });
    await gasClaim.addWallet(signer0.address);
    await expect(gasClaim.claim(signer0.address, 11)).to.be.revertedWith("Not enough funds");
    await gasClaim.removeWallet(signer0.address)
  })

  it("Does not allow claiming too soon", async function () {
    await gasClaim.addWallet(signer0.address);
    await expect(gasClaim.claim(signer0.address, 10)).to.be.revertedWith("Claim too soon");
  })

  it("Allows claim after the set wait amount and send the correct amount", async function () {
    const beforeClaimBalance = await provider.getBalance(signer0.address)
    const beforeAvailableFunds = await gasClaim.availableFunds()
    this.timeout(TEST_CLAIM_TIME + 3000)
    await wait(TEST_CLAIM_TIME + 2000)
    await gasClaim.claim(signer0.address, 10)
    const afterClaimBalance = await provider.getBalance(signer0.address)
    const afterAvailableFunds = await gasClaim.availableFunds()
    expect(afterClaimBalance.toNumber()).to.equal(beforeClaimBalance.toNumber() + 10)
    expect(afterAvailableFunds.toNumber()).to.equal(beforeAvailableFunds.toNumber() - 10)
  })
});
