import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Look, shade } from './avatars';
import { AvatarView } from './AvatarView';

// A scene is a shaded backdrop plus avatar "actors" (see avatars.ts). Everything is drawn in code, so story art
// costs nothing to make. `motion: true` turns a scene into a short clip: the camera pushes in
// and actors with a `to` slide across the stage.

export type Backdrop = 'meadow' | 'forest' | 'ocean' | 'space' | 'castle' | 'night' | 'snow' | 'desert';
export type Fx = 'stars' | 'snow' | 'bubbles' | 'sparkles';

export type Actor = {
  look: Look;
  name?: string; // id used by "find it" prompts
  x: number; // 0 (left) … 1 (right)
  depth?: number; // 0 = front (big, low) … 1 = back (small, high)
  size?: number; // multiplier, default 1
  anim?: 'bob' | 'hop' | 'spin' | 'float' | 'walk' | 'none';
  to?: number; // motion scenes: x to travel to
  flip?: boolean; // face the other way
};

export type Scene = { bg: Backdrop; actors: Actor[]; fx?: Fx; motion?: boolean };

type Palette = { sky: [string, string]; far: string; mid: string; ground: string; orb: string; orbGlow: string };

export const backdrops: Record<Backdrop, Palette & { label: string }> = {
  meadow: { label: 'Meadow', sky: ['#8FD3FF', '#E6F7FF'], far: '#A6DE85', mid: '#74C653', ground: '#56AE3E', orb: '#FFD45C', orbGlow: '#FFF3B0' },
  forest: { label: 'Forest', sky: ['#9ED9C8', '#E8FFF4'], far: '#4F9E79', mid: '#3A845F', ground: '#2E6B4A', orb: '#FFE07A', orbGlow: '#FFF7CF' },
  ocean: { label: 'Ocean', sky: ['#7FD0FF', '#DDF5FF'], far: '#56BDEB', mid: '#2F95D1', ground: '#F3D89A', orb: '#FFD45C', orbGlow: '#FFF3B0' },
  space: { label: 'Space', sky: ['#120B33', '#3B2A7A'], far: '#5B3FA8', mid: '#4A2F94', ground: '#8C7BCF', orb: '#FFB86B', orbGlow: '#FFE1BD' },
  castle: { label: 'Kingdom', sky: ['#FFC3D8', '#FFF0E0'], far: '#C7A6E8', mid: '#A884D6', ground: '#8BCB6B', orb: '#FFD45C', orbGlow: '#FFF3B0' },
  night: { label: 'Night', sky: ['#1B2350', '#4A5BA8'], far: '#33418A', mid: '#283474', ground: '#1E295C', orb: '#FFF6C9', orbGlow: '#FFFDF0' },
  snow: { label: 'Snowland', sky: ['#BFE3FF', '#F4FBFF'], far: '#E3EEF8', mid: '#D2E3F3', ground: '#FFFFFF', orb: '#FFE07A', orbGlow: '#FFF7CF' },
  desert: { label: 'Desert', sky: ['#FFD59A', '#FFF1D6'], far: '#F0B46A', mid: '#E39B4C', ground: '#F6C67F', orb: '#FFB347', orbGlow: '#FFE2B0' },
};

const defaultFx: Partial<Record<Backdrop, Fx>> = { space: 'stars', night: 'stars', snow: 'snow', ocean: 'bubbles' };


function Backdrop({ bg, w, h, id }: { bg: Backdrop; w: number; h: number; id: string }) {
  const p = backdrops[bg];
  const hill = (base: number, amp: number, phase: number) =>
    `M0 ${h} L0 ${base} Q ${w * (0.25 + phase)} ${base - amp} ${w * 0.5} ${base} T ${w} ${base} L ${w} ${h} Z`;
  const orbR = Math.min(w, h) * 0.11;
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.sky[0]} />
          <Stop offset="1" stopColor={p.sky[1]} />
        </LinearGradient>
        <RadialGradient id={`orb${id}`} cx="35%" cy="35%" r="65%">
          <Stop offset="0" stopColor={p.orbGlow} />
          <Stop offset="1" stopColor={p.orb} />
        </RadialGradient>
        {(['far', 'mid', 'ground'] as const).map((k) => (
          <LinearGradient key={k} id={`${k}${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={shade(p[k], 0.08)} />
            <Stop offset="1" stopColor={shade(p[k], -0.1)} />
          </LinearGradient>
        ))}
      </Defs>
      <Rect width={w} height={h} fill={`url(#sky${id})`} />
      <Circle cx={w * 0.8} cy={h * 0.2} r={orbR * 1.6} fill={p.orbGlow} opacity={0.35} />
      <Circle cx={w * 0.8} cy={h * 0.2} r={orbR} fill={`url(#orb${id})`} />
      {bg === 'space' && <Ellipse cx={w * 0.8} cy={h * 0.2} rx={orbR * 1.7} ry={orbR * 0.35} stroke="#FFE1BD" strokeWidth={3} fill="none" opacity={0.7} />}
      <Path d={hill(h * 0.55, h * 0.18, 0)} fill={`url(#far${id})`} />
      <Path d={hill(h * 0.68, h * 0.12, 0.1)} fill={`url(#mid${id})`} />
      <Path d={`M0 ${h} L0 ${h * 0.78} Q ${w * 0.5} ${h * 0.72} ${w} ${h * 0.78} L ${w} ${h} Z`} fill={`url(#ground${id})`} />
    </Svg>
  );
}

function useLoop(active: boolean, duration: number, pingPong: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    const anim = pingPong
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        )
      : Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, [active, duration, pingPong, v]);
  return v;
}

function Particles({ fx, w, h, t }: { fx: Fx; w: number; h: number; t: Animated.Value }) {
  const n = fx === 'stars' ? 14 : 12;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const o = (i + 0.5) / n; // phase offset, spreads particles out
        const x = ((i * 37) % 100) / 100;
        if (fx === 'stars' || fx === 'sparkles') {
          const opacity = t.interpolate({ inputRange: [0, o, Math.min(1, o + 0.25), 1], outputRange: [0.25, 1, 0.25, 0.25] });
          return (
            <Animated.Text
              key={i}
              style={{ position: 'absolute', left: x * w, top: ((i * 53) % 55) / 100 * h, opacity, fontSize: fx === 'stars' ? 7 + (i % 3) * 3 : 14, color: fx === 'stars' ? '#FFF8D6' : '#FFD45C' }}
            >
              ✦
            </Animated.Text>
          );
        }
        // snow falls, bubbles rise; the 4-point range wraps each particle seamlessly
        const fall = fx === 'snow';
        const start = fall ? o * h : (1 - o) * h;
        const translateY = t.interpolate({
          inputRange: [0, 1 - o, 1 - o + 0.0001, 1],
          outputRange: fall ? [start, h, 0, start] : [start, 0, h, start],
        });
        return (
          <Animated.Text key={i} style={{ position: 'absolute', left: x * w, top: 0, fontSize: fall ? 10 : 12, color: fall ? '#fff' : '#E8F8FF', opacity: 0.85, transform: [{ translateY }] }}>
            {fall ? '❄' : '○'}
          </Animated.Text>
        );
      })}
    </>
  );
}

function ActorView({
  a,
  i,
  w,
  h,
  loop,
  spin,
  motion,
  onPress,
}: {
  a: Actor;
  i: number;
  w: number;
  h: number;
  loop: Animated.Value;
  spin: Animated.Value;
  motion: Animated.Value;
  onPress?: () => void;
}) {
  const depth = a.depth ?? 0;
  const size = Math.min(w * 0.6, h) * (0.34 - depth * 0.15) * (a.size ?? 1);
  const footY = h * (0.92 - depth * 0.16);
  const left = a.x * w - size / 2;
  const dir = i % 2 ? -1 : 1; // alternate phase so actors don't move in lockstep

  const transforms: any[] = [];
  if (a.to !== undefined) transforms.push({ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, (a.to - a.x) * w] }) });
  const anim = a.anim ?? 'bob';
  if (anim === 'bob') transforms.push({ translateY: loop.interpolate({ inputRange: [0, 1], outputRange: dir > 0 ? [0, -size * 0.08] : [-size * 0.08, 0] }) });
  if (anim === 'hop') transforms.push({ translateY: loop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -size * 0.35, 0] }) });
  if (anim === 'float') {
    transforms.push({ translateY: loop.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.12 * dir, size * 0.12 * dir] }) });
    transforms.push({ rotate: loop.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) });
  }
  if (anim === 'walk') transforms.push({ rotate: loop.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) });
  if (anim === 'spin') transforms.push({ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) });
  if (a.flip) transforms.push({ scaleX: -1 });

  const airborne = anim === 'float';
  const shadowScale = anim === 'hop' ? loop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.6, 1] }) : 1;
  const shadowMove = a.to !== undefined ? motion.interpolate({ inputRange: [0, 1], outputRange: [0, (a.to - a.x) * w] }) : 0;

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: a.x * w - size * 0.32,
          top: footY - size * 0.06,
          width: size * 0.64,
          height: size * 0.14,
          borderRadius: size,
          backgroundColor: 'rgba(0,0,0,0.18)',
          opacity: airborne ? 0.5 : 1,
          transform: [{ translateX: shadowMove }, { scale: shadowScale }],
        }}
      />
      <Animated.View style={{ position: 'absolute', left, top: footY - size * (airborne ? 1.3 : 0.97), width: size, height: size, transform: transforms }}>
        {onPress ? (
          <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={a.name ?? a.look.kind}>
            <AvatarView look={a.look} size={size} />
          </Pressable>
        ) : (
          <AvatarView look={a.look} size={size} />
        )}
      </Animated.View>
    </>
  );
}

export function SceneView({
  scene,
  active = true,
  style,
  rounded = 24,
  showReplay = true,
  onActorPress,
}: {
  scene: Scene;
  onActorPress?: (a: Actor) => void;
  active?: boolean;
  style?: ViewStyle;
  rounded?: number;
  showReplay?: boolean;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [take, setTake] = useState(0); // bump to replay a motion scene
  const id = useRef(Math.random().toString(36).slice(2, 8)).current;
  const loop = useLoop(active, 900, true);
  const spin = useLoop(active && scene.actors.some((a) => a.anim === 'spin'), 2400, false);
  const fx = scene.fx ?? defaultFx[scene.bg];
  const fxT = useLoop(active && !!fx, fx === 'stars' || fx === 'sparkles' ? 3000 : 7000, false);
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scene.motion) return;
    motion.setValue(0);
    if (!active) return;
    const anim = Animated.timing(motion, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [active, scene.motion, take, motion]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const camera = scene.motion
    ? [
        { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
        { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, size.h * 0.03] }) },
      ]
    : [];

  // back-to-front so nearer actors overlap farther ones
  const actors = scene.actors.map((a, i) => ({ a, i })).sort((p, q) => (q.a.depth ?? 0) - (p.a.depth ?? 0));

  return (
    <View style={[{ overflow: 'hidden', borderRadius: rounded, backgroundColor: backdrops[scene.bg].sky[1] }, style]} onLayout={onLayout}>
      {size.w > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: camera }]}>
          <Backdrop bg={scene.bg} w={size.w} h={size.h} id={id} />
          {fx && <Particles fx={fx} w={size.w} h={size.h} t={fxT} />}
          {actors.map(({ a, i }) => (
            <ActorView key={i} a={a} i={i} w={size.w} h={size.h} loop={loop} spin={spin} motion={motion} onPress={onActorPress ? () => onActorPress(a) : undefined} />
          ))}
        </Animated.View>
      )}
      {scene.motion && showReplay && (
        <Pressable onPress={() => setTake((t) => t + 1)} style={styles.replay} accessibilityLabel="Replay scene" hitSlop={8}>
          <Text style={styles.replayText}>↻ Replay</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  replay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  replayText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
