import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlotMachine } from './SlotMachine';
import * as api from '../../api/casinoApi';

vi.mock('../../api/casinoApi');

describe('SlotMachine component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<SlotMachine credits={10} setCredits={vi.fn()} sessionClosed={false} />);

    expect(screen.getAllByText('-')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /spin/i })).toBeInTheDocument();
  });

  it('displays out-of-credits message when credits are 0', () => {
    render(<SlotMachine credits={0} setCredits={vi.fn()} sessionClosed={false} />);

    expect(screen.getByText(/you're out of credits/i)).toBeInTheDocument();
  });

  it('disables button when spinning or no credits', async () => {
    render(<SlotMachine credits={0} setCredits={vi.fn()} sessionClosed={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays session closed message when sessionClosed=true', () => {
    render(<SlotMachine credits={5} setCredits={vi.fn()} sessionClosed={true} />);

    expect(
      screen.getByText(/funds withdrawn\. please refresh the page/i)
    ).toBeInTheDocument();
  });

  it('calls roll API and updates UI correctly', async () => {
    const fakeResult = ['C', 'C', 'C'];
    const mockRoll = vi.spyOn(api, 'roll').mockResolvedValue({ result: fakeResult, credits: 8 });
    const setCredits = vi.fn();

    render(<SlotMachine credits={10} setCredits={setCredits} sessionClosed={false} />);

    const btn = screen.getByRole('button', { name: /spin/i });
    await userEvent.click(btn);

    expect(mockRoll).toHaveBeenCalled();

    await waitFor(() => expect(setCredits).toHaveBeenCalledWith(8), { timeout: 3500 });

    // Final state check
    await waitFor(() => {
      const cSlots = screen.getAllByText('C');
      expect(cSlots).toHaveLength(3);
    });
  });

  it('shows error message when API call fails', async () => {
    const mockRoll = vi.spyOn(api, 'roll').mockRejectedValue({ response: { data: { error: 'Session not found' } } });

    render(<SlotMachine credits={10} setCredits={vi.fn()} sessionClosed={false} />);
    const btn = screen.getByRole('button', { name: /spin/i });
    await userEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/session not found/i)).toBeInTheDocument();
    });
  });
});