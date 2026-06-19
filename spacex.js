const campoBusca = document.getElementById("campoBusca");
const resultados = document.getElementById("resultados");
const areaFavoritos = document.getElementById("favoritos");
const botaobuscar = document.getElementById("buscar");

botaobuscar.addEventListener("click", buscarMissoes);

async function buscarMissoes() {

    const texto = campoBusca.value.trim();

    if (texto.length < 3) {
        resultados.innerHTML = "Digite pelo menos 3 caracteres.";
        return;
    }

    try {

        const resposta = await fetch(`https://ll.thespacedevs.com/2.3.0/launches/?search=${encodeURIComponent(texto)}`);

        if (resposta.status == 429) {

        resultados.innerHTML = "Error 429 (Too Many Requests)";
        return;
}

        const dados = await resposta.json();
        console.log(dados);
        exibirResultados(dados.results);

    } catch (erro) {
        console.error(erro);
        resultados.innerHTML = "Erro ao consultar a API.";
    }
}

function exibirResultados(lista) {

    resultados.innerHTML = "";

    if (!lista || lista.length === 0) {
        resultados.innerHTML ="Nenhuma missão encontrada.";
        return;
    }

    lista.forEach(missao => {

        let imagem = "";

        if (missao.image) {
            imagem =
                `<img
                    src="${missao.image.image_url}"
                    width="150"
                    alt="${missao.name}">
                `;
        }

        let status = "Desconhecido";

        if (missao.status) {
            status = missao.status.name;
        }

        let data =
            new Date(missao.net)
            .toLocaleDateString("pt-BR");

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

function getFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function setFavoritos(favoritos) {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

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

    for (const id of favoritos) {
        try {
            const res = await fetch(
                `https://ll.thespacedevs.com/2.3.0/launches/${id}/?format=json`
            );

            const missao = await res.json();

            areaFavoritos.innerHTML += `
                <div class="cardFavorito">
                    <strong>${missao.name}</strong>
                    <br>
                    <button onclick="removerFavorito('${id}')">
                        Remover
                    </button>
                </div>
            `;
        } catch (err) {
            console.error(err);
        }
    }
}

function removerFavorito(id) {
    const favoritos = getFavoritos().filter(f => f !== id);
    setFavoritos(favoritos);
    carregarFavoritos();
}

carregarFavoritos();