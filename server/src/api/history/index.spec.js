'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var historyCtrlStub = {
  getAll: 'historyCtrl.getAll',
  save: 'historyCtrl.save'
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
var historyIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './history.controller': historyCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('History API Router', () => {
  it('should return an express router instance', function() {
    historyIndex.should.equal(routerStub);
  });

  describe('GET /api/history', function() {
    it('should be authenticated and route to history.controller.getAll', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'historyCtrl.getAll')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/history', function() {
    it('should be authenticated and route to history.controller.save', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'historyCtrl.save')
        .should.have.been.calledOnce;
    });
  });
});
