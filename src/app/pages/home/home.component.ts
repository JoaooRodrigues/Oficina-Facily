import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService, User } from '../../services/auth.service';
import { VehicleService, Veiculo } from '../../services/vehicle.service'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  veiculosEmManutencao: Veiculo[] = [];
  loadingVeiculos = true;
  errorLoadingVeiculos = '';

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
    
    this.vehicleService.getTodosVeiculosEmManutencao().subscribe({
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

  logout(): void {
    this.authService.logout();
  }
}