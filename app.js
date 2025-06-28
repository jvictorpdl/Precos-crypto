// Função existente para buscar preço em tempo real
async function getCryptoPrice(cryptoId, currency) {
    const baseUrl = "https://api.coingecko.com/api/v3/simple/price";
    const params = {
        ids: cryptoId,
        vs_currencies: currency
    };

    try {
        const response = await axios.get(baseUrl, { params: params });
        const data = response.data;
        const price = data[cryptoId] ? data[cryptoId][currency] : undefined;

        if (price !== undefined && price !== null) {
            return price;
        } else {
            console.error(`Erro: Não foi possível encontrar o preço para ${cryptoId} em ${currency}.`);
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar preço em tempo real:", error.message);
        return null;
    }
}

// Função para buscar dados históricos (mantida como está)
async function getCryptoHistoricalData(cryptoId, currency, days = 7) {
    const baseUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
    const params = {
        vs_currency: currency,
        days: days
    };

    console.log(`Buscando dados históricos para ${cryptoId.toUpperCase()} em ${currency.toUpperCase()} nos últimos ${days} dias...`);

    try {
        const response = await axios.get(baseUrl, { params: params });
        return response.data.prices;
    } catch (error) {
        console.error(`Erro ao buscar dados históricos para ${cryptoId}: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

// Função para criar e atualizar o gráfico - AGORA ACEITA MÚLTIPLOS DATASETS
let priceChart; // Variável global para armazenar a instância do gráfico

async function plotPriceChart(datasets, currency) {
    // datasets é um array de objetos, cada um com { cryptoId: 'bitcoin', historicalData: [[timestamp, price], ...] }

    if (!datasets || datasets.length === 0) {
        console.log("Não há dados para plotar.");
        const ctx = document.getElementById('priceChart');
        if (ctx) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        }
        return;
    }

    // Para garantir que os labels (datas) sejam consistentes, usaremos os labels do primeiro dataset
    // Assumimos que todos os datasets cobrem o mesmo período de tempo
    const labels = datasets[0].historicalData.map(dataPoint => {
        const date = new Date(dataPoint[0]);
        return date.toLocaleDateString('pt-BR');
    });

    // Mapeia cada dataset para o formato que o Chart.js espera
    const chartDatasets = datasets.map(dataset => {
        const prices = dataset.historicalData.map(dataPoint => dataPoint[1]);
        let borderColor, backgroundColor;

        // Definir cores com base no cryptoId
        if (dataset.cryptoId === 'bitcoin') {
            borderColor = 'rgb(255, 159, 64)'; // Laranja para Bitcoin
            backgroundColor = 'rgba(255, 159, 64, 0.2)';
        } else if (dataset.cryptoId === 'ethereum') {
            borderColor = 'rgb(153, 102, 255)'; // Roxo para Ethereum
            backgroundColor = 'rgba(153, 102, 255, 0.2)';
        } else {
            // Cores padrão para outras criptos, se adicionarmos
            borderColor = 'rgb(75, 192, 192)';
            backgroundColor = 'rgba(75, 192, 192, 0.2)';
        }

        return {
            label: `Preço de ${dataset.cryptoId.toUpperCase()} em ${currency.toUpperCase()}`,
            data: prices,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            borderWidth: 1,
            fill: true 
        };
    });

    const ctx = document.getElementById('priceChart').getContext('2d');

    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: chartDatasets // Agora passamos um array de datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: `Preço (${currency.toUpperCase()})`
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency.toUpperCase() }).format(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency.toUpperCase() }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Função principal que orquestra tudo
async function main() {
    const currency = "usd"; // Moeda para ambos os gráficos
    const days = 30; // Período histórico para ambos

    // 1. Exibir preços atuais
    const bitcoinId = "bitcoin";
    const ethereumId = "ethereum";
    
    const currentBitcoinPrice = await getCryptoPrice(bitcoinId, currency);
    const currentEthereumPrice = await getCryptoPrice(ethereumId, currency); // <-- Nova linha para buscar o preço do Ethereum

    const currentPriceElement = document.getElementById('current-price');
    let priceText = "";

    if (currentBitcoinPrice !== null) {
        priceText += `Preço atual do Bitcoin (BTC) em ${currency.toUpperCase()}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency.toUpperCase() }).format(currentBitcoinPrice)}`;
    } else {
        priceText += `Não foi possível obter o preço atual do Bitcoin.`;
    }

    // Adiciona uma quebra de linha e o preço do Ethereum
    priceText += "<br>"; // Adiciona uma quebra de linha para separar os preços
    
    if (currentEthereumPrice !== null) {
        priceText += `Preço atual do Ethereum (ETH) em ${currency.toUpperCase()}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency.toUpperCase() }).format(currentEthereumPrice)}`;
    } else {
        priceText += `Não foi possível obter o preço atual do Ethereum.`;
    }

    currentPriceElement.innerHTML = priceText; // Usar innerHTML para interpretar <br>

    // 2. Buscar dados históricos para Bitcoin
    const bitcoinHistoricalData = await getCryptoHistoricalData(bitcoinId, currency, days);
    
    // 3. Buscar dados históricos para Ethereum
    const ethereumHistoricalData = await getCryptoHistoricalData(ethereumId, currency, days);

    // Prepare os datasets para a função de plotagem
    const datasetsToPlot = [];
    if (bitcoinHistoricalData) {
        datasetsToPlot.push({ cryptoId: bitcoinId, historicalData: bitcoinHistoricalData });
    }
    if (ethereumHistoricalData) {
        datasetsToPlot.push({ cryptoId: ethereumId, historicalData: ethereumHistoricalData });
    }

    // 4. Plotar o gráfico com ambos os datasets
    await plotPriceChart(datasetsToPlot, currency);
}

// Garante que a função 'main' seja executada apenas quando toda a página HTML estiver carregada
document.addEventListener('DOMContentLoaded', main);