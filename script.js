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
        <p><strong>Nível:</strong> <strong style="color: ${nivelColor};">${dado.nivel}</strong></p>
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

// --- Lógica do Modal de Tipos de Execução ---

const detalhesExecucao = {
    "Compilada": {
        vantagem: "<strong class='modal-subtitle color-vantagem'>Vantagens:</strong> Performance máxima, pois o código já está na linguagem da máquina.",
        desvantagem: "<strong class='modal-subtitle color-desvantagem'>Desvantagens:</strong> Menos portável. O programa só roda no sistema para o qual foi compilado."
    },
    "Interpretada": {
        vantagem: "<strong class='modal-subtitle color-vantagem'>Vantagens:</strong> Altamente portável (roda em qualquer sistema com o interpretador) e desenvolvimento ágil.",
        desvantagem: "<strong class='modal-subtitle color-desvantagem'>Desvantagens:</strong> Performance inferior à do código compilado."
    },
    "Interpretada (JIT)": {
        vantagem: "<strong class='modal-subtitle color-vantagem'>Vantagens:</strong> Ótimo equilíbrio entre a flexibilidade da interpretação e a velocidade da compilação.",
        desvantagem: "<strong class='modal-subtitle color-desvantagem'>Desvantagens:</strong> Pode ter um 'aquecimento' inicial (warm-up) mais lento enquanto otimiza o código."
    },
    "Traduzida (Transpilada)": {
        vantagem: "<strong class='modal-subtitle color-vantagem'>Vantagens:</strong> Permite usar recursos de linguagens modernas em plataformas que não as suportam nativamente.",
        desvantagem: "<strong class='modal-subtitle color-desvantagem'>Desvantagens:</strong> Adiciona um passo extra de compilação ao desenvolvimento e pode complicar a depuração."
    },
    "Compilada para bytecode": {
        vantagem: "<strong class='modal-subtitle color-vantagem'>Vantagens:</strong> Excelente portabilidade ('escreva uma vez, rode em qualquer lugar' com a JVM).",
        desvantagem: "<strong class='modal-subtitle color-desvantagem'>Desvantagens:</strong> Exige que a Máquina Virtual Java (JVM) esteja instalada no sistema."
    },
    "Compilada para IL": {
        vantagem: "<strong class='modal-subtitle color-vantagem'>Vantagens:</strong> Portabilidade entre sistemas (com o .NET Core/5+) e interoperabilidade entre linguagens .NET.",
        desvantagem: "<strong class='modal-subtitle color-desvantagem'>Desvantagens:</strong> Exige que o Common Language Runtime (CLR) esteja instalado no sistema."
    }
};

// Novo objeto para os detalhes dos Níveis de Linguagem
const detalhesNivel = {
    "Nível alto": {
        descricao: "Linguagens mais próximas da comunicação humana. Elas abstraem detalhes complexos do hardware, tornando a programação mais rápida, fácil e menos propensa a erros."
    },
    "Nível intermediário": {
        descricao: "Atuam como uma ponte, oferecendo tanto abstrações de alto nível quanto a capacidade de acessar recursos de baixo nível, como gerenciamento de memória. Combinam poder e produtividade."
    },
    "Nível baixo": {
        descricao: "Linguagens muito próximas do código de máquina. Oferecem controle máximo sobre o hardware e performance extrema, mas são complexas e difíceis de usar."
    }
};

const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalAdvantage = document.getElementById('modal-advantage');
const modalDisadvantage = document.getElementById('modal-disadvantage');
const modalCloseBtn = document.getElementById('modal-close');

document.querySelectorAll('.details-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tipo = button.getAttribute('data-tipo');
        const nivel = button.getAttribute('data-nivel');

        if (tipo) { // Se o botão for de "Tipos de Execução"
            const detalhes = detalhesExecucao[tipo];
            modalTitle.textContent = tipo;
            modalAdvantage.innerHTML = detalhes.vantagem;
            modalDisadvantage.innerHTML = detalhes.desvantagem;
            modalOverlay.style.display = 'flex';
        } else if (nivel) { // Se o botão for de "Níveis de Linguagem"
            const detalhes = detalhesNivel[nivel];
            // Filtra as linguagens correspondentes a este nível
            const linguagensHtml = dados
                .filter(dado => dado.nivel === nivel)
                .map(dado => `<span class="tag-item">${dado.nome}</span>`)
                .join('');

            modalTitle.textContent = nivel;
            modalAdvantage.innerHTML = detalhes.descricao; // Usa o primeiro parágrafo para a descrição
            // Usa o segundo parágrafo para a lista de linguagens
            modalDisadvantage.innerHTML = `<strong class="modal-subtitle">Linguagens:</strong><div class="modal-tags-container">${linguagensHtml}</div>`;
            modalOverlay.style.display = 'flex';
        }
    });
});

function fecharModal() {
    modalOverlay.style.display = 'none';
}

modalCloseBtn.addEventListener('click', fecharModal);
modalOverlay.addEventListener('click', (event) => {
    // Fecha o modal apenas se o clique for no overlay, não no conteúdo
    if (event.target === modalOverlay) {
        fecharModal();
    }
});

// --- Animação do Título Principal ---
function animateTitleBinary(selector, finalColorClass = 'revealed', scrambleColorClass = 'scrambling') {
    const titleElement = document.querySelector(selector);
    if (!titleElement) return;

    const originalText = titleElement.textContent;
    titleElement.innerHTML = ''; // Limpa o conteúdo para usar spans

    // Cria um span para cada caractere
    originalText.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Usa non-breaking space para espaços
        span.classList.add('binary-char');
        titleElement.appendChild(span);
    });

    const spans = titleElement.querySelectorAll('.binary-char');
    let iterations = 0;

    const interval = setInterval(() => {
        spans.forEach((span, index) => {
            if (index < iterations) {
                span.textContent = originalText[index] === ' ' ? '\u00A0' : originalText[index];
                span.classList.add(finalColorClass);
                span.classList.remove(scrambleColorClass);
            } else {
                // Gera um caractere binário aleatório (0 ou 1)
                span.textContent = Math.random() < 0.5 ? '0' : '1';
                span.classList.add(scrambleColorClass);
                span.classList.remove(finalColorClass);
            }
        });

        if (iterations >= originalText.length) {
            clearInterval(interval);
        }

        iterations += 1 / 3; // Controla a velocidade da "revelação"
    }, 50); // Controla a velocidade da animação geral
}

// --- Lógica do Menu Hambúrguer ---
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileNav = document.getElementById('mobile-nav');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('header'); // Seleciona o cabeçalho

function toggleMenu() {
    hamburgerBtn.classList.toggle('open');
    mobileNav.classList.toggle('open');
    // Impede o scroll do body quando o menu está aberto
    if (mobileNav.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        // Restaura apenas a rolagem vertical, preservando o overflow-x: hidden do CSS.
        document.body.style.overflowY = 'auto';
    }
}

hamburgerBtn.addEventListener('click', toggleMenu);

// Adiciona rolagem suave com offset ao clicar em um link do menu
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o comportamento padrão do link

        const targetId = link.getAttribute('href'); // Pega o href (ex: #tipos-execucao)
        const targetElement = document.querySelector(targetId); // Encontra o elemento na página

        if (targetElement) {
            const headerHeight = header.offsetHeight; // Pega a altura atual do header
            const extraOffset = 20; // Um espaço extra para não colar no header
            const targetPosition = targetElement.offsetTop - headerHeight - extraOffset;

            // Rola a página para a posição calculada
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        // Fecha o menu após o clique
        toggleMenu();
    });
});

// Inicia o carregamento dos dados assim que o script é lido
inicializar();
// Inicia a animação do título
animateTitleBinary('#main-title');