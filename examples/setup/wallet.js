import harden from '@agoric/harden';
import { makePrivateName } from '@agoric/ertp/util/PrivateName';

// {
//   assay,
//   regKey,
//   petname,
// }

const makeWallet = initialWalletData => {
  const petnameToPurse = makePrivateName();
  const petnameToAssay = makePrivateName();
  const petnameToUnitOps = makePrivateName();
  const regKeyToAssayPetname = makePrivateName();
  const assayPetnameToRegKey = makePrivateName();

  const assayPetnameToCallback = makePrivateName();

  // contacts
  const petnameToInbox = makePrivateName();

  // external facet. Arguments should not be trusted.
  const inbox = harden({
    receive: (assayRegKey, payment) => {
      const assayPetname = regKeyToAssayPetname.get(assayRegKey);
      // TODO: have more than one purse per assay
      const purse = petnameToPurse.get(assayPetname);

      const callback = assayPetnameToCallback(assayPetname);
      purse.depositAll(payment).then(callback);
    },
  });

  // This API is for internal use and is in terms of user's petnames
  const wallet = harden({
    deposit: (pursePetName, payment) => {
      const purse = petnameToPurse.get(pursePetName);
      purse.depositAll(payment);
    },
    withdraw: (pursePetName, units) => {
      const purse = petnameToPurse.get(pursePetName);
      purse.withdraw(units);
    },
    addAssay: (assayPetname, regKey, assay) => {
      petnameToAssay.init(assayPetname, assay);
      regKeyToAssayPetname(regKey, assayPetname);
      assayPetnameToRegKey(assayPetname, regKey);
      petnameToUnitOps.init(assayPetname, assay.getUnitOps());
    },
    makeEmptyPurse: (assayPetname, pursePetname, memo = 'purse') => {
      const assay = petnameToAssay.get(assayPetname);
      const purse = assay.makeEmptyPurse(memo);
      petnameToPurse.init(pursePetname, purse);
    },
    getUnitOps: petnameToUnitOps.get,
    getAssay: petnameToAssay.get,

    getInbox: () => inbox,

    connectWith: (petname, otherInbox) => {
      petnameToInbox.init(petname, otherInbox);
    },
    send: (inboxPetname, assayPetname, payment) => {
      const otherInbox = petnameToInbox.get(inboxPetname);
      const assayRegKey = assayPetnameToRegKey.get(assayPetname);
      otherInbox.receive(assayRegKey, payment);
    },
    registerCallback: (assayPetname, callback) =>
      assayPetnameToCallback.init(assayPetname, callback),
    getBalance: pursePetname => petnameToPurse.get(pursePetname).getBalance(),
  });

  // initialize with starting assays and purses
  initialWalletData.assays.forEach(({ assay, regKey, petname }) => {
    wallet.addAssay(petname, regKey, assay);
    // reuse assay petname for purse petname
    wallet.makeEmptyPurse(petname, petname);
  });

  return wallet;
};

export default makeWallet;
