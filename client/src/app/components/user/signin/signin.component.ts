import { Component, OnInit, style, state, animate, transition, trigger } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidatorHelper } from "../../../helpers/validator.helper";
import { UserService } from "../../../services/user.service";
import { Router } from "@angular/router";

@Component({
  templateUrl: './signin.component.html',
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
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  error: string;
  isSubmitting: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _router: Router
  ) {}

  signin() {
    if(this.signinForm.valid) {
      this.isSubmitting = true;
      return this._userService.login({
        email: this.signinForm.value.email,
        password: this.signinForm.value.password
      })
        .finally(() => {
          this.isSubmitting = false;
        })
        .subscribe(
          () => {
            this._router.navigate(['']);
          },
          err => {
            this.error = err.json().message;
            console.log(err);
          }
        );
    }
  }

  ngOnInit() {
    this.signinForm = this._fb.group({
      email: ['', Validators.compose([Validators.required,ValidatorHelper.isEmail])],
      password: ['', Validators.required]
    });
  }
}
