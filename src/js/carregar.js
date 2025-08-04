import {alerta, ativ_dest_Botao, recolocar, telaCarregamento} from './util.js';
import {sortearQuestao, conferirAlternativas, pesquisaQuestao, salvarCheckboxes, respostaCorreta, registrarQuestaoUsada, verificarQuestaoSeUsada} from './questoes.js'


export async function carregarNavbar() {
    document.getElementById('main').addEventListener('click', async () => {
        document.getElementById("dropMenuConfig").classList.contains('hidden') ? null : document.getElementById("dropMenuConfig").classList.add('hidden');
        document.getElementById("dropdownMenuDisc").classList.contains('hidden') ? null : document.getElementById("dropdownMenuDisc").classList.add('hidden');
        document.getElementById("dropdownMenuHist").classList.contains('hidden') ? null : document.getElementById("dropdownMenuHist").classList.add('hidden');
    });

    const disciplinas = {'Ciências Humanas':"ciencias-humanas", 'Ciências da Natureza':"ciencias-natureza", 'Matemática':"matematica", 'Linguagens':"linguagens", 'Inglês':"ingles", 'Espanhol':"espanhol"};
    const disciplinasSalvas = JSON.parse(sessionStorage.getItem('disciplinasSelecionadas')) || [];
    const entrada = sessionStorage.getItem('entrada');

    const menu_drop = document.getElementById('dropdownMenuDisc');
    menu_drop.innerHTML = '';

    let i = 0;
    for (const [nome, valor] of Object.entries(disciplinas)) {
        const checked = (disciplinasSalvas.includes(valor) || entrada === null) ? 'checked' : '';
        if (i === 4){
            menu_drop.innerHTML += `
                <label class="text-white/55 text-center flex items-center space-x-2 mt-2">
                    <span class="text-center">--- Línguas Estrangeiras ---</span>
                </label>`;
        }
        menu_drop.innerHTML += `
            <label class="cursor-pointer flex items-center space-x-2 ${i !== 0 ? 'mt-2' : ''}">
                <input type="checkbox" value="${valor}" class="form-checkbox" ${checked}>
                <span>${nome}</span>
            </label>`;
        i++;
    }
    menu_drop.innerHTML += `<div class="flex justify-center items-center"><button type="button" id="salvar-disciplinas" class="transition-all duration-300 bg-green-600 hover:bg-green-400 text-white font-bold p-2 rounded-tl-[4vw] rounded-br-[4vw] sm:rounded-tl-[2vw] sm:rounded-br-[2vw] lg:rounded-tl-[1.1vw] lg:rounded-br-[1.1vw] cursor-pointer mt-2">Salvar Disciplinas</button></div>`;

    document.querySelectorAll('#dropdownMenuDisc input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', salvarCheckboxes);
    });

    const menu_config = document.getElementById('dropdownConfig');
    menu_config.addEventListener('click', () => {
        document.getElementById('dropMenuConfig').classList.toggle('hidden');
    });
    
    const menu_disc = document.getElementById('dropdownDisc');
    menu_disc.addEventListener('click', () => {
        document.getElementById("dropdownMenuDisc").classList.toggle("hidden");
        document.getElementById("dropdownMenuHist").classList.contains('hidden') ? null : document.getElementById("dropdownMenuHist").classList.add('hidden');
    });
    
    const salvar_disc = document.getElementById('salvar-disciplinas');
    salvar_disc.addEventListener('click', () => {
        const paginaAtual = window.location.pathname.split('/').pop() || '';
        const selecionados = salvarCheckboxes();
        sessionStorage.setItem('disciplinasSelecionadas', JSON.stringify(selecionados));
        sessionStorage.setItem('entrada', '1');
        if (paginaAtual === 'index.html' || window.location === "https://nathanael-bueno.github.io/Bueno-Questoes-ENEM/") {
            sortearQuestao();
        }
    });
    
    const menu_historico = document.getElementById('dropdownHist');
    menu_historico.addEventListener('click', () => {
        document.getElementById("dropdownMenuHist").classList.toggle("hidden");
        document.getElementById("dropdownMenuDisc").classList.contains('hidden') ? null : document.getElementById("dropdownMenuDisc").classList.add('hidden');
    });

    const menu_hist_html = document.getElementById("dropdownMenuHist");
    menu_hist_html.innerHTML = `<p class="text-center transition-all duration-300 bg-gray-500 hover:bg-gray-400 text-white font-bold p-2 rounded-tl-[4vw] rounded-br-[4vw] sm:rounded-tl-[2vw] sm:rounded-br-[2vw] lg:rounded-tl-[1.1vw] lg:rounded-br-[1.1vw] cursor-pointer"><a href="historico.html" class="text-white no-underline sm:flex items-center">Histórico de Questões</a></p>
    <button type="button" id="limpar-hist-quest" class="transition-all duration-300 bg-green-500 hover:bg-green-400 text-white font-bold p-2 rounded-tl-[4vw] rounded-br-[4vw] sm:rounded-tl-[2vw] sm:rounded-br-[2vw] lg:rounded-tl-[1.1vw] lg:rounded-br-[1.1vw] cursor-pointer">Limpar Historico</button>
    <p class="text-center">Questões Respondidas: <span id="total-questoes-respondidas"></span></p>`;
    
    document.getElementById('total-questoes-respondidas').innerHTML = String(JSON.parse(localStorage.getItem('questoesRespondidas') ? JSON.parse(localStorage.getItem('questoesRespondidas')).length : 0));
    const limparHistorico = document.getElementById('limpar-hist-quest');
    limparHistorico.addEventListener('click', () => {
        localStorage.removeItem('questoesRespondidas');
        document.getElementById('total-questoes-respondidas').innerHTML = '0';
        alerta('Sucesso', 'Histórico Limpo', 'O histórico de questões foi limpo com sucesso!', 'green');
        document.getElementById('hist-questoes-respondidas') ? carregarHistorico() : null;
    });
}

export function carregarHistorico() {
    const questoesRespondidas = JSON.parse(localStorage.getItem('questoesRespondidas')) || [];
    const questoesContainer = document.getElementById('hist-questoes-respondidas');
    questoesContainer.innerHTML = '';

    if (questoesRespondidas.length === 0) {
        document.getElementById('hist-recent').classList.add('sm:hidden');
        document.getElementById('hist-recent').classList.remove('sm:flex');
        questoesContainer.innerHTML = '<div class="w-full col-span-full flex justify-center items-center"><p class="text-2xl text-center font-semibold mt-2">Nenhuma questão respondida ainda.</p></div>';
        return;
    }
    document.getElementById('hist-recent').classList.remove('sm:hidden');
    document.getElementById('hist-recent').classList.add('sm:flex');
    questoesRespondidas.forEach((questao) => {
        const questaoElement = document.createElement('div');
        questaoElement.className = 'bg-gray-200 p-4 rounded-lg flex items-center justify-center text-center';
        questaoElement.innerHTML = `
            <h3 class="font-bold">${questao}</h3>
        `;
        questoesContainer.appendChild(questaoElement);
    });
}

export async function carregarQuestoes() {
    const button_sortear = document.getElementById('sortear_questao');
    button_sortear.addEventListener('click', () => {sortearQuestao()});
    const btn_conferir = document.getElementById('conferir_resposta');
    btn_conferir.addEventListener('click', conferirAlternativas);


    await sortearQuestao();
}

export function carregarPesquisa() {
    const pesquisar = document.getElementById('form-pesquisa');
    pesquisar.addEventListener('submit', function(event) {
        event.preventDefault();
        pesquisaQuestao();
    });

    for (let i = 2009; i <= 2023; i++) {
        const opcao = document.createElement('option');
        opcao.value = i;
        opcao.textContent = i;
        document.querySelector('#ano-pesquisa').appendChild(opcao);
    };
}