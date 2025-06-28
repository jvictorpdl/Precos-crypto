const axios = require('axios');

async function getCryptoPrice(cryptoId, currency) {
    /**
     * Buscar o preço de uma criptomoeda em tempo real.
     *
     * @param {string} cryptoId - O ID da criptomoeda (ex: 'bitcoin', 'ethereum').
     * @param {string} currency - A moeda de comparação (ex: 'usd', 'brl').
     * @returns {Promise<number|null>} O preço da criptomoeda se a requisição for bem-sucedida,
     * ou null em caso de erro.
     */
    const baseUrl = "https://api.coingecko.com/api/v3/simple/price";
    const params = {
        ids: cryptoId,
        vs_currencies: currency
    };

    console.log(`Buscando preço para ${cryptoId.toUpperCase()} em ${currency.toUpperCase()}...`);

    try {
        const response = await axios.get(baseUrl, { params: params });

        const data = response.data;

        // Extrai o preço
        const price = data[cryptoId] ? data[cryptoId][currency] : undefined;

        if (price !== undefined && price !== null) {
            return price;
        } else {
            console.error(`Erro: Não foi possível encontrar o preço para ${cryptoId} em ${currency}.`);
            return null;
        }

    } catch (error) {
        // Tratamento de erros
        if (error.response) {
            // A requisição foi feita e o servidor respondeu com um status de erro (ex: 404, 500)
            console.error(`Erro HTTP ao buscar preço: ${error.response.status}`);
            console.error(`Resposta da API: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida (ex: sem internet)
            console.error("Erro de Conexão: Nenhuma resposta recebida. Verifique sua conexão com a internet.");
        } else {
            // Algo aconteceu na configuração da requisição que disparou um erro
            console.error(`Erro inesperado na requisição: ${error.message}`);
        }
        return null;
    }
}

async function main() {
    const bitcoinId = "bitcoin";
    const dolarCurrency = "usd";
    const realCurrency = "brl";

    // Consultar Bitcoin em Dólar
    const priceUsd = await getCryptoPrice(bitcoinId, dolarCurrency);
    if (priceUsd !== null) {
        console.log(`Preço atual do Bitcoin (BTC) em USD: $ ${priceUsd.toFixed(2)}`);
    }

    console.log("-".repeat(30));

    // Consultar Bitcoin em Real
    const priceBrl = await getCryptoPrice(bitcoinId, realCurrency);
    if (priceBrl !== null) {
        console.log(`Preço atual do Bitcoin (BTC) em BRL: R$ ${priceBrl.toFixed(2)}`);
    }

    console.log("-".repeat(30));

    // Exemplo de consulta para uma criptomoeda diferente (Ethereum)
    const ethereumId = "ethereum";
    const priceEthUsd = await getCryptoPrice(ethereumId, dolarCurrency);
    if (priceEthUsd !== null) {
        console.log(`Preço atual do Ethereum (ETH) em USD: $ ${priceEthUsd.toFixed(2)}`);
    }

    console.log("-".repeat(30));

    // Exemplo de ID ou moeda inválida para testar o tratamento de erro
    const invalidCryptoId = "nao-existe-coin";
    const priceInvalid = await getCryptoPrice(invalidCryptoId, dolarCurrency);
    if (priceInvalid === null) {
        console.log(`Não foi possível obter o preço para '${invalidCryptoId}'. (Esperado para teste de erro)`);
    }
}

main();