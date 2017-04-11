import { inject, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, ConnectionBackend, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
import { BookService } from './book.service';
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { FileUploadService } from "./fileUpload.service";
import { APP_CONFIG, AppConfig } from "../app.config";
const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.K_lUwtGbvjCHP8Ff-gW9GykydkkXzHKRPbACxItvrFU";

describe('BookService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        BookService,
        FileUploadService,
        {
          provide: Http,
          useFactory: (
            backend: ConnectionBackend,
            defaultOptions: BaseRequestOptions
          ) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: AuthHttp,
          useFactory: (http) => {
            return new AuthHttp(new AuthConfig(), http);
          },
          deps: [Http]
        },
        {
          provide: APP_CONFIG,
          useValue: AppConfig
        }
      ]
    });
  });

  describe('create()', () => {
    beforeEach(() => {
      localStorage.setItem('id_token', validToken);
    });

    afterEach(() => {
      localStorage.removeItem('id_token');
    });

    it('should create book', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {

      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        let response = new ResponseOptions({
          body: {"_id": 'book123'},
          status: 200
        });
        connection.mockRespond(new Response(response));
      });

      bookService.create({
        title: 'Example Book',
        author: 'Unknown'
      })
      .subscribe(res => {
        expect(res._id).toEqual('book123');
      });

      tick();
    })));
  });

  describe('update()', () => {
    beforeEach(() => {
      localStorage.setItem('id_token', validToken);
    });

    afterEach(() => {
      localStorage.removeItem('id_token');
    });

    it('should update book', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books/book123`);
        expect(connection.request.method).toBe(RequestMethod.Put);
        let response = new ResponseOptions({
          body: {"title": 'Updated Book'},
          status: 200
        });
        connection.mockRespond(new Response(response));
      });

      bookService.update('book123', {
        title: 'Updated Book'
      })
      .subscribe(res => {
        expect(res.title).toEqual('Updated Book');
      });

      tick();
    })));
  });

  describe('remove()', () => {
    beforeEach(() => {
      localStorage.setItem('id_token', validToken);
    });

    afterEach(() => {
      localStorage.removeItem('id_token');
    });

    it('should remove book', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books/book123`);
        expect(connection.request.method).toBe(RequestMethod.Delete);
      });

      bookService.remove('book123');

      tick();
    })));
  });

  describe('changeCover()', () => {
    it('should call FileUploadService.upload()', inject([BookService, FileUploadService, APP_CONFIG], fakeAsync((bookService, fileUploadService, config) => {
      spyOn(fileUploadService, 'upload');

      bookService.changeCover('cover.png', 'book123');
      expect(fileUploadService.upload).toHaveBeenCalledWith(`${config.baseUrl}/api/books/book123/cover`, 'PUT', 'cover.png');
    })));
  });

  describe('changeEpub()', () => {
    it('should call FileUploadService.upload()', inject([BookService, FileUploadService, APP_CONFIG], fakeAsync((bookService, fileUploadService, config) => {
      spyOn(fileUploadService, 'upload');

      bookService.changeEpub('book.epub', 'book123');
      expect(fileUploadService.upload).toHaveBeenCalledWith(`${config.baseUrl}/api/books/book123/epub`, 'PUT', 'book.epub');
    })));
  });

  describe('getBooks()', () => {
    it('should get all books', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books?paid=false`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      bookService.getBooks({paid: false});
      tick();
    })));

    it('should get books ordered by added_at', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books?paid=false&sort=added_at`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      bookService.getBooks({paid: false, sort: 'added_at'});
      tick();
    })));

    it('should get books ordered by views', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books?paid=false&sort=views`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      bookService.getBooks({paid: false, sort: 'views'});
      tick();
    })));

    it('should get books by search query', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books?paid=false&search=book`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      bookService.getBooks({paid: false, search: 'book'});
      tick();
    })));
  });

  describe('getBestBooks()', () => {
    it('should get best books', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books/best_books`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      bookService.getBestBooks();
      tick();
    })));
  });

  describe('getBook()', () => {
    it('should return book by slug', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books/example-book`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      bookService.getBook('example-book');
      tick();
    })));
  });

  describe('rateBook()', () => {
    it('should rate book', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books/book123/rate`);
        expect(connection.request.method).toBe(RequestMethod.Put);
      });

      bookService.rateBook('book123', 5);
      tick();
    })));
  });

  describe('buyBook()', () => {
    it('should get link for downloading book', inject([BookService, MockBackend, APP_CONFIG], fakeAsync((bookService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/books/book123/buy`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        expect(connection.request._body).toBe(JSON.stringify({ cardNumber: '456654' }));
      });

      bookService.buyBook('book123', '456654');
      tick();
    })));
  });
});
