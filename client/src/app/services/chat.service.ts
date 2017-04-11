import { Injectable, Inject } from "@angular/core";
import * as io from 'socket.io-client';
import { Observable, BehaviorSubject } from "rxjs";
import { APP_CONFIG } from "../app.config";
import { IAppConfig } from "../models/AppConfig";

@Injectable()
export class ChatService {
  private socket: any;
  questions: any[] = [];
  answers: any[] = [];
  questionsStream = new BehaviorSubject<any>(null);
  answersStream = new BehaviorSubject<any>(null);

  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {
    this.socket = io(`${this.config.baseUrl}:8000`, {'transports': ['websocket', 'polling']});
  }

  getQuestions() {
    this.socket.on('question', (data: any) => {
      this.questions.push(data);
      this.questionsStream.next(this.questions);
    });
  }

  getAnswers() {
    this.socket.on('answer', (data: any) => {
      this.answers.push(data);
      this.answersStream.next(this.answers);
    });
  }

  getAdminConnection() {
    return Observable.create(observer => {
      this.socket.on('connect:admin', () => {
        observer.next('connected');
      });
      this.socket.on('disconnect:admin', () => {
        observer.next('disconnected');
      });
    });
  }

  checkAdminConnection() {
    return Observable.create(observer => {
      this.socket.on('check:admin', () => {
        observer.next('checking');
      });
    });
  }

  sendQuestion(message: string, username: string) {
    this.socket.emit('question', message, username, this.socket.id);
  }

  sendAnswer(message: string, username: string, socketId: string) {
    this.socket.emit('answer', message, username, socketId);
  }

  connectAdmin() {
    this.socket.emit('online');
  }

  disconnectAdmin() {
    this.socket.emit('offline');
  }
}
