// Copyright (C) 2019 Agoric, under Apache license 2.0

import harden from '@agoric/harden';
import { assert, details } from '@agoric/assert';

/**
 * Distinguishes between adding a new key (init) and updating or
 * referencing a key (get, set, delete).
 *
 * `init` is only allowed if the key does not already exist. `Get`,
 * `set` and `delete` are only allowed if the key does already exist.
 * @param  {string} keyName - the column name for the key
 */
function makeStore(keyName = 'key') {
  const wm = new Map();
  const insistKeyDoesNotExist = key =>
    assert(!wm.has(key), details`${key} already registered`);
  const insistKeyExists = key =>
    assert(wm.has(key), details`${key} not found: `);
  return harden({
    has: key => wm.has(key),
    init: (key, value) => {
      insistKeyDoesNotExist(key);
      wm.set(key, value);
    },
    get: key => {
      insistKeyExists(key);
      return wm.get(key);
    },
    set: (key, value) => {
      insistKeyExists(key);
      wm.set(key, value);
    },
    delete: key => {
      insistKeyExists(key);
      wm.delete(key);
    },
  });
}
harden(makeStore);
export default makeStore;
