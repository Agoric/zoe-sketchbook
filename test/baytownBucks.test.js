import { test } from 'tape-promise/tape';

import { paymentForAlice, baytownBucks } from '../examples/baytownBucks';

// Let's make sure that the payment we would send to Alice has the
// correct balance.
test('gets the balance of the payment for Alice', t => {
  t.deepEquals(paymentForAlice.getBalance(), baytownBucks(10));
  t.end();
});
