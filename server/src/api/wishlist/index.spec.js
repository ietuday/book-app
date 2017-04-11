'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var wishlistCtrlStub = {
  get: 'wishlistCtrl.get',
  add: 'wishlistCtrl.add',
  remove: 'wishlistCtrl.remove'
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
var wishlistIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './wishlist.controller': wishlistCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Wishlist API Router', () => {
  it('should return an express router instance', function() {
    wishlistIndex.should.equal(routerStub);
  });

  describe('GET /api/wishlist', function() {
    it('should be authenticated and route to wishlist.controller.get', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'wishlistCtrl.get')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/wishlist', function() {
    it('should be authenticated and route to wishlist.controller.add', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'wishlistCtrl.add')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/wishlist/:id', function() {
    it('should be authenticated and route to wishlist.controller.remove', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'wishlistCtrl.remove')
        .should.have.been.calledOnce;
    });
  });
});
