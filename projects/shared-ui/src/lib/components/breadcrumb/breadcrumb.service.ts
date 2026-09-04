import { Injectable, inject, signal, Signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbItem, BreadcrumbRouteConfig } from './breadcrumb.model';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router, { optional: true });

  private readonly _breadcrumbs = signal<BreadcrumbItem[]>([]);
  private readonly _customBreadcrumbs = signal<BreadcrumbItem[] | null>(null);
  private readonly dynamicLabels = new Map<string, string>();

  readonly breadcrumbs: Signal<BreadcrumbItem[]> = this._breadcrumbs.asReadonly();

  constructor() {
    if (this.router) {
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => {
          this.computeBreadcrumbs();
        });

      if (this.router.routerState?.snapshot?.root) {
        this.computeBreadcrumbs();
      }
    }
  }

  setLabel(key: string, label: string): void {
    this.dynamicLabels.set(key, label);
    this.computeBreadcrumbs();
  }

  removeLabel(key: string): void {
    this.dynamicLabels.delete(key);
    this.computeBreadcrumbs();
  }

  setCustomBreadcrumbs(items: BreadcrumbItem[]): void {
    this._customBreadcrumbs.set(items);
    this._breadcrumbs.set(items);
  }

  clearCustomBreadcrumbs(): void {
    this._customBreadcrumbs.set(null);
    this.computeBreadcrumbs();
  }

  refresh(): void {
    this.computeBreadcrumbs();
  }

  private computeBreadcrumbs(): void {
    const custom = this._customBreadcrumbs();
    if (custom !== null) {
      this._breadcrumbs.set(custom);
      return;
    }

    if (!this.router?.routerState?.snapshot?.root) {
      this._breadcrumbs.set([]);
      return;
    }

    const root = this.router.routerState.snapshot.root;
    const items: BreadcrumbItem[] = [];
    this.buildBreadcrumbs(root, '', items);
    this._breadcrumbs.set(items);
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url: string,
    breadcrumbs: BreadcrumbItem[]
  ): void {
    const routeURL = route.url.map(segment => segment.path).filter(Boolean).join('/');
    const nextUrl = routeURL ? (url ? `${url}/${routeURL}` : `/${routeURL}`) : url;

    const config: BreadcrumbRouteConfig | undefined =
      route.routeConfig?.data?.['breadcrumb'] ?? (route.routeConfig ? undefined : route.data?.['breadcrumb']);

    if (config) {
      const isObject = typeof config === 'object';
      const shouldSkip = isObject && config.skip;

      if (!shouldSkip) {
        const rawLabel = isObject ? config.label : config;
        const resolvedLabel = rawLabel ? this.resolveLabel(rawLabel, route) : '';
        const targetLink = nextUrl || '/';

        if (resolvedLabel) {
          const lastItem = breadcrumbs[breadcrumbs.length - 1];
          const isDuplicate = lastItem && (lastItem.routerLink === targetLink || lastItem.label === resolvedLabel);

          if (!isDuplicate) {
            breadcrumbs.push({
              label: resolvedLabel,
              routerLink: targetLink,
              icon: isObject ? config.icon : undefined,
            });
          }
        }
      }
    }

    for (const child of route.children) {
      this.buildBreadcrumbs(child, nextUrl, breadcrumbs);
    }
  }

  private resolveLabel(rawLabel: string, route: ActivatedRouteSnapshot): string {
    if (this.dynamicLabels.has(rawLabel)) {
      return this.dynamicLabels.get(rawLabel)!;
    }

    const paramKey = rawLabel.startsWith(':') ? rawLabel.slice(1) : rawLabel;
    if (route.params && route.params[paramKey] !== undefined) {
      const paramVal = route.params[paramKey];
      if (this.dynamicLabels.has(paramVal)) {
        return this.dynamicLabels.get(paramVal)!;
      }
      return paramVal;
    }

    let interpolated = rawLabel;
    if (route.params) {
      for (const [key, val] of Object.entries(route.params)) {
        const placeholder = `:${key}`;
        if (interpolated.includes(placeholder)) {
          const replacement = this.dynamicLabels.get(placeholder) ?? this.dynamicLabels.get(val) ?? val;
          interpolated = interpolated.replace(placeholder, replacement);
        }
      }
    }

    return interpolated;
  }
}
