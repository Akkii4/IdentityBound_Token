// Import the required libraries from Hardhat
const { expect } = require("chai");

// Import the contract ABI and bytecode from the compiled artifacts
const contract = require("../artifacts/contracts/IdentityBoundToken.sol/IdentityBoundToken.json");

// Start the test suite for the IdentityBoundToken contract
describe("IdentityBoundToken", function () {
  // Define variables to be used in the tests
  let IdentityBoundToken;
  let identityBoundToken;
  let owner;
  let addr1;
  let addr2;

  // Use a hook to set up the contract instance and test accounts before each test
  beforeEach(async function () {
    // Get the accounts from Hardhat's built-in provider
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the IdentityBoundToken contract
    IdentityBoundToken = await ethers.getContractFactory("IdentityBoundToken");
    identityBoundToken = await IdentityBoundToken.deploy("MyToken", "MTK");

    // Wait for the contract to be mined and deployed
    await identityBoundToken.deployed();
  });

  // Test the token creation function
  describe("createToken", function () {
    it("should create a new token with the given identity data", async function () {
      // Define the identity data to associate with the new token
      const identityData = {
        receiverIdentity: "John Doe",
        url: "https://johndoe.com",
        idNum: 12345,
        timestamp: Date.now(),
      };

      // Call the createToken function to create a new token with the given identity data
      await identityBoundToken.createToken(addr1.address, identityData);

      // Check that the token was created successfully
      const tokenExists = await identityBoundToken.isIdentityExists(
        addr1.address
      );
      expect(tokenExists).to.equal(true);

      // Check that the identity data associated with the token is correct
      const retrievedIdentityData = await identityBoundToken.getIdentityData(
        addr1.address
      );
      expect(retrievedIdentityData.receiverIdentity).to.equal(
        identityData.receiverIdentity
      );
      expect(retrievedIdentityData.url).to.equal(identityData.url);
      expect(retrievedIdentityData.idNum).to.equal(identityData.idNum);
      expect(retrievedIdentityData.timestamp).to.equal(identityData.timestamp);
    });

    it("should not allow the creation of a new token for an existing identity", async function () {
      // Define the identity data to associate with the new token
      const identityData1 = {
        receiverIdentity: "John Doe",
        url: "https://johndoe.com",
        idNum: 12345,
        timestamp: Date.now(),
      };

      // Call the createToken function to create a new token with the given identity data
      await identityBoundToken.createToken(addr1.address, identityData1);

      // Define a different set of identity data to associate with the same identity
      const identityData2 = {
        receiverIdentity: "Jane Doe",
        url: "https://janedoe.com",
        idNum: 54321,
        timestamp: Date.now(),
      };

      // Call the createToken function again to try to create a new token with the same identity
      await expect(
        identityBoundToken.createToken(addr1.address, identityData2)
      ).to.be.revertedWith("Identity already exists");
    });
  });

  // Test the token removal function
  describe("removeToken", function () {
    it("should allow the token holder or the issuer to remove an existing token", async function () {
      // Define the identity data to associate with the new token
      const identityData = {
        receiverIdentity: "John Doe",
        url: "https://johndoe.com",
        idNum: 12345,
        timestamp: Date.now(),
      };

      // Call the createToken function to create a new token with the given identity data
      await identityBoundToken.createToken(addr1.address, identityData);

      // Call the removeToken function to remove the token
      await identityBoundToken.connect(addr1).removeToken(addr1.address);

      // Check that the token was removed successfully
      const tokenExists = await identityBoundToken.isIdentityExists(
        addr1.address
      );
      expect(tokenExists).to.equal(false);
    });

    it("should not allow a third party to remove an existing token", async function () {
      // Define the identity data to associate with the new token
      const identityData = {
        receiverIdentity: "John Doe",
        url: "https://johndoe.com",
        idNum: 12345,
        timestamp: Date.now(),
      };

      // Call the createToken function to create a new token with the given identity data
      await identityBoundToken.createToken(addr1.address, identityData);

      // Call the removeToken function from a different account to try to remove the token
      await expect(
        identityBoundToken.connect(addr2).removeToken(addr1.address)
      ).to.be.revertedWith(
        "Only token holder or issuer can remove their identity tokens"
      );

      // Check that the token was not removed
      const tokenExists = await identityBoundToken.isIdentityExists(
        addr1.address
      );
      expect(tokenExists).to.equal(true);
    });
  });

  // Test the identity data update function
  describe("updateIdentityData", function () {
    it("should update the identity data associated with an existing token", async function () {
      // Define the initial identity data to associate with the new token
      const initialIdentityData = {
        receiverIdentity: "John Doe",
        url: "https://johndoe.com",
        idNum: 12345,
        timestamp: Date.now(),
      };

      // Call the createToken function to create a new token with the initial identity data
      await identityBoundToken.createToken(addr1.address, initialIdentityData);

      // Define the new identity data to associate with the same token
      const newIdentityData = {
        receiverIdentity: "Jane Doe",
        url: "https://janedoe.com",
        idNum: 54321,
        timestamp: Date.now(),
      };

      // Call the updateIdentityData function to update the identity data associated with the token
      await identityBoundToken.updateIdentityData(
        addr1.address,
        newIdentityData
      );

      // Check that the identity data associated with the token is updated correctly
      const retrievedIdentityData = await identityBoundToken.getIdentityData(
        addr1.address
      );
      expect(retrievedIdentityData.receiverIdentity).to.equal(
        newIdentityData.receiverIdentity
      );
      expect(retrievedIdentityData.url).to.equal(newIdentityData.url);
      expect(retrievedIdentityData.idNum).to.equal(newIdentityData.idNum);
      expect(retrievedIdentityData.timestamp).to.equal(
        newIdentityData.timestamp
      );
    });

    it("should not allow the update of identity data for a non-existing token", async function () {
      // Define the identity data to associate with the new token
      const identityData = {
        receiverIdentity: "John Doe",
        url: "https://johndoe.com",
        idNum: 12345,
        timestamp: Date.now(),
      };

      // Call the updateIdentityData function to try to update the identity data for a non-existing token
      await expect(
        identityBoundToken.updateIdentityData(addr1.address, identityData)
      ).to.be.revertedWith("Identity does not exist");
    });
  });
});
