import { makeMint } from '@agoric/ertp/core/mint';

const baytownBucksMint = makeMint('BaytownBucks');
export const baytownBucksAssay = baytownBucksMint.getAssay();
export const baytownBucks = baytownBucksAssay.makeUnits;

const purse = baytownBucksMint.mint(baytownBucks(1000), 'community treasury');
export const paymentForAlice = purse.withdraw(
  baytownBucks(10),
  `alice's community money`,
);
