'use strict';

import app from '../..';
import User from '../user/user.model';
import History from './history.model';
import request from 'supertest';

describe('History API', () => {
  let history, user;

  let genUser = function() {
    return new User({
      provider: 'local',
      firstName: 'User',
      lastName: 'Fake',
      email: 'test@example.com',
      password: 'password'
    });
  };

  before(() => {
    return History.remove().then(() => {
      user = genUser();
      return user.save();
    })
      .then(() => {
        history = new History({
          userId: user._id,
          actions: [{
            desc: 'Test Action'
          }]
        });

        return history.save();
      })
  });

  after(() => {
    return User.remove()
      .then(() => {
        History.remove();
      });
  });

  describe('GET /api/history', () => {
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

    it('should return history by userId', (done) => {
      request(app)
        .get(`/api/history`)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.actions.length).to.equal(1);
          expect(res.body.actions[0].desc).to.equal('Test Action');
          done();
        });
    });

    it('should respond with a 401 when not authenticated', (done) => {
      request(app)
        .get(`/api/history`)
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/history', () => {
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

    it('should push action if history for user already exists', (done) => {
      request(app)
        .post(`/api/history`)
        .set('authorization', `Bearer ${token}`)
        .send({
          desc: 'Awesome Action'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.userId).to.equal(user._id.toString());
          expect(res.body.actions.length).to.equal(2);
          expect(res.body.actions[1].desc).to.equal('Awesome Action');
          done();
        });
    });

    it('should respond with a 401 when not authenticated', (done) => {
      request(app)
        .post(`/api/history`)
        .send({
          desc: 'Awesome Action'
        })
        .expect(401)
        .end(done);
    });
  });
});
