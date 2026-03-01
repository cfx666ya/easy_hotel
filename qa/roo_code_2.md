
基于你的酒店预订项目代码，我为你准备了详细的React技术知识点和模拟面试问题。

## 📚 React核心技术知识点

### 1. **React Hooks（你项目中大量使用）**

#### useState
- **作用**：管理组件状态
- **你的应用**：在 [`HotelListPage`](src/pages/HotelList/index.jsx:19) 中管理查询条件、酒店列表、加载状态等
```javascript
const [query, setQuery] = useState({...})
const [hotelList, setHotelList] = useState([])
```

#### useEffect
- **作用**：处理副作用（数据获取、订阅、DOM操作）
- **依赖数组**：控制何时执行
- **清理函数**：在 [`useDebounce`](src/hooks/useDebounce.jsx:28) 中清理定时器

#### useRef
- **作用**：保存可变值，不触发重渲染
- **你的应用**：在 [`useDebounce`](src/hooks/useDebounce.jsx:8) 中保存定时器ID，在 [`HotelListPage`](src/pages/HotelList/index.jsx:50) 中作为请求锁防止重复请求
```javascript
const fetchingRef = useRef(false) // 请求锁
```

#### useCallback
- **作用**：缓存函数，避免子组件不必要的重渲染
- **你的应用**：在 [`useDebounce`](src/hooks/useDebounce.jsx:12) 中缓存防抖函数

#### useMemo
- **作用**：缓存计算结果，优化性能
- **使用场景**：复杂计算、过滤大数组

#### 自定义Hook
- **你的实现**：[`useDebounce`](src/hooks/useDebounce.jsx:6) - 封装防抖逻辑
- **优势**：逻辑复用、代码组织清晰

### 2. **React Router（路由管理）**

你使用了 `react-router-dom v7`：

- **懒加载**：[`lazy()`](src/router/index.jsx:9) 配合 [`Suspense`](src/router/index.jsx:31) 实现代码分割
```javascript
const Home = lazy(() => import('../pages/Home'))
```

- **路由配置**：[`Routes`](src/router/index.jsx:32) 和 [`Route`](src/router/index.jsx:34) 组件
- **动态路由**：[`/hotel-detail/:id`](src/router/index.jsx:40) 传递参数
- **编程式导航**：[`useNavigate`](src/pages/HotelList/index.jsx:15) 跳转页面
- **URL参数管理**：[`useSearchParams`](src/pages/HotelList/index.jsx:12) 读取和修改查询字符串

### 3. **性能优化**

#### 代码分割（Code Splitting）
- 使用 [`lazy`](src/router/index.jsx:9) 和 [`Suspense`](src/router/index.jsx:31) 按需加载页面

#### 防抖（Debounce）
- 你的 [`useDebounce`](src/hooks/useDebounce.jsx:6) Hook 延迟执行搜索请求，减少API调用

#### 请求锁机制
- 使用 [`fetchingRef`](src/pages/HotelList/index.jsx:50) 防止重复请求

### 4. **组件设计模式**

#### 组件拆分
- 页面组件：`HotelListPage`
- 业务组件：`SearchBar`、`FilterBar`、`HotelList`
- 通用组件：`HotelCard`、`DatePickerModal`

#### Props传递
- 父子组件通信：通过props传递数据和回调函数

### 5. **状态管理**

你的项目使用 **URL作为状态源**：
- 查询条件存储在URL参数中
- 通过 [`searchParams`](src/pages/HotelList/index.jsx:12) 读取
- 通过 [`navigate`](src/pages/HotelList/index.jsx:78) 更新

### 6. **UI组件库**

- **antd-mobile**：移动端UI组件库
- **ConfigProvider**：在 [`App.jsx`](src/App.jsx:10) 中配置主题

---

## 🎯 模拟面试问题

### **基础问题**

**Q1: 请解释React中的虚拟DOM是什么？它的工作原理是什么？**

**参考答案**：
虚拟DOM是React在内存中维护的一个轻量级JavaScript对象树，它是真实DOM的抽象表示。

工作流程：
1. 状态改变时，React创建新的虚拟DOM树
2. 通过Diff算法比较新旧虚拟DOM的差异
3. 计算出最小更新集（Reconciliation）
4. 批量更新真实DOM

优势：减少直接操作DOM的次数，提升性能。

---

**Q2: useState和useRef有什么区别？什么时候用哪个？**

**参考答案**：

| 特性 | useState | useRef |
|------|----------|--------|
| 触发重渲染 | ✅ 是 | ❌ 否 |
| 更新方式 | 异步 | 同步 |
| 使用场景 | UI相关状态 | DOM引用、定时器ID、请求锁 |

在我的项目中：
- [`useState`](src/pages/HotelList/index.jsx:19) 管理酒店列表、查询条件（需要UI更新）
- [`useRef`](src/pages/HotelList/index.jsx:50) 作为请求锁（不需要UI更新，避免闭包陷阱）

---

**Q3: 请解释useEffect的依赖数组的作用？**

**参考答案**：

依赖数组控制useEffect的执行时机：
- **空数组 `[]`**：只在组件挂载时执行一次
- **有依赖 `[dep1, dep2]`**：依赖变化时执行
- **无依赖数组**：每次渲染都执行（不推荐）

在 [`useDebounce`](src/hooks/useDebounce.jsx:28) 中，清理函数的useEffect使用空数组，确保只在组件卸载时清理定时器。

---

### **进阶问题**

**Q4: 你的项目中实现了防抖Hook，能解释一下为什么要用useCallback和useRef吗？**

**参考答案**：

在 [`useDebounce`](src/hooks/useDebounce.jsx:6) 中：

1. **useRef保存定时器ID**：
   - 不会触发重渲染
   - 在多次调用间保持同一个引用
   - 可以在清理函数中访问

2. **useCallback缓存函数**：
   - 避免每次渲染创建新函数
   - 保持函数引用稳定
   - 依赖数组 `[callback, delay]` 确保参数变化时更新

3. **清理副作用**：
   - 组件卸载时清理定时器，防止内存泄漏

---

**Q5: 为什么在HotelListPage中使用fetchingRef作为请求锁，而不是用loading状态？**

**参考答案**：

如代码注释所说（[第48行](src/pages/HotelList/index.jsx:48)）：

**问题**：
- `setState`是异步的，`setLoading(true)`只是排队更新
- 在更新完成前，如果触发多次滚动/快速操作，`loading`还是`false`
- 导致重复请求

**解决方案**：
- `useRef`的`.current`是同步更新的
- 立即生效，可靠地阻止并发请求
- 不触发重渲染，性能更好

```javascript
if (fetchingRef.current) return; // 立即生效
fetchingRef.current = true;
```

---

**Q6: 你的项目使用了React Router的懒加载，能说说它的原理和好处吗？**

**参考答案**：

在 [`router/index.jsx`](src/router/index.jsx:9) 中：

```javascript
const Home = lazy(() => import('../pages/Home'))
```

**原理**：
1. `lazy`接收一个返回动态`import()`的函数
2. 返回一个特殊的React组件
3. 首次渲染时才加载对应模块
4. 配合`Suspense`显示加载状态

**好处**：
- **代码分割**：减小初始bundle大小
- **按需加载**：用户访问时才下载
- **提升首屏速度**：特别适合多页面应用

**注意**：必须用 [`Suspense`](src/router/index.jsx:31) 包裹，提供`fallback`组件。

---

**Q7: 你的项目把查询条件存在URL中，这种设计有什么优缺点？**

**参考答案**：

**优点**：
1. **可分享**：用户可以复制URL分享搜索结果
2. **可刷新**：刷新页面保持搜索状态
3. **浏览器历史**：支持前进/后退
4. **SEO友好**：搜索引擎可以索引

**缺点**：
1. **URL长度限制**：复杂查询可能超长
2. **安全性**：敏感信息不应放URL
3. **类型转换**：URL参数都是字符串，需要手动转换

在 [`HotelListPage`](src/pages/HotelList/index.jsx:19) 中，我用 `searchParams.get()` 读取并转换类型：
```javascript
distance: Number(searchParams.get('distance')) || ''
```

---

**Q8: React 19有哪些新特性？你的项目用到了吗？**

**参考答案**：

你的项目使用React 19.2.0（[`package.json`](package.json:18)），主要新特性：

1. **React Compiler**：自动优化，减少手动memo
2. **Actions**：简化表单和异步操作
3. **use Hook**：读取Promise和Context
4. **Server Components**：服务端渲染组件
5. **改进的Suspense**：更好的加载状态管理

你的项目主要使用传统Hooks模式，可以考虑：
- 使用Actions简化表单提交
- 用Compiler减少useCallback/useMemo

---

### **项目相关问题**

**Q9: 如果酒店列表数据量很大（10000+），你会如何优化性能？**

**参考答案**：

1. **虚拟滚动**：只渲染可见区域的列表项
   - 使用`react-window`或`react-virtualized`
   
2. **分页/无限滚动**：你已经实现了游标分页（[`cursor`](src/pages/HotelList/index.jsx:28)）

3. **memo优化**：
   ```javascript
   const HotelCard = memo(({ hotel }) => {...})
   ```

4. **图片懒加载**：使用`loading="lazy"`或Intersection Observer

5. **数据缓存**：使用React Query或SWR缓存请求结果

---

**Q10: 如果要添加全局状态管理（如购物车、用户信息），你会选择什么方案？**

**参考答案**：

**方案对比**：

1. **Context API**：
   - 适合：简单全局状态（主题、语言）
   - 缺点：性能问题（所有消费者都重渲染）

2. **Zustand**（推荐）：
   - 轻量级（~1KB）
   - API简单，学习成本低
   - 性能好，按需订阅

3. **Redux Toolkit**：
   - 适合：复杂状态逻辑
   - 生态丰富，中间件支持
   - 学习曲线较陡

4. **Jotai/Recoil**：
   - 原子化状态管理
   - 适合细粒度更新

对于酒店预订项目，我推荐**Zustand**，因为状态相对简单，需要快速开发。

---

## 💡 答辩技巧

1. **结合项目说明**：每个回答都关联你的代码实现
2. **说明设计决策**：解释为什么这样做（如URL状态管理）
3. **承认不足**：可以提改进方向（如添加虚拟滚动）
4. **展示思考**：对比多种方案的优缺点
5. **准备Demo**：现场演示关键功能

## 📌 重点复习

- Hooks原理和使用场景
- 性能优化手段（防抖、懒加载、memo）
- 路由管理和代码分割
- 自定义Hook的设计
- 状态管理方案选择

祝你答辩顺利！🎉
