import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-step-indicator',
  template: `
    <div class="flex items-center gap-3">
      @for (step of steps(); track step; let i = $index) {
        <div class="flex items-center gap-3">
          <!-- Step circle -->
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
            [class]="i <= currentStep() 
              ? 'bg-arbiter-500 text-white shadow-lg shadow-arbiter-500/30' 
              : 'bg-surface-700 text-slate-500'"
          >
            {{ i + 1 }}
          </div>

          <!-- Step label (only visible on larger screens) -->
          <span
            class="hidden text-sm font-medium transition-colors duration-300 md:inline"
            [class]="i <= currentStep() ? 'text-slate-200' : 'text-slate-500'"
          >
            {{ step }}
          </span>

          <!-- Connector line between steps -->
          @if (i < steps().length - 1) {
            <div
              class="h-px w-8 transition-colors duration-300"
              [class]="i < currentStep() ? 'bg-arbiter-500' : 'bg-surface-700'"
            ></div>
          }
        </div>
      }
    </div>
  `,
  standalone: true,
})
export class StepIndicatorComponent {
  /** Array of step labels */
  steps = input.required<string[]>();

  /** Zero-based index of the current active step */
  currentStep = input.required<number>();
}
