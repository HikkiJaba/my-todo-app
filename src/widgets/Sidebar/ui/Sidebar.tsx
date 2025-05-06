import { Layout, Menu, Radio } from 'antd';
import type { MenuProps } from 'antd';
import styled from 'styled-components';
import { SunFilled, MoonFilled } from '@ant-design/icons';
import { useThemeStore } from '../../../features/store/useThemeStore';

const { Sider } = Layout;

const items: MenuProps['items'] = ['Онлайн'].map((key) => ({
  key,
  label: `${key}`,
}));

const SiderStyled = styled(Sider)`
  background-color: var(--sidebar-bg) !important;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const SiderContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
`;

const SiderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 16px;
`;

const SiderTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
`;

const SiderMenuStyled = styled(Menu)`
  background-color: var(--sidebar-bg) !important;
  color: var(--text-color) !important;
  border: none;
  flex-grow: 1;

  .ant-menu-item {
    color: var(--text-color) !important;
  }

  .ant-menu-item-selected {
    background-color: var(--primary-color) !important;
    color: #fff !important;
  }
`;

const SiderBottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #4442;
`;

const ThemeSwitcher = styled(Radio.Group)`
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--primary-color);

  .ant-radio-button-wrapper {
    background-color: var(--sidebar-bg);
    color: var(--text-color);
    border: none;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: var(--primary-color);
      color: white;
    }

    &:not(:last-child) {
      border-right: 1px solid var(--primary-color);
    }
  }

  .ant-radio-button-wrapper-checked {
    background-color: var(--primary-color) !important;
    color: white !important;
    border: none !important;
  }

  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
    display: none; /* Убираем стандартный индикатор Ant Design */
  }
`;

function Sidebar() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <SiderStyled width={250}>
      <SiderContainer>
        <SiderHeader>
          <SiderTitle>To-do листы</SiderTitle>
        </SiderHeader>

        <SiderMenuStyled
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
          theme="light"
        />

        <SiderBottom>
          <ThemeSwitcher value={theme} onChange={(e) => setTheme(e.target.value)}>
            <Radio.Button value="light">
              <SunFilled />
            </Radio.Button>
            <Radio.Button value="dark">
              <MoonFilled />
            </Radio.Button>
          </ThemeSwitcher>
        </SiderBottom>
      </SiderContainer>
    </SiderStyled>
  );
}

export default Sidebar;