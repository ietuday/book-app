'use strict';

import app from '../..';
import User from './user.model';
var user;
var genUser = function() {
  user = new User({
    provider: 'local',
    firstName: 'User',
    lastName: 'Fake',
    email: 'test@example.com',
    password: 'password'
  });
  return user;
};

describe('User Model', function() {
  before(function() {
    // Clear users before testing
    return User.remove();
  });

  beforeEach(function() {
    genUser();
  });

  afterEach(function() {
    return User.remove();
  });

  it('should begin with no users', function() {
    return User.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should fail when saving a duplicate user', function() {
    return user.save()
      .then(function() {
        var userDup = genUser();
        return userDup.save();
      }).should.be.rejected;
  });

  it('should fail when firstName was not provided', function() {
    user.firstName = '';
    return user.save().should.be.rejected;
  });

  it('should fail when lastName was not provided', function() {
    user.lastName = '';
    return user.save().should.be.rejected;
  });

  it('should saved with "user" role', function() {
    return user.save()
      .then(() => {
        return User.find({}).exec();
      })
      .then(user => {
        user[0].roles.should.contain('user');
      });
  });

  describe('#email', function() {
    it('should fail when saving with a blank email', function() {
      user.email = '';
      return user.save().should.be.rejected;
    });

    it('should fail when saving with an invalid email', function() {
      user.email = 'email';
      return user.save().should.be.rejected;
    });
  });

  describe('#password', function() {
    it('should fail when saving with a blank password', function() {
      user.password = '';
      return user.save().should.be.rejected;
    });

    it('should fail when saving with password less than 6 chars', function() {
      user.password = 'pass';
      return user.save().should.be.rejected;
    });

    describe('given the user has been previously saved', function() {
      beforeEach(function() {
        return user.save();
      });

      it('should authenticate user if valid', function() {
        user.authenticate('password').should.be.true;
      });

      it('should not authenticate user if invalid', function() {
        user.authenticate('blah').should.not.be.true;
      });

      it('should remain the same hash unless the password is updated', function() {
        user.lastName = 'Test';
        return user.save()
          .then(function(u) {
            return u.authenticate('password');
          }).should.eventually.be.true;
      });
    });
  });
});
