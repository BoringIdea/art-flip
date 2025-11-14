# 黑色背景极简 UI 重构方案

本方案在 `docs/design-system.md` 的基础结构上，针对当前黑色背景的界面做了黑暗主题适配，保持极简、扁平、无装饰的风格，并以主题绿色作为唯一的高饱和点缀与分割线颜色。

## 1. 设计目标
- **保留基因**：保留现有黑色背景与粗线条层级，延续「硬朗、极简」的品牌气质。
- **提高可读性**：在深色背景上引入柔和的浅色文字与填充色，保证对比度（WCAG 4.5+）。
- **统一分割语言**：黑色边框改为主题绿色分割线，减少视觉噪音的同时保持严谨结构。
- **组件可复用**：所有组件沿用原文档的结构与命名，以最小心智成本迁移。

## 2. 视觉语言

### 2.1 颜色系统
```css
--color-background: #020202;    /* 纯黑背景（全局） */
--color-surface: #0D0D0D;       /* 模块背景，低对比层次 */
--color-surface-alt: #141414;   /* 悬浮/强调背景 */
--color-text-primary: #F5F5F5;  /* 主文字，保留加粗 */
--color-text-secondary: #CFCFCF;/* 次级文字/辅助信息 */
--color-divider: #16A34A;       /* 主题绿色，1px 分割线 */
--color-accent: #22C55E;        /* 高亮/按钮填充 */
--color-danger: #FB7185;        /* 错误状态，保留纯色块 */
--color-warning: #FACC15;
--color-success: #16A34A;       /* 同主题色，语义一致 */
```

**使用规则**：
- 文字仍默认 `font-bold`，但根据层级切换 `text-primary`/`text-secondary`，避免纯黑在黑底不可读。
- 所有分割线、边框统一使用 `border-divider`（主题绿色），宽度 1px；重点结构可用 2px。
- 背景分层最多两层：`background`（全局）、`surface`（容器）、`surface-alt`（悬停/聚焦）。

### 2.2 排版
- 继续使用无衬线字体与加粗区分层级，字号不变。
- 标题 `text-primary font-bold uppercase tracking-tight`，正文 `text-primary font-medium`。
- 长段文字增加最大宽度（72ch），避免黑底阅读疲劳。

## 3. 布局与网格
- 页面仍使用 12 列网格，但列间距改为 24px，减少黑底下的拥挤感。
- 模块之间的垂直间距：`32px`（主模块） / `24px`（同级模块）。
- 背景和模块之间通过绿色分割线或 16px 的内边距区隔，避免再额外叠加阴影。

## 4. 组件适配

### 4.1 Card / Panel
```tsx
className="bg-surface text-primary border border-divider rounded-none"
<CardHeader className="border-b border-divider px-6 py-4 bg-background/40" />
<CardTitle className="text-lg font-bold text-primary" />
<CardContent className="px-6 py-4 text-secondary" />
```
- 默认背景 `surface`，在黑底中形成轻微层次；hover 状态切换为 `surface-alt`。
- 切换原来的黑色边框为绿色，保证与背景区分。

### 4.2 按钮
| 变体 | 背景 | 文字 | 边框 | Hover |
| --- | --- | --- | --- | --- |
| Primary | `bg-accent` | `text-black` | `border-divider` | `bg-[#1FB455]` |
| Secondary | `bg-transparent` | `text-primary` | `border-divider` | `bg-surface-alt` |
| Ghost | `bg-transparent` | `text-secondary` | `border-transparent` | `text-primary` |
| Danger | `bg-danger` | `text-black` | `border-danger` | `bg-[#F43F5E]` |

Focus ring 继续使用 `ring-2 ring-divider offset-2 offset-background`，突出绿色品牌线。

### 4.3 输入类组件
```tsx
className="bg-surface-alt text-primary border border-divider rounded-none focus:ring-2 focus:ring-divider focus:border-divider"
label="text-xs font-bold text-secondary uppercase"
```
- 输入背景稍亮以强调可写性；placeholder 使用 secondary 色且保持加粗。
- 错误态：`border-danger text-danger focus:ring-danger`。

### 4.4 Table
- 表头：`bg-background text-primary border-b-2 border-divider uppercase text-xs tracking-[0.08em]`.
- 行分割：`divide-y divide-divider`，奇偶行均保持纯黑，hover 改为 `bg-surface-alt`.
- 选中行：前置 2px 绿色竖条（伪元素）替代整行高亮，保持极简。

### 4.5 导航 / Sidebar
- 背景 `bg-background`，模块分割使用 `border-b border-divider`.
- 激活态链接添加 `text-accent` + 左侧 2px 绿色竖条。
- 折叠面板使用 `surface` 背景，嵌套项通过 16px 缩进展示层级。

### 4.6 模态 / 抽屉
- 覆盖层 `bg-black/70`，内容容器 `bg-surface` + `border border-divider`.
- 顶部标题 `text-primary font-bold text-xl`，关闭按钮使用 ghost 变体。

### 4.7 状态与反馈
- Toast / Banner 采用全宽条，底部 2px 绿色或对应语义色，取消阴影。
- Tag / Badge：深色背景 + 绿色描边，文本保持大写。

## 5. 交互与动效
- 仍禁用阴影与渐变，所有动效采用 150ms 以内的淡入淡出或位移。
- Hover 只允许背景轻微提亮、文字提亮或添加绿色描边；禁止放大、发光。
- Focus 必须由绿色描边或 ring 表示，键盘可见性优先。

## 6. 无障碍与对比
- 所有文本与背景对比度 ≥ 4.5:1，绿色线条与背景 ≥ 3:1。
- 大面积绿色只用于强调区域，避免与成功语义冲突；若需语义表达，搭配图标或文本。
- 图表需提供暗色调色板，并保留绿色作为主数据线。

## 7. 迁移策略
1. **Token 层**：在 `tailwind.config.js` 或 CSS 变量中引入新的颜色变量，替换旧的白底 token。
2. **Layout 层**：统一容器背景类名（`bg-surface`），用 `border-divider` 替换 `border-black`。
3. **组件层**：逐个组件替换颜色、hover、focus 样式，保留原有结构与命名。
4. **页面层**：复查所有页面的间距、分割线与文本颜色，确保未遗留白底样式。

## 8. 验收清单
- [ ] 页面背景全部为 `bg-background`，无残留白色卡片。
- [ ] 所有分割线/边框使用 `border-divider`（主题绿色）。
- [ ] 文字默认 `text-primary font-bold`，无 `text-black`。
- [ ] Hover/Focus 仅使用亮度变化或绿色描边，无阴影。
- [ ] 组件在浅色/深色模式下的 token 可独立切换，为未来主题扩展做准备。

---

**最后更新**：2025-02-15
