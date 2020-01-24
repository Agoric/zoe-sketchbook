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
