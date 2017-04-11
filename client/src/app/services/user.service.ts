import { Injectable, Inject } from "@angular/core";
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { tokenNotExpired, AuthHttp } from "angular2-jwt";
import { FileUploadService } from "./fileUpload.service";
import { User } from "../models/User";
import { Observable, BehaviorSubject } from "rxjs";
import { ChatService } from "./chat.service";
import { APP_CONFIG } from "../app.config";
import { IAppConfig } from "../models/AppConfig";

@Injectable()
export class UserService {
  currentUser = new BehaviorSubject<User>(null);

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private _http: Http,
    private _authHttp: AuthHttp,
    private _fileUploadService: FileUploadService,
    private _chatService: ChatService
  ) {
    if(tokenNotExpired()) {
      this._authHttp.get(`${this.config.baseUrl}/api/users/me`)
        .map(res => res.json())
        .subscribe(user => {
          this.currentUser.next(user);
        });
    }
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = {
      email: credentials.email,
      password: credentials.password
    };

    return this._http.post(`${this.config.baseUrl}/auth/local`, JSON.stringify(body), { headers: headers })
      .switchMap(res => {
        const token = res.json().token;
        localStorage.setItem('id_token', token);
        return this._authHttp.get(`${this.config.baseUrl}/api/users/me`);
      })
      .map(res => {
        const user = res.json();
        if(user.roles.includes('admin')) {
          this._chatService.connectAdmin();
          this._chatService.checkAdminConnection()
            .subscribe(() => {
              this._chatService.connectAdmin();
            });
        }

        this.currentUser.next(user);
        return true;
      });
  }

  logout() {
    this._authHttp.get(`${this.config.baseUrl}/api/users/me`)
      .subscribe(res => {
        const user = res.json();
        if(user.roles.includes('admin')) {
          this._chatService.disconnectAdmin();
        }
        localStorage.removeItem('id_token');
        this.currentUser.next(null);
      });
  }

  isLoggedIn() {
    return tokenNotExpired();
  }

  changeAvatar(avatar: File, userId: string): Observable<any> {
    return this._fileUploadService.upload(`${this.config.baseUrl}/api/users/${userId}/avatar`, 'PUT', avatar);
  }

  changePassword(userId: string, newPassword: string, oldPassword: string): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = {
      newPassword: newPassword,
      oldPassword: oldPassword
    };

    return this._authHttp.put(`${this.config.baseUrl}/api/users/${userId}/password`, JSON.stringify(body), { headers: headers });
  }

  create(credentials: User, avatar?: File): Observable<any> {
    let user = new User(credentials);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Possible to rework this using Observable.forkjoin
    if(avatar) {
      let createdUser;
      return this._http.post(`${this.config.baseUrl}/api/users`, JSON.stringify(user), { headers: headers     })
        .switchMap(res => {
          const token = res.json().token;
          localStorage.setItem('id_token', token);
          return this._authHttp.get(`${this.config.baseUrl}/api/users/me`);
        })
        .switchMap(res => {
          createdUser = res.json();
          return this.changeAvatar(avatar, createdUser._id);
        })
        .map(res => {
          createdUser.avatarUrl = JSON.parse(res);
          this.currentUser.next(createdUser);
          return true;
        });
    } else {
      return this._http.post(`${this.config.baseUrl}/api/users`, JSON.stringify(user), { headers: headers })
        .switchMap(res => {
          const token = res.json().token;
          localStorage.setItem('id_token', token);
          return this._authHttp.get(`${this.config.baseUrl}/api/users/me`);
        })
        .map(res => {
          this.currentUser.next(res.json());
          return true;
        });
    }
  }

  update(userId: string, user: User, avatar?: File): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if(avatar) {
      let updatedUser;
      return this._authHttp.put(`${this.config.baseUrl}/api/users/${userId}`, JSON.stringify(user), { headers: headers })
        .switchMap(res => {
          updatedUser = res.json();
          return this.changeAvatar(avatar, userId);
        })
        .map(res => {
          updatedUser.avatarUrl = JSON.parse(res);
          this.currentUser.next(updatedUser);
          return true;
        });
    } else {
      return this._authHttp.put(`${this.config.baseUrl}/api/users/${userId}`, JSON.stringify(user), { headers: headers })
        .map(res => {
          this.currentUser.next(res.json());
          return true;
        });
    }
  }

  requestReset(body: Object): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._http.post(`${this.config.baseUrl}/api/users/forgot`, JSON.stringify(body), { headers: headers })
      .map(res => res.json());
  }

  resetPassword(token: string, password: string): Observable<any> {
    const body = {
      password: password
    };

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._http.post(`${this.config.baseUrl}/api/users/reset/${token}`, JSON.stringify(body), { headers: headers })
      .switchMap(res => {
        const token = res.json().token;
        localStorage.setItem('id_token', token);
        return this._authHttp.get(`${this.config.baseUrl}/api/users/me`);
      })
      .map(res => {
        this.currentUser.next(res.json());
        return true;
      });
  }
}
