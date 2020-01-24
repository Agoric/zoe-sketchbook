import { makeZoe } from '@agoric/zoe';
import bundleSource from '@agoric/bundle-source';

import { setupZoe } from '../setup/setupZoe';
import { moolaMint, moolaAssay } from '../setup/setupMoolaMint';
import { simoleanMint, simoleanAssay } from '../setup/setupSimoleanMint';

// This function mints the money necessary to start 
const mintAssets = (moolaAllocation, simoleanAllocation) => {
  const moolaPurse = moolaMint.mint(moolaAssay.makeUnits(moolaAllocation));
  const simoleanPurse = simoleanMint.mint(simoleanAssay.makeUnits(simoleanAllocation));
  return harden({
    moolaPurse,
    simoleanPurse,
  });
};


const aliceActions = (zoe, installations, bobInbox) => {
    // 1: Alice creates an atomicSwap instance
    const aliceInvite = await zoe.makeInstance(installationHandle, {
      assays,
    });

    / 2: Alice escrows with zoe
    const aliceOfferRules = harden({
      payoutRules: [
        {
          kind: 'offerAtMost',
          units: assays[0].makeUnits(3),
        },
        {
          kind: 'wantAtLeast',
          units: assays[1].makeUnits(7),
        },
      ],
      exitRule: {
        kind: 'onDemand',
      },
    });
    const alicePayments = [aliceMoolaPayment, undefined];

    // 3: Alice redeems her invite and escrows with Zoe
    const { seat: aliceSeat, payout: alicePayoutP } = await zoe.redeem(
      aliceInvite,
      aliceOfferRules,
      alicePayments,
    );

    // 4: Alice makes the first offer in the swap.
    const bobInviteP = aliceSeat.makeFirstOffer();
    bobInbox.send(bobInviteP);
    const alicePayout = await alicePayoutP;
    const [aliceMoolaPayout, aliceSimoleanPayout] = await Promise.all(
      alicePayout,
    );

    // Alice deposits her payout to ensure she can
    await aliceMoolaPurse.depositAll(aliceMoolaPayout);
    await aliceSimoleanPurse.depositAll(aliceSimoleanPayout);
}

const bobActions = () => {

  const inviteAssay = zoe.getInviteAssay();
  const bobExclusiveInvite = await inviteAssay.claimAll(bobInviteP);
  const bobInviteExtent = bobExclusiveInvite.getBalance().extent;

  const {
    installationHandle: bobInstallationId,
    terms: bobTerms,
  } = zoe.getInstance(bobInviteExtent.instanceHandle);

  t.equals(bobInstallationId, installationHandle);
  t.deepEquals(bobTerms.assays, assays);
  t.deepEquals(bobInviteExtent.offerMadeRules, aliceOfferRules.payoutRules);

  const bobOfferRules = harden({
    payoutRules: [
      {
        kind: 'wantAtLeast',
        units: bobTerms.assays[0].makeUnits(3),
      },
      {
        kind: 'offerAtMost',
        units: bobTerms.assays[1].makeUnits(7),
      },
    ],
    exitRule: {
      kind: 'onDemand',
    },
  });
  const bobPayments = [undefined, bobSimoleanPayment];

  // 6: Bob escrows with zoe
  const { seat: bobSeat, payout: bobPayoutP } = await zoe.redeem(
    bobExclusiveInvite,
    bobOfferRules,
    bobPayments,
  );

  // 7: Bob makes an offer with his escrow receipt
  const bobOfferResult = await bobSeat.matchOffer();

  t.equals(
    bobOfferResult,
    'The offer has been accepted. Once the contract has been completed, please check your payout',
  );
  const bobPayout = await bobPayoutP;
  const [bobMoolaPayout, bobSimoleanPayout] = await Promise.all(bobPayout);
  
      // Bob deposits his original payments to ensure he can
      await bobMoolaPurse.depositAll(bobMoolaPayout);
      await bobSimoleanPurse.depositAll(bobSimoleanPayout);
}

const performTrade = async () => {
  const { zoe, installations } = await setupZoe();


};
