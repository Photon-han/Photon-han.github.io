document.addEventListener('DOMContentLoaded', () => {
    // ----- 一个简单但够用的 Markdown 解析器 -----
    function simpleMarkdownToHtml(md) {
        // 转义 HTML 特殊字符（防止注入）
        const escapeHtml = (text) => {
            return text.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
                return c;
            });
        };

        let lines = md.split(/\r?\n/);
        let html = '';
        let inBlockquote = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // 处理标题 #
            if (line.startsWith('# ')) {
                if (inBlockquote) { html += '</blockquote>\n'; inBlockquote = false; }
                html += `<h1>${escapeHtml(line.slice(2))}</h1>\n`;
                continue;
            }
            if (line.startsWith('## ')) {
                if (inBlockquote) { html += '</blockquote>\n'; inBlockquote = false; }
                html += `<h2>${escapeHtml(line.slice(3))}</h2>\n`;
                continue;
            }
            if (line.startsWith('### ')) {
                if (inBlockquote) { html += '</blockquote>\n'; inBlockquote = false; }
                html += `<h3>${escapeHtml(line.slice(4))}</h3>\n`;
                continue;
            }
            // 处理引用块 >
            if (line.startsWith('> ')) {
                if (!inBlockquote) {
                    html += '<blockquote>\n';
                    inBlockquote = true;
                }
                html += `<p>${escapeHtml(line.slice(2))}</p>\n`;
                continue;
            } else if (inBlockquote && line.trim() === '') {
                // 引用块内的空行保持原样（作为段落间隔）
                html += '<br/>\n';
                continue;
            } else if (inBlockquote) {
                // 退出引用块
                html += '</blockquote>\n';
                inBlockquote = false;
                // 继续处理当前行（可能是一段普通文本）
            }
            // 处理分割线 ---
            if (line.trim() === '---') {
                html += '<hr/>\n';
                continue;
            }
            // 处理普通段落（忽略空行）
            if (line.trim() === '') {
                continue;
            }
            // 处理行内格式：**粗体** 和 *斜体*
            let text = escapeHtml(line);
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            html += `<p>${text}</p>\n`;
        }
        if (inBlockquote) {
            html += '</blockquote>\n';
        }
        return html;
    }

    // ----- 小说加载逻辑（仍然使用 fetch 读取 .md 文件）-----
    const listItems = document.querySelectorAll('#novel-list li');
    const contentDiv = document.getElementById('novel-content');

    listItems.forEach(item => {
        item.addEventListener('click', async () => {
            const mdFile = item.getAttribute('data-file');
            if (!mdFile) return;
            try {
                const response = await fetch(mdFile);
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const mdText = await response.text();
                const html = simpleMarkdownToHtml(mdText);
                contentDiv.innerHTML = html;
            } catch (err) {
                contentDiv.innerHTML = `<p style="color: #b66;">❌ 加载失败：${err.message}<br>请检查文件路径：${mdFile}</p>`;
                console.error(err);
            }
        });
    });
});
