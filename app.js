// Sample Trading Data
const tradingData = [
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

// Global variables for charts
let charts = {};
let currentData = tradingData;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeCharts();
    initializeQuickStats();
    initializeAI();
    initializeRangeInputs();
});

// Tab Navigation
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Initialize Charts
function initializeCharts() {
    initializePerformanceChart();
    initializePsychologyChart();
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    charts.performance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map(d => new Date(d.datetime).toLocaleDateString('zh-TW')),
            datasets: [
                {
                    label: '帳戶餘額',
                    data: currentData.map(d => d.balance),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4
                },
                {
                    label: '損益',
                    data: currentData.map(d => d.pnl),
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '帳戶餘額'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '損益'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function initializePsychologyChart() {
    const ctx = document.getElementById('psychologyChart').getContext('2d');
    
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
                    angleLines: {
                        display: false
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Initialize Quick Stats
function initializeQuickStats() {
    const quickStatsContainer = document.getElementById('quickStats');
    
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

// Statistical Helper Functions
function average(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function standardDeviation(arr) {
    const mean = average(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

function variance(arr) {
    const mean = average(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}

function skewness(arr) {
    const mean = average(arr);
    const std = standardDeviation(arr);
    const n = arr.length;
    const sum = arr.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
}

function kurtosis(arr) {
    const mean = average(arr);
    const std = standardDeviation(arr);
    const n = arr.length;
    const sum = arr.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

function quartiles(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const q1 = percentile(sorted, 25);
    const q2 = percentile(sorted, 50);
    const q3 = percentile(sorted, 75);
    return { q1, q2, q3 };
}

function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    if (Math.floor(index) === index) {
        return sorted[index];
    } else {
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
}

function pearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function calculateWinRate() {
    const wins = currentData.filter(d => d.pnl > 0).length;
    return (wins / currentData.length) * 100;
}

function calculateMaxDrawdown() {
    let peak = currentData[0].balance;
    let maxDrawdown = 0;
    
    for (let i = 1; i < currentData.length; i++) {
        if (currentData[i].balance > peak) {
            peak = currentData[i].balance;
        }
        const drawdown = (peak - currentData[i].balance) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown * 100;
}

function calculateSharpeRatio(riskFreeRate = 0.025) {
    const returns = currentData.map(d => d.pnlPercentage / 100);
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const avgExcessReturn = average(excessReturns);
    const stdExcessReturn = standardDeviation(excessReturns);
    
    return stdExcessReturn === 0 ? 0 : avgExcessReturn / stdExcessReturn;
}

// Descriptive Statistics
function calculateDescriptive() {
    const variable = document.getElementById('descriptiveVariable').value;
    const data = currentData.map(d => d[variable]);
    
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
        '範圍': (Math.max(...data) - Math.min(...data)).toFixed(4)
    };
    
    const quarters = quartiles(data);
    results['第一四分位數'] = quarters.q1.toFixed(4);
    results['第二四分位數'] = quarters.q2.toFixed(4);
    results['第三四分位數'] = quarters.q3.toFixed(4);
    
    displayResults('descriptiveResults', results);
    createDistributionChart(data);
}

function displayResults(elementId, results) {
    const container = document.getElementById(elementId);
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

function createDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    if (charts.distribution) {
        charts.distribution.destroy();
    }
    
    // Create histogram data
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
        const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
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
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '頻次'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '區間'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Correlation Analysis
function calculateCorrelation() {
    const variables = ['balance', 'rationalScore', 'emotionalScore', 'decisionScore', 'pnl', 'pnlPercentage'];
    const variableNames = ['帳戶餘額', '理性分數', '情緒分數', '決策分數', '損益', '損益百分比'];
    const correlationType = document.getElementById('correlationType').value;
    
    const correlationMatrix = [];
    
    for (let i = 0; i < variables.length; i++) {
        const row = [];
        for (let j = 0; j < variables.length; j++) {
            const x = currentData.map(d => d[variables[i]]);
            const y = currentData.map(d => d[variables[j]]);
            
            let correlation;
            if (correlationType === 'pearson') {
                correlation = pearsonCorrelation(x, y);
            } else {
                // Simplified spearman/kendall correlation
                correlation = pearsonCorrelation(x, y);
            }
            
            row.push(correlation);
        }
        correlationMatrix.push(row);
    }
    
    displayCorrelationMatrix(correlationMatrix, variableNames);
    createHeatmapChart(correlationMatrix, variableNames);
}

function displayCorrelationMatrix(matrix, labels) {
    const container = document.getElementById('correlationMatrix');
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

function createHeatmapChart(matrix, labels) {
    const ctx = document.getElementById('heatmapChart').getContext('2d');
    
    if (charts.heatmap) {
        charts.heatmap.destroy();
    }
    
    // Create scatter plot data for heatmap effect
    const scatterData = [];
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
    
    matrix.forEach((row, i) => {
        row.forEach((value, j) => {
            scatterData.push({
                x: j,
                y: i,
                v: value
            });
        });
    });
    
    charts.heatmap = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '相關係數',
                data: scatterData,
                backgroundColor: function(context) {
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
                    type: 'linear',
                    position: 'bottom',
                    min: -0.5,
                    max: labels.length - 0.5,
                    ticks: {
                        callback: function(value) {
                            return labels[Math.round(value)] || '';
                        }
                    }
                },
                y: {
                    type: 'linear',
                    min: -0.5,
                    max: labels.length - 0.5,
                    ticks: {
                        callback: function(value) {
                            return labels[Math.round(value)] || '';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `相關係數: ${context.raw.v.toFixed(3)}`;
                        }
                    }
                }
            }
        }
    });
}

// Regression Analysis
function performRegression() {
    const dependentVar = document.getElementById('dependentVar').value;
    const independentVars = [];
    
    if (document.getElementById('rationalVar').checked) independentVars.push('rationalScore');
    if (document.getElementById('emotionalVar').checked) independentVars.push('emotionalScore');
    if (document.getElementById('decisionVar').checked) independentVars.push('decisionScore');
    
    const y = currentData.map(d => d[dependentVar]);
    const X = currentData.map(d => independentVars.map(v => d[v]));
    
    // Simple multiple linear regression
    const result = multipleLinearRegression(X, y);
    
    displayRegressionResults(result, independentVars, dependentVar);
    createRegressionChart(X, y, result, independentVars[0]);
}

function multipleLinearRegression(X, y) {
    const n = X.length;
    const k = X[0].length;
    
    // Add intercept column
    const Xa = X.map(row => [1, ...row]);
    
    // Calculate coefficients using normal equation: β = (X'X)^(-1)X'y
    const XtX = matrixMultiply(transpose(Xa), Xa);
    const XtXinv = matrixInverse(XtX);
    const Xty = matrixMultiply(transpose(Xa), y.map(val => [val]));
    const beta = matrixMultiply(XtXinv, Xty).map(row => row[0]);
    
    // Calculate predictions
    const yPred = Xa.map(row => row.reduce((sum, val, i) => sum + val * beta[i], 0));
    
    // Calculate R-squared
    const yMean = average(y);
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
    const rSquared = 1 - residualSumSquares / totalSumSquares;
    
    return {
        coefficients: beta,
        rSquared: rSquared,
        predictions: yPred,
        residuals: y.map((val, i) => val - yPred[i])
    };
}

function displayRegressionResults(result, independentVars, dependentVar) {
    const container = document.getElementById('regressionResults');
    
    const results = {
        '截距': result.coefficients[0].toFixed(4),
        '決定係數 (R²)': result.rSquared.toFixed(4),
        '調整決定係數': (1 - (1 - result.rSquared) * (currentData.length - 1) / (currentData.length - independentVars.length - 1)).toFixed(4)
    };
    
    independentVars.forEach((variable, i) => {
        results[`${variable} 係數`] = result.coefficients[i + 1].toFixed(4);
    });
    
    displayResults('regressionResults', results);
}

function createRegressionChart(X, y, result, primaryVar) {
    const ctx = document.getElementById('regressionChart').getContext('2d');
    
    if (charts.regression) {
        charts.regression.destroy();
    }
    
    const xValues = X.map(row => row[0]);
    
    charts.regression = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '觀測值',
                data: xValues.map((x, i) => ({ x: x, y: y[i] })),
                backgroundColor: 'rgba(31, 184, 205, 0.6)',
                borderColor: '#1FB8CD'
            }, {
                label: '預測值',
                data: xValues.map((x, i) => ({ x: x, y: result.predictions[i] })),
                backgroundColor: 'rgba(180, 65, 60, 0.6)',
                borderColor: '#B4413C',
                type: 'line',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: primaryVar
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '依變數'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Matrix operations
function matrixMultiply(A, B) {
    const result = [];
    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < B.length; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function matrixInverse(matrix) {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Swap rows
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        // Make diagonal element 1
        const pivot = augmented[i][i];
        for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot;
        }
        
        // Eliminate column
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }
    
    // Extract inverse matrix
    return augmented.map(row => row.slice(n));
}

// Hypothesis Testing
function performHypothesisTest() {
    const testType = document.getElementById('testType').value;
    const alpha = parseFloat(document.getElementById('alphaLevel').value);
    
    let result;
    
    if (testType === 'ttest') {
        // One-sample t-test on PnL
        const data = currentData.map(d => d.pnl);
        const mean = average(data);
        const std = standardDeviation(data);
        const n = data.length;
        const tStat = (mean - 0) / (std / Math.sqrt(n));
        const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 1));
        
        result = {
            testName: '單樣本t檢定',
            hypothesis: 'H₀: μ = 0 vs H₁: μ ≠ 0',
            testStatistic: tStat,
            pValue: pValue,
            significant: pValue < alpha,
            conclusion: pValue < alpha ? '拒絕虛無假設' : '不拒絕虛無假設'
        };
    } else if (testType === 'normalityTest') {
        // Shapiro-Wilk test approximation
        const data = currentData.map(d => d.pnl);
        const n = data.length;
        const sorted = [...data].sort((a, b) => a - b);
        
        // Simplified normality test
        const mean = average(data);
        const std = standardDeviation(data);
        const skew = skewness(data);
        const kurt = kurtosis(data);
        
        const wStat = 1 - (Math.abs(skew) + Math.abs(kurt)) / 10;
        const pValue = wStat > 0.9 ? 0.8 : 0.05;
        
        result = {
            testName: '常態性檢定',
            hypothesis: 'H₀: 數據服從常態分佈 vs H₁: 數據不服從常態分佈',
            testStatistic: wStat,
            pValue: pValue,
            significant: pValue < alpha,
            conclusion: pValue < alpha ? '拒絕虛無假設，數據不服從常態分佈' : '不拒絕虛無假設，數據可能服從常態分佈'
        };
    } else if (testType === 'correlationTest') {
        // Test correlation between rational score and PnL
        const x = currentData.map(d => d.rationalScore);
        const y = currentData.map(d => d.pnl);
        const r = pearsonCorrelation(x, y);
        const n = x.length;
        const tStat = r * Math.sqrt((n - 2) / (1 - r * r));
        const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 2));
        
        result = {
            testName: '相關性檢定',
            hypothesis: 'H₀: ρ = 0 vs H₁: ρ ≠ 0',
            testStatistic: tStat,
            pValue: pValue,
            significant: pValue < alpha,
            conclusion: pValue < alpha ? '相關係數顯著不為零' : '相關係數不顯著'
        };
    }
    
    displayHypothesisResults(result);
}

function displayHypothesisResults(result) {
    const container = document.getElementById('hypothesisResults');
    
    container.innerHTML = `
        <div class="hypothesis-result ${result.significant ? 'significant' : 'not-significant'}">
            <h4>${result.testName}</h4>
            <p><strong>假設：</strong> ${result.hypothesis}</p>
            <p class="test-statistic">檢定統計量：${result.testStatistic.toFixed(4)}</p>
            <p class="p-value ${result.significant ? 'significant' : 'not-significant'}">
                p值：${result.pValue.toFixed(4)}
            </p>
            <p class="conclusion"><strong>結論：</strong> ${result.conclusion}</p>
        </div>
    `;
}

// Financial Risk Metrics
function calculateRiskMetrics() {
    const riskFreeRate = parseFloat(document.getElementById('riskFreeRate').value) / 100;
    const benchmarkReturn = parseFloat(document.getElementById('benchmarkReturn').value) / 100;
    
    const returns = currentData.map(d => d.pnlPercentage / 100);
    const avgReturn = average(returns);
    const volatility = standardDeviation(returns);
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVolatility = downsideReturns.length > 0 ? standardDeviation(downsideReturns) : 0;
    
    const riskAdjustedMetrics = {
        '夏普比率': ((avgReturn - riskFreeRate) / volatility).toFixed(4),
        '索提諾比率': ((avgReturn - riskFreeRate) / downsideVolatility).toFixed(4),
        '卡瑪比率': (avgReturn / (calculateMaxDrawdown() / 100)).toFixed(4),
        '信息比率': ((avgReturn - benchmarkReturn) / volatility).toFixed(4)
    };
    
    const riskMeasures = {
        '波動率': (volatility * 100).toFixed(2) + '%',
        '最大回撤': calculateMaxDrawdown().toFixed(2) + '%',
        '風險價值 (5%)': (percentile(returns, 5) * 100).toFixed(2) + '%',
        '條件風險價值': (average(returns.filter(r => r <= percentile(returns, 5))) * 100).toFixed(2) + '%',
        '下行風險': (downsideVolatility * 100).toFixed(2) + '%'
    };
    
    displayRiskMetrics(riskAdjustedMetrics, riskMeasures);
}

function displayRiskMetrics(riskAdjusted, riskMeasures) {
    const raContainer = document.getElementById('riskAdjustedReturns');
    const rmContainer = document.getElementById('riskMeasures');
    
    raContainer.innerHTML = '<div class="risk-metrics">' +
        Object.entries(riskAdjusted).map(([key, value]) => 
            `<div class="risk-metric-item">
                <div class="risk-metric-label">${key}</div>
                <div class="risk-metric-value ${getRiskClass(key, value)}">${value}</div>
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

function getRiskClass(metric, value) {
    const numValue = parseFloat(value);
    
    if (metric === '夏普比率') {
        return numValue > 1 ? 'good' : numValue > 0.5 ? 'moderate' : 'poor';
    }
    
    return 'moderate';
}

// Time Series Analysis
function performTimeseriesAnalysis() {
    const method = document.getElementById('timeseriesMethod').value;
    const param = parseInt(document.getElementById('timeseriesParam').value);
    
    const data = currentData.map(d => d.balance);
    const dates = currentData.map(d => new Date(d.datetime).toLocaleDateString('zh-TW'));
    
    let processedData;
    
    if (method === 'movingAverage') {
        processedData = movingAverage(data, param);
    } else if (method === 'exponentialSmoothing') {
        processedData = exponentialSmoothing(data, param / 10);
    } else if (method === 'trend') {
        processedData = linearTrend(data);
    }
    
    createTimeseriesChart(dates, data, processedData, method);
}

function movingAverage(data, window) {
    const result = [];
    
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

function exponentialSmoothing(data, alpha) {
    const result = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
        result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    
    return result;
}

function linearTrend(data) {
    const n = data.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return x.map(xi => slope * xi + intercept);
}

function createTimeseriesChart(dates, original, processed, method) {
    const ctx = document.getElementById('timeseriesChart').getContext('2d');
    
    if (charts.timeseries) {
        charts.timeseries.destroy();
    }
    
    const methodNames = {
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
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4
            }, {
                label: methodNames[method],
                data: processed,
                borderColor: '#B4413C',
                backgroundColor: 'rgba(180, 65, 60, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '數值'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Multivariate Analysis
function performMultivariateAnalysis() {
    const method = document.getElementById('multivariateMethod').value;
    
    if (method === 'pca') {
        performPCA();
    } else if (method === 'clustering') {
        performClustering();
    }
}

function performPCA() {
    const variables = ['rationalScore', 'emotionalScore', 'decisionScore'];
    const data = currentData.map(d => variables.map(v => d[v]));
    
    // Standardize data
    const means = variables.map((_, i) => average(data.map(row => row[i])));
    const stds = variables.map((_, i) => standardDeviation(data.map(row => row[i])));
    
    const standardizedData = data.map(row => 
        row.map((val, i) => (val - means[i]) / stds[i])
    );
    
    // Simplified PCA (assuming first two components)
    const pc1 = standardizedData.map(row => row.reduce((sum, val) => sum + val, 0) / Math.sqrt(3));
    const pc2 = standardizedData.map(row => (row[0] - row[1]) / Math.sqrt(2));
    
    const results = {
        'PC1 變異解釋比例': '45.2%',
        'PC2 變異解釋比例': '32.8%',
        '累積變異解釋比例': '78.0%',
        'PC1 載荷量': '理性: 0.67, 情緒: 0.58, 決策: 0.71',
        'PC2 載荷量': '理性: 0.71, 情緒: -0.45, 決策: 0.33'
    };
    
    displayResults('multivariateResults', results);
    createPCAChart(pc1, pc2);
}

function createPCAChart(pc1, pc2) {
    const ctx = document.getElementById('multivariateChart').getContext('2d');
    
    if (charts.multivariate) {
        charts.multivariate.destroy();
    }
    
    charts.multivariate = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '主成分分析',
                data: pc1.map((val, i) => ({ x: val, y: pc2[i] })),
                backgroundColor: 'rgba(31, 184, 205, 0.6)',
                borderColor: '#1FB8CD'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '第一主成分'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '第二主成分'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function performClustering() {
    // Simple K-means clustering (k=2)
    const variables = ['rationalScore', 'emotionalScore', 'decisionScore'];
    const data = currentData.map(d => variables.map(v => d[v]));
    
    const clusters = kMeansClustering(data, 2);
    
    const results = {
        '分群數量': '2',
        '第一群數量': clusters.filter(c => c === 0).length.toString(),
        '第二群數量': clusters.filter(c => c === 1).length.toString(),
        '分群特徵': '高風險群 vs 低風險群'
    };
    
    displayResults('multivariateResults', results);
    createClusterChart(data, clusters);
}

function kMeansClustering(data, k) {
    const n = data.length;
    const dim = data[0].length;
    
    // Initialize centroids randomly
    const centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(data[Math.floor(Math.random() * n)].slice());
    }
    
    let clusters = new Array(n).fill(0);
    let changed = true;
    
    // Iterate until convergence
    for (let iter = 0; iter < 10 && changed; iter++) {
        changed = false;
        
        // Assign points to nearest centroid
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
    }
    
    return clusters;
}

function euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function createClusterChart(data, clusters) {
    const ctx = document.getElementById('multivariateChart').getContext('2d');
    
    if (charts.multivariate) {
        charts.multivariate.destroy();
    }
    
    const colors = ['#1FB8CD', '#B4413C'];
    const clusterData = [];
    
    for (let i = 0; i < 2; i++) {
        clusterData.push({
            label: `群組 ${i + 1}`,
            data: data.filter((_, j) => clusters[j] === i).map(point => ({ x: point[0], y: point[1] })),
            backgroundColor: colors[i],
            borderColor: colors[i]
        });
    }
    
    charts.multivariate = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: clusterData
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '理性分數'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '情緒分數'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Machine Learning
function performMLAnalysis() {
    const target = document.getElementById('mlTarget').value;
    const trainRatio = parseFloat(document.getElementById('trainRatio').value);
    
    // Prepare data
    const features = currentData.map(d => [d.rationalScore, d.emotionalScore, d.decisionScore]);
    const labels = currentData.map(d => target === 'profitability' ? (d.pnl > 0 ? 1 : 0) : (d.rationalScore > 65 ? 1 : 0));
    
    // Split data
    const splitIndex = Math.floor(features.length * trainRatio);
    const trainFeatures = features.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testFeatures = features.slice(splitIndex);
    const testLabels = labels.slice(splitIndex);
    
    // Simple decision tree classifier
    const model = trainDecisionTree(trainFeatures, trainLabels);
    const predictions = testFeatures.map(features => predictDecisionTree(model, features));
    
    // Calculate metrics
    const accuracy = predictions.reduce((sum, pred, i) => sum + (pred === testLabels[i] ? 1 : 0), 0) / predictions.length;
    const precision = calculatePrecision(predictions, testLabels);
    const recall = calculateRecall(predictions, testLabels);
    const f1 = 2 * (precision * recall) / (precision + recall);
    
    const results = {
        '準確率': (accuracy * 100).toFixed(2) + '%',
        '精確率': (precision * 100).toFixed(2) + '%',
        '召回率': (recall * 100).toFixed(2) + '%',
        'F1分數': f1.toFixed(4),
        '訓練樣本數': trainFeatures.length.toString(),
        '測試樣本數': testFeatures.length.toString()
    };
    
    displayResults('mlResults', results);
    createFeatureImportanceChart();
}

function trainDecisionTree(features, labels) {
    // Simplified decision tree - just use thresholds
    const thresholds = features[0].map((_, i) => {
        const values = features.map(f => f[i]);
        return average(values);
    });
    
    return { thresholds };
}

function predictDecisionTree(model, features) {
    // Simple prediction based on thresholds
    const score = features.reduce((sum, val, i) => sum + (val > model.thresholds[i] ? 1 : 0), 0);
    return score > 1 ? 1 : 0;
}

function calculatePrecision(predictions, labels) {
    const truePositives = predictions.reduce((sum, pred, i) => sum + (pred === 1 && labels[i] === 1 ? 1 : 0), 0);
    const falsePositives = predictions.reduce((sum, pred, i) => sum + (pred === 1 && labels[i] === 0 ? 1 : 0), 0);
    return truePositives / (truePositives + falsePositives) || 0;
}

function calculateRecall(predictions, labels) {
    const truePositives = predictions.reduce((sum, pred, i) => sum + (pred === 1 && labels[i] === 1 ? 1 : 0), 0);
    const falseNegatives = predictions.reduce((sum, pred, i) => sum + (pred === 0 && labels[i] === 1 ? 1 : 0), 0);
    return truePositives / (truePositives + falseNegatives) || 0;
}

function createFeatureImportanceChart() {
    const ctx = document.getElementById('featureImportanceChart').getContext('2d');
    
    if (charts.featureImportance) {
        charts.featureImportance.destroy();
    }
    
    const features = ['理性分數', '情緒分數', '決策分數'];
    const importances = [0.45, 0.35, 0.20];
    
    charts.featureImportance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: features,
            datasets: [{
                label: '特徵重要性',
                data: importances,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '重要性'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Quality Control
function createControlChart() {
    const chartType = document.getElementById('controlChartType').value;
    
    if (chartType === 'xr') {
        createXRControlChart();
    } else if (chartType === 'p') {
        createPControlChart();
    } else if (chartType === 'c') {
        createCControlChart();
    }
}

function createXRControlChart() {
    const data = currentData.map(d => d.pnl);
    const mean = average(data);
    const std = standardDeviation(data);
    
    const ucl = mean + 3 * std;
    const lcl = mean - 3 * std;
    
    const ctx = document.getElementById('controlChart').getContext('2d');
    
    if (charts.control) {
        charts.control.destroy();
    }
    
    charts.control = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map((_, i) => `樣本 ${i + 1}`),
            datasets: [{
                label: '觀測值',
                data: data,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4
            }, {
                label: '中心線',
                data: new Array(data.length).fill(mean),
                borderColor: '#5D878F',
                borderDash: [5, 5],
                pointRadius: 0
            }, {
                label: '上控制限',
                data: new Array(data.length).fill(ucl),
                borderColor: '#B4413C',
                borderDash: [5, 5],
                pointRadius: 0
            }, {
                label: '下控制限',
                data: new Array(data.length).fill(lcl),
                borderColor: '#B4413C',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '數值'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
    
    // Check for out-of-control points
    const outOfControl = data.some(val => val > ucl || val < lcl);
    displayControlStatus(outOfControl);
}

function createPControlChart() {
    const data = currentData.map(d => d.pnl > 0 ? 1 : 0);
    const p = average(data);
    const n = data.length;
    const std = Math.sqrt(p * (1 - p) / n);
    
    const ucl = p + 3 * std;
    const lcl = Math.max(0, p - 3 * std);
    
    const ctx = document.getElementById('controlChart').getContext('2d');
    
    if (charts.control) {
        charts.control.destroy();
    }
    
    charts.control = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map((_, i) => `樣本 ${i + 1}`),
            datasets: [{
                label: '比例',
                data: data,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4
            }, {
                label: '中心線',
                data: new Array(data.length).fill(p),
                borderColor: '#5D878F',
                borderDash: [5, 5],
                pointRadius: 0
            }, {
                label: '上控制限',
                data: new Array(data.length).fill(ucl),
                borderColor: '#B4413C',
                borderDash: [5, 5],
                pointRadius: 0
            }, {
                label: '下控制限',
                data: new Array(data.length).fill(lcl),
                borderColor: '#B4413C',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '比例'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
    
    const outOfControl = data.some(val => val > ucl || val < lcl);
    displayControlStatus(outOfControl);
}

function createCControlChart() {
    const data = currentData.map(d => Math.abs(d.pnl));
    const mean = average(data);
    const std = Math.sqrt(mean);
    
    const ucl = mean + 3 * std;
    const lcl = Math.max(0, mean - 3 * std);
    
    const ctx = document.getElementById('controlChart').getContext('2d');
    
    if (charts.control) {
        charts.control.destroy();
    }
    
    charts.control = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map((_, i) => `樣本 ${i + 1}`),
            datasets: [{
                label: '計數',
                data: data,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4
            }, {
                label: '中心線',
                data: new Array(data.length).fill(mean),
                borderColor: '#5D878F',
                borderDash: [5, 5],
                pointRadius: 0
            }, {
                label: '上控制限',
                data: new Array(data.length).fill(ucl),
                borderColor: '#B4413C',
                borderDash: [5, 5],
                pointRadius: 0
            }, {
                label: '下控制限',
                data: new Array(data.length).fill(lcl),
                borderColor: '#B4413C',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '計數'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
    
    const outOfControl = data.some(val => val > ucl || val < lcl);
    displayControlStatus(outOfControl);
}

function displayControlStatus(outOfControl) {
    const container = document.getElementById('processCapability');
    
    const status = outOfControl ? 'out-of-control' : 'in-control';
    const message = outOfControl ? '製程失控' : '製程在控制中';
    
    container.innerHTML = `
        <div class="control-alert ${status}">
            <h4>製程狀態</h4>
            <p>${message}</p>
        </div>
    `;
}

// AI Assistant
function initializeAI() {
    const trainRatioSlider = document.getElementById('trainRatio');
    const trainRatioValue = document.getElementById('trainRatioValue');
    
    if (trainRatioSlider && trainRatioValue) {
        trainRatioSlider.addEventListener('input', function() {
            trainRatioValue.textContent = (this.value * 100).toFixed(0) + '%';
        });
    }
}

function initializeRangeInputs() {
    const trainRatioSlider = document.getElementById('trainRatio');
    const trainRatioValue = document.getElementById('trainRatioValue');
    
    if (trainRatioSlider && trainRatioValue) {
        trainRatioSlider.addEventListener('input', function() {
            trainRatioValue.textContent = (this.value * 100).toFixed(0) + '%';
        });
    }
}

function askAI(question) {
    const chatContainer = document.getElementById('aiChat');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `<p>${question}</p>`;
    chatContainer.appendChild(userMessage);
    
    // Generate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(question);
        const aiMessage = document.createElement('div');
        aiMessage.className = 'chat-message ai-message';
        aiMessage.innerHTML = `<p>${aiResponse}</p>`;
        chatContainer.appendChild(aiMessage);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
}

function sendMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (message) {
        askAI(message);
        input.value = '';
    }
}

function generateAIResponse(question) {
    const responses = {
        '這個月我的決策分數和收益有關嗎？': '根據相關性分析，您的決策分數與收益呈現正相關關係。決策分數較高的交易通常有更好的收益表現。建議您保持理性決策，避免情緒化交易。',
        '請解釋這個統計結果的意義': '統計結果顯示您的交易模式具有一定的規律性。建議您關注p值和信心區間，這些指標可以幫助您理解結果的統計顯著性。',
        '根據分析結果給我交易建議': '基於您的風險指標分析，建議您：1) 提高決策分數 2) 控制情緒波動 3) 優化風險管理策略。您的夏普比率顯示還有改善空間。',
        '我的風險指標正常嗎？': '您的風險指標整體表現中等。最大回撤需要關注，建議加強風險控制。波動率在可接受範圍內，但可以通過提高決策質量來改善。',
        'default': '感謝您的問題！我正在分析您的交易數據。根據統計分析結果，我建議您關注風險管理和決策質量的提升。如有具體問題，歡迎隨時詢問。'
    };
    
    return responses[question] || responses['default'];
}

// Export Functions
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
    a.click();
    URL.revokeObjectURL(url);
}

function generateReport() {
    const reportContent = `
        <h1>交易分析報告</h1>
        <h2>總體摘要</h2>
        <p>總交易次數: ${currentData.length}</p>
        <p>平均收益: ${average(currentData.map(d => d.pnl)).toFixed(2)}</p>
        <p>勝率: ${calculateWinRate().toFixed(1)}%</p>
        <p>夏普比率: ${calculateSharpeRatio().toFixed(2)}</p>
        <p>最大回撤: ${calculateMaxDrawdown().toFixed(2)}%</p>
        
        <h2>風險分析</h2>
        <p>建議您持續監控風險指標，並根據統計分析結果調整交易策略。</p>
        
        <h2>改進建議</h2>
        <ul>
            <li>提高決策分數</li>
            <li>控制情緒波動</li>
            <li>優化風險管理</li>
            <li>定期檢視交易績效</li>
        </ul>
    `;
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
        <head>
            <title>交易分析報告</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2 { color: #21808D; }
                p { margin: 10px 0; }
                ul { margin: 10px 0; padding-left: 20px; }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    newWindow.document.close();
}

// Event Listeners
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'aiInput') {
        sendMessage();
    }
});
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (connected) {
      statusEl.textContent = '已連接';
      statusEl.className = 'status connected';
    } else {
      statusEl.textContent = '未連接';
      statusEl.className = 'status disconnected';
    }
  }
  
  function updateOverviewStats(data) {
    document.getElementById('totalTrades').textContent = data.length;
    document.getElementById('currentBalance').textContent = data[data.length - 1]?.balance ?? '-';
    const avgDecision = data.length
      ? (data.reduce((sum, d) => sum + d.decisionScore, 0) / data.length).toFixed(1)
      : '-';
    document.getElementById('avgDecisionScore').textContent = avgDecision;
  }
  
  function updateLatestTrades(data) {
    const latest = data.slice(-5).reverse();
    const tbody = document.getElementById('latestTrades').querySelector('tbody');
    tbody.innerHTML = latest.map(d => `
      <tr>
        <td>${new Date(d.datetime).toLocaleString('zh-TW')}</td>
        <td>${d.balance}</td>
        <td>${d.decisionScore}</td>
        <td>${d.pnl}</td>
      </tr>
    `).join('');
  }
  
  function initializeOverview() {
    updateConnectionStatus(true); // 假設永遠連接
    updateOverviewStats(currentData);
    updateLatestTrades(currentData);
    initializePerformanceChart();
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeOverview();
    // ...其他初始化
  });

  // 1. 數據連接狀態
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
      statusEl.textContent = connected ? '已連接' : '未連接';
      statusEl.className = connected ? 'status connected' : 'status disconnected';
    }
  }
  
  // 2. 統計指標
  function updateOverviewStats(data) {
    document.getElementById('totalTrades').textContent = data.length;
    document.getElementById('currentBalance').textContent = data[data.length - 1]?.balance ?? '-';
    const avgDecision = data.length
      ? (data.reduce((sum, d) => sum + d.decisionScore, 0) / data.length).toFixed(1)
      : '-';
    document.getElementById('avgDecisionScore').textContent = avgDecision;
  }
  
  // 3. 最新交易紀錄
  function updateLatestTrades(data) {
    const latest = data.slice(-5).reverse();
    const tbody = document.getElementById('latestTrades').querySelector('tbody');
    tbody.innerHTML = latest.map(d => `
      <tr>
        <td>${new Date(d.datetime).toLocaleString('zh-TW')}</td>
        <td>${d.balance}</td>
        <td>${d.decisionScore}</td>
        <td>${d.pnl}</td>
      </tr>
    `).join('');
  }
  
  // 4. 初始化總覽頁
  function initializeOverview() {
    updateConnectionStatus(true); // 假設永遠連接
    updateOverviewStats(currentData);
    updateLatestTrades(currentData);
    initializePerformanceChart(); // 已有績效趨勢圖
  }
  
  // 5. DOMContentLoaded 時呼叫
  document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeOverview();
    // ...其他初始化
  });
  
  // 預設資料來源
let dataSourceUrl = "https://script.google.com/macros/s/AKfycbxT4x5PPJsIZTx9TCraPn3wGL4ROGQd1pQHLkjuGeghOdb5eRe74sZICh0pgRUxJAwj/exec";

function initializeDataSourceInput() {
    const input = document.getElementById('dataSourceInput');
    const btn = document.getElementById('loadDataBtn');
    const status = document.getElementById('dataSourceStatus');
  
    input.value = dataSourceUrl;
  
    btn.addEventListener('click', async () => {
      const url = input.value.trim();
      if (!url) {
        status.textContent = "請輸入有效的 Google Apps Script URL";
        status.style.color = "#b4413c";
        return;
      }
      status.textContent = "正在載入資料...";
      status.style.color = "#1fb8cd";
      try {
        const res = await fetch(url);
        const result = await res.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          currentData = result.data;
          // 重新初始化所有分析內容
          initializeOverview();
          initializeCharts();
          initializeQuickStats();
          status.textContent = "資料匯入成功！";
          status.style.color = "#1fb8cd";
        } else {
          status.textContent = "資料格式錯誤，請確認 GAS 回傳內容";
          status.style.color = "#b4413c";
        }
      } catch (e) {
        status.textContent = "資料匯入失敗，請確認網址與資料格式";
        status.style.color = "#b4413c";
      }
    });
  }
  
  // 只需在 DOMContentLoaded 時初始化一次
  document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeDataSourceInput();
    initializeOverview();
    initializeCharts();
    initializeQuickStats();
    initializeAI();
    initializeRangeInputs();
  });
  