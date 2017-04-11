'use strict';

import app from '../..';
import User from '../user/user.model';
import History from './history.model';

let history, user;

let genUser = function() {
  user = new User({
    provider: 'local',
    firstName: 'User',
    lastName: 'Fake',
    email: 'test@example.com',
    password: 'password'
  });
  return user;
};

let genHistory = function() {
  history = new History({
    userId: genUser()._id,
    actions: [{
      desc: 'Created fake action'
    }]
  });
  return history;
};

describe('History Model', () => {
  before(function() {
    return History.remove();
  });

  beforeEach(function() {
    genHistory();
  });

  afterEach(function() {
    return History.remove();
  });

  it('should begin with no histories', () => {
    return History.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should save history', () => {
    return history.save()
      .then(() => {
        return History.find({}).exec().should
          .eventually.have.length(1);
      });
  });
});
