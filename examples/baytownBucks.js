import { makeMint } from '@agoric/ertp/core/mint';

// Let's create a community currency and make a payment for Alice.
// This example uses ERTP but does not use Zoe, since no offers are
// being made.

// First, let's create a mint
const baytownBucksMint = makeMint('BaytownBucks');

// Now let's get the assay from the mint
// Note: exported for testing purposes
export const baytownBucksAssay = baytownBucksMint.getAssay();

// Let's give ourselves a easy way of labeling a number as baytownBucks.
// Note: exported for testing purposes
export const baytownBucks = baytownBucksAssay.makeUnits;

// Now let's create a purse to hold our community treasury funds.
const purse = baytownBucksMint.mint(baytownBucks(1000), 'community treasury');

// Let's make that payment for Alice.
// Note: exported for testing purposes
export const paymentForAlice = purse.withdraw(
  baytownBucks(10),
  `alice's community money`,
);
