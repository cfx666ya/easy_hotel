// export default App;
/**
 * 应用根组件
 */
import AppRoutes from './router/index.jsx';
import { ConfigProvider } from 'antd-mobile';

function App() {
  return (
    <ConfigProvider
      theme={{
        primaryColor: '#f5f7fa',
      }}
    >
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#fff',
        }}
      >
        <AppRoutes />
      </div>
    </ConfigProvider>
  );
}

export default App;
