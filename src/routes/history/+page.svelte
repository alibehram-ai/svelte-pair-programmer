<script lang="ts">
  import type { PageData } from "./$types";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Code, Clock, CheckCircle, XCircle, Loader2, FileCode2, Trash2 } from "lucide-svelte";
  import { trpc } from "$lib/trpc";
  import { toast } from "svelte-sonner";

  let { data }: { data: PageData } = $props();

  let reviews = $derived(data.reviews);
  let isDeleting = $state<string | null>(null);
  let localReviews = $state<typeof data.reviews>([]);

  $effect(() => {
    localReviews = data.reviews;
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return { icon: CheckCircle, class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
      case "PENDING":
        return { icon: Loader2, class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
      case "FAILED":
        return { icon: XCircle, class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
      default:
        return { icon: Clock, class: "" };
    }
  }

  function getAverageScore(result: { readability: number; structure: number; maintainability: number } | null): number {
    if (!result) return 0;
    return Math.round((result.readability + result.structure + result.maintainability) / 3);
  }

  function filterByStatus(status: string | undefined) {
    const params = new URLSearchParams($page.url.searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    goto(`/history?${params.toString()}`);
  }

  async function deleteReview(id: string) {
    isDeleting = id;
    try {
      await trpc.review.delete.mutate({ id });
      localReviews = localReviews.filter((r) => r.id !== id);
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
    } finally {
      isDeleting = null;
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Review History</h1>
      <p class="text-muted-foreground">Browse your past code reviews</p>
    </div>
    <div class="w-40">
      <Select.Root 
        type="single" 
        value={data.currentStatus ?? "all"}
        onValueChange={(v) => filterByStatus(v === "all" ? undefined : v)}
      >
        <Select.Trigger>
          {data.currentStatus ?? "All Status"}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">All Status</Select.Item>
          <Select.Item value="COMPLETED">Completed</Select.Item>
          <Select.Item value="PENDING">Pending</Select.Item>
          <Select.Item value="FAILED">Failed</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  {#if reviews.length === 0}
    <Card.Root>
      <Card.Content class="p-12 text-center">
        <FileCode2 class="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="font-semibold mb-2">No reviews yet</h3>
        <p class="text-muted-foreground mb-4">Start by submitting your first code review</p>
        <Button href="/review">
          <Code class="size-4 mr-2" />
          New Review
        </Button>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="space-y-3">
      {#each localReviews as review (review.id)}
        {@const statusBadge = getStatusBadge(review.status)}
        {@const avgScore = getAverageScore(review.result)}
        {@const StatusIcon = statusBadge.icon}
        <Card.Root class="hover:bg-muted/50 transition-colors">
          <Card.Content class="p-4">
            <div class="flex items-center gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <a 
                    href="/review/{review.id}" 
                    class="font-medium hover:underline truncate"
                  >
                    {review.filename || "Untitled"}
                  </a>
                  <Badge class={statusBadge.class}>
                    <StatusIcon class="size-3 mr-1 {review.status === 'PENDING' ? 'animate-spin' : ''}" />
                    {review.status}
                  </Badge>
                </div>
                <div class="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{review.language}</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  {#if review.result}
                    <span>•</span>
                    <span class="font-medium {avgScore >= 8 ? 'text-green-600' : avgScore >= 5 ? 'text-yellow-600' : 'text-red-600'}">
                      Score: {avgScore}/10
                    </span>
                  {/if}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button href="/review/{review.id}" variant="outline" size="sm">
                  View
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onclick={() => deleteReview(review.id)}
                  disabled={isDeleting === review.id}
                >
                  {#if isDeleting === review.id}
                    <Loader2 class="size-4 animate-spin" />
                  {:else}
                    <Trash2 class="size-4 text-muted-foreground hover:text-destructive" />
                  {/if}
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
