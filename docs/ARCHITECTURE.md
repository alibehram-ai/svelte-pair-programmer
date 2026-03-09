# Architecture Overview

This document describes the high-level architecture of the AI Code Review Assistant.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SvelteKit App                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │   Home   │  │  Review  │  │  History │  │Settings │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  │                      │                                   │   │
│  │              ┌───────┴───────┐                          │   │
│  │              │ Monaco Editor │                          │   │
│  │              └───────────────┘                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP (tRPC)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SvelteKit Server                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   tRPC Router                            │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              review router                        │  │   │
│  │  │  • submit  • get  • list  • delete               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│              ┌──────────────┼──────────────┐                    │
│              ▼              ▼              ▼                    │
│  ┌───────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   AI Service  │  │   Prisma    │  │    SSR      │          │
│  │               │  │   Client    │  │   Loaders   │          │
│  └───────┬───────┘  └──────┬──────┘  └─────────────┘          │
└──────────┼─────────────────┼────────────────────────────────────┘
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌─────────────┐
│   AI Providers   │  │   SQLite    │
│  ┌────────────┐  │  │  Database   │
│  │   OpenAI   │  │  └─────────────┘
│  └────────────┘  │
│  ┌────────────┐  │
│  │  Anthropic │  │
│  └────────────┘  │
└──────────────────┘
```

## Data Flow

### Code Review Submission

```
User submits code
        │
        ▼
┌───────────────────┐
│ /review page      │
│ (client-side)     │
└─────────┬─────────┘
          │ trpc.review.submit.mutate()
          ▼
┌───────────────────┐
│ tRPC Handler      │
│ (server-side)     │
└─────────┬─────────┘
          │
          ├──────────────────────┐
          ▼                      ▼
┌───────────────────┐   ┌───────────────────┐
│ Create CodeReview │   │ Call AI Service   │
│ (status: PENDING) │   │                   │
└─────────┬─────────┘   └─────────┬─────────┘
          │                       │
          │                       ▼
          │             ┌───────────────────┐
          │             │ OpenAI / Claude   │
          │             │ API Call          │
          │             └─────────┬─────────┘
          │                       │
          │                       ▼
          │             ┌───────────────────┐
          │             │ Parse & Validate  │
          │             │ JSON Response     │
          │             └─────────┬─────────┘
          │                       │
          ▼                       ▼
┌───────────────────────────────────────────┐
│ Create ReviewResult + ReviewComments      │
│ Update CodeReview (status: COMPLETED)     │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Return result │
              │ to client     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Redirect to   │
              │ /review/[id]  │
              └───────────────┘
```

## Component Architecture

### Frontend Components

```
+layout.svelte
├── Sidebar.Provider
│   ├── Sidebar.Root
│   │   ├── Sidebar.Header (Logo + Title)
│   │   ├── Sidebar.Content
│   │   │   └── Navigation Menu
│   │   ├── Sidebar.Footer (Settings)
│   │   └── Sidebar.Rail
│   └── Sidebar.Inset
│       ├── Header (Trigger)
│       └── Main Content
│           └── {@render children()}
└── Toaster (sonner)
```

### Code Editor Component

```svelte
<CodeEditor>
├── Monaco Editor Instance
│   ├── Language: dynamic
│   ├── Theme: vs-dark
│   ├── Features:
│   │   ├── Syntax highlighting
│   │   ├── Line numbers
│   │   ├── Word wrap
│   │   └── Auto-layout
│   └── Events:
│       └── onDidChangeModelContent → value binding
</CodeEditor>
```

## Database Schema

```
┌─────────────────────┐
│     CodeReview      │
├─────────────────────┤
│ id: String (PK)     │
│ createdAt: DateTime │
│ updatedAt: DateTime │
│ language: String    │
│ filename: String?   │
│ content: String     │
│ status: ReviewStatus│
└──────────┬──────────┘
           │ 1:1
           ▼
┌─────────────────────┐
│    ReviewResult     │
├─────────────────────┤
│ id: String (PK)     │
│ createdAt: DateTime │
│ summary: String     │
│ readability: Int    │
│ structure: Int      │
│ maintainability: Int│
│ codeReviewId: FK    │
└──────────┬──────────┘
           │ 1:N
           ▼
┌─────────────────────┐
│   ReviewComment     │
├─────────────────────┤
│ id: String (PK)     │
│ createdAt: DateTime │
│ category: Category  │
│ message: String     │
│ lineStart: Int?     │
│ lineEnd: Int?       │
│ reviewResultId: FK  │
└─────────────────────┘
```

## API Design

### tRPC Router Structure

```typescript
appRouter
├── health: query → { status: "ok" }
└── review: router
    ├── submit: mutation
    │   Input:  { content, language, filename? }
    │   Output: { id, status, result }
    │
    ├── get: query
    │   Input:  { id }
    │   Output: CodeReview with Result and Comments
    │
    ├── list: query
    │   Input:  { limit?, cursor?, status? }
    │   Output: { items, nextCursor }
    │
    └── delete: mutation
        Input:  { id }
        Output: { success: true }
```

## AI Integration

### Provider Abstraction

```typescript
// Environment-based provider selection
AI_PROVIDER = "openai" | "anthropic"

// Common interface
async function reviewCode(input: ReviewInput): Promise<ReviewOutput>

// Provider implementations
├── reviewWithOpenAI()    → OpenAI Chat Completions API
└── reviewWithAnthropic() → Anthropic Messages API
```

### Prompt Structure

```
System Prompt:
"You are a senior engineer performing a code review.
Focus on readability, structure, and maintainability.
Return JSON only."

User Prompt:
"Review the following code.
File: {filename}
Language: {language}
Provide:
1) summary (short paragraph)
2) scores {readability, structure, maintainability} from 1-10
3) comments[] with category, message, optional lineStart/lineEnd
Return only valid JSON matching this schema: {...}
--- CODE START ---
{code}
--- CODE END ---"
```

## Security Considerations

1. **API Keys** - Stored in environment variables, never exposed to client
2. **Input Validation** - Zod schemas validate all tRPC inputs
3. **SQL Injection** - Prisma uses parameterized queries
4. **XSS Prevention** - Svelte auto-escapes HTML in templates
5. **Rate Limiting** - Should be implemented for production

## Performance Optimizations

1. **Prisma Singleton** - Prevents connection pool exhaustion
2. **SSR Data Loading** - Reviews loaded server-side for SEO
3. **Monaco Lazy Loading** - Editor loaded only when needed
4. **SuperJSON** - Efficient serialization for tRPC
5. **Database Indexes** - On frequently queried fields
