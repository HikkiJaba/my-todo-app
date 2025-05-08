import { useEffect, useState } from 'react';
import { Task, useTaskStore } from '../features/store/taskStore';

interface Meta {
  pagination?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

interface RawTask {
  id: number;
  attributes: {
    title: string;
    description: string;
    status: string;
  };
}

interface FetchTasksResponse {
  data: Task[];
  meta: Meta;
}

interface FetchTasksResult {
  posts: FetchTasksResponse;
  loading: boolean;
  error: string | null;
  deleteTask: (id: number) => Promise<void>;
  updateTask: (id: number, updatedTask: { title: string; description: string; status: string }) => Promise<void>;
  createTask: (newTask: { title: string; description: string; status: string }) => Promise<void>;
}

export const useFetchTasks = (mode: 'Онлайн' | 'Локально'): FetchTasksResult => {
  const [posts, setPosts] = useState<FetchTasksResponse>({ data: [], meta: {} });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { setTasks, removeTask, updateStoreTask, addTask } = useTaskStore();
  const baseUrl = mode === 'Онлайн' ? 'https://cms.laurence.host/api' : 'http://localhost:3001';

  useEffect(() => {
    fetch(`${baseUrl}/tasks`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при загрузке задач');
        return res.json();
      })
      .then((data: { data: RawTask[]; meta: Meta }) => {
        const tasks = data.data.map(task => ({
          id: task.id,
          title: task.attributes.title,
          description: task.attributes.description,
          status: task.attributes.status === 'notActive' ? 'Нужно выполнить' :
                  task.attributes.status === 'pending' ? 'В процессе' : 'Выполнено'
        }));
        setPosts({ data: tasks, meta: data.meta });
        setTasks(tasks);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка при загрузке задач');
        setLoading(false);
      });
  }, [mode, setTasks]);

  const deleteTask = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPosts(prev => ({
        ...prev,
        data: prev.data.filter(task => task.id !== id),
        meta: { ...prev.meta, pagination: { ...prev.meta.pagination, total: prev.meta.pagination?.total! - 1 } }
      }));
      removeTask(id);
    } catch {
      setError('Не удалось удалить задачу');
    }
    setLoading(false);
  };

  const updateTask = async (id: number, updatedTask: { title: string; description: string; status: string }) => {
    try {
      const apiStatus = updatedTask.status === 'Нужно выполнить' ? 'notActive' :
                        updatedTask.status === 'В процессе' ? 'pending' : 'completed';
      const res = await fetch(`${baseUrl}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { title: updatedTask.title, description: updatedTask.description, status: apiStatus } })
      });
      if (!res.ok) throw new Error();
      setPosts(prev => ({
        ...prev,
        data: prev.data.map(task => task.id === id ? { ...task, ...updatedTask } : task)
      }));
      updateStoreTask(id, updatedTask);
    } catch {
      setError('Не удалось обновить задачу');
    }
  };

  const createTask = async (newTask: { title: string; description: string; status: string }) => {
    setLoading(true);
    try {
      const apiStatus = newTask.status === 'Нужно выполнить' ? 'notActive' :
                        newTask.status === 'В процессе' ? 'pending' : 'completed';
      const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { title: newTask.title, description: newTask.description, status: apiStatus } })
      });
      if (!res.ok) throw new Error();
      const responseData = await res.json();
      const createdTask: Task = {
        id: responseData.data.id,
        title: responseData.data.attributes.title,
        description: responseData.data.attributes.description,
        status: newTask.status
      };
      setPosts(prev => ({
        ...prev,
        data: [...prev.data, createdTask],
        meta: { ...prev.meta, pagination: { ...prev.meta.pagination, total: prev.meta.pagination?.total! + 1 } }
      }));
      addTask(createdTask);
    } catch {
      setError('Не удалось создать задачу');
    }
    setLoading(false);
  };

  return { posts, loading, error, deleteTask, updateTask, createTask };
};