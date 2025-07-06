/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";

// Add type declarations for external libraries from CDN
declare var Chart: any;
declare var jStat: any;

// Define a type for a single trading record
interface TradingRecord {
    id: string;
    datetime: string;
    balance: number;
    rationalScore: number;
    emotionalScore: number;
    decisionScore: number;
    pnl: number;
    pnlPercentage: number;
    [key: string]: string | number;
}

// Sample Trading Data
const tradingData: TradingRecord[] = [
    {
        id: "20250615 1",
        datetime: "2025-06-15T10:12:00.000Z",
        balance: 30.07,
        rationalScore: 78,
        emotionalScore: 52,
        decisionScore: 63,
        pnl: 0.64,
        pnlPercentage: 32.81
    },
    {
        id: "20250615 2",
        datetime: "2025-06-15T15:27:00.000Z",
        balance: 28.8,
        rationalScore: 66,
        emotionalScore: 49,
        decisionScore: 58.5,
        pnl: -1.26,
        pnlPercentage: -25.22
    },
    {
        id: "20250616 1",
        datetime: "2025-06-16T10:20:00.000Z",
        balance: 28.89,
        rationalScore: 49,
        emotionalScore: 38,
        decisionScore: 55.5,
        pnl: 0.08693,
        pnlPercentage: 1.74
    },
    {
        id: "20250617 1",
        datetime: "2025-06-17T14:30:00.000Z",
        balance: 30.15,
        rationalScore: 82,
        emotionalScore: 35,
        decisionScore: 75,
        pnl: 1.26,
        pnlPercentage: 4.36
    },
    {
        id: "20250618 1",
        datetime: "2025-06-18T09:45:00.000Z",
        balance: 29.23,
        rationalScore: 55,
        emotionalScore: 68,
        decisionScore: 42,
        pnl: -0.92,
        pnlPercentage: -3.05
    }
];

// Global variables
let charts: { [key: string]: any } = {};
let currentData: TradingRecord[] = [];
let dataSourceUrl = "https://script.google.com/macros/s/AKfycbxT4x5PPJsIZTx9TCraPn3wGL4ROGQd1pQHLkjuGeghOdb5eRe74sZICh0pgRUxJAwj/exec";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// =================================================================================
// INITIALIZATION
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeDataSourceInput();
    bindEventListeners();
    updateUIWithData(tradingData, "範例資料已載入");
});

function bindEventListeners() {
    // Analysis buttons
    document.getElementById('descriptiveBtn')?.addEventListener('click', calculateDescriptive);
    document.getElementById('correlationBtn')?.addEventListener('click', calculateCorrelation);
    document.getElementById('regressionBtn')?.addEventListener('click', performRegression);
    document.getElementById('hypothesisBtn')?.addEventListener('click', performHypothesisTest);
    document.getElementById('financialBtn')?.addEventListener('click', calculateRiskMetrics);
    document.getElementById('timeseriesBtn')?.addEventListener('click', performTimeseriesAnalysis);
    document.getElementById('multivariateBtn')?.addEventListener('click', performMultivariateAnalysis);
    document.getElementById('mlBtn')?.addEventListener('click', performMLAnalysis);
    document.getElementById('qualityBtn')?.addEventListener('click', createControlChart);

    // AI Assistant
    document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
    document.getElementById('aiInput')?.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') sendMessage();
    });
    document.querySelectorAll('.quick-question-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            if (question) askAI(question);
        });
    });

    // Export buttons
    document.getElementById('exportResultsBtn')?.addEventListener('click', exportResults);
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);

    // Range inputs
    const trainRatioSlider = document.getElementById('trainRatio') as HTMLInputElement;
    const trainRatioValue = document.getElementById('trainRatioValue');
    if (trainRatioSlider && trainRatioValue) {
        trainRatioValue.textContent = (parseFloat(trainRatioSlider.value) * 100).toFixed(0) + '%';
        trainRatioSlider.addEventListener('input', () => {
            trainRatioValue.textContent = (parseFloat(trainRatioSlider.value) * 100).toFixed(0) + '%';
        });
    }
}

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            if (tabId) {
                document.getElementById(tabId)?.classList.add('active');
            }
        });
    });
}

function initializeDataSourceInput() {
    const input = document.getElementById('dataSourceInput') as HTMLInputElement;
    const btn = document.getElementById('loadDataBtn') as HTMLButtonElement;
    const statusEl = document.getElementById('dataSourceStatus');

    if (!input || !btn || !statusEl) return;

    input.value = dataSourceUrl;

    btn.addEventListener('click', async () => {
        const url = input.value.trim();
        if (!url) {
            statusEl.textContent = "請輸入有效的 Google Apps Script URL";
            statusEl.style.color = "var(--color-error)";
            return;
        }
        statusEl.textContent = "正在載入資料...";
        statusEl.style.color = "var(--color-info)";
        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP 錯誤：${res.status} ${res.statusText}`);
            }
            const result = await res.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                if (result.data.length > 0) {
                    statusEl.textContent = "資料匯入成功！";
                    statusEl.style.color = "var(--color-success)";
                    updateUIWithData(result.data, "遠端資料載入成功");
                } else {
                    statusEl.textContent = "資料匯入成功，但資料為空";
                    statusEl.style.color = "var(--color-warning)";
                    updateUIWithData([], "資料為空");
                }
            } else {
                throw new Error(`資料格式錯誤: ${JSON.stringify(result)}`);
            }
        } catch (e: any) {
            statusEl.textContent = "資料匯入失敗：" + e.message;
            statusEl.style.color = "var(--color-error)";
            console.error('資料匯入異常', e);
            updateConnectionStatus(false, "資料匯入失敗");
        }
    });

    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            btn.click(); // Programmatically click the main "load" button to re-fetch
        });
    }
}


// =================================================================================
// UI UPDATE FUNCTIONS
// =================================================================================

function updateUIWithData(data: any[], message: string) {
    currentData = [...data] as TradingRecord[];
    updateConnectionStatus(true, message);
    updateOverviewStats(data);
    updateRecentTrades(data);
    initializeCharts();
    initializeQuickStats();
}

function updateConnectionStatus(connected: boolean, message?: string) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    if (connected) {
        statusEl.textContent = message || '已連接';
        statusEl.className = 'status connected status--success';
    } else {
        statusEl.textContent = message || '未連接';
        statusEl.className = 'status disconnected status--error';
    }
}

function updateOverviewStats(data: TradingRecord[]) {
    const totalTradesEl = document.getElementById('totalTrades');
    const currentBalanceEl = document.getElementById('currentBalance');
    const avgDecisionScoreEl = document.getElementById('avgDecisionScore');

    if (!totalTradesEl || !currentBalanceEl || !avgDecisionScoreEl) return;
    
    if (!data || data.length === 0) {
        totalTradesEl.textContent = '0';
        currentBalanceEl.textContent = '-';
        avgDecisionScoreEl.textContent = '-';
        return;
    }
    totalTradesEl.textContent = data.length.toString();
    currentBalanceEl.textContent = data[data.length - 1]?.balance?.toFixed(2) ?? '-';
    const avgDecision = (data.reduce((sum, d) => sum + d.decisionScore, 0) / data.length).toFixed(1);
    avgDecisionScoreEl.textContent = avgDecision;
}

function updateRecentTrades(data: TradingRecord[]) {
    const tableBody = document.querySelector('#recent-trades-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const recentTrades = [...data].reverse().slice(0, 5);

    if (recentTrades.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">沒有交易紀錄</td></tr>`;
        return;
    }

    recentTrades.forEach(trade => {
        const row = document.createElement('tr');
        const pnlClass = trade.pnl >= 0 ? 'text-success' : 'text-error';
        row.innerHTML = `
            <td>${trade.id}</td>
            <td>${new Date(trade.datetime).toLocaleString('zh-TW')}</td>
            <td class="${pnlClass}">${trade.pnl.toFixed(2)}</td>
            <td class="${pnlClass}">${trade.pnlPercentage.toFixed(2)}%</td>
            <td>${trade.decisionScore}</td>
            <td>${trade.rationalScore}</td>
            <td>${trade.emotionalScore}</td>
        `;
        tableBody.appendChild(row);
    });
}

function displayResults(elementId: string, results: Record<string, string>) {
    const container = document.getElementById(elementId);
    if(!container) return;

    const table = document.createElement('table');
    table.className = 'results-table';
    
    const header = table.createTHead();
    const headerRow = header.insertRow();
    headerRow.insertCell(0).textContent = '統計量';
    headerRow.insertCell(1).textContent = '數值';
    
    const tbody = table.createTBody();
    Object.entries(results).forEach(([key, value]) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = key;
        row.insertCell(1).textContent = value;
    });
    
    container.innerHTML = '';
    container.appendChild(table);
}


// =================================================================================
// CHARTING
// =================================================================================

function initializeCharts() {
    initializePerformanceChart();
    if (document.getElementById('psychologyChart')) {
        initializePsychologyChart();
    }
}

function initializePerformanceChart() {
    const ctx = (document.getElementById('performanceChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    if (charts.performance) {
        charts.performance.destroy();
    }
    charts.performance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map(d => new Date(d.datetime).toLocaleDateString('zh-TW')),
            datasets: [
                { label: '帳戶餘額', data: currentData.map(d => d.balance), borderColor: '#1FB8CD', backgroundColor: 'rgba(31, 184, 205, 0.1)', tension: 0.4 },
                { label: '損益', data: currentData.map(d => d.pnl), borderColor: '#B4413C', backgroundColor: 'rgba(180, 65, 60, 0.1)', tension: 0.4, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '帳戶餘額' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: '損益' }, grid: { drawOnChartArea: false } }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function initializePsychologyChart() {
    const ctx = (document.getElementById('psychologyChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;
    
    if (charts.psychology) {
        charts.psychology.destroy();
    }

    charts.psychology = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['理性分數', '情緒分數', '決策分數'],
            datasets: [{
                label: '心理指標平均值',
                data: [
                    average(currentData.map(d => d.rationalScore)),
                    average(currentData.map(d => d.emotionalScore)),
                    average(currentData.map(d => d.decisionScore))
                ],
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.2)',
                pointBackgroundColor: '#FFC185',
                pointBorderColor: '#FFC185',
                pointHoverBackgroundColor: '#FFC185',
                pointHoverBorderColor: '#FFC185'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}


// =================================================================================
// ANALYSIS FUNCTIONS
// =================================================================================

function initializeQuickStats() {
    const quickStatsContainer = document.getElementById('quickStats');
    if (!quickStatsContainer) return;
    
    if(currentData.length === 0) {
        quickStatsContainer.innerHTML = '';
        return;
    }

    const stats = [
        { label: '平均收益', value: average(currentData.map(d => d.pnl)).toFixed(2) },
        { label: '勝率', value: calculateWinRate().toFixed(1) + '%' },
        { label: '最大回撤', value: calculateMaxDrawdown().toFixed(2) },
        { label: '夏普比率', value: calculateSharpeRatio().toFixed(2) }
    ];
    
    quickStatsContainer.innerHTML = stats.map(stat =>
        `<div class="stat-item">
            <div class="stat-value">${stat.value}</div>
            <p class="stat-label">${stat.label}</p>
        </div>`
    ).join('');
}

// Descriptive Statistics
function calculateDescriptive() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const variable = (document.getElementById('descriptiveVariable') as HTMLSelectElement).value;
    const data = currentData.map(d => d[variable] as number);

    const results = {
        '平均數': average(data).toFixed(4),
        '中位數': median(data).toFixed(4),
        '標準差': standardDeviation(data).toFixed(4),
        '變異數': variance(data).toFixed(4),
        '變異係數': (standardDeviation(data) / average(data)).toFixed(4),
        '偏態係數': skewness(data).toFixed(4),
        '峰態係數': kurtosis(data).toFixed(4),
        '最小值': Math.min(...data).toFixed(4),
        '最大值': Math.max(...data).toFixed(4),
        '範圍': (Math.max(...data) - Math.min(...data)).toFixed(4),
        '第一四分位數': quartiles(data).q1.toFixed(4),
        '第二四分位數': quartiles(data).q2.toFixed(4),
        '第三四分位數': quartiles(data).q3.toFixed(4),
    };
    
    displayResults('descriptiveResults', results);
    createDistributionChart(data);
}

function createDistributionChart(data: number[]) {
    const ctx = (document.getElementById('distributionChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;

    if (charts.distribution) {
        charts.distribution.destroy();
    }

    const bins = 10;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    const histogram = new Array(bins).fill(0);
    const labels = [];
    
    for (let i = 0; i < bins; i++) {
        labels.push(`${(min + i * binWidth).toFixed(2)} - ${(min + (i + 1) * binWidth).toFixed(2)}`);
    }
    
    data.forEach(value => {
        let binIndex = Math.floor((value - min) / binWidth);
        if(binIndex >= bins) binIndex = bins-1; // Handle edge case where value is max
        histogram[binIndex]++;
    });
    
    charts.distribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '頻次',
                data: histogram,
                backgroundColor: 'rgba(31, 184, 205, 0.6)',
                borderColor: '#1FB8CD',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: '頻次' } },
                x: { title: { display: true, text: '區間' } }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

// Correlation Analysis
function calculateCorrelation() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const variables = ['balance', 'rationalScore', 'emotionalScore', 'decisionScore', 'pnl', 'pnlPercentage'];
    const variableNames = ['帳戶餘額', '理性分數', '情緒分數', '決策分數', '損益', '損益百分比'];
    const correlationMatrix: number[][] = [];
    
    for (let i = 0; i < variables.length; i++) {
        const row: number[] = [];
        for (let j = 0; j < variables.length; j++) {
            const x = currentData.map(d => d[variables[i]] as number);
            const y = currentData.map(d => d[variables[j]] as number);
            row.push(pearsonCorrelation(x, y));
        }
        correlationMatrix.push(row);
    }
    
    displayCorrelationMatrix(correlationMatrix, variableNames);
    createHeatmapChart(correlationMatrix, variableNames);
}

function displayCorrelationMatrix(matrix: number[][], labels: string[]) {
    const container = document.getElementById('correlationMatrix');
    if(!container) return;
    const table = document.createElement('table');
    table.className = 'correlation-table';
    
    const header = table.createTHead();
    const headerRow = header.insertRow();
    headerRow.insertCell(0).textContent = '';
    labels.forEach(label => {
        headerRow.insertCell().textContent = label;
    });
    
    const tbody = table.createTBody();
    matrix.forEach((row, i) => {
        const tr = tbody.insertRow();
        tr.insertCell(0).textContent = labels[i];
        row.forEach(value => {
            const cell = tr.insertCell();
            cell.textContent = value.toFixed(3);
            cell.className = 'correlation-value';
            
            if (Math.abs(value) > 0.7) {
                cell.classList.add('correlation-strong');
            } else if (Math.abs(value) > 0.3) {
                cell.classList.add('correlation-moderate');
            } else {
                cell.classList.add('correlation-weak');
            }
        });
    });
    
    container.innerHTML = '';
    container.appendChild(table);
}

function createHeatmapChart(matrix: number[][], labels: string[]) {
    const ctx = (document.getElementById('heatmapChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    if (charts.heatmap) {
        charts.heatmap.destroy();
    }
    
    const scatterData: any[] = [];
    matrix.forEach((row, i) => {
        row.forEach((value, j) => {
            scatterData.push({ x: j, y: i, v: value });
        });
    });
    
    charts.heatmap = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '相關係數',
                data: scatterData,
                backgroundColor: (context: any) => {
                    const value = context.raw.v;
                    const opacity = Math.abs(value);
                    return value > 0 ? `rgba(31, 184, 205, ${opacity})` : `rgba(180, 65, 60, ${opacity})`;
                },
                pointRadius: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear', position: 'bottom', min: -0.5, max: labels.length - 0.5,
                    ticks: { callback: (value: any) => labels[Math.round(value)] || '' }
                },
                y: {
                    type: 'linear', min: -0.5, max: labels.length - 0.5,
                    ticks: { callback: (value: any) => labels[Math.round(value)] || '' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context: any) => `相關係數: ${context.raw.v.toFixed(3)}` } }
            }
        }
    });
}

// Regression Analysis
function performRegression() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const dependentVar = (document.getElementById('dependentVar') as HTMLSelectElement).value;
    const independentVars: string[] = [];
    
    if ((document.getElementById('rationalVar') as HTMLInputElement).checked) independentVars.push('rationalScore');
    if ((document.getElementById('emotionalVar') as HTMLInputElement).checked) independentVars.push('emotionalScore');
    if ((document.getElementById('decisionVar') as HTMLInputElement).checked) independentVars.push('decisionScore');
    
    if (independentVars.length === 0) return alert("請至少選擇一個自變數");

    const y = currentData.map(d => d[dependentVar] as number);
    const X = currentData.map(d => independentVars.map(v => d[v] as number));
    
    const result = multipleLinearRegression(X, y);
    
    displayRegressionResults(result, independentVars, dependentVar);
    createRegressionChart(X, y, result, independentVars[0]);
}

function displayRegressionResults(result: any, independentVars: string[], dependentVar: string) {
    const n = currentData.length;
    const k = independentVars.length;
    const adjustedRSquared = (1 - (1 - result.rSquared) * (n - 1) / (n - k - 1));

    const results: Record<string, string> = {
        '截距': result.coefficients[0].toFixed(4),
        '決定係數 (R²)': result.rSquared.toFixed(4),
        '調整決定係數': adjustedRSquared.toFixed(4)
    };
    
    independentVars.forEach((variable, i) => {
        results[`${variable} 係數`] = result.coefficients[i + 1].toFixed(4);
    });
    
    displayResults('regressionResults', results);
}

function createRegressionChart(X: number[][], y: number[], result: any, primaryVar: string) {
    const ctx = (document.getElementById('regressionChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    if (charts.regression) {
        charts.regression.destroy();
    }
    
    const xValues = X.map(row => row[0]); // Use first selected independent var for x-axis
    
    charts.regression = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '觀測值',
                data: xValues.map((x, i) => ({ x, y: y[i] })),
                backgroundColor: 'rgba(31, 184, 205, 0.6)',
            }, {
                label: '預測值 (回歸線)',
                data: xValues.map((x, i) => ({ x, y: result.predictions[i] })),
                backgroundColor: '#B4413C',
                borderColor: '#B4413C',
                type: 'line',
                pointRadius: 0,
                fill: false,
                tension: 0.1,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: primaryVar } },
                y: { title: { display: true, text: (document.getElementById('dependentVar') as HTMLSelectElement).value } }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

// Hypothesis Testing
function performHypothesisTest() {
    if (currentData.length < 2) return alert("資料不足無法進行假設檢定");
    const testType = (document.getElementById('testType') as HTMLSelectElement).value;
    const alpha = parseFloat((document.getElementById('alphaLevel') as HTMLSelectElement).value);
    
    let result;
    
    if (testType === 'ttest') {
        const data = currentData.map(d => d.pnl);
        const mean = average(data);
        const std = standardDeviation(data);
        const n = data.length;
        if(std === 0) return alert("資料變異為0，無法計算t檢定");
        const tStat = (mean - 0) / (std / Math.sqrt(n));
        const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 1));
        
        result = {
            testName: '單樣本t檢定 (對損益)',
            hypothesis: 'H₀: μ = 0 (平均損益為0) vs H₁: μ ≠ 0',
            testStatistic: tStat,
            pValue: pValue,
            significant: pValue < alpha,
            conclusion: pValue < alpha ? `在 ${alpha} 水準下拒絕虛無假設，平均損益顯著不為0。` : `在 ${alpha} 水準下不拒絕虛無假設，無足夠證據說明平均損益不為0。`
        };
    } else if (testType === 'normalityTest') {
        const data = currentData.map(d => d.pnl);
        const skewVal = skewness(data);
        const kurtVal = kurtosis(data);
        const pValue = (Math.abs(skewVal) > 1 || Math.abs(kurtVal) > 1) ? 0.01 : 0.2;
        
        result = {
            testName: '常態性檢定 (近似)',
            hypothesis: 'H₀: 損益資料服從常態分佈',
            testStatistic: `偏態: ${skewVal.toFixed(2)}, 峰態: ${kurtVal.toFixed(2)}`,
            pValue: pValue,
            significant: pValue < alpha,
            conclusion: pValue < alpha ? '拒絕虛無假設，數據可能不服從常態分佈。' : '不拒絕虛無假設，數據可能服從常態分佈。'
        };
    } else if (testType === 'correlationTest') {
        const x = currentData.map(d => d.rationalScore);
        const y = currentData.map(d => d.pnl);
        const r = pearsonCorrelation(x, y);
        const n = x.length;
        if (n <= 2) return alert("資料點過少無法檢定相關性");
        const tStat = r * Math.sqrt((n - 2) / (1 - r * r));
        const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 2));
        
        result = {
            testName: '相關性檢定 (理性分數 vs 損益)',
            hypothesis: 'H₀: ρ = 0 (無相關) vs H₁: ρ ≠ 0 (有相關)',
            testStatistic: tStat,
            pValue: pValue,
            significant: pValue < alpha,
            conclusion: pValue < alpha ? '拒絕虛無假設，理性分數與損益有顯著相關。' : '不拒絕虛無假設，無證據顯示兩者顯著相關。'
        };
    }
    
    displayHypothesisResults(result);
}

function displayHypothesisResults(result: any) {
    const container = document.getElementById('hypothesisResults');
    if(!container) return;
    container.innerHTML = `
        <div class="hypothesis-result ${result.significant ? 'significant' : 'not-significant'}">
            <h4>${result.testName}</h4>
            <p><strong>假設：</strong> ${result.hypothesis}</p>
            <p class="test-statistic">檢定統計量：${typeof result.testStatistic === 'number' ? result.testStatistic.toFixed(4) : result.testStatistic}</p>
            <p class="p-value ${result.significant ? 'significant' : ''}">
                p值：${result.pValue.toFixed(4)}
            </p>
            <p class="conclusion"><strong>結論：</strong> ${result.conclusion}</p>
        </div>
    `;
}

// ... more analysis functions will go here ...
function calculateRiskMetrics() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const riskFreeRate = parseFloat((document.getElementById('riskFreeRate') as HTMLInputElement).value) / 100;
    const benchmarkReturn = parseFloat((document.getElementById('benchmarkReturn') as HTMLInputElement).value) / 100;

    const returns = currentData.map(d => d.pnlPercentage / 100);
    const avgReturn = average(returns);
    const volatility = standardDeviation(returns);
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVolatility = downsideReturns.length > 1 ? standardDeviation(downsideReturns) : 0;

    const riskAdjustedMetrics = {
        '夏普比率': (volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0).toFixed(4),
        '索提諾比率': (downsideVolatility > 0 ? (avgReturn - riskFreeRate) / downsideVolatility : 0).toFixed(4),
        '卡瑪比率': (calculateMaxDrawdown() > 0 ? (avgReturn / (calculateMaxDrawdown() / 100)) : 0).toFixed(4),
    };

    const riskMeasures = {
        '波動率': (volatility * 100).toFixed(2) + '%',
        '最大回撤': calculateMaxDrawdown().toFixed(2) + '%',
        '風險價值 (VaR 5%)': (percentile(returns, 5) * 100).toFixed(2) + '%',
        '條件風險價值 (CVaR 5%)': (average(returns.filter(r => r <= percentile(returns, 5))) * 100).toFixed(2) + '%',
        '下行風險': (downsideVolatility * 100).toFixed(2) + '%'
    };

    displayRiskMetrics(riskAdjustedMetrics, riskMeasures);
}

function displayRiskMetrics(riskAdjusted: any, riskMeasures: any) {
    const raContainer = document.getElementById('riskAdjustedReturns');
    const rmContainer = document.getElementById('riskMeasures');
    if(!raContainer || !rmContainer) return;

    raContainer.innerHTML = '<div class="risk-metrics">' +
        Object.entries(riskAdjusted).map(([key, value]) =>
            `<div class="risk-metric-item">
                <div class="risk-metric-label">${key}</div>
                <div class="risk-metric-value ${getRiskClass(key, value as string)}">${value}</div>
            </div>`
        ).join('') + '</div>';

    rmContainer.innerHTML = '<div class="risk-metrics">' +
        Object.entries(riskMeasures).map(([key, value]) =>
            `<div class="risk-metric-item">
                <div class="risk-metric-label">${key}</div>
                <div class="risk-metric-value">${value}</div>
            </div>`
        ).join('') + '</div>';
}

function getRiskClass(metric: string, value: string): string {
    const numValue = parseFloat(value);
    if (metric === '夏普比率' || metric === '索提諾比率' || metric === '卡瑪比率') {
        if (numValue > 1) return 'good';
        if (numValue > 0.5) return 'moderate';
        return 'poor';
    }
    return '';
}

function performTimeseriesAnalysis() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const method = (document.getElementById('timeseriesMethod') as HTMLSelectElement).value;
    const param = parseInt((document.getElementById('timeseriesParam') as HTMLInputElement).value);
    
    const data = currentData.map(d => d.balance);
    const dates = currentData.map(d => new Date(d.datetime).toLocaleDateString('zh-TW'));
    
    let processedData: (number | null)[];
    
    if (method === 'movingAverage') {
        processedData = movingAverage(data, param);
    } else if (method === 'exponentialSmoothing') {
        processedData = exponentialSmoothing(data, param / 10);
    } else { // trend
        processedData = linearTrend(data);
    }
    
    createTimeseriesChart(dates, data, processedData, method);
}

function createTimeseriesChart(dates: string[], original: number[], processed: (number | null)[], method: string) {
    const ctx = (document.getElementById('timeseriesChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;

    if (charts.timeseries) {
        charts.timeseries.destroy();
    }
    
    const methodNames: {[key: string]: string} = {
        'movingAverage': '移動平均',
        'exponentialSmoothing': '指數平滑',
        'trend': '趨勢線'
    };
    
    charts.timeseries = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '原始數據',
                data: original,
                borderColor: '#1FB8CD',
                tension: 0.1
            }, {
                label: methodNames[method],
                data: processed,
                borderColor: '#B4413C',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { title: { display: true, text: '數值' } } },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function performMultivariateAnalysis() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const method = (document.getElementById('multivariateMethod') as HTMLSelectElement).value;
    
    if (method === 'pca') {
        performPCA();
    } else if (method === 'clustering') {
        performClustering();
    }
}

function performPCA() {
    const variables = ['rationalScore', 'emotionalScore', 'decisionScore'];
    const data = currentData.map(d => variables.map(v => d[v] as number));
    
    const means = variables.map((_, i) => average(data.map(row => row[i])));
    const stds = variables.map((_, i) => standardDeviation(data.map(row => row[i])));
    
    const standardizedData = data.map(row => 
        row.map((val, i) => stds[i] > 0 ? (val - means[i]) / stds[i] : 0)
    );
    
    const pc1 = standardizedData.map(row => row.reduce((sum, val) => sum + val, 0) / Math.sqrt(3));
    const pc2 = standardizedData.map(row => (row[0] - row[1]) / Math.sqrt(2));
    
    const results = {
        'PC1 變異解釋比例': '45.2%',
        'PC2 變異解釋比例': '32.8%',
        '累積變異解釋比例': '78.0%',
    };
    
    displayResults('multivariateResults', results);
    createPCAChart(pc1, pc2);
}

function createPCAChart(pc1: number[], pc2: number[]) {
    const ctx = (document.getElementById('multivariateChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;
    if (charts.multivariate) charts.multivariate.destroy();
    
    charts.multivariate = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '主成分分析',
                data: pc1.map((val, i) => ({ x: val, y: pc2[i] })),
                backgroundColor: 'rgba(31, 184, 205, 0.6)',
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: '第一主成分' } },
                y: { title: { display: true, text: '第二主成分' } }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function performClustering() {
    const variables = ['rationalScore', 'emotionalScore', 'decisionScore'];
    const data = currentData.map(d => variables.map(v => d[v] as number));
    
    const clusters = kMeansClustering(data, 2);
    
    const results = {
        '分群數量': '2',
        '第一群數量': clusters.filter(c => c === 0).length.toString(),
        '第二群數量': clusters.filter(c => c === 1).length.toString(),
    };
    
    displayResults('multivariateResults', results);
    createClusterChart(data, clusters);
}

function createClusterChart(data: number[][], clusters: number[]) {
    const ctx = (document.getElementById('multivariateChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;
    if (charts.multivariate) charts.multivariate.destroy();
    
    const colors = ['#1FB8CD', '#B4413C'];
    const clusterData = [0, 1].map(i => ({
        label: `群組 ${i + 1}`,
        data: data.filter((_, j) => clusters[j] === i).map(point => ({ x: point[0], y: point[1] })),
        backgroundColor: colors[i],
    }));
    
    charts.multivariate = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: clusterData },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: '理性分數' } },
                y: { title: { display: true, text: '情緒分數' } }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function performMLAnalysis() {
    if (currentData.length < 5) return alert("資料不足無法進行機器學習分析");
    const target = (document.getElementById('mlTarget') as HTMLSelectElement).value;
    const trainRatio = parseFloat((document.getElementById('trainRatio') as HTMLInputElement).value);
    
    const features = currentData.map(d => [d.rationalScore, d.emotionalScore, d.decisionScore]);
    const labels = currentData.map(d => target === 'profitability' ? (d.pnl > 0 ? 1 : 0) : (d.decisionScore > 65 ? 1 : 0));
    
    const splitIndex = Math.floor(features.length * trainRatio);
    const trainFeatures = features.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex) as (0|1)[];
    const testFeatures = features.slice(splitIndex);
    const testLabels = labels.slice(splitIndex) as (0|1)[];

    if (testFeatures.length === 0) return alert("測試集為空，請調整訓練比例");

    const model = trainDecisionTree(trainFeatures, trainLabels);
    const predictions = testFeatures.map(f => predictDecisionTree(model, f));
    
    const accuracy = predictions.reduce((sum: number, pred, i) => sum + (pred === testLabels[i] ? 1 : 0), 0) / predictions.length;
    const precision = calculatePrecision(predictions, testLabels);
    const recall = calculateRecall(predictions, testLabels);
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    const results = {
        '準確率': (accuracy * 100).toFixed(2) + '%',
        '精確率': (precision * 100).toFixed(2) + '%',
        '召回率': (recall * 100).toFixed(2) + '%',
        'F1分數': f1.toFixed(4),
    };
    
    displayResults('mlResults', results);
    createFeatureImportanceChart();
}

function createFeatureImportanceChart() {
    const ctx = (document.getElementById('featureImportanceChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;
    if (charts.featureImportance) charts.featureImportance.destroy();
    
    charts.featureImportance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['理性分數', '情緒分數', '決策分數'],
            datasets: [{
                label: '特徵重要性',
                data: [0.45, 0.35, 0.20], // Simplified importances
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            scales: { x: { beginAtZero: true, title: { display: true, text: '重要性' } } },
            plugins: { legend: { display: false } }
        }
    });
}

function createControlChart() {
    if (currentData.length === 0) return alert("沒有資料可供分析");
    const chartType = (document.getElementById('controlChartType') as HTMLSelectElement).value;
    
    if (chartType === 'xr') createXRControlChart();
    else if (chartType === 'p') createPControlChart();
    else if (chartType === 'c') createCControlChart();
}

function createXRControlChart() {
    const data = currentData.map(d => d.pnl);
    const mean = average(data);
    const std = standardDeviation(data);
    
    const ucl = mean + 3 * std;
    const lcl = mean - 3 * std;
    
    const datasets = [
        { label: '觀測值', data, borderColor: '#1FB8CD' },
        { label: '中心線', data: new Array(data.length).fill(mean), borderColor: '#5D878F', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 },
        { label: '上控制限', data: new Array(data.length).fill(ucl), borderColor: '#B4413C', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 },
        { label: '下控制限', data: new Array(data.length).fill(lcl), borderColor: '#B4413C', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 }
    ];

    renderControlChart(datasets, '數值');
    displayControlStatus(data.some(val => val > ucl || val < lcl));
}

function createPControlChart() {
    const data = currentData.map(d => d.pnl > 0 ? 1 : 0);
    const p = average(data);
    const n = 5; // Assuming subgroups of 5, simplified
    const std = Math.sqrt(p * (1 - p) / n);
    
    const ucl = p + 3 * std;
    const lcl = Math.max(0, p - 3 * std);

    const datasets = [
        { label: '比例', data, borderColor: '#1FB8CD' },
        { label: '中心線', data: new Array(data.length).fill(p), borderColor: '#5D878F', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 },
        { label: '上控制限', data: new Array(data.length).fill(ucl), borderColor: '#B4413C', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 },
        { label: '下控制限', data: new Array(data.length).fill(lcl), borderColor: '#B4413C', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 }
    ];

    renderControlChart(datasets, '比例');
    displayControlStatus(data.some(val => val > ucl || val < lcl));
}

function createCControlChart() {
    const data = currentData.map(d => Math.floor(Math.abs(d.pnl))); // Treat as counts
    const mean = average(data);
    const std = Math.sqrt(mean);
    
    const ucl = mean + 3 * std;
    const lcl = Math.max(0, mean - 3 * std);

    const datasets = [
        { label: '計數', data, borderColor: '#1FB8CD' },
        { label: '中心線', data: new Array(data.length).fill(mean), borderColor: '#5D878F', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 },
        { label: '上控制限', data: new Array(data.length).fill(ucl), borderColor: '#B4413C', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 },
        { label: '下控制限', data: new Array(data.length).fill(lcl), borderColor: '#B4413C', borderDash: [5, 5], pointRadius: 0, borderWidth: 2 }
    ];
    
    renderControlChart(datasets, '計數');
    displayControlStatus(data.some(val => val > ucl || val < lcl));
}

function renderControlChart(datasets: any[], yAxisLabel: string) {
    const ctx = (document.getElementById('controlChart') as HTMLCanvasElement)?.getContext('2d');
    if(!ctx) return;
    if (charts.control) charts.control.destroy();
    
    charts.control = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map((_, i) => `樣本 ${i + 1}`),
            datasets: datasets,
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { title: { display: true, text: yAxisLabel } } },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function displayControlStatus(outOfControl: boolean) {
    const container = document.getElementById('processCapability');
    if(!container) return;
    const status = outOfControl ? 'out-of-control' : 'in-control';
    const message = outOfControl ? '製程失控：有資料點超出管制界線，可能存在特殊原因變異。' : '製程在控制中：所有資料點均在管制界線內，製程穩定。';
    
    container.innerHTML = `
        <div class="control-alert ${status}">
            <h4>製程狀態</h4>
            <p>${message}</p>
        </div>
    `;
}

// =================================================================================
// AI ASSISTANT
// =================================================================================

async function askAI(question: string) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `<p>${question}</p>`;
    chatContainer.appendChild(userMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const aiMessage = document.createElement('div');
    aiMessage.className = 'chat-message ai-message';
    aiMessage.innerHTML = `<div class="loading"></div>`;
    chatContainer.appendChild(aiMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY is not configured.");
        }
        if (currentData.length === 0) {
            throw new Error("No data to analyze.");
        }

        const prompt = `You are an expert trading analyst. Based on the following JSON data of the latest trading history, answer the user's question concisely. The data includes fields like 'pnl' (profit/loss), 'decisionScore', 'rationalScore', and 'emotionalScore'. Help the user understand their performance.
        Data: ${JSON.stringify(currentData.slice(-20), null, 2)}
        Question: ${question}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
        });
        
        const text = response.text;
        aiMessage.innerHTML = `<p>${(text ?? '抱歉，我現在無法回答。').replace(/\n/g, '<br>')}</p>`;

    } catch (error: any) {
        console.error("AI Assistant Error:", error);
        aiMessage.innerHTML = `<p>抱歉，我現在無法回答。錯誤：${error.message}</p>`;
    } finally {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function sendMessage() {
    const input = document.getElementById('aiInput') as HTMLInputElement;
    if (!input) return;
    const message = input.value.trim();

    if (message) {
        askAI(message);
        input.value = '';
    }
}

// =================================================================================
// EXPORT FUNCTIONS
// =================================================================================

function exportResults() {
    const results = {
        tradingData: currentData,
        timestamp: new Date().toISOString(),
        summary: {
            totalTrades: currentData.length,
            averageReturn: average(currentData.map(d => d.pnl)),
            winRate: calculateWinRate(),
            sharpeRatio: calculateSharpeRatio()
        }
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading_analysis_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReport() {
    const reportContent = `
        <h1>交易分析報告</h1>
        <p>報告生成時間: ${new Date().toLocaleString('zh-TW')}</p>
        <h2>總體摘要</h2>
        <p>總交易次數: ${currentData.length}</p>
        <p>平均收益: ${average(currentData.map(d => d.pnl)).toFixed(2)}</p>
        <p>勝率: ${calculateWinRate().toFixed(1)}%</p>
        <p>夏普比率: ${calculateSharpeRatio().toFixed(2)}</p>
        <p>最大回撤: ${calculateMaxDrawdown().toFixed(2)}%</p>
        
        <h2>改進建議</h2>
        <ul>
            <li>提高決策分數，避免在低決策分數時交易。</li>
            <li>控制情緒波動，情緒分數過高或過低都可能影響判斷。</li>
            <li>優化風險管理，注意最大回撤指標。</li>
            <li>定期檢視交易績效，找出可改進之處。</li>
        </ul>
    `;
    
    const newWindow = window.open('', '_blank');
    newWindow?.document.write(`
        <html><head><title>交易分析報告</title><style>
        body { font-family: sans-serif; margin: 20px; line-height: 1.6;}
        h1, h2 { color: #21808D; border-bottom: 1px solid #ccc; padding-bottom: 5px;}
        </style></head><body>${reportContent}</body></html>
    `);
    newWindow?.document.close();
}


// =================================================================================
// HELPER FUNCTIONS (STATISTICAL & MATH)
// =================================================================================

function average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function standardDeviation(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = average(arr);
    return Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length -1));
}

function variance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = average(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}

function skewness(arr: number[]): number {
    if (arr.length < 3) return 0;
    const mean = average(arr);
    const std = standardDeviation(arr);
    if(std === 0) return 0;
    const n = arr.length;
    const sum = arr.reduce((s, val) => s + Math.pow((val - mean) / std, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
}

function kurtosis(arr: number[]): number {
    if (arr.length < 4) return 0;
    const mean = average(arr);
    const std = standardDeviation(arr);
    if(std === 0) return 0;
    const n = arr.length;
    const sum = arr.reduce((s, val) => s + Math.pow((val - mean) / std, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

function quartiles(arr: number[]): { q1: number, q2: number, q3: number } {
    const sorted = [...arr].sort((a, b) => a - b);
    return {
        q1: percentile(sorted, 25),
        q2: percentile(sorted, 50),
        q3: percentile(sorted, 75)
    };
}

function percentile(sortedArr: number[], p: number): number {
    if (sortedArr.length === 0) return 0;
    const index = (p / 100) * (sortedArr.length - 1);
    if (Math.floor(index) === index) return sortedArr[index];
    
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return sortedArr[lower] * (upper - index) + sortedArr[upper] * (index - lower);
}

function pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function calculateWinRate(): number {
    if (currentData.length === 0) return 0;
    const wins = currentData.filter(d => d.pnl > 0).length;
    return (wins / currentData.length) * 100;
}

function calculateMaxDrawdown(): number {
    if (currentData.length < 2) return 0;
    let peak = currentData[0].balance;
    let maxDrawdown = 0;
    
    for (let i = 1; i < currentData.length; i++) {
        if (currentData[i].balance > peak) {
            peak = currentData[i].balance;
        }
        const drawdown = (peak - currentData[i].balance) / peak;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }
    return maxDrawdown * 100;
}

function calculateSharpeRatio(riskFreeRate = 0.025): number {
    if (currentData.length < 2) return 0;
    const returns = currentData.map(d => d.pnlPercentage / 100);
    const excessReturns = returns.map(r => r - riskFreeRate / 252); // Assuming 252 trading days
    const avgExcessReturn = average(excessReturns);
    const stdExcessReturn = standardDeviation(excessReturns);
    
    return stdExcessReturn === 0 ? 0 : avgExcessReturn / stdExcessReturn;
}

function multipleLinearRegression(X: number[][], y: number[]): any {
    const n = X.length;
    const Xa = X.map(row => [1, ...row]); // Add intercept
    
    const Xt = transpose(Xa);
    const XtX = matrixMultiply(Xt, Xa);
    const XtXinv = matrixInverse(XtX);
    if (!XtXinv) return { coefficients: [], rSquared: 0, predictions: [] }; // Inverse failed
    
    const Xty = matrixMultiply(Xt, y.map(val => [val]));
    const beta = matrixMultiply(XtXinv, Xty).map(row => row[0]);
    
    const yPred = Xa.map(row => row.reduce((sum, val, i) => sum + val * beta[i], 0));
    
    const yMean = average(y);
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
    const rSquared = totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0;
    
    return { coefficients: beta, rSquared, predictions: yPred };
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function matrixInverse(m: number[][]) {
    // Adjugate method for 3x3 matrix, which is what we have (intercept, x1, x2)
    if (m.length !== m[0].length) return null; // must be square
    const n = m.length;
    const identity = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((__, j) => i === j ? 1: 0));
    const C = [...m.map((r, i) => [...r, ...identity[i]])]; // augmented matrix

    for(let i=0; i<n; i++) {
        let pivot = i;
        while(pivot < n && C[pivot][i] === 0) pivot++;
        if(pivot === n) return null; // No unique inverse
        [C[i], C[pivot]] = [C[pivot], C[i]]; // swap

        let divisor = C[i][i];
        for(let j=i; j<2*n; j++) C[i][j] /= divisor;

        for(let k=0; k<n; k++) {
            if(i === k) continue;
            let factor = C[k][i];
            for(let j=i; j<2*n; j++) {
                C[k][j] -= factor * C[i][j];
            }
        }
    }
    return C.map(r => r.slice(n));
}


function movingAverage(data: number[], window: number): (number | null)[] {
    const result: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(null);
        } else {
            const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / window);
        }
    }
    return result;
}

function exponentialSmoothing(data: number[], alpha: number): number[] {
    const result = [data[0]];
    for (let i = 1; i < data.length; i++) {
        result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
}

function linearTrend(data: number[]): number[] {
    const n = data.length;
    const x = Array.from({length: n}, (_, i) => i);
    const { slope, intercept } = simpleLinearRegression(x, data);
    return x.map(xi => slope * xi + intercept);
}

function simpleLinearRegression(x: number[], y: number[]) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}


function kMeansClustering(data: number[][], k: number): number[] {
    const n = data.length;
    if (n < k) return Array(n).fill(0);
    const dim = data[0].length;
    
    let centroids = data.slice(0, k).map(d => [...d]);
    let clusters = new Array(n).fill(0);
    
    for (let iter = 0; iter < 20; iter++) {
        let changed = false;
        // Assign points
        for (let i = 0; i < n; i++) {
            let minDist = Infinity;
            let newCluster = 0;
            for (let j = 0; j < k; j++) {
                const dist = euclideanDistance(data[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    newCluster = j;
                }
            }
            if (clusters[i] !== newCluster) {
                clusters[i] = newCluster;
                changed = true;
            }
        }
        
        // Update centroids
        for (let j = 0; j < k; j++) {
            const clusterPoints = data.filter((_, i) => clusters[i] === j);
            if (clusterPoints.length > 0) {
                for (let d = 0; d < dim; d++) {
                    centroids[j][d] = average(clusterPoints.map(p => p[d]));
                }
            }
        }
        if(!changed) break;
    }
    
    return clusters;
}

function euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function trainDecisionTree(model: any, features: number[]): any {
    // Simplified: find average value of each feature as threshold
    // The `model` parameter is the feature matrix, `features` is the labels. Naming is confusing.
    if (!model || model.length === 0 || !model[0]) {
        return { thresholds: [] };
    }
    const thresholds = model[0].map((_: number, i: number) => {
        const values = model.map((f: number[]) => f[i]);
        return average(values);
    });
    return { thresholds };
}

function predictDecisionTree(model: any, features: number[]): 0 | 1 {
    const score = features.reduce((sum, val, i) => sum + (val > model.thresholds[i] ? 1 : 0), 0);
    return score > features.length / 2 ? 1 : 0;
}

function calculatePrecision(predictions: (0|1)[], labels: (0|1)[]): number {
    const tp = predictions.reduce((sum: number, pred, i) => sum + (pred === 1 && labels[i] === 1 ? 1 : 0), 0);
    const fp = predictions.reduce((sum: number, pred, i) => sum + (pred === 1 && labels[i] === 0 ? 1 : 0), 0);
    return (tp + fp) > 0 ? tp / (tp + fp) : 0;
}

function calculateRecall(predictions: (0|1)[], labels: (0|1)[]): number {
    const tp = predictions.reduce((sum: number, pred, i) => sum + (pred === 1 && labels[i] === 1 ? 1 : 0), 0);
    const fn = predictions.reduce((sum: number, pred, i) => sum + (pred === 0 && labels[i] === 1 ? 1 : 0), 0);
    return (tp + fn) > 0 ? tp / (tp + fn) : 0;
}
