import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AUTH_CONFIG } from '@lumen/auth';
import {
  InputComponent,
  ButtonComponent,
  FormComponent,
  RippleEffectComponent,
  QrCodeComponent,
  PinInputComponent,
} from '@lumen/ui';

@Component({
  selector: 'lumen-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    FormComponent,
    RippleEffectComponent,
    QrCodeComponent,
    PinInputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LumenLoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authConfig = inject(AUTH_CONFIG, { optional: true });
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @Input() systemTitle = 'Portal Institucional';
  @Input() systemDescription = 'Acceda con sus credenciales institucionales autorizadas.';
  @Input() logoSrc = 'img/logo-blue.png';
  @Input() redirectUrl?: string;
  @Input() backgroundImage = '/img/sanjose-bg.jpg';
  @Input() enableTotp = true;

  get targetRedirectUrl(): string {
    return this.redirectUrl || this.authConfig?.defaultRedirectUrl || '/home';
  }

  // Countdown timer configuration for MFA steps
  @Input() totpTimeoutSeconds = 300; // <= 0 to disable
  @Input() onTimeoutAction: 'reset' | 'redirect' | 'none' = 'reset';
  @Input() timeoutRedirectUrl?: string;

  @Output() onTotpTimeout = new EventEmitter<void>();

  step: 'credentials' | 'totp' | 'totp-setup' = 'credentials';
  tempAccessToken: string | null = null;
  otpauthUrl: string | null = null;

  remainingSeconds = 300;
  private timerInterval?: any;

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  totpForm: FormGroup = this.fb.group({
    totpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.authService.logout();
    this.totpForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTotpTimer();
  }

  get formattedRemainingTime(): string {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  startTotpTimer(): void {
    this.stopTotpTimer();
    if (this.totpTimeoutSeconds <= 0) return;

    this.remainingSeconds = this.totpTimeoutSeconds;
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.cdr.detectChanges();
      }

      if (this.remainingSeconds <= 0) {
        this.handleTotpTimeout();
      }
    }, 1000);
  }

  stopTotpTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTotpTimeout(): void {
    this.stopTotpTimer();
    this.onTotpTimeout.emit();

    if (this.onTimeoutAction === 'reset') {
      this.backToCredentials();
      this.errorMessage =
        'El tiempo de espera para ingresar el código ha expirado. Por favor, vuelva a iniciar sesión.';
      this.cdr.detectChanges();
    } else if (this.onTimeoutAction === 'redirect') {
      if (this.timeoutRedirectUrl) {
        this.router.navigate([this.timeoutRedirectUrl]);
      } else {
        this.backToCredentials();
      }
    }
  }

  onSubmitCredentials(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Passed MFA directly
        if (response.accessToken && response.tokenType) {
          this.router.navigate([this.targetRedirectUrl]);
          return;
        }

        // Second factor required
        this.tempAccessToken = response.accessToken || null;
        this.loginForm.get('password')?.reset();

        if (response.otpauthUrl) {
          this.otpauthUrl = response.otpauthUrl;
          this.step = 'totp-setup';
        } else {
          this.step = 'totp';
        }

        this.startTotpTimer();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Credenciales inválidas o error de conexión';
        this.cdr.detectChanges();
      },
    });
  }

  onSubmitTotp(): void {
    if (this.totpForm.invalid || !this.tempAccessToken) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { totpCode } = this.totpForm.value;

    this.authService.verifyMfa(this.tempAccessToken, totpCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.accessToken) {
          this.stopTotpTimer();
          this.router.navigate([this.targetRedirectUrl]);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Código de autenticación inválido';
        this.cdr.detectChanges();
      },
    });
  }

  backToCredentials(): void {
    this.stopTotpTimer();
    this.step = 'credentials';
    this.tempAccessToken = null;
    this.otpauthUrl = null;
    this.totpForm.reset();
    this.errorMessage = '';
    this.cdr.detectChanges();
  }
}
