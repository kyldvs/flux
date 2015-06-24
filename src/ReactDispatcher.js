/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDispatcher
 * @flow
 */

'use strict';

var Dispatcher = require('./Dispatcher');
var React = require('react/addons');

/**
 * This is a very simple extension of Dispatcher that places each dispatch
 * within React.addons.batchedUpdates(). This ensures that all React components
 * render in a single batch once all stores have had a chance to respond to the
 * action.
 *
 * This prevents react components from rendering with an inconsistent view of
 * the data within stores.
 */
class ReactDispatcher extends Dispatcher {
  dispatch(action: Object): void {
    React.addons.batchedUpdates(() => {
      super.dispatch(action);
    });
  }
}

module.exports = ReactDispatcher;
