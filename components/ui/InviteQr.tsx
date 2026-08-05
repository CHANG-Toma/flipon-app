import { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { encode } from 'uqr';

type Props = {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
};

/** QR local (uqr + SVG) — compatible Expo web, sans le package `qrcode` cassé. */
export function InviteQr({
  value,
  size = 168,
  color = '#111',
  backgroundColor = '#fff',
}: Props) {
  const matrix = useMemo(() => encode(value, { ecc: 'M' }), [value]);
  const dim = matrix.size;
  const cell = size / dim;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />
      {matrix.data.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <Rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}
