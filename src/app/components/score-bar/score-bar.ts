import { Component, input, computed } from '@angular/core';

/**
 * An animated horizontal bar that fills to represent a score from 0 to 1.
 *
 * Why computed() here: It derives the display values reactively from the
 * score input signal. When score changes, percentage and color update
 * automatically — like a TS getter but reactive.
 */
@Component({
  selector: 'app-score-bar',
  template: `
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-300">{{ label() }}</span>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">{{ weight() }}</span>
          <span class="font-mono text-sm font-semibold" [class]="scoreColorClass()">
            {{ displayScore() }}
          </span>
        </div>
      </div>

      <!-- Bar track -->
      <div class="h-2.5 overflow-hidden rounded-full bg-surface-700">
        <!-- Filled portion — uses CSS custom property for the animation target -->
        @if (animate()) {
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out"
            [class]="barColorClass()"
            [style.width.%]="percentage()"
          ></div>
        }
      </div>
    </div>
  `,
  standalone: true,
})
export class ScoreBarComponent {
  /** The label for this scoring dimension (e.g. "Example Execution") */
  label = input.required<string>();

  /** Weight label shown to the right (e.g. "40%") */
  weight = input.required<string>();

  /** Score value between 0 and 1 */
  score = input.required<number>();

  /** Whether to animate the bar fill (triggers on true) */
  animate = input<boolean>(false);

  /** Score as a percentage for the bar width */
  percentage = computed(() => this.score() * 100);

  /** Formatted display score */
  displayScore = computed(() => this.score().toFixed(2));

  /** Color class based on score value — green for good, red for bad */
  scoreColorClass = computed(() => {
    const s = this.score();
    if (s >= 0.7) return 'text-emerald-400';
    if (s >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  });

  barColorClass = computed(() => {
    const s = this.score();
    if (s >= 0.7) return 'bg-emerald-500';
    if (s >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  });
}
