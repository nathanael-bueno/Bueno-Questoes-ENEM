import {alerta, ativ_dest_Botao, recolocar, telaCarregamento} from './util.js';

export let respostaCorreta = null;

const questoesComErro = [
    {ano: 2015, questaoId: 145},
    {ano: 2018, questaoId: 62},
    {ano: 2019, questaoId: 98},
    {ano: 2019, questaoId: 100},
    {ano: 2019, questaoId: 128},
    {ano: 2020, questaoId: 144},
    {ano: 2020, questaoId: 168},
    {ano: 2020, questaoId: 179},
    {ano: 2023, questaoId: 34},
    {ano: 2023, questaoId: 174}
];


export function pesquisaQuestao() {
    const ano_pes = Number(document.getElementById('ano-pesquisa').value);
    const questaoId = Number(document.getElementById('questao-pesquisa').value);
    document.getElementById('ano-pesquisa').value = '';
    document.getElementById('questao-pesquisa').value = '';
    if ((ano_pes >= 2009 && ano_pes <= 2023) || (questaoId >= 0 && questaoId <= 180)) {
        for (let i = 0; i < questoesComErro.length; i++) {
            if (questoesComErro[i].ano === ano_pes && questoesComErro[i].questaoId === questaoId) {
                alerta('Alerta', 'Pesquisar', 'Você encontrou uma questão com Erro! Tente pesquisar por uma outra questão, essa questão está com algum erro no nosso banco de dados! Sortearemos uma nova questão!', 'yellow');
                console.error();
                sessionStorage.setItem('pesquisaQuestao', JSON.stringify({ ano: ano_pes, questao: questaoId, erro: true }));
                sortearQuestao();
                return ;
            }
        }
        if (window.location.pathname.includes('historico.html')) {
            sessionStorage.setItem('pesquisaQuestao', JSON.stringify({ ano: ano_pes, questao: questaoId, erro: false }));
            window.location.href = 'index.html';
        } else {
            sortearQuestao(ano_pes, questaoId, false);
        }
    } else {
        alerta('Alerta', 'Pesquisar', 'Você tentou pesquisar uma questão inexistente! Tente pesquisar por uma questão válida! Sortearemos uma questão novamente!', 'yellow');
        console.error();
        sortearQuestao();
        return ;
    }
}

export async function sortearQuestao(anoQ = 0, QId = 0, sorteada = true, linguagem = null) {
    const main = document.getElementById('main');
    const questao = document.getElementById('questao');
    const texto = document.getElementById('texto');
    const pergunta = document.getElementById('pergunta');
    const alternativas = document.getElementById('alternativas');

    const button_conferir = document.getElementById('conferir_resposta');
    let lingua = linguagem || null;
    try {
        main.classList.add('hidden');
        ativ_dest_Botao(button_conferir, false, 'bg-green');
        
        button_conferir.innerHTML = 'Conferir Resposta';
        questao.innerHTML = '';
        texto.innerHTML = '';
        pergunta.innerHTML = '';
        alternativas.innerHTML = '';
        respostaCorreta = null
        
        telaCarregamento('ativar');
        document.getElementById('loading').classList.remove('hidden');
        let ano;
        let questaoId;
        let apiUrl;
        const disc_selecionadas = JSON.parse(sessionStorage.getItem('disciplinasSelecionadas')) || [];
        
        const pesquisaSalvaString = sessionStorage.getItem('pesquisaQuestao');
        if (pesquisaSalvaString) {
            const pesquisaSalva = JSON.parse(pesquisaSalvaString);
            ano = pesquisaSalva.ano;
            questaoId = pesquisaSalva.questao;
            sorteada = false;

            sessionStorage.removeItem('pesquisaQuestao');

            if (pesquisaSalva.erro === true) {
                alerta('Alerta', 'Pesquisar', 'Você encontrou uma questão com Erro! Tente pesquisar por uma outra questão, essa questão está com algum erro no nosso banco de dados! Sortearemos uma nova questão!', 'yellow');
                await new Promise(resolve => setTimeout(resolve, 700));
                sortearQuestao();
                return;
            }
        } else if (sorteada === true) {
            ano = anoQ !== 0 ? anoQ : Math.floor(Math.random() * (2022 - 2009 + 1)) + 2010;
            questaoId = QId !== 0 ? QId : Math.floor(Math.random() * 180) + 1;
        } else {
            ano = anoQ;
            questaoId = QId;
        }
        
        for (let i = 0; i < questoesComErro.length; i++) {
            if (questoesComErro[i].ano === ano && questoesComErro[i].questaoId === questaoId) {
                await new Promise(resolve => setTimeout(resolve, 700));
                sortearQuestao();
                return;
            }
        }

        if (disc_selecionadas.length > 0 && sorteada === true) {
            const disciplina = disc_selecionadas[Math.floor(Math.random() * disc_selecionadas.length)];
            const resTotal = await fetch(`https://bueno-api-enem.vercel.app/${disciplina}/${String(ano)}/questions/total.json`);
            const totalData = await resTotal.json();
            const total_de_questoes = Number(totalData.total);
            
            questaoId = QId != 0 ? QId : Math.floor(Math.random() * total_de_questoes) + 1;
            apiUrl = `https://bueno-api-enem.vercel.app/${disciplina}/${String(ano)}/questions/${String(questaoId)}/details.json`;
        } else {
            apiUrl = `https://bueno-api-enem.vercel.app/${String(ano)}/questions/${String(questaoId)}/details.json`;
        }

        
        fetch(apiUrl)
        .then(response => response.json())
        .then(async data => {
            if (verificarQuestaoSeUsada(data.title) && sorteada === true) {
                await new Promise(resolve => setTimeout(resolve, 700));
                sortearQuestao();
                return;
            }
            lingua = data.language;
            respostaCorreta = data.correctAlternative;
            questao.innerHTML = (data.title == null) ? '' : recolocar(data.title);
            texto.innerHTML = (data.context == null) ? '' : recolocar(data.context, ano, data.index, data.language);
            pergunta.innerHTML = (data.alternativesIntroduction == null) ? '' : recolocar(data.alternativesIntroduction, ano, questaoId);

            for (let i = 0; i < data.alternatives.length; i++) {
                if (data.alternatives[i].text === null){
                    alternativas.innerHTML += `<label class="transition-all duration-150 w-full flex items-top mb-[1.5rem] gap-2 cursor-pointer"><input type="radio" name="resposta" value="${String(data.alternatives[i].letter)}"> ${String(data.alternatives[i].letter)}) <img class="max-w-[50vw]" src="https://bueno-api-enem.vercel.app/${String(ano)}/questions/${String(data.index)}/${recolocar(data.alternatives[i].file)}"></label>`;
                } else {
                    alternativas.innerHTML += `<label class="transition-all duration-150 cursor-pointer"><input type="radio" name="resposta" value="${String(data.alternatives[i].letter)}"> ${String(data.alternatives[i].letter)}) ${recolocar(data.alternatives[i].text)}</label>`;
                }
            }

            const radios = document.getElementsByName('resposta');
            radios.forEach(radio => {
                radio.addEventListener('change', function () {
                    ativ_dest_Botao(button_conferir, true, 'bg-green');
                });
            });

            main.classList.remove('hidden');
            telaCarregamento('desativar');
        })
        .catch(err => {
            console.error(err);
            telaCarregamento('desativar');
            try {
                sortearQuestao(ano, `${questaoId}-${lingua}`, false);
            } catch (error) {
                alerta('Erro', 'Erro ao carregar a questão', `Não foi possível carregar a questão. Tente novamente mais tarde.<br>${String(err)}`, 'red');
            }
        });
        document.getElementById('dropMenuConfig').classList.contains('hidden') ? null : document.getElementById('dropMenuConfig').classList.add('hidden');
    } catch (error) {
        console.error(error);
        telaCarregamento('desativar');
        sortearQuestao();
    }
}

export function registrarQuestaoUsada(questao) {
    const usadas = JSON.parse(localStorage.getItem('questoesRespondidas')) || [];
    if (!usadas.includes(questao)) {
        usadas.push(questao);
        localStorage.setItem('questoesRespondidas', JSON.stringify(usadas));
    }
    document.getElementById('total-questoes-respondidas').innerHTML = String(JSON.parse(localStorage.getItem('questoesRespondidas') ? JSON.parse(localStorage.getItem('questoesRespondidas')).length : 0));
}

export function verificarQuestaoSeUsada(questao) {
    const usadas = JSON.parse(localStorage.getItem('questoesRespondidas')) || [];
    return usadas.includes(questao);
}

export function conferirAlternativas() {
    const button_conferir = document.getElementById('conferir_resposta');
    try {
        const opcoes = document.querySelectorAll('input[name="resposta"]');
        let respostaSelecionada = null;
        opcoes.forEach((opcao) => {
            opcao.parentElement.classList.add('cursor-not-allowed');
            opcao.parentElement.classList.remove('cursor-pointer');
            opcao.disabled = true;
            if (opcao.checked) {
                respostaSelecionada = opcao.value;
            }
        });
        if (respostaSelecionada === null) {
            alerta('Alerta', 'Alerta!', 'Por favor, selecione uma resposta antes de conferir!', 'yellow');
            return;
        } else {
            const opcaoCorretaElement = document.querySelector(`input[value="${respostaCorreta}"]`);
            const opcaoSelecionadaElement = document.querySelector(`input[value="${respostaSelecionada}"]`);
            button_conferir.innerHTML = 'Resposta Conferida!';
            ativ_dest_Botao(button_conferir, false, 'bg-green');
            if (respostaSelecionada === respostaCorreta) {
                opcaoCorretaElement.parentElement.classList.add('bg-green-300', 'border-4', 'border-green-500', 'font-bold', 'text-white', 'rounded-[1.5vw]', 'px-1', 'z-10');
            } else {
                opcaoCorretaElement.parentElement.classList.add('bg-green-300', 'border-4', 'border-green-500', 'font-bold', 'text-white', 'rounded-[1.5vw]', 'px-1', 'z-10');
                opcaoSelecionadaElement.parentElement.classList.add('bg-red-300', 'border-4', 'border-red-500', 'font-bold', 'text-white', 'rounded-[1.5vw]', 'px-1', 'z-10');
            }
            registrarQuestaoUsada(String(document.getElementById('questao').getHTML()));
        }
    } catch (error) {
        console.error(error);
        telaCarregamento('desativar');
        alerta('Erro', 'Erro ao conferir a resposta', `Não foi possível conferir a resposta. Tente novamente mais tarde.<br>${String(error)}`, 'red');
    }
}

export function salvarCheckboxes() {
    const checkboxes = document.querySelectorAll('#dropdownMenuDisc input[type="checkbox"]');
    const selecionados = [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selecionados.push(checkbox.value);
        }
    });

    return selecionados;
}