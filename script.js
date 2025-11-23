let cardContainer = document.querySelector(".card-container");
let dados = [];

// ====================================================================
// --- LÓGICA DO NOVO MODAL PARA CURVA DE APRENDIZAGEM ---
// ====================================================================

const curvaModalOverlay = document.getElementById('curva-modal-overlay');
const curvaModalTitle = document.getElementById('curva-modal-title');
const curvaModalBody = document.getElementById('curva-modal-body');
const curvaModalDesc = document.getElementById('curva-modal-desc');
const curvaModalCloseBtn = document.getElementById('curva-modal-close');


// 1. Lógica para gerar os pontos da curva (Mantida, mas refatorada para ser standalone)
function obterCurvaQualitativa(nome) {
    // Esta função gera um array de pontos (Proficiência x Tempo) para desenhar uma linha SVG
    const tempo = Array.from({ length: 20 }, (_, i) => i);
    let proficiencia;

    // A lógica de curva é qualitativa, baseada na percepção comum de dificuldade:
    if (nome.includes("Python") || nome.includes("PHP") || nome.includes("Fortran") || nome.includes("COBOL")) {
        // Curva Suave (Logarítmica): Fácil de começar, se estabiliza.
        proficiencia = tempo.map(t => Math.min(90, 30 * Math.log1p(t * 0.5) + 10));
    } else if (nome.includes("JavaScript") || nome.includes("TypeScript") || nome.includes("Swift")) {
        // Curva S (Sigmoide): Início fácil, pico de dificuldade (frameworks/tipagem), depois sobe.
        proficiencia = tempo.map(t => 100 / (1 + Math.exp(-0.25 * (t - 10))));
    } else if (nome.includes("C#") || nome.includes("Java") || nome.includes("Go")) {
        // Curva Intermediária/Equilibrada: Curva estável, exige base sólida.
        proficiencia = tempo.map(t => 100 * (1 - Math.exp(-0.15 * t)));
    } else if (nome.includes("C++") || nome.includes("Rust") || nome.includes("C")) {
        // Curva Íngreme Inicial (Exponencial Inversa): Barreira de entrada alta (memória, ponteiros).
        proficiencia = tempo.map(t => 100 * (1 - Math.exp(-0.25 * t * t / 20)));
    } else if (nome.includes("Assembly")) {
        // Barreira Extrema: Crescimento muito lento e exigente.
        proficiencia = tempo.map(t => Math.min(100, t * 1.5 + (t > 10 ? 10 : 0)));
    } else {
        // Padrão (Linear)
        proficiencia = tempo.map(t => t * 5);
    }
    
    // Normaliza e inverte o Y (0 é o topo no SVG)
    const maxProf = Math.max(...proficiencia);
    const pontos = proficiencia.map((p, i) => {
        const x = (i / (tempo.length - 1)) * 100;
        const y = 100 - (p / maxProf) * 100;
        return `${x},${y}`;
    }).join(' ');

    return pontos;
}

// Função auxiliar para dar uma breve descrição da curva
function getCurvaDesc(nome) {
    if (nome.includes("Python") || nome.includes("PHP") || nome.includes("COBOL")) return "suave (fácil de começar)";
    if (nome.includes("JavaScript") || nome.includes("TypeScript")) return "em S (com pico de complexidade)";
    if (nome.includes("C#") || nome.includes("Java") || nome.includes("Go")) return "equilibrada e estável";
    if (nome.includes("C++") || nome.includes("Rust") || nome.includes("C")) return "muito íngreme (alta barreira inicial)";
    if (nome.includes("Assembly")) return "extremamente lenta (requer alto domínio de hardware)";
    return "linear";
}


// 2. Lógica para ABRIR o Modal do Gráfico
function abrirCurvaModal(dado) {
    
    const pontosSvg = obterCurvaQualitativa(dado.nome);
    const nome = dado.nome;
    
    // 1. Bloqueia a rolagem do corpo
    document.body.classList.add('no-scroll');
    
    // 2. Prepara o conteúdo do modal
    curvaModalTitle.textContent = `Curva de Aprendizagem de ${nome}`;
    curvaModalDesc.textContent = `Esta é uma representação qualitativa: ${nome} tende a ter uma curva inicial ${getCurvaDesc(nome)}.`;


    curvaModalBody.innerHTML = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points="${pontosSvg}" fill="none" stroke="#d2fc83b9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="eixo-y">Proficiência</span>
        <span class="eixo-x">Tempo/Esforço</span>
    `;
    
    // 4. Mostra o modal
    curvaModalOverlay.style.display = 'flex';
        // --- ADIÇÃO CRÍTICA PARA REINICIAR A ANIMAÇÃO ---
    // Removemos e readicionamos a animação do overlay para garantir que ela toque novamente
    curvaModalOverlay.style.animation = 'none';
    curvaModalOverlay.offsetHeight; /* Trigger reflow (força o navegador a recalcular) */
    curvaModalOverlay.style.animation = 'overlayFadeIn 0.4s ease-out forwards';
}

// 3. Lógica para FECHAR o Modal do Gráfico
function fecharCurvaModal() {
    curvaModalOverlay.style.display = 'none';
    document.body.classList.remove('no-scroll'); // Remove a classe que bloqueia o scroll
}

curvaModalCloseBtn.addEventListener('click', fecharCurvaModal);
curvaModalOverlay.addEventListener('click', (event) => {
    // Fecha o modal apenas se o clique for no overlay
    if (event.target === curvaModalOverlay) {
        fecharCurvaModal();
    }
});


// 4. Criação do Botão Curva dentro do Card
function renderizarBotaoCurva(dado) {
    const button = document.createElement('button');
    button.className = 'btn-curva';
    button.textContent = 'Ver Curva de Aprendizagem';
    
    // Evento de clique chama o modal do gráfico
    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede que cliques no botão ativem o evento do card pai
        abrirCurvaModal(dado);
    });

    return button;
}


// ====================================================================
// --- MODIFICAÇÃO DA FUNÇÃO RENDERIZARCARDS ---
// ====================================================================

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
        
        // Conteúdo básico do Card
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
        `;

        // INSERE O NOVO BOTÃO DENTRO DO CARD AQUI
        const btnCurva = renderizarBotaoCurva(dado);
        article.appendChild(btnCurva);

        cardContainer.appendChild(article);
    });
}

// ====================================================================
// --- RESTO DO CÓDIGO (Busca, Inicialização, Menu) ---
// ====================================================================

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

    // Rola a tela para a seção de linguagens após a seleção
    const linguagensSection = document.getElementById('linguagens');
    if (linguagensSection) {
        linguagensSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        return dado.nome.toLowerCase().startsWith(termoBusca);
    });

    renderizarCards(dadosFiltrados);
}

// Nova função para lidar com a entrada do usuário em tempo real
function handleSearchInput() {
    mostrarSugestoes();
    realizarBusca();
}

// Fecha as sugestões se o usuário clicar fora
document.addEventListener('click', function(event) {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (!searchWrapper.contains(event.target)) {
        document.getElementById('sugestoes-container').innerHTML = '';
    }
});

// --- Lógica do Modal de Tipos de Execução e Nível ---

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
        // Bloqueia o scroll do body ao abrir o modal de Nível/Execução também
        document.body.classList.add('no-scroll');

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
    document.body.classList.remove('no-scroll'); // Libera o scroll
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
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

hamburgerBtn.addEventListener('click', toggleMenu);

// Adiciona um evento para fechar o menu ao clicar fora dele
document.addEventListener('click', (event) => {
    const isClickInsideNav = mobileNav.contains(event.target);
    const isClickOnHamburger = hamburgerBtn.contains(event.target);

    // Se o menu estiver aberto e o clique não for no menu nem no botão, fecha o menu
    if (mobileNav.classList.contains('open') && !isClickInsideNav && !isClickOnHamburger) {
        toggleMenu();
    }
});

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