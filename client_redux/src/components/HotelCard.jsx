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
      onClick={handleClick}
      style={{
        display: 'flex',
        padding: '12px',
        marginBottom: '12px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* 左侧图片 */}
      <img
        src={data.hotelImages?.[0]}
        alt=""
        style={{
          width: '120px',
          height: '%100',
          objectFit: 'cover',
          borderRadius: '10px',
          marginRight: '12px',
          flexShrink: 0,
        }}
      />

      {/* 右侧信息 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* 上半部分 */}
        <div>
          {/* 酒店名称 */}
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '6px',
            }}
          >
            {highlightText(data.name?.cn || '', keyword)} ({data.name?.en})
          </div>

          {/* 评分 + 星级 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '6px',
              gap: '8px',
            }}
          >
            {/* 评分 */}
            <div
              style={{
                background: '#1677ff',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            >
              {data.score}
            </div>

            {/* 星级 */}
            <div style={{ fontSize: '14px', color: '#faad14' }}>
              {'★'.repeat(data.starRating)}
              {'☆'.repeat(5 - data.starRating)}
            </div>
          </div>

          {/* 地址 */}
          <div
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '6px',
            }}
          >
            {data.address}
          </div>

          {/* 标签 */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              data.themeFeatures?.[0],
              data.facilities?.[0],
              data.roomTypes?.[0],
            ]
              .filter(Boolean)
              .map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #1677ff',
                    color: '#1677ff',
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  {item}
                </div>
              ))}
          </div>
        </div>

        {/* 价格（右下角） */}
        <div
          style={{
            textAlign: 'right',
            marginTop: '8px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#1677ff' }}>￥</span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1677ff',
              margin: '0 2px',
            }}
          >
            {data.price}
          </span>
          <span style={{ fontSize: '13px', color: '#1677ff' }}>起</span>
        </div>
      </div>
    </div>
  );
}
