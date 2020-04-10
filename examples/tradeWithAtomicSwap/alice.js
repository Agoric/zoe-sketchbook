import harden from '@agoric/harden';
import makeWallet from '../setup/wallet';

const makeAlice = (zoe, installations, walletData) => {
  const wallet = makeWallet(walletData);

  const moola = wallet.getAmountMath('moola').make;
  const simoleans = wallet.getAmountMath('simolean').make;

  const moolaIssuer = wallet.getIssuer('moola');
  const simoleanIssuer = wallet.getIssuer('simolean');

  // Exposed to our tests
  return harden({
    getWallet: () => wallet,
    getInbox: wallet.getInbox,
    connectWith: wallet.connectWith,
    startSwap: async () => {
      // Alice creates an atomicSwap instance by using an already
      // installed contract
      const issuerKeywordRecord = {
        Price: simoleanIssuer,
        Asset: moolaIssuer,
      };
      const invite = await zoe.makeInstance(
        installations.atomicSwap,
        issuerKeywordRecord,
      );

      const proposal = harden({
        want: { Price: simoleans(7) },
        give: { Asset: moola(3) },
        exit: { onDemand: null },
      });
      const payments = {
        Asset: wallet.withdraw('moola', moola(3)),
      };

      // Alice redeems her invite and escrows with Zoe
      const { seat, payout } = await zoe.redeem(invite, proposal, payments);

      // Alice makes the first offer in the swap.
      const bobInviteP = seat.makeFirstOffer();
      wallet.send('bob', 'invite', bobInviteP);

      return payout.then(async (payoutPs) => {
        const { Price: simoleanPayoutP, Asset: moolaPayoutP } = payoutPs;

        await moolaPayoutP.then((m) => wallet.deposit('moola', m));
        await simoleanPayoutP.then((p) => wallet.deposit('simolean', p));
        return 'swap successful';
      });
    },
  });
};

export default makeAlice;
