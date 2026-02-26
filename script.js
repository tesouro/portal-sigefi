
// elements

const btn_menu = document.querySelector("svg.burger");
const menu = document.querySelector("ul.menu");


// BTN MENU HANDLER
btn_menu.addEventListener("click", e => {
    menu.classList.toggle("hidden");
})