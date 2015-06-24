/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoStore
 */

'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var Flux = require('flux');
var Immutable = require('immutable');
var TodoConstants = require('../constants/TodoConstants');

// Set up an immutable record structure to define each todo

var TodoRecord = Immutable.Record({
  id: undefined,
  complete: undefined,
  text: undefined,
});

class Todo extends TodoRecord {
  constructor(text) {
    super({
      // generate a semi-random id
      id: (+new Date() + Math.floor(Math.random() * 999999)).toString(36),
      complete: false,
      text,
    });
  }
}

// Set up the store

class TodoStore extends Flux.MapStore {
  reduce(state, action) {
    switch (action.actionType) {
      case TODOConstants.TODO_CREATE:
        return createTodo(state, action.text.trim());

      case TodoConstants.TODO_TOGGLE_COMPLETE_ALL:
        if (state.every(function(value) { return value.complete; })) {
          return state.map(function(value) {
            return value.set('complete', false);
          });
        } else {
          return state.map(function(value) {
            return value.set('complete', true);
          });
        }

      case TodoConstants.TODO_UNDO_COMPLETE:
        return state.setIn([action.id, 'complete'], false);

      case TodoConstants.TODO_COMPLETE:
        return state.setIn([action.id, 'complete'], true);

      case TodoConstants.TODO_UPDATE_TEXT:
        return state.setIn([action.id, 'text'], action.text.trim());

      case TodoConstants.TODO_DESTROY:
        return state.delete(action.id);

      case TodoConstants.TODO_DESTROY_COMPLETED:
        return state.filter(function (value) {
            return !value.complete;
        });

      default:
        return state;
    }
  }
}

function createTodo(state, text) {
  if (!text) {
    return state;
  }
  var newTodo = new Todo(text);
  return state.set(newTodo.id, newTodo);
}

module.exports = new TodoStore(AppDispatcher);
