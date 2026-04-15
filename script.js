
const cv = document.querySelector(".chart-classificacoes");
const ctx = cv.getContext("2d");

const W = +window.getComputedStyle(cv).width.slice(0,-2);
const H = +window.getComputedStyle(cv).height.slice(0,-2);

cv.width = W;
cv.height = H;

const cores = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'];

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

    pos = {}; // { x, y };
    
    classif; // { funcao, gnd, rp };

    index; // { geral, funcao, gnd, rp };

    dims; // lado, qde_quadradinhos_coluna, W, H etc.

    constructor( 
        classificacoes, indices, dims
    ) {

        //this.pos = { x, y };
        this.classif = classificacoes;
        this.index = indices;
        this.dims = dims;

        const tipos = Object.keys(classificacoes);
        tipos.push("geral");

        tipos.forEach(tipo => this.pre_calcula_position(tipo));

    }

    pre_calcula_position(tipo) {

        this.pos[tipo] = {};

        if (tipo == "geral") {
    
            this.pos[tipo].i = this.index[tipo] % this.dims.qde_quadradinhos_coluna;

            this.pos[tipo].j = Math.floor(this.index[tipo] / this.dims.qde_quadradinhos_coluna);


        } else {
        /*
        this.pos[tipo].i = this.index[tipo] % 
            ( tipo == "geral" ? this.dims.qde_quadradinhos_coluna : this.dims.qde_quadradinhos_coluna_barra );

        this.pos[tipo].j = Math.floor(this.index[tipo] / 
            ( tipo == "geral" ? this.dims.qde_quadradinhos_coluna : this.dims.qde_quadradinhos_coluna_barra) );
        */

        this.pos[tipo].j = this.index[tipo] % 
            ( tipo == "geral" ? this.dims.qde_quadradinhos_coluna : this.dims.altura_grupo );

        this.pos[tipo].i = Math.floor(this.index[tipo] / 
            ( tipo == "geral" ? this.dims.qde_quadradinhos_coluna : this.dims.altura_grupo) );

        }

    }

    update_position(tipo, sem_margin) {

        let margin = sem_margin ? 0 : this.dims.margin;
        
        this.lado = tipo == "geral" ? this.dims.lado : this.dims.lado_peq;

        this.pos.x = this.pos[tipo].i * ( this.lado + margin ) + this.dims.margin;
        this.pos.y = this.pos[tipo].j * ( this.lado + margin ) + this.dims.margin + 
            (
                tipo == "geral" ? 0 : parametros.espacamentos[tipo][this.classif[tipo]]
            );

    }

    update_color(tipo) {

        this.color = parametros.cores[tipo][this.classif[tipo]];

    }

    render() {

        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.pos.x, this.pos.y, this.lado, this.lado
        );

    }

}

let squares = [];

const parametros = {
    dominios : {},
    indices : {},
    cores : {},
    espacamentos : {}
};

function prepara_estruturas(data) {

    // vamos calcular as propriedades visuais:
    const AREA = W * H;
    const n_squares = data.map(d => d.squares).reduce( (pv, cv) => pv + cv);

    const area_aproximada_quadradinho = AREA / n_squares;
    const lado_estimado = Math.floor(Math.sqrt(area_aproximada_quadradinho));

    const margin = 1;
    const lado = lado_estimado - margin;
    const lado_peq = 3;

    const margin_entre_grupos = 20;
    const altura_grupo = 20;

    const qde_quadradinhos_coluna = Math.floor(W / (margin + lado));
    const qde_quadradinhos_coluna_barra = Math.floor(W / (margin + lado_peq));

    console.log(AREA, n_squares, area_aproximada_quadradinho, lado_estimado, qde_quadradinhos_coluna, Math.ceil(n_squares / qde_quadradinhos_coluna));

    const dims = {
        AREA, W, H, lado, lado_peq, margin, qde_quadradinhos_coluna, qde_quadradinhos_coluna_barra, altura_grupo
    }


    // prepara estrutura para ir registrando os contadores dos indices de cada quadradinho dentro de cada classificacao

    let n = 0; // indice geral

    const classificacoes = ["Função Governo Nome", "Grupo Despesa Nome", "Resultado EOF"];

    classificacoes.forEach(classificacao => {

        // pega os dominios de cada variável / classificação
        parametros.dominios[classificacao] = data.map(d => d[classificacao]).filter( (d,i,a) => a.indexOf(d) == i );

        // a partir dos domínios, inicializa um índice para cada classificação
        parametros.indices[classificacao] = {};
        parametros.cores[classificacao] = {};
        parametros.espacamentos[classificacao] = {};

        parametros.dominios[classificacao].forEach( (categoria,i) => {

            parametros.indices[classificacao][categoria] = 0;
            parametros.cores[classificacao][categoria] = cores[i];

            parametros.espacamentos[classificacao][categoria] = i * (altura_grupo * (lado_peq + margin) + margin_entre_grupos);

        })
        
    })

    parametros.cores["geral"] = {};

    Object.keys(parametros.cores["Função Governo Nome"]).forEach( (fun,i) => {

        parametros.cores["geral"][fun] = cores[i];

    })

    console.log(parametros);

    // processa os dados e vai criando os quadradinhos
    data.forEach( linha => {

        const qde_quadradinhos = linha.squares;

        // cria estrutura que vai armazenar as classificações dos quadradinhos
        // para uma mesma linha de dados, todos os quadradinhos terao classificadores iguais, então vamos criar essa estrutura aqui, para ser válida para toda a linha
        const classifs = {};

        // ou seja, pega o valor de cada variável de classificação para essa linha, e armazena num objeto
        classificacoes.forEach(classif => classifs[classif] = linha[classif]);

        classifs["geral"] = classifs["Função Governo Nome"];

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
                indices_deste_quadradinho,
                dims
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