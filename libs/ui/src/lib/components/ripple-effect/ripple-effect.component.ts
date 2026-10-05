import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleConfig, DEFAULT_RIPPLE_CONFIG } from './ripple-effect.model';

@Component({
  selector: 'ui-ripple-effect',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ripple-effect.component.html',
  styleUrls: ['./ripple-effect.component.css'],
})
export class RippleEffectComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rippleElement', { static: true }) rippleElement!: ElementRef<HTMLDivElement>;

  @Input() imageUrl: string = '';
  @Input() config: Partial<RippleConfig> = {};

  private currentConfig: RippleConfig;
  private scriptsLoaded = false;
  private jqueryLoaded = false;
  private ripplesLoaded = false;
  private destroy$ = new AbortController();

  constructor() {
    this.currentConfig = { ...DEFAULT_RIPPLE_CONFIG, ...this.config };
  }

  ngAfterViewInit(): void {
    this.currentConfig = { ...DEFAULT_RIPPLE_CONFIG, ...this.config };
    this.loadScripts();
  }

  ngOnDestroy(): void {
    this.destroy$.abort();
    this.cleanup();
  }

  private async loadScripts(): Promise<void> {
    if (this.scriptsLoaded) return;

    try {
      await this.loadScript('/js/jquery.min.js');
      this.jqueryLoaded = true;

      await this.loadScript('/js/jquery.ripples-min.js');
      this.ripplesLoaded = true;

      this.scriptsLoaded = true;
      this.initializeRipple();
    } catch (error) {
      console.error('Error loading ripple scripts:', error);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private initializeRipple(): void {
    if (!this.jqueryLoaded || !this.ripplesLoaded) return;

    console.log(this.currentConfig);

    const element = this.rippleElement.nativeElement;
    const $ = (window as any).$;

    if ($) {
      console.log('jQuery cargado and element: ', element)
      $(element).ripples({
        resolution: this.currentConfig.resolution,
        dropRadius: this.currentConfig.dropRadius,
        perturbance: this.currentConfig.perturbance,
        interactive: this.currentConfig.interactive,
      });
    }
  }

  private cleanup(): void {
    const element = this.rippleElement.nativeElement;
    const $ = (window as any).$;

    if ($ && $(element).data('ripples')) {
      $(element).ripples('destroy');
    }
  }
}
