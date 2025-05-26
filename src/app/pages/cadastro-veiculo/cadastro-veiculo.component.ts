import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VehicleService, Veiculo } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro-veiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro-veiculo.component.html',
  styleUrls: ['./cadastro-veiculo.component.css']
})
export class CadastroVeiculoComponent {
  veiculo: Omit<Veiculo, 'id' | 'usuarioId'> = {
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(), // Padrão para o ano atual
    placa: '',
    clienteNome: '',
    contatoCliente: '',
    status: 'em manutencao' // Padrão
  };
  errorMessage = '';
  successMessage = '';
  statusOptions: Veiculo['status'][] = ['em manutencao', 'aguardando pecas', 'concluido', 'aguardando aprovacao', 'liberado'];


  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']); // Segurança básica
    }
  }

  onSubmit(): void {
    if (!this.veiculo.marca || !this.veiculo.modelo || !this.veiculo.placa || !this.veiculo.clienteNome) {
      this.errorMessage = 'Preencha todos os campos obrigatórios (Marca, Modelo, Placa, Nome do Cliente).';
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';

    this.vehicleService.cadastrarVeiculo(this.veiculo).subscribe({
      next: (novoVeiculo) => {
        this.successMessage = `Veículo ${novoVeiculo.marca} ${novoVeiculo.modelo} (Placa: ${novoVeiculo.placa}) cadastrado com sucesso!`;
        // Limpar formulário ou redirecionar
        this.veiculo = {
          marca: '', modelo: '', ano: new Date().getFullYear(), placa: '',
          clienteNome: '', contatoCliente: '', status: 'em manutencao'
        };
        // Opcional: redirecionar para a home ou lista de veículos
        // setTimeout(() => this.router.navigate(['/home']), 2000);
      },
      error: (err) => {
        this.errorMessage = 'Erro ao cadastrar veículo. Tente novamente.';
        console.error(err);
      }
    });
  }
}