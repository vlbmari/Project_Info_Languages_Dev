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
    const campoBusca = document.getElementById("campo-busca");
    const termoBusca = campoBusca.value.toLowerCase();
    
    // Só limpa as sugestões se o campo de busca não estiver focado (ou seja, após um clique no botão ou seleção)
    if (document.activeElement !== campoBusca) {
        document.getElementById("sugestoes-container").innerHTML = ""; // Garante que as sugestões sumam
    }

    // Filtra os dados com base no termo de busca
    const dadosFiltrados = dados.filter(dado => {
        // Retorna true se o nome da linguagem começar com o termo de busca.
        // Isso torna a filtragem dos cards mais precisa e intuitiva.
        return dado.nome.toLowerCase().startsWith(termoBusca);
    });

    renderizarCards(dadosFiltrados);
}

// Nova função para lidar com a entrada do usuário em tempo real
function handleSearchInput() {
    mostrarSugestoes();
    realizarBusca();
}

function renderizarCards(dados){
    cardContainer.innerHTML = ""; // Limpa os cards existentes antes de renderizar novos

    // Ordena o array 'dados' em ordem alfabética pelo nome
    dados.sort((a, b) => a.nome.localeCompare(b.nome));

    dados.forEach((dado, index) => {
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
        // Adiciona um atraso escalonado para a animação de entrada
        article.style.animationDelay = `${index * 0.05}s`;
        article.innerHTML = ` 
        <img class="card-logo" src="${dado.logo_url}" alt="Logo ${dado.nome}">
        <h2>${dado.nome}</h2>
        <p><strong>${dado.ano}</strong></p>
        <div class="tags-container">${tagsHtml}</div>
        <p>${dado.descricao}</p>
        <p class="curiosidade"><strong>Curiosidade:</strong> ${dado.curiosidade}</p> 
        <p><strong>Execução: ${dado.tipo_execucao}</strong></p>
        <p>Nível: <strong style="color: ${nivelColor};">${dado.nivel}</strong></p>
        <a href="${dado.link}" target="_blank" rel="noopener noreferrer">Saiba mais</a> 
        `
        cardContainer.appendChild(article);
    });
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