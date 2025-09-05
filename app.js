const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 34145;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务，配置缓存策略
app.use(express.static(path.join(__dirname, 'static'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            // HTML 文件不缓存，确保更新及时
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            // 其他静态资源缓存 7 天，提高加载性能
            res.setHeader('Cache-Control', 'public, max-age=604800');
        }
    }
}));

// 数据验证中间件
const validateInput = (req, res, next) => {
    const { fans_count } = req.body;
    
    if (!fans_count || fans_count <= 0) {
        return res.status(400).json({
            error: '上粉数量必须大于0',
            detail: 'fans_count 参数无效'
        });
    }
    
    next();
};

// 日报生成服务
const generateDailyReport = (inputData, results) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    // 预警检查
    const warnings = [];
    if (results.cost_per_fan > 2.5) {
        warnings.push(`⚠️ 单个上粉成本过高: ¥${results.cost_per_fan} > ¥2.5`);
    }
    if (results.cost_per_register > 15) {
        warnings.push(`⚠️ 单个注册成本过高: ¥${results.cost_per_register} > ¥15`);
    }
    if (results.cost_per_pay > 100) {
        warnings.push(`⚠️ 单个付费成本过高: ¥${results.cost_per_pay} > ¥100`);
    }
    
    // 生成日报内容
    const report = {
        date: dateStr,
        timestamp: today.toISOString(),
        input_data: inputData,
        results: results,
        warnings: warnings,
        analysis: generateAnalysis(inputData, results),
        formatted_text: generateFormattedText(dateStr, inputData, results, warnings)
    };
    
    return report;
};

// 生成分析报告
const generateAnalysis = (inputData, results) => {
    const analysis = [];
    
    // 成本效率分析
    if (results.cost_per_fan <= 2.5) {
        analysis.push("✅ 上粉成本控制良好，在合理范围内");
    } else {
        analysis.push("❌ 上粉成本偏高，建议优化获客策略");
    }
    
    if (results.cost_per_register <= 15) {
        analysis.push("✅ 注册成本控制良好，转化效率较高");
    } else {
        analysis.push("❌ 注册成本偏高，建议优化注册流程");
    }
    
    if (results.cost_per_pay <= 100) {
        analysis.push("✅ 付费成本控制良好，用户价值较高");
    } else {
        analysis.push("❌ 付费成本偏高，建议提升用户付费意愿");
    }
    
    // 规模效应分析
    if (inputData.fans_count >= 1000) {
        analysis.push("📈 上粉规模较大，具备规模效应");
    }
    
    if (inputData.pay_count > 0 && inputData.fans_count > 0) {
        const conversionRate = (inputData.pay_count / inputData.fans_count * 100).toFixed(2);
        analysis.push(`📊 上粉到付费转化率: ${conversionRate}%`);
    }
    
    return analysis;
};

// 生成格式化文本
const generateFormattedText = (dateStr, inputData, results, warnings) => {
    let text = `📊 直播成本计算日报 - ${dateStr}\n`;
    text += `═══════════════════════════════════════\n\n`;
    
    text += `📋 输入参数:\n`;
    text += `• 上粉数量: ${inputData.fans_count}\n`;
    text += `• 账号数量: ${inputData.account_count}\n`;
    text += `• 小组成员: ${inputData.group_members}\n`;
    text += `• 转化成员: ${inputData.conversion_members}\n`;
    text += `• 通道数量: ${inputData.channel_count}\n`;
    text += `• 注册数量: ${inputData.register_count}\n`;
    text += `• 付费数量: ${inputData.pay_count}\n`;
    text += `• 价值数量: ${inputData.value_count}\n\n`;
    
    text += `💰 总成本统计:\n`;
    text += `• 上粉总成本: ¥${results.total_cost.toLocaleString()}\n`;
    text += `• 注册总成本: ¥${results.register_cost.toLocaleString()}\n`;
    text += `• 付费总成本: ¥${results.pay_cost.toLocaleString()}\n`;
    text += `• 价值总成本: ¥${results.value_total_cost.toLocaleString()}\n\n`;
    
    text += `📊 单个成本分析:\n`;
    text += `• 每个上粉成本: ¥${results.cost_per_fan.toLocaleString()}\n`;
    text += `• 单个注册成本: ¥${results.cost_per_register.toLocaleString()}\n`;
    text += `• 单个付费成本: ¥${results.cost_per_pay.toLocaleString()}\n`;
    text += `• 单个价值成本: ¥${results.cost_per_value.toLocaleString()}\n\n`;
    
    if (warnings.length > 0) {
        text += `🚨 预警提醒:\n`;
        warnings.forEach(warning => {
            text += `${warning}\n`;
        });
        text += `\n`;
    }
    
    text += `📈 分析建议:\n`;
    const analysis = generateAnalysis(inputData, results);
    analysis.forEach(item => {
        text += `${item}\n`;
    });
    text += `\n`;
    
    text += `⏰ 生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    text += `═══════════════════════════════════════\n`;
    
    return text;
};

// 成本计算服务
const calculateCosts = (data) => {
    try {
        // 计算上粉总成本
        const total_cost = (
            data.group_members * 150 +           // 小组成员 × 150
            data.fans_count * 0.2 +             // 上粉数量 × 0.2
            (data.channel_count * 200) / 25 +   // 通道数量 × 200 / 25
            100 +                               // 网络费用
            data.account_count * 16             // 账号数量 × 16
        );
        
        // 计算每个上粉成本
        const cost_per_fan = total_cost / data.fans_count;
        
        // 计算注册总成本
        const register_cost = total_cost + data.fans_count * 0.15;
        
        // 计算单个注册成本
        const cost_per_register = data.register_count > 0 ? register_cost / data.register_count : 0;
        
        // 计算转化人员工资
        const conversion_salary = 150 + data.pay_count * 5 + data.value_count * 50;
        
        // 计算付费总成本
        const pay_cost = register_cost + conversion_salary;
        
        // 计算单个付费成本
        const cost_per_pay = data.pay_count > 0 ? pay_cost / data.pay_count : 0;
        
        // 计算单个价值成本
        const cost_per_value = data.value_count > 0 ? pay_cost / data.value_count : 0;
        
        // 价值总成本 = 付费总成本
        const value_total_cost = pay_cost;
        
        // 生成日报数据
        const dailyReport = generateDailyReport(data, {
            total_cost: Math.round(total_cost * 100) / 100,
            register_cost: Math.round(register_cost * 100) / 100,
            pay_cost: Math.round(pay_cost * 100) / 100,
            value_total_cost: Math.round(value_total_cost * 100) / 100,
            cost_per_fan: Math.round(cost_per_fan * 100) / 100,
            cost_per_register: Math.round(cost_per_register * 100) / 100,
            cost_per_pay: Math.round(cost_per_pay * 100) / 100,
            cost_per_value: Math.round(cost_per_value * 100) / 100
        });
        
        return {
            // 总成本
            total_cost: Math.round(total_cost * 100) / 100,
            register_cost: Math.round(register_cost * 100) / 100,
            pay_cost: Math.round(pay_cost * 100) / 100,
            value_total_cost: Math.round(value_total_cost * 100) / 100,
            
            // 单个成本
            cost_per_fan: Math.round(cost_per_fan * 100) / 100,
            cost_per_register: Math.round(cost_per_register * 100) / 100,
            cost_per_pay: Math.round(cost_per_pay * 100) / 100,
            cost_per_value: Math.round(cost_per_value * 100) / 100,
            
            // 日报数据
            daily_report: dailyReport
        };
        
    } catch (error) {
        throw new Error(`计算错误: ${error.message}`);
    }
};

// 路由定义

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// 成本计算API
app.post('/api/calc', validateInput, (req, res) => {
    try {
        const result = calculateCosts(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: '计算失败',
            detail: error.message
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: '成本计算系统运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 处理
app.use('*', (req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.originalUrl
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        error: '服务器内部错误',
        detail: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('🚀 直播成本计算系统已启动');
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});

module.exports = app;
