'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var bookCtrlStub = {
  getAll: 'bookCtrl.getAll',
  getBest: 'bookCtrl.getBest',
  getBySlug: 'bookCtrl.getBySlug',
  create: 'bookCtrl.create',
  update: 'bookCtrl.update',
  remove: 'bookCtrl.remove',
  changeCover: 'bookCtrl.changeCover',
  changeEpub: 'bookCtrl.changeEpub',
  rate: 'bookCtrl.rate',
  sendLink: 'bookCtrl.sendLink',
  download: 'bookCtrl.download'
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
var bookIndex = proxyquire('./index', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './book.controller': bookCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Book API Router:', function() {
  it('should return an express router instance', function() {
    bookIndex.should.equal(routerStub);
  });

  describe('GET /api/books', function() {
    it('should be authenticated and route to book.controller.getAll', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'bookCtrl.getAll')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/books/best', function() {
    it('should be authenticated and route to book.controller.getBest', function() {
      routerStub.get
        .withArgs('/best_books', 'authService.isAuthenticated', 'bookCtrl.getBest')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/books/:slug', function() {
    it('should be authenticated and route to book.controller.getBySlug', function() {
      routerStub.get
        .withArgs('/:slug', 'authService.isAuthenticated', 'bookCtrl.getBySlug')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/books', function() {
    it('should have admin role and route to book.controller.create', function() {
      routerStub.post
        .withArgs('/', 'authService.hasRole.admin', 'bookCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/books/:slug', function() {
    it('should have admin role and route to book.controller.update', function() {
      routerStub.put
        .withArgs('/:slug', 'authService.hasRole.admin', 'bookCtrl.update')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/books/:slug', function() {
    it('should have admin role and route to book.controller.remove', function() {
      routerStub.delete
        .withArgs('/:slug', 'authService.hasRole.admin', 'bookCtrl.remove')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/books/:slug/changeCover', function() {
    it('should have admin role and route to book.controller.changePassword', function() {
      routerStub.put
        .withArgs('/:slug/cover', 'authService.hasRole.admin', 'bookCtrl.changeCover')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/books/:slug/epub', function() {
    it('should have admin role and route to book.controller.changeEpub', function() {
      routerStub.put
        .withArgs('/:slug/epub', 'authService.hasRole.admin', 'bookCtrl.changeEpub')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/books/:id/rate', function() {
    it('should be authenticated and route to book.controller.rate', function() {
      routerStub.put
        .withArgs('/:id/rate', 'authService.isAuthenticated', 'bookCtrl.rate')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/books/:id/buy', function() {
    it('should be authenticated and route to book.controller.sendLink', function() {
      routerStub.post
        .withArgs('/:id/buy', 'authService.isAuthenticated', 'bookCtrl.sendLink')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/books/download/:url', function() {
    it('should be authenticated and route to book.controller.download', function() {
      routerStub.get
        .withArgs('/download/:url', 'authService.isAuthenticated', 'bookCtrl.download')
        .should.have.been.calledOnce;
    });
  });
});
