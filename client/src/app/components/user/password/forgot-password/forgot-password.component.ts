import { Component, OnInit, style, state, animate, transition, trigger } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../../services/user.service";
import { ValidatorHelper } from "../../../../helpers/validator.helper";
import * as ErrorHandler from '../../../../helpers/errorHandler';
import { Router } from "@angular/router";

@Component({
  templateUrl: './forgot-password.component.html',
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
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  error: string;
  isSubmitting: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _router: Router
  ) {}

  onSubmit() {
    if(this.forgotForm.valid) {
      this.isSubmitting = true;
      this._userService.requestReset(this.forgotForm.value)
        .finally(() => {
          this.isSubmitting = false;
        })
        .subscribe(
          res => {
            this._router.navigate(['reset', res.token]);
          },
          err => {
            this.error = ErrorHandler.handleError(err.json());
          }
        )
    }
  }

  ngOnInit() {
    this.forgotForm = this._fb.group({
      email: ['', Validators.compose([
        Validators.required,
        ValidatorHelper.isEmail
      ])]
    });

    this.forgotForm.valueChanges
      .subscribe(() => {
        if(this.error) {
          this.error = null;
        }
      });
  }
}
