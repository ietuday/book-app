'use strict';

import app from '../..';
import Mustread from './mustread.model';
import User from '../user/user.model';
import Book from '../book/book.model';

let mustread, user, book;

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

let genBook = function() {
  book = new Book({
    title: 'Example Book',
    author: 'Unknown'
  });
  return book;
};

let genMustread = function() {
  mustread = new Mustread({
    userId: genUser()._id,
    books: [genBook()._id]
  });
  return mustread;
};

describe('Mustread Model', () => {
  before(function() {
    return Mustread.remove();
  });

  beforeEach(function() {
    genMustread();
  });

  afterEach(function() {
    return Mustread.remove();
  });

  it('should begin with no mustreads', () => {
    return Mustread.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should save mustread book', () => {
    return mustread.save()
      .then(() => {
        return Mustread.find({}).exec().should
          .eventually.have.length(1);
      });
  });
});
