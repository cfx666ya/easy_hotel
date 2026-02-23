/**
 * 负责页面的结构
 */

/**
 * 应用根组件
 */

import AppRoutes from './router/index.jsx';

function App() {
  return (
    <div>
      {/* 主内容区 */}
      <AppRoutes />
    </div>
  );
}

export default App;
