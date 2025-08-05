export function recolocar(valor, ano = 0, questaoId = 0, disciplina = '') {
    return String(valor).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>').replace(/\_(.*?)\_/g, '<u>$1</u>').replace(/!\[\]\((.*?)\)/g, `<img class="max-w-[50vw]" src="https://bueno-api-enem.vercel.app/${String(ano)}/questions/${String(questaoId)}${(disciplina == 'espanhol' || disciplina == 'ingles') ? `-${disciplina}` : ''}/$1" alt="Imagem">`).replace(/\\\[…\\\]/g, '<span class="text-gray-700">[...]</span>').replace(/\#\#\#\#\#(.*?)<br>/g, '<h3 class="text-lg">$1</h3>').replace(/\[(.*?)\]/g, "[$1]");
}

export function ativ_dest_Botao(botao, estado, cor_ativo) {
    if (botao) {
        try {
            botao.disabled = !estado;
            if (!estado) {
                botao.classList.add('cursor-not-allowed', 'bg-gray-500', 'text-white/75');
                botao.classList.remove('cursor-pointer', `${cor_ativo}-600`, 'text-white', `hover:${cor_ativo}-400'`);
            } else {
                botao.classList.remove('cursor-not-allowed', 'bg-gray-500', 'text-white/75');
                botao.classList.add('cursor-pointer', `${cor_ativo}-600`, 'text-white', `hover:${cor_ativo}-400'`);
            }
        } catch (error) {
            console.error(error);
            alerta('Erro', 'Erro ao ativar/desativar botão', `Não foi possível alterar o estado do botão. Tente novamente mais tarde.<br>${String(error)}`, 'red');
        }
    }
}

export function alerta(tipo = 'Erro', titulo = 'Erro!', mensagem = '', cor = 'red') {
    return new Promise((resolve) => {
        document.body.style.overflow = 'hidden';
        (tipo) ? '' : tipo = 'Erro';
        (titulo) ? '' : titulo = 'Erro!';
        (mensagem) ? '' : mensagem = 'Mensagem não informada...';
        (cor) ? '' : cor = 'red';

        const alerta = document.querySelector('#alerta');
        const alertaBox = document.querySelector('#alerta-box');
        const alertaIcone = document.querySelector('#alerta-icone');
        const alertaTitle = document.querySelector('#alerta-title');
        const alertaMensagem = document.querySelector('#alerta-mensagem');
        const alertaButtonOK = document.querySelector('#alerta-ok');
        let icone = '';

        if (tipo === 'Erro') {
            cor = 'red'; 
            icone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[18vw] sm:w-[12vw] md:w-[7vw] lg:w-[5vw] lucide lucide-octagon-x-icon lucide-octagon-x"><path d="m15 9-6 6"/><path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="m9 9 6 6"/></svg>';
        } else if (tipo === 'Alerta') {
            cor = 'yellow';
            icone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[15vw] sm:w-[11vw] md:w-[5vw] lg:w-[4vw] lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        } else if (tipo === 'Sucesso') {
            cor = 'green';
            icone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00ff40" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[15vw] sm:w-[11vw] md:w-[5vw] lg:w-[4vw] lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>'
        } else if (tipo === 'Info') {
            cor = 'blue';
            icone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0000ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[15vw] sm:w-[11vw] md:w-[5vw] lg:w-[4vw] lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        }

        alertaIcone.innerHTML = icone;
        alerta.classList.add('opacity-[1]', 'visible');
        alerta.classList.remove('hidden', 'opacity-[0]', 'invisible');
        alertaBox.classList.add('bg-' + cor + '-400', 'border-' + cor + '-600');
        alertaBox.classList.remove('bg-gray-500', 'border-gray-700');
        alertaTitle.innerHTML = titulo;
        alertaMensagem.innerHTML = mensagem;
        alertaButtonOK.onclick = function() {
            telaCarregamento('ativar');
            document.body.style.overflow = '';
            alerta.classList.add('opacity-[0]', 'invisible');
            alerta.classList.remove('opacity-[1]', 'visible');
            alerta.classList.add('hidden');
            alertaBox.classList.remove(`bg-${cor}-400`, `border-${cor}-600`);
            alertaBox.classList.add('bg-gray-500', 'border-gray-700');
            alertaIcone.innerHTML = '';
            telaCarregamento('esperar', 700);
            telaCarregamento('desativar');
            resolve();
        };
    });
}

export async function telaCarregamento(estado = 'ativar', tempo = 0) {
    let loading = document.getElementById('loading');
    if (estado == 'ativar') {
        document.body.style.overflow = 'hidden';
        loading.classList.remove('hidden');
    } else if (estado == 'esperar' && tempo > 0) {
        await new Promise(resolve => setTimeout(resolve, tempo));
    } else if (estado == 'desativar') {
        document.body.style.overflow = '';
        loading.classList.add('hidden');
    }
}