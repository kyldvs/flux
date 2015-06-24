/*
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoStore-test
 */

jest.dontMock('../../constants/TodoConstants');
jest.dontMock('../TodoStore');
jest.dontMock('object-assign');

describe('TodoStore', function() {

  var TodoConstants = require('../../constants/TodoConstants');
  var AppDispatcher;
  var TodoStore;
  var callback;

  // mock actions
  var actionTodoCreate = {
    actionType: TodoConstants.TODO_CREATE,
    text: 'foo'
  };
  var actionTodoDestroy = {
    actionType: TodoConstants.TODO_DESTROY,
    id: 'replace me in test'
  };

  beforeEach(function() {
    AppDispatcher = require('../../dispatcher/AppDispatcher');
    AppDispatcher.isDispatching = jest.genMockFn().mockImpl(() => true);
    TodoStore = require('../TodoStore');
    callback = AppDispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    expect(AppDispatcher.register.mock.calls.length).toBe(1);
  });

  it('should initialize with no to-do items', function() {
    var all = TodoStore.getState();
    expect(all.toJS()).toEqual({});
  });

  it('creates a to-do item', function() {
    callback(actionTodoCreate);
    var state = TodoStore.getState();
    var id = state.first().id;
    expect(state.size).toBe(1);
    expect(TodoStore.get(id).text).toBe('foo');
  });

  it('destroys a to-do item', function() {
    callback(actionTodoCreate);
    var state = TodoStore.getState();
    var id = state.first().id;
    expect(state.size).toBe(1);
    expect(TodoStore.get(id).text).toBe('foo');

    actionTodoDestroy.id = id;
    callback(actionTodoDestroy);
    expect(TodoStore.getState().size).toBe(0);
  });

  it('can determine whether all to-do items are complete', function() {
    callback(actionTodoCreate);
    callback(actionTodoCreate);
    callback(actionTodoCreate);

    expect(TodoStore.areAllComplete()).toBe(false);

    TodoStore.getState().forEach(function (value) {
      callback({
        actionType: TodoConstants.TODO_COMPLETE,
        id: value.id
      });
    });

    expect(TodoStore.areAllComplete()).toBe(true);

    callback({
      actionType: TodoConstants.TODO_UNDO_COMPLETE,
      id: TodoStore.getState().first().id
    });

    expect(TodoStore.areAllComplete()).toBe(false);
  });

});
