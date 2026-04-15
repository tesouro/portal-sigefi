// load data
const data = fetch("data.json").then(output => output.json())
    .then(
        data => {
            console.log(data);
            prepara_estruturas(data);
        });


class Square {

    // o que preciso em cada quadradinho?
    // as suas classificações, e os seus índices dentro das classificações.

    pos; // { x, y };
    
    classif; // { funcao, gnd, rp };

    index; // { geral, funcao, gnd, rp };

    constructor( 
        classificacoes, indices
    ) {

        //this.pos = { x, y };
        this.classif = classificacoes;
        this.index = indices;

    }

}

let squares = [];

function prepara_estruturas(data) {

    // prepara estrutura para ir registrando os contadores dos indices de cada quadradinho dentro de cada classificacao

    let n = 0; // indice geral

    const parametros = {
        dominios : {},
        indices : {}
    };

    const classificacoes = ["Função Governo Nome", "Grupo Despesa Nome", "Resultado EOF"];

    classificacoes.forEach(classificacao => {

        // pega os dominios de cada variável / classificação
        parametros.dominios[classificacao] = data.map(d => d[classificacao]).filter( (d,i,a) => a.indexOf(d) == i );

        // a partir dos domínios, inicializa um índice para cada classificação
        parametros.indices[classificacao] = {};

        parametros.dominios[classificacao].forEach(categoria => {

            parametros.indices[classificacao][categoria] = 0;

        })
        
    })

    console.log(parametros);

    // processa os dados e vai criando os quadradinhos
    data.forEach( linha => {

        const funcao = linha["Função Governo Nome"];
        const gnd = linha["Grupo Despesa Nome"];
        const rp = linha["Resultado EOF"];

        const qde_quadradinhos = linha.squares;

        // cria estrutura que vai armazenar as classificações dos quadradinhos
        // para uma mesma linha de dados, todos os quadradinhos terao classificadores iguais, então vamos criar essa estrutura aqui, para ser válida para toda a linha
        const classifs = {};

        // ou seja, pega o valor de cada variável de classificação para essa linha, e armazena num objeto
        classificacoes.forEach(classif => classifs[classif] = linha[classif]);

        //console.log(classifs);

        for (let i = 0; i < qde_quadradinhos; i++) {

            const indices_deste_quadradinho = {};

            indices_deste_quadradinho["geral"] = n;
            n++;

            classificacoes.forEach(classif => {

                const valor_do_classificador_atual = classifs[classif];
                
                // pega o índice atual para esse classificador, para este valor específico
                indices_deste_quadradinho[classif] = parametros.indices[classif][valor_do_classificador_atual];

                // incrementa o índice no controle geral
                parametros.indices[classif][valor_do_classificador_atual]++;

            });

            // cria um quadradinho para cada

            const sq = new Square(
                classifs,
                indices_deste_quadradinho
            )

            squares.push(sq);

        }

    }) 




    

}


// elements

const btn_menu = document.querySelector("svg.burger");
const menu = document.querySelector("ul.menu");


// BTN MENU HANDLER
btn_menu.addEventListener("click", e => {
    menu.classList.toggle("hidden");
})