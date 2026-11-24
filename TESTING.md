# Testing Strategy: Where Did It Go?

## 1. Overview
Quality Assurance for Where Did It Go? follows a rigorous multi-tier testing pipeline:
- **Unit Tests**: Domain functions, algorithmic calculation, formatting.
- **Integration Tests**: State transitions, service communication, store updates.
- **Verification Gates**: Build verification and syntax audits.

## 2. Running Tests
```bash
npm test
```

## 3. Test Coverage Goals
- Minimum 85% statement coverage across domain services.
- 100% pass rate required for all release acceptance gates.
