import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { BaseRequestOptions, Http, ConnectionBackend, RequestMethod } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { FavouriteService } from "./favourite.service";
import { APP_CONFIG, AppConfig } from "../app.config";

describe('FavouriteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        FavouriteService,
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

  describe('getFavourites()', () => {
    it('should get favourite books', inject([FavouriteService, MockBackend, APP_CONFIG], fakeAsync((favouriteService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/favourite`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      favouriteService.getFavourites();
      tick();
    })));
  });

  describe('addToFavourites()', () => {
    it('should add book to favourites', inject([FavouriteService, MockBackend, APP_CONFIG], fakeAsync((favouriteService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/favourite`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        expect(connection.request._body).toBe(JSON.stringify({bookId: 'book123'}));
      });

      favouriteService.addToFavourites('book123');
      tick();
    })));
  });

  describe('removeFromFavourites()', () => {
    it('should remove book from favourites', inject([FavouriteService, MockBackend, APP_CONFIG], fakeAsync((favouriteService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/favourite/book123`);
        expect(connection.request.method).toBe(RequestMethod.Delete);
      });

      favouriteService.removeFromFavourites('book123');
      tick();
    })));
  });
});
