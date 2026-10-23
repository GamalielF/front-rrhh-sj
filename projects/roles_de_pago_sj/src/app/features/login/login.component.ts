import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LumenLoginComponent } from '@lumen/base';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LumenLoginComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {}
