import produceIssuer from '@agoric/ertp';

// Let's create a community currency and make a payment for Alice.
// This example uses ERTP but does not use Zoe, since no offers are
// being made.

// First, let's create an issuer
export const baytownBucksBundle = produceIssuer('BaytownBucks');

// Now let's get the mint from the issuer
const baytownBucksMint = baytownBucksBundle.mint;

// Let's give ourselves a way to create amounts of baytownBucks.
// Note: exported for testing purposes
export const baytownBucks = baytownBucksBundle.amountMath;

// Now let's create a payment to hold our community treasury funds.
const payment = baytownBucksMint.mintPayment(
  baytownBucks.make(1000),
  'community treasury',
);

const purse = baytownBucksBundle.issuer.makeEmptyPurse();
purse.deposit(payment);

// Let's make that payment for Alice.
// Note: exported for testing purposes
export const paymentForAlice = purse.withdraw(
  baytownBucks.make(10),
  `alice's community money`,
);
