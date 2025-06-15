import { Todo } from '../types/todo';

const STORAGE_KEY = 'chronoquill_todos';

export const storage = {
  saveTodos: (todos: Todo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  },

  loadTodos: (): Todo[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const todos = JSON.parse(stored);
        // Convert string dates back to Date objects
        return todos.map((todo: any) => ({
          ...todo,
          date: new Date(todo.date)
        }));
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
    return [];
  }
}; 