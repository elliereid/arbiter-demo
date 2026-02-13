import { Component, input } from '@angular/core';

/**
 * Displays a block of code in a styled dark editor panel.
 *
 * Why input() instead of @Input(): Angular 21 signal-based inputs are the
 * modern pattern. They're typed, required by default, and reactive — similar
 * to how you'd define a required prop in a TS interface.
 */
@Component({
  selector: 'app-code-block',
  template: `
    <div class="group relative overflow-hidden rounded-xl border border-surface-700 bg-surface-900">
      <!-- Header bar mimicking a code editor tab -->
      <div class="flex items-center gap-2 border-b border-surface-700 bg-surface-800 px-4 py-2">
        <div class="flex gap-1.5">
          <span class="h-3 w-3 rounded-full bg-red-500/60"></span>
          <span class="h-3 w-3 rounded-full bg-yellow-500/60"></span>
          <span class="h-3 w-3 rounded-full bg-green-500/60"></span>
        </div>
        <span class="ml-2 text-xs font-medium text-slate-400">{{ title() }}</span>
      </div>

      <!-- Code content -->
      <pre
        class="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-300"
      ><code>{{ code() }}</code></pre>
    </div>
  `,
  standalone: true,
})
export class CodeBlockComponent {
  /** Title shown in the editor tab bar */
  title = input.required<string>();

  /** The code string to display */
  code = input.required<string>();
}
