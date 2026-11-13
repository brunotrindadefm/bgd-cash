import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
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
export class RegisterPage {
  private readonly finance = inject(FinanceService);
  private readonly router = inject(Router);

  readonly name = signal<string>('');
  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly toastOpen = signal<boolean>(false);
  readonly toastMsg = signal<string>('');

  onRegister(): void {
    const n = this.name().trim();
    const e = this.email().trim();
    const p = this.password().trim();

    if (!n || !e || !p) {
      this.toastMsg.set('Preencha nome, e-mail e senha para criar sua conta.');
      this.toastOpen.set(true);
      return;
    }

    this.finance.login(e, n);
    this.router.navigateByUrl('/tabs/tab1');
  }
}
