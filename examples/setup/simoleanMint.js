import produceIssuer from '@agoric/ertp';

const simoleanIssuerResults = produceIssuer('simolean');

export const simoleanMint = simoleanIssuerResults.mint;
export const simoleanIssuer = simoleanIssuerResults.issuer;
export const simoleanAmountMath = simoleanIssuerResults.amountMath;
