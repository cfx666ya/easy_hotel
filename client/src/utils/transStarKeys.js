/**
 * 处理 星级 与 keys 之间的转换函数
 */

const starButtons = [
  { key: '2-', label: '2星及以下', subLabel: '经济', min: null, max: 2 },
  { key: '3', label: '3星', subLabel: '舒适', min: 3, max: 3 },
  { key: '4', label: '4星', subLabel: '高档', min: 4, max: 4 },
  { key: '5', label: '5星', subLabel: '豪华', min: 5, max: 5 },
];

// 判断用户选中的星级，并从星级 keys 中获取最大星级与最小星级，从而取区间
export const getStarMinMaxFromKeys = (keys) => {
  let starMin = null,
    starMax = null;
  keys.forEach((key) => {
    const star = starButtons.find((s) => s.key === key);
    if (star) {
      if (star.min !== null) {
        starMin = starMin === null ? star.min : Math.min(starMin, star.min);
      } else {
        starMin = null;
      }
      if (star.max !== null) {
        starMax = starMax === null ? star.max : Math.max(starMax, star.max);
      }
    }
  });
  return {
    starMin: starMin === null ? '' : starMin,
    starMax: starMax === null ? '' : starMax,
  };
};

// 从最大最小星级中获取 keys，用于在展开 panel 时高亮星级 button
export const getStarKeysFromMinMax = (starMin, starMax) => {
  const keys = [];
  const min = starMin ? Number(starMin) : null;
  const max = starMax ? Number(starMax) : null;

  starButtons.forEach((star) => {
    if (star.key === '2-') {
      if (
        (min === null && max !== null && max >= 2) ||
        (min !== null && min <= 2 && max !== null && max >= 2)
      ) {
        keys.push(star.key);
      }
    } else {
      if (min !== null && max !== null) {
        if (star.min <= max && star.max >= min) keys.push(star.key);
      } else if (min === null && max !== null) {
        if (star.max <= max) keys.push(star.key);
      } else if (min !== null && max === null) {
        if (star.min >= min) keys.push(star.key);
      }
    }
  });
  return keys;
};
