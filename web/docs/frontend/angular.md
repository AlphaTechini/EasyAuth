# Angular Integration

EasyAuth integrates with Angular applications using services and RxJS observables for reactive state management.

## Installation

```bash
npm install @easyauth/frontend rxjs
```

## Quick Start

### 1. Create the EasyAuth Service

```typescript
// src/app/services/easyauth.service.ts
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { initEasyAuth } from '@easyauth/frontend'
import type { EasyAuthClient, EasyAuthSession, EasyAuthWallet, FundingTransaction } from '@easyauth/frontend'

@Injectable({
  providedIn: 'root'
})
export class EasyAuthService {
  private client: EasyAuthClient
  private sessionSubject = new BehaviorSubject<EasyAuthSession | null>(null)
  private walletSubject = new BehaviorSubject<EasyAuthWallet | null>(null)
  private fundingSubject = new BehaviorSubject<FundingTransaction | null>(null)
  private loadingSubject = new BehaviorSubject<boolean>(true)
  private errorSubject = new BehaviorSubject<Error | null>(null)

  public session$: Observable<EasyAuthSession | null> = this.sessionSubject.asObservable()
  public wallet$: Observable<EasyAuthWallet | null> = this.walletSubject.asObservable()
  public funding$: Observable<FundingTransaction | null> = this.fundingSubject.asObservable()
  public loading$: Observable<boolean> = this.loadingSubject.asObservable()
  public error$: Observable<Error | null> = this.errorSubject.asObservable()

  constructor() {
    this.client = initEasyAuth({
      apiBaseUrl: '/api/easyauth'
    })

    this.initialize()
  }

  private async initialize() {
    try {
      const session = await this.client.getSession()
      this.sessionSubject.next(session)

      if (session) {
        const wallet = await this.client.getWallet()
        this.walletSubject.next(wallet)
      }
    } catch (error) {
      this.errorSubject.next(error as Error)
    } finally {
      this.loadingSubject.next(false)
    }

    // Subscribe to changes
    this.client.on('sessionChange', (session) => {
      this.sessionSubject.next(session)
    })

    this.client.on('walletChange', (wallet) => {
      this.walletSubject.next(wallet)
    })

    this.client.on('fundingChange', (funding) => {
      this.fundingSubject.next(funding)
    })
  }

  async login(): Promise<void> {
    try {
      this.errorSubject.next(null)
      await this.client.login()
    } catch (error) {
      this.errorSubject.next(error as Error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      this.errorSubject.next(null)
      await this.client.logout()
      this.sessionSubject.next(null)
      this.walletSubject.next(null)
      this.fundingSubject.next(null)
    } catch (error) {
      this.errorSubject.next(error as Error)
      throw error
    }
  }

  async getWallet(): Promise<void> {
    try {
      this.errorSubject.next(null)
      const wallet = await this.client.getWallet()
      this.walletSubject.next(wallet)
    } catch (error) {
      this.errorSubject.next(error as Error)
      throw error
    }
  }

  async fundWallet(amount: number, currency: string): Promise<void> {
    try {
      this.errorSubject.next(null)
      await this.client.fundWallet({ amount, currency })
    } catch (error) {
      this.errorSubject.next(error as Error)
      throw error
    }
  }
}
```

### 2. Create Components

#### Dashboard Component

```typescript
// src/app/components/dashboard/dashboard.component.ts
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EasyAuthService } from '../../services/easyauth.service'
import { LoginButtonComponent } from '../login-button/login-button.component'
import { WalletCardComponent } from '../wallet-card/wallet-card.component'
import { FundWalletCardComponent } from '../fund-wallet-card/fund-wallet-card.component'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LoginButtonComponent,
    WalletCardComponent,
    FundWalletCardComponent
  ],
  template: `
    <div class="container">
      <h1>Welcome to My Solana App</h1>
      
      <div *ngIf="loading$ | async">Loading...</div>
      <div *ngIf="error$ | async as error" class="error">
        Error: {{ error.message }}
      </div>
      
      <app-login-button></app-login-button>
      
      <div *ngIf="session$ | async" class="dashboard-grid">
        <app-wallet-card></app-wallet-card>
        <app-fund-wallet-card></app-fund-wallet-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .error {
      color: #ef4444;
      padding: 1rem;
      background: #fee2e2;
      border-radius: 4px;
    }
  `]
})
export class DashboardComponent {
  session$ = this.easyAuth.session$
  loading$ = this.easyAuth.loading$
  error$ = this.easyAuth.error$

  constructor(private easyAuth: EasyAuthService) {}
}
```

#### Login Button Component

```typescript
// src/app/components/login-button/login-button.component.ts
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EasyAuthService } from '../../services/easyauth.service'

@Component({
  selector: 'app-login-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button *ngIf="loading$ | async" disabled>Loading...</button>
    <p *ngIf="session$ | async as session">
      Welcome, {{ session.user.name }}!
    </p>
    <button
      *ngIf="!(session$ | async) && !(loading$ | async)"
      (click)="login()"
      class="btn-primary"
    >
      Login with Google
    </button>
  `,
  styles: [`
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #14f195;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .btn-primary:hover {
      background: #00d084;
    }
    
    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `]
})
export class LoginButtonComponent {
  session$ = this.easyAuth.session$
  loading$ = this.easyAuth.loading$

  constructor(private easyAuth: EasyAuthService) {}

  async login() {
    try {
      await this.easyAuth.login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
}
```

#### Wallet Card Component

```typescript
// src/app/components/wallet-card/wallet-card.component.ts
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EasyAuthService } from '../../services/easyauth.service'

@Component({
  selector: 'app-wallet-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div *ngIf="loading$ | async">Loading wallet...</div>
      <div *ngIf="!(wallet$ | async) && !(loading$ | async)">
        <button (click)="createWallet()">Create Wallet</button>
      </div>
      <div *ngIf="wallet$ | async as wallet">
        <h3>Your Wallet</h3>
        <div class="wallet-address">
          <code>{{ wallet.address }}</code>
          <button (click)="copyAddress(wallet.address)">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p *ngIf="wallet.balance">Balance: {{ wallet.balance }} SOL</p>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .wallet-address {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    
    .wallet-address code {
      flex: 1;
      padding: 0.5rem;
      background: #f3f4f6;
      border-radius: 4px;
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class WalletCardComponent {
  wallet$ = this.easyAuth.wallet$
  loading$ = this.easyAuth.loading$
  copied = false

  constructor(private easyAuth: EasyAuthService) {}

  async createWallet() {
    try {
      await this.easyAuth.getWallet()
    } catch (error) {
      console.error('Failed to create wallet:', error)
    }
  }

  async copyAddress(address: string) {
    await navigator.clipboard.writeText(address)
    this.copied = true
    setTimeout(() => {
      this.copied = false
    }, 2000)
  }
}
```

#### Fund Wallet Card Component

```typescript
// src/app/components/fund-wallet-card/fund-wallet-card.component.ts
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { EasyAuthService } from '../../services/easyauth.service'

@Component({
  selector: 'app-fund-wallet-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="wallet$ | async" class="card">
      <h3>Fund Your Wallet</h3>
      
      <div class="form-group">
        <label for="amount">Amount</label>
        <input
          id="amount"
          type="number"
          [(ngModel)]="amount"
          min="10"
          max="1000"
        />
      </div>

      <div class="form-group">
        <label for="currency">Currency</label>
        <select id="currency" [(ngModel)]="currency">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>

      <button
        (click)="fund()"
        [disabled]="loading"
        class="btn-primary"
      >
        {{ loading ? 'Processing...' : 'Fund ' + amount + ' ' + currency }}
      </button>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    
    .error {
      color: #ef4444;
      margin: 0.5rem 0;
    }
    
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #14f195;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `]
})
export class FundWalletCardComponent {
  wallet$ = this.easyAuth.wallet$
  amount = 50
  currency = 'USD'
  loading = false
  error: string | null = null

  constructor(private easyAuth: EasyAuthService) {}

  async fund() {
    try {
      this.loading = true
      this.error = null
      await this.easyAuth.fundWallet(this.amount, this.currency)
    } catch (err) {
      this.error = (err as Error).message
    } finally {
      this.loading = false
    }
  }
}
```

### 3. Register in App Config

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
}
```

## Best Practices

1. **Use services** - Encapsulate EasyAuth logic in Angular services
2. **RxJS observables** - Leverage observables for reactive state
3. **Standalone components** - Use standalone components for better tree-shaking
4. **Error handling** - Always handle errors in components
5. **TypeScript** - Use strict TypeScript for type safety

## Next Steps

- [Backend Integration](/backend/nodejs) - Set up the Node.js backend
- [API Reference](/api/frontend) - Explore the complete frontend API
- [Common Patterns](/examples/common-patterns) - Advanced usage examples
