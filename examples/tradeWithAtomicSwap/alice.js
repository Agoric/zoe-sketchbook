import harden from '@agoric/harden';
import makeWallet from '../setup/wallet';

const makeAlice = (zoe, installations, walletData) => {
  const wallet = makeWallet(walletData);

  const moola = wallet.getUnitOps('moola').make;
  const simoleans = wallet.getUnitOps('simolean').make;

  const moolaAssay = wallet.getAssay('moola');
  const simoleanAssay = wallet.getAssay('simolean');

  // Exposed to our tests
  return harden({
    getWallet: () => wallet,
    getInbox: wallet.getInbox,
    connectWith: wallet.connectWith,
    startSwap: async () => {
      // Alice creates an atomicSwap instance by using an already
      // installed contract
      const invite = await zoe.makeInstance(installations.atomicSwap, {
        assays: [moolaAssay, simoleanAssay],
      });

      const offerRules = harden({
        payoutRules: [
          {
            kind: 'offerAtMost',
            units: moola(3),
          },
          {
            kind: 'wantAtLeast',
            units: simoleans(7),
          },
        ],
        exitRule: {
          kind: 'onDemand',
        },
      });
      const payments = [wallet.withdraw('moola', moola(3)), undefined];

      // Alice redeems her invite and escrows with Zoe
      const { seat, payout } = await zoe.redeem(invite, offerRules, payments);

      // Alice makes the first offer in the swap.
      const bobInviteP = seat.makeFirstOffer();
      wallet.send('bob', 'invite', bobInviteP);

      return payout.then(([moolaPayout, simoleanPayout]) => {
        wallet.deposit('moola', moolaPayout);
        wallet.deposit('simolean', simoleanPayout);
        return 'swap successful';
      });
    },
  });
};

export default makeAlice;
