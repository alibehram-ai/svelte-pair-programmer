<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import { Bot, Key, Sparkles } from "lucide-svelte";
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Settings</h1>
    <p class="text-muted-foreground">Configure your AI code review assistant</p>
  </div>

  <Card.Root>
    <Card.Header>
      <div class="flex items-center gap-2">
        <Bot class="size-5" />
        <Card.Title>AI Provider</Card.Title>
      </div>
      <Card.Description>
        Configure which AI service to use for code reviews
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">Current Provider</p>
          <p class="text-sm text-muted-foreground">Set via AI_PROVIDER environment variable</p>
        </div>
        <Badge variant="outline">
          <Sparkles class="size-3 mr-1" />
          OpenAI / Anthropic
        </Badge>
      </div>

      <Separator />

      <div class="space-y-4 text-sm">
        <div>
          <h4 class="font-medium mb-2">Environment Variables</h4>
          <div class="bg-muted p-4 rounded-lg font-mono text-xs space-y-1">
            <p><span class="text-muted-foreground"># Choose provider: "openai" or "anthropic"</span></p>
            <p>AI_PROVIDER=openai</p>
            <p></p>
            <p><span class="text-muted-foreground"># OpenAI Configuration</span></p>
            <p>OPENAI_API_KEY=your-api-key</p>
            <p>OPENAI_MODEL=gpt-4o-mini</p>
            <p></p>
            <p><span class="text-muted-foreground"># Anthropic Configuration</span></p>
            <p>ANTHROPIC_API_KEY=your-api-key</p>
            <p>ANTHROPIC_MODEL=claude-3-5-sonnet-latest</p>
          </div>
        </div>

        <div>
          <h4 class="font-medium mb-2 flex items-center gap-2">
            <Key class="size-4" />
            Getting API Keys
          </h4>
          <ul class="space-y-2 text-muted-foreground">
            <li>
              <strong>OpenAI:</strong>{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                platform.openai.com/api-keys
              </a>
            </li>
            <li>
              <strong>Anthropic:</strong>{" "}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                console.anthropic.com/settings/keys
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>About</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-sm text-muted-foreground">
        AI Code Review Assistant analyzes your code for readability, structure, and maintainability 
        before human review. It provides actionable suggestions to improve code quality.
      </p>
      <div class="mt-4 flex gap-2">
        <Badge variant="secondary">SvelteKit</Badge>
        <Badge variant="secondary">Prisma</Badge>
        <Badge variant="secondary">tRPC</Badge>
        <Badge variant="secondary">shadcn-svelte</Badge>
      </div>
    </Card.Content>
  </Card.Root>
</div>
