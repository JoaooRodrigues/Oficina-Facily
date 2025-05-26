import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Para pegar o usuarioId

export interface Veiculo {
  id?: string;
  usuarioId: string; // ID do usuário (mecânico/atendente) que cadastrou
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  clienteNome: string;
  contatoCliente: string;
  status: 'em manutencao' | 'aguardando pecas' | 'concluido' | 'aguardando aprovacao' | 'liberado';
  // Adicione outros campos conforme necessário: cor, chassi, observacoes, etc.
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:3000/veiculos';

  constructor(private http: HttpClient, private authService: AuthService) {}

  cadastrarVeiculo(veiculoData: Omit<Veiculo, 'id' | 'usuarioId'>): Observable<Veiculo> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      throw new Error('Usuário não logado para cadastrar veículo.');
      // Ou retornar Observable.throwError(() => new Error('...'))
    }
    const veiculoCompleto: Veiculo = {
      ...veiculoData,
      usuarioId: currentUser.id,
    } as Veiculo; // Type assertion because status is already in veiculoData
    return this.http.post<Veiculo>(this.apiUrl, veiculoCompleto);
  }

  getVeiculosPorUsuario(usuarioId: string): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  getVeiculosEmManutencaoPorUsuario(usuarioId: string): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}?usuarioId=${usuarioId}&status=em manutencao`);
  }

  getTodosVeiculosEmManutencao(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}?status=em manutencao`);
  }

  getVeiculoPorId(id: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }

  atualizarVeiculo(id: string, veiculoData: Partial<Veiculo>): Observable<Veiculo> {
    return this.http.patch<Veiculo>(`${this.apiUrl}/${id}`, veiculoData);
  }

  deletarVeiculo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}