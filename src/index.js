import {alerta, ativ_dest_Botao, recolocar, telaCarregamento} from './js/util.js';
import {sortearQuestao, conferirAlternativas, pesquisaQuestao, salvarCheckboxes, respostaCorreta, registrarQuestaoUsada, verificarQuestaoSeUsada} from './js/questoes.js'
import {carregarHistorico, carregarNavbar, carregarPesquisa, carregarQuestoes} from './js/carregar.js';

document.addEventListener('DOMContentLoaded', async function () {
    const paginaAtual = window.location.pathname.split('/').pop() || '';

    await carregarNavbar();
    carregarPesquisa();
    if (paginaAtual === 'index.html' || paginaAtual === '') {
        await carregarQuestoes();
    } else if (paginaAtual === 'historico.html') {
        carregarHistorico();
    }
});