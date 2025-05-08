import styled from 'styled-components';
import MyCard from '../../../components/Card';
import { FiClipboard, FiPlus } from 'react-icons/fi';
import { useTaskStore } from '../../../features/store/taskStore';
import { useFetchTasks } from '../../../api/taskApi';
import { useState } from 'react';
import TaskModal from '../../../components/TaskModal';

const ColumnBox = styled.div`
  border: 2px dashed var(--text-color);
  border-radius: 10px;
  padding: 15px;
  width: 300px;
  height: 80vh;
  margin-right: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--card-bg);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    width: 250px;
    margin-right: 10px;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--text-color);

  h2 {
    font-size: 16px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
  }

  button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    font-size: 16px;
  }
`;

const Card = styled.div<{ $isUpdating?: boolean }>`
  margin: 5px 0;
  cursor: move;
  opacity: ${props => (props.$isUpdating ? 0.5 : 1)};
  transition: opacity 0.3s;
`;

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  column?: string;
  isFavorite?: boolean;
}

interface ColumnProps {
  nameColumn: string;
  tasks: Task[];
  columnId: 'todo' | 'inProgress' | 'done' | 'all';
  toggleFavorite?: (taskId: number) => void;
  mode: 'Онлайн' | 'Локально';
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  moveTask: (from: 'todo' | 'inProgress' | 'done', to: 'todo' | 'inProgress' | 'done', fromIndex: number, toIndex: number) => Task | null;
  updateTask: (id: number, updatedTask: { title: string; description: string; status: string }) => Promise<void>;
}

function Column({ nameColumn, tasks, columnId, toggleFavorite, mode, onDragStart, onDragOver, onDrop, moveTask, updateTask }: ColumnProps) {
  const { columns, updateTaskStatus } = useTaskStore();
  const { updateTask: updateApiTask, deleteTask, createTask } = useFetchTasks(mode);
  const [showModal, setShowModal] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    onDragStart(e, task.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    onDragOver(e);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetTaskId: number | null) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const fromColumn = e.dataTransfer.getData('fromColumn') as 'todo' | 'inProgress' | 'done';

    if (!fromColumn) return;

    const fromIndex = columns[fromColumn].findIndex(task => task.id === taskId);
    if (fromIndex === -1 || !columns[fromColumn][fromIndex]) return;

    const currentTask = columns[fromColumn][fromIndex];
    const toColumn = columnId === 'all' 
      ? (targetTaskId && tasks.find(task => task.id === targetTaskId) ? tasks.find(task => task.id === targetTaskId)!.status : tasks[tasks.length - 1]?.status || 'todo') as 'todo' | 'inProgress' | 'done' 
      : columnId;

    let toIndex = targetTaskId ? columns[toColumn].findIndex(task => task.id === targetTaskId) : columns[toColumn].length;
    if (toIndex === -1) toIndex = columns[toColumn].length;

    if (fromColumn === toColumn && (!targetTaskId || columns[toColumn][toIndex]?.id === taskId)) return;

    onDrop(e);

    setUpdatingTaskId(taskId);
    try {
      if (columnId === 'all') {
        const newStatus = targetTaskId && tasks.find(task => task.id === targetTaskId) ? tasks.find(task => task.id === targetTaskId)!.status : tasks[tasks.length - 1]?.status || 'todo';
        if (newStatus && newStatus !== currentTask.status) {
          const taskToMove = { ...currentTask, status: newStatus };
          updateTaskStatus(taskId, newStatus);
          await updateTask(taskId, { title: taskToMove.title, description: taskToMove.description, status: newStatus });
        }
      } else if (toColumn !== fromColumn) {
        const movedTask = moveTask(fromColumn, toColumn, fromIndex, toIndex);
        if (movedTask && movedTask.id === taskId) {
          await updateTask(movedTask.id, {
            title: movedTask.title,
            description: movedTask.description,
            status: movedTask.status,
          });
        }
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSave = async (values: { title: string; description: string; status: string }) => {
    try {
      await createTask(values);
      closeModal();
    } catch {
      alert('Ошибка при создании задачи');
    }
  };

  return (
    <>
      <ColumnBox onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, null)}>
        <Header>
          <h2>
            <FiClipboard /> {nameColumn} ({tasks.length})
          </h2>
          <button onClick={openModal}>
            <FiPlus />
          </button>
        </Header>

        {tasks.map(task => (
          <Card
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task.id)}
            $isUpdating={updatingTaskId === task.id}
          >
            <MyCard
              id={task.id}
              title={task.title}
              text={task.description}
              status={task.column || task.status}
              onDelete={deleteTask}
              onUpdate={updateApiTask}
              isFavorite={task.isFavorite}
              toggleFavorite={toggleFavorite}
            />
          </Card>
        ))}
      </ColumnBox>

      <TaskModal
        visible={showModal}
        onCancel={closeModal}
        onOk={handleSave}
        title="Новая задача"
        initialValues={{ status: nameColumn }}
      />
    </>
  );
}

export default Column;