'use strict';

import app from '../..';
import User from '../user/user.model';
import Book from '../book/book.model';
import Mustread from './mustread.model';
import request from 'supertest';

describe('Mustread API', () => {
  let mustread, user, book;

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
    return book.save();
  };

  before(() => {
    return Mustread.remove().then(() => {
      genBook();
      user = genUser();
      return user.save();
    })
      .then(() => {
        mustread = new Mustread({
          userId: user._id,
          books: [book._id]
        });
        return mustread.save();
      });
  });

  after(() => {
    return User.remove()
      .then(() => {
        return Mustread.remove();
      })
      .then(() => {
        return Book.remove();
      });
  });

  describe('GET /api/mustread', () => {
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

    it('should return mustreads by userId', (done) => {
      request(app)
        .get(`/api/mustread`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.books.length).to.equal(1);
          expect(res.body.books[0].title).to.equal('Example Book');
          done();
        });
    });

    it('should respond with a 401 when not authenticated', (done) => {
      request(app)
        .get(`/api/mustread`)
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/mustread', () => {
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

    it('should push new book into mustreads', (done) => {
      let anotherBook = new Book({
        title: 'Example Book 2',
        author: 'Unknown'
      });

      request(app)
        .post(`/api/mustread`)
        .set('authorization', `Bearer ${token}`)
        .send({
          bookId: anotherBook._id
        })
        .expect(200)
        .end(done);
    });

    it('should respond with 400 if bookId not passed', (done) => {
      request(app)
        .post(`/api/mustread`)
        .set('authorization', `Bearer ${token}`)
        .send({
          bookId: null
        })
        .expect(400)
        .end(done);
    });

    it('should respond with a 401 when not authenticated', (done) => {
      let anotherBook = new Book({
        title: 'Example Book 2',
        author: 'Unknown'
      });

      request(app)
        .post(`/api/mustread`)
        .send({
          bookId: anotherBook._id
        })
        .expect(401)
        .end(done);
    });
  });

  describe('DELETE /api/mustread/:id', () => {
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

    it('should remove book from mustreads', (done) => {
      request(app)
        .delete(`/api/mustread/${book._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .end(done);
    });

    it('should respond with 400 if book not found in mustreads', (done) => {
      request(app)
        .delete(`/api/mustread/fake_book`)
        .set('authorization', `Bearer ${token}`)
        .expect(400)
        .end(done);
    });

    it('should respond with a 401 when not authenticated', (done) => {
      request(app)
        .delete(`/api/mustread/${book._id}`)
        .expect(401)
        .end(done);
    });
  });
});
