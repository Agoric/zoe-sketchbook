// Start off Alice and Bob with a payment of some token
export const makeInitialPayment = (mint, amountMath, allocation) => {
  return mint.mintPayment(amountMath.make(allocation));
};
