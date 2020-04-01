import produceIssuer from '@agoric/ertp';

// Let's create a community currency and make a payment for Alice.
// This example uses ERTP but does not use Zoe, since no offers are
// being made.

// First, let's create an issuer
const baytownBucksBundle = produceIssuer('BaytownBucks');
export const { issuer: baytownBucksIssuer } = baytownBucksBundle;

// Now let's get the mint. We could also get it from the issuer
const baytownBucksMint = baytownBucksBundle.mint;

// Let's give ourselves a way to create amounts of baytownBucks. Notice that
// this makes descriptions of money rather than money. Only mints create money.
// Note: exported for testing purposes
export const baytownBucks = baytownBucksBundle.amountMath.make;

// Now let's create a payment to hold our community treasury funds.
const payment = baytownBucksMint.mintPayment(baytownBucks(1000));

const purse = baytownBucksBundle.issuer.makeEmptyPurse();
purse.deposit(payment);

// Let's make that payment for Alice.
// Note: exported for testing purposes
export const paymentForAlice = purse.withdraw(baytownBucks(10));
