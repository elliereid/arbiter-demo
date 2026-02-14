import {
  Component,
  signal,
  afterNextRender,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CodeBlockComponent } from '../../components/code-block/code-block';
import {
  TerminalSimulationComponent,
  TerminalLine,
} from '../../components/terminal-simulation/terminal-simulation';
import { ArbiterBadgeComponent } from '../../components/arbiter-badge/arbiter-badge';
import { PYPI_DATASET } from '../../data/pypi-dataset';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CodeBlockComponent, TerminalSimulationComponent, ArbiterBadgeComponent],
})
export class LandingComponent {
  readonly stats = PYPI_DATASET.stats;
  readonly sampleFunction = PYPI_DATASET.functions[0];

  // ─── DX Section Code Snippets ───

  readonly validatorSetupCode = `# Install Arbiter
pip install arbiter-subnet

# Register on Bittensor (if not already)
btcli subnet register --netuid <SUBNET_UID> --wallet.name validator

# Start the validator
arbiter-validator start \\
  --wallet.name validator \\
  --wallet.hotkey default \\
  --subtensor.network finney`;

  readonly minerSetupCode = `# Install Arbiter
pip install arbiter-subnet

# Register as a miner
btcli subnet register --netuid <SUBNET_UID> --wallet.name miner

# Start the miner
arbiter-miner start \\
  --wallet.name miner \\
  --wallet.hotkey default \\
  --config miner-config.yaml`;

  readonly minerConfigCode = `# miner-config.yaml
strategy: llm          # Options: llm, hybrid, ast
model: claude-3-5      # LLM to use for doc generation
max_concurrent: 4      # Parallel task workers
self_test: true        # Run examples locally before submitting

# Scoring targets (aim for these to maximize TAO)
targets:
  example_execution: 1.0   # 40% of score — code must run
  type_accuracy: 1.0       # 30% of score — types must match
  param_coverage: 1.0      # 20% of score — all params documented`;

  /** Controls terminal animation start */
  terminalActive = signal(false);

  /** Which sections have been revealed by scroll */
  revealedSections = signal<Set<number>>(new Set());

  /** Terminal lines built from real data */
  readonly terminalLines: TerminalLine[] = this.buildTerminalLines();

  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => {
      this.setupScrollObserver();
    });
  }

  /** Mark a section as revealed (for CSS animation triggers) */
  isSectionRevealed(index: number): boolean {
    return this.revealedSections().has(index);
  }

  private setupScrollObserver(): void {
    const sections = document.querySelectorAll('[data-section]');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-section'));
            this.revealedSections.update((s) => {
              const next = new Set(s);
              next.add(idx);
              return next;
            });

            // Start terminal when section 4 (Live Terminal) is visible
            if (idx === 4) {
              this.terminalActive.set(true);
            }
          }
        }
      },
      { threshold: 0.2 },
    );

    sections.forEach((section) => this.observer!.observe(section));
  }

  private buildTerminalLines(): TerminalLine[] {
    const data = PYPI_DATASET.terminalOutput;
    const lines: TerminalLine[] = [];

    // Command
    lines.push({
      text: 'python generate_task.py ./sampled_functions --show-source',
      type: 'command',
      delay: 400,
    });

    lines.push({ text: '', type: 'blank' });

    // Show a subset of loading lines (first 6, then ellipsis, then last 3)
    const loading = data.loadingSequence;
    for (let i = 0; i < Math.min(6, loading.length); i++) {
      lines.push({ text: loading[i], type: 'output', delay: 50 });
    }
    if (loading.length > 9) {
      lines.push({
        text: `... ${loading.length - 9} more packages ...`,
        type: 'output',
        delay: 50,
      });
    }
    for (let i = Math.max(6, loading.length - 3); i < loading.length; i++) {
      lines.push({ text: loading[i], type: 'output', delay: 50 });
    }

    lines.push({ text: '', type: 'blank' });

    // Filter summary — split by newlines
    for (const line of data.filterSummary.split('\n')) {
      if (line.includes('Eligible')) {
        lines.push({ text: line, type: 'success', delay: 100 });
      } else if (line.includes('Rejected')) {
        lines.push({ text: line, type: 'error', delay: 100 });
      } else {
        lines.push({ text: line, type: 'output', delay: 60 });
      }
    }

    lines.push({ text: '', type: 'blank' });
    lines.push({
      text: 'Selecting random task from eligible pool...',
      type: 'output',
      delay: 600,
    });
    lines.push({ text: '', type: 'blank' });

    // Task output
    for (const line of data.sampleTaskLines) {
      if (line.startsWith('===') || line.startsWith('───')) {
        lines.push({ text: line, type: 'header', delay: 40 });
      } else if (line.includes('MINER TASK')) {
        lines.push({ text: line, type: 'success', delay: 40 });
      } else {
        lines.push({ text: line, type: 'output', delay: 40 });
      }
    }

    return lines;
  }
}
