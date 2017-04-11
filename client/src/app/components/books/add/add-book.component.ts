import { Component, style, state, animate, transition, trigger, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ValidatorHelper } from "../../../helpers/validator.helper";
import { BookService } from "../../../services/book.service";
import { Observable } from "rxjs";
import 'rxjs/add/observable/forkJoin';
import * as ErrorHandler from '../../../helpers/errorHandler';
import { ActivatedRoute } from "@angular/router";
import { HistoryService } from "../../../services/history.service";

@Component({
  templateUrl: './add-book.component.html',
  host: {
    '[@routeAnimation]': 'true'
  },
  styles: [':host { position: absolute; width: 100%; height: 100%; }'],
  animations: [
    trigger('routeAnimation', [
      state('*', style({transform: 'translateX(0)', opacity: 1})),
      transition('void => *', [
        style({transform: 'translateX(-100%)', opacity: 0}),
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)')
      ]),
      transition('* => void',
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      )
    ])
  ]
})
export class AddBookComponent implements OnInit {
  bookForm: FormGroup;
  isSubmitting: boolean = false;
  cover: File;
  epub: File;
  coverUrl: string;
  epubUrl: string;
  success: boolean = false;
  error: string;
  title: string;
  isEditing: boolean;
  private slug: string;

  constructor(
    private _fb: FormBuilder,
    private _bookService: BookService,
    private _route: ActivatedRoute,
    private _historyService: HistoryService
  ) {}

  onCoverChange(event) {
    if(event.target.files[0]) {
      this.cover = event.target.files[0];
      this.readURL(this.cover, 'coverUrl');
    }
  }

  onEpubChange(event) {
    if(event.target.files[0]) {
      this.epub = event.target.files[0];
      this.readURL(this.epub, 'epubUrl');
    }
  }

  private readURL(file, fileType) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      if(fileType === 'coverUrl') {
        this.coverUrl = e.target.result;
      }

      if(fileType === 'epubUrl') {
        this.epubUrl = e.target.result;
      }
    };

    reader.readAsDataURL(file);
  }

  clearForm() {
    this.bookForm.reset();
    this.cover = null;
    this.coverUrl = null;
    this.epub = null;
    this.epubUrl = null;
    this.success = false;
  }

  save() {
    if(this.bookForm.valid) {
      this.isSubmitting = true;
      this.isEditing ? this.update() : this.add();
    }
  }

  private add() {
    return this._bookService.create(this.bookForm.value)
      .finally(() => { this.isSubmitting = false; })
      .switchMap(book => {
        let observables = [];

        if (this.cover) {
          observables.push(this._bookService.changeCover(this.cover, book.slug));
        }

        if (this.epub) {
          observables.push(this._bookService.changeEpub(this.epub, book.slug));
        }

        if (!observables.length) {
          return Observable.of([]);
        } else {
          return Observable.forkJoin(observables);
        }
      })
      .switchMap(() => {
        return this._historyService.addToHistory(`You added ${this.bookForm.value.title} by ${this.bookForm.value.author}`);
      })
      .subscribe(
        () => {
          this.success = true;
        },
        err => {
          // this.error = ErrorHandler.handleError(JSON.parse(err));
          this.error = ErrorHandler.handleError(err.json());
        }
      );
  }

  private update() {
    return this._bookService.update(this.slug, this.bookForm.value)
      .finally(() => { this.isSubmitting = false; })
      .switchMap(book => {
        let observables = [];

        if (this.cover) {
          observables.push(this._bookService.changeCover(this.cover, book.slug));
        }

        if (this.epub) {
          observables.push(this._bookService.changeEpub(this.epub, book.slug));
        }

        if (!observables.length) {
          return Observable.of([]);
        } else {
          return Observable.forkJoin(observables);
        }
      })
      .switchMap(() => {
        return this._historyService.addToHistory(`You updated ${this.bookForm.value.title} by ${this.bookForm.value.author}`);
      })
      .subscribe(
        () => {
          this.success = true;
        },
        err => {
          // this.error = ErrorHandler.handleError(JSON.parse(err));
          this.error = ErrorHandler.handleError(err.json());
        }
      );
  }

  ngOnInit() {
    this.bookForm = this._fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      description: [''],
      paid: [false],
      price: ['']
    });

    this.bookForm.valueChanges
      .subscribe(() => {
        if(this.error) {
          this.error = null;
        }
      });

    const priceCtrl = this.bookForm.controls['price'];

    this.bookForm.controls['paid'].valueChanges
      .subscribe(isPaid => {
        if(isPaid) {
         priceCtrl.setValidators(Validators.compose([
           Validators.required,
           ValidatorHelper.isPrice
         ]));
          priceCtrl.updateValueAndValidity();
        } else {
          priceCtrl.setValue('');
          priceCtrl.markAsPristine();
          priceCtrl.setValidators(null);
          priceCtrl.updateValueAndValidity();
        }
      });

    this._route.params.forEach(param => {
      let slug = param['slug'];

      if(slug) {
        this._bookService.getBook(slug)
          .subscribe(book => {
            this.bookForm.controls['title'].setValue(book.title);
            this.bookForm.controls['author'].setValue(book.author);
            this.bookForm.controls['description'].setValue(book.description);
            this.bookForm.controls['paid'].setValue(book.paid);

            if(book.paid) {
              this.bookForm.controls['price'].setValue(book.price);
            }

            this.coverUrl = book.coverUrl;
            this.epubUrl = book.epubUrl;
            this.slug = slug;
          });

        this.title = 'Edit Book';
        this.isEditing = true;
      } else {
        this.title = 'Add New Book';
        this.isEditing = false;
      }
    });
  }
}
