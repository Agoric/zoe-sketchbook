import { makeMint } from '@agoric/ertp/core/mint';

export const simoleanMint = makeMint('simoleans');
export const simoleanAssay = simoleanMint.getAssay();
