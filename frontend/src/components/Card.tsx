import { Card } from 'antd';
import styled from 'styled-components';
import { EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useState } from 'react';
import TaskModal from './TaskModal';

const StyledCard = styled(Card)`
  width: 100%;
  background-color: var(--card-bg);
  color: var(--text-color);
  border-color: var(--accent-color);

  .ant-card-head {
    background-color: var(--primary-color);
    color: var(--bg-color);
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  .ant-card-head-title {
    color: var(--bg-color) !important;
    flex-grow: 1;
    display: flex;
    align-items: center;
    padding: 0;
  }

  .ant-card-body {
    color: var(--text-color);
  }

  .card-icons {
    display: flex;
    gap: 12px;
    align-items: center;

    .anticon {
      font-size: 16px;
      color: var(--bg-color);
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: var(--text-color);
      }
    }
  }
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

type CardProps = {
  id: number;
  title: string;
  text: string;
  status: string;
  onDelete?: (id: number) => void;
  onUpdate: (id: number, updatedTask: { title: string; description: string; status: string }) => Promise<void>;
  isFavorite?: boolean;
  toggleFavorite?: (taskId: number) => void;
};

function MyCard({ id, title, text, status, onDelete, onUpdate, isFavorite, toggleFavorite }: CardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values: { title: string; description: string; status: string }) => {
    await onUpdate(id, values);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else {
      console.error('onDelete не работает');
    }
  };

  const handleToggleFavorite = () => {
    if (toggleFavorite) {
      toggleFavorite(id);
    }
  };

  return (
    <>
      <StyledCard
        title={
          <TitleContainer>
            <span>{title}</span>
            <div className="card-icons">
              {isFavorite ? (
                <StarFilled onClick={handleToggleFavorite} />
              ) : (
                <StarOutlined onClick={handleToggleFavorite} />
              )}
              <EditOutlined onClick={showModal} />
              <DeleteOutlined onClick={handleDelete} />
            </div>
          </TitleContainer>
        }
      >
        <p>{text}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Статус: {status}</p>
      </StyledCard>

      <TaskModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        title="Редактировать задачу"
        initialValues={{ title, description: text, status }}
      />
    </>
  );
}

export default MyCard;