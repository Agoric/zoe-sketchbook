import { test } from 'tape-promise/tape';
import harden from '@agoric/harden';

import { makeRegistrar } from '@agoric/ertp/more/registrar/registrar';

import { setupZoe } from '../examples/setup/setupZoe';
import { moolaMint, moolaAssay } from '../examples/setup/moolaMint';
import { simoleanMint, simoleanAssay } from '../examples/setup/simoleanMint';
import { makeInitialPayment } from '../examples/setup/initialPayments';

import makeBob from '../examples/tradeWithAtomicSwap/bob';
import makeAlice from '../examples/tradeWithAtomicSwap/alice';

test('perform trade using atomic swap contract', async t => {
  const { zoe, installations } = await setupZoe();

  const inviteAssay = zoe.getInviteAssay();

  const moolaUnitOps = moolaAssay.getUnitOps();
  const simoleanUnitOps = simoleanAssay.getUnitOps();

  const moola = moolaAssay.getUnitOps().make;
  const simoleans = simoleanAssay.getUnitOps().make;

  const registrar = makeRegistrar();
  const inviteAssayRegKey = registrar.register('inviteAssay', inviteAssay);
  const moolaAssayRegKey = registrar.register('moolaAssay', moolaAssay);
  const simoleanAssayRegKey = registrar.register(
    'simoleanAssay',
    simoleanAssay,
  );

  const walletData = harden({
    assays: [
      { assay: moolaAssay, regKey: moolaAssayRegKey, petname: 'moola' },
      {
        assay: simoleanAssay,
        regKey: simoleanAssayRegKey,
        petname: 'simolean',
      },
      { assay: inviteAssay, regKey: inviteAssayRegKey, petname: 'invite' },
    ],
  });

  const aliceMoolaPayment = makeInitialPayment(moolaMint, moolaAssay, 3);
  const alice = makeAlice(zoe, installations, walletData);
  const aliceInbox = alice.getInbox();
  aliceInbox.receive(moolaAssayRegKey, aliceMoolaPayment);

  const bobSimoleanPayment = makeInitialPayment(simoleanMint, simoleanAssay, 7);
  const bob = makeBob(zoe, installations, walletData);
  const bobInbox = bob.getInbox();
  bobInbox.receive(simoleanAssayRegKey, bobSimoleanPayment);

  bob.connectWith('alice', aliceInbox);
  alice.connectWith('bob', bobInbox);

  await alice.startSwap();

  const aliceWallet = alice.getWallet();
  const bobWallet = bob.getWallet();

  t.ok(moolaUnitOps.equals(aliceWallet.getBalance('moola'), moola(0)));
  t.ok(
    simoleanUnitOps.equals(aliceWallet.getBalance('simolean'), simoleans(7)),
  );

  t.ok(moolaUnitOps.equals(bobWallet.getBalance('moola'), moola(3)));
  t.ok(simoleanUnitOps.equals(bobWallet.getBalance('simolean'), simoleans(0)));

  t.end();
});
