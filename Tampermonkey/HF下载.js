// ==UserScript==
// @name         HF Download
// @name:zh      HF下载
// @namespace    https://idesigns.notion.site/275551b858cb474a908ce6d402639769?v=010feeeb5a1d4d55b98526fce9f2e180&pvs=4
// @namespace    https://x.com/aidesignss
// @namespace    https://github.com/idesign2018
// @namespace    https://github.com/idesign2018/Meta_IDesign/raw/master/QRCode/Discord-2.jpg?raw=true
// @version      2024-10-29
// @description  快速复制 Hugging Face 文件下载链接，如果遇到“复制”按钮没有显示，多刷新几次网页即可正常加载。专业从事AI绘画相关工作，进入我的主页共同交流
// @author       idesign
// @version      0.0.1
// @match        https://huggingface.co/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=huggingface.co
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    // 等待文件列表加载完成后运行脚本
    function init() {
        const targetNode = document.body; // 观察整个页面的变化
        const config = { childList: true, subtree: true };

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const fileRows = document.querySelectorAll('a[href*=".safetensors"], a[href*=".json"], a[href*=".txt"], a[href*=".md"], a[href*=".pt"], a[href*=".png"], a[href*=".model"], a[href*=".gitattributes"], a[href*=".jpg"], a[href*=".jpeg"], a[href*=".gif"]');
                    if (fileRows.length > 0) {
                        addCopyIcons(fileRows);
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    // 在每个文件下载链接右侧添加“复制”图标
    function addCopyIcons(fileRows) {
        fileRows.forEach((fileLink) => {
            // 检查是否已添加图标，避免重复
            if (fileLink.parentElement.querySelector('.copy-icon')) return;

            // 获取原始链接
            const originalUrl = fileLink.href;

            // 提取必要的部分以构建下载链接
            const urlParts = originalUrl.split('/');
            const user = urlParts[3];
            const repo = urlParts[4];
            const branch = urlParts[6]; // 这里假设 branch 总是在第 6 个位置
            const fileName = urlParts.slice(7).join('/'); // 获取文件路径（包括多级目录）

            // 构建下载链接
            let downloadLink = `https://huggingface.co/${user}/${repo}/resolve/${branch}/${fileName}`;
            if (!originalUrl.includes('?download=true')) {
                downloadLink += '?download=true';
            }

            // 获取目标 <div> 元素
            const targetDiv = fileLink.parentElement.querySelector('.ml-2.flex.h-5.w-5.items-center'); // 选择目标 <div>

            // 确认目标 <div> 是否成功选择
            if (!targetDiv) {
                console.error('目标 <div> 未找到');
                return;
            }


            // 创建“复制”图标
            const copyIcon = document.createElement('span');
            copyIcon.classList.add('copy-icon');
            copyIcon.title = '复制下载地址';

            // SVG 图标
            const svgIcon = `
               <svg xmlns="http://www.w3.org/2000/svg" width="auto" height="auto" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" fill-rule="evenodd" d="M11.097 3C9.725 3 8.613 4.131 8.613 5.527v2.068h-1.13C6.114 7.595 5 8.726 5 10.122v7.351C5 18.869 6.112 20 7.484 20h5.42c1.371 0 2.483-1.131 2.483-2.527v-2.068h1.13c1.37 0 2.483-1.131 2.483-2.527V5.527C19 4.131 17.888 3 16.516 3zm4.29 11.027h1.13c.623 0 1.128-.514 1.128-1.149V5.527c0-.634-.505-1.149-1.129-1.149h-5.42c-.623 0-1.128.515-1.128 1.149v2.068h2.935c1.372 0 2.484 1.131 2.484 2.527zm-9.032-3.905c0-.635.505-1.149 1.129-1.149h5.42c.623 0 1.128.514 1.128 1.149v7.351c0 .634-.505 1.149-1.129 1.149h-5.42a1.14 1.14 0 0 1-1.128-1.149z" clip-rule="evenodd"></path>
               </svg>
            `;

            // 设置 SVG 图标的样式
            copyIcon.innerHTML = svgIcon;
            copyIcon.style.cursor = 'pointer';
            copyIcon.style.marginLeft = '10px'; // 调整与目标 <div> 的间距
            copyIcon.style.width = '18px'; // 设置图标宽度
            copyIcon.style.height = '18px'; // 设置图标高度


            // 图标点击事件：复制链接到剪贴板并显示提示
            copyIcon.addEventListener('click', () => {
                navigator.clipboard.writeText(downloadLink).then(() => {
                    showTooltip('下载链接已复制到剪贴板');
                }).catch(err => {
                    console.error('复制失败', err);
                });
            });

            // 将 copyIcon 插入到目标 <div> 的右边
            targetDiv.insertAdjacentElement('afterend', copyIcon);
        });
    }

    // 显示复制成功提示的函数
    function showTooltip(message) {
        // 如果提示框已存在，先删除以避免重复
        const existingTooltip = document.querySelector('.copy-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // 创建提示框
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = message;

        // 设置提示框样式
        Object.assign(tooltip.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '5px',
            fontSize: '14px',
            zIndex: '1000',
            opacity: '1',
            transition: 'opacity 0.5s ease'
        });

        // 将提示框添加到页面上
        document.body.appendChild(tooltip);

        // 3秒后渐隐消失
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.remove();
            }, 500); // 等待渐隐动画结束后删除
        }, 3000); // 显示3秒
    }

    // 等待文件列表加载完成后运行脚本
    init();
})();
