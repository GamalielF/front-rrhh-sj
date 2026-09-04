import { Injectable, InjectionToken, inject } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormErrorMap } from './form.model';

export const DEFAULT_FORM_ERROR_MESSAGES: FormErrorMap = {
  required: 'Este campo es obligatorio',
  email: 'Ingrese un correo electrónico válido',
  minlength: (error) => `Debe contener al menos ${error.requiredLength} caracteres`,
  maxlength: (error) => `No debe exceder ${error.requiredLength} caracteres`,
  min: (error) => `El valor mínimo permitido es ${error.min}`,
  max: (error) => `El valor máximo permitido es ${error.max}`,
  pattern: 'El formato ingresado no es válido',
  cedulaEcuatoriana: 'El número de cédula no es válido',
  rucEcuatoriano: 'El número de RUC no es válido',
  matchField: 'Los campos no coinciden',
  numeric: 'Solo se permiten caracteres numéricos',
  phone: 'Ingrese un número de teléfono válido',
  strongPassword: 'La contraseña debe tener mín. 8 caracteres, mayúscula, minúscula, número y símbolo',
  range: (error) => `El valor debe estar entre ${error.min} y ${error.max}`,
};

export const FORM_ERROR_MESSAGES = new InjectionToken<FormErrorMap>('FORM_ERROR_MESSAGES', {
  providedIn: 'root',
  factory: () => DEFAULT_FORM_ERROR_MESSAGES,
});

@Injectable({
  providedIn: 'root',
})
export class FormErrorsService {
  private globalMessages = inject(FORM_ERROR_MESSAGES);

  getErrorMessage(
    control: AbstractControl | null,
    customMessages?: Record<string, string | ((error: any) => string)>
  ): string {
    if (!control || !control.errors || !control.invalid) {
      return '';
    }

    const errors: ValidationErrors = control.errors;
    const errorKeys = Object.keys(errors);

    if (errorKeys.length === 0) {
      return '';
    }

    const firstKey = errorKeys[0];
    const errorData = errors[firstKey];

    if (customMessages && customMessages[firstKey]) {
      const customVal = customMessages[firstKey];
      return typeof customVal === 'function' ? customVal(errorData) : this.interpolate(customVal, errorData);
    }

    if (this.globalMessages[firstKey]) {
      const globalVal = this.globalMessages[firstKey];
      return typeof globalVal === 'function' ? globalVal(errorData) : this.interpolate(globalVal, errorData);
    }

    if (DEFAULT_FORM_ERROR_MESSAGES[firstKey]) {
      const fallbackVal = DEFAULT_FORM_ERROR_MESSAGES[firstKey];
      return typeof fallbackVal === 'function' ? fallbackVal(errorData) : this.interpolate(fallbackVal, errorData);
    }

    return 'El campo contiene un valor no válido';
  }

  interpolate(template: string, params: any): string {
    if (!params || typeof params !== 'object') {
      return template;
    }

    let result = template;
    for (const key of Object.keys(params)) {
      const val = params[key];
      if (val !== undefined && val !== null) {
        result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(val));
        result = result.replace(new RegExp(`{\\s*${key}\\s*}`, 'g'), String(val));
      }
    }
    return result;
  }
}
