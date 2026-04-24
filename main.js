document.addEventListener('DOMContentLoaded', () => {
    const listItems = document.querySelectorAll('#novel-list li');
    const contentDiv = document.getElementById('novel-content');

    listItems.forEach(item => {
        item.addEventListener('click', async () => {
            const mdFile = item.getAttribute('data-file');
            if (!mdFile) return;
            try {
                const response = await fetch(mdFile);
                if (!response.ok) throw new Error('加载失败');
                const mdText = await response.text();
                const html = marked.parse(mdText);
                contentDiv.innerHTML = html;
            } catch (err) {
                contentDiv.innerHTML = '<p style="color: #b66;">❌ 加载失败，请检查文件路径</p>';
                console.error(err);
            }
        });
    });
});
