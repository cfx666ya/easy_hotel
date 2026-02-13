export default function FilterPanel({ query, setQuery }) {
  return (
    <div className="filter-panel">
      <h3>详细筛选区域</h3>
      <p>
        价格区间: {query.minPrice} - {query.maxPrice}
      </p>
    </div>
  );
}
