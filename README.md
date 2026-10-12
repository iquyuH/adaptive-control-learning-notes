# 自适应控制学习笔记

双击 `index.html`，即可离线打开。完整复制本文件夹即可迁移；公式、图片、PDF 与脚本均在本地。所有资料均可离线访问。

当前仅整理第二单元。网页包含理论、逐步推导、六题复算、可复现实验、易错点与原始资料。这里的仿真不是设备实测。

## 内容与页面分离

- `content/chapters.json`：章节注册表与章内折叠目录。
- `content/home.html`：首页内容。
- `content/chapter2.html`：第二章正文的唯一编辑来源。
- `content/exercise-sheet.html`：浏览器可读的习题原件页。
- `templates/page.html`：共享页面框架。
- `assets/css/style.css`：共享样式，含手机与打印布局。
- `assets/js/app.js`：打印和折叠内容处理。
- `assets/js/numerics.js`：独立于页面的数值模型。
- `assets/js/lab.js`：绘图与实验交互。
- `assets/vendor/mathjax/`：本地 MathJax 与原许可证。
- `sources/`：课件、题面、去除个人信息的作业答案及习题预览图。
- `index.html`、`chapters/*.html`：生成结果，不作为日常编辑源。

## 更新正文

在本目录执行（Python 仅用于生成页面，阅读时不需要）：

```powershell
uv run python scripts/build.py
node scripts/verify-math.cjs
node scripts/verify-site.cjs
```

生成器只依赖 Python 标准库；数学验证只依赖 Node.js 标准库，不需要安装项目依赖。请在改动数学模型后运行验证。

## 添加后续章节

新建 `content/chapter3.html`，按第二章的 section 结构填写；在 `content/chapters.json` 添加唯一 id、标题、文件名和 section 锚点；运行生成器即可自动更新首页。不要提前添加空白章节。

章内链接统一用相对路径；数学公式使用 `\(...\)` 与 `\[...\]`；图片与 PDF 放入 `sources/`，不引用临时目录。新增章节若不需要实验脚本，应在生成器中按章节配置脚本（当前实验仅挂载在含 `variance-lab` 的页面）。

每处来源写清 PPT 页码或题号。遇到原稿错误，保留原始资料，在正文注明更正理由与适用条件。后续章节不要改动第二章的时间索引、公式命名或已核对的结果，除非有新的证据。

## 数学与资料核对

题 4、5 按两步性能指标解释；原题面印为一步指标，正文已说明两者的不一致。题 5 手写控制律负号与稳定范围精度已修正。题 1 根模不等式表述、课件第 26 页多项式乘法也已注明。

离线实验采用确定性伪随机种子，比较相同噪声驱动的两个系统；默认预热 500 拍，统计 10,000 拍。CSV 导出包含元数据和统计标记。交互实验的计算在浏览器本地完成。

## 验证

`scripts/verify-math.cjs` 检查丢番图恒等式、控制律分母展开、稳定范围边界、20 万样本方差和可重复性。实际打开后还应检查公式渲染、习题预览与资料链接、移动端、打印、互动和控制台错误。

MathJax 复用自用户指定的离线教程并保留原许可证。
