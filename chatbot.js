import * as fs from 'fs/promises';
import * as readline from 'readline';

// --- CONFIGURAÇÃO DA GEMINI API ---
const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
const KNOWLEDGE_FILE = 'data.json'; // Usaremos o arquivo que você forneceu

let knowledgeBase = []; // Armazenará os dados do JSON

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Faz uma pergunta ao usuário e retorna a resposta.
 * @param {string} query A pergunta a ser feita.
 * @returns {Promise<string>} A resposta do usuário.
 */
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Mostra o menu principal de opções.
 */
function showMainMenu() {
    console.log("\n🤖 Olá! Sou seu assistente de tecnologias. Como posso ajudar?");
    console.log("1. Detalhar uma tecnologia");
    console.log("2. Mostrar linha do tempo da evolução tecnológica");
    console.log("3. Comparar duas tecnologias (usa API Gemini)");
    console.log("4. Sair");
}

/**
 * Lida com a opção de detalhar uma tecnologia.
 */
async function handleDetailTechnology() {
    console.log("\nTecnologias disponíveis:");
    const techNames = knowledgeBase.map(t => t.nome);
    console.log(techNames.join(', '));

    const choice = await askQuestion("\nDigite o nome da tecnologia que você quer conhecer: ");
    const tech = knowledgeBase.find(t => t.nome.toLowerCase() === choice.toLowerCase().trim());

    if (tech) {
        console.log(`\n--- Detalhes sobre ${tech.nome} ---`);
        console.log(`Ano: ${tech.ano}`);
        console.log(`Descrição: ${tech.descricao}`);
        console.log(`Curiosidade: ${tech.curiosidade}`);
        console.log(`Tags: ${tech.tags.join(', ')}`);
        console.log(`Nível: ${tech.nivel}`);
        console.log(`Execução: ${tech.tipo_execucao}`);
        console.log(`Link: ${tech.link}`);
        console.log("---------------------------------\n");
    } else {
        console.log("\nTecnologia não encontrada. Tente novamente.");
    }
}

/**
 * Lida com a opção de mostrar a linha do tempo.
 */
function handleTimeline() {
    console.log("\n--- Linha do Tempo da Evolução Tecnológica ---");
    const sortedTech = [...knowledgeBase].sort((a, b) => a.ano - b.ano);
    sortedTech.forEach(tech => {
        console.log(`${tech.ano} - ${tech.nome}`);
    });
    console.log("------------------------------------------\n");
}

/**
 * Lida com a comparação de duas tecnologias usando a API.
 */
async function handleComparison() {
    console.log("\nTecnologias disponíveis:");
    const techNames = knowledgeBase.map(t => t.nome);
    console.log(techNames.join(', '));

    const choice1 = await askQuestion("\nDigite o nome da primeira tecnologia: ");
    const tech1 = knowledgeBase.find(t => t.nome.toLowerCase() === choice1.toLowerCase().trim());

    const choice2 = await askQuestion("Digite o nome da segunda tecnologia: ");
    const tech2 = knowledgeBase.find(t => t.nome.toLowerCase() === choice2.toLowerCase().trim());

    if (!tech1 || !tech2) {
        console.log("\nUma ou ambas as tecnologias não foram encontradas. Tente novamente.");
        return;
    }

    console.log(`\n🔄 Comparando ${tech1.nome} e ${tech2.nome}... (Aguarde a resposta da IA)`);

    const systemPrompt = "Você é um assistente especialista em tecnologia. Sua tarefa é comparar duas tecnologias com base nos dados JSON fornecidos. Seja conciso e foque nos pontos principais: casos de uso, nível de abstração, tipo de execução e popularidade.";
    const userQuery = `Compare ${tech1.nome} e ${tech2.nome} usando os seguintes dados:\n\nTecnologia 1 (${tech1.nome}):\n${JSON.stringify(tech1, null, 2)}\n\nTecnologia 2 (${tech2.nome}):\n${JSON.stringify(tech2, null, 2)}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Falha na API com status ${response.status}`);
        }

        const result = await response.json();
        const comparisonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (comparisonText) {
            console.log("\n--- Análise da IA ---");
            console.log(comparisonText);
            console.log("---------------------\n");
        } else {
            console.log("\nA IA não retornou uma comparação. Tente novamente.");
        }
    } catch (error) {
        console.error("\n❌ Erro ao contatar a API Gemini:", error.message);
    }
}

/**
 * Função principal para executar o fluxo de trabalho.
 */
async function main() {
    if (!apiKey) {
        console.error("\n❌ ERRO: A variável de ambiente GEMINI_API_KEY não está definida.");
        console.log("Por favor, crie um arquivo '.env' na raiz do projeto e defina a chave:");
        console.log("GEMINI_API_KEY=\"SUA_CHAVE_AQUI\"");
        rl.close();
        return;
    }

    try {
        const data = await fs.readFile(KNOWLEDGE_FILE, 'utf-8');
        knowledgeBase = JSON.parse(data);
        console.log(`Base de conhecimento '${KNOWLEDGE_FILE}' carregada com ${knowledgeBase.length} itens.`);
    } catch (error) {
        console.error(`\n❌ ERRO FATAL: Não foi possível carregar o arquivo '${KNOWLEDGE_FILE}'.`);
        console.error("Verifique se o arquivo existe e está no formato JSON correto.");
        rl.close();
        return;
    }

    let running = true;
    while (running) {
        showMainMenu();
        const choice = await askQuestion("\nEscolha uma opção (1-4): ");

        switch (choice.trim()) {
            case '1':
                await handleDetailTechnology();
                break;
            case '2':
                handleTimeline();
                break;
            case '3':
                await handleComparison();
                break;
            case '4':
                running = false;
                break;
            default:
                console.log("\nOpção inválida. Por favor, escolha um número de 1 a 4.");
        }
    }

    console.log("\nAté a próxima! 👋");
    rl.close();
}

main().catch(error => {
    console.error("\n❌ ERRO INESPERADO:", error);
    rl.close();
});
