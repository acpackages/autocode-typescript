# Changelog

All notable changes to the `@autocode-ts/ac-reactivity` package will be documented in this file.

## [0.0.1] - 2026-06-04

### Added
- Initial implementation of the high-performance hybrid reactivity engine.
- Root class property redefinition tracking with primitive O(1) `AcSignal`.
- Deep, lazy proxy wrappers for object and array child properties.
- Dynamic runtime type switching strategy.
- Microtask batching via `queueMicrotask` to coalesce state change events.
- Circular reference safety and leak-free WeakMap metadata storage.
- Standard TSConfig, Vite module bundler, Vitest spec suite, and benchmark tests.
