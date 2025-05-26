import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Para ngModel
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  senha = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }
    this.authService.login(this.email, this.senha).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Email ou senha inválidos.';
        }
      },
      error: () => {
        this.errorMessage = 'Erro ao tentar fazer login. Tente novamente.';
      }
    });
  }
}