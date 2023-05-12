// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title Identity Tokens
 * @dev Non-transferable tokens that represent a unique identity.
 *      Inspired by Vitalik Buterin's co-authored whitepaper at:
 *      https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763
 *
 * @notice This contract allows for the creation, deletion, and updating of identity tokens,
 *         as well as the creation, deletion, and retrieval of profiles associated with each token.
 */
contract IdentityToken {
    /**
     * @dev Struct representing an identity token, which contains an identity, URL, score, and timestamp.
     */
    struct IdentityInfo {
        string identity;
        string url;
        uint256 score;
        uint256 timestamp;
    }

    // Mappings to store identity tokens, token profiles, and profilers
    mapping(address => IdentityInfo) private identityTokens;
    mapping(address => mapping(address => IdentityInfo)) private tokenProfiles;
    mapping(address => address[]) private profiles;

    // Public variables for the name and ticker symbol of the token, and the operator address
    string public name;
    string public ticker;
    address public operator;

    // Constant value used to check if an identity token exists
    bytes32 private zeroHash =
        0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;

    // Events emitted by the contract
    event Mint(address _token);
    event Burn(address _token);
    event Update(address _token);
    event ProfileCreated(address _profiler, address _token);
    event ProfileDeleted(address _profiler, address _token);

    /**
     * @dev Constructor function that sets the name, ticker, and operator of the token when it is deployed.
     * @param _name The name of the token.
     * @param _ticker The ticker symbol of the token.
     */
    constructor(string memory _name, string memory _ticker) {
        name = _name;
        ticker = _ticker;
        operator = msg.sender;
    }

    /**
     * @dev Function to create a new identity token with the given identity and data.
     * @param _token The address of the new identity token.
     * @param _tokenData The data associated with the new identity token.
     */
    function createToken(
        address _token,
        IdentityInfo memory _tokenData
    ) external {
        require(
            keccak256(bytes(identityTokens[_token].identity)) == zeroHash,
            "Identity token already exists"
        );
        require(
            msg.sender == operator,
            "Only operator can create new identity tokens"
        );
        identityTokens[_token] = _tokenData;
        emit Mint(_token);
    }

    /**
     * @dev Function to delete an identity token with the given address.
     * @param _token The address of the identity token to be deleted.
     */
    function deleteToken(address _token) external {
        require(
            msg.sender == _token || msg.sender == operator,
            "Only users and issuers can delete their identity tokens"
        );
        delete identityTokens[_token];
        for (uint i = 0; i < profiles[_token].length; i++) {
            address profiler = profiles[_token][i];
            delete tokenProfiles[profiler][_token];
        }
        emit Burn(_token);
    }

    /**
     * @dev Function to update the data associated with an identity token with the given address.
     * @param _token The address of the identity token to be updated.
     * @param _tokenData The updated data associated with the identity token.
     */
    function updateToken(
        address _token,
        IdentityInfo memory _tokenData
    ) external {
        require(
            msg.sender == operator,
            "Only operator can update identity token data"
        );
        require(
            keccak256(bytes(identityTokens[_token].identity)) != zeroHash,
            "Identity token does not exist"
        );
        identityTokens[_token] = _tokenData;
        emit Update(_token);
    }

    /**
     * @dev Function to check whether an identity token with the given address exists.
     * @param _token The address of the identity token to check.
     * @return A boolean indicating whether the identity token exists.
     */
    function tokenExists(address _token) external view returns (bool) {
        if (keccak256(bytes(identityTokens[_token].identity)) == zeroHash) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @dev Function to retrieve the data associated with an identity token with the given address.
     * @param _token The address of the identity token to retrieve.
     * @return The data associated with the identity token.
     */
    function getTokenData(
        address _token
    ) external view returns (IdentityInfo memory) {
        return identityTokens[_token];
    }

    /**
     * @dev Function to create a new profile for an identity token with the given address and data.
     * @param _token The address of the identity token to create a profile for.
     * @param _tokenData The data associated with the identity token profile.
     */
    function createProfile(
        address _token,
        IdentityInfo memory _tokenData
    ) external {
        require(
            keccak256(bytes(identityTokens[_token].identity)) != zeroHash,
            "Cannot create a profile for an identity token that does not exist"
        );
        tokenProfiles[msg.sender][_token] = _tokenData;
        profiles[_token].push(msg.sender);
        emit ProfileCreated(msg.sender, _token);
    }

    /**
     * @dev Function to retrieve the profile associated with an identity token and profiler.
     * @param _profiler The address of the profiler whose profile to retrieve.
     * @param _token The address of the identity token whose profile to retrieve.
     * @return The data associated with the identity token profile.
     */
    function getProfileData(
        address _profiler,
        address _token
    ) external view returns (IdentityInfo memory) {
        return tokenProfiles[_profiler][_token];
    }

    /**
     * @dev Function to retrieve the list of profilers associated with an identity token.
     * @param _token The address of the identity token whose profilers to retrieve.
     * @return An array of addresses representing the profilers associated with the identity token.
     */
    function listProfiles(
        address _token
    ) external view returns (address[] memory) {
        return profiles[_token];
    }

    /**
     * @dev Function to check whether a profile for an identity token and profiler exists.
     * @param _profiler The address of the profiler whose profile to check.
     * @param _token The address of the identity token whose profile to check.
     * @return A boolean indicating whether the profile exists.
     */
    function profileExists(
        address _profiler,
        address _token
    ) public view returns (bool) {
        if (
            keccak256(bytes(tokenProfiles[_profiler][_token].identity)) ==
            zeroHash
        ) return false;
        else {
            return true;
        }
    }

    /**
     * @dev Function to delete the profile associated with an identity token and profiler.
     * @param _profiler The address of the profiler whose profile to delete.
     * @param _token The address of the identity token whose profile to delete.
     */
    function deleteProfile(address _profiler, address _token) external {
        require(
            msg.sender == _profiler || msg.sender == operator,
            "Only profilers and operators can delete profiles"
        );
        require(profileExists(_profiler, _token), "Profile does not exist");
        delete tokenProfiles[_profiler][_token];
        for (uint i = 0; i < profiles[_token].length; i++) {
            if (profiles[_token][i] == _profiler) {
                profiles[_token][i] = profiles[_token][
                    profiles[_token].length - 1
                ];
                profiles[_token].pop();
                break;
            }
        }
        emit ProfileDeleted(_profiler, _token);
    }
}
