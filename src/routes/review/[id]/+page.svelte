<script lang="ts">
  import type { PageData } from "./$types";
  import CodeEditor from "$lib/components/code-editor.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Code, BookOpen, Layers, Wrench } from "lucide-svelte";

  let { data }: { data: PageData } = $props();

  const review = $derived(data.review);
  const result = $derived(review?.result);

  function getScoreColor(score: number): string {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  }

  function getScoreIcon(score: number) {
    if (score >= 8) return CheckCircle;
    if (score >= 5) return AlertTriangle;
    return XCircle;
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case "READABILITY":
        return BookOpen;
      case "STRUCTURE":
        return Layers;
      case "MAINTAINABILITY":
        return Wrench;
      default:
        return Code;
    }
  }

  function getCategoryColor(category: string): string {
    switch (category) {
      case "READABILITY":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "STRUCTURE":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "MAINTAINABILITY":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "BEST_PRACTICE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "";
    }
  }
</script>

<div class="max-w-6xl mx-auto space-y-6">
  <div class="flex items-center gap-4">
    <Button href="/history" variant="ghost" size="icon">
      <ArrowLeft class="size-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold">
        {review?.filename ?? "Code Review"}
      </h1>
      <p class="text-muted-foreground">
        {review?.language} • {new Date(review?.createdAt ?? "").toLocaleDateString()}
      </p>
    </div>
  </div>

  {#if !result}
    <Card.Root>
      <Card.Content class="p-8 text-center">
        <p class="text-muted-foreground">Review is still processing...</p>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Scores -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Scores</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          {#each [
            { label: "Readability", score: result.readability, icon: BookOpen },
            { label: "Structure", score: result.structure, icon: Layers },
            { label: "Maintainability", score: result.maintainability, icon: Wrench },
          ] as item}
            {@const ItemIcon = item.icon}
            {@const ScoreIcon = getScoreIcon(item.score)}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <ItemIcon class="size-4 text-muted-foreground" />
                <span class="text-sm font-medium">{item.label}</span>
              </div>
              <div class="flex items-center gap-2">
                <ScoreIcon class="size-4 {getScoreColor(item.score)}" />
                <span class="font-bold {getScoreColor(item.score)}">{item.score}/10</span>
              </div>
            </div>
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary transition-all"
                style="width: {item.score * 10}%"
              ></div>
            </div>
          {/each}

          <Separator />

          <div class="flex items-center justify-between">
            <span class="font-medium">Overall</span>
            <span class="text-2xl font-bold {getScoreColor(Math.round((result.readability + result.structure + result.maintainability) / 3))}">
              {Math.round((result.readability + result.structure + result.maintainability) / 3)}/10
            </span>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Summary -->
      <Card.Root class="lg:col-span-2">
        <Card.Header>
          <Card.Title>Summary</Card.Title>
        </Card.Header>
        <Card.Content>
          <p class="text-muted-foreground leading-relaxed">{result.summary}</p>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Comments -->
    {#if result.comments.length > 0}
      <Card.Root>
        <Card.Header>
          <Card.Title>
            Suggestions ({result.comments.length})
          </Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          {#each result.comments as comment}
            {@const CategoryIcon = getCategoryIcon(comment.category)}
            <div class="flex gap-4 p-4 rounded-lg bg-muted/50">
              <CategoryIcon class="size-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div class="space-y-2 flex-1">
                <div class="flex items-center gap-2">
                  <Badge class={getCategoryColor(comment.category)}>
                    {comment.category.replace("_", " ")}
                  </Badge>
                  {#if comment.lineStart}
                    <span class="text-xs text-muted-foreground">
                      Line{comment.lineEnd && comment.lineEnd !== comment.lineStart ? `s ${comment.lineStart}-${comment.lineEnd}` : ` ${comment.lineStart}`}
                    </span>
                  {/if}
                </div>
                <p class="text-sm">{comment.message}</p>
              </div>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    {/if}

    <!-- Original Code -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Original Code</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="h-[300px]">
          <CodeEditor value={review?.content ?? ""} language={review?.language ?? "typescript"} readonly />
        </div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
