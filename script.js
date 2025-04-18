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
            <img src="rotate-icon.gif" alt="旋转设备">
            <h2>请将设备横屏使用</h2>
            <p>为了获得最佳体验，请将您的设备旋转至横屏模式</p>
        `;
        document.body.appendChild(rotateDevice);
        
        // 监听屏幕方向变化
        window.addEventListener('orientationchange', function() {
            if (window.orientation === 90 || window.orientation === -90) {
                rotateDevice.style.display = 'none';
                // 屏幕方向变化时重置校准
                initialBeta = null;
                initialGamma = null;
                isCalibrated = false;
                setProgress(0);
            } else {
                rotateDevice.style.display = 'flex';
            }
        });
        
        // 初始检查
        if (window.orientation === 90 || window.orientation === -90) {
            rotateDevice.style.display = 'none';
        }
        
        // 初始化变量
        let initialBeta = null;
        let initialGamma = null;
        let isCalibrated = false;
        let currentProgress = 0;
        let repCount = 0;
        let isRising = false;
        let isLowering = false;
        let maxAngle = 0;
        let minAngle = 90;
        let startTime = null;
        let endTime = null;
        let angleReadings = [];
        let timeReadings = [];
        let isCompleted = false;
        
        // 获取DOM元素
        const resetBtn = document.getElementById('resetBtn');
        const progressRing = document.querySelector('.progress-ring-circle');
        const progressText = document.getElementById('progress-text');
        const repCountElement = document.getElementById('repCount');
        const feedbackContent = document.getElementById('feedbackContent');
        
        // 设置进度环的周长
        const circle = document.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        // 更新进度环
        function setProgress(percent) {
            // 确保百分比在0-100之间
            percent = Math.min(100, Math.max(0, percent));
            
            // 计算stroke-dashoffset值
            const offset = circumference * (1 - percent / 100);
            progressRing.style.strokeDashoffset = offset;
            progressText.textContent = `${Math.round(percent)}%`;
            currentProgress = percent;
            
            // 根据进度更新颜色
            if (percent < 30) {
                progressRing.style.stroke = '#4CAF50'; // 绿色
            } else if (percent < 70) {
                progressRing.style.stroke = '#FFC107'; // 黄色
            } else {
                progressRing.style.stroke = '#F44336'; // 红色
            }
            
            // 更新进度状态文本
            if (progressStatus) {
                updateProgressStatus(percent);
            }
        }
        
        // 重置按钮点击事件
        resetBtn.addEventListener('click', function() {
            initialBeta = null;
            initialGamma = null;
            isCalibrated = false;
            setProgress(0);
            feedbackContent.textContent = '请完成一次动作以获取分析';
            alert('位置已重置，请保持手臂伸直，然后点击确定');
        });
        
        // 震动函数
        function vibrate(duration) {
            if (navigator.vibrate) {
                navigator.vibrate(duration);
            }
        }
        
        // 分析动作
        function analyzeMovement() {
            // 计算速度一致性
            let speedConsistency = calculateSpeedConsistency();
            
            // 检查是否有离心控制
            let hasEccentricControl = checkEccentricControl();
            
            // 检查动作范围
            let fullRangeOfMotion = maxAngle >= 70;
            
            // 生成反馈
            let feedback = '';
            
            if (speedConsistency > 0.8 && hasEccentricControl && fullRangeOfMotion) {
                feedback = '完美！您的动作非常标准，速度均匀，有良好的离心控制，并且完成了完整的动作范围。';
                // 显示成就
                showAchievement("完美动作!", "您的动作非常标准");
            } else {
                feedback = '您的动作完成得不错！以下是一些改进建议：\n';
                
                if (speedConsistency <= 0.8) {
                    feedback += '- 尝试保持更均匀的速度，避免忽快忽慢。\n';
                }
                
                if (!hasEccentricControl) {
                    feedback += '- 下放时控制更慢一些，增强离心控制。\n';
                }
                
                if (!fullRangeOfMotion) {
                    feedback += '- 尝试增加动作幅度，确保完成完整的弯举动作。\n';
                }
                
                // 显示成就
                if (speedConsistency > 0.6 || hasEccentricControl || fullRangeOfMotion) {
                    showAchievement("动作完成!", "还有改进空间");
                } else {
                    showAchievement("动作已记录", "请查看分析建议");
                }
            }
            
            feedbackContent.textContent = feedback;
        }
        
        // 计算速度一致性
        function calculateSpeedConsistency() {
            if (angleReadings.length < 3 || timeReadings.length < 3) return 0;
            
            let speeds = [];
            for (let i = 1; i < angleReadings.length; i++) {
                let angleChange = Math.abs(angleReadings[i] - angleReadings[i-1]);
                let timeChange = timeReadings[i] - timeReadings[i-1];
                speeds.push(angleChange / timeChange);
            }
            
            // 计算平均速度
            let avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
            
            // 计算速度变化的标准差
            let variance = speeds.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / speeds.length;
            let stdDev = Math.sqrt(variance);
            
            // 计算变异系数 (CV)
            let cv = stdDev / avgSpeed;
            
            // 返回一致性得分 (1 - CV，限制在0-1之间)
            return Math.max(0, Math.min(1, 1 - cv));
        }
        
        // 检查离心控制
        function checkEccentricControl() {
            if (angleReadings.length < 5) return false;
            
            // 找到最高点的索引
            let peakIndex = angleReadings.indexOf(Math.max(...angleReadings));
            
            // 如果没有明显的上升和下降阶段，返回false
            if (peakIndex < 2 || peakIndex > angleReadings.length - 3) return false;
            
            // 计算上升和下降阶段的平均速度
            let risingPhase = [];
            for (let i = 1; i <= peakIndex; i++) {
                let angleChange = angleReadings[i] - angleReadings[i-1];
                let timeChange = timeReadings[i] - timeReadings[i-1];
                risingPhase.push(angleChange / timeChange);
            }
            
            let loweringPhase = [];
            for (let i = peakIndex + 1; i < angleReadings.length; i++) {
                let angleChange = angleReadings[i] - angleReadings[i-1];
                let timeChange = timeReadings[i] - timeReadings[i-1];
                loweringPhase.push(angleChange / timeChange);
            }
            
            let avgRisingSpeed = Math.abs(risingPhase.reduce((a, b) => a + b, 0) / risingPhase.length);
            let avgLoweringSpeed = Math.abs(loweringPhase.reduce((a, b) => a + b, 0) / loweringPhase.length);
            
            // 如果下降速度明显慢于上升速度，说明有离心控制
            return avgLoweringSpeed < avgRisingSpeed * 0.8;
        }
        
        // 获取调整后的传感器数据
        function getAdjustedSensorData(event) {
            // 根据屏幕方向调整传感器数据
            let adjustedBeta = event.beta;
            let adjustedGamma = event.gamma;
            
            // 横屏模式下交换beta和gamma的角色
            if (window.orientation === 90) {
                // 右侧横屏
                adjustedBeta = event.gamma;
                adjustedGamma = -event.beta;
            } else if (window.orientation === -90) {
                // 左侧横屏
                adjustedBeta = -event.gamma;
                adjustedGamma = event.beta;
            }
            
            return { beta: adjustedBeta, gamma: adjustedGamma };
        }
        
        // 设备方向变化事件
        window.addEventListener('deviceorientation', function(event) {
            // 获取根据屏幕方向调整后的传感器数据
            const adjustedData = getAdjustedSensorData(event);
            
            if (!isCalibrated && adjustedData.beta !== null && adjustedData.gamma !== null) {
                initialBeta = adjustedData.beta;
                initialGamma = adjustedData.gamma;
                isCalibrated = true;
                return;
            }
            
            if (isCalibrated && repCount < 3) {
                // 计算角度变化
                let betaDiff = adjustedData.beta - initialBeta;
                let gammaDiff = adjustedData.gamma - initialGamma;
                
                // 根据屏幕方向选择正确的轴来检测二头弯举动作
                let angle;
                if (window.orientation === 0 || window.orientation === 180) {
                    // 竖屏模式 - 使用beta（前后倾斜）
                    angle = Math.abs(betaDiff);
                } else {
                    // 横屏模式 - 使用beta（实际上是调整后的gamma）
                    angle = Math.abs(betaDiff);
                }
                
                // 记录角度和时间
                if (!isCompleted) {
                    angleReadings.push(angle);
                    timeReadings.push(Date.now());
                }
                
                // 更新最大和最小角度
                maxAngle = Math.max(maxAngle, angle);
                minAngle = Math.min(minAngle, angle);
                
                // 计算进度百分比 (假设最大角度为90度)
                let percent = Math.min(100, (angle / 90) * 100);
                setProgress(percent);
                
                // 检测动作阶段
                if (angle > 60 && !isRising && !isLowering) {
                    isRising = true;
                    startTime = Date.now();
                }
                
                if (angle > 70 && isRising && !isLowering) {
                    isRising = false;
                    isLowering = true;
                    vibrate(100); // 到达顶点时震动
                }
                
                if (angle < 20 && !isRising && isLowering) {
                    isLowering = false;
                    isCompleted = true;
                    endTime = Date.now();
                    
                    // 完成一次动作
                    repCount++;
                    repCountElement.textContent = repCount;
                    vibrate(200); // 完成动作时震动
                    
                    // 分析动作
                    analyzeMovement();
                    
                    // 重置动作变量，准备下一次
                    setTimeout(() => {
                        isCompleted = false;
                        maxAngle = 0;
                        minAngle = 90;
                        angleReadings = [];
                        timeReadings = [];
                        
                        if (repCount >= 3) {
                            // 完成所有动作
                            showAchievement("训练完成!", "您已完成所有动作");
                            feedbackContent.textContent += "\n\n恭喜您完成了所有训练！点击重置按钮可以重新开始。";
                        }
                    }, 1000);
                }
            }
        });
        
        // 请求设备方向权限
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ 需要请求权限
            document.body.addEventListener('click', function requestOrientationAccess() {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            // 权限已获取
                            document.body.removeEventListener('click', requestOrientationAccess);
                        } else {
                            alert('需要传感器权限才能使用此应用');
                        }
                    })
                    .catch(console.error);
            }, { once: true });
        }
    } else {
        // 设备不支持所需的传感器
        alert('您的设备不支持所需的传感器，无法使用此应用');
    }
});