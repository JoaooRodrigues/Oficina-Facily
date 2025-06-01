import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { VehicleService, Veiculo } from '../../services/vehicle.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  veiculosEmManutencao: Veiculo[] = [];
  loadingVeiculos = true;
  errorLoadingVeiculos = '';
  statusOptions: Veiculo['status'][] = ['em manutencao', 'aguardando pecas', 'concluido', 'aguardando aprovacao', 'liberado'];

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.carregarVeiculosEmManutencao(user.id);
      } else if (!user) {
        this.router.navigate(['/login']);
      }
    });

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  carregarVeiculosEmManutencao(usuarioId: string): void {
    this.loadingVeiculos = true;
    this.errorLoadingVeiculos = '';
    this.vehicleService.getTodosVeiculosEmManutencao().subscribe({ // Ou getVeiculosEmManutencaoPorUsuario(usuarioId)
      next: (veiculos) => {
        this.veiculosEmManutencao = veiculos;
        this.loadingVeiculos = false;
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.errorLoadingVeiculos = 'Não foi possível carregar os veículos em manutenção.';
        this.loadingVeiculos = false;
      }
    });
  }
  onStatusChange(veiculo: Veiculo, novoStatusString: string): void {
    const novoStatus = novoStatusString as Veiculo['status']; 
    if (!veiculo.id) {
      console.error('ID do veículo não encontrado para atualizar status.');
      return;
    }
    
    this.vehicleService.atualizarVeiculo(veiculo.id, { status: novoStatus }).subscribe({
      next: (veiculoAtualizado) => {
        console.log('Status atualizado:', veiculoAtualizado);
        if (novoStatus !== 'em manutencao' && this.errorLoadingVeiculos === '') { 
           this.veiculosEmManutencao = this.veiculosEmManutencao.filter(v => v.id !== veiculo.id);
        } else {
          const index = this.veiculosEmManutencao.findIndex(v => v.id === veiculo.id);
          if (index !== -1) {
            this.veiculosEmManutencao[index] = veiculoAtualizado;
          }
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        alert('Erro ao atualizar o status. Tente novamente.');
        
        if(this.currentUser?.id) this.carregarVeiculosEmManutencao(this.currentUser.id);
      }
    });
  }
  onApagarVeiculo(veiculoId: string, veiculoDesc: string): void {
    if (!veiculoId) {
      console.error('ID do veículo não encontrado para apagar.');
      return;
    }

    if (confirm(`Tem certeza que deseja apagar o veículo ${veiculoDesc}? Esta ação não pode ser desfeita.`)) {
      this.vehicleService.deletarVeiculo(veiculoId).subscribe({
        next: () => {
          console.log(`Veículo ${veiculoId} apagado.`);
          this.veiculosEmManutencao = this.veiculosEmManutencao.filter(v => v.id !== veiculoId);
        },
        error: (err) => {
          console.error('Erro ao apagar veículo:', err);
          alert('Erro ao apagar o veículo. Tente novamente.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}