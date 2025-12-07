<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Switch, Label } from '$lib/components/ui';
  import { SSNInput, DateInput, ValidatedSelect, NameInput, EmailInput, PhoneInput } from '$lib/components/ui/validated-input';
  import type { ClientData } from '$lib/types/client-data';
  
  interface Props {
    clientData: ClientData | undefined;
    onUpdate: (field: string, value: string | boolean) => void;
  }
  
  let { clientData, onUpdate }: Props = $props();
  
  const citizenshipOptions = [
    { value: 'US Citizen', label: 'US Citizen' },
    { value: 'Permanent Resident Alien', label: 'Permanent Resident Alien' },
    { value: 'Non-Permanent Resident Alien', label: 'Non-Permanent Resident Alien' }
  ];
  
  const maritalStatusOptions = [
    { value: 'Married', label: 'Married' },
    { value: 'Unmarried', label: 'Unmarried' },
    { value: 'Separated', label: 'Separated' }
  ];
</script>

<Card>
  <CardHeader>
    <CardTitle>Personal Information</CardTitle>
    <CardDescription>Basic identifying information for the borrower</CardDescription>
  </CardHeader>
  <CardContent class="space-y-6">
    <!-- Name -->
    <div class="grid md:grid-cols-2 gap-4">
      <NameInput
        label="First Name"
        value={clientData?.firstName || ''}
        onValueChange={(val) => onUpdate('firstName', val)}
        placeholder="John"
        required
        allowSpaces={true}
      />
      <NameInput
        label="Last Name"
        value={clientData?.lastName || ''}
        onValueChange={(val) => onUpdate('lastName', val)}
        placeholder="Doe"
        required
        allowSpaces={true}
      />
    </div>
    
    <!-- Contact -->
    <div class="grid md:grid-cols-2 gap-4">
      <EmailInput
        label="Email Address"
        value={clientData?.email || ''}
        onValueChange={(val) => onUpdate('email', val)}
        placeholder="john.doe@example.com"
        required
      />
      <PhoneInput
        label="Phone Number"
        value={clientData?.phone || ''}
        onValueChange={(val) => onUpdate('phone', val)}
        required
      />
    </div>
    
    <!-- Personal Details -->
    <div class="grid md:grid-cols-2 gap-4">
      <SSNInput
        label="Social Security Number"
        value={clientData?.ssn || ''}
        onValueChange={(val) => onUpdate('ssn', val)}
        required
      />
      <DateInput
        label="Date of Birth"
        value={clientData?.dob || ''}
        onValueChange={(val) => onUpdate('dob', val)}
        required
        allowFuture={false}
      />
    </div>
    
    <!-- Status -->
    <div class="grid md:grid-cols-2 gap-4">
      <ValidatedSelect
        label="Citizenship Status"
        value={clientData?.citizenship || undefined}
        onValueChange={(value) => value && onUpdate('citizenship', value)}
        options={citizenshipOptions}
        placeholder="Select status..."
        required
        showError={true}
      />
      <ValidatedSelect
        label="Marital Status"
        value={clientData?.maritalStatus || undefined}
        onValueChange={(value) => value && onUpdate('maritalStatus', value)}
        options={maritalStatusOptions}
        placeholder="Select status..."
        required
        showError={true}
      />
    </div>
    
    <!-- Military Service -->
    <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
      <div>
        <div class="font-medium">Military Service</div>
        <div class="text-sm text-muted-foreground">
          Have you served in the U.S. Armed Forces?
        </div>
      </div>
      <Switch
        checked={clientData?.hasMilitaryService || false}
        onCheckedChange={(checked) => onUpdate('hasMilitaryService', checked)}
      />
    </div>
  </CardContent>
</Card>



