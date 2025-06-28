// Remova a linha 'const axios = require('axios');'
// No navegador, 'axios' já estará disponível globalmente porque você o incluiu no HTML via CDN.

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

// NOVA FUNÇÃO: Buscar dados históricos
async function getCryptoHistoricalData(cryptoId, currency, days = 7) {
    /**
     * Buscar dados históricos de uma criptomoeda.
     * @param {string} cryptoId - O ID da criptomoeda (ex: 'bitcoin').
     * @param {string} currency - A moeda de comparação (ex: 'usd').
     * @param {number} days - Número de dias para buscar dados históricos (1, 7, 14, 30, 90, 180, 365, "max").
     * @returns {Promise<Array<[number, number]>|null>} Um array de [timestamp, price] ou null em caso de erro.
     */
    const baseUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
    const params = {
        vs_currency: currency,
        days: days
    };

    console.log(`Buscando dados históricos para ${cryptoId.toUpperCase()} em ${currency.toUpperCase()} nos últimos ${days} dias...`);

    try {
        const response = await axios.get(baseUrl, { params: params });
        // A API retorna um objeto com 'prices', 'market_caps', 'total_volumes'
        // Queremos a array 'prices', que é no formato [[timestamp, price], ...]
        return response.data.prices;
    } catch (error) {
        console.error(`Erro ao buscar dados históricos: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

// Função para criar e atualizar o gráfico
let priceChart; // Variável global para armazenar a instância do gráfico

async function plotPriceChart(cryptoId, currency, days = 7) {
    const historicalData = await getCryptoHistoricalData(cryptoId, currency, days);

    if (!historicalData || historicalData.length === 0) {
        console.log("Não há dados históricos para plotar.");
        // Opcional: exibir uma mensagem na tela para o usuário
        const ctx = document.getElementById('priceChart');
        if (ctx) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height); // Limpa o canvas
            // Você pode adicionar um texto de "Dados indisponíveis" aqui, se quiser
        }
        return;
    }

    // Prepare os dados para o Chart.js
    const labels = historicalData.map(dataPoint => {
        const date = new Date(dataPoint[0]); // timestamp em milissegundos
        return date.toLocaleDateString('pt-BR'); // Formato da data para o eixo X
    });
    const prices = historicalData.map(dataPoint => dataPoint[1]); // Preços para o eixo Y

    const ctx = document.getElementById('priceChart').getContext('2d');

    // Se o gráfico já existe, destrua-o antes de criar um novo (útil para atualizações)
    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line', // Tipo de gráfico: linha
        data: {
            labels: labels, // Datas no eixo X
            datasets: [{
                label: `Preço de ${cryptoId.toUpperCase()} em ${currency.toUpperCase()}`,
                data: prices, // Preços no eixo Y
                borderColor: 'rgb(75, 192, 192)', // Cor da linha
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Cor de preenchimento abaixo da linha
                borderWidth: 1,
                fill: true // Preenche a área abaixo da linha
            }]
        },
        options: {
            responsive: true, // Torna o gráfico responsivo
            maintainAspectRatio: false, // Permite controlar a altura no CSS
            scales: {
                x: {
                    type: 'category', // Para as datas formatadas
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    beginAtZero: false, // Permite que o eixo Y não comece do zero, se os preços forem altos
                    title: {
                        display: true,
                        text: `Preço (${currency.toUpperCase()})`
                    },
                    ticks: {
                        callback: function(value) {
                            // Formata os valores do eixo Y como moeda
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
                                // Formata o valor da tooltip como moeda
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
    const cryptoId = "bitcoin";
    const currency = "usd"; // Você pode mudar para 'brl' ou outra moeda

    // 1. Exibir preço atual
    const currentPrice = await getCryptoPrice(cryptoId, currency);
    const currentPriceElement = document.getElementById('current-price');
    if (currentPrice !== null) {
        currentPriceElement.textContent = `Preço atual do ${cryptoId.toUpperCase()} em ${currency.toUpperCase()}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency.toUpperCase() }).format(currentPrice)}`;
    } else {
        currentPriceElement.textContent = `Não foi possível obter o preço atual do ${cryptoId.toUpperCase()}.`;
    }

    // 2. Plotar o gráfico com dados dos últimos 30 dias
    // Você pode alterar o número de dias para 7, 14, 90, 365 ou "max"
    await plotPriceChart(cryptoId, currency, 30);
}

// Garante que a função 'main' seja executada apenas quando toda a página HTML estiver carregada
document.addEventListener('DOMContentLoaded', main);