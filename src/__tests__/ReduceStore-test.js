/*
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
__DEV__ = true; // simulate dev environment to test if errors are thrown

jest
  .dontMock('immutable')
  .dontMock('../Dispatcher')
  .dontMock('../ReduceStore')
  .dontMock('../Store');

var Dispatcher = require('../Dispatcher');
var ReduceStore = require('../ReduceStore');

class FooStore extends ReduceStore {

  getInitialState() {
    return 'foo';
  }

  reduce(state, action) {
    switch (action.type) {
      case 'foo':
        return 'foo';
      case 'bar':
        return 'bar';
      case 'baz':
        return state + 'baz'
      default:
        return state;
    }
  }
}

describe('ReduceStore', () => {
  var dispatch;
  var onChange;
  var store;

  beforeEach(() => {
    var dispatcher = new Dispatcher();
    store = new FooStore(dispatcher);
    dispatch = dispatcher.dispatch.bind(dispatcher);
    onChange = jest.genMockFn();
    store.__emitChange = onChange;
  });

  it('should respond to actions', () => {
    expect(store.getState()).toBe('foo');
    dispatch({type: 'bar'});
    expect(onChange.mock.calls.length).toBe(1);
    expect(store.getState()).toBe('bar');
  });

  it('should not emit for empty changes', () => {
    expect(store.getState()).toBe('foo');
    dispatch({type: 'foo'});
    expect(onChange.mock.calls.length).toBe(0);
    expect(store.getState()).toBe('foo');
  });

  it('should keep updating state from the previous state', () => {
    expect(store.getState()).toBe('foo');

    dispatch({type: 'foo'});
    expect(onChange.mock.calls.length).toBe(0);
    expect(store.getState()).toBe('foo');

    dispatch({type: 'bar'});
    expect(onChange.mock.calls.length).toBe(1);
    expect(store.getState()).toBe('bar');

    dispatch({type: 'baz'});
    expect(onChange.mock.calls.length).toBe(2);
    expect(store.getState()).toBe('barbaz');

    dispatch({type: 'baz'});
    expect(onChange.mock.calls.length).toBe(3);
    expect(store.getState()).toBe('barbazbaz');
  });
});
