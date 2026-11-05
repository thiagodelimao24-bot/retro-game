
const API_URL = "http://localhost:3000"

const btnCadastrar = document.getElementById('btnCadastrar')
const btnCancelar = document.getElementById('btnCancelar')
const modal = document.getElementById('modalJogo')
const form = document.getElementById('formJogo')
const lista = document.getElementById('listarJogos')
const mensagemVazia = document.getElementById('mensagemVazia')
const tituloModal = document.getElementById('tituloModal')
const btnSalvar = document.getElementById('btnSalvar')

let idEditando = null

//Abrir modal para cadastrar
btnCadastrar.addEventListener("click", () =>{
    idEditando = null
    form.reset()
    tituloModal.textContent = "Novo Jogo"
    btnSalvar.textContent = "Salvar jogo"
    modal.showModal()
})

//Fechar modal
btnCancelar.addEventListener("click", () =>{
    modal.close()
})

//Carregar jogos do banco de dados (GET)
async function carregarJogos(){
    try{
        const resposta = await fetch(API_URL + '/listar')
        const jogos = await resposta.json()

        lista.innerHTML = ""

        if(jogos.length === 0){
            mensagemVazia.hidden = false
            lista.appendChild(mensagemVazia)
            return
        }

        mensagemVazia.hidden = true

        jogos.forEach(jogo =>{
            criarCard(
                jogo.id,
                jogo.nome,
                jogo.plataforma,
                jogo.genero,
                jogo.imagem,
                jogo.preco
            )
        })

    }catch(erro){
        console.error("Erro ao carregar jogos:", erro)
        alert("Não foi possível conectar ao servidor")
    }
}

//Cadastrar ou editar jogo
form.addEventListener("submit", async (evento)=>{
    evento.preventDefault()

    const jogo = {
        nome: document.getElementById("nome").value.trim(),
        plataforma: document.getElementById("plataforma").value.trim(),
        genero: document.getElementById("genero").value.trim(),
        imagem: document.getElementById("imagem").value.trim(),
        preco: Number(document.getElementById("preco").value)
    }

    let url = API_URL + '/cadastrar'
    let metodo = "POST"

    if(idEditando !== null){
        url = API_URL + '/editar/' + idEditando
        metodo = "PUT"
    }

    try{
        const resposta = await fetch(url,{
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jogo)
        })

        if(resposta.ok){
            form.reset()
            modal.close()
            idEditando = null
            carregarJogos()
        }else{
            const erro = await resposta.text()
            alert("Erro ao salvar jogo: " + erro)
        }

    }catch(erro){
        console.error("Erro na requisição:", erro)
        alert("Erro de conexão com o servidor")
    }
})

//Abrir formulário para editar
function editarJogo(id, nome, plataforma, genero, imagem, preco){
    idEditando = id

    document.getElementById("nome").value = nome
    document.getElementById("plataforma").value = plataforma
    document.getElementById("genero").value = genero
    document.getElementById("imagem").value = imagem
    document.getElementById("preco").value = preco

    tituloModal.textContent = "Editar Jogo"
    btnSalvar.textContent = "Atualizar jogo"

    modal.showModal()
}

//Excluir jogo (DELETE)
async function excluirJogo(id){
    const confirmar = confirm("Deseja realmente excluir este jogo?")

    if(!confirmar){
        return
    }

    try{
        const resposta = await fetch(API_URL + '/excluir/' + id,{
            method: "DELETE"
        })

        if(resposta.ok){
            alert("Jogo excluído com sucesso!")
            carregarJogos()
        }else{
            const erro = await resposta.text()
            alert("Erro ao excluir jogo: " + erro)
        }

    }catch(erro){
        console.error("Erro ao excluir:", erro)
        alert("Não foi possível conectar ao servidor")
    }
}

//Criar card do jogo
function criarCard(id, nome, plataforma, genero, imagem, preco){
    const card = document.createElement("article")
    card.classList.add("card-disco")

    const capa = document.createElement("div")
    capa.classList.add("capa")

    const imagemCapa = document.createElement("img")
    imagemCapa.src = imagem
    imagemCapa.alt = nome
    capa.appendChild(imagemCapa)

    const info = document.createElement("div")
    info.classList.add("info-disco")

    const titulo = document.createElement("h3")
    titulo.textContent = nome

    const nomePlataforma = document.createElement("p")
    nomePlataforma.textContent = "Plataforma: " + plataforma

    const nomeGenero = document.createElement("p")
    nomeGenero.textContent = "Gênero: " + genero

    const valor = document.createElement("strong")
    valor.classList.add("preco")
    valor.textContent = Number(preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })

    const btnEditar = document.createElement("button")
    btnEditar.textContent = "Editar"
    btnEditar.type = "button"
    btnEditar.addEventListener("click", () =>{
        editarJogo(id, nome, plataforma, genero, imagem, preco)
    })

    const btnExcluir = document.createElement("button")
    btnExcluir.textContent = "Excluir"
    btnExcluir.type = "button"
    btnExcluir.addEventListener("click", () =>{
        excluirJogo(id)
    })

    info.append(titulo, nomePlataforma, nomeGenero, valor, btnEditar, btnExcluir)

    card.append(capa, info)

    lista.append(card)
}

//Iniciar catálogo
carregarJogos()
