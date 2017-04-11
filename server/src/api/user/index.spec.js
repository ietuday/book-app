'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var userCtrlStub = {
  me: 'userCtrl.me',
  changePassword: 'userCtrl.changePassword',
  changeAvatar: 'userCtrl.changeAvatar',
  create: 'userCtrl.create',
  update: 'userCtrl.update',
  forgot: 'userCtrl.forgot',
  reset: 'userCtrl.reset'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return `authService.hasRole.${role}`;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var userIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './user.controller': userCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('User API Router:', function() {
  it('should return an express router instance', function() {
    userIndex.should.equal(routerStub);
  });

  describe('GET /api/users/me', function() {
    it('should be authenticated and route to user.controller.me', function() {
      routerStub.get
        .withArgs('/me', 'authService.isAuthenticated', 'userCtrl.me')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/users/:id/password', function() {
    it('should be authenticated and route to user.controller.changePassword', function() {
      routerStub.put
        .withArgs('/:id/password', 'authService.isAuthenticated', 'userCtrl.changePassword')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/users', function() {
    it('should route to user.controller.create', function() {
      routerStub.post
        .withArgs('/', 'userCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/users', function() {
    it('should route to user.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'userCtrl.update')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/users/:id/avatar', function() {
    it('should be authenticated and route to user.controller.changePassword', function() {
      routerStub.put
        .withArgs('/:id/avatar', 'authService.isAuthenticated', 'userCtrl.changeAvatar')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/users/forgot', function() {
    it('should route to user.controller.forgot', function() {
      routerStub.post
        .withArgs('/forgot', 'userCtrl.forgot')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/users/reset', function() {
    it('should route to user.controller.reset', function() {
      routerStub.post
        .withArgs('/reset/:token', 'userCtrl.reset')
        .should.have.been.calledOnce;
    });
  });
});
