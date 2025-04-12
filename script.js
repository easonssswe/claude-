document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成');
    
    // 初始化教程弹窗
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const startBtn = document.getElementById('start-btn');
    const helpBtn = document.getElementById('helpBtn');
    const progressStatus = document.getElementById('progress-status');
    const achievementPopup = document.getElementById('achievement-popup');
    const achievementTitle = document.getElementById('achievement-title');
    const achievementDesc = document.getElementById('achievement-desc');
    
    console.log('教程弹窗元素:', tutorialOverlay);
    console.log('开始按钮元素:', startBtn);
    
    // 每次打开都显示教程弹窗
    if (tutorialOverlay) {
        tutorialOverlay.style.display = 'flex';
        console.log('已设置教程弹窗为显示状态');
    } else {
        console.error('找不到教程弹窗元素，请检查HTML结构');
    }
    
    // 开始按钮点击事件
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('点击了开始按钮');
            tutorialOverlay.style.display = 'none';
        });
    } else {
        console.error('找不到开始按钮元素，请检查HTML结构');
    }
    
    // 帮助按钮点击事件
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            console.log('点击了帮助按钮');
            tutorialOverlay.style.display = 'flex';
        });
    } else {
        console.log('未找到帮助按钮');
    }
    
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
    
    // 检查设备是否支持所需的传感器
    if (window.DeviceOrientationEvent && window.DeviceMotionEvent) {
        // 添加横屏提示
        const rotateDevice = document.createElement('div');
        rotateDevice.className = 'rotate-device';
        rotateDevice.innerHTML = `
            <img src="rotate-icon.png" alt="旋转设备">
            <h2>请将设备横屏使用</h2>
            <p>为了获得最佳体验，请将您的设备旋转至横屏模式</p>
        `;
        document.body.appendChild(rotateDevice);
        
        // 其他传感器相关代码...
    }
});