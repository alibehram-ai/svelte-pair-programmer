<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import loader from "@monaco-editor/loader";
  import type monaco from "monaco-editor";

  type Monaco = typeof monaco;
  type Editor = monaco.editor.IStandaloneCodeEditor;

  interface Props {
    value?: string;
    language?: string;
    theme?: "vs" | "vs-dark";
    readonly?: boolean;
    onchange?: (value: string) => void;
  }

  let {
    value = $bindable(""),
    language = "typescript",
    theme = "vs-dark",
    readonly = false,
    onchange,
  }: Props = $props();

  let container: HTMLDivElement;
  let editor: Editor | null = null;
  let monacoInstance: Monaco | null = null;

  onMount(async () => {
    monacoInstance = await loader.init();

    editor = monacoInstance.editor.create(container, {
      value,
      language,
      theme,
      readOnly: readonly,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
      padding: { top: 16 },
    });

    editor.onDidChangeModelContent(() => {
      const newValue = editor?.getValue() ?? "";
      value = newValue;
      onchange?.(newValue);
    });
  });

  onDestroy(() => {
    editor?.dispose();
  });

  $effect(() => {
    if (editor && editor.getValue() !== value) {
      editor.setValue(value);
    }
  });

  $effect(() => {
    if (editor && monacoInstance) {
      monacoInstance.editor.setModelLanguage(editor.getModel()!, language);
    }
  });

  $effect(() => {
    if (monacoInstance) {
      monacoInstance.editor.setTheme(theme);
    }
  });
</script>

<div bind:this={container} class="h-full w-full min-h-[300px] border rounded-md overflow-hidden"></div>
