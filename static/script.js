document.getElementById('costForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 显示加载状态
    document.getElementById('results').innerHTML = '<div class="loading">🔄 正在计算中...</div>';
    
    // 获取表单数据
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = parseInt(value) || 0;
    });
    
    try {
        // 发送API请求
        const response = await fetch('/api/calc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '计算失败');
        }
        
        const result = await response.json();
        
        // 保存结果到全局变量
        window.lastCalculationResult = result;
        
        // 显示结果
        displayResults(result);
        
    } catch (error) {
        document.getElementById('results').innerHTML = `
            <div class="error">
                ❌ 计算失败: ${error.message}
            </div>
        `;
    }
});

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <!-- 总成本区域 -->
        <div class="result-section-header">
            <h3>💰 总成本统计</h3>
        </div>
        
        <div class="result-item total-cost">
            <div class="result-label">🎯 上粉总成本</div>
            <div class="result-value">¥${result.total_cost.toLocaleString()}</div>
        </div>
        
        <div class="result-item total-cost">
            <div class="result-label">📝 注册总成本</div>
            <div class="result-value">¥${result.register_cost.toLocaleString()}</div>
        </div>
        
        <div class="result-item total-cost">
            <div class="result-label">💳 付费总成本</div>
            <div class="result-value">¥${result.pay_cost.toLocaleString()}</div>
        </div>
        
        <div class="result-item total-cost">
            <div class="result-label">💎 价值总成本</div>
            <div class="result-value">¥${result.value_total_cost.toLocaleString()}</div>
        </div>
        
        <!-- 单个成本区域 -->
        <div class="result-section-header">
            <h3>📊 单个成本分析</h3>
        </div>
        
        <div class="result-item unit-cost">
            <div class="result-label">🎯 每个上粉成本</div>
            <div class="result-value">¥${result.cost_per_fan.toLocaleString()}</div>
        </div>
        
        <div class="result-item unit-cost">
            <div class="result-label">📝 单个注册成本</div>
            <div class="result-value">¥${result.cost_per_register.toLocaleString()}</div>
        </div>
        
        <div class="result-item unit-cost">
            <div class="result-label">💳 单个付费成本</div>
            <div class="result-value">¥${result.cost_per_pay.toLocaleString()}</div>
        </div>
        
        <div class="result-item unit-cost">
            <div class="result-label">💎 单个价值成本</div>
            <div class="result-value">¥${result.cost_per_value.toLocaleString()}</div>
        </div>
        
        <div class="success">
            ✅ 计算完成！所有成本已计算完毕
        </div>
        
        <!-- 日报生成按钮 -->
        <div class="report-section">
            <button id="generateReportBtn" class="report-btn" onclick="showDailyReport()">
                📊 生成日报报告
            </button>
        </div>
    `;
}

// 显示日报报告
function showDailyReport() {
    if (!window.lastCalculationResult) {
        alert('请先进行计算');
        return;
    }
    
    const result = window.lastCalculationResult;
    const report = result.daily_report;
    
    // 创建日报弹窗
    const modal = document.createElement('div');
    modal.className = 'report-modal';
    modal.innerHTML = `
        <div class="report-modal-content">
            <div class="report-modal-header">
                <h2>📊 直播成本计算日报 - ${report.date}</h2>
                <button class="close-btn" onclick="closeReportModal()">&times;</button>
            </div>
            <div class="report-modal-body">
                <div class="report-section">
                    <h3>📋 输入参数</h3>
                    <div class="report-grid">
                        <div class="report-item">
                            <span class="label">上粉数量:</span>
                            <span class="value">${report.input_data.fans_count}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">账号数量:</span>
                            <span class="value">${report.input_data.account_count}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">小组成员:</span>
                            <span class="value">${report.input_data.group_members}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">转化成员:</span>
                            <span class="value">${report.input_data.conversion_members}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">通道数量:</span>
                            <span class="value">${report.input_data.channel_count}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">注册数量:</span>
                            <span class="value">${report.input_data.register_count}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">付费数量:</span>
                            <span class="value">${report.input_data.pay_count}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">价值数量:</span>
                            <span class="value">${report.input_data.value_count}</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>💰 总成本统计</h3>
                    <div class="report-grid">
                        <div class="report-item">
                            <span class="label">上粉总成本:</span>
                            <span class="value">¥${report.results.total_cost.toLocaleString()}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">注册总成本:</span>
                            <span class="value">¥${report.results.register_cost.toLocaleString()}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">付费总成本:</span>
                            <span class="value">¥${report.results.pay_cost.toLocaleString()}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">价值总成本:</span>
                            <span class="value">¥${report.results.value_total_cost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>📊 单个成本分析</h3>
                    <div class="report-grid">
                        <div class="report-item">
                            <span class="label">每个上粉成本:</span>
                            <span class="value ${report.results.cost_per_fan > 2.5 ? 'warning' : ''}">¥${report.results.cost_per_fan.toLocaleString()}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">单个注册成本:</span>
                            <span class="value ${report.results.cost_per_register > 15 ? 'warning' : ''}">¥${report.results.cost_per_register.toLocaleString()}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">单个付费成本:</span>
                            <span class="value ${report.results.cost_per_pay > 100 ? 'warning' : ''}">¥${report.results.cost_per_pay.toLocaleString()}</span>
                        </div>
                        <div class="report-item">
                            <span class="label">单个价值成本:</span>
                            <span class="value">¥${report.results.cost_per_value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                ${report.warnings.length > 0 ? `
                <div class="report-section warning-section">
                    <h3>🚨 预警提醒</h3>
                    <div class="warnings-list">
                        ${report.warnings.map(warning => `<div class="warning-item">${warning}</div>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="report-section">
                    <h3>📈 分析建议</h3>
                    <div class="analysis-list">
                        ${report.analysis.map(item => `<div class="analysis-item">${item}</div>`).join('')}
                    </div>
                </div>
                
                <div class="report-actions">
                    <button class="copy-btn" onclick="copyReportToClipboard()">
                        📋 复制日报内容
                    </button>
                    <button class="download-btn" onclick="downloadReport()">
                        💾 下载日报文件
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// 关闭日报弹窗
function closeReportModal() {
    const modal = document.querySelector('.report-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// 复制日报到剪贴板
function copyReportToClipboard() {
    if (!window.lastCalculationResult) return;
    
    const report = window.lastCalculationResult.daily_report;
    navigator.clipboard.writeText(report.formatted_text).then(() => {
        alert('✅ 日报内容已复制到剪贴板！');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = report.formatted_text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ 日报内容已复制到剪贴板！');
    });
}

// 下载日报文件
function downloadReport() {
    if (!window.lastCalculationResult) return;
    
    const report = window.lastCalculationResult.daily_report;
    const blob = new Blob([report.formatted_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `直播成本日报_${report.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 页面加载完成后设置默认值
document.addEventListener('DOMContentLoaded', function() {
    // 可以在这里设置一些默认值或进行其他初始化
    console.log('成本计算系统已加载完成');
});
