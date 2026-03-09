<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Code, History, Sparkles, CheckCircle } from "lucide-svelte";
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold tracking-tight">AI Code Review Assistant</h1>
    <p class="text-xl text-muted-foreground">
      Get instant feedback on readability, structure, and maintainability before human review
    </p>
  </div>

  <div class="grid gap-6 md:grid-cols-3">
    <Card.Root>
      <Card.Header>
        <div class="flex items-center gap-2">
          <Sparkles class="size-5 text-primary" />
          <Card.Title>AI-Powered</Card.Title>
        </div>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">
          Leverages GPT-4 or Claude to analyze your code with expert-level insights
        </p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <div class="flex items-center gap-2">
          <CheckCircle class="size-5 text-primary" />
          <Card.Title>Comprehensive</Card.Title>
        </div>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">
          Reviews readability, code structure, and long-term maintainability
        </p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <div class="flex items-center gap-2">
          <History class="size-5 text-primary" />
          <Card.Title>Track Progress</Card.Title>
        </div>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">
          Keep history of all reviews to track improvements over time
        </p>
      </Card.Content>
    </Card.Root>
  </div>

  <div class="flex justify-center gap-4">
    <Button href="/review" size="lg">
      <Code class="size-4 mr-2" />
      Start New Review
    </Button>
    <Button href="/history" variant="outline" size="lg">
      <History class="size-4 mr-2" />
      View History
    </Button>
  </div>
</div>
