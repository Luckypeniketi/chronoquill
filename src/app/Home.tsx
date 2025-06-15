"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Todo } from '../types/todo';
import { storage } from '../services/storage';

type ViewMode = 'month' | 'week';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Load todos from storage on mount
  useEffect(() => {
    const loadedTodos = storage.loadTodos();
    setTodos(loadedTodos);
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    storage.saveTodos(todos);
  }, [todos]);

  // Get days based on view mode
  const getDays = () => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    } else {
      const weekStart = startOfWeek(currentMonth);
      const weekEnd = endOfWeek(currentMonth);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  };

  const days = getDays();
  const firstDayOfPeriod = days[0].getDay();
  const emptyCells = Array.from({ length: firstDayOfPeriod }, (_, i) => i);

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        date: selectedDate
      }]);
      setNewTodo('');
      setIsModalOpen(false);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => 
      format(todo.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentMonth(direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
    } else {
      const amount = 7;
      setCurrentMonth(direction === 'next' ? addDays(currentMonth, amount) : addDays(currentMonth, -amount));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-test-id="app-title">ChronoQuill AI v1.0 "Inkling"</h1>
      
      {/* View Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200" role="radiogroup" aria-label="View mode">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-l-lg ${
              viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
            role="radio"
            aria-checked={viewMode === 'month'}
            data-test-id="month-view-button"
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-r-lg ${
              viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
            role="radio"
            aria-checked={viewMode === 'week'}
            data-test-id="week-view-button"
          >
            Week
          </button>
        </div>
      </div>

      {/* Period Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigatePeriod('prev')}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          data-test-id="prev-period-button"
        >
          Previous {viewMode === 'month' ? 'Month' : 'Week'}
        </button>
        <h2 className="text-xl font-semibold" data-test-id="period-title">
          {viewMode === 'month' 
            ? format(currentMonth, 'MMMM yyyy')
            : `${format(startOfWeek(currentMonth), 'MMM d')} - ${format(endOfWeek(currentMonth), 'MMM d, yyyy')}`
          }
        </h2>
        <button
          onClick={() => navigatePeriod('next')}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          data-test-id="next-period-button"
        >
          Next {viewMode === 'month' ? 'Month' : 'Week'}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4 mb-8" role="grid" aria-label="Calendar">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold py-2" role="columnheader">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first of the period */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="border rounded-lg p-4 bg-gray-50" role="gridcell" />
        ))}

        {/* Days of the period */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              isToday(day) ? 'bg-blue-50' : 'bg-white'
            } ${
              !isSameMonth(day, currentMonth) ? 'opacity-50' : ''
            }`}
            role="gridcell"
            aria-label={format(day, 'MMMM d, yyyy')}
            data-test-id={`day-cell-${format(day, 'yyyy-MM-dd')}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold ${isToday(day) ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </span>
              <button
                onClick={() => {
                  setSelectedDate(day);
                  setIsModalOpen(true);
                }}
                className="text-sm text-blue-500 hover:text-blue-700"
                data-test-id={`add-task-button-${format(day, 'yyyy-MM-dd')}`}
              >
                Add Task
              </button>
            </div>
            <div className="space-y-2">
              {getTodosForDate(day).map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  role="listitem"
                  data-test-id={`todo-item-${todo.id}`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 w-4"
                    aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                    data-test-id={`todo-checkbox-${todo.id}`}
                  />
                  <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    aria-label={`Delete task "${todo.text}"`}
                    data-test-id={`delete-todo-${todo.id}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4" id="modal-title">
              Add Task for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Enter task..."
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Enter task"
              data-test-id="new-todo-input"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                data-test-id="cancel-add-todo"
              >
                Cancel
              </button>
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                data-test-id="confirm-add-todo"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 text-center text-gray-500" data-test-id="app-version">
        ChronoQuill v1.0.0 "Inkling"
      </footer>
    </div>
  );
} 