import harden from '@agoric/harden';

export const makeAlice = (
  zoe,
  installations,
  moolaAssay,
  simoleanAssay,
  bobInbox,
) =>
  harden({
    performSwap: async moolaPayment => {
      // Alice creates an atomicSwap instance by using an already
      // installed contract
      const invite = await zoe.makeInstance(installations.atomicSwap, {
        assays: [moolaAssay, simoleanAssay],
      });

      // Alice escrows with zoe
      const offerRules = harden({
        payoutRules: [
          {
            kind: 'offerAtMost',
            units: moolaAssay.makeUnits(3),
          },
          {
            kind: 'wantAtLeast',
            units: simoleanAssay.makeUnits(7),
          },
        ],
        exitRule: {
          kind: 'onDemand',
        },
      });
      const payments = [moolaPayment, undefined];

      // Alice redeems her invite and escrows with Zoe
      const { seat: aliceSeat, payout: alicePayoutP } = await zoe.redeem(
        invite,
        offerRules,
        payments,
      );

      // Alice makes the first offer in the swap.
      const bobInviteP = aliceSeat.makeFirstOffer();
      bobInbox.receive(bobInviteP);
      const [moolaPayoutP, simoleanPayoutP] = await alicePayoutP;

      // Alice deposits her payout in new purses
      const moolaPurse = moolaAssay.makeEmptyPurse();
      const simoleanPurse = simoleanAssay.makeEmptyPurse();
      await moolaPurse.depositAll(moolaPayoutP);
      await simoleanPurse.depositAll(simoleanPayoutP);
    },
  });
