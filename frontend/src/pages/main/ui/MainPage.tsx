import { Layout, Spin, Checkbox } from 'antd';
import styled from 'styled-components';
import Sidebar from '../../../widgets/Sidebar/ui/Sidebar';
import Column from '../../../entities/columns/ui/Column';
import { useFetchTasks } from '../../../api/taskApi';
import { useTaskStore } from '../../../features/store/taskStore';
import { useThemeStore } from '../../../features/store/useThemeStore';
import { useEffect, useState } from 'react';
import { FaColumns, FaList, FaFilter } from 'react-icons/fa';

const { Content } = Layout;

const ContentBox = styled(Content)`
  padding: 20px;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  color: var(--text-color);
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 10px;
`;

const Columns = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 10px;
  flex-wrap: wrap;
`;

const SingleColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Buttons = styled.div`
  display: flex;
  gap: 5px;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: color 0.3s, background 0.3s;
  &:hover {
    color: var(--primary-color);
    background: var(--card-bg);
  }
  &[data-active='true'] {
    color: var(--primary-color);
    background: var(--card-bg);
  }
`;

const FilterMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--text-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 200px;
  animation: fadeIn 0.2s ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (max-width: 768px) {
    right: -10px;
    min-width: 180px;
  }
`;

const FilterCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: var(--text-color);
  font-size: 16px;
  letter-spacing: 0.5px;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
  &:hover {
    background: var(--bg-color);
  }
  .ant-checkbox-inner {
    border-color: var(--text-color);
    background: var(--bg-color);
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }
  .ant-checkbox-wrapper {
    width: 100%;
  }
  &:last-child {
    margin-bottom: 0;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .ant-spin-dot-item {
    background-color: var(--primary-color) !important;
  }
`;

type Mode = 'Онлайн' | 'Локально';
type Theme = 'light' | 'dark';
type ColumnType = 'todo' | 'inProgress' | 'done';
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  column?: string;
  isFavorite?: boolean;
}
interface ColumnsState {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
  [key: string]: Task[];
}

const MainPage = () => {
  const [mode, setMode] = useState<Mode>('Онлайн');
  const { posts, loading, error, updateTask } = useFetchTasks(mode);
  const { columns, setTasks, moveTask } = useTaskStore();
  const { setTheme } = useThemeStore();
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    const savedMode = localStorage.getItem('mode') as Mode | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme') as Theme || 'light';
    setTheme(theme);
  }, []);

  useEffect(() => {
    if (!loading && !error && posts?.data) {
      setTasks(posts.data);
    }
  }, [loading, error, posts]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const allTasks = [
    ...columns.todo.map((task) => ({ ...task, status: 'todo' })),
    ...columns.inProgress.map((task) => ({ ...task, status: 'inProgress' })),
    ...columns.done.map((task) => ({ ...task, status: 'done' })),
  ].map((task) => {
    return { ...task, isFavorite: favorites.includes(task.id) };
  });

  const filteredTasks = filterStatuses.length > 0
    ? allTasks.filter((task) => {
        const columnDisplay = task.status === 'todo' ? 'Нужно выполнить' : task.status === 'inProgress' ? 'В процессе' : 'Выполнено';
        return filterStatuses.includes(task.status) || filterStatuses.includes(columnDisplay);
      })
    : allTasks;

  const toggleColumn = () => {
    setIsSingleColumn(!isSingleColumn);
    setFilterStatuses([]);
    setShowFilter(false);
  };

  const toggleFavorite = (taskId: number) => {
    if (favorites.includes(taskId)) {
      setFavorites(favorites.filter((id) => id !== taskId));
    } else {
      setFavorites([...favorites, taskId]);
    }
  };

  const toggleFilter = (status: string) => {
    if (filterStatuses.includes(status)) {
      setFilterStatuses(filterStatuses.filter((s) => s !== status));
    } else {
      setFilterStatuses([...filterStatuses, status]);
    }
  };

  const toggleFilterMenu = () => {
    setShowFilter(!showFilter);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number, columnId: ColumnType | 'all') => {
    e.dataTransfer.setData('taskId', taskId.toString());
    if (columnId !== 'all') {
      e.dataTransfer.setData('fromColumn', columnId);
    } else {
      const task = allTasks.find((t) => t.id === taskId);
      if (task) {
        e.dataTransfer.setData('fromColumn', task.status);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, toColumn: ColumnType) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const fromColumn = e.dataTransfer.getData('fromColumn') as ColumnType;

    if (!fromColumn || !toColumn) return;

    const fromIndex = (columns as ColumnsState)[fromColumn].findIndex((t) => t.id === taskId);
    const toIndex = (columns as ColumnsState)[toColumn].length;

    if (fromIndex === -1) return;

    const movedTask = moveTask(fromColumn, toColumn, fromIndex, toIndex);
    if (movedTask) {
      await updateTask(movedTask.id, {
        title: movedTask.title,
        description: movedTask.description,
        status: movedTask.status,
      });
    }
  };

  if (loading) {
    return (
      <Loading>
        <Spin size="large" />
      </Loading>
    );
  }

  if (error) {
    return (
      <div>
        Ошибка: {error}
        {mode === 'Локально' && 'Ошибка локального сервера.'}
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar onModeChange={setMode} />
      <Layout>
        <ContentBox>
          <Header>
            <h1 style={{ margin: 0 }}>Мои задачи</h1>
            <Buttons>
              {isSingleColumn && (
                <div style={{ position: 'relative' }}>
                  <Button onClick={toggleFilterMenu} data-active={showFilter}>
                    <FaFilter />
                  </Button>
                  {showFilter && (
                    <FilterMenu>
                      <FilterCheckbox
                        checked={filterStatuses.length === 0}
                        onChange={() => setFilterStatuses([])}
                      >
                        Все
                      </FilterCheckbox>
                      <FilterCheckbox
                        checked={filterStatuses.includes('Нужно выполнить')}
                        onChange={() => toggleFilter('Нужно выполнить')}
                      >
                        Нужно выполнить
                      </FilterCheckbox>
                      <FilterCheckbox
                        checked={filterStatuses.includes('В процессе')}
                        onChange={() => toggleFilter('В процессе')}
                      >
                        В процессе
                      </FilterCheckbox>
                      <FilterCheckbox
                        checked={filterStatuses.includes('Выполнено')}
                        onChange={() => toggleFilter('Выполнено')}
                      >
                        Выполнено
                      </FilterCheckbox>
                    </FilterMenu>
                  )}
                </div>
              )}
              <Button onClick={toggleColumn}>
                {isSingleColumn ? <FaColumns /> : <FaList />}
              </Button>
            </Buttons>
          </Header>
          {isSingleColumn ? (
            <SingleColumn>
              <Column
                nameColumn="Все задачи"
                tasks={filteredTasks}
                columnId="all"
                toggleFavorite={toggleFavorite}
                mode={mode}
                onDragStart={(e, taskId) => handleDragStart(e, taskId, 'all')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'all' as ColumnType)}
                moveTask={moveTask}
                updateTask={updateTask}
              />
            </SingleColumn>
          ) : (
            <Columns>
              <Column
                nameColumn="Нужно выполнить"
                tasks={columns.todo.map((task) => ({
                  ...task,
                  isFavorite: favorites.includes(task.id),
                }))}
                columnId="todo"
                toggleFavorite={toggleFavorite}
                mode={mode}
                onDragStart={(e, taskId) => handleDragStart(e, taskId, 'todo')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'todo')}
                moveTask={moveTask}
                updateTask={updateTask}
              />
              <Column
                nameColumn="В процессе"
                tasks={columns.inProgress.map((task) => ({
                  ...task,
                  isFavorite: favorites.includes(task.id),
                }))}
                columnId="inProgress"
                toggleFavorite={toggleFavorite}
                mode={mode}
                onDragStart={(e, taskId) => handleDragStart(e, taskId, 'inProgress')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'inProgress')}
                moveTask={moveTask}
                updateTask={updateTask}
              />
              <Column
                nameColumn="Выполнено"
                tasks={columns.done.map((task) => ({
                  ...task,
                  isFavorite: favorites.includes(task.id),
                }))}
                columnId="done"
                toggleFavorite={toggleFavorite}
                mode={mode}
                onDragStart={(e, taskId) => handleDragStart(e, taskId, 'done')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'done')}
                moveTask={moveTask}
                updateTask={updateTask}
              />
            </Columns>
          )}
        </ContentBox>
      </Layout>
    </Layout>
  );
};

export default MainPage;