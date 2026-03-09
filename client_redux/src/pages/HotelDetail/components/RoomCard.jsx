/**
 * 房型卡片
 */

export default function RoomCard({ room }) {
  return (
    <div
      style={{
        display: 'flex',
        padding: 12,
        background: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        alignItems: 'stretch', // 关键
      }}
    >
      {/* 左侧图片 */}
      <img
        src={room.roomImage}
        alt={room.name}
        style={{
          width: '120px',
          height: '%100',
          objectFit: 'cover',
          borderRadius: 8,
          marginRight: 12,
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
          {/* 房间名称 */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            {room.name}
          </div>

          {/* 主题标签 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {room.themeFeatures?.map((theme, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #1677ff',
                  color: '#1677ff',
                  fontSize: 12,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {theme}
              </div>
            ))}
          </div>

          {/* 设施标签 */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 6,
            }}
          >
            {room.facilities?.slice(0, 2).map((fac, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #1677ff',
                  color: '#1677ff',
                  fontSize: 12,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {fac}
              </div>
            ))}

            {room.facilities?.length > 2 && (
              <div
                style={{
                  border: '1px solid #1677ff',
                  color: '#1677ff',
                  fontSize: 12,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                等{room.facilities.length}项设施
              </div>
            )}
          </div>
        </div>

        {/* 右下角价格区域 */}
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <div style={{ color: '#1677ff' }}>
            <span style={{ fontSize: 14 }}>￥</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{room.price}</span>
            <span style={{ fontSize: 14 }}>/晚</span>
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#999',
            }}
          >
            剩余 {room.availableCount} 间
          </div>
        </div>
      </div>
    </div>
  );
}
