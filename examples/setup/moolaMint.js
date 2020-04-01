import produceIssuer from '@agoric/ertp';

const moolaIssuerResults = produceIssuer('moola');

export const moolaMint = moolaIssuerResults.mint;
export const moolaIssuer = moolaIssuerResults.issuer;
export const moolaAmountMath = moolaIssuerResults.amountMath;
