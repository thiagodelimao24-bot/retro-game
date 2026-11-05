
const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')

// configuração conexão BD
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "GamesRetro"
})

db.connect((erro)=>{
    if(erro){
        console.error("Erro ao conectar ao mysql:", erro)
    }else {
        console.log("Conectado ao banco de dados com sucesso")
    }
})

// listar jogos
const mostrarJogos = (req, res) => {
    const sql = "SELECT * FROM Jogos"

    db.query(sql, (erro, resultados) => {
        if(erro){
            return res.status(500).send("Erro ao consultar o DB")
        }
        res.send(resultados)
    })
}

// cadastrar jogo
const novoJogo = (req, res) => {
    const { nome, plataforma, genero, imagem, preco } = req.body

    if(nome && plataforma && genero && imagem && preco !== undefined){
        const sql = "INSERT INTO Jogos (nome, plataforma, genero, imagem, preco) VALUES (?, ?, ?, ?, ?)"
        const valores = [nome, plataforma, genero, imagem, preco]

        db.query(sql, valores, (erro, resultados) => {
            if(erro){
                return res.status(500).send("Erro ao inserir jogo")
            }
            res.status(201).send("Jogo cadastrado com sucesso")
        })
    } else {
        res.status(400).send("Erro: Todos os campos")
    }
}

// editar jogo
const editarJogo = (req, res) => {
    const id = req.params.id
    const { nome, plataforma, genero, imagem, preco } = req.body

    if(nome && plataforma && genero && imagem && preco !== undefined){
        const sql = "UPDATE Jogos SET nome = ?, plataforma = ?, genero = ?, imagem = ?, preco = ? WHERE id = ?"
        const valores = [nome, plataforma, genero, imagem, preco, id]

        db.query(sql, valores, (erro, resultados) => {
            if(erro){
                return res.status(500).send("Erro ao editar jogo")
            }

            if(resultados.affectedRows === 0){
                return res.status(404).send("Jogo não encontrado ou sem alterações")
            }

            res.send("Jogo atualizado com sucesso")
        })
    }else{
        res.status(400).send("Erro: Todos os campos são obrigatórios")
    }
}

// excluir jogo
const excluirJogo = (req, res) => {
    const id = req.params.id

    const sql = "DELETE FROM Jogos WHERE id = ?"

    db.query(sql, [id], (erro, resultados) => {
        if(erro){
            return res.status(500).send("Erro ao excluir jogo")
        }

        if(resultados.affectedRows === 0){
            return res.status(404).send("Jogo não encontrado")
        }

        res.send("Jogo excluído com sucesso")
    })
}

// middleware
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const porta = 3000

// rotas
app.get("/listar", mostrarJogos)
app.post("/cadastrar", novoJogo)
app.put("/editar/:id", editarJogo)
app.delete("/excluir/:id", excluirJogo)

// iniciar servidor
app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`)
})
