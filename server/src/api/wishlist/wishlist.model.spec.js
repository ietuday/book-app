'use strict';

import app from '../..';
import Wishlist from './wishlist.model';
import User from '../user/user.model';
import Book from '../book/book.model';

let wishlist, user, book;

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

let genWishlist = function() {
  wishlist = new Wishlist({
    userId: genUser()._id,
    books: [genBook()._id]
  });
  return wishlist;
};

describe('Wishlist Model', () => {
  before(function() {
    return Wishlist.remove();
  });

  beforeEach(function() {
    genWishlist();
  });

  afterEach(function() {
    return Wishlist.remove();
  });

  it('should begin with no wishlists', () => {
    return Wishlist.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should save wishlist', () => {
    return wishlist.save()
      .then(() => {
        return Wishlist.find({}).exec().should
          .eventually.have.length(1);
      });
  });
});
