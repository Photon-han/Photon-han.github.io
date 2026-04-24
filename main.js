document.addEventListener('DOMContentLoaded', () => {
    // ----- 简单但够用的 Markdown 解析器（不需要外部库）-----
    function simpleMarkdownToHtml(md) {
        const escapeHtml = (text) => {
            return text.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        };

        let lines = md.split(/\r?\n/);
        let html = '';
        let inBlockquote = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
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
            if (line.startsWith('> ')) {
                if (!inBlockquote) {
                    html += '<blockquote>\n';
                    inBlockquote = true;
                }
                html += `<p>${escapeHtml(line.slice(2))}</p>\n`;
                continue;
            } else if (inBlockquote && line.trim() === '') {
                html += '<br/>\n';
                continue;
            } else if (inBlockquote) {
                html += '</blockquote>\n';
                inBlockquote = false;
            }
            if (line.trim() === '---') {
                html += '<hr/>\n';
                continue;
            }
            if (line.trim() === '') {
                continue;
            }
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

    // ----- 小说加载逻辑 -----
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
                contentDiv.innerHTML = `<p style="color: #b66;">❌ 加载失败：${err.message}<br>文件路径：${mdFile}</p>`;
                console.error(err);
            }
        });
    });
});
