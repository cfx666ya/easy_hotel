/**
 * 房型卡片
 */

export default function RoomCard({ room }) {
  return (
    <div className="room-card">
      <img src={room.roomImage} alt={room.name} className="room-image" />
      <div className="room-info">
        <h4>{room.name}</h4>
        <div className="room-theme">
          {room.themeFeatures?.map((theme, idx) => (
            <span key={idx} className="theme-tag">
              {theme}
            </span>
          ))}
        </div>
        <div className="room-facilities">
          {room.facilities?.slice(0, 2).map((fac, idx) => (
            <span key={idx} className="facility-tag">
              {fac}
            </span>
          ))}
          {room.facilities?.length > 2 && (
            <span>等{room.facilities.length}项设施</span>
          )}
        </div>
        <div className="room-price">
          <span className="price">¥{room.price}</span> /晚
        </div>
        <div className="room-available">剩余 {room.availableCount} 间</div>
      </div>
    </div>
  );
}
