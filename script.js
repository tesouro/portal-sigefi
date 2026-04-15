// load data
const data = fetch("data.json").then(output => output.json())
    .then(
        data => {
            console.log(data);
            prepara_estruturas(data);
        });


class Square {

    pos; // { x, y };
    
    cls; // { funcao, gnd, rp };

    index; // { geral, funcao, gnd, rp };

    constructor( 
        { funcao, gnd, rp }
    ) {

        //this.pos = { x, y };
        this.cls = { funcao, gnd, rp };
        //this.index = { geral, funcao, gnd, rp };

    }

}

let squares = [];

function prepara_estruturas(data) {

    let n_geral = 0, n_funcao = 0, n_gnd = 0, n_rp = 0;

    const parametros = {
        dominios : {},
        indices : {}
    };

    const classificacoes = ["Função Governo Nome", "Grupo Despesa Nome", "Resultado EOF"];

    classificacoes.forEach(classificacao => {

        parametros.dominios[classificacao] = data.map(d => d[classificacao]).filter( (d,i,a) => a.indexOf(d) == i );

        parametros.indices[classificacao] = {};

        parametros.dominios[classificacao].forEach(categoria => {

            parametros.indices[classificacao][categoria] = 0;

        })
        
    })

    console.log(parametros);

    /*

    data.forEach( linha => {

        const funcao = linha["Função Governo Nome"];
        const gnd = linha["Grupo Despesa Nome"];
        const rp = linha["Resultado EOF"];

        const qde_quadradinhos = linha.squares;

        for (let i = 0; i < qde_quadradinhos; i++) {

            const sq = new Square(
                { funcao, gnd, rp },
                { n_geral, n_funcao, n_gnd, n_rp }

            )

        }

    }) */




    

}


// elements

const btn_menu = document.querySelector("svg.burger");
const menu = document.querySelector("ul.menu");


// BTN MENU HANDLER
btn_menu.addEventListener("click", e => {
    menu.classList.toggle("hidden");
})