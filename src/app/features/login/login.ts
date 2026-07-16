import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormField,
  email,
  form,
  minLength,
  required,
} from '@angular/forms/signals';

import { AuthService } from '../../core/auth/auth.service';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'orion-login',
  imports: [FormField],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly model = signal<LoginModel>({ email: '', password: '' });
  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: 'El correo es obligatorio' });
    email(path.email, { message: 'Ingrese un correo electrónico válido' });
    required(path.password, { message: 'La contraseña es obligatoria' });
    minLength(path.password, 6, {
      message: 'La contraseña debe tener al menos 6 caracteres',
    });
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(event: Event): void {
    event.preventDefault();

    this.loginForm.email().markAsTouched();
    this.loginForm.password().markAsTouched();

    if (this.loginForm().invalid()) {
      return;
    }

    const { email, password } = this.model();

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth.login({ email, password }).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
