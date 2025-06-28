## **Consulta de Preços de Criptomoedas em Tempo Real (JavaScript)**

Este projeto simples demonstra como consumir uma **API externa** para obter dados em tempo real. Ele foi desenvolvido em **JavaScript** utilizando **Node.js** e a biblioteca **Axios** para fazer requisições HTTP, consultando os preços de criptomoedas (como Bitcoin e Ethereum) através da **CoinGecko API**.

-----

### **Funcionalidades**

  * **Consulta de Preço:** Obtém o valor atual de criptomoedas específicas (ex: BTC, ETH) em diferentes moedas fiduciárias (ex: USD, BRL).
  * **Tratamento de Erros:** Inclui um robusto tratamento de exceções para lidar com falhas de rede, respostas inválidas da API e limites de requisição (Rate Limit), garantindo uma experiência mais resiliente.

-----

### **Tecnologias Utilizadas**

  * **JavaScript:** Linguagem de programação principal.
  * **Node.js:** Ambiente de execução JavaScript no servidor.
  * **Axios:** Cliente HTTP baseado em Promises para o navegador e Node.js.
  * **CoinGecko API:** API pública e gratuita para dados de criptomoedas.

-----

### **Como Rodar o Projeto**

Siga os passos abaixo para configurar e executar este projeto em sua máquina:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/jvictorpdl/Precos-crypto.git
    cd consulta-precos-crypto-js # ou o nome da sua pasta
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Execute o script:**
    ```bash
    node index.js
    ```

-----

### **Próximos Passos (Possíveis Melhorias)**

  * Adicionar interface de linha de comando (CLI) para input do usuário.
  * Implementar um mecanismo de cache para otimizar as requisições à API.
  * Expandir para buscar dados de outras moedas ou ativos financeiros.

-----

**Observação:** A CoinGecko API possui limites de requisição. Em caso de erro `429 (Too Many Requests)`, aguarde alguns segundos antes de tentar novamente.
