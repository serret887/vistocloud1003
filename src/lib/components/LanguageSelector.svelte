<script lang="ts">
  import { locale, setLocale } from '$lib/i18n';
  import { _ } from 'svelte-i18n';
  import { LanguageSwitcher, type Language } from '$lib/components/ui/language-switcher';
  
  let currentLocale = $state('en');
  
  $effect(() => {
    currentLocale = $locale || 'en';
  });
  
  // Make languages reactive to translations
  const languages = $derived.by(() => [
    { code: 'en', name: $_('language.english'), flag: '🇺🇸' },
    { code: 'es', name: $_('language.spanish'), flag: '🇪🇸' }
  ] as Language[]);
  
  function handleLocaleChange(value: string) {
    if (value === 'en' || value === 'es') {
      setLocale(value);
      currentLocale = value;
    }
  }
</script>

<LanguageSwitcher
  languages={languages}
  bind:value={currentLocale}
  onChange={handleLocaleChange}
  align="end"
  variant="outline"
/>

