/** TypeScript interfaces for the pre-generated PyPI dataset. */

export interface PyPIStats {
  totalFunctionsScanned: number;
  totalPackages: number;
  eligibleFunctions: number;
  eligibilityRate: number;
  rejectionBreakdown: Record<string, number>;
}

export interface PyPITask {
  task_id: string;
  function_name: string;
  package_name: string;
  signature: string;
  context_hint: string;
  deadline_seconds: number;
}

export interface PyPIFunction {
  task: PyPITask;
  source: string;
  metadata: {
    lineCount: number;
    paramCount: number;
    complexity: number;
    hasTypeHints: boolean;
  };
}

export interface TerminalOutput {
  loadingSequence: string[];
  filterSummary: string;
  sampleTaskLines: string[];
}

export interface PyPIDataset {
  stats: PyPIStats;
  functions: PyPIFunction[];
  terminalOutput: TerminalOutput;
}
