import { test } from 'tape-promise/tape';

import {
  paymentForAlice,
  baytownBucks,
  baytownBucksIssuer,
} from '../examples/baytownBucks';

const baytownBucksAmountMath = baytownBucksIssuer.getAmountMath();
// Let's make sure that the payment we would send to Alice has the
// correct balance.
test('gets the balance of the payment for Alice', async (t) => {
  t.ok(
    baytownBucksAmountMath.isEqual(
      await baytownBucksIssuer.getAmountOf(paymentForAlice),
      baytownBucks(10),
    ),
  );
  t.end();
});
