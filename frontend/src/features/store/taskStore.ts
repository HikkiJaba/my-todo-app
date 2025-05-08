import { create } from 'zustand';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
}

interface TaskStore {
  columns: {
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  };
  setTasks: (tasks: Task[]) => void;
  moveTask: (from: 'todo' | 'inProgress' | 'done', to: 'todo' | 'inProgress' | 'done', fromIndex: number, toIndex: number) => Task | null;
  updateTaskStatus: (taskId: number, newStatus: string) => void;
  removeTask: (id: number) => void;
  updateStoreTask: (id: number, updatedTask: { title: string; description: string; status: string }) => void;
  addTask: (task: Task) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  columns: {
    todo: [],
    inProgress: [],
    done: [],
  },
  setTasks: (tasks) =>
    set(() => {
      const newColumns = {
        todo: tasks.filter((task) => task.status === 'Нужно выполнить'),
        inProgress: tasks.filter((task) => task.status === 'В процессе'),
        done: tasks.filter((task) => task.status === 'Выполнено'),
      };
      return { columns: newColumns };
    }),
  moveTask: (from, to, fromIndex, toIndex) => {
    let movedTask: Task | null = null;
    set((state) => {
      const currentColumns = { ...state.columns };
      const task = currentColumns[from][fromIndex];
      if (!task) return state;

      const newFromColumn = [...currentColumns[from]];
      newFromColumn.splice(fromIndex, 1);

      const newTask = { ...task, status: to === 'todo' ? 'Нужно выполнить' : to === 'inProgress' ? 'В процессе' : 'Выполнено' };
      movedTask = newTask;

      const newToColumn = [...currentColumns[to]];
      const adjustedToIndex = Math.min(toIndex, newToColumn.length);
      newToColumn.splice(adjustedToIndex, 0, newTask);

      return {
        columns: {
          ...currentColumns,
          [from]: newFromColumn,
          [to]: newToColumn,
        },
      };
    });
    return movedTask;
  },
  updateTaskStatus: (taskId, newStatus) =>
    set((state) => {
      const newColumns = { ...state.columns };
      let taskToMove: Task | undefined;

      for (const column in newColumns) {
        const taskIndex = newColumns[column as keyof typeof newColumns].findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          taskToMove = newColumns[column as keyof typeof newColumns][taskIndex];
          newColumns[column as keyof typeof newColumns] = newColumns[column as keyof typeof newColumns].filter(
            (task) => task.id !== taskId
          );
          break;
        }
      }

      if (!taskToMove) return state;

      taskToMove.status = newStatus;
      const targetColumn =
        newStatus === 'Нужно выполнить' ? 'todo' : newStatus === 'В процессе' ? 'inProgress' : 'done';
      newColumns[targetColumn] = [...newColumns[targetColumn], taskToMove];

      return { columns: newColumns };
    }),
  removeTask: (id) =>
    set((state) => {
      const newColumns = { ...state.columns };
      for (const column in newColumns) {
        newColumns[column as keyof typeof newColumns] = newColumns[column as keyof typeof newColumns].filter(
          (task) => task.id !== id
        );
      }
      return { columns: newColumns };
    }),
  updateStoreTask: (id, updatedTask) =>
    set((state) => {
      const newColumns = { ...state.columns };
      for (const column in newColumns) {
        const taskIndex = newColumns[column as keyof typeof newColumns].findIndex((task) => task.id === id);
        if (taskIndex !== -1) {
          const oldStatus = newColumns[column as keyof typeof newColumns][taskIndex].status;
          if (oldStatus !== updatedTask.status) {
            newColumns[column as keyof typeof newColumns] = newColumns[column as keyof typeof newColumns].filter(
              (task) => task.id !== id
            );
            const targetColumn =
              updatedTask.status === 'Нужно выполнить'
                ? 'todo'
                : updatedTask.status === 'В процессе'
                ? 'inProgress'
                : 'done';
            newColumns[targetColumn] = [...newColumns[targetColumn], { id, ...updatedTask }];
          } else {
            newColumns[column as keyof typeof newColumns][taskIndex] = { id, ...updatedTask };
          }
          break;
        }
      }
      return { columns: newColumns };
    }),
  addTask: (task) =>
    set((state) => {
      const targetColumn =
        task.status === 'Нужно выполнить' ? 'todo' : task.status === 'В процессе' ? 'inProgress' : 'done';
      return {
        columns: {
          ...state.columns,
          [targetColumn]: [...state.columns[targetColumn], task],
        },
      };
    }),
}));