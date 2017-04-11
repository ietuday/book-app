import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { BaseRequestOptions, Http, ConnectionBackend, RequestMethod } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { MustreadService } from "./mustread.service";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { APP_CONFIG, AppConfig } from "../app.config";

describe('MustreadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        MustreadService,
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

  describe('getMustread()', () => {
    it('should get mustread books', inject([MustreadService, MockBackend, APP_CONFIG], fakeAsync((mustreadService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/mustread`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      mustreadService.getMustread();
      tick();
    })));
  });

  describe('addToMustread()', () => {
    it('should add book to mustread', inject([MustreadService, MockBackend, APP_CONFIG], fakeAsync((mustreadService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/mustread`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        expect(connection.request._body).toBe(JSON.stringify({bookId: 'book123'}));
      });

      mustreadService.addToMustread('book123');
      tick();
    })));
  });

  describe('removeFromMustread()', () => {
    it('should remove book from mustread', inject([MustreadService, MockBackend, APP_CONFIG], fakeAsync((mustreadService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/mustread/book123`);
        expect(connection.request.method).toBe(RequestMethod.Delete);
      });

      mustreadService.removeFromMustread('book123');
      tick();
    })));
  });
});
