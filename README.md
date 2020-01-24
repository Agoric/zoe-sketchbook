# Zoe Sketchbook

An easy way to get started building JavaScript smart contracts on Zoe.
Draft and lightly test your smart contact code here.

## Getting started

```
git clone https://github.com/Agoric/zoe-sketchbook.git
cd zoe-sketchbook
yarn install
```

## Looking at Examples

In the [`examples/`](https://github.com/Agoric/zoe-sketchbook/tree/master/examples) folder, there are examples of minting fungible tokens (`baytownBucks.js`), and securely trading with another person using the atomicSwap contract running on Zoe (`tradeWithAtomicSwap.js`). Additionally, all of the contracts written by Agoric for Zoe are copied into `zoe-contracts-copied` for your perusal. 

## Running Tests

Some of the these examples have tests that you can run and look at to see how they work, and use them as templates to create your own tests. You can find these tests in the `test` directory.

To run all of the tests, do: `yarn test` from the command line.

## Adding your own contracts

Feel free to make a new file in your local copy (what you just cloned) and write out your own contract. You will probably want to create a test file as well to make sure it works as intended. 

Happy contracting!
