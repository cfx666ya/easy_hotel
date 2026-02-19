// 高亮函数
const highlightText = (text, keyword) => {
  if (!keyword) return text;

  const parts = text.split(keyword);

  return parts.reduce((prev, curr, index) => {
    if (index === 0) return [curr];

    return [
      ...prev,
      <span style={{ color: 'blue' }} key={index}>
        {keyword}
      </span>,
      curr,
    ];
  }, []);
};

export default function HotelCard({ data, keyword }) {
  return (
    <div
      className="hotel-card"
      style={{
        border: '1px solid #eee',
        padding: '12px',
        marginBottom: '12px',
      }}
    >
      {/* 这里需要注意数据结构的对应 */}
      <h4>
        {highlightText(data.name?.cn || '', keyword)} ({data.name?.en})
      </h4>
      <p>评分: {data.score}</p>
      <p>地址: {data.address}</p>
      <p>价格: ¥{data.price}</p>
    </div>
  );
}
