import { Component, OnInit, style, state, animate, transition, trigger } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserService } from "../../../../services/user.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { ValidatorHelper } from "../../../../helpers/validator.helper";
import * as ErrorHandler from '../../../../helpers/errorHandler';
import { HistoryService } from "../../../../services/history.service";

@Component({
  templateUrl: './reset-password.component.html',
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
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  error: string;
  isSubmitting: boolean = false;
  token: string;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _historyService: HistoryService
  ) {}

  onSubmit() {
    if(this.resetPasswordForm.valid) {
      return this._userService.resetPassword(this.token, this.resetPasswordForm.value.newPassword)
        .switchMap(() => {
          return this._historyService.addToHistory(`You updated your password`);
        })
        .subscribe(
          () => {
            this._router.navigate(['']);
          },
          err => {
            this.error = ErrorHandler.handleError(err.json());
          }
        )
    }
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      this.token = params['token'];
    });

    this.resetPasswordForm = this._fb.group({
      newPassword: ['', Validators.required],
      verifyPassword: ['', Validators.required]
    }, {
      validator: ValidatorHelper.matchPassword
    });

    this.resetPasswordForm.valueChanges
      .subscribe(() => {
        if(this.error) {
          this.error = null;
        }
      });
  }
}
