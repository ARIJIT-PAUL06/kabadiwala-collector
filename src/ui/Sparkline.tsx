// Serves: R02, R06
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors, spacing } from '../theme/tokens';
import { Text } from './Text';

export interface SparklineProps {
  data: number[]; // 4 points
  labels?: string[]; // e.g. ['W-3', 'W-2', 'Last wk', 'This wk']
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [100, 105, 102, 110],
  labels = ['W1', 'W2', 'W3', 'W4'],
  width = 280,
  height = 90,
  color = colors.primary,
  style,
}) => {
  const paddingX = 24;
  const paddingTop = 16;
  const paddingBottom = 24;

  const validData = data.length >= 2 ? data : [0, 0, 0, 0];
  const minVal = Math.min(...validData);
  const maxVal = Math.max(...validData);
  const range = maxVal === minVal ? 1 : maxVal - minVal;

  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const points = validData.map((val, idx) => {
    const x = paddingX + (idx / (validData.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width={width} height={height}>
        {/* Baseline grid line */}
        <Line
          x1={paddingX}
          y1={paddingTop + plotHeight}
          x2={width - paddingX}
          y2={paddingTop + plotHeight}
          stroke={colors.outline}
          strokeWidth={1}
          strokeDasharray="4,4"
        />

        {/* Data curve */}
        <Path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((pt, idx) => (
          <Circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill={colors.surface}
            stroke={color}
            strokeWidth={2}
          />
        ))}
      </Svg>

      {/* Week labels */}
      <View style={[styles.labelsRow, { paddingHorizontal: paddingX - 10 }]}>
        {labels.map((lbl, idx) => (
          <Text key={idx} variant="caption" color={colors.inkMuted} style={styles.labelText}>
            {lbl}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: spacing.xs,
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.md,
    marginBottom: spacing.xs,
  },
  labelText: {
    fontSize: 11,
  },
});
