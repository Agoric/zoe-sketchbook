import { test } from 'tape-promise/tape';
import harden from '@agoric/harden';

import { makeRegistrar } from '@agoric/registrar';

import { setupZoe } from '../examples/setup/setupZoe';
import {
  moolaMint,
  moolaIssuer,
  moolaAmountMath,
} from '../examples/setup/moolaMint';
import {
  simoleanMint,
  simoleanIssuer,
  simoleanAmountMath,
} from '../examples/setup/simoleanMint';
import { makeInitialPayment } from '../examples/setup/initialPayments';

import makeBob from '../examples/tradeWithAtomicSwap/bob';
import makeAlice from '../examples/tradeWithAtomicSwap/alice';

test('perform trade using atomic swap contract', async t => {
  const { zoe, installations } = await setupZoe();

  const inviteissuer = zoe.getInviteIssuer();

  const moola = moolaIssuer.getAmountMath().make;
  const simoleans = simoleanIssuer.getAmountMath().make;

  const registrar = makeRegistrar();
  const inviteissuerRegKey = registrar.register('inviteissuer', inviteissuer);
  const moolaIssuerRegKey = registrar.register('moolaIssuer', moolaIssuer);
  const simoleanIssuerRegKey = registrar.register(
    'simoleanIssuer',
    simoleanIssuer,
  );

  const walletData = harden({
    issuers: [
      { issuer: moolaIssuer, regKey: moolaIssuerRegKey, petname: 'moola' },
      {
        issuer: simoleanIssuer,
        regKey: simoleanIssuerRegKey,
        petname: 'simolean',
      },
      { issuer: inviteissuer, regKey: inviteissuerRegKey, petname: 'invite' },
    ],
  });

  const aliceMoolaPayment = makeInitialPayment(moolaMint, moolaAmountMath, 3);
  const alice = makeAlice(zoe, installations, walletData);
  const aliceInbox = alice.getInbox();
  aliceInbox.receive(moolaIssuerRegKey, aliceMoolaPayment);

  const bobSimoleanPayment = makeInitialPayment(
    simoleanMint,
    simoleanAmountMath,
    7,
  );
  const bob = makeBob(zoe, installations, walletData);
  const bobInbox = bob.getInbox();
  bobInbox.receive(simoleanIssuerRegKey, bobSimoleanPayment);

  bob.connectWith('alice', aliceInbox);
  alice.connectWith('bob', bobInbox);

  await alice.startSwap();

  const aliceWallet = alice.getWallet();
  const bobWallet = bob.getWallet();

  t.ok(moolaAmountMath.isEqual(aliceWallet.getBalance('moola'), moola(0)));
  t.ok(
    simoleanAmountMath.isEqual(
      aliceWallet.getBalance('simolean'),
      simoleans(7),
    ),
  );

  t.ok(moolaAmountMath.isEqual(bobWallet.getBalance('moola'), moola(3)));
  t.ok(
    simoleanAmountMath.isEqual(bobWallet.getBalance('simolean'), simoleans(0)),
  );

  t.end();
});
