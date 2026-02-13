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
      <h4>{data.name}</h4>
      <p>评分: {data.score}</p>
      <p>地址: {data.address}</p>
      <p>价格: ¥{data.price}</p>
    </div>
  );
}
