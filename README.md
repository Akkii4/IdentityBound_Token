# IdentityBound Token

IdentityBound Token is a Solidity smart contract that implements non-transferable tokens representing a unique identity. The contract allows for the creation, deletion, and updating of identity tokens, as well as the creation, deletion, and retrieval of user data associated with each token.

## Installation

To install the required dependencies, run:

```
npm install
```

## Usage

To compile the contracts, run:

```
npx hardhat compile
```

To run the tests, run:

```
npx hardhat test
```

To deploy the contracts to a local Hardhat network, run:

```
npx hardhat node
```

In a separate terminal, run:

```
npx hardhat run --network localhost scripts/deploy.js
```

This will deploy the contract to the local network and output the contract address.

## Contract Details

The `IdentityBoundToken` contract defines a struct called `IdentityInfo`, which contains the following fields:

- `receiverIdentity`: a string representing the identity of the token holder
- `url`: a string representing a URL associated with the identity
- `idNum`: an integer representing an ID number associated with the identity
- `timestamp`: a timestamp representing the time when the identity information was last updated

The contract provides the following functions:

- `createToken`: creates a new identity token with the given identity data
- `removeToken`: removes an existing identity token
- `updateIdentityData`: updates the identity data associated with an existing identity
- `isIdentityExists`: checks if an identity exists
- `getIdentityData`: retrieves the identity data associated with an identity

The contract also defines a modifier called `onlyIssuer`, which restricts access to certain functions to the issuer of the contract.

## Testing

The `IdentityBoundToken` contract is thoroughly tested using Hardhat's built-in testing framework and the `chai` assertion library. The test file `test/IdentityBoundToken.js` covers the following scenarios:

- Creating a new token with the given identity data
- Trying to create a new token for an existing identity
- Removing an existing token
- Trying to remove a token from a third-party account
- Updating the identity data associated with an existing token
- Trying to update the identity data for a non-existing token

## Deployment

The `IdentityBoundToken` contract can be deployed to a local Hardhat network using the deployment script `scripts/deploy.js`.

## License

This project is licensed under the [MIT License](LICENSE).
