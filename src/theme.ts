export const colors = {
  bg: '#FFF4F8',
  card: '#FFFFFF',
  text: '#3A2E4D',
  muted: '#8E80A3',
  accent: '#FF6FA5',
  accentDark: '#E04F8A',
  sky: '#7CC8FF',
  sun: '#FFD45C',
  track: '#F3E2EC',
  danger: '#E5484D',
};

// Cover colours for stories that don't have a picture yet.
export const coverColors = ['#FFB5D0', '#A8DCFF', '#FFE08A', '#B8E8C4', '#D7C4FF', '#FFC9A3'];

export const font = {
  title: { fontSize: 30, fontWeight: '800' as const, color: colors.text },
  heading: { fontSize: 22, fontWeight: '800' as const, color: colors.text },
  body: { fontSize: 17, color: colors.text },
  small: { fontSize: 14, color: colors.muted },
  // Big, rounded-feeling text for reading to kids
  story: { fontSize: 26, lineHeight: 36, fontWeight: '600' as const, color: colors.text },
};
