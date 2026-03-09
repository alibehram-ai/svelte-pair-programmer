<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { Code, History, Settings, FileCode2, Home } from "lucide-svelte";
  import { page } from "$app/stores";

  let { children } = $props();
</script>

<Sidebar.Provider>
  <Sidebar.Root>
    <Sidebar.Header>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton size="lg" class="cursor-default">
            <div class="flex items-center gap-2">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileCode2 class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">Code Review AI</span>
                <span class="text-xs text-muted-foreground">Pre-review Assistant</span>
              </div>
            </div>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Header>

    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={$page.url.pathname === "/"}>
                {#snippet child({ props })}
                  <a href="/" {...props}>
                    <Home class="size-4" />
                    <span>Home</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={$page.url.pathname === "/review" || $page.url.pathname.startsWith("/review/")}>
                {#snippet child({ props })}
                  <a href="/review" {...props}>
                    <Code class="size-4" />
                    <span>New Review</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={$page.url.pathname === "/history"}>
                {#snippet child({ props })}
                  <a href="/history" {...props}>
                    <History class="size-4" />
                    <span>History</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton isActive={$page.url.pathname === "/settings"}>
            {#snippet child({ props })}
              <a href="/settings" {...props}>
                <Settings class="size-4" />
                <span>Settings</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>

    <Sidebar.Rail />
  </Sidebar.Root>

  <Sidebar.Inset>
    <header class="flex h-14 items-center gap-2 border-b px-4">
      <Sidebar.Trigger />
      <div class="flex-1"></div>
    </header>
    <main class="flex-1 p-6">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>

<Toaster />
