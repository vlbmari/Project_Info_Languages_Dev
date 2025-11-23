import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = 3000;

// --- 1. Validação da Chave ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ FATAL: GEMINI_API_KEY não encontrada no .env");
    process.exit(1);
}

// --- 2. URL da API (Usando gemini-pro para garantir compatibilidade) ---
// Se quiser tentar o flash depois, troque 'gemini-pro' por 'gemini-1.5-flash'
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/compare', async (req, res) => {
    const { tech1, tech2 } = req.body;

    if (!tech1 || !tech2) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }

    console.log(`🤖 Processando IA: ${tech1.nome} vs ${tech2.nome}`);

    // Prompt para a IA
    const systemPrompt = `Você é um Especialista Tech Sênior. Compare as tecnologias de forma resumida (máx 80 palavras). Use tags HTML <b> para destacar pontos chave. Foque em: Diferencial e Uso Principal.`;
    
    const userQuery = `Compare ${tech1.nome} e ${tech2.nome} com base nestes dados: 
    Tech 1: ${JSON.stringify(tech1)} 
    Tech 2: ${JSON.stringify(tech2)}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        // Nota: systemInstruction as vezes é restrito em alguns modelos, 
        // então mandamos o prompt junto no userQuery se precisar, mas vamos tentar assim:
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    try {
        // --- AQUI ESTAVA O ERRO: Agora usamos 'apiUrl' ---
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("❌ Erro Google API:", JSON.stringify(data, null, 2));
            // Tratamento específico para erro de modelo não encontrado
            throw new Error(data.error?.message || "Erro na API do Google");
        }

        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
            res.json({ comparison: textResponse });
        } else {
            throw new Error('A IA não retornou texto (Conteúdo bloqueado ou vazio).');
        }
    } catch (error) {
        console.error("❌ Erro no Server:", error.message);
        res.status(500).json({ error: 'Erro ao processar a IA.' });
    }
});

app.listen(port, () => {
    console.log(`✅ API Server rodando em http://localhost:${port}`);
});