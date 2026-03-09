# AI Code Review Assistant

An AI-powered code review assistant built with SvelteKit that analyzes code for readability, structure, and maintainability before human review.

## Features

- 🤖 **AI-Powered Reviews** - Leverages OpenAI GPT-4 or Anthropic Claude for expert-level code analysis
- 📊 **Comprehensive Scoring** - Get scores for readability, structure, and maintainability (1-10)
- 💬 **Detailed Feedback** - Line-by-line suggestions with categorized comments
- 📝 **Monaco Editor** - Professional code editor with syntax highlighting
- 📚 **Review History** - Track all past reviews with filtering capabilities
- 🎨 **Modern UI** - Built with shadcn-svelte components and Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SvelteKit 2 + Svelte 5 |
| UI Components | shadcn-svelte |
| Styling | Tailwind CSS |
| Backend | SvelteKit SSR + tRPC |
| Database | Prisma + SQLite |
| AI | OpenAI GPT-4 / Anthropic Claude |
| Code Editor | Monaco Editor |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- OpenAI API key or Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd svelte-pair-programmer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
DATABASE_URL="file:./dev.db"

# Choose one AI provider
AI_PROVIDER="openai"  # or "anthropic"

# OpenAI Configuration
OPENAI_API_KEY="sk-your-openai-key"
OPENAI_MODEL="gpt-4o-mini"

# Anthropic Configuration (if using Claude)
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # shadcn-svelte components
│   │   └── code-editor.svelte
│   ├── server/
│   │   ├── ai/              # AI service abstraction
│   │   ├── routers/         # tRPC routers
│   │   ├── db.ts            # Prisma client
│   │   ├── router.ts        # Main tRPC router
│   │   └── trpc.ts          # tRPC configuration
│   └── trpc.ts              # tRPC client
├── routes/
│   ├── api/trpc/[trpc]/     # tRPC API endpoint
│   ├── history/             # Review history page
│   ├── review/
│   │   ├── [id]/            # Review result page
│   │   └── +page.svelte     # New review page
│   ├── settings/            # Settings page
│   └── +page.svelte         # Home page
└── generated/prisma/        # Generated Prisma client
```

## Usage

### Creating a New Review

1. Navigate to "New Review" from the sidebar
2. Optionally enter a filename
3. Select the programming language
4. Paste your code in the Monaco editor
5. Click "Submit for Review"
6. Wait for AI analysis (typically 5-15 seconds)
7. View detailed results with scores and suggestions

### Viewing Review History

1. Navigate to "History" from the sidebar
2. Filter by status (All, Completed, Pending, Failed)
3. Click on any review to see full details

### Configuring AI Provider

Edit your `.env` file to switch between OpenAI and Anthropic:

```env
# Use OpenAI
AI_PROVIDER="openai"

# Or use Anthropic
AI_PROVIDER="anthropic"
```

## API Reference

### tRPC Procedures

#### `review.submit`
Submit code for AI review.

```typescript
input: {
  content: string;    // The code to review
  language: string;   // Programming language
  filename?: string;  // Optional filename
}
```

#### `review.get`
Get a specific review by ID.

```typescript
input: { id: string }
```

#### `review.list`
List reviews with pagination.

```typescript
input: {
  limit?: number;     // Max 100, default 20
  cursor?: string;    // Pagination cursor
  status?: "PENDING" | "COMPLETED" | "FAILED";
}
```

#### `review.delete`
Delete a review.

```typescript
input: { id: string }
```

## Database Schema

### CodeReview
- `id` - Unique identifier
- `createdAt` - Timestamp
- `language` - Programming language
- `filename` - Optional filename
- `content` - The code content
- `status` - PENDING | COMPLETED | FAILED

### ReviewResult
- `id` - Unique identifier
- `summary` - AI-generated summary
- `readability` - Score 1-10
- `structure` - Score 1-10
- `maintainability` - Score 1-10

### ReviewComment
- `id` - Unique identifier
- `category` - READABILITY | STRUCTURE | MAINTAINABILITY | BEST_PRACTICE
- `message` - The feedback message
- `lineStart` - Optional line number
- `lineEnd` - Optional end line number

## Development

### Running in Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Database Operations
```bash
# Create a migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## License

MIT
