# 设计系统 - 通用样式规则

本文档定义了前端界面的通用设计规则和样式规范，适用于所有页面和组件。

## 1. 核心设计原则

### 1.1 视觉风格
- **基调**：白色背景 + 黑色主字体，极简扁平风格
- **风格**：极简、扁平化，使用黑色边框（1px）替代灰色阴影和分隔线
- **装饰**：不添加圆角、阴影或渐变效果
- **层级**：通过黑色线条和加粗字体区分层级

### 1.2 排版原则
- **字体权重**：使用加粗字体（`font-bold`）区分层级
- **标题**：所有标题和卡片头部使用加粗黑色字体
- **正文**：正文也采用加粗字体以保持一致性
- **颜色**：主要文字使用黑色（`text-black`），减少灰色文字的使用

## 2. 颜色系统

### 2.1 主色调
```css
/* 主要颜色 */
--color-primary: #000000;      /* 黑色 - 主文字、边框、强调 */
--color-background: #FFFFFF;   /* 白色 - 背景 */
--color-text: #000000;         /* 黑色 - 主要文字 */

/* 状态颜色 */
--color-success: #16A34A;      /* 绿色 - 成功状态 */
--color-danger: #991B1B;       /* 红色 - 错误/危险状态 */
--color-warning: #CA8A04;      /* 黄色 - 警告状态 */
--color-info: #2563EB;         /* 蓝色 - 信息状态 */

/* 辅助颜色 */
--color-gray-100: #F3F4F6;     /* 浅灰 - 悬停背景 */
--color-gray-800: #1F2937;     /* 深灰 - 次要文字 */
--color-red-800: #991B1B;      /* 深红 - 错误文字 */
```

### 2.2 使用规则
- **主要文字**：`text-black`（黑色）
- **辅助文字**：`text-black font-bold`（黑色加粗，而非灰色）
- **错误信息**：`text-red-800 font-bold`（深红色加粗）
- **成功状态**：`text-green-700`（绿色）
- **警告状态**：`text-yellow-700`（黄色）

## 3. 边框与分割

### 3.1 边框规范
- **所有组件**：使用黑色边框（`border border-black`）
- **边框宽度**：1px（默认）或 2px（表头、重要分割）
- **无圆角**：所有组件使用 `rounded-none`
- **无阴影**：不使用 `shadow` 类

### 3.2 分割线规范
- **侧边栏分割**：`border-r border-black`
- **顶部栏分割**：`border-b border-black`
- **表格分隔线**：`divide-y divide-black` 或 `border-b border-black`
- **卡片边框**：`border border-black`
- **表头底部**：`border-b-2 border-black`（2px 黑色边框）

## 4. 组件样式规范

### 4.1 Card（卡片）
```tsx
// 基础样式
className="border border-black bg-white rounded-none"

// 结构
<Card>
  <CardHeader className="border-b border-black px-6 py-4">
    <CardTitle className="text-lg font-bold text-black">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="px-6 py-4">
    {/* Content */}
  </CardContent>
</Card>
```

**规范**：
- 容器：`border border-black bg-white rounded-none`
- 头部：`border-b border-black px-6 py-4`
- 标题：`text-lg font-bold text-black`
- 内容区：`px-6 py-4`

### 4.2 Button（按钮）
```tsx
// 基础样式
className="border border-black rounded-none font-bold"

// 变体
// Primary: bg-black text-white hover:bg-gray-800
// Secondary: bg-white text-black hover:bg-gray-100
// Danger: bg-red-800 text-white hover:bg-red-900
// Ghost: bg-transparent text-black hover:bg-gray-100
```

**规范**：
- 基础：`border border-black rounded-none font-bold`
- Primary：`bg-black text-white hover:bg-gray-800`
- Secondary：`bg-white text-black border border-black hover:bg-gray-100`
- Danger：`bg-red-800 text-white hover:bg-red-900`
- Ghost：`bg-transparent text-black hover:bg-gray-100`
- Focus：`focus:ring-2 focus:ring-black`

### 4.3 Input/Select（输入框/选择框）
```tsx
// 基础样式
className="border border-black bg-white rounded-none font-bold focus:ring-2 focus:ring-black focus:border-black"

// 标签
<label className="text-sm font-bold text-black">
  Label
</label>
```

**规范**：
- 容器：`border border-black bg-white rounded-none font-bold`
- 标签：`text-sm font-bold text-black`
- Focus：`focus:ring-2 focus:ring-black focus:border-black`
- 错误状态：`border-red-800 focus:ring-red-800`
- 辅助文字：`text-black font-bold`

### 4.4 Table（表格）
```tsx
// 基础样式
className="divide-y divide-black"

// 表头
<TableHead className="bg-white border-b-2 border-black text-xs font-bold text-black uppercase">
  Header
</TableHead>

// 单元格
<TableCell className="text-sm text-black">
  Content
</TableCell>
```

**规范**：
- 分隔线：`divide-y divide-black`
- 表头：`bg-white border-b-2 border-black`
- 表头文字：`text-xs font-bold text-black uppercase`
- 单元格：`text-sm text-black`
- 行悬停：`hover:bg-gray-100`
- 行边框：`border-b border-black`

### 4.5 Badge（标签）
```tsx
// 基础样式
className="border border-black rounded-none text-xs font-bold"

// 变体（保持背景色，添加黑色边框和加粗字体）
// Success: bg-green-100 text-green-700 border border-black
// Danger: bg-red-100 text-red-700 border border-black
// Warning: bg-yellow-100 text-yellow-700 border border-black
```

**规范**：
- 基础：`border border-black rounded-none text-xs font-bold`
- 所有变体都添加黑色边框和加粗字体
- 背景色保持不变，但添加 `border border-black`

### 4.6 Tabs（页签）
```tsx
// 容器
className="border border-black bg-white rounded-none"

// 激活状态
className="bg-black text-white font-bold"

// 未激活状态
className="text-black hover:bg-gray-100 font-bold"
```

**规范**：
- 容器：`border border-black bg-white rounded-none`
- 激活状态：`bg-black text-white font-bold`
- 未激活：`text-black hover:bg-gray-100 font-bold`
- Focus：`focus-visible:ring-2 focus-visible:ring-black`

### 4.7 Status Indicator（状态指示器）
```tsx
// 方形状态指示器
className="h-3 w-3 border border-black rounded-none"

// 状态颜色
// Success: bg-green-500
// Danger: bg-red-500
// Warning: bg-yellow-500
// Info: bg-blue-500
```

**规范**：
- 形状：方形（`rounded-none`）
- 边框：`border border-black`
- 尺寸：`h-3 w-3` 或 `h-2 w-2`
- 状态颜色：使用背景色，保持黑色边框

### 4.8 Modal（模态框）
```tsx
// 容器
className="border border-black bg-white rounded-none"

// 头部
className="border-b border-black px-6 py-4"

// 内容区
className="px-6 py-4"

// 底部操作区
className="border-t border-black px-6 py-4"
```

**规范**：
- 容器：`border border-black bg-white rounded-none`
- 头部：`border-b border-black`
- 内容区：标准 padding
- 底部：`border-t border-black`

## 5. 布局规范

### 5.1 侧边栏（Sidebar）
```tsx
className="w-56 border-r border-black bg-white"
```

**规范**：
- 宽度：`w-56`（224px）
- 右边框：`border-r border-black`
- 背景：`bg-white`
- 导航链接激活：`bg-black text-white border border-black`
- 导航链接未激活：`text-black font-bold`

### 5.2 顶部栏（Header）
```tsx
className="h-16 border-b border-black bg-white"
```

**规范**：
- 高度：`h-16`（64px）
- 底部边框：`border-b border-black`
- 背景：`bg-white`
- 标题：`font-bold text-black`

### 5.3 主内容区（Main）
```tsx
className="bg-white"
```

**规范**：
- 背景：`bg-white`
- 与侧边栏和 Header 的分割使用黑色线条

## 6. 间距规范

### 6.1 内边距（Padding）
- **卡片内容**：`px-6 py-4`
- **卡片头部**：`px-6 py-4`
- **表格单元格**：`px-4 py-3`
- **按钮**：`px-4 py-2`（sm）或 `px-6 py-3`（md）

### 6.2 外边距（Margin）
- **卡片间距**：`gap-4` 或 `gap-6`
- **组件间距**：`space-y-4` 或 `space-y-6`
- **网格间距**：`gap-4` 或 `gap-6`

## 7. 字体规范

### 7.1 字体大小
- **超大标题**：`text-3xl font-bold text-black`
- **大标题**：`text-2xl font-bold text-black`
- **标题**：`text-xl font-bold text-black`
- **副标题**：`text-lg font-bold text-black`
- **正文**：`text-sm font-bold text-black`
- **小字**：`text-xs font-bold text-black`

### 7.2 字体权重
- **所有文字**：使用 `font-bold`（加粗）
- **强调**：通过颜色和大小区分，而非字体权重

## 8. 交互状态

### 8.1 悬停（Hover）
- **按钮**：`hover:bg-gray-100`（浅灰背景）
- **链接**：`hover:bg-gray-100`
- **表格行**：`hover:bg-gray-100`
- **Primary 按钮**：`hover:bg-gray-800`

### 8.2 焦点（Focus）
- **输入框**：`focus:ring-2 focus:ring-black focus:border-black`
- **按钮**：`focus:ring-2 focus:ring-black`
- **链接**：`focus-visible:ring-2 focus-visible:ring-black`

### 8.3 激活（Active）
- **页签激活**：`bg-black text-white`
- **导航激活**：`bg-black text-white border border-black`

## 9. 响应式设计

### 9.1 断点
- **移动端**：`< 768px`（sm）
- **平板**：`768px - 1024px`（md）
- **桌面**：`> 1024px`（lg）

### 9.2 布局调整
- **桌面端**：双栏/三栏布局
- **平板**：单栏卡片式展示
- **移动端**：聚焦核心指标与告警

## 10. 可访问性

### 10.1 键盘导航
- 所有交互元素支持键盘导航
- Focus 状态使用黑色 ring（`focus:ring-2 focus:ring-black`）

### 10.2 屏幕阅读器
- 关键操作按钮遵循 WAI-ARIA 标准
- 使用语义化 HTML 标签

### 10.3 对比度
- 黑色文字在白色背景上（高对比度）
- 状态颜色使用深色变体以确保可读性

## 11. 使用示例

### 11.1 创建新卡片
```tsx
<Card className="border border-black bg-white rounded-none">
  <CardHeader className="border-b border-black px-6 py-4">
    <CardTitle className="text-lg font-bold text-black">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent className="px-6 py-4">
    <p className="text-sm font-bold text-black">
      Card content
    </p>
  </CardContent>
</Card>
```

### 11.2 创建新按钮
```tsx
<Button 
  variant="primary"
  className="border border-black rounded-none font-bold bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black"
>
  Primary Button
</Button>
```

### 11.3 创建新表格
```tsx
<Table className="divide-y divide-black">
  <TableHeader>
    <TableRow>
      <TableHead className="bg-white border-b-2 border-black text-xs font-bold text-black uppercase">
        Header
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-gray-100 border-b border-black">
      <TableCell className="text-sm text-black">
        Content
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 12. Tailwind CSS 配置建议

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 确保黑色和白色可用
        black: '#000000',
        white: '#FFFFFF',
      },
      borderRadius: {
        // 禁用圆角
        none: '0',
      },
      boxShadow: {
        // 不使用阴影
        none: 'none',
      },
    },
  },
}
```

## 13. 快速参考

### 13.1 常用类名组合

**卡片容器**：
```
border border-black bg-white rounded-none
```

**按钮基础**：
```
border border-black rounded-none font-bold
```

**输入框基础**：
```
border border-black bg-white rounded-none font-bold focus:ring-2 focus:ring-black
```

**表格基础**：
```
divide-y divide-black
```

**表头**：
```
bg-white border-b-2 border-black text-xs font-bold text-black uppercase
```

**文字基础**：
```
text-black font-bold
```

### 13.2 禁止使用的样式
- ❌ `rounded-*`（除了 `rounded-none`）
- ❌ `shadow-*`
- ❌ `text-gray-*`（使用 `text-black` 替代）
- ❌ 渐变背景
- ❌ 圆角边框

## 14. 检查清单

创建新组件时，请确保：
- ✅ 使用黑色边框（`border border-black`）
- ✅ 无圆角（`rounded-none`）
- ✅ 无阴影
- ✅ 文字使用加粗（`font-bold`）
- ✅ 主要文字使用黑色（`text-black`）
- ✅ Focus 状态使用黑色 ring
- ✅ 悬停状态使用浅灰背景
- ✅ 状态指示器使用方形（无圆角）

---

**最后更新**：2025-02-14

