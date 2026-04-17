import { useState, useEffect } from 'react';

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

interface Props<T> {
  items: T[];
  perView?: number;
  gap?: string;
  interval?: number;
  className?: string;
  renderItem: (item: T, globalIndex: number) => React.ReactNode;
}

export default function AutoSwiper<T>({
  items,
  perView = 1,
  gap = '0px',
  interval = 4000,
  className = '',
  renderItem,
}: Props<T>) {
  const pages = chunk(items, perView);
  const [page, setPg] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { setPg(0); }, [items.length]);

  useEffect(() => {
    if (paused || pages.length <= 1) return;
    const t = setInterval(() => setPg(p => (p + 1) % pages.length), interval);
    return () => clearInterval(t);
  }, [paused, pages.length, interval]);

  if (!items.length) return null;

  const prev = () => setPg(p => (p - 1 + pages.length) % pages.length);
  const next = () => setPg(p => (p + 1) % pages.length);

  return (
    <div
      className={`asw-root ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="asw-overflow">
        <div
          className="asw-track"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((group, pi) => (
            <div
              key={pi}
              className="asw-group"
              style={{ gridTemplateColumns: `repeat(${perView}, 1fr)`, gap }}
            >
              {group.map((item, gi) => renderItem(item, pi * perView + gi))}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="asw-nav">
          <button className="asw-arrow" onClick={prev}>‹</button>
          <div className="asw-dots">
            {pages.map((_, i) => (
              <button key={i} className={`asw-dot ${i === page ? 'on' : ''}`} onClick={() => setPg(i)} />
            ))}
          </div>
          <button className="asw-arrow" onClick={next}>›</button>
        </div>
      )}
    </div>
  );
}
