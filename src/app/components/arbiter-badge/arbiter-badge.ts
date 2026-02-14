import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-arbiter-badge',
  standalone: true,
  template: `
    @if (variant() === 'badge') {
      <span class="inline-flex items-center gap-1.5 rounded-full border border-arbiter-500/30 bg-arbiter-500/10 px-2.5 py-1 text-xs font-medium text-arbiter-400">
        <svg
          [attr.width]="16"
          [attr.height]="16"
          viewBox="0 0 24 24"
          fill="none"
          class="text-arbiter-400"
        >
          <path
            d="M12 2L3 20h3.5l1.8-4h7.4l1.8 4H21L12 2Z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M12 2L3 20h3.5l1.8-4h7.4l1.8 4H21L12 2Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M8.5 14L12 6l3.5 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.6"
          />
          <path
            d="M9 17l2-2.5 2 2.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Arbiter Verified
      </span>
    } @else {
      <svg
        [attr.width]="dimensions().w"
        [attr.height]="dimensions().h"
        viewBox="0 0 24 24"
        fill="none"
        [class]="svgClass()"
      >
        <!-- Outer A shape — two legs converging at apex with fill -->
        <path
          d="M12 2L3 20h3.5l1.8-4h7.4l1.8 4H21L12 2Z"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M12 2L3 20h3.5l1.8-4h7.4l1.8 4H21L12 2Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <!-- Inner crossbar — the A's horizontal bar -->
        <path
          d="M8.5 14L12 6l3.5 8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.6"
        />
        <!-- Verification chevron — small upward check at the base -->
        <path
          d="M9 17l2-2.5 2 2.5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
    .arbiter-glow {
      filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.4))
              drop-shadow(0 0 20px rgba(52, 211, 153, 0.2));
    }
  `,
})
export class ArbiterBadgeComponent {
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  variant = input<'default' | 'glow' | 'badge'>('default');

  dimensions = computed(() => {
    const map = {
      sm: { w: 20, h: 20 },
      md: { w: 36, h: 36 },
      lg: { w: 64, h: 64 },
      xl: { w: 96, h: 96 },
    };
    return map[this.size()];
  });

  svgClass = computed(() => {
    return this.variant() === 'glow' ? 'arbiter-glow' : '';
  });
}
