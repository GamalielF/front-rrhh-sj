export interface BreadcrumbItem {
  label: string;
  url?: string;
  routerLink?: string | any[];
  icon?: string;
}

export interface BreadcrumbRouteData {
  label?: string;
  icon?: string;
  skip?: boolean;
}

export type BreadcrumbRouteConfig = string | BreadcrumbRouteData;
