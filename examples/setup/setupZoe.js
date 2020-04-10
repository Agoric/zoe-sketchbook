import { makeZoe } from '@agoric/zoe';
import harden from '@agoric/harden';
import bundleSource from '@agoric/bundle-source';

const automaticRefund = `${__dirname}/../zoe-contracts-copied/automaticRefund.js`;
const coveredCall = `${__dirname}/../zoe-contracts-copied/coveredCall.js`;
const publicAuction = `${__dirname}/../zoe-contracts-copied/publicAuction.js`;
const atomicSwap = `${__dirname}/../zoe-contracts-copied/atomicSwap.js`;
const simpleExchange = `${__dirname}/../zoe-contracts-copied/simpleExchange.js`;
const autoswap = `${__dirname}/../zoe-contracts-copied/autoswap.js`;

// Normally, Zoe would already exist and we would have a long-lived
// reference to it. However, here in the sketchbook, we will need to
// set it up and install the contract.
export const setupZoe = async () => {
  const zoe = makeZoe({ require });

  const packAndInstall = (contractRoot) =>
    bundleSource(contractRoot).then(({ source, moduleFormat }) =>
      zoe.install(source, moduleFormat),
    );

  const installations = {
    automaticRefund: await packAndInstall(automaticRefund),
    coveredCall: await packAndInstall(coveredCall),
    publicAuction: await packAndInstall(publicAuction),
    atomicSwap: await packAndInstall(atomicSwap),
    simpleExchange: await packAndInstall(simpleExchange),
    autoswap: await packAndInstall(autoswap),
  };

  return harden({ zoe, installations });
};
