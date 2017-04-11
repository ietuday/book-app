import { Injectable, Inject } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { Observable } from "rxjs";
import { Headers } from "@angular/http";
import { APP_CONFIG } from "../app.config";
import { IAppConfig } from "../models/AppConfig";

@Injectable()
export class MustreadService {
  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private _authHttp: AuthHttp
  ) {}

  getMustread(): Observable<any> {
    return this._authHttp.get(`${this.config.baseUrl}/api/mustread`)
      .map(res => res.json());
  }

  addToMustread(bookId: string): Observable<any> {
    const body = {
      bookId: bookId
    };

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._authHttp.post(`${this.config.baseUrl}/api/mustread`, JSON.stringify(body), { headers: headers });
  }

  removeFromMustread(bookId: string): Observable<any> {
    return this._authHttp.delete(`${this.config.baseUrl}/api/mustread/${bookId}`);
  }
}
