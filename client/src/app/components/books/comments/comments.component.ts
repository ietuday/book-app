import { Component, OnInit, Input } from "@angular/core";
import { IComment } from "../../../models/Comment";
import { User } from "../../../models/User";
import { CommentService } from "../../../services/comment.service";
import { Book } from "../../../models/Book";
import { HistoryService } from "../../../services/history.service";

@Component({
  selector: 'ba-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
  providers: [CommentService]
})
export class CommentsComponent implements OnInit {
  comments: IComment;
  @Input() user: User;
  isSubmitting: boolean = false;
  @Input() book: Book;

  constructor(
    private _commentService: CommentService,
    private _historyService: HistoryService
  ) {}

  submitComment(form) {
    if(form.valid) {
      this.isSubmitting = true;
      return this._commentService.saveComment(this.book._id, form.value.comment)
        .finally(() => { this.isSubmitting = false; })
        .switchMap(comments => {
          comments.messages.sort((a, b) => {
            if(a.created_at < b.created_at) {
              return 1;
            }

            if(a.created_at > b.created_at) {
              return -1;
            }

            return 0;
          });

          form.reset();
          this.comments = comments;

          return this._historyService.addToHistory(`You commented on ${this.book.title} by ${this.book.author}`);
        })
        .subscribe(
          null,
          err => {
            console.log(err);
          }
        );
    }
  }

  ngOnInit() {
    this._commentService.getComments(this.book._id)
      .subscribe(comments => {
        if(comments) {
          comments.messages.sort((a, b) => {
            if(a.created_at < b.created_at) {
              return 1;
            }

            if(a.created_at > b.created_at) {
              return -1;
            }

            return 0;
          });

          this.comments = comments;
        }
      });
  }
}
