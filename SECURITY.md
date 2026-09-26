# Security Policy

## Security Architecture

LoopHora Infini-Diagrams is designed from the ground up as a zero-trust, local-first client-side web application:

- **Strict Isolation**: Mermaid diagram engine runs in strict security isolation (`securityLevel: 'strict'`).
- **SVG Sanitization**: All rendered SVG output is sanitized to remove `<script>` elements, inline event handlers (`on*`), and `javascript:` URLs.
- **Bounds Checking**: Diagram inputs are constrained by safety limits (`MAX_SOURCE_LENGTH = 100,000`) and raster rendering limits to protect client memory.
- **Zero Telemetry**: Diagram source and export buffers are processed purely in local browser memory and never transmitted over network sockets.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

- **Email**: security@loophora.com
- Please include reproduction steps, sample source, and environment details.
- Please do not open public issues regarding undisclosed security vulnerabilities.
