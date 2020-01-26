// Start off Alice and Bob with a payment of some token
export const makeInitialPayment = (mint, assay, allocation) => {
  const purse = mint.mint(assay.makeUnits(allocation));
  return purse.withdrawAll();
};
