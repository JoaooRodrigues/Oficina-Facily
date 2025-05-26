import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  usuario: User = { nome: '', email: '', senha: '' };
  confirmarSenha = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.usuario.nome || !this.usuario.email || !this.usuario.senha || !this.confirmarSenha) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }
    if (this.usuario.senha !== this.confirmarSenha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    // Remover confirmarSenha do objeto antes de enviar
    const { ...userData } = this.usuario;

    this.authService.register(userData).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso! Você será redirecionado para o login.';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erro ao realizar cadastro. Verifique se o e-mail já existe ou tente novamente.';
        console.error(err);
        this.successMessage = '';
      }
    });
  }
}