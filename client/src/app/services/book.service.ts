import { Injectable, Inject } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { FileUploadService } from "./fileUpload.service";
import { Observable } from "rxjs";
import { Book } from "../models/Book";
import { Headers, URLSearchParams } from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { APP_CONFIG } from "../app.config";
import { IAppConfig } from "../models/AppConfig";

@Injectable()
export class BookService {
  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private _authHttp: AuthHttp,
    private _fileUploadService: FileUploadService
  ) {}

  changeCover(cover: File, slug: string): Observable<any> {
    return this._fileUploadService.upload(`${this.config.baseUrl}/api/books/${slug}/cover`, 'PUT', cover);
  }

  changeEpub(epub: File, slug: string): Observable<any> {
    return this._fileUploadService.upload(`${this.config.baseUrl}/api/books/${slug}/epub`, 'PUT', epub);
  }

  create(book: Book): Observable<Book> {
    let newBook = new Book(book);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._authHttp.post(`${this.config.baseUrl}/api/books`, JSON.stringify(newBook), { headers: headers })
      .map(res => res.json());
  }

  update(slug: string, book: Book): Observable<Book> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._authHttp.put(`${this.config.baseUrl}/api/books/${slug}`, book, { headers: headers })
      .map(res => res.json());
  }

  remove(slug: string): Observable<any> {
    return this._authHttp.delete(`${this.config.baseUrl}/api/books/${slug}`);
  }

  getBooks(searchParams: Object): Observable<Book[]> {
    let params: URLSearchParams = new URLSearchParams();

    for(let key in searchParams) {
      params.set(key, searchParams[key]);
    }

    return this._authHttp.get(`${this.config.baseUrl}/api/books`, { search: params })
      .map(res => res.json());
  }

  getBestBooks(): Observable<Book[]> {
    return this._authHttp.get(`${this.config.baseUrl}/api/books/best_books`)
      .map(res => res.json());
  };

  getBook(slug: string): Observable<Book> {
    return this._authHttp.get(`${this.config.baseUrl}/api/books/${slug}`)
      .map(res => res.json());
  }

  rateBook(bookId, rating): Observable<any> {
    const body = { rating: rating };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._authHttp.put(`${this.config.baseUrl}/api/books/${bookId}/rate`, JSON.stringify(body), { headers: headers });
  }

  buyBook(bookId: string, cardNumber: string): Observable<any> {
    const body = { cardNumber: cardNumber };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._authHttp.post(`${this.config.baseUrl}/api/books/${bookId}/buy`, JSON.stringify(body), { headers: headers })
      .map(res => res.json());
  }
}
