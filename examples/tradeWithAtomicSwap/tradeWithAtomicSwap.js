import { setupZoe } from '../setup/setupZoe';
import { moolaMint, moolaAssay } from '../setup/moolaMint';
import { simoleanMint, simoleanAssay } from '../setup/simoleanMint';
import { makeInitialPayment } from '../setup/initialPayments';

const performTrade = async () => {
  const { zoe, installations } = await setupZoe();
  const aliceMoolaPayment = makeInitialPayment(moolaMint, moolaAssay, 3);
  const aliceSimoleanPayment = makeInitialPayment(
    simoleanMint,
    simoleanAssay,
    0,
  );
  const alice = makeAlice(zoe, installations, bobInbox);

  const bobMoolaPayment = makeInitialPayment(moolaMint, moolaAssay, 0);
  const bobSimoleanPayment = makeInitialPayment(simoleanMint, simoleanAssay, 7);

  const bob = makeBob(zoe, installations);

  alice.performSwap(aliceMoolaPayment, aliceSimoleanPayment);
  bob.performSwap(bobMoolaPayment, bobSimoleanPayment);
};
