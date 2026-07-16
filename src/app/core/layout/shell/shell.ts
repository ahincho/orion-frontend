import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly iconText: string;
}

@Component({
  selector: 'orion-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sidebarOpen = signal(true);
  protected readonly user = this.auth.user;
  protected readonly displayRole = computed(() => {
    const u = this.user();
    if (!u) {
      return '';
    }
    return u.role.charAt(0).toUpperCase() + u.role.slice(1);
  });
  protected readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) {
      return '';
    }
    const parts = u.name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  });

  protected readonly navItems: readonly NavItem[] = [
    { path: '/dashboard', label: 'Inicio', iconText: 'IN' },
    { path: '/assignments', label: 'Asignación de Censos', iconText: 'AC' },
    { path: '/expansion', label: 'Expansión de Redes', iconText: 'ER' },
    { path: '/maintenance', label: 'Mantenimiento por Riesgo', iconText: 'MR' },
    { path: '/post-sale', label: 'Seguimiento Post-Venta', iconText: 'SP' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
