import harden from '@agoric/harden';
import { insist } from '@agoric/ertp/util/insist';

import canTradeWith from '../setup/canTradeWith';
import makeWallet from '../setup/wallet';

const makeBob = (zoe, installations, walletData) => {
  const wallet = makeWallet(walletData);

  const matchOffer = async inviteP => {
    const moola = wallet.getUnitOps('moola').make;
    const simoleans = wallet.getUnitsOps('simoleans').make;

    const inviteAssay = wallet.getAssay('invite');
    const moolaAssay = wallet.getAssay('moola');
    const simoleanAssay = wallet.getAssay('simolean');

    const exclInvite = await inviteAssay.claimAll(inviteP);
    const { extent } = exclInvite.getBalance();
    const { installationHandle, terms } = zoe.getInstance(
      extent.instanceHandle,
    );

    const intendedOfferRules = harden({
      payoutRules: [
        {
          kind: 'wantAtLeast',
          units: moola(3),
        },
        {
          kind: 'offerAtMost',
          units: simoleans(7),
        },
      ],
      exitRule: {
        kind: 'onDemand',
      },
    });

    insist(installationHandle === installations.atomicSwap)`wrong installation`;
    insist(terms.assays[0], moolaAssay)`wrong assay`;
    insist(terms.assays[1], simoleanAssay)`wrong assay`;
    insist(
      canTradeWith(extent.offerMadeRules, intendedOfferRules.payoutRules),
    )`wrong first offer`;

    const payments = [undefined, wallet.withdraw('simolean', simoleans(7))];

    const { seat, payout } = await zoe.redeem(
      exclInvite,
      intendedOfferRules,
      payments,
    );

    payout.then(([moolaPayout, simoleanPayout]) => {
      wallet.deposit('moola', moolaPayout);
      wallet.deposit('simolean', simoleanPayout);
    });

    return seat.matchOffer();
  };

  wallet.registerCallback('invite', matchOffer);

  // exposed to our tests
  return harden({ getInbox: wallet.getInbox, connectWith: wallet.connectWith });
};

export default makeBob;
