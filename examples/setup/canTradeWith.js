const canTradeWith = (unitOpsArray, leftPayoutRules, rightPayoutRules) => {
  const satisfied = (wants, offers) =>
    wants.every((want, i) => {
      if (want.kind === 'wantAtLeast') {
        return (
          offers[i].kind === 'offerAtMost' &&
          unitOpsArray[i].includes(offers[i].units, want.units)
        );
      }
      return true;
    });
  return (
    satisfied(leftPayoutRules, rightPayoutRules) &&
    satisfied(rightPayoutRules, leftPayoutRules)
  );
};

export default canTradeWith;
