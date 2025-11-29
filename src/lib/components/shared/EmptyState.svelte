<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  
  interface Props {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  }
  
  let { icon = '📋', title, description, actionLabel, onAction }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
  <span class="text-4xl mb-4">{icon}</span>
  <h3 class="text-lg font-medium text-muted-foreground mb-2">{title}</h3>
  {#if description}
    <p class="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
  {/if}
  {#if actionLabel && onAction}
    <Button onclick={onAction}>{actionLabel}</Button>
  {/if}
</div>


