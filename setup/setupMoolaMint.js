import { makeMint } from '@agoric/ertp/core/mint';

export const moolaMint = makeMint('moola');
export const moolaAssay = moolaMint.getAssay();
