'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var commentCtrlStub = {
  getAll: 'commentCtrl.getAll',
  save: 'commentCtrl.save'
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
var commentIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './comment.controller': commentCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Comment API Router', () => {
  it('should return an express router instance', function() {
    commentIndex.should.equal(routerStub);
  });

  describe('GET /api/comments/:bookId', function() {
    it('should be authenticated and route to comment.controller.getAll', function() {
      routerStub.get
        .withArgs('/:bookId', 'authService.isAuthenticated', 'commentCtrl.getAll')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/comments/:bookId', function() {
    it('should be authenticated and route to comment.controller.save', function() {
      routerStub.post
        .withArgs('/:bookId', 'authService.isAuthenticated', 'commentCtrl.save')
        .should.have.been.calledOnce;
    });
  });
});
