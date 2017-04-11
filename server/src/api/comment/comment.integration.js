'use strict';

import app from '../..';
import User from '../user/user.model';
import Book from '../book/book.model';
import Comment from './comment.model';
import request from 'supertest';

describe('Comment API', () => {
  let comment, user, book;

  let genUser = function() {
    return new User({
      provider: 'local',
      firstName: 'User',
      lastName: 'Fake',
      email: 'test@example.com',
      password: 'password'
    });
  };

  let genBook = function() {
    book = new Book({
      title: 'Example Book',
      author: 'Unknown'
    });
    return book;
  };

  before(() => {
    return Comment.remove().then(() => {
      genBook();
      user = genUser();

      return user.save();
    })
    .then(() => {
      comment = new Comment({
        bookId: book._id,
        messages: [{
          author: user._id,
          text: 'Test Comment'
        }]
      });

      return comment.save();
    })
  });

  after(() => {
    return User.remove()
      .then(() => {
        Comment.remove();
      });
  });

  describe('GET /api/comments/bookId', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return comments by bookId', (done) => {
      request(app)
        .get(`/api/comments/${book._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.messages.length).to.equal(1);
          expect(res.body.messages[0].text).to.equal('Test Comment');
          done();
        });
    });

    it('should respond with a 401 when not authenticated', (done) => {
      request(app)
        .get(`/api/comments/${book._id}`)
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/comments/bookId', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should push message if comment for book already exists', (done) => {
      request(app)
        .post(`/api/comments/${book._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          comment: 'Awesome Comment'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.bookId).to.equal(book._id.toString());
          expect(res.body.messages.length).to.equal(2);
          expect(res.body.messages[1].text).to.equal('Awesome Comment');
          done();
        });
    });

    it('should create new comment if comment for book not exists', (done) => {
      let anotherBook = genBook();
      request(app)
        .post(`/api/comments/${anotherBook._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          comment: 'Awesome Comment'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.messages.length).to.equal(1);
          expect(res.body.bookId).to.equal(anotherBook._id.toString());
          expect(res.body.messages[0].text).to.equal('Awesome Comment');
          done();
        });
    });

    it('should respond with a 401 when not authenticated', (done) => {
      let anotherBook = genBook();
      request(app)
        .post(`/api/comments/${anotherBook._id}`)
        .send({
          comment: 'Awesome Comment'
        })
        .expect(401)
        .end(done);
    });
  });
});
