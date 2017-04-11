'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var favouriteCtrlStub = {
  get: 'favouriteCtrl.get',
  add: 'favouriteCtrl.add',
  remove: 'favouriteCtrl.remove'
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
var favouriteIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './favourite.controller': favouriteCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Favourite API Router', () => {
  it('should return an express router instance', function() {
    favouriteIndex.should.equal(routerStub);
  });

  describe('GET /api/favourite', function() {
    it('should be authenticated and route to favourite.controller.get', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'favouriteCtrl.get')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/favourite', function() {
    it('should be authenticated and route to favourite.controller.add', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'favouriteCtrl.add')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/favourite/:id', function() {
    it('should be authenticated and route to favourite.controller.remove', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'favouriteCtrl.remove')
        .should.have.been.calledOnce;
    });
  });
});
