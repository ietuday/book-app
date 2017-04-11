import { Component, OnInit, OnDestroy, style, state, animate, transition, trigger } from "@angular/core";
import { UserService } from "../../../../services/user.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ValidatorHelper } from "../../../../helpers/validator.helper";
import * as ErrorHandler from '../../../../helpers/errorHandler';
import { Subscription } from "rxjs";
import { User } from "../../../../models/User";

@Component({
  templateUrl: './change-password.component.html',
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
export class ChangePasswordComponent implements OnInit, OnDestroy {
  error: string;
  success: boolean = false;
  changePasswordForm: FormGroup;
  isSubmitting: boolean = false;
  subscription: Subscription;
  user: User;

  constructor(
    private _userService: UserService,
    private _fb: FormBuilder
  ) {}

  changePassword() {
    if(this.changePasswordForm.valid) {
      this.isSubmitting = true;
      const newPassword = this.changePasswordForm.value.newPassword,
        oldPassword = this.changePasswordForm.value.oldPassword;

      this._userService.changePassword(this.user._id, newPassword, oldPassword)
        .finally(() => {
          this.isSubmitting = false;
        })
        .subscribe(
          () => {
            this.success = true;
            this.changePasswordForm.reset();
          },
          err => {
            if(this.success) {
              this.success = false;
            }

            this.error = ErrorHandler.handleError(err.json());
            console.log(err);
          }
        )
    }
  }

  ngOnInit() {
    this.subscription = this._userService.currentUser
      .subscribe(user => this.user = user);
    this.changePasswordForm = this._fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      verifyPassword: ['', Validators.required]
    }, {
      validator: ValidatorHelper.matchPassword
    });

    this.changePasswordForm.valueChanges
      .subscribe(() => {
        if(this.error) {
          this.error = null;
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
