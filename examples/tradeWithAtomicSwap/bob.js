import harden from '@agoric/harden';
import { insist } from '@agoric/ertp/util/insist';

import canTradeWith from '../setup/canTradeWith';
import makeWallet from '../setup/wallet';

const makeBob = (zoe, installations, walletData) => {
  const wallet = makeWallet(walletData);

  const matchOffer = async inviteP => {
    const moolaUnitOps = wallet.getUnitOps('moola');
    const simoleanUnitOps = wallet.getUnitOps('simolean');

    const moola = moolaUnitOps.make;
    const simoleans = simoleanUnitOps.make;

    const moolaAssay = wallet.getAssay('moola');
    const simoleanAssay = wallet.getAssay('simolean');

    const { extent } = inviteP.getBalance();
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
    const unitOpsArray = harden([moolaUnitOps, simoleanUnitOps]);
    insist(
      canTradeWith(
        unitOpsArray,
        extent.offerMadeRules,
        intendedOfferRules.payoutRules,
      ),
    )`wrong first offer`;

    const payments = [undefined, wallet.withdraw('simolean', simoleans(7))];

    const { seat, payout } = await zoe.redeem(
      inviteP,
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
  return harden({
    getWallet: () => wallet,
    getInbox: wallet.getInbox,
    connectWith: wallet.connectWith,
  });
};

export default makeBob;
