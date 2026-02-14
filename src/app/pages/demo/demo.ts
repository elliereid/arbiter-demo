import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../components/code-block/code-block';
import { ScoreBarComponent } from '../../components/score-bar/score-bar';
import { StepIndicatorComponent } from '../../components/step-indicator/step-indicator';
import {
  TerminalSimulationComponent,
  TerminalLine,
} from '../../components/terminal-simulation/terminal-simulation';
import { ArbiterBadgeComponent } from '../../components/arbiter-badge/arbiter-badge';
import { DEMO_FUNCTIONS, DemoFunction } from '../../data/mock-functions';
import { PYPI_DATASET } from '../../data/pypi-dataset';

/**
 * Main demo walkthrough page.
 *
 * This is a stepper-style presentation that walks investors through
 * the Arbiter scoring loop in four steps:
 *   1. The Problem — undocumented code on PyPI
 *   2. The Miner Response — good vs bad documentation
 *   3. The Scoring Engine — deterministic verification
 *   4. The Network — Bittensor economic loop
 *
 * Why signals for all state: Angular 21 signals replace the old
 * change detection model. Every piece of state is a signal(), and
 * derived values use computed(). This is conceptually identical to
 * SolidJS or Svelte runes — state that the framework can track.
 */
@Component({
  selector: 'app-demo',
  templateUrl: './demo.html',
  styleUrl: './demo.css',
  standalone: true,
  imports: [RouterLink, CodeBlockComponent, ScoreBarComponent, StepIndicatorComponent, TerminalSimulationComponent, ArbiterBadgeComponent],
})
export class DemoComponent {
  /** Steps in the demo flow */
  readonly steps = ['The Problem', 'Miner Response', 'Verification Engine', 'The Network'];

  /** Current step index (0-based) */
  currentStep = signal(0);

  /** Which of the 3 demo functions is selected */
  selectedFunctionIndex = signal(0);

  /** The currently selected demo function */
  currentFunction = computed<DemoFunction>(
    () => DEMO_FUNCTIONS[this.selectedFunctionIndex()]
  );

  /** Whether to show the "good" or "bad" submission in step 2 */
  showGoodSubmission = signal(true);

  /** Controls score bar animation — set to true when step 3 is entered */
  animateScores = signal(false);

  /** Whether the "verify" button has been clicked in step 3 */
  verificationRun = signal(false);

  /** All demo functions for the selector */
  readonly functions = DEMO_FUNCTIONS;

  /** Real stats from PyPI dataset */
  readonly pypiStats = PYPI_DATASET.stats;

  /** Terminal lines for the task selection mini-terminal in step 0 */
  terminalLines = computed<TerminalLine[]>(() => {
    const fn = this.currentFunction();
    return [
      { text: `arbiter-validator select-task --package ${fn.raw.packageName}`, type: 'command' as const, delay: 300 },
      { text: '', type: 'blank' as const },
      { text: `Scanning ${fn.raw.packageName}... ${fn.raw.paramCount * 12 + 80} functions, ${Math.round(fn.raw.paramCount * 5 + 30)} eligible`, type: 'output' as const, delay: 100 },
      { text: `Selected: ${fn.raw.modulePath}.${fn.raw.functionName}`, type: 'success' as const, delay: 200 },
      { text: `  Signature: ${fn.raw.sourceCode.split('\n')[0]}`, type: 'output' as const, delay: 60 },
      { text: `  Params: ${fn.raw.paramCount} | Complexity: ${fn.raw.complexity} | Type hints: none`, type: 'output' as const, delay: 60 },
    ];
  });

  /**
   * Expose Math.round to the template.
   *
   * Why: Angular templates run in a restricted scope — they can only access
   * properties of the component class, not JS globals like Math or window.
   * This is the standard pattern to make a global available.
   * In TS terms: it's like re-exporting a utility so the template "module" can use it.
   */
  protected readonly Math = Math;

  // ─── Navigation ───

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      const next = this.currentStep() + 1;
      this.currentStep.set(next);

      // Auto-trigger score animation when entering step 3
      if (next === 2) {
        this.animateScores.set(false);
        this.verificationRun.set(false);
      }
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((s) => s - 1);
    }
  }

  goToStep(index: number): void {
    this.currentStep.set(index);
    if (index === 2) {
      this.animateScores.set(false);
      this.verificationRun.set(false);
    }
  }

  // ─── Actions ───

  selectFunction(index: number): void {
    this.selectedFunctionIndex.set(index);
    // Reset scoring state when function changes
    this.animateScores.set(false);
    this.verificationRun.set(false);
  }

  toggleSubmission(good: boolean): void {
    this.showGoodSubmission.set(good);
  }

  /** Simulate running the verification engine */
  runVerification(): void {
    this.verificationRun.set(true);
    // Small delay before animating scores for dramatic effect
    setTimeout(() => this.animateScores.set(true), 300);
  }
}
