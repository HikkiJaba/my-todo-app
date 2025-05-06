import styled from 'styled-components';
import MyCard from '../../../components/Card';
import { FiClipboard, FiPlus } from 'react-icons/fi';
import { useTaskStore } from '../../../features/store/taskStore';
import { useFetchTasks } from '../../../api/taskApi';
import { useState } from 'react';
import TaskModal from '../../../components/TaskModal';

const ColumnBox = styled.div`
  border: 2px dashed #333;
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
    background: #f5f5f5;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
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
  border-bottom: 1px solid #333;

  h2 {
    font-size: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
  }

  button {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    font-size: 16px;
  }
`;

const Card = styled.div`
  margin: 5px 0;
  cursor: move;
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
}

function Column({ nameColumn, tasks, columnId, toggleFavorite }: ColumnProps) {
  const { moveTask, updateTaskStatus } = useTaskStore();
  const { updateTask, deleteTask, createTask } = useFetchTasks();
  const [showModal, setShowModal] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id, fromColumn: columnId }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetTaskId: number | null) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const { taskId, fromColumn } = JSON.parse(data);
    const toColumn = columnId;

    const fromIndex = tasks.findIndex(task => task.id === taskId);
    const toIndex = targetTaskId ? tasks.findIndex(task => task.id === targetTaskId) : tasks.length;

    if (fromIndex === -1) return;

    const task = tasks[fromIndex];

    if (toColumn === 'all' || fromColumn === 'all') {
      const newStatus = toIndex < tasks.length ? tasks[toIndex].status : tasks[tasks.length - 1].status;
      updateTaskStatus(taskId, newStatus);
    } else {
      moveTask(fromColumn, toColumn, fromIndex, toIndex);
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
          >
            <MyCard
              id={task.id}
              title={task.title}
              text={task.description}
              status={task.column || task.status}
              onDelete={deleteTask}
              onUpdate={updateTask}
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