<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Label, Switch, Input } from '$lib/components/ui';
  import { ValidatedSelect, DateInput, PhoneInput } from '$lib/components/ui/validated-input';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Trash2 } from 'lucide-svelte';
  import type { EmploymentRecord } from '$lib/types/employment';
  import type { AddressType } from '$lib/types/address';
  
  interface Props {
    record: EmploymentRecord;
    index: number;
    onUpdate: (field: string, value: string | boolean | number | AddressType) => void;
    onRemove: () => void;
    hasFieldError: (field: string) => boolean;
    getFieldError: (field: string) => string | null;
  }
  
  let { record, index, onUpdate, onRemove, hasFieldError, getFieldError }: Props = $props();
  
  const incomeTypes = [
    { value: 'salary', label: 'Salary' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'commission', label: 'Commission' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' }
  ];
</script>

<Card>
  <CardHeader class="flex flex-row items-start justify-between space-y-0">
    <div>
      <CardTitle class="text-lg">
        {record.employerName || `Employer ${index + 1}`}
      </CardTitle>
      <CardDescription>
        {record.jobTitle || 'No position specified'}
        {#if record.currentlyEmployed}
          <span class="text-success"> • Current</span>
        {/if}
      </CardDescription>
    </div>
    <Button variant="ghost" size="icon" onclick={onRemove}>
      <Trash2 class="h-4 w-4 text-destructive" />
    </Button>
  </CardHeader>
  <CardContent class="space-y-6">
    <!-- Employer Info -->
    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Employer Name</Label>
        <Input
          value={record.employerName}
          oninput={(e) => onUpdate('employerName', e.currentTarget.value)}
          placeholder="Company Name"
          class={hasFieldError(`employment.${index}.employerName`) ? 'border-destructive' : ''}
        />
      </div>
      <PhoneInput
        label="Employer Phone"
        value={record.phoneNumber || ''}
        onValueChange={(val) => onUpdate('phoneNumber', val)}
        required
      />
    </div>
    
    <!-- Employer Address -->
    <div class="space-y-2">          
      <Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Employer Address</Label>
      <div class={hasFieldError(`employment.${index}.employerAddress`) ? 'border border-destructive rounded-md p-1' : ''}>
        <AddressAutocomplete
          value={record.employerAddress}
          placeholder="Start typing employer address..."
          onchange={(addr) => onUpdate('employerAddress', addr)}
        />
      </div>
      {#if record.employerAddress?.formattedAddress}
        <p class="text-sm text-muted-foreground">{record.employerAddress.formattedAddress}</p>
      {/if}
    </div>
    
    <!-- Job Info -->
    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Job Title / Position</Label>
        <Input
          value={record.jobTitle}
          oninput={(e) => onUpdate('jobTitle', e.currentTarget.value)}
          placeholder="Software Engineer"
          class={hasFieldError(`employment.${index}.jobTitle`) ? 'border-destructive' : ''}
        />
      </div>
      <ValidatedSelect
        label="Income Type"
        value={record.incomeType || undefined}
        onValueChange={(value) => value && onUpdate('incomeType', value)}
        options={incomeTypes}
        required
        placeholder="Select type..."
        showError={true}
        error={hasFieldError(`employment.${index}.incomeType`) ? getFieldError(`employment.${index}.incomeType`) || undefined : undefined}
      />
    </div>
    
    <!-- Dates -->
    <div class="grid md:grid-cols-2 gap-4">
      <DateInput
        label="Start Date"
        value={record.startDate || ''}
        onValueChange={(val) => onUpdate('startDate', val)}
        required
        allowFuture={false}
      />
      {#if !record.currentlyEmployed && !record.hasOfferLetter}
        <DateInput
          label="End Date"
          value={record.endDate || ''}
          onValueChange={(val) => onUpdate('endDate', val)}
          required
          allowFuture={false}
        />
      {/if}
    </div>
    
    <!-- Employment Toggles -->
    <div class="grid md:grid-cols-2 gap-4">
      {#if !record.hasOfferLetter}
        <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <Label>Currently Employed Here</Label>
            <p class="text-xs text-muted-foreground">Is this your current job?</p>
          </div>
          <Switch checked={record.currentlyEmployed} onCheckedChange={(c) => onUpdate('currentlyEmployed', c)} />
        </div>
      {/if}
      <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div>
          <Label>Self Employed</Label>
          <p class="text-xs text-muted-foreground">Own business or independent contractor</p>
        </div>
        <Switch checked={record.selfEmployed} onCheckedChange={(c) => onUpdate('selfEmployed', c)} />
      </div>
    </div>
    
    <div class="grid md:grid-cols-2 gap-4">
      {#if record.selfEmployed}
        <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <Label>25% or More Ownership</Label>
            <p class="text-xs text-muted-foreground">Own 25%+ of the business</p>
          </div>
          <Switch checked={record.ownershipPercentage} onCheckedChange={(c) => onUpdate('ownershipPercentage', c)} />
        </div>
      {/if}
      <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div>
          <Label>Related Party</Label>
          <p class="text-xs text-muted-foreground">Employed by family member</p>
        </div>
        <Switch checked={record.relatedParty} onCheckedChange={(c) => onUpdate('relatedParty', c)} />
      </div>
    </div>
    
    {#if !record.currentlyEmployed}
      <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div>
          <Label>Has Offer Letter</Label>
          <p class="text-xs text-muted-foreground">For future employment starting within 90 days</p>
        </div>
        <Switch checked={record.hasOfferLetter} onCheckedChange={(c) => onUpdate('hasOfferLetter', c)} />
      </div>
    {/if}
  </CardContent>
</Card>


