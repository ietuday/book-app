import { inject, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, ConnectionBackend, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
import { UserService } from './user.service';
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { FileUploadService } from "./fileUpload.service";
import { Observable } from "rxjs";
import { User } from "../models/User";
import { ChatService } from "./chat.service";
import { AppConfig, APP_CONFIG } from "../app.config";

const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.K_lUwtGbvjCHP8Ff-gW9GykydkkXzHKRPbACxItvrFU";

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        UserService,
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
        },
        {
          provide: ChatService,
          useValue: {
            checkAdminConnection: jasmine.createSpy('checkAdminConnection').and.callFake(() => {
              return Observable.create(observer => {
                return observer.next('true');
              });
            }),
            connectAdmin: jasmine.createSpy('connectAdmin').and.returnValue(true),
            disconnectAdmin: jasmine.createSpy('disconnectAdmin').and.returnValue(true)
          }
        }
      ]
    });
  });

  describe('login()', () => {
    it('should log in existing user', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: []},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
      .subscribe(() => {
        expect(localStorage.getItem('id_token')).toEqual(validToken);
      });

      tick();
    })));

    it('should call connectAdmin if user has admin role', inject([UserService, MockBackend, ChatService, APP_CONFIG], fakeAsync((userService, mockBackend, chatService, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: ['admin']},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
      .subscribe(() => {
        expect(chatService.connectAdmin).toHaveBeenCalled();
      });

      tick();
    })));

    it('should not call connectAdmin if user has not admin role', inject([UserService, MockBackend, ChatService, APP_CONFIG], fakeAsync((userService, mockBackend, chatService, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: []},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
      .subscribe(() => {
        expect(chatService.connectAdmin).not.toHaveBeenCalled();
      });

      tick();
    })));
  });

  describe('logout()', () => {
    it('should remove user token from localStorage when logout was called', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: []},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
      .subscribe(() => {
        expect(localStorage.getItem('id_token')).toEqual(validToken);
        userService.logout();
        expect(localStorage.getItem('id_token')).toBe(null);
      });

      tick();
    })));

    it('should call disconnectAdmin if user has admin role', inject([UserService, MockBackend, ChatService, APP_CONFIG], fakeAsync((userService, mockBackend, chatService, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: ['admin']},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
        .subscribe(() => {
          userService.logout();
          expect(chatService.disconnectAdmin).toHaveBeenCalled();
        });

      tick();
    })));

    it('should not call disconnectAdmin if user has not admin role', inject([UserService, MockBackend, ChatService, APP_CONFIG], fakeAsync((userService, mockBackend, chatService, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: []},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
        .subscribe(() => {
          userService.logout();
          expect(chatService.disconnectAdmin).not.toHaveBeenCalled();
        });

      tick();
    })));
  });

  describe('isLoggedIn()', () => {
    it('should call tokenNotExpired()', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      // userService.currentUser = new BehaviorSubject<User>(null);
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123', roles: []},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.login({
        email: 'test@tes.com',
        password: '111'
      })
      .subscribe(() => {
        expect(localStorage.getItem('id_token')).toEqual(validToken);
        expect(userService.isLoggedIn()).toBeTruthy();
      });

      tick();
    })));
  });

  describe('changeAvatar()', () => {
    it('should call FileUploadService.upload()', inject([UserService, FileUploadService, APP_CONFIG], fakeAsync((userService, fileUploadService, config) => {
      spyOn(fileUploadService, 'upload');

      userService.changeAvatar('avatar.png', '123');
      expect(fileUploadService.upload).toHaveBeenCalledWith(`${config.baseUrl}/api/users/123/avatar`, 'PUT', 'avatar.png');
    })));
  });

  describe('changePassword()', () => {
    it('should change password', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toBe(`${config.baseUrl}/api/users/user123/password`);
        expect(connection.request.method).toBe(RequestMethod.Put);
        expect(connection.request._body).toEqual(JSON.stringify({
          newPassword: '222',
          oldPassword: '111'
        }));
      });

      userService.changePassword('user123', '222', '111');

      tick();
    })));
  });

  describe('create()', () => {
    it('should save new user when avatar not provided', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/auth/local`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123'},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.create({
        firstName: 'User',
        lastName: 'Fake',
        email: 'test@tes.com',
        password: '111'
      })
        .subscribe(() => {
          expect(localStorage.getItem('id_token')).toEqual(validToken);
        });

      tick();
    })));

    it('should save new user with avatar', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/api/users`) {
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });

          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          let response = new ResponseOptions({
            body: {"_id": "user123"},
            status: 200
          });

          connection.mockRespond(new Response(response));
        }
      });

      userService.changeAvatar = jasmine.createSpy('changeAvatar').and.callFake(() => {
        return Observable.create(observer => {
          observer.next(JSON.stringify('avatarUrl'));
        });
      });

      userService.create({
        firstName: 'User',
        lastName: 'Fake',
        email: 'test@tes.com',
        password: '111'
      }, 'avatar.png')
        .subscribe(() => {
          expect(localStorage.getItem('id_token')).toEqual(validToken);
          expect(userService.changeAvatar).toHaveBeenCalledWith('avatar.png', 'user123');
        });

      tick();
    })));
  });

  describe('update()', () => {
    it('should update user when avatar not provided', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/users/user123`);
        expect(connection.request.method).toBe(RequestMethod.Put);

        let response = new ResponseOptions({
          body: {
            "_id": 'user123',
            "firstName": "User1"
          },
          status: 200
        });
        connection.mockRespond(new Response(response));
      });

      userService.update('user123', {
        firstName: 'User1',
        lastName: 'Fake',
        email: 'test@tes.com',
        password: '111'
      });

      tick();
    })));

    it('should update user with avatar', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/api/users/user123`) {
          expect(connection.request.method).toBe(RequestMethod.Put);

          let response = new ResponseOptions({
            body: {
              "_id": 'user123',
              "firstName": "User1"
            },
            status: 200
          });

          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/user123/avatar`) {
          expect(connection.request.method).toBe(RequestMethod.Put);
        }
      });

      userService.changeAvatar = jasmine.createSpy('changeAvatar').and.callFake(() => {
        return Observable.create(observer => {
          observer.next(JSON.stringify('newAvatarUrl'));
        });
      });

      userService.update('user123', {
        firstName: 'User1',
        lastName: 'Fake',
        email: 'test@tes.com',
        password: '111'
      }, 'avatar.png')
        .subscribe(() => {
          expect(userService.changeAvatar).toHaveBeenCalledWith('avatar.png', 'user123');
        });

      tick();
    })));
  });

  describe('requestReset()', () => {
    it('should request for reset password with email', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      mockBackend.connections.subscribe(connection => {
        expect(connection.request.url).toEqual(`${config.baseUrl}/api/users/forgot`);
        expect(connection.request.method).toBe(RequestMethod.Post);
        expect(connection.request._body).toEqual(JSON.stringify({
          email: 'test@tes.com'
        }));
      });

      userService.requestReset({ email: 'test@tes.com' });
      tick();
    })));
  });

  describe('resetPassword()', () => {
    it('should save new password and login user', inject([UserService, MockBackend, APP_CONFIG], fakeAsync((userService, mockBackend, config) => {
      const token = 'faketoken';

      mockBackend.connections.subscribe(connection => {
        if(connection.request.url === `${config.baseUrl}/api/users/reset/fake`) {
          expect(connection.request.method).toBe(RequestMethod.Post);
          let response = new ResponseOptions({
            body: {"token": validToken},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }

        if(connection.request.url === `${config.baseUrl}/api/users/me`) {
          expect(connection.request.method).toBe(RequestMethod.Get);
          let response = new ResponseOptions({
            body: {"_id": 'user123'},
            status: 200
          });
          connection.mockRespond(new Response(response));
        }
      });

      userService.resetPassword(token, '111')
        .subscribe(() => {
          expect(localStorage.getItem('id_token')).toEqual(validToken);
        });

      tick();
    })));
  });
});
