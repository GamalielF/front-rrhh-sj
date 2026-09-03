import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services';
import { InputComponent, ButtonComponent, IconComponent } from 'shared-ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required]],
    contrasenia: ['', [Validators.required]],
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { usuario, contrasenia } = this.loginForm.value;

    this.authService.login(usuario, contrasenia).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.accessToken) this.router.navigate(['/credits']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Credenciales inválidas o error de conexión';
      },
    });
  }
}
