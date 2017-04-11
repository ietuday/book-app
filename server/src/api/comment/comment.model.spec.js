'use strict';

import app from '../..';
import Comment from './comment.model';
import User from '../user/user.model';
import Book from '../book/book.model';

let comment, user, book;

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

let genComment = function() {
  comment = new Comment({
    bookId: genBook()._id,
    messages: [{
      author: genUser()._id,
      text: 'My First comment'
    }]
  });
  return comment;
};

describe('Comment Model', () => {
  before(function() {
    return Comment.remove();
  });

  beforeEach(function() {
    genComment();
  });

  afterEach(function() {
    return Comment.remove();
  });

  it('should begin with no comments', () => {
    return Comment.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should save comment', () => {
    return comment.save()
      .then(() => {
        return Comment.find({}).exec().should
          .eventually.have.length(1);
      });
  });
});
