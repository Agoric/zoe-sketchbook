import { test } from 'tape-promise/tape';

import {
  paymentForAlice,
  baytownBucks,
  baytownBucksBundle,
} from '../examples/baytownBucks';

// Let's make sure that the payment we would send to Alice has the
// correct balance.
test('gets the balance of the payment for Alice', t => {
  const { amountMath } = baytownBucksBundle;
  const { issuer } = baytownBucksBundle;
  t.ok(
    amountMath.isEqual(
      issuer.getAmountOf(paymentForAlice),
      baytownBucks.make(10),
    ),
  );
  t.end();
});
