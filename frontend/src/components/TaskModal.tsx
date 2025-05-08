import styled from 'styled-components';
import { Modal, Form, Input, Select, Button } from 'antd';
import { useEffect } from 'react';

const { Option } = Select;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background-color: var(--card-bg);
    color: var(--text-color);
  }

  .ant-modal-header {
    color: var(--text-color);
    background-color: var(--card-bg);
  }

  .ant-modal-title {
    color: var(--text-color);
    background-color: var(--card-bg);
  }

  .ant-btn {
    background-color: var(--card-bg);
    color: var(--text-color);
    border-color: var(--text-color);
  }

  .ant-modal-close {
    color: var(--text-color);
  }

  .ant-btn-primary {
    background-color: var(--primary-color);
    color: var(--bg-color);
    border-color: var(--primary-color);

    &:hover {
      background-color: var(--text-color);
      color: var(--card-bg);
    }
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    color: var(--text-color);
  }

  .ant-input,
  .ant-select-selector,
  .ant-input-textarea textarea {
    background-color: var(--card-bg);
    color: var(--text-color);
    border-color: var(--text-color);

    &:hover,
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(255, 107, 1, 0.2);
    }
  }

  .ant-input::placeholder,
  .ant-input-textarea::placeholder,
  .ant-select-selection-placeholder {
    color: var(--text-muted-color);
  }

  .ant-select-arrow {
    color: var(--text-color);
  }

  .ant-select-dropdown {
    border: 1px solid var(--text-color);
    background-color: var(--card-bg);
    color: var(--text-color);
    border-radius: 4px;
  }

  .ant-select-item {
    color: var(--text-color);
    background-color: var(--card-bg);

    &:hover {
      background-color: var(--primary-color);
      color: var(--bg-color);
    }
  }

  .ant-select-selector {
    background: none !important;
  }

  .ant-select-item-option-selected {
    background-color: var(--primary-color);
    color: var(--bg-color);
  }
`;

interface TaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { title: string; description: string; status: string }) => Promise<void>;
  initialValues?: { title?: string; description?: string; status?: string };
  title: string;
}

function TaskModal({ visible, onCancel, onOk, initialValues, title }: TaskModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues || { title: '', description: '', status: 'Нужно выполнить' });
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation or submission failed:', error);
    }
  };

  return (
    <StyledModal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {title === 'Создать новую задачу' ? 'Создать' : 'Сохранить'}
        </Button>,
      ]}
    >
      <StyledForm form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: 'Введите название задачи' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Введите описание задачи' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Статус"
          rules={[{ required: true, message: 'Выберите статус задачи' }]}
        >
          <Select>
            <Option value="Нужно выполнить">Нужно выполнить</Option>
            <Option value="В процессе">В процессе</Option>
            <Option value="Выполнено">Выполнено</Option>
          </Select>
        </Form.Item>
      </StyledForm>
    </StyledModal>
  );
}

export default TaskModal;