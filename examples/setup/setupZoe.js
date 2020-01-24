import { makeZoe } from '@agoric/zoe';
import harden from '@agoric/harden';
import bundleSource from '@agoric/bundle-source';

// We'll import the contracts from the Zoe package rather than use the
// copies we have in `examples/`
import automaticRefund from '@agoric/zoe/src/contracts/automaticRefund';
import coveredCall from '@agoric/zoe/src/contracts/coveredCall';
import publicAuction from '@agoric/zoe/src/contracts/publicAuction';
import atomicSwap from '@agoric/zoe/src/contracts/atomicSwap';
import simpleExchange from '@agoric/zoe/src/contracts/simpleExchange';
import autoswap from '@agoric/zoe/src/contracts/autoswap';

// Normally, Zoe would already exist and we would have a long-lived
// reference to it. However, here in the sketchbook, we will need to
// set it up and install the contract.
export const setupZoe = async () => {
  const zoe = makeZoe({ require });

  const packAndInstall = contract =>
    bundleSource(contract).then(({ source, moduleFormat }) =>
      zoe.install(source, moduleFormat),
    );

  const installations = {
    automaticRefund: packAndInstall(automaticRefund),
    coveredCall: packAndInstall(coveredCall),
    publicAuction: packAndInstall(publicAuction),
    atomicSwap: packAndInstall(atomicSwap),
    simpleExchange: packAndInstall(simpleExchange),
    autoswap: packAndInstall(autoswap),
  };

  return harden({ zoe, installations });
};
