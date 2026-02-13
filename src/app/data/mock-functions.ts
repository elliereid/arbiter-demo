/**
 * Mock data representing curated PyPI functions for the Arbiter demo.
 *
 * These are realistic examples of undocumented functions from real packages.
 * Each has a "good" and "bad" miner submission so we can show how scoring works.
 */

/** Represents a raw undocumented function pulled from PyPI */
export interface RawFunction {
  packageName: string;
  modulePath: string;
  functionName: string;
  sourceCode: string;
  paramCount: number;
  hasTypeHints: boolean;
  complexity: number;
}

/** A miner's submitted documentation for a function */
export interface MinerSubmission {
  minerId: string;
  label: string;
  docstring: string;
  typeAnnotations: string;
  codeExample: string;
}

/** Scoring breakdown for a submission */
export interface ScoreBreakdown {
  exampleExecution: number;   // 40% weight — does the code example run?
  typeAccuracy: number;       // 30% weight — do the types match?
  parameterCoverage: number;  // 20% weight — are all params documented?
  totalScore: number;
}

export interface DemoFunction {
  raw: RawFunction;
  goodSubmission: MinerSubmission;
  badSubmission: MinerSubmission;
  goodScore: ScoreBreakdown;
  badScore: ScoreBreakdown;
}

// ─── Example 1: A string utility from a text processing package ───

const textNormalizer: DemoFunction = {
  raw: {
    packageName: 'textutils',
    modulePath: 'textutils.normalize',
    functionName: 'collapse_whitespace',
    sourceCode: `def collapse_whitespace(text, preserve_newlines=False, strip=True):
    import re
    if preserve_newlines:
        text = re.sub(r'[^\\S\\n]+', ' ', text)
    else:
        text = re.sub(r'\\s+', ' ', text)
    if strip:
        text = text.strip()
    return text`,
    paramCount: 3,
    hasTypeHints: false,
    complexity: 3,
  },
  goodSubmission: {
    minerId: 'miner_5x8k',
    label: 'Good Submission',
    docstring: `Collapse consecutive whitespace characters in a string into single spaces.

Handles tabs, multiple spaces, and optionally preserves newline characters.
Useful for cleaning user input or normalizing text extracted from HTML/PDFs.

Args:
    text: The input string to normalize.
    preserve_newlines: If True, newlines are kept intact while other
        whitespace is collapsed. Defaults to False.
    strip: If True, leading and trailing whitespace is removed from
        the result. Defaults to True.

Returns:
    The normalized string with collapsed whitespace.`,
    typeAnnotations: `def collapse_whitespace(
    text: str,
    preserve_newlines: bool = False,
    strip: bool = True
) -> str:`,
    codeExample: `>>> collapse_whitespace("hello    world\\t\\tfoo")
'hello world foo'
>>> collapse_whitespace("line1\\n\\n  line2", preserve_newlines=True)
'line1\\n\\n line2'
>>> collapse_whitespace("  padded  ", strip=False)
' padded '`,
  },
  badSubmission: {
    minerId: 'miner_9f2j',
    label: 'Bad Submission',
    docstring: `This function does whitespace stuff.

Args:
    text: the text`,
    typeAnnotations: `def collapse_whitespace(text: int, preserve_newlines=False, strip=True):`,
    codeExample: `>>> collapse_whitespace(12345)
'12345'`,
  },
  goodScore: {
    exampleExecution: 1.0,
    typeAccuracy: 1.0,
    parameterCoverage: 1.0,
    totalScore: 0.0, // calculated below
  },
  badScore: {
    exampleExecution: 0.0,
    typeAccuracy: 0.0,
    parameterCoverage: 0.33,
    totalScore: 0.0,
  },
};

// ─── Example 2: A retry decorator from an HTTP library ───

const retryDecorator: DemoFunction = {
  raw: {
    packageName: 'reqhelper',
    modulePath: 'reqhelper.retry',
    functionName: 'with_retry',
    sourceCode: `def with_retry(fn, max_attempts=3, backoff_factor=1.5, exceptions=None):
    import time
    if exceptions is None:
        exceptions = (Exception,)
    attempt = 0
    while True:
        try:
            return fn()
        except exceptions as e:
            attempt += 1
            if attempt >= max_attempts:
                raise
            wait = backoff_factor ** attempt
            time.sleep(wait)`,
    paramCount: 4,
    hasTypeHints: false,
    complexity: 4,
  },
  goodSubmission: {
    minerId: 'miner_a3m1',
    label: 'Good Submission',
    docstring: `Execute a callable with automatic retry on failure using exponential backoff.

Repeatedly calls the provided function until it succeeds or the maximum number
of attempts is exhausted. Wait time between retries grows exponentially based
on the backoff_factor.

Args:
    fn: A zero-argument callable to execute. Typically a lambda or partial
        wrapping the actual call.
    max_attempts: Maximum number of times to try calling fn. Defaults to 3.
    backoff_factor: Multiplier for exponential backoff between retries.
        Wait time = backoff_factor ** attempt_number. Defaults to 1.5.
    exceptions: A tuple of exception classes to catch and retry on.
        Defaults to (Exception,) which catches all exceptions.

Returns:
    The return value of fn() on successful execution.

Raises:
    The last caught exception if all attempts are exhausted.`,
    typeAnnotations: `from typing import Callable, TypeVar, Type
T = TypeVar('T')

def with_retry(
    fn: Callable[[], T],
    max_attempts: int = 3,
    backoff_factor: float = 1.5,
    exceptions: tuple[Type[BaseException], ...] | None = None
) -> T:`,
    codeExample: `>>> counter = {"n": 0}
>>> def flaky():
...     counter["n"] += 1
...     if counter["n"] < 3:
...         raise ConnectionError("fail")
...     return "success"
>>> with_retry(flaky, max_attempts=5)
'success'
>>> counter["n"]
3`,
  },
  badSubmission: {
    minerId: 'miner_k7x2',
    label: 'Bad Submission',
    docstring: `Retries a function.

Args:
    fn: the function
    max_attempts: attempts`,
    typeAnnotations: `def with_retry(fn, max_attempts: str = "3", backoff_factor=1.5, exceptions=None):`,
    codeExample: `>>> with_retry(print("hello"))
hello`,
  },
  badScore: {
    exampleExecution: 0.0,
    typeAccuracy: 0.0,
    parameterCoverage: 0.5,
    totalScore: 0.0,
  },
  goodScore: {
    exampleExecution: 1.0,
    typeAccuracy: 1.0,
    parameterCoverage: 1.0,
    totalScore: 0.0,
  },
};

// ─── Example 3: A config merger from a settings library ───

const configMerger: DemoFunction = {
  raw: {
    packageName: 'conftools',
    modulePath: 'conftools.merge',
    functionName: 'deep_merge',
    sourceCode: `def deep_merge(base, override, list_strategy="replace"):
    result = dict(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value, list_strategy)
        elif key in result and isinstance(result[key], list) and isinstance(value, list):
            if list_strategy == "append":
                result[key] = result[key] + value
            elif list_strategy == "unique":
                result[key] = list(dict.fromkeys(result[key] + value))
            else:
                result[key] = value
        else:
            result[key] = value
    return result`,
    paramCount: 3,
    hasTypeHints: false,
    complexity: 6,
  },
  goodSubmission: {
    minerId: 'miner_b2n5',
    label: 'Good Submission',
    docstring: `Recursively merge two dictionaries, with the override dict taking precedence.

Nested dictionaries are merged recursively rather than replaced wholesale.
Lists can be handled with different strategies: replaced entirely, appended,
or merged with duplicates removed.

Args:
    base: The base dictionary to merge into.
    override: The dictionary whose values take precedence.
    list_strategy: How to handle list collisions. One of:
        - "replace" (default): Override list replaces base list.
        - "append": Override list is appended to base list.
        - "unique": Lists are combined with duplicates removed,
          preserving insertion order.

Returns:
    A new dictionary containing the merged result. Neither input is mutated.`,
    typeAnnotations: `from typing import Any, Literal

def deep_merge(
    base: dict[str, Any],
    override: dict[str, Any],
    list_strategy: Literal["replace", "append", "unique"] = "replace"
) -> dict[str, Any]:`,
    codeExample: `>>> base = {"db": {"host": "localhost", "port": 5432}, "debug": False}
>>> override = {"db": {"port": 3306}, "debug": True}
>>> deep_merge(base, override)
{'db': {'host': 'localhost', 'port': 3306}, 'debug': True}
>>> deep_merge({"tags": [1, 2]}, {"tags": [2, 3]}, list_strategy="unique")
{'tags': [1, 2, 3]}`,
  },
  badSubmission: {
    minerId: 'miner_z4p8',
    label: 'Bad Submission',
    docstring: `Merges dicts.`,
    typeAnnotations: `def deep_merge(base: list, override: list, list_strategy="replace"):`,
    codeExample: `>>> deep_merge([1,2], [3,4])
[1, 2, 3, 4]`,
  },
  goodScore: {
    exampleExecution: 1.0,
    typeAccuracy: 1.0,
    parameterCoverage: 1.0,
    totalScore: 0.0,
  },
  badScore: {
    exampleExecution: 0.0,
    typeAccuracy: 0.0,
    parameterCoverage: 0.0,
    totalScore: 0.0,
  },
};

// ─── Calculate total scores ───

function calcTotal(s: ScoreBreakdown): number {
  return +(s.exampleExecution * 0.4 + s.typeAccuracy * 0.3 + s.parameterCoverage * 0.2).toFixed(2);
}

textNormalizer.goodScore.totalScore = calcTotal(textNormalizer.goodScore);
textNormalizer.badScore.totalScore = calcTotal(textNormalizer.badScore);
retryDecorator.goodScore.totalScore = calcTotal(retryDecorator.goodScore);
retryDecorator.badScore.totalScore = calcTotal(retryDecorator.badScore);
configMerger.goodScore.totalScore = calcTotal(configMerger.goodScore);
configMerger.badScore.totalScore = calcTotal(configMerger.badScore);

/** All demo functions available for the investor walkthrough */
export const DEMO_FUNCTIONS: DemoFunction[] = [textNormalizer, retryDecorator, configMerger];
