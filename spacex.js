const campoBusca = document.getElementById("campoBusca");
const resultados = document.getElementById("resultados");
const areaFavoritos = document.getElementById("favoritos");

campoBusca.addEventListener("input", buscarMissoes);

async function buscarMissoes() {

    const texto = campoBusca.value.trim();

    if (texto.length < 3) {

        resultados.innerHTML =
            "Digite pelo menos 3 caracteres.";

        return;
    }

    try {

        const resposta = await fetch(
            `https://ll.thespacedevs.com/2.3.0/launches/?search=${encodeURIComponent(texto)}`
        );

        const dados = await resposta.json();

        console.log(dados);

        exibirResultados(dados.results);

    } catch (erro) {

        console.error(erro);

        resultados.innerHTML =
            "Erro ao consultar a API.";
    }
}

function exibirResultados(lista) {

    resultados.innerHTML = "";

    if (!lista || lista.length === 0) {

        resultados.innerHTML =
            "Nenhuma missão encontrada.";

        return;
    }

    lista.forEach(missao => {

        resultados.innerHTML += `
            <div class="cardMissao">

                ${
                    missao.image?.image_url
                        ? `<img
                            src="${missao.image.image_url}"
                            width="150"
                            alt="${missao.name}"
                        >`
                        : ""
                }

                <h3>${missao.name}</h3>

                <p>
                    <strong>Status:</strong>
                    ${missao.status?.name || "Desconhecido"}
                </p>

                <p>
                    <strong>Data:</strong>
                    ${new Date(missao.net)
                        .toLocaleDateString("pt-BR")}
                </p>

                <button onclick="favoritar('${missao.id}')">
                    Favoritar
                </button>

            </div>
        `;
    });
}

function favoritar(id) {

    let favoritos =
        JSON.parse(localStorage.getItem("favoritos"))
        || [];

    if (!favoritos.includes(id)) {

        favoritos.push(id);

        localStorage.setItem(
            "favoritos",
            JSON.stringify(favoritos)
        );
    }

    carregarFavoritos();
}

async function carregarFavoritos() {

    let favoritos =
        JSON.parse(localStorage.getItem("favoritos"))
        || [];

    areaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {

        areaFavoritos.innerHTML =
            "Nenhum favorito salvo.";

        return;
    }

    for (const id of favoritos) {

        try {

            const resposta = await fetch(
                `https://ll.thespacedevs.com/2.3.0/launches/${id}/?format=json`
            );

            const missao = await resposta.json();

            areaFavoritos.innerHTML += `
                <div class="cardFavorito">

                    <strong>${missao.name}</strong>

                    <br>

                    <button
                        onclick="removerFavorito('${id}')"
                    >
                        Remover
                    </button>

                </div>
            `;

        } catch (erro) {

            console.error(erro);
        }
    }
}


function removerFavorito(id) {

    let favoritos =
        JSON.parse(localStorage.getItem("favoritos"))
        || [];

    favoritos =
        favoritos.filter(item => item !== id);

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    carregarFavoritos();
}

carregarFavoritos();