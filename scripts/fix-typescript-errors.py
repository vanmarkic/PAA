#!/usr/bin/env python3
"""
Comprehensive TypeScript error fixer for XState v5 migration.
Handles multiple error types in parallel.
"""

import re
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple


def run_typecheck() -> List[str]:
    """Run typecheck and return error lines."""
    result = subprocess.run(
        ['npm', 'run', 'typecheck'],
        capture_output=True,
        text=True,
        cwd='/home/user/PAA'
    )
    return result.stderr.splitlines()


def parse_errors(lines: List[str]) -> Dict[str, List[Tuple[str, int, str]]]:
    """Parse error lines into categorized errors."""
    errors = {
        'TS2322': [],  # Type assignment
        'TS2339': [],  # Property access
        'TS7031': [],  # Binding element implicitly any
        'TS2698': [],  # Spread types
        'TS2353': [],  # Object literal unknown properties
        'TS7006': [],  # Parameter implicitly any
    }

    for line in lines:
        match = re.match(r'([^(]+)\((\d+),\d+\): error (TS\d+):', line)
        if match:
            file_path, line_num, error_code = match.groups()
            if error_code in errors:
                errors[error_code].append((file_path, int(line_num), line))

    return errors


def fix_guard_property_access(file_path: str, content: str) -> str:
    """Fix TS2353 - guard: property doesn't exist in TransitionConfig."""
    # These are likely still using 'guard:' syntax that wasn't caught
    # Actually, XState v5 should use guard as a function, not a property in on: {}
    return content


def fix_implicit_any_params(file_path: str, content: str) -> str:
    """Fix TS7006/TS7031 - Add types to implicit any parameters."""
    # Fix guard functions: ({ context }) => without type
    # These should have explicit type annotations or rely on inference

    # For now, skip as these need case-by-case analysis
    return content


def fix_assign_return_types(file_path: str, content: str) -> str:
    """Fix TS2322 - assign function return type mismatches."""
    # The issue is that assign() with object notation expects specific types
    # For array properties, we need to ensure the return type matches

    # Pattern: biens: ({ context, event }) => [...context.biens, event.bien]
    # This is actually correct XState v5 syntax, the error might be elsewhere

    return content


def main():
    print("Running TypeScript error analysis...")
    error_lines = run_typecheck()
    errors = parse_errors(error_lines)

    print("\nError Summary:")
    for error_code, error_list in errors.items():
        if error_list:
            print(f"  {error_code}: {len(error_list)} errors")

    total_errors = sum(len(v) for v in errors.values())
    print(f"\nTotal categorized errors: {total_errors}")

    # Group errors by file
    files_to_fix = {}
    for error_code, error_list in errors.items():
        for file_path, line_num, line in error_list:
            if file_path not in files_to_fix:
                files_to_fix[file_path] = []
            files_to_fix[file_path].append((error_code, line_num, line))

    print(f"\nFiles with errors: {len(files_to_fix)}")

    # Show top files with most errors
    sorted_files = sorted(files_to_fix.items(), key=lambda x: len(x[1]), reverse=True)
    print("\nTop 10 files with most errors:")
    for file_path, file_errors in sorted_files[:10]:
        error_counts = {}
        for error_code, _, _ in file_errors:
            error_counts[error_code] = error_counts.get(error_code, 0) + 1
        error_str = ", ".join(f"{code}: {count}" for code, count in error_counts.items())
        print(f"  {file_path}: {len(file_errors)} errors ({error_str})")


if __name__ == '__main__':
    main()
