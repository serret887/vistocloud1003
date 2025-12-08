<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Switch, Label } from '$lib/components/ui';
  import { SSNInput, DateInput, ValidatedSelect, NameInput, EmailInput, PhoneInput } from '$lib/components/ui/validated-input';
  import type { ClientData } from '$lib/types/client-data';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    clientData: ClientData | undefined;
    onUpdate: (field: string, value: string | boolean) => void;
  }
  
  let { clientData, onUpdate }: Props = $props();
  
  const citizenshipOptions = $derived([
    { value: 'US Citizen', label: $_('clientInfo.citizenship.usCitizen') },
    { value: 'Permanent Resident Alien', label: $_('clientInfo.citizenship.permanentResident') },
    { value: 'Non-Permanent Resident Alien', label: $_('clientInfo.citizenship.nonPermanentResident') }
  ]);
  
  const maritalStatusOptions = $derived([
    { value: 'Married', label: $_('clientInfo.maritalStatus.married') },
    { value: 'Unmarried', label: $_('clientInfo.maritalStatus.unmarried') },
    { value: 'Separated', label: $_('clientInfo.maritalStatus.separated') }
  ]);
</script>

<Card>
  <CardHeader>
    <CardTitle>{$_('clientInfo.personalInfo.title')}</CardTitle>
    <CardDescription>{$_('clientInfo.personalInfo.description')}</CardDescription>
  </CardHeader>
  <CardContent class="space-y-6">
    <!-- Name -->
    <div class="grid md:grid-cols-2 gap-4">
      <NameInput
        label={$_('clientInfo.personalInfo.firstName')}
        value={clientData?.firstName || ''}
        onValueChange={(val) => onUpdate('firstName', val)}
        placeholder={$_('clientInfo.personalInfo.firstNamePlaceholder')}
        required
        allowSpaces={true}
      />
      <NameInput
        label={$_('clientInfo.personalInfo.lastName')}
        value={clientData?.lastName || ''}
        onValueChange={(val) => onUpdate('lastName', val)}
        placeholder={$_('clientInfo.personalInfo.lastNamePlaceholder')}
        required
        allowSpaces={true}
      />
    </div>
    
    <!-- Contact -->
    <div class="grid md:grid-cols-2 gap-4">
      <EmailInput
        label={$_('clientInfo.personalInfo.email')}
        value={clientData?.email || ''}
        onValueChange={(val) => onUpdate('email', val)}
        placeholder={$_('clientInfo.personalInfo.emailPlaceholder')}
        required
      />
      <PhoneInput
        label={$_('clientInfo.personalInfo.phone')}
        value={clientData?.phone || ''}
        onValueChange={(val) => onUpdate('phone', val)}
        required
      />
    </div>
    
    <!-- Personal Details -->
    <div class="grid md:grid-cols-2 gap-4">
      <SSNInput
        label={$_('clientInfo.personalInfo.ssn')}
        value={clientData?.ssn || ''}
        onValueChange={(val) => onUpdate('ssn', val)}
        required
      />
      <DateInput
        label={$_('clientInfo.personalInfo.dob')}
        value={clientData?.dob || ''}
        onValueChange={(val) => onUpdate('dob', val)}
        required
        allowFuture={false}
      />
    </div>
    
    <!-- Status -->
    <div class="grid md:grid-cols-2 gap-4">
      <ValidatedSelect
        label={$_('clientInfo.personalInfo.citizenship')}
        value={clientData?.citizenship || undefined}
        onValueChange={(value) => value && onUpdate('citizenship', value)}
        options={citizenshipOptions}
        placeholder={$_('common.select')}
        required
        showError={true}
      />
      <ValidatedSelect
        label={$_('clientInfo.personalInfo.maritalStatus')}
        value={clientData?.maritalStatus || undefined}
        onValueChange={(value) => value && onUpdate('maritalStatus', value)}
        options={maritalStatusOptions}
        placeholder={$_('common.select')}
        required
        showError={true}
      />
    </div>
    
    <!-- Military Service -->
    <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
      <div>
        <div class="font-medium">{$_('clientInfo.personalInfo.militaryService')}</div>
        <div class="text-sm text-muted-foreground">
          {$_('clientInfo.personalInfo.militaryServiceDescription')}
        </div>
      </div>
      <Switch
        checked={clientData?.hasMilitaryService || false}
        onCheckedChange={(checked) => onUpdate('hasMilitaryService', checked)}
      />
    </div>
  </CardContent>
</Card>



