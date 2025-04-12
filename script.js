// 在文件开头添加以下代码
document.addEventListener('DOMContentLoaded', function() {
    // 初始化教程和帮助按钮
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const startBtn = document.getElementById('start-btn');
    const helpBtn = document.getElementById('helpBtn');
    const progressStatus = document.getElementById('progress-status');
    const achievementPopup = document.getElementById('achievement-popup');
    const achievementTitle = document.getElementById('achievement-title');
    const achievementDesc = document.getElementById('achievement-desc');
    
    // 确保元素存在
    if (!tutorialOverlay || !startBtn || !helpBtn) {
        console.error('找不到必要的DOM元素');
        return;
    }
    
    // 显示教程弹窗
    tutorialOverlay.style.display = 'flex';
    
    // 开始按钮点击事件
    startBtn.addEventListener('click', function() {
        tutorialOverlay.style.display = 'none';
    });
    
    // 帮助按钮点击事件
    helpBtn.addEventListener('click', function() {
        tutorialOverlay.style.display = 'flex';
    });
    
    // 显示成就弹窗函数
    window.showAchievement = function(title, desc) {
        if (!achievementPopup || !achievementTitle || !achievementDesc) {
            console.error('找不到成就弹窗元素');
            return;
        }
        
        achievementTitle.textContent = title;
        achievementDesc.textContent = desc;
        achievementPopup.classList.add('show');
        
        setTimeout(() => {
            achievementPopup.classList.remove('show');
        }, 3000);
    };
    
    // 更新进度状态提示
    window.updateProgressStatus = function(percent) {
        if (!progressStatus) {
            console.error('找不到进度状态元素');
            return;
        }
        
        if (percent < 10) {
            progressStatus.textContent = "准备开始";
            progressStatus.style.color = "#555";
        } else if (percent < 40) {
            progressStatus.textContent = "上举中...";
            progressStatus.style.color = "#4CAF50";
        } else if (percent < 80) {
            progressStatus.textContent = "继续上举!";
            progressStatus.style.color = "#FFC107";
        } else {
            progressStatus.textContent = "即将到顶点!";
            progressStatus.style.color = "#F44336";
        }
    };
    
    // 测试成就弹窗
    setTimeout(() => {
        window.showAchievement("欢迎使用", "开始您的训练吧！");
    }, 1000);
});