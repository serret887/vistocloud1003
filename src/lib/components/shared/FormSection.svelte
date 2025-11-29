<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  
  interface Props {
    title: string;
    description?: string;
    class?: string;
  }
  
  let { title, description, class: className = '', ...rest }: Props = $props();
</script>

<Card class={className} {...rest}>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    {#if description}
      <CardDescription>{description}</CardDescription>
    {/if}
  </CardHeader>
  <CardContent>
    <slot />
  </CardContent>
</Card>


