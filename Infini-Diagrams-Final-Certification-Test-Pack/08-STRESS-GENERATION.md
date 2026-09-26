# Stress Generation

A finite fixture corpus cannot cover infinite source combinations. Add controlled generation.

Generate:
- linear chains
- binary trees
- fan-in
- fan-out
- grids
- cycles
- disconnected graphs
- dense graphs
- nested subgraphs
- long labels

Sizes:
1, 10, 50, 100, 250, 500, 1,000, 2,500 and 5,000 where safe.

Text lengths:
1, 20, 100, 500, 1,000 characters where supported.

Character sets:
ASCII, Unicode, Malayalam, Hindi, CJK, emoji, mixed scripts.

Export scales:
1x, 2x, 3x, 4x and the configured maximum.

The purpose is to discover safe operating limits, not intentionally crash a device. Unsafe dimensions must be rejected cleanly.
