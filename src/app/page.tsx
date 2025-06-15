'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: Date;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay();
  
  // Create array of empty cells for days before the first day of the month
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ChronoQuill AI v1.0 "Inkling"</h1>
      
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Previous Month
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => navigateMonth('next')}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Next Month
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4 mb-8">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first of the month */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="border rounded-lg p-4 bg-gray-50" />
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              isToday(day) ? 'bg-blue-50' : 'bg-white'
            } ${
              !isSameMonth(day, currentMonth) ? 'opacity-50' : ''
            }`}
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
              >
                Add Task
              </button>
            </div>
            <div className="space-y-2">
              {getTodosForDate(day).map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 w-4"
                  />
                  <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Add Task for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Enter task..."
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 text-center text-gray-500">
        ChronoQuill v1.0.0 "Inkling"
      </footer>
    </div>
  );
} 