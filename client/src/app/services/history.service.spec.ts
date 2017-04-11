import { TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { BaseRequestOptions, Http, ConnectionBackend, RequestMethod } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { HistoryService } from "./history.service";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { APP_CONFIG, AppConfig } from "../app.config";
const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.K_lUwtGbvjCHP8Ff-gW9GykydkkXzHKRPbACxItvrFU";

describe('History Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        HistoryService,
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
    })
  });

  describe('getHistory()', () => {
    beforeEach(() => {
      localStorage.setItem('id_token', validToken);
    });

    afterEach(() => {
      localStorage.removeItem('id_token');
    });

    it('should get history by user', inject([HistoryService, MockBackend, APP_CONFIG], fakeAsync((historyService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/history`);
        expect(connection.request.method).toEqual(RequestMethod.Get);
      });

      historyService.getHistory();
      tick();
    })));
  });

  describe('addToHistory()', () => {
    beforeEach(() => {
      localStorage.setItem('id_token', validToken);
    });

    afterEach(() => {
      localStorage.removeItem('id_token');
    });

    it('should save action to user history', inject([HistoryService, MockBackend, APP_CONFIG], fakeAsync((historyService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/history`);
        expect(connection.request.method).toEqual(RequestMethod.Post);
      });

      historyService.addToHistory('Another action');
      tick();
    })));
  });
});
