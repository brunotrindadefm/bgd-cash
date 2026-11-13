import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonToast,
} from '@ionic/angular';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonToast,
  ],
})
export class LoginPage {
  private readonly finance = inject(FinanceService);
  private readonly router = inject(Router);

  readonly email = signal<string>('maia@bgdcash.com.br');
  readonly password = signal<string>('123456');
  readonly showPassword = signal<boolean>(false);

  readonly toastOpen = signal<boolean>(false);
  readonly toastMsg = signal<string>('');

  onLogin(): void {
    const mail = this.email().trim();
    if (!mail || !this.password().trim()) {
      this.toastMsg.set('Informe seu e-mail e senha para entrar.');
      this.toastOpen.set(true);
      return;
    }

    this.finance.login(mail);
    this.router.navigateByUrl('/tabs/tab1');
  }
}
