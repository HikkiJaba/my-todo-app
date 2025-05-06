import { Layout, Spin } from 'antd';
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
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 10px;
`;

const Columns = styled.div`
  display: flex;
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
  color: #333;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  &:hover {
    color: #1890ff;
  }
`;

const FilterMenu = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 5px 0;
`;

const FilterItem = styled.button`
  background: none;
  border: none;
  padding: 5px 10px;
  color: #333;
  cursor: pointer;
  width: 100%;
  text-align: left;
  &:hover {
    background: #f0f0f0;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  column?: string;
  isFavorite?: boolean;
}

const MainPage = () => {
  const { posts, loading, error } = useFetchTasks();
  const { columns, setTasks } = useTaskStore();
  const { setTheme } = useThemeStore();
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const theme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(theme);
  }, [setTheme]);

  useEffect(() => {
    if (!loading && !error && posts?.data) {
      setTasks(posts.data);
    }
  }, [loading, error, posts, setTasks]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const allTasks: Task[] = [
    ...columns.todo.map(task => ({ ...task, column: 'Нужно выполнить' })),
    ...columns.inProgress.map(task => ({ ...task, column: 'В процессе' })),
    ...columns.done.map(task => ({ ...task, column: 'Выполнено' })),
  ].map(task => ({ ...task, isFavorite: favorites.includes(task.id) }));

  const filteredTasks = filterStatus
    ? allTasks.filter(task => task.status === filterStatus || task.column === filterStatus)
    : allTasks;

  const toggleColumn = () => {
    setIsSingleColumn(!isSingleColumn);
    setFilterStatus(null);
  };

  const toggleFavorite = (taskId: number) => {
    setFavorites(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  if (loading) {
    return (
      <Loading>
        <Spin size="large" />
      </Loading>
    );
  }

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <ContentBox>
          <Header>
            <h1 style={{ margin: 0 }}>Мои задачи</h1>
            <Buttons>
              {isSingleColumn && (
                <div style={{ position: 'relative' }}>
                  <Button
                    onMouseEnter={() => setShowFilter(true)}
                    onMouseLeave={() => setShowFilter(false)}
                  >
                    <FaFilter />
                  </Button>
                  {showFilter && (
                    <FilterMenu>
                      <FilterItem onClick={() => setFilterStatus(null)}>Все</FilterItem>
                      <FilterItem onClick={() => setFilterStatus('Нужно выполнить')}>
                        Нужно выполнить
                      </FilterItem>
                      <FilterItem onClick={() => setFilterStatus('В процессе')}>
                        В процессе
                      </FilterItem>
                      <FilterItem onClick={() => setFilterStatus('Выполнено')}>
                        Выполнено
                      </FilterItem>
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
              />
            </SingleColumn>
          ) : (
            <Columns>
              <Column
                nameColumn="Нужно выполнить"
                tasks={columns.todo.map(task => ({ ...task, isFavorite: favorites.includes(task.id) }))}
                columnId="todo"
                toggleFavorite={toggleFavorite}
              />
              <Column
                nameColumn="В процессе"
                tasks={columns.inProgress.map(task => ({ ...task, isFavorite: favorites.includes(task.id) }))}
                columnId="inProgress"
                toggleFavorite={toggleFavorite}
              />
              <Column
                nameColumn="Выполнено"
                tasks={columns.done.map(task => ({ ...task, isFavorite: favorites.includes(task.id) }))}
                columnId="done"
                toggleFavorite={toggleFavorite}
              />
            </Columns>
          )}
        </ContentBox>
      </Layout>
    </Layout>
  );
};

export default MainPage;