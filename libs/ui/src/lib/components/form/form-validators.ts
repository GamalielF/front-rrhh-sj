import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FormValidators {
  static cedulaEcuatoriana(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null;

    if (!/^\d{10}$/.test(value)) {
      return { cedulaEcuatoriana: true };
    }

    const provincia = parseInt(value.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) {
      return { cedulaEcuatoriana: true };
    }

    const tercerDigito = parseInt(value.substring(2, 3), 10);
    if (tercerDigito >= 6) {
      return { cedulaEcuatoriana: true };
    }

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = parseInt(value.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) {
        valor -= 9;
      }
      suma += valor;
    }

    const digitoVerificador = parseInt(value.charAt(9), 10);
    const decenaSuperior = Math.ceil(suma / 10) * 10;
    let digitoCalculado = decenaSuperior - suma;
    if (digitoCalculado === 10) digitoCalculado = 0;

    return digitoCalculado === digitoVerificador ? null : { cedulaEcuatoriana: true };
  }

  static rucEcuatoriano(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null;

    if (!/^\d{13}$/.test(value)) {
      return { rucEcuatoriano: true };
    }

    const provincia = parseInt(value.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) {
      return { rucEcuatoriano: true };
    }

    const tercerDigito = parseInt(value.substring(2, 3), 10);
    const establecimiento = value.substring(10, 13);

    if (tercerDigito < 6) {
      if (establecimiento === '000') return { rucEcuatoriano: true };
      const cedulaPart = value.substring(0, 10);
      const isCedulaValid = !FormValidators.cedulaEcuatoriana({ value: cedulaPart } as AbstractControl);
      return isCedulaValid ? null : { rucEcuatoriano: true };
    }

    if (tercerDigito === 9) {
      if (value.substring(9, 13) === '0000') return { rucEcuatoriano: true };
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 9; i++) {
        suma += parseInt(value.charAt(i), 10) * coeficientes[i];
      }
      const residuo = suma % 11;
      const digitoVerificador = parseInt(value.charAt(9), 10);
      const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
      return digitoCalculado === digitoVerificador ? null : { rucEcuatoriano: true };
    }

    if (tercerDigito === 6) {
      if (value.substring(8, 13) === '00000') return { rucEcuatoriano: true };
      const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 8; i++) {
        suma += parseInt(value.charAt(i), 10) * coeficientes[i];
      }
      const residuo = suma % 11;
      const digitoVerificador = parseInt(value.charAt(8), 10);
      const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
      return digitoCalculado === digitoVerificador ? null : { rucEcuatoriano: true };
    }

    return { rucEcuatoriano: true };
  }

  static matchField(targetFieldName: string, errorKey = 'matchField'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const targetControl = control.parent.get(targetFieldName);
      if (!targetControl) return null;

      if (control.value !== targetControl.value) {
        return { [errorKey]: { targetField: targetFieldName } };
      }
      return null;
    };
  }

  static numeric(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    return /^\d+$/.test(value.toString()) ? null : { numeric: true };
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null;
    return /^(\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}$/.test(value) || /^\d{9,10}$/.test(value)
      ? null
      : { phone: true };
  }

  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && hasMinLength;
    if (valid) return null;

    return {
      strongPassword: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        hasSpecialChar,
        hasMinLength,
      },
    };
  }

  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      if (isNaN(num)) return { numeric: true };
      if (num < min || num > max) {
        return { range: { min, max, actual: num } };
      }
      return null;
    };
  }
}
