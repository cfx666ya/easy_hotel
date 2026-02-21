import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hotel-detail/${data.id}`);
  };

  return (
    <div
      className="hotel-card"
      style={{
        border: '1px solid #eee',
        padding: '12px',
        marginBottom: '12px',
        cursor: 'pointer', // 提示可点击
      }}
      onClick={handleClick}
    >
      <h4>
        {highlightText(data.name?.cn || '', keyword)} ({data.name?.en})
      </h4>
      <p>
        评分: {data.score} 星级: {data.starRating}
      </p>
      <p>地址: {data.address}</p>
      <p>价格: ¥{data.price}</p>
      <p>
        【{data.themeFeatures[0]}】【{data.facilities[0]}】【{data.roomTypes[0]}
        】
      </p>
    </div>
  );
}
