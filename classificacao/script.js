
const cv = document.querySelector(".chart-classificacoes");
const ctx = cv.getContext("2d");

const W = +window.getComputedStyle(cv).width.slice(0,-2);
const H = +window.getComputedStyle(cv).height.slice(0,-2);

cv.width = W;
cv.height = H;

const margem_esquerda_canvas = getComputedStyle(cv).marginLeft;

let estado;

const cores = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'];

// load data
const data = fetch("data.json").then(output => output.json())
    .then(
        data => {
            console.log(data);
            console.log(data.map(d => d["PAGAMENTOS TOTAIS (EXERCICIO + RP)"]).reduce( (a,b) => a + b));
            prepara_estruturas(data);
            init();
            //render();

            let i = 0;
            let I = squares.length;

        }
    );


class Square {

    // o que preciso em cada quadradinho?
    // as suas classificações, e os seus índices dentro das classificações.

    pos = {}; // { i, j } para cada classificacao;
    
    classif; // { funcao, gnd, rp };

    index; // { geral, funcao, gnd, rp };

    dims; // lado, qde_quadradinhos_coluna, W, H etc.

    current_visuals = {}; // x, y, lado, cor
    next_visuals = {
        'com margem' : {}, // tipo = { x, y, lado, cor }
        'sem margem' : {}
    }; 

    constructor( 
        classificacoes, indices, dims
    ) {

        //this.pos = { x, y };
        this.classif = classificacoes;
        this.index = indices;
        this.dims = dims;

        const tipos = Object.keys(classificacoes);
        tipos.push("geral");

        this.color = "white";

        tipos.forEach(tipo => {
            this.pre_calcula_position(tipo);
            this.pre_calcula_next_visuals(tipo, true);
            this.pre_calcula_next_visuals(tipo, false);
        });

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

    pre_calcula_next_visuals(tipo, sem_margin) {

        let margin = sem_margin ? 0 : this.dims.margin;
        let chave_margin = sem_margin ? "sem margem" : "com margem"

        this.next_visuals[chave_margin][tipo] = {};
        
        this.next_visuals[chave_margin][tipo].lado = tipo == "geral" ? this.dims.lado : this.dims.lado_peq;

        this.next_visuals[chave_margin][tipo].x = this.pos[tipo].i * ( this.next_visuals[chave_margin][tipo].lado + margin ) + this.dims.margin;
        this.next_visuals[chave_margin][tipo].y = this.pos[tipo].j * ( this.next_visuals[chave_margin][tipo].lado + margin ) + this.dims.margin + 
            (
                tipo == "geral" ? 0 : parametros.espacamentos[tipo][this.classif[tipo]]
            );

        this.next_visuals[chave_margin][tipo].cor = parametros.cores[tipo][this.classif[tipo]];

    }

    update_position(tipo, sem_margin) {

        let margin = sem_margin ? 0 : this.dims.margin;
        
        this.lado = tipo == "geral" ? 0 : this.dims.lado_peq;

        this.x = this.pos[tipo].i * ( this.lado + margin ) + this.dims.margin;
        this.y = this.pos[tipo].j * ( this.lado + margin ) + this.dims.margin + 
            (
                tipo == "geral" ? 0 : parametros.espacamentos[tipo][this.classif[tipo]]
            );

    }

    update_color(tipo) {

        //this.color = parametros.cores[tipo][this.classif[tipo]];
        this.color = this.next_visuals["com margem"][tipo].cor; // tanto faz "com margem" ou "sem margem".

    }

    render() {

        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x, this.y, this.lado, this.lado
        );

    }

}

let squares = [];

const parametros = {
    dominios : {},
    indices : {},
    cores : {},
    espacamentos : {},
    rotulos : {}
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

    const margin_entre_grupos = 10;
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
        parametros.rotulos[classificacao] = {};

        parametros.dominios[classificacao].forEach( (categoria,i) => {

            parametros.indices[classificacao][categoria] = 0;
            parametros.cores[classificacao][categoria] = cores[i];
            parametros.rotulos[classificacao][categoria] = data
               .filter(d => d[classificacao] == categoria)
               .map(d => d["PAGAMENTOS TOTAIS (EXERCICIO + RP)"])
               .reduce( (pv, cv) => pv + cv)
            ;

            parametros.espacamentos[classificacao][categoria] = i * (altura_grupo * (lado_peq + margin) + margin_entre_grupos) + margin_entre_grupos * 2;

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

    });

    prepara_rotulos(classificacoes);

}

function prepara_rotulos(classificacoes) {

    const rotulos = parametros.rotulos;

    const container = document.querySelector(".chart-wrapper");

    classificacoes.forEach(classificacao => {

        categorias_obj = rotulos[classificacao];

        categorias = Object.keys(categorias_obj);

        categorias.forEach(categoria => {

            const p_rotulo = document.createElement("p");
            p_rotulo.classList.add("rotulo");
            p_rotulo.style.opacity = 0;
            p_rotulo.style.top = parametros.espacamentos[classificacao][categoria] + "px";
            p_rotulo.style.left = margem_esquerda_canvas;
            p_rotulo.dataset.rotuloClassificacao = classificacao;

            p_rotulo.innerHTML="<strong>" + categoria + "</strong> (R$ " + (categorias_obj[categoria] / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + " bi)";

            container.appendChild(p_rotulo);

        })





    })



}

function init() {
    squares.forEach(sq => sq.update_position("geral", false));
    estado = "geral";
    //squares.forEach(sq => sq.update_color("geral"));
    //quares.forEach(sq => sq.update_next_position("Grupo Despesa Nome", false));
    //squares.forEach(sq => sq.update_next_color("Grupo Despesa Nome"));
}

function render() {
    ctx.clearRect(0,0,W,H);
    squares.forEach(sq => sq.render());
}

// a sequencia é: 
// plota o snake plot
// update_color pra outro tipo
// update_position com margem para esse tipo
// transicao
// render
// update_position sem margem para esse tipo
// transicao
// render
// update_position com margem para esse tipo
// transicao
// render
// update_color para um outro tipo
// render
// update_position para esse outro tipo
// tem que armazenar valores futuros de x, y, lado e cor.

function get_future_value (i, target, tipo, com_sem_margin, atributo ) {
    
    return target.next_visuals[com_sem_margin][tipo][atributo];

}

function colore_por(tipo) {
    squares.forEach(sq => {
        sq.update_color(tipo);
        sq.render();
    })
}

// buttons
function transition(tipo) {

    if (tipo == "geral") {

        gsap.to(squares, {

            duration: 2,
            stagger: {
                each: 0.0001,
                from: 'random'
            },
            x : (i, target) => get_future_value(i, target, 'geral', "com margem", 'x'),
            y : (i, target) => get_future_value(i, target, 'geral', "com margem", 'y'),
            lado : (i, target) => get_future_value(i, target, 'geral', "com margem", 'lado'),
            color : "#c800ff",
            onUpdate : render,
            onComplete : () => { estado = tipo }

        });
        gsap.set(".rotulo", { opacity : 0 });

    } else {

        const tl = new gsap.timeline({paused: true})
            .set(".rotulo", { opacity : 0 })
            .to(squares, {
                duration: 1,
                x : (i, target) => get_future_value(i, target, estado, "com margem", 'x'),
                y : (i, target) => get_future_value(i, target, estado, "com margem", 'y'),
                onUpdate : render,
            }, ">")
            .set(squares, {

                stagger: {
                    each: 0.0002,
                    from: 'random'
                },
                color : (i, target) => get_future_value(i, target, tipo, "com margem", 'cor'),
                onUpdate : render,

            }, ">")
            .to(squares, {

                duration: 2,
                stagger: {
                    each: 0.0001,
                    from: 'random'
                },
                x : (i, target) => get_future_value(i, target, tipo, "com margem", 'x'),
                y : (i, target) => get_future_value(i, target, tipo, "com margem", 'y'),
                lado : (i, target) => get_future_value(i, target, tipo, "com margem", 'lado'),
                onUpdate : render,

            }, ">.6")
            .to(squares, {

                duration: .5,
                x : (i, target) => get_future_value(i, target, tipo, "sem margem", 'x'),
                y : (i, target) => get_future_value(i, target, tipo, "sem margem", 'y'),
                onUpdate : render,
                onComplete : () => { estado = tipo; }

            }, ">.5")
            .to(`[data-rotulo-classificacao="${tipo}"`, { duration: .5, opacity : 1 },
                "<"
            )

        tl.play();


    }

}


btnWrapper.addEventListener("click", e => {
    
    if (e.target.tagName == 'BUTTON') {

        const tipo = e.target.dataset.tipo;

        console.log(tipo);

        transition(tipo);

    }

});


// elements

const btn_menu = document.querySelector("svg.burger");
const menu = document.querySelector("ul.menu");


// BTN MENU HANDLER
btn_menu.addEventListener("click", e => {
    menu.classList.toggle("hidden");
})