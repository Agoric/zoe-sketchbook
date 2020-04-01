import harden from '@agoric/harden';

export const secondPriceLogic = (bidAmountMath, bidOfferHandles, bids) => {
  let highestBid = bidAmountMath.getEmpty();
  let secondHighestBid = bidAmountMath.getEmpty();
  let highestBidOfferHandle;
  // eslint-disable-next-line array-callback-return
  bidOfferHandles.map((offerHandle, i) => {
    const bid = bids[i];
    // If the bid is greater than the highestBid, it's the new highestBid
    if (bidAmountMath.isGTE(bid, highestBid)) {
      secondHighestBid = highestBid;
      highestBid = bid;
      highestBidOfferHandle = offerHandle;
    } else if (bidAmountMath.isGTE(bid, secondHighestBid)) {
      // If the bid is not greater than the highest bid, but is greater
      // than the second highest bid, it is the new second highest bid.
      secondHighestBid = bid;
    }
  });
  return harden({
    winnerOfferHandle: highestBidOfferHandle,
    winnerBid: highestBid,
    price: secondHighestBid,
  });
};

export const closeAuction = (
  zoe,
  { auctionLogicFn, sellerInviteHandle, allBidHandles },
) => {
  const { issuerKeywordRecord } = zoe.getInstanceRecord();
  const { Bid: bidAmountMath, Asset: assetAmountMath } = zoe.getAmountMaths(
    issuerKeywordRecord,
  );

  // Filter out any inactive bids
  const { active: activeBidHandles } = zoe.getOfferStatuses(
    harden(allBidHandles),
  );

  const getBids = offer => offer.amounts.Bid;
  const bids = zoe.getOffers(activeBidHandles).map(getBids);
  const assetAmount = zoe.getOffer(sellerInviteHandle).offerRules.offer.Asset;

  const {
    winnerOfferHandle: winnerInviteHandle,
    winnerBid,
    price,
  } = auctionLogicFn(bidAmountMath, activeBidHandles, bids);

  // The winner gets to keep the difference between their bid and the
  // price paid.
  const winnerRefund = bidAmountMath.subtract(winnerBid, price);

  const newSellerAmounts = { Asset: assetAmountMath.getEmpty(), Bid: price };
  const newWinnerAmounts = { Asset: assetAmount, Bid: winnerRefund };

  // Everyone else gets a refund so their extents remain the
  // same.
  zoe.reallocate(
    harden([sellerInviteHandle, winnerInviteHandle]),
    harden([newSellerAmounts, newWinnerAmounts]),
  );
  const allOfferHandles = harden([sellerInviteHandle, ...activeBidHandles]);
  zoe.complete(allOfferHandles);
};
