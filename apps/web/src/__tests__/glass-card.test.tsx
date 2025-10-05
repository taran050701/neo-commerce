import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/shared/glass-card';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Neo Commerce</GlassCard>);
    expect(screen.getByText('Neo Commerce')).toBeInTheDocument();
  });
});
