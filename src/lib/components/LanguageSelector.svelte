<script lang="ts">
  import { locale, setLocale } from '$lib/i18n';
  import { _ } from 'svelte-i18n';
  import { Globe } from 'lucide-svelte';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '$lib/components/ui/select';
  
  let currentLocale = $state('en');
  
  $effect(() => {
    currentLocale = $locale || 'en';
  });
  
  function handleLocaleChange(value: string | undefined) {
    if (value && (value === 'en' || value === 'es')) {
      setLocale(value);
    }
  }
</script>

<div class="flex items-center gap-2">
  <Globe class="h-4 w-4 text-muted-foreground" />
  <Select
    type="single"
    value={currentLocale}
    onValueChange={handleLocaleChange}
  >
    <SelectTrigger class="w-[140px]">
      <SelectValue placeholder={$_('language.selector')} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="en">{$_('language.english')}</SelectItem>
      <SelectItem value="es">{$_('language.spanish')}</SelectItem>
    </SelectContent>
  </Select>
</div>

