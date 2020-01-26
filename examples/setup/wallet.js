import harden from '@agoric/harden';
import makeStore from './store';

// {
//   assay,
//   regKey,
//   petname,
// }

const makeWallet = initialWalletData => {
  const petnameToPurse = makeStore();
  const petnameToAssay = makeStore();
  const petnameToUnitOps = makeStore();
  const regKeyToAssayPetname = makeStore();
  const assayPetnameToRegKey = makeStore();

  const assayPetnameToCallback = makeStore();

  // contacts
  const petnameToInbox = makeStore();

  // external facet. Arguments should not be trusted.
  const inbox = harden({
    receive: (assayRegKey, payment) => {
      const assayPetname = regKeyToAssayPetname.get(assayRegKey);
      // TODO: have more than one purse per assay
      const purse = petnameToPurse.get(assayPetname);

      if (assayPetnameToCallback.has(assayPetname)) {
        const callback = assayPetnameToCallback.get(assayPetname);
        const assay = petnameToAssay.get(assayPetname);
        assay.claimAll(payment).then(callback);
      } else {
        purse.depositAll(payment);
      }
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
      return purse.withdraw(units);
    },
    addAssay: (assayPetname, regKey, assay) => {
      petnameToAssay.init(assayPetname, assay);
      regKeyToAssayPetname.init(regKey, assayPetname);
      assayPetnameToRegKey.init(assayPetname, regKey);
      petnameToUnitOps.init(assayPetname, assay.getUnitOps());
    },
    makeEmptyPurse: (assayPetname, pursePetname, memo = 'purse') => {
      const assay = petnameToAssay.get(assayPetname);
      const purse = assay.makeEmptyPurse(memo);
      petnameToPurse.init(pursePetname, purse);
    },
    getUnitOps: petname => petnameToUnitOps.get(petname),
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
