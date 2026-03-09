function SearchCard({ hotel, keyword }) {
  const highlight = (text) => {
    if (!keyword) return text;

    const parts = text.split(keyword);

    return parts.map((part, index) =>
      index === parts.length - 1 ? (
        part
      ) : (
        <>
          {part}
          <span className="highlight">{keyword}</span>
        </>
      ),
    );
  };

  return (
    <div className="hotel-card">
      <div className="icon">🏠</div>

      <div className="info">
        <div className="name">{highlight(hotel.name)}</div>
        <div className="meta">
          {hotel.rating}分 | {hotel.address}
        </div>
      </div>

      <div className="price">￥{hotel.price}</div>
    </div>
  );
}
