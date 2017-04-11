import { Injectable, Inject } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { Observable } from "rxjs";
import { IComment } from '../models/Comment';
import { Headers } from "@angular/http";
import { APP_CONFIG } from "../app.config";
import { IAppConfig } from "../models/AppConfig";

@Injectable()
export class CommentService {
  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private _authHttp: AuthHttp
  ) {}

  getComments(bookId: string): Observable<IComment> {
    return this._authHttp.get(`${this.config.baseUrl}/api/comments/${bookId}`)
      .map(res => res.json());
  }

  saveComment(bookId: string, comment: string): Observable<IComment> {
    const body = { comment: comment };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._authHttp.post(`${this.config.baseUrl}/api/comments/${bookId}`, JSON.stringify(body), { headers: headers })
      .map(res => res.json());
  }
}
