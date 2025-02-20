const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Testament", function () {
    async function deployTestamentFixture() {
      const ONE_DAY_IN_SECS = 24 * 60 * 60;
      const unlockTime = (await time.latest()) + ONE_DAY_IN_SECS;
  
      // Get signers
      const [owner, heir, notary, otherAccount] = await ethers.getSigners();
  
      // Deploy the contract
      const Testament = await ethers.getContractFactory("Testament");
      const testament = await Testament.deploy(
        heir.address,
        notary.address,
        "QmHash123456789", // Example IPFS hash
        ONE_DAY_IN_SECS
      );
  
      return { testament, owner, heir, notary, otherAccount, unlockTime };
    }
  
    describe("Deployment", function () {
      it("Should set the correct owner, heir, and notary", async function () {
        const { testament, owner, heir, notary } = await loadFixture(
          deployTestamentFixture
        );
  
        expect(await testament.owner()).to.equal(owner.address);
        expect(await testament.heir()).to.equal(heir.address);
        expect(await testament.notary()).to.equal(notary.address);
      });
  
      it("Should set the correct unlock time", async function () {
        const { testament, unlockTime } = await loadFixture(
          deployTestamentFixture
        );
  
        expect(await testament.unlockTime()).to.be.closeTo(unlockTime, 10);
      });
    });
  
    describe("Confirming Death", function () {
      it("Should allow only the notary to confirm death", async function () {
        const { testament, notary } = await loadFixture(deployTestamentFixture);
  
        await expect(testament.connect(notary).confirmDeath())
          .to.emit(testament, "DeathConfirmed")
          .withArgs(notary.address);
  
        expect(await testament.isDeceased()).to.equal(true);
      });
  
      it("Should reject death confirmation by non-notary accounts", async function () {
        const { testament, owner, heir } = await loadFixture(
          deployTestamentFixture
        );
  
        await expect(testament.connect(owner).confirmDeath()).to.be.revertedWith(
          "Vous n'etes pas le notaire."
        );
  
        await expect(testament.connect(heir).confirmDeath()).to.be.revertedWith(
          "Vous n'etes pas le notaire."
        );
      });
    });
  
    describe("Unlocking the Testament", function () {
      it("Should allow the heir to unlock the testament after the unlock period", async function () {
        const { testament, heir, notary, unlockTime } = await loadFixture(
          deployTestamentFixture
        );
  
        await testament.connect(notary).confirmDeath();
        await time.increaseTo(unlockTime);
  
        await expect(testament.connect(heir).unlockTestament())
          .to.emit(testament, "TestamentUnlocked")
          .withArgs(heir.address, "QmHash123456789");
  
        expect(await testament.unlockTestament()).to.equal("QmHash123456789");
      });
  
      it("Should reject unlocking if the testator is still alive", async function () {
        const { testament, heir } = await loadFixture(deployTestamentFixture);
  
        await expect(
          testament.connect(heir).unlockTestament()
        ).to.be.revertedWith("Le testateur est encore en vie.");
      });
  
      it("Should reject unlocking if called before unlock time", async function () {
        const { testament, heir, notary } = await loadFixture(
          deployTestamentFixture
        );
  
        await testament.connect(notary).confirmDeath();
  
        await expect(
          testament.connect(heir).unlockTestament()
        ).to.be.revertedWith("Periode d'attente non respectee.");
      });
  
      it("Should reject unlocking if called by non-heir accounts", async function () {
        const { testament, notary, otherAccount, unlockTime } = await loadFixture(
          deployTestamentFixture
        );
  
        await testament.connect(notary).confirmDeath();
        await time.increaseTo(unlockTime);
  
        await expect(
          testament.connect(otherAccount).unlockTestament()
        ).to.be.revertedWith("Vous n'etes pas l'heritier.");
      });
    });
  
    describe("Updating Heir and Notary", function () {
      it("Should allow the owner to update the heir", async function () {
        const { testament, owner, otherAccount } = await loadFixture(
          deployTestamentFixture
        );
  
        await expect(testament.connect(owner).updateHeir(otherAccount.address))
          .to.not.be.reverted;
  
        expect(await testament.heir()).to.equal(otherAccount.address);
      });
  
      it("Should allow the owner to update the notary", async function () {
        const { testament, owner, otherAccount } = await loadFixture(
          deployTestamentFixture
        );
  
        await expect(testament.connect(owner).updateNotary(otherAccount.address))
          .to.not.be.reverted;
  
        expect(await testament.notary()).to.equal(otherAccount.address);
      });
  
      it("Should reject updates by non-owner accounts", async function () {
        const { testament, heir, notary, otherAccount } = await loadFixture(
          deployTestamentFixture
        );
  
        await expect(
          testament.connect(heir).updateHeir(otherAccount.address)
        ).to.be.revertedWith("Vous n'etes pas le testateur.");
  
        await expect(
          testament.connect(notary).updateNotary(otherAccount.address)
        ).to.be.revertedWith("Vous n'etes pas le testateur.");
      });
    });
  });
  