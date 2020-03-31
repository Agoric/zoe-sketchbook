import harden from '@agoric/harden';
import { assert, details } from '@agoric/assert';

import makeWallet from '../setup/wallet';

const makeBob = (zoe, installations, walletData) => {
  const wallet = makeWallet(walletData);

  const matchOffer = async inviteP => {
    const moolaAmountMath = wallet.getAmountMath('moola');
    const simoleanAmountMath = wallet.getAmountMath('simolean');

    const moola = moolaAmountMath.make;
    const simoleans = simoleanAmountMath.make;

    const moolaIssuer = wallet.getIssuer('moola');
    const simoleanIssuer = wallet.getIssuer('simolean');
    const inviteIssuer = zoe.getInviteIssuer();

    const { extent } = await inviteIssuer.getAmountOf(inviteP);
    const { installationHandle, issuerKeywordRecord } = zoe.getInstance(
      extent[0].instanceHandle,
    );

    const intendedOfferRules = harden({
      give: { Price: simoleans(7) },
      want: { Asset: moola(3) },
      exit: { onDemand: null },
    });

    assert(
      installationHandle === installations.atomicSwap,
      details`wrong installation`,
    );
    assert(issuerKeywordRecord.Asset === moolaIssuer, details`wrong issuer`);
    assert(issuerKeywordRecord.Price === simoleanIssuer, details`wrong issuer`);

    const payments = {
      Asset: moolaIssuer.makeEmptyPurse().withdraw(moola(0)),
      Price: wallet.withdraw('simolean', simoleans(7)),
    };

    const { seat, payout } = await zoe.redeem(
      inviteP,
      intendedOfferRules,
      payments,
    );

    payout.then(async payoutPs => {
      const { Price: simoleanPayoutP, Asset: moolaPayoutP } = payoutPs;
      await moolaPayoutP.then(m => wallet.deposit('moola', m));
      await simoleanPayoutP.then(p => wallet.deposit('simolean', p));
    });

    return seat.matchOffer();
  };

  wallet.registerCallback('invite', matchOffer);

  // exposed to our tests
  return harden({
    getWallet: () => wallet,
    getInbox: wallet.getInbox,
    connectWith: wallet.connectWith,
  });
};

export default makeBob;
