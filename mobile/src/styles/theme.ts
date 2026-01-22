/**
 * Reborn - 自然有机设计系统
 *
 * 设计理念：
 * - 重生：从土壤中生长，破茧成蝶
 * - 蜕变：自然循环，四季更迭
 * - 有机：非完美几何，柔和边缘，自然形态
 *
 * 配色灵感：大地、森林、晨光、陶土、落叶
 */

export const Colors = {
  // 主色 - 深森林绿，代表扎根与生长
  primary: '#2D4A3E',
  primaryDark: '#1A2F26',
  primaryLight: '#4A6B5D',

  // 辅色 - 暖陶土色，代表蜕变与泥土
  secondary: '#C4A484',
  secondaryDark: '#9A7B5C',
  secondaryLight: '#E8DCC8',

  // 强调色 - 琥珀金，代表希望与破茧
  accent: '#D4A574',
  accentBright: '#E8C49B',

  // 背景色 - 米白/羊皮纸，代表新的开始
  background: '#F5F1EB',
  backgroundDark: '#EBE5DD',

  // 表面色 - 浅橄榄，代表树叶
  surface: '#E8E8E0',
  surfaceDark: '#D4D4CC',

  // 文字色 - 墨绿，代表文字的根基
  text: '#1A2F26',
  textSecondary: '#4A5A52',
  textLight: '#8A9A92',

  // 状态色
  success: '#5B8B6F',
  warning: '#D4A574',
  error: '#C45A5A',
  info: '#5A7B94',

  // 渐变
  gradients: {
    dawn: ['#E8DCC8', '#F5F1EB'], // 晨光
    forest: ['#1A2F26', '#2D4A3E'], // 森林深处
    earth: ['#C4A484', '#9A7B5C'], // 大地
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // 有机形态 - 非完美圆
  organic: [20, 28, 16, 24] as [number, number, number, number],
};

export const Shadows = {
  soft: {
    shadowColor: '#1A2F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: '#1A2F26',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};

// 有机形状 - 用于创建非完美几何的视觉效果
export const OrganicShapes = {
  // 叶子形态
  leaf: 'M0,50 C0,20 30,0 50,0 C70,0 100,20 100,50 C100,80 70,100 50,100 C30,100 0,80 0,50 Z',

  // 种子形态
  seed: 'M50,0 C70,0 100,30 100,50 C100,70 70,100 50,100 C30,100 0,70 0,50 C0,30 30,0 50,0 Z',

  // 波浪
  wave: 'M0,50 Q25,30 50,50 T100,50',
};
