import { DiagramTemplate } from '../types';

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: 'flowchart-architecture',
    title: 'Flowchart: Microservices Architecture',
    category: 'Flowchart',
    description: 'Cloud microservices flow with load balancer, auth service, database cluster, and message queue.',
    source: `flowchart TD
    Client([Web & Mobile Clients]) -->|HTTPS / WSS| CDN[Cloudflare Edge CDN]
    CDN -->|Load Balance| Gateway[API Gateway / Ingress]
    
    subgraph Microservices Cluster
        Gateway --> Auth[Auth & Token Service]
        Gateway --> Order[Order Processing Service]
        Gateway --> Catalog[Product Catalog Service]
        Gateway --> Notify[Notification Service]
    end
    
    subgraph Persistence & Messaging
        Auth --> Redis[(Session Redis Cache)]
        Order --> Postgres[(Primary PostgreSQL DB)]
        Catalog --> Mongo[(Read-Heavy Document Store)]
        Order -->|Publish Event| Kafka>Kafka Event Stream]
        Kafka -->|Consume Event| Notify
    end

    classDef primary fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef edge fill:#1e293b,stroke:#64748b,color:#f8fafc;
    class Gateway,Order,Auth primary;
    class CDN,Kafka edge;`
  },
  {
    id: 'sequence-auth',
    title: 'Sequence: OAuth 2.0 PKCE Flow',
    category: 'Sequence',
    description: 'Secure token exchange between Single Page App, Identity Provider, and Backend API.',
    source: `sequenceDiagram
    autonumber
    actor User as End User
    participant SPA as Single Page App (Browser)
    participant Auth0 as Identity Provider (OIDC)
    participant API as Resource API

    User->>SPA: Click "Sign in with SSO"
    SPA->>SPA: Generate code_verifier & code_challenge
    SPA->>Auth0: Redirect /authorize (code_challenge, PKCE)
    Auth0->>User: Render Login & Consent Screen
    User->>Auth0: Submit Credentials + MFA
    Auth0->>SPA: Redirect callback?code=AUTH_CODE
    SPA->>Auth0: POST /token (code + code_verifier)
    Auth0-->>SPA: Return JWT Access & ID Tokens
    SPA->>API: GET /v1/user/profile (Bearer token)
    API-->>SPA: 200 OK (User Profile JSON)
    SPA->>User: Display Authenticated Dashboard`
  },
  {
    id: 'class-domain',
    title: 'Class: E-Commerce Domain Model',
    category: 'Class',
    description: 'Object-oriented domain model with inheritance, composition, and interface contracts.',
    source: `classDiagram
    direction TB
    class User {
        +String id
        +String email
        +String fullName
        +Boolean isActive
        +login()
        +logout()
    }
    class Customer {
        +Address shippingAddress
        +List~PaymentMethod~ savedPayments
        +placeOrder(Cart cart) Order
    }
    class Order {
        +String orderNumber
        +DateTime createdAt
        +OrderStatus status
        +Decimal totalAmount
        +calculateTax()
        +cancel()
    }
    class OrderItem {
        +String productId
        +Int quantity
        +Decimal unitPrice
        +Decimal subtotal()
    }
    class PaymentMethod {
        <<interface>>
        +processPayment(Decimal amount) Boolean
    }
    class CreditCardPayment {
        +String cardNumberMasked
        +String expiryDate
        +processPayment(Decimal amount) Boolean
    }

    User <|-- Customer
    Customer "1" *-- "many" Order : places
    Order "1" *-- "many" OrderItem : contains
    PaymentMethod <|.. CreditCardPayment
    Order --> PaymentMethod : paid with`
  },
  {
    id: 'state-order',
    title: 'State: Order Lifecycle Engine',
    category: 'State',
    description: 'Finite state machine covering cart checkout, payment escrow, shipment, and refunds.',
    source: `stateDiagram-v2
    [*] --> Draft : Customer adds items
    
    Draft --> PendingPayment : Checkout initiated
    PendingPayment --> PaymentFailed : Card declined / Timeout
    PaymentFailed --> PendingPayment : Retry with another card
    PaymentFailed --> Cancelled : Cart abandoned (24h)
    
    PendingPayment --> Processing : Payment Captured
    state Processing {
        [*] --> VerifyingInventory
        VerifyingInventory --> WarehousePicking : Stock reserved
        WarehousePicking --> Packed : QA check passed
        Packed --> ReadyForCourier
    }
    
    Processing --> Shipped : Carrier scanned tracking
    Shipped --> Delivered : Customer confirmation
    
    Delivered --> ReturnRequested : Within 30 days
    ReturnRequested --> Refunded : Inspection accepted
    Delivered --> [*]
    Cancelled --> [*]
    Refunded --> [*]`
  },
  {
    id: 'er-database',
    title: 'ER Diagram: Multi-Tenant SaaS Schema',
    category: 'Entity Relationship',
    description: 'Relational database schema with organizations, users, workspaces, and audit logs.',
    source: `erDiagram
    ORGANIZATION ||--o{ WORKSPACE : contains
    ORGANIZATION ||--o{ USER : employs
    WORKSPACE ||--o{ PROJECT : manages
    PROJECT ||--o{ DIAGRAM : stores
    USER ||--o{ AUDIT_LOG : generates

    ORGANIZATION {
        uuid id PK
        string name
        string plan_tier
        timestamp created_at
    }
    WORKSPACE {
        uuid id PK
        uuid organization_id FK
        string slug
        string display_name
    }
    USER {
        uuid id PK
        uuid organization_id FK
        string email
        string role
    }
    PROJECT {
        uuid id PK
        uuid workspace_id FK
        string title
        boolean is_archived
    }
    DIAGRAM {
        uuid id PK
        uuid project_id FK
        string name
        text mermaid_source
        timestamp updated_at
    }`
  },
  {
    id: 'gantt-release',
    title: 'Gantt: Product Release Roadmap',
    category: 'Gantt',
    description: 'Sprint planning and release milestones across core engine, UI polish, and security QA.',
    source: `gantt
    title Infini-Diagrams V1 Delivery Roadmap
    dateFormat YYYY-MM-DD
    section Engine Core
        Mermaid Adapter & Sanitizer :done, eng1, 2026-09-01, 2026-09-08
        Export Engine (SVG, PNG, PDF) :done, eng2, 2026-09-09, 2026-09-16
        IndexedDB Persistence & Revisions :active, eng3, 2026-09-17, 2026-09-24
    section Universal UI
        Design Tokens & Dark/Light Theme :done, ui1, 2026-09-05, 2026-09-12
        Split Studio & Pan/Zoom Canvas :active, ui2, 2026-09-14, 2026-09-22
        Mobile Touch & Responsive Drawer :crit, ui3, 2026-09-20, 2026-09-27
    section Release QA
        Filename Anti-UUID Regression Matrix :done, qa1, 2026-09-18, 2026-09-22
        Multi-Browser & Mobile Testing :crit, qa2, 2026-09-23, 2026-09-28
        Production Build Certification :milestone, qa3, 2026-09-29, 0d`
  },
  {
    id: 'pie-analytics',
    title: 'Pie Chart: Architecture Workload Distribution',
    category: 'Pie',
    description: 'Workload distribution across client-side compute, edge caching, and storage.',
    source: `pie title Client vs Server Resource Consumption
    "Client-Side In-Browser Rendering" : 55
    "Local IndexedDB Storage" : 25
    "Edge Static Assets Delivery" : 15
    "External Network Overhead" : 5`
  },
  {
    id: 'gitgraph-gitflow',
    title: 'Git Graph: Feature Branching Strategy',
    category: 'Git Graph',
    description: 'Gitflow branching strategy showing feature branches, release tags, and hotfixes.',
    source: `gitGraph
    commit id: "Initial Commit"
    commit id: "v0.9.0-alpha"
    branch develop
    checkout develop
    commit id: "Add Mermaid v11"
    branch feature/anti-uuid
    checkout feature/anti-uuid
    commit id: "Filename sanitization"
    commit id: "Safe object-URL cleanup"
    checkout develop
    merge feature/anti-uuid id: "Merge Anti-UUID"
    branch release/v1.0.0
    checkout release/v1.0.0
    commit id: "Release Candidate 1"
    checkout main
    merge release/v1.0.0 tag: "v1.0.0-certified"
    checkout develop
    merge release/v1.0.0`
  },
  {
    id: 'mindmap-product',
    title: 'Mindmap: Product Architecture',
    category: 'Mindmap',
    description: 'Comprehensive mindmap breaking down core pillars: Local-First, Universal UI, and Export Studio.',
    source: `mindmap
  root((Infini-Diagrams))
    Local-First Philosophy
      Zero Cloud Leakage
      IndexedDB Persistence
      Offline PWA Ready
      Air-Gapped Capable
    Universal UI Standard
      LoopHora Brand Eyebrow
      Inficy Dark / Light / System
      Touch Pinch Zoom & Pan
      Mobile Responsive Parity
    Production Export Studio
      Vector SVG Cleaned
      Ultra-HD PNG 1x to 4x
      Client-Side PDF (pdf-lib)
      Anti-UUID Contract
    Extensible Core
      Mermaid v11/v12 Engine
      Future PlantUML Adapter
      Future Graphviz DOT`
  },
  {
    id: 'user-journey',
    title: 'User Journey: Diagram Creation Flow',
    category: 'User Journey',
    description: 'User satisfaction journey from pasting diagram code to high-res PDF export.',
    source: `journey
    title User Experience: From Code to Finished Export
    section Create
      Open Infini-Diagrams: 5: User
      Paste raw Mermaid code: 5: User
      Instant local render: 5: System
    section Polish
      Tweak diagram node text: 4: User
      Catch syntax error non-destructively: 4: System, User
      Switch background to Dark: 5: User
      Zoom into dense cluster: 5: User
    section Export
      Open Export Modal: 5: User
      Select High-Res 4x PNG: 5: User
      Download with clean filename: 5: System, User`
  },
  {
    id: 'timeline-milestones',
    title: 'Timeline: Open Source Evolution',
    category: 'Timeline',
    description: 'Timeline illustrating product milestones from concept to production V1 certification.',
    source: `timeline
    title Infini-Diagrams Milestones
    2026 Q1 : Concept & Reddit Pain Research
            : Local-First Zero-Upload Charter
    2026 Q2 : Inficy Universal UI Alignment
            : Anti-UUID Download Contract Established
    2026 Q3 : Complete Mermaid 18+ Type Support
            : High-DPI Canvas & pdf-lib Integration
    2026 Q4 : Production V1 Certified Release`
  },
  {
    id: 'c4-context',
    title: 'C4 Context: System Environment',
    category: 'C4 Context',
    description: 'High-level C4 context diagram showing external actors, browser boundaries, and data stores.',
    source: `C4Context
    title System Context for Infini-Diagrams

    Person(user, "Developer / Architect", "Creates, inspects, and exports system diagrams")
    System(app, "Infini-Diagrams", "Local-first browser studio providing instant rendering, styling, and exports")
    System_Ext(mermaid, "Mermaid.js Core", "Pinned client-side diagram layout & rendering engine")
    SystemDb_Ext(idb, "Browser IndexedDB", "Local storage for documents, drafts, and revision history")

    Rel(user, app, "Writes Mermaid code, configures presentation, and exports")
    Rel(app, mermaid, "Invokes isolated rendering with strict security")
    Rel(app, idb, "Persists autosaved diagrams and revision snapshots locally")`
  },
  {
    id: 'quadrant-matrix',
    title: 'Quadrant: Feature Prioritization Matrix',
    category: 'Quadrant',
    description: 'Effort versus Impact quadrant chart for product capabilities.',
    source: `quadrantChart
    title Feature Priority vs Effort
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Quick Wins
    quadrant-2 Strategic Bets
    quadrant-3 Nice-to-Have
    quadrant-4 Low Priority
    "Anti-UUID Downloads": [0.25, 0.85]
    "Non-Destructive Error Recovery": [0.35, 0.90]
    "Ultra-HD 4x PNG Export": [0.30, 0.80]
    "Mobile Touch Pan/Zoom": [0.45, 0.75]
    "Client-Side PDF (pdf-lib)": [0.55, 0.82]
    "Cloud Sync Accounts": [0.90, 0.20]
    "AI Diagram Generator": [0.85, 0.40]`
  },
  {
    id: 'sankey-flow',
    title: 'Sankey: Traffic and Data Flow',
    category: 'Sankey',
    description: 'Flow of user actions transitioning to rendered previews and exports.',
    source: `sankey-beta
    User Input,Live Preview,70
    User Input,Syntax Diagnostics,30
    Live Preview,SVG Vector Export,35
    Live Preview,PNG High-DPI Export,25
    Live Preview,PDF Document Export,10
    Syntax Diagnostics,Recovered Last Valid Preview,30`
  },
  {
    id: 'block-system',
    title: 'Block: High-Performance Engine Stack',
    category: 'Block',
    description: 'Block diagram detailing the layers of the local studio architecture.',
    source: `block-beta
    columns 3
    doc["IndexedDB Document Store"]:3
    editor["CodeMirror Source Editor"] preview["Interactive Pan/Zoom Canvas"] export["Export Engine (SVG/PNG/PDF)"]
    core["Mermaid Isolated Renderer"]:3`
  }
];
