import { useWindowDimensions } from 'react-native';

// One place for phone vs tablet sizing. iPad windows can be any size (split view, Stage Manager),
// so everything keys off the live window size, not the device type.
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const tablet = Math.min(width, height) >= 600;
  const contentWidth = Math.min(width, tablet ? 760 : width);
  const columns = width >= 1000 ? 4 : width >= 600 ? 3 : 2;
  return { width, height, tablet, contentWidth, columns, landscape: width > height };
}

// Pixel width of one card in a wrapping grid, so `gap` never pushes a card onto the next row.
export function cardWidth(available: number, columns: number, gap: number) {
  return Math.floor((available - gap * (columns - 1)) / columns);
}
