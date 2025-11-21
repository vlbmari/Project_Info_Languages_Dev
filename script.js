let cardContainer = document.querySelector(".card-container");
let dados = [];

// Função para carregar os dados e renderizar tudo inicialmente
async function inicializar() {
    const resposta = await fetch("data.json");
    dados = await resposta.json();
    renderizarCards(dados); // Mostra todos os cards ao carregar a página
}

function mostrarSugestoes() {
    const termoBusca = document.getElementById("campo-busca").value.toLowerCase();
    const sugestoesContainer = document.getElementById("sugestoes-container");

    sugestoesContainer.innerHTML = "";

    if (termoBusca.length === 0) {
        return; // Não mostra sugestões se o campo estiver vazio
    }

    const sugestoesFiltradas = dados
        .filter(dado => dado.nome.toLowerCase().startsWith(termoBusca))
        .slice(0, 5); // Limita a 5 sugestões

    sugestoesFiltradas.forEach(sugestao => {
        const item = document.createElement("div");
        item.classList.add("sugestao-item");
        item.textContent = sugestao.nome;
        item.onclick = () => selecionarSugestao(sugestao.nome);
        sugestoesContainer.appendChild(item);
    });
}

function selecionarSugestao(nome) {
    document.getElementById("campo-busca").value = nome;
    document.getElementById("sugestoes-container").innerHTML = ""; // Limpa sugestões
    realizarBusca(); // Realiza a busca completa
}

function realizarBusca() {
    // Pega o termo de busca do input e converte para minúsculas
    const termoBusca = document.getElementById("campo-busca").value.toLowerCase();
    document.getElementById("sugestoes-container").innerHTML = ""; // Garante que as sugestões sumam

    // Filtra os dados com base no termo de busca
    const dadosFiltrados = dados.filter(dado => {
        // Retorna true se o termo de busca estiver em qualquer um dos campos
        return dado.nome.toLowerCase().startsWith(termoBusca) ||
               dado.descricao.toLowerCase().startsWith(termoBusca) ||
               dado.curiosidade.toLowerCase().startsWith(termoBusca) ||
               dado.tags.some(tag => tag.toLowerCase().startsWith(termoBusca));
    });

    renderizarCards(dadosFiltrados);
}

function renderizarCards(dados){
    cardContainer.innerHTML = ""; // Limpa os cards existentes antes de renderizar novos

    // Define a ordem desejada para os níveis
    const nivelOrdem = {
        "Nível alto": 1,
        "Nível intermediário": 2,
        "Nível baixo": 3
    };

    // Ordena o array 'dados' com base na ordem definida
    dados.sort((a, b) => {
        const ordemA = nivelOrdem[a.nivel] || 99; // Usa 99 como padrão se o nível não for encontrado
        const ordemB = nivelOrdem[b.nivel] || 99;
        return ordemA - ordemB;
    });

    for (let dado of dados) {
        let nivelColor = '';
        switch (dado.nivel) {
            case "Nível alto":
                nivelColor = 'var(--quinary-color)';
                break;
            case "Nível intermediário":
                nivelColor = 'var(--seventh-color)';
                break;
            case "Nível baixo":
                nivelColor = 'var(--quaternary-color)';
                break;
        }

        // Cria o HTML para as tags
        const tagsHtml = dado.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('');

        let article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = ` 
        <img class="card-logo" src="${dado.logo_url}" alt="Logo ${dado.nome}">
        <h2>${dado.nome}</h2>
        <p><strong>${dado.ano}</strong></p>
        <div class="tags-container">${tagsHtml}</div>
        <p>${dado.descricao}</p>
        <p class="curiosidade"><strong>Curiosidade:</strong> ${dado.curiosidade}</p>
        <p><strong>Execução: ${dado.tipo_execucao}</strong></p>
        <p>Nível: <strong style="color: ${nivelColor};">${dado.nivel}</strong></p>
        <a href="${dado.link}" target="_blank">Saiba mais</a> 
        `
        cardContainer.appendChild(article);
            
    }
}

// Fecha as sugestões se o usuário clicar fora
document.addEventListener('click', function(event) {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (!searchWrapper.contains(event.target)) {
        document.getElementById('sugestoes-container').innerHTML = '';
    }
});

// Inicia o carregamento dos dados assim que o script é lido
inicializar();