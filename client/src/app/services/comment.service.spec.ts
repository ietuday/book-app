import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { BaseRequestOptions, Http, ConnectionBackend, RequestMethod } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { CommentService } from "./comment.service";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { APP_CONFIG, AppConfig } from "../app.config";

describe('CommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        CommentService,
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

  describe('getComments', () => {
    it('should get comments for book', inject([CommentService, MockBackend, APP_CONFIG], fakeAsync((commentService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/comments/book123`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      commentService.getComments('book123');
      tick();
    })));
  });

  describe('saveComment', () => {
    it('should save comment for book', inject([CommentService, MockBackend, APP_CONFIG], fakeAsync((commentService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/comments/book123`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        expect(connection.request._body).toBe(JSON.stringify({comment: 'Awesome book'}));
      });

      commentService.saveComment('book123', 'Awesome book');
      tick();
    })));
  });
});
