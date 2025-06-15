import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format, addMonths } from 'date-fns';
import Home from '../../src/app/Home';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  key: jest.fn(),
  length: 0
} as unknown as Storage & { getItem: jest.Mock; setItem: jest.Mock; clear: jest.Mock; };

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Get current Eastern Time date
const getCurrentEasternDate = () => {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate());
};

// Mock Date with current Eastern Time
const mockDate = getCurrentEasternDate();
jest.useFakeTimers();
jest.setSystemTime(mockDate);

describe('ChronoQuill AI Features', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the AI-powered calendar interface', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /ChronoQuill AI v1.0 "Inkling"/i })).toBeInTheDocument();
    const currentMonth = format(mockDate, 'MMMM yyyy');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(currentMonth);
  });

  it('provides AI-enhanced task management', async () => {
    render(<Home />);

    // Ensure calendar is showing the correct month/year
    const targetMonth = format(mockDate, 'MMMM yyyy');
    let currentMonth = screen.getByRole('heading', { level: 2 }).textContent;
    let attempts = 0;
    while (currentMonth !== targetMonth && attempts < 12) {
      const currentDate = new Date(currentMonth + ' 01');
      const targetDate = new Date(targetMonth + ' 01');
      if (currentDate < targetDate) {
        fireEvent.click(screen.getByRole('button', { name: /next month/i }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
      }
      // Wait for UI update
      await screen.findByRole('heading', { level: 2 });
      currentMonth = screen.getByRole('heading', { level: 2 }).textContent;
      attempts++;
    }
    // Debug: log the current month after navigation
    // eslint-disable-next-line no-console
    console.log('DEBUG: Calendar month after navigation:', currentMonth);

    // Add a task
    let todayId = `add-task-button-${format(mockDate, 'yyyy-MM-dd')}`;
    let addTaskButton: HTMLElement | null = null;
    try {
      addTaskButton = screen.getByTestId(todayId);
    } catch (e) {
      // Debug: list all available add-task-button data-test-ids
      const allButtons = Array.from(document.querySelectorAll('[data-test-id^="add-task-button-"]'));
      // eslint-disable-next-line no-console
      console.log('DEBUG: Available add-task-button IDs:', allButtons.map(btn => btn.getAttribute('data-test-id')));
      // Fallback to the 1st of the month if today is not in the calendar
      const fallbackDate = new Date(mockDate.getFullYear(), mockDate.getMonth(), 1);
      todayId = `add-task-button-${format(fallbackDate, 'yyyy-MM-dd')}`;
      addTaskButton = screen.getByTestId(todayId);
    }
    fireEvent.click(addTaskButton);
    
    const input = await screen.findByRole('textbox', { name: /enter task/i });
    fireEvent.change(input, { target: { value: 'AI Task' } });
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    
    // Verify task was added
    const taskElement = await screen.findByText('AI Task');
    expect(taskElement).toBeInTheDocument();
    
    // Complete the task
    const checkbox = screen.getByRole('checkbox', { name: /mark "ai task" as/i });
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    // Delete the task
    const deleteButton = screen.getByRole('button', { name: /delete task "ai task"/i });
    fireEvent.click(deleteButton);
    expect(screen.queryByText('AI Task')).not.toBeInTheDocument();
  });

  it('offers intelligent calendar navigation', () => {
    render(<Home />);
    
    // Test month navigation
    const nextMonth = format(addMonths(mockDate, 1), 'MMMM yyyy');
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(nextMonth);
    
    // Test view mode toggle
    fireEvent.click(screen.getByRole('radio', { name: /week/i }));
    expect(screen.getByRole('radio', { name: /week/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('highlights today\'s date intelligently', () => {
    render(<Home />);
    const todayCell = screen.getByRole('gridcell', { name: new RegExp(format(mockDate, 'MMMM d, yyyy'), 'i') });
    expect(todayCell).toHaveClass('bg-blue-50');
  });
}); 