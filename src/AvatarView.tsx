import { memo, useMemo } from 'react';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { draw, gradientStops, Look, shadedColors } from './avatars';

// Native renderer for the shape drawings in avatars.ts.
export const AvatarView = memo(function AvatarView({ look, size }: { look: Look; size: number }) {
  const { shapes, cols } = useMemo(() => {
    const shapes = draw(look);
    return { shapes, cols: shadedColors(shapes) };
  }, [look]);
  const fill = (c: string, s?: boolean) => (c === 'none' ? 'none' : s ? `url(#g${cols.indexOf(c)})` : c);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {cols.map((c, i) => (
          <RadialGradient key={c} id={`g${i}`} cx="35%" cy="30%" r="75%">
            {gradientStops(c).map((st) => (
              <Stop key={st.offset} offset={st.offset} stopColor={st.color} />
            ))}
          </RadialGradient>
        ))}
      </Defs>
      {shapes.map((s, i) =>
        s.t === 'e' ? (
          <Ellipse
            key={i}
            cx={s.cx}
            cy={s.cy}
            rx={s.rx}
            ry={s.ry}
            fill={fill(s.c, s.s)}
            opacity={s.o}
            stroke={s.k}
            strokeWidth={s.w}
            transform={s.r ? `rotate(${s.r} ${s.cx} ${s.cy})` : undefined}
          />
        ) : (
          <Path
            key={i}
            d={s.d}
            fill={fill(s.c, s.s)}
            opacity={s.o}
            stroke={s.k}
            strokeWidth={s.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.dash}
          />
        ),
      )}
    </Svg>
  );
});
