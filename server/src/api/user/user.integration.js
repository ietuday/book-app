'use strict';

import app from '../..';
import User from './user.model';
import request from 'supertest';
const normalize = require('path').normalize;

describe('User API:', function() {
  var user;

  // Clear users before testing
  before(function() {
    return User.remove().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      });

      return user.save();
    });
  });

  // Clear users after testing
  after(function() {
    return User.remove();
  });

  describe('POST /api/users', () => {
    it('should create new user and return token', (done) => {
      request(app)
        .post('/api/users')
        .send({
          firstName: 'User',
          lastName: 'Test',
          email: 'test@test.com',
          password: '2222222'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body).to.include.keys('token');
          done();
        });
    });
  });

  describe('PUT /api/users/:id', () => {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@test.com',
          password: '2222222'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should update an existing user when authenticated', (done) => {
      request(app)
        .put(`/api/users/${user._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          firstName: 'User1',
          lastName: 'Test',
          email: 'test2@test.com'
        })
        .expect(200)
        .end((err, res) => {
          res.body.firstName.should.equal('User1');
          res.body.lastName.should.equal('Test');
          res.body.email.should.equal('test2@test.com');
          done();
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .put(`/api/users/${user._id}`)
        .expect(401)
        .end(done);
    });
  });

  describe('PUT /api/users/:id/avatar', () => {
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

    it('should save avatar', (done) => {
      request(app)
        .put(`/api/users/${user._id}/avatar`)
        .set('authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', normalize(__dirname + '/../../../fs/uploads/default-avatar.png'))
        .expect(200)
        .end(() => {
          done();
        });
    });
  });

  describe('GET /api/users/me', function() {
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

    it('should respond with a user profile when authenticated', function(done) {
      request(app)
        .get('/api/users/me')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body._id.toString().should.equal(user._id.toString());
          done();
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get('/api/users/me')
        .expect(401)
        .end(done);
    });
  });

  describe('PUT /api/users/:id/password', function() {
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

    it('should save new password when authenticated and old password is correct', function(done) {
      request(app)
        .put(`/api/users/${user._id}/password`)
        .set('authorization', `Bearer ${token}`)
        .send({
          newPassword: '1111111',
          oldPassword: 'password'
        })
        .expect(200)
        .end((err) => {
          done();
        });
    });

    it('should respond with 403 when authenticated and old password is not correct', function(done) {
      request(app)
        .put(`/api/users/${user._id}/password`)
        .set('authorization', `Bearer ${token}`)
        .send({
          newPassword: '1111111',
          oldPassword: '2222222'
        })
        .expect(403)
        .end(() => {
          done();
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .put(`/api/users/${user._id}/password`)
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/users/forgot', () => {
    it('should return token if email exists', (done) => {
      request(app)
        .post('/api/users/forgot')
        .send({
          email: 'test@example.com'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body).to.include.keys('token');
          done();
        });
    });

    it('should return 401 if email not exists', (done) => {
      request(app)
        .post('/api/users/forgot')
        .send({
          email: 'test2@example.com'
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.message.should.equal('Email not found!');
          done();
        });
    });
  });

  describe('POST /api/users/reset', () => {
    let token;

    before(function(done) {
      request(app)
        .post('/api/users/forgot')
        .send({
          email: 'test@example.com'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should save new password and return token if token exists', (done) => {
      request(app)
        .post(`/api/users/reset/${token}`)
        .send({
          password: '1111111'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body).to.include.keys('token');
          done();
        });
    });

    it('should return 401 if token not exists', (done) => {
      request(app)
        .post(`/api/users/reset/fake_token`)
        .send({
          password: '1111111'
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.message.should.equal('Token not found!');
          done();
        });
    });
  });
});
