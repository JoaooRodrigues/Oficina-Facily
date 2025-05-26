import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id?: string;
  nome: string;
  email: string;
  senha?: string; // Senha não deve ser armazenada em plain text em produção!
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuarios'; // URL do json-server
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Tentar carregar usuário do localStorage ao iniciar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, senha: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&senha=${senha}`).pipe(
      map(users => {
        const user = users[0];
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }
        return null;
      })
    );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(newUser => {
        // Opcional: Fazer login automático após o registro
        // localStorage.setItem('currentUser', JSON.stringify(newUser));
        // this.currentUserSubject.next(newUser);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
}