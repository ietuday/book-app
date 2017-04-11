'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mustreadCtrlStub = {
  get: 'mustreadCtrl.get',
  add: 'mustreadCtrl.add',
  remove: 'mustreadCtrl.remove'
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
var mustreadIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './mustread.controller': mustreadCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Mustread API Router', () => {
  it('should return an express router instance', function() {
    mustreadIndex.should.equal(routerStub);
  });

  describe('GET /api/mustread', function() {
    it('should be authenticated and route to mustread.controller.get', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'mustreadCtrl.get')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/mustread', function() {
    it('should be authenticated and route to mustread.controller.add', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'mustreadCtrl.add')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/mustread/:id', function() {
    it('should be authenticated and route to mustread.controller.remove', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'mustreadCtrl.remove')
        .should.have.been.calledOnce;
    });
  });
});
