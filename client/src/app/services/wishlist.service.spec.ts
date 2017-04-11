import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { BaseRequestOptions, Http, ConnectionBackend, RequestMethod } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { WishlistService } from "./wishlist.service";
import { APP_CONFIG, AppConfig } from "../app.config";

describe('WishlistService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        WishlistService,
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

  describe('getWishlist()', () => {
    it('should get wishlist', inject([WishlistService, MockBackend, APP_CONFIG], fakeAsync((wishlistService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/wishlist`);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });

      wishlistService.getWishlist();
      tick();
    })));
  });

  describe('addToWishlist()', () => {
    it('should add book to wishlist', inject([WishlistService, MockBackend, APP_CONFIG], fakeAsync((wishlistService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/wishlist`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        expect(connection.request._body).toBe(JSON.stringify({bookId: 'book123'}));
      });

      wishlistService.addToWishlist('book123');
      tick();
    })));
  });

  describe('removeFromWishlist()', () => {
    it('should remove book from wishlist', inject([WishlistService, MockBackend, APP_CONFIG], fakeAsync((wishlistService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/wishlist/book123`);
        expect(connection.request.method).toBe(RequestMethod.Delete);
      });

      wishlistService.removeFromWishlist('book123');
      tick();
    })));
  });
});
