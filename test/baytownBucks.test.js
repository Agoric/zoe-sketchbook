import { test } from 'tape-promise/tape';

import { paymentForAlice, baytownBucks } from '../examples/baytownBucks';

test('gets the balance of the payment for Alice', t => {
  t.deepEquals(paymentForAlice.getBalance(), baytownBucks(10));
  t.end();
});
