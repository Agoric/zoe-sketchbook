import harden from '@agoric/harden';

import { makeRegistrar } from '@agoric/ertp/more/registrar/registrar';

import { setupZoe } from '../setup/setupZoe';
import { moolaMint, moolaAssay } from '../setup/moolaMint';
import { simoleanMint, simoleanAssay } from '../setup/simoleanMint';
import { makeInitialPayment } from '../setup/initialPayments';

import makeBob from './bob';
import makeAlice from './alice';

const performTrade = async () => {
  const { zoe, installations } = await setupZoe();

  const inviteAssay = zoe.getInviteAssay();

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

  // kick off the swap
  alice.startSwap();
};
