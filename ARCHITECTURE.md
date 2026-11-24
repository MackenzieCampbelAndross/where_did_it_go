# Architecture Document: Where Did It Go?

## 1. System Topology
The application is structured into decoupled layers following clean architecture principles:
1. **User Interface / Presentation**: Modular components rendered with strict reactive state bindings.
2. **Controller & State Management**: Unidirectional data flow managing active application context.
3. **Domain Engine**: Pure business logic isolated from presentation frameworks.
4. **Storage & Native Bridge**: Abstractions over OS primitives, SQLite, or file systems.

## 2. Technology Stack & Rationale
- **Technology**: Next.js, React, TypeScript, PostgreSQL, Prisma
- **Design Pattern**: Domain-Driven Modular Design
- **Security Posture**: Sandboxed execution, sanitized input vectors, zero hardcoded secrets.

## 3. Data Flow Diagram
```
[ User Input / Events ]
         │
         ▼
[ Presentation Component ]
         │ (Actions / Dispatches)
         ▼
[ State Store / Domain Service ]
         │
         ├───▶ [ Local Persistence / SQLite ]
         └───▶ [ Native OS API / Bridge ]
```
