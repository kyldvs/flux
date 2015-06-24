/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Container
 * @flow
 */

'use strict';

var StoreGroup = require('./StoreGroup');

var invariant = require('./invariant');

/**
 * A Container is used to subscribe a react component to multiple stores.
 * The stores that are used must be returned from a static `getStores()` method.
 *
 * The component receives information from the stores via state. The state
 * is generated using a static `calculateState()` method that each container
 * must implement. A simple container may look like:
 *
 *   var Flux = require('flux');
 *
 *   class FooContainer extends React.Component {
 *     static getStores() {
 *       return [FooStore];
 *     }
 *
 *     static calculateState(prevState) {
 *       return {
 *         someNumber: FooStore.getState(),
 *       };
 *     }
 *
 *     render() {
 *       return (
 *         <Foo someNumber={this.state.someNumber} />
 *       );
 *     }
 *   }
 *
 *   module.exports = Flux.Container.create(FooContainer);
 *
 * This container will only `setState` not replace it, so you should always
 * return every key in your state object.
 */
function create<DefaultProps, Props, State>(
  BaseClass: any
): ReactClass<DefaultProps, Props, State> {
  enforceInterface(BaseClass);
  class ContainerClass extends BaseClass {
    _fluxContainerStoreGroup: StoreGroup;
    _fluxContainerSubscriptionsTokens: Array<Object>;

    constructor(props: any) {
      super(props);
      this.state = BaseClass.calculateState(null);
    }

    componentDidMount(): void {
      if (super.componentDidMount) {
        super.componentDidMount();
      }

      var stores = BaseClass.getStores();

      // This tracks when any store has changed and we may need to update.
      var changed = false;
      var setChanged = () => {changed = true;};

      // This adds subscriptions to stores. When a store changes all we do is
      // set changed to true.
      this._fluxContainerSubscriptionsTokens = stores.map(
        store => store.addListener(setChanged)
      );

      // This callback is called after the dispatch of the relevant stores. If
      // any have reported a change we update the state, then reset changed.
      var callback = () => {
        if (changed) {
          this.setState(prevState => BaseClass.calculateState(this.state));
        }
        changed = false;
      };
      this._fluxContainerStoreGroup = new StoreGroup(stores, callback);
    }

    componentWillUnmount(): void {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      this._fluxContainerStoreGroup.release();
      this._fluxContainerSubscriptionsTokens.forEach(token => token.remove());
      this._fluxContainerSubscriptionsTokens = [];
    }
  }
  return (ContainerClass: any);
}

function enforceInterface(o: any): void {
  invariant(
    o.getStores,
    'Components that use Container must implement `static getStores()`'
  );
  invariant(
    o.calculateState,
    'Components that use Container must implement `static calculateState()`'
  );
}

module.exports = {create};
