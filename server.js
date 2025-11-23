import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Para carregar a GEMINI_API_KEY do arquivo .env

const app = express();
const port = 3000;

// Middlewares
app.use(cors()); // Permite que seu frontend (em outra porta/origem) acesse este servidor
app.use(express.json()); // Permite que o servidor entenda JSON vindo no corpo da requisição

// --- CONFIGURAÇÃO DA GEMINI API ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("ERRO: A variável de ambiente GEMINI_API_KEY não está definida.");
    process.exit(1);
}
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;


// --- ROTA DA API PARA COMPARAÇÃO ---
app.post('/api/compare', async (req, res) => {
    const { tech1, tech2 } = req.body;

    if (!tech1 || !tech2) {
        return res.status(400).json({ error: 'Duas tecnologias são necessárias para a comparação.' });
    }

    console.log(`Recebida requisição para comparar: ${tech1.nome} e ${tech2.nome}`);

    const systemPrompt = "Você é um assistente especialista em tecnologia. Sua tarefa é comparar duas tecnologias com base nos dados JSON fornecidos. Seja conciso e foque nos pontos principais: casos de uso, nível de abstração, tipo de execução e popularidade.";
    const userQuery = `Compare ${tech1.nome} e ${tech2.nome} usando os seguintes dados:\n\nTecnologia 1 (${tech1.nome}):\n${JSON.stringify(tech1, null, 2)}\n\nTecnologia 2 (${tech2.nome}):\n${JSON.stringify(tech2, null, 2)}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            throw new Error(`Falha na API Gemini com status ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const comparisonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (comparisonText) {
            res.json({ comparison: comparisonText });
        } else {
            res.status(500).json({ error: 'A IA não retornou uma comparação válida.' });
        }
    } catch (error) {
        console.error("Erro ao contatar a API Gemini:", error.message);
        res.status(500).json({ error: 'Erro ao processar a requisição com a IA.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor do chatbot rodando em http://localhost:${port}`);
});