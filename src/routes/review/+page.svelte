<script lang="ts">
  import { goto } from "$app/navigation";
  import CodeEditor from "$lib/components/code-editor.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Select from "$lib/components/ui/select";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { trpc } from "$lib/trpc";
  import { toast } from "svelte-sonner";
  import { Loader2, Send } from "lucide-svelte";

  const languages = [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "cpp", label: "C++" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
  ];

  let code = $state("");
  let language = $state("typescript");
  let filename = $state("");
  let isSubmitting = $state(false);

  async function handleSubmit() {
    if (!code.trim()) {
      toast.error("Please enter some code to review");
      return;
    }

    isSubmitting = true;

    try {
      const result = await trpc.review.submit.mutate({
        content: code,
        language,
        filename: filename || undefined,
      });

      toast.success("Review completed!");
      goto(`/review/${result.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-6xl mx-auto space-y-6">
  <div>
    <h1 class="text-2xl font-bold">New Code Review</h1>
    <p class="text-muted-foreground">Paste your code below for AI-powered review</p>
  </div>

  <Card.Root>
    <Card.Header>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <label for="filename" class="text-sm font-medium mb-1.5 block">
            Filename (optional)
          </label>
          <Input
            id="filename"
            bind:value={filename}
            placeholder="e.g., utils.ts"
          />
        </div>
        <div class="w-full sm:w-48">
          <label class="text-sm font-medium mb-1.5 block">Language</label>
          <Select.Root type="single" bind:value={language}>
            <Select.Trigger class="w-full">
              {languages.find((l) => l.value === language)?.label ?? "Select language"}
            </Select.Trigger>
            <Select.Content>
              {#each languages as lang}
                <Select.Item value={lang.value}>{lang.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </Card.Header>
    <Card.Content>
      <div class="h-[400px]">
        <CodeEditor bind:value={code} {language} />
      </div>
    </Card.Content>
    <Card.Footer class="flex justify-end">
      <Button onclick={handleSubmit} disabled={isSubmitting || !code.trim()}>
        {#if isSubmitting}
          <Loader2 class="size-4 mr-2 animate-spin" />
          Analyzing...
        {:else}
          <Send class="size-4 mr-2" />
          Submit for Review
        {/if}
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
