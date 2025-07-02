import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Credits } from './Credits';

describe('Credits component', () => {
  it('renders current credit amount', () => {
    render(<Credits value={15} onCashOut={vi.fn()} />);
    expect(screen.getByText(/Credits:/)).toHaveTextContent('Credits: 15');
  });

  it('calls onCashOut when button is clicked', async () => {
    const mockCashOut = vi.fn();
    render(<Credits value={15} onCashOut={mockCashOut} />);
    await userEvent.click(screen.getByRole('button', { name: /cash out/i }));
    expect(mockCashOut).toHaveBeenCalled();
  });
});