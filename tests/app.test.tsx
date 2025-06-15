import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../src/app/page';
import { format } from 'date-fns';

// Mock the 'use client' directive
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('ChronoQuill Core Functionality', () => {
  beforeEach(() => {
    render(<Home />);
  });

  test('renders calendar with current month', () => {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  test('navigates between months', () => {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const nextMonth = format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMMM yyyy');
    
    fireEvent.click(screen.getByText('Next Month'));
    expect(screen.getByText(nextMonth)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Previous Month'));
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  test('adds and completes a task', async () => {
    // Open add task modal
    const addTaskButtons = screen.getAllByText('Add Task');
    fireEvent.click(addTaskButtons[0]);

    // Add a task
    const input = screen.getByPlaceholderText('Enter task...');
    fireEvent.change(input, { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByText('Add Task'));

    // Verify task was added
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Complete the task
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('deletes a task', async () => {
    // Add a task first
    const addTaskButtons = screen.getAllByText('Add Task');
    fireEvent.click(addTaskButtons[0]);
    
    const input = screen.getByPlaceholderText('Enter task...');
    fireEvent.change(input, { target: { value: 'Task to Delete' } });
    fireEvent.click(screen.getByText('Add Task'));

    // Delete the task
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Verify task was deleted
    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
  });

  test('shows today\'s date highlighted', () => {
    const today = new Date();
    const todayElement = screen.getByText(today.getDate().toString());
    expect(todayElement).toHaveClass('text-blue-600');
  });
}); 