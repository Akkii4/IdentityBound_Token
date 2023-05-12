const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityToken", function () {
  let owner, user1, user2, user3, identityTokens;

  before(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const IdentityTokensContract = await ethers.getContractFactory(
      "IdentityToken"
    );
    identityTokens = await IdentityTokensContract.deploy(
      "Identity Token",
      "IDT"
    );
  });

  it("Should return the name and ticker", async function () {
    expect(await identityTokens.name()).to.equal("Identity Token");
    expect(await identityTokens.ticker()).to.equal("IDT");
  });

  it("tokenExists should return false for new query", async function () {
    expect(await identityTokens.tokenExists(user1.address)).to.equal(false);
  });

  it("Should create a new identity token", async function () {
    const tokenData = {
      identity: "John Doe",
      url: "https://johndoe.com",
      score: 99,
      timestamp: new Date().getTime(),
    };
    await identityTokens.createToken(user1.address, tokenData);
  });

  it("tokenExists should return true", async function () {
    expect(await identityTokens.tokenExists(user1.address)).to.equal(true);
  });

  it("getTokenData should return the correct identity", async function () {
    const tokenData = await identityTokens.getTokenData(user1.address);
    expect(tokenData.identity).to.equal("John Doe");
  });

  it("Operator should be able to update identity token data", async function () {
    const updatedTokenData = {
      identity: "John Doe",
      url: "https://johndoe.com",
      score: 80,
      timestamp: new Date().getTime(),
    };
    await identityTokens.updateToken(user1.address, updatedTokenData);
  });

  it("getTokenData should return the updated value", async function () {
    const tokenData = await identityTokens.getTokenData(user1.address);
    expect(tokenData.score).to.equal(80);
  });

  it("User should be able to delete their identity token", async function () {
    await identityTokens.connect(user1).removeToken(user1.address);
  });

  it("tokenExists should return false after delete", async function () {
    expect(await identityTokens.tokenExists(user1.address)).to.equal(false);
  });

  it("profileExists should return false", async function () {
    expect(
      await identityTokens.profileExists(user1.address, user2.address)
    ).to.equal(false);
  });

  it("Should create a new identity token for user2", async function () {
    const tokenData = {
      identity: "Alice Smith",
      url: "https://github.com",
      score: 42,
      timestamp: new Date().getTime(),
    };
    await identityTokens.createToken(user2.address, tokenData);
  });

  it("3rd party should be able to create a profile", async function () {
    const profileData = {
      identity: "Alice",
      url: "https://google.com",
      score: 92,
      timestamp: new Date().getTime(),
    };
    await identityTokens
      .connect(user1)
      .createProfile(user2.address, profileData);
  });

  it("getProfileData should return the profile data", async function () {
    const profileData = await identityTokens.getProfileData(
      user1.address,
      user2.address
    );
    expect(profileData.score).to.equal(92);
  });

  it("profileExists should return true", async function () {
    expect(
      await identityTokens.profileExists(user1.address, user2.address)
    ).to.equal(true);
  });

  it("listProfiles should return profile addresses", async function () {
    const profiles = await identityTokens.listProfiles(user2.address);
    expect(profiles[0]).to.equal(user1.address);
  });

  it("User should be able to delete their profile", async function () {
    await identityTokens
      .connect(user2)
      .deleteProfile(user1.address, user2.address);
  });

  it("profileExists should return false after removal", async function () {
    expect(
      await identityTokens.profileExists(user1.address, user2.address)
    ).to.equal(false);
  });

  it("removeToken should remove all associated profiles", async function () {
    const tokenData = {
      identity: "Bob Smith",
      url: "https://ethereum.org",
      score: 37,
      timestamp: new Date().getTime(),
    };
    await identityTokens.createToken(user3.address, tokenData);
    await identityTokens.connect(user1).createProfile(user3.address, tokenData);
    expect(
      await identityTokens.profileExists(user1.address, user3.address)
    ).to.equal(true);
    await identityTokens.connect(user3).removeToken(user3.address);
    expect(
      await identityTokens.profileExists(user1.address, user3.address)
    ).to.equal(false);
  });
});
