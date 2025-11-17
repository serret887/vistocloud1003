import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AssetsCard } from '@/components/application/AssetsCard';
import { useApplicationStore } from '@/stores/applicationStore';

describe('AssetsSummaryCard', () => {
  beforeEach(() => {
    useApplicationStore.setState({
      clients: { c1: { firstName: 'Felix', lastName: 'Brugo Gonzalez', email: '', phone: '', ssn: '', dob: '', citizenship: '', maritalStatus: '', hasMilitaryService: false, militaryNote: null } },
      assetsData: { c1: [] },
    } as any, true);
  });

  it('renders totals for a client', () => {
    const now = new Date().toISOString();
    const s = useApplicationStore.getState();
    s.addAsset('c1', { id: 'a1', clientId: 'c1', category: 'Gift', type: 'CashGift', amount: 10000, createdAt: now, updatedAt: now });

    render(<AssetsCard clientId="c1" />);

    expect(screen.getByText(/Assets for Felix Brugo Gonzalez/i)).toBeInTheDocument();
    expect(screen.getByText(/Gift/i)).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });
});




















