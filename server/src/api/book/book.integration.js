'use strict';

import app from '../..';
import Book from './book.model';
import User from '../user/user.model';
import request from 'supertest';
const normalize = require('path').normalize;

describe('Book API:', function() {
  var user, admin, book, updateBook, epubUrl;

  // Clear users and books before testing
  before(() => {
    return User.remove()
      .then(() => {
        admin = new User({
          name: 'Fake Admin',
          email: 'admin@example.com',
          password: 'password',
          roles: ['admin']
        });

        return admin.save();
      })
      .then(() => {
        user = new User({
          name: 'Fake User',
          email: 'user@example.com',
          password: 'password'
        });

        return user.save();
      })
      .then(() => {
        return Book.remove();
      })
      .then(() => {
        book = new Book({
          title: 'Example Book',
          author: 'Unknown',
          paid: true,
          views: 3
        });

        return book.save();
      })
      .then(() => {
        updateBook = new Book({
          title: 'Book for update',
          author: 'Unknown',
          paid: false,
          rating: 5
        });

        return updateBook.save();
      })
      .then(() => {
        let book = new Book({
          title: 'Book 2',
          author: 'Author 2',
          paid: true
        });

        return book.save();
      });
  });

  // Clear users and books after testing
  after(() => {
    return User.remove()
      .then(() => {
        return Book.remove();
      });
  });

  describe('GET /api/books', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return paid books', (done) => {
      request(app)
        .get('/api/books?paid=true')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.length).to.equal(2);
          done();
        });
    });

    it('should return unpaid books', (done) => {
      request(app)
        .get('/api/books?paid=false')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body[0].title).to.equal('Book for update');
          expect(res.body[0].author).to.equal('Unknown');
          done();
        });
    });

    it('should return paid books sorted by added date', (done) => {
      request(app)
        .get('/api/books?paid=true&sort=added_at')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body[0].title).to.equal('Book 2');
          expect(res.body[0].author).to.equal('Author 2');
          done();
        });
    });

    it('should return paid books sorted by views', (done) => {
      request(app)
        .get('/api/books?paid=true&sort=views')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body[0].title).to.equal('Example Book');
          expect(res.body[0].author).to.equal('Unknown');
          done();
        });
    });

    it('should return paid books sorted by title', (done) => {
      request(app)
        .get('/api/books?paid=true')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body[0].title).to.equal('Book 2');
          expect(res.body[0].author).to.equal('Author 2');
          done();
        });
    });

    it('should find books by title', (done) => {
      request(app)
        .get('/api/books?paid=true&search=exam')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body[0].title).to.equal('Example Book');
          expect(res.body[0].author).to.equal('Unknown');
          done();
        });
    });

    it('should find books by author', (done) => {
      request(app)
        .get('/api/books?paid=true&search=auth')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.length).to.equal(1);
          done();
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get(`/api/books?paid=true`)
        .expect(401)
        .end(done);
    });
  });

  describe('GET /api/books/best_books', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return best books', (done) => {
      request(app)
        .get('/api/books/best_books')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.length).to.equal(1);
          expect(res.body[0].title).to.equal('Book for update');
          done();
        });
    });

    it('should return 401 when not authenticated', (done) => {
      request(app)
        .get('/api/books/best')
        .expect(401)
        .end(done);
    });
  });

  describe('GET /api/books/:slug', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return book by slug', (done) => {
      request(app)
        .get('/api/books/book-2')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.title).to.equal('Book 2');
          done();
        });
    });

    it('should return 401 when not authenticated', (done) => {
      request(app)
        .get('/api/books/book-2')
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/books', () => {
    describe('With admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'admin@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should create new book', (done) => {
        request(app)
          .post('/api/books')
          .set('authorization', `Bearer ${token}`)
          .send({
            title: 'Example Book 2',
            author: 'Unknown 2'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.body.title).to.equal('Example Book 2');
            expect(res.body.author).to.equal('Unknown 2');
            done();
          });
      });
    });

    describe('Without admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'user@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should return 403 when not have admin role', (done) => {
        request(app)
          .post('/api/books')
          .set('authorization', `Bearer ${token}`)
          .send({
            title: 'Example Book 2',
            author: 'Unknown 2'
          })
          .expect(403)
          .end(done);
      });
    });
  });

  describe('PUT /api/books/:slug', () => {
    describe('With admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'admin@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should update book', (done) => {
        request(app)
          .put(`/api/books/${updateBook.slug}`)
          .set('authorization', `Bearer ${token}`)
          .send({
            title: 'Book Updated',
            author: 'Unknown 2'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.body.title).to.equal('Book Updated');
            expect(res.body.author).to.equal('Unknown 2');
            done();
          });
      });
    });

    describe('Without admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'user@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should return 403 when not have admin role', (done) => {
        request(app)
          .put(`/api/books/${updateBook.slug}`)
          .set('authorization', `Bearer ${token}`)
          .send({
            title: 'Book Updated',
            author: 'Unknown 2'
          })
          .expect(403)
          .end(done);
      });
    });
  });

  describe('PUT /api/books/:slug/cover', () => {
    describe('With admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'admin@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should update cover', (done) => {
        request(app)
          .put(`/api/books/${book.slug}/cover`)
          .set('authorization', `Bearer ${token}`)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', normalize(__dirname + '/../../../fs/uploads/default-avatar.png'))
          .expect(200)
          .end((err, res) => {
            res.body.coverUrl.should.contain('/fs/books/covers');
            done();
          });
      });
    });

    describe('Without admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'user@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should respond with a 403 when not have admin role', function(done) {
        request(app)
          .put(`/api/books/${book.slug}/cover`)
          .set('authorization', `Bearer ${token}`)
          .expect(403)
          .end(done);
      });
    });
  });

  describe('PUT /api/books/:slug/epub', () => {
    describe('With admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'admin@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should save epub', (done) => {
        request(app)
          .put(`/api/books/${book.slug}/epub`)
          .set('authorization', `Bearer ${token}`)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', normalize(__dirname + '/../../../fs/uploads/The Island of Dr. Moreau - H. G. Wells.epub'))
          .expect(200)
          .end((err, res) => {
            epubUrl = res.body.epubUrl;
            res.body.epubUrl.should.contain('/fs/books/epubs');
            done();
          });
      });

      describe('Without admin role', () => {
        var token;

        before(function(done) {
          request(app)
            .post('/auth/local')
            .send({
              email: 'user@example.com',
              password: 'password'
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              token = res.body.token;
              done();
            });
        });

        it('should respond with a 403 when not authenticated', function(done) {
          request(app)
            .put(`/api/books/${book.slug}/epub`)
            .set('authorization', `Bearer ${token}`)
            .expect(403)
            .end(done);
        });
      });
    });
  });

  describe('PUT /api/books/:id/rate', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should rate a book when authenticated', (done) => {
      request(app)
        .put(`/api/books/${book._id}/rate`)
        .set('authorization', `Bearer ${token}`)
        .send({ rating: 5 })
        .expect(200)
        .end(done);
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .put(`/api/books/${book._id}/rate`)
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/books/:id/buy', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should send link for downloading when authenticated', (done) => {
      request(app)
        .post(`/api/books/${book._id}/buy`)
        .set('authorization', `Bearer ${token}`)
        .send({ card: '456' })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          done();
          expect(res.body.url).to.contain(epubUrl);
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .post(`/api/books/${book._id}/buy`)
        .expect(401)
        .end(done);
    });
  });

  describe('DELETE /api/books/:slug', () => {
    describe('With admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'admin@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should delete book with all related files', (done) => {
        request(app)
          .delete(`/api/books/${book.slug}`)
          .set('authorization', `Bearer ${token}`)
          .expect(200)
          .end(done);
      });
    });

    describe('Without admin role', () => {
      var token;

      before(function(done) {
        request(app)
          .post('/auth/local')
          .send({
            email: 'user@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });

      it('should return 403 when not have admin role', (done) => {
        request(app)
          .delete(`/api/books/${book.slug}`)
          .set('authorization', `Bearer ${token}`)
          .expect(403)
          .end(done);
      });
    });
  });
});
