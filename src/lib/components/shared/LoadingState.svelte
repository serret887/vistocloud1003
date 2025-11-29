<script lang="ts">
  interface Props {
    message?: string;
  }
  
  let { message = 'Loading...' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
  <p class="text-sm text-muted-foreground">{message}</p>
</div>


