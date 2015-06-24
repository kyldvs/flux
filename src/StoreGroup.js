/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule StoreGroup
 * @flow
 */

'use strict';

import type Dispatcher from './Dispatcher';
import type Store from './Store';

var invariant = require('./invariant');

/**
 * StoreGroup allows you to execute a callback on every dispatch after
 * waiting for each of the given stores.
 */
class StoreGroup {
  _dispatcher: Dispatcher;
  _dispatchToken: string;

  constructor(stores: Array<Store>, callback: Function): void {
    this._dispatcher = _getUniformDispatcher(stores);

    // precompute store tokens
    var storeTokens = stores.map(store => store.getDispatchToken());

    // register with the dispatcher
    this._dispatchToken = this._dispatcher.register(payload => {
      this._dispatcher.waitFor(storeTokens);
      callback();
    });
  }

  release(): void {
    this._dispatcher.unregister(this._dispatchToken);
  }
}

function _getUniformDispatcher(stores: Array<Store>): Dispatcher {
  invariant(
    stores && stores.length,
    'Must provide at least one store to StoreGroup'
  );
  var dispatcher = stores[0].getDispatcher();
  if (__DEV__) {
    for (var i = 0; i < stores.length; i++) {
      var store = stores[i];
      invariant(
        store.getDispatcher() === dispatcher,
        'All stores in a StoreGroup must use the same dispatcher'
      );
    }
  }
  return dispatcher;
}

module.exports = StoreGroup;
