export default function SearchBar({ query, setQuery }) {
  return (
    <div className="search-bar">
      <h3>核心搜索区域</h3>
      <p>当前城市: {query.city || '未选择'}</p>
    </div>
  );
}
