import harden from '@agoric/harden';
import makeStore from '@agoric/store';

const makeWallet = (initialWalletData) => {
  const petnameToPurse = makeStore();
  const petnameToIssuer = makeStore();
  const petnameToAmountMath = makeStore();
  const regKeyToIssuerPetname = makeStore();
  const issuerPetnameToRegKey = makeStore();

  const issuerPetnameToCallback = makeStore();

  // contacts
  const petnameToInbox = makeStore();

  // external facet. Arguments should not be trusted.
  const inbox = harden({
    receive: (issuerRegKey, payment) => {
      const issuerPetname = regKeyToIssuerPetname.get(issuerRegKey);
      // TODO: allow more than one purse per issuer
      const purse = petnameToPurse.get(issuerPetname);

      if (issuerPetnameToCallback.has(issuerPetname)) {
        const callback = issuerPetnameToCallback.get(issuerPetname);
        const issuer = petnameToIssuer.get(issuerPetname);
        issuer.claim(payment).then(callback);
      } else {
        purse.deposit(payment);
      }
    },
  });

  // This API is for internal use and is in terms of user's petnames
  const wallet = harden({
    deposit: (pursePetName, payment) => {
      const purse = petnameToPurse.get(pursePetName);
      purse.deposit(payment);
    },
    withdraw: (pursePetName, units) => {
      const purse = petnameToPurse.get(pursePetName);
      return purse.withdraw(units);
    },
    addIssuer: (issuerPetname, regKey, issuer) => {
      petnameToIssuer.init(issuerPetname, issuer);
      regKeyToIssuerPetname.init(regKey, issuerPetname);
      issuerPetnameToRegKey.init(issuerPetname, regKey);
      petnameToAmountMath.init(issuerPetname, issuer.getAmountMath());
    },
    makeEmptyPurse: (issuerPetname, pursePetname, memo = 'purse') => {
      const issuer = petnameToIssuer.get(issuerPetname);
      const purse = issuer.makeEmptyPurse(memo);
      petnameToPurse.init(pursePetname, purse);
    },
    getAmountMath: (petname) => petnameToAmountMath.get(petname),
    getIssuer: petnameToIssuer.get,

    getInbox: () => inbox,

    connectWith: (petname, otherInbox) => {
      petnameToInbox.init(petname, otherInbox);
    },
    send: (inboxPetname, issuerPetname, payment) => {
      const otherInbox = petnameToInbox.get(inboxPetname);
      const issuerRegKey = issuerPetnameToRegKey.get(issuerPetname);
      otherInbox.receive(issuerRegKey, payment);
    },
    registerCallback: (issuerPetname, callback) =>
      issuerPetnameToCallback.init(issuerPetname, callback),
    getBalance: (pursePetname) =>
      petnameToPurse.get(pursePetname).getCurrentAmount(),
  });

  // initialize with starting issuers and purses
  initialWalletData.issuers.forEach(({ issuer, regKey, petname }) => {
    wallet.addIssuer(petname, regKey, issuer);
    // reuse issuer petname for purse petname
    wallet.makeEmptyPurse(petname, petname);
  });

  return wallet;
};

export default makeWallet;
