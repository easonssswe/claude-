document.addEventListener('DOMContentLoaded', function() {
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
        
        // 更新进度环
        function setProgress(percent) {
            const offset = circumference - (percent / 100 * circumference);
            progressRing.style.strokeDashoffset = offset;
            progressText.textContent = `${Math.round(percent)}%`;
            currentProgress = percent;
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
                
                // 使用beta（前后倾斜）作为主要测量值
                let angle = Math.abs(betaDiff);
                
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
                if (percent > 20 && !isRising && !isLowering) {
                    isRising = true;
                    startTime = Date.now();
                }
                
                if (percent > 90 && isRising && !isLowering) {
                    isRising = false;
                    isLowering = true;
                    // 震动提示达到顶点
                    vibrate(200);
                }
                
                if (percent < 10 && !isRising && isLowering) {
                    isLowering = false;
                    endTime = Date.now();
                    repCount++;
                    repCountElement.textContent = repCount;
                    
                    // 震动提示完成一次动作
                    vibrate(300);
                    
                    // 分析动作
                    isCompleted = true;
                    analyzeMovement();
                    
                    // 重置数据，准备下一次动作
                    if (repCount < 3) {
                        setTimeout(() => {
                            maxAngle = 0;
                            minAngle = 90;
                            angleReadings = [];
                            timeReadings = [];
                            isCompleted = false;
                            setProgress(0);
                        }, 1500);
                    } else {
                        // 完成所有动作
                        vibrate([200, 100, 200, 100, 200]);
                        feedbackContent.textContent += '\n\n恭喜您完成了所有3次二头弯举训练！';
                    }
                }
            }
        });
        
        // 请求传感器权限
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ 需要请求权限
            resetBtn.addEventListener('click', function() {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            alert('传感器权限已获取，请保持手臂伸直，然后点击确定');
                        } else {
                            alert('需要传感器权限才能使用此应用');
                        }
                    })
                    .catch(console.error);
            });
        } else {
            // 其他设备不需要显式请求权限
            alert('请点击"重置位置"按钮开始训练');
        }
    } else {
        alert('您的设备不支持所需的传感器，无法使用此应用');
    }
});