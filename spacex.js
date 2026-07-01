// Pegamos os elementos da página para poder ler o que o
// usuário digita e escrever resultados na tela depois.
const campoBusca = document.getElementById("campoBusca");
const resultados = document.getElementById("resultados");
const areaFavoritos = document.getElementById("favoritos");
const botaobuscar = document.getElementById("buscar");

// Quando o botão de buscar for clicado, chama a função buscarMissoes
botaobuscar.addEventListener("click", buscarMissoes);

// BUSCAR MISSÕES NA API (Launch Library)
// Função assíncrona: usa await para esperar a resposta da
// API antes de continuar o código.
async function buscarMissoes() {

    const texto = campoBusca.value.trim();

    // Validação simples: exige pelo menos 3 caracteres
    if (texto.length < 3) {
        resultados.innerHTML = "Digite pelo menos 3 caracteres.";
        return;
    }

    try {
        // Faz a requisição HTTP para a API, passando o texto buscado
        const resposta = await fetch(`https://ll.thespacedevs.com/2.3.0/launches/?search=${encodeURIComponent(texto)}`);

        // Trata especificamente o erro de "requisições demais"
        if (resposta.status === 429) {
            resultados.innerHTML = "Error 429 (Too Many Requests)";
            return;
        }

        // Trata qualquer outro erro HTTP (404, 500, etc.)
        if (!resposta.ok) {
            resultados.innerHTML = `Erro ${resposta.status}`;
            return;
        }

        // Converte a resposta para JSON e exibe os resultados
        const dados = await resposta.json();
        console.log(dados);
        exibirResultados(dados.results);

    } catch (erro) {
        // Captura erros de rede (sem internet, CORS, etc.)
        console.error(erro);
        resultados.innerHTML = "Erro ao consultar a API.";
    }
}


// Recebe a lista de missões e monta um "card" HTML para cada
// uma dentro da div de resultados.
function exibirResultados(lista) {

    resultados.innerHTML = "";

    // Se não veio nada da API, avisa o usuário
    if (!lista || lista.length === 0) {
        resultados.innerHTML = "Nenhuma missão encontrada.";
        return;
    }

    lista.forEach(missao => {

        // Só monta a tag <img> se a missão tiver imagem
        let imagem = "";
        if (missao.image) {
            imagem =
                `<img
                    src="${missao.image.image_url}"
                    width="150"
                    alt="${missao.name}">
                `;
        }

        // Se não tiver status, usa um valor padrão
        let status = "Desconhecido";
        if (missao.status) {
            status = missao.status.name;
        }

        // Formata a data para o padrão brasileiro (dd/mm/aaaa)
        let data =
            new Date(missao.net)
            .toLocaleDateString("pt-BR");

        // Adiciona o card da missão dentro da div de resultados
        resultados.innerHTML += `
            <div class="cardMissao">

                ${imagem}

                <h3>${missao.name}</h3>

                <p>
                    <strong>Status:</strong>
                    ${status}
                </p>

                <p>
                    <strong>Data:</strong>
                    ${data}
                </p>

                <button onclick="favoritar('${missao.id}')">
                    Favoritar
                </button>

            </div>
        `;
    });
}

// O localStorage só guarda texto, então usamos JSON.stringify
// para "salvar" o array e JSON.parse para "ler" ele de volta.
function getFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function setFavoritos(favoritos) {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

// Pega o array salvo, adiciona o novo id (se ainda não
// existir) e atualiza a lista mostrada na tela.
function favoritar(id) {
    const favoritos = getFavoritos();

    if (!favoritos.includes(id)) {
        setFavoritos([...favoritos, id]);
    }

    carregarFavoritos();
}

async function carregarFavoritos() {
    const favoritos = getFavoritos();

    areaFavoritos.innerHTML = "";

    if (!favoritos.length) {
        areaFavoritos.innerHTML = "Nenhum favorito salvo.";
        return;
    }

    try {
        // Cria um array de "promises", uma para cada id de favorito.
        // Cada fetch já busca e converte a resposta para JSON.
        const promessas = favoritos.map(id =>
            fetch(`https://ll.thespacedevs.com/2.3.0/launches/${id}/?format=json`)
                .then(res => res.json())
        );

        // Promise.all espera TODAS as buscas terminarem em paralelo
        // e devolve um array com os resultados, na mesma ordem.
        const missoes = await Promise.all(promessas);

        // Monta o HTML de cada favorito e guarda num array,
        // em vez de já ir escrevendo na tela a cada volta.
        const cardsHtml = missoes.map(missao => `
            <div class="cardFavorito">
                <strong>${missao.name}</strong>
                <br>
                <button onclick="removerFavorito('${missao.id}')">
                    Remover
                </button>
            </div>
        `);

        // Escreve todos os cards de uma vez só
        areaFavoritos.innerHTML = cardsHtml.join("");

    } catch (err) {
        console.error(err);
        areaFavoritos.innerHTML = "Erro ao carregar favoritos.";
    }
}

// Filtra o array removendo o id passado e salva de novo.
function removerFavorito(id) {
    const favoritos = getFavoritos().filter(f => f !== id);
    setFavoritos(favoritos);
    carregarFavoritos();
}

// Assim que a página carrega, já mostra os favoritos salvos
carregarFavoritos();
