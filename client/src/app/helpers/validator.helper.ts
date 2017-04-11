import { FormControl, FormGroup } from "@angular/forms";

export class ValidatorHelper {
  static isEmail(c: FormControl) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(c.value) ? null : {
      validateEmail: true
    };
  }

  static isPrice(c: FormControl) {
    const re = /^(\d*([.,](?=\d{2}))?\d+)+((?!\2)[.,]\d\d)?$/;

    return re.test(c.value) ? null : {
      notPrice: true
    };
  }

  static isCreditCard(c: FormControl) {
    const re = /[0-9]{13,19}|([0-9- ]{3,8}){3,6}/;

    return re.test(c.value) ? null : {
      notCreditCard: true
    };
  }

  static matchPassword(g: FormGroup) {
    let password = g.controls['newPassword'];
    let confirm = g.controls['verifyPassword'];

    // Don't kick in until user touches both fields
    if (password.pristine || confirm.pristine) {
      return null;
    }

    // Mark group as touched so we can add invalid class easily
    g.markAsTouched();

    if (password.value === confirm.value) {
      return null;
    }

    return confirm.setErrors({notMatch: true});
  }
}
