// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IdentityBound Tokens
 * @dev Non-transferable tokens that represent a unique identity.
 *      Inspired by Vitalik Buterin's co-authored whitepaper at:
 *      https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763
 *
 * @notice This contract allows for the creation, deletion, and updating of identity tokens,
 *         as well as the creation, deletion, and retrieval of profiles associated with each token.
 */
contract IdentityBoundToken {
    /**
     * @dev Struct representing identity information, which contains a receiver identity, URL, ID number, and timestamp.
     */
    struct IdentityInfo {
        string receiverIdentity;
        string url;
        uint256 idNum;
        uint256 timestamp;
    }

    // Mappings to store identity information
    mapping(address => IdentityInfo) private identityInfo;

    // Public variables for the name and ticker symbol of the token, and the issuer address
    string public name;
    string public symbol;
    address public issuer;

    // Constant value used to check if an identity token exists
    bytes32 private zeroHash =
        0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;

    // Events emitted by the contract
    event TokenCreated(address identity);
    event RemovedToken(address identity);
    event UpdateIdentityInfo(address identity);

    // Modifier to restrict access to certain functions to the issuer only
    modifier onlyIssuer() {
        require(msg.sender == issuer, "Not issuer");
        _;
    }

    /**
     * @dev Constructor function that sets the name, symbol, and issuer of the token when it is deployed.
     * @param _name The name of the token.
     * @param _symbol The ticker symbol of the token.
     */
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        issuer = msg.sender;
    }

    /**
     * @dev Function to create a new identity token with the given identity data.
     * @param _identity The address of the recievers.
     * @param identityData The identity data to associate with the recieverIdentity.
     */
    function createToken(
        address _identity,
        IdentityInfo memory identityData
    ) external onlyIssuer {
        // Check if the identity already exists
        require(
            keccak256(bytes(identityInfo[_identity].receiverIdentity)) ==
                zeroHash,
            "Identity already exists"
        );

        // Associate the given identity data with the identity
        identityInfo[_identity] = identityData;

        // Emit an event to indicate that a new identity token has been created
        emit TokenCreated(_identity);
    }

    /**
     * @dev Function to remove an existing identity token.
     * @param _identity The address of the identity whose token to remove.
     */
    function removeToken(address _identity) external onlyIssuer {
        // Check if the caller is the identity token holder or the issuer
        require(
            msg.sender == _identity,
            "Only token holder or issuer can remove their identity tokens"
        );

        // Delete the identity information associated with the identity
        delete identityInfo[_identity];

        // Emit an event to indicate that an identity token has been removed
        emit RemovedToken(_identity);
    }

    /**
     * @dev Function to update the identity data associated with an existing identity.
     * @param _identity The address of the recievers whose identity info to update.
     * @param _newInfo The new identity data to associate with the identity.
     */
    function updateIdentityData(
        address _identity,
        IdentityInfo memory _newInfo
    ) external onlyIssuer {
        // Check if the identity exists
        require(
            keccak256(bytes(identityInfo[_identity].receiverIdentity)) !=
                zeroHash,
            "Identity does not exist"
        );

        // Update the identity information associated with the identity
        identityInfo[_identity] = _newInfo;

        // Emit an event to indicate that the identity data associated with an identity has been updated
        emit UpdateIdentityInfo(_identity);
    }

    /**
     * @dev Function to check if an identity exists.
     * @param _identity The address of the identity to check.
     */
    function isIdentityExists(address _identity) external view returns (bool) {
        if (
            keccak256(bytes(identityInfo[_identity].receiverIdentity)) ==
            zeroHash
        ) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @dev Function to retrieve the identity data associated with an identity.
     * @param _identity The address of the recievers to check.
     */
    function getIdentityData(
        address _identity
    ) external view returns (IdentityInfo memory) {
        return identityInfo[_identity];
    }
}
