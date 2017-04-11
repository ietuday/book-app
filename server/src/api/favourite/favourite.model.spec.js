'use strict';

import app from '../..';
import Favourite from './favourite.model';
import User from '../user/user.model';
import Book from '../book/book.model';

let favourite, user, book;

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

let genFavourite = function() {
  favourite = new Favourite({
    userId: genUser()._id,
    books: [genBook()._id]
  });
  return favourite;
};

describe('Favourite Model', () => {
  before(function() {
    return Favourite.remove();
  });

  beforeEach(function() {
    genFavourite();
  });

  afterEach(function() {
    return Favourite.remove();
  });

  it('should begin with no favourites', () => {
    return Favourite.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should save favourite book', () => {
    return favourite.save()
      .then(() => {
        return Favourite.find({}).exec().should
          .eventually.have.length(1);
      });
  });
});
