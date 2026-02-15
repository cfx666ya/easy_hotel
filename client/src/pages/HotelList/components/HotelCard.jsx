export default function HotelCard({ data }) {
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
        {data.name?.cn} ({data.name?.en})
      </h4>
      <p>评分: {data.score}</p>
      <p>地址: {data.address}</p>
      <p>价格: ¥{data.price}</p>
    </div>
  );
}
