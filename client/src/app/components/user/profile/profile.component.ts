import { Component, OnInit, OnDestroy, animate, style, transition, state, trigger, Inject } from "@angular/core";
import { User } from "../../../models/User";
import { UserService } from "../../../services/user.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ValidatorHelper } from "../../../helpers/validator.helper";
import * as ErrorHandler from '../../../helpers/errorHandler';
import { Subscription } from "rxjs";
import { HistoryService } from "../../../services/history.service";
import { APP_CONFIG } from "../../../app.config";
import { IAppConfig } from "../../../models/AppConfig";

@Component({
  templateUrl: 'profile.component.html',
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
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  avatar: File;
  avatarUrl: string;
  user: User;
  subscription: Subscription;
  isSubmitting: boolean = false;
  error: string;
  success: boolean = false;

  constructor(
    private _userService: UserService,
    private _fb: FormBuilder,
    private _historyService: HistoryService,
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  onFileChange(event) {
    if(event.target.files[0]) {
      this.avatar = event.target.files[0];
      this.readURL(this.avatar);
    }
  }

  private readURL(file) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  saveChanges() {
    if(this.profileForm.valid) {
      this.isSubmitting = true;
      return this._userService.update(this.user._id, this.profileForm.value, this.avatar)
        .finally(() => {
          this.isSubmitting = false;
        })
        .switchMap(() => {
          return this._historyService.addToHistory(`You updated your profile`);
        })
        .subscribe(
          () => {
            this.success = true;
            this.profileForm.markAsPristine();
          },
          err => {
            if(this.success) {
              this.success = false;
            }

            this.error = ErrorHandler.handleError(err.json());
            console.log(err);
          }
        );
    }
  }

  ngOnInit() {
    this.profileForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        ValidatorHelper.isEmail
      ])]
    });

    this.subscription = this._userService.currentUser
      .subscribe(user => {
        this.user = user;
        if(this.user) {
          this.profileForm.controls['firstName'].setValue(this.user.firstName);
          this.profileForm.controls['lastName'].setValue(this.user.lastName);
          this.profileForm.controls['email'].setValue(this.user.email);
          this.avatarUrl = `${this.config.baseUrl}${this.user.avatarUrl}`;
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
