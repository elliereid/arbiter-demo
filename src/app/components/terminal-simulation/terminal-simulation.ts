import {
  Component,
  input,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';

/**
 * A line in the terminal simulation.
 *
 * Each line has a type that controls its color and rendering behavior:
 * - command: bright white with `$ ` prefix, types out char-by-char
 * - output: dim slate, appears instantly
 * - success: arbiter green
 * - error: red
 * - header: white bold (for `===` borders)
 * - blank: empty spacer line
 */
export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'success' | 'error' | 'header' | 'blank';
  delay?: number;
  typeEffect?: boolean;
}

@Component({
  selector: 'app-terminal-simulation',
  standalone: true,
  template: `
    <div class="group relative overflow-hidden rounded-xl border border-surface-700 bg-[#0a0a0f]">
      <!-- Terminal chrome -->
      <div class="flex items-center justify-between border-b border-surface-700 bg-surface-900 px-4 py-2">
        <div class="flex items-center gap-2">
          <div class="flex gap-1.5">
            <span class="h-3 w-3 rounded-full bg-red-500/60"></span>
            <span class="h-3 w-3 rounded-full bg-yellow-500/60"></span>
            <span class="h-3 w-3 rounded-full bg-green-500/60"></span>
          </div>
          <span class="ml-2 text-xs font-medium text-slate-500">{{ title() }}</span>
        </div>

        <!-- Skip button -->
        @if (!finished() && active()) {
          <button
            class="rounded px-2 py-0.5 text-xs text-slate-500 transition-colors hover:bg-surface-700 hover:text-slate-300"
            (click)="skip()"
          >
            Skip →
          </button>
        }
      </div>

      <!-- Terminal content -->
      <div
        class="overflow-x-auto p-4 font-mono text-sm leading-relaxed"
        style="min-height: 120px; max-height: 420px; overflow-y: auto"
        #terminalContent
      >
        @for (line of visibleLines(); track $index) {
          <div [class]="lineClass(line)">
            @if (line.type === 'command') {
              <span class="text-arbiter-400">$ </span>
            }
            <span>{{ line.text }}</span>
          </div>
        }

        <!-- Typing line (partial text being typed out) -->
        @if (typingText()) {
          <div class="text-white">
            <span class="text-arbiter-400">$ </span>
            <span>{{ typingText() }}</span>
            <span class="animate-pulse text-arbiter-400">▌</span>
          </div>
        }

        <!-- Blinking cursor when not typing but still running -->
        @if (active() && !finished() && !typingText()) {
          <div>
            <span class="animate-pulse text-arbiter-400">▌</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class TerminalSimulationComponent implements OnDestroy {
  /** Title in the terminal chrome bar */
  title = input<string>('arbiter-validator ~ terminal');

  /** The sequence of lines to render */
  lines = input.required<TerminalLine[]>();

  /** Whether the animation is running */
  active = input<boolean>(false);

  /** Milliseconds between each line appearing */
  lineDelay = input<number>(80);

  /** Milliseconds per character for typed lines */
  charDelay = input<number>(20);

  /** Lines rendered so far */
  visibleLines = signal<TerminalLine[]>([]);

  /** Partial text being typed out (for command lines) */
  typingText = signal<string>('');

  /** Whether the animation has completed */
  finished = signal(false);

  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private animationRunning = false;

  constructor() {
    effect(() => {
      const isActive = this.active();
      const allLines = this.lines();

      if (isActive && allLines.length > 0 && !this.animationRunning) {
        this.startAnimation(allLines);
      } else if (!isActive) {
        this.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  /** Skip to the end — shows all lines instantly */
  skip(): void {
    this.clearTimeouts();
    this.animationRunning = false;
    this.typingText.set('');
    this.visibleLines.set([...this.lines()]);
    this.finished.set(true);
  }

  /** Get CSS class for a terminal line based on its type */
  lineClass(line: TerminalLine): string {
    switch (line.type) {
      case 'command':
        return 'text-white font-semibold';
      case 'output':
        return 'text-slate-400';
      case 'success':
        return 'text-arbiter-400';
      case 'error':
        return 'text-red-400';
      case 'header':
        return 'text-white font-bold';
      case 'blank':
        return 'h-4';
      default:
        return 'text-slate-400';
    }
  }

  private startAnimation(allLines: TerminalLine[]): void {
    this.animationRunning = true;
    this.visibleLines.set([]);
    this.typingText.set('');
    this.finished.set(false);
    this.clearTimeouts();

    this.processLine(allLines, 0);
  }

  private processLine(allLines: TerminalLine[], index: number): void {
    if (index >= allLines.length) {
      this.finished.set(true);
      this.animationRunning = false;
      return;
    }

    const line = allLines[index];
    const delay = line.delay ?? this.lineDelay();

    if (line.type === 'command' || line.typeEffect) {
      // Type out character by character
      this.typeOutLine(line, 0, () => {
        this.typingText.set('');
        this.visibleLines.update((lines) => [...lines, line]);
        const t = setTimeout(() => this.processLine(allLines, index + 1), delay);
        this.timeouts.push(t);
      });
    } else {
      // Appear instantly after delay
      const t = setTimeout(() => {
        this.visibleLines.update((lines) => [...lines, line]);
        this.processLine(allLines, index + 1);
      }, delay);
      this.timeouts.push(t);
    }
  }

  private typeOutLine(line: TerminalLine, charIndex: number, onComplete: () => void): void {
    if (charIndex >= line.text.length) {
      onComplete();
      return;
    }

    this.typingText.set(line.text.substring(0, charIndex + 1));
    const t = setTimeout(
      () => this.typeOutLine(line, charIndex + 1, onComplete),
      this.charDelay(),
    );
    this.timeouts.push(t);
  }

  private reset(): void {
    this.clearTimeouts();
    this.animationRunning = false;
    this.visibleLines.set([]);
    this.typingText.set('');
    this.finished.set(false);
  }

  private clearTimeouts(): void {
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts = [];
  }
}
