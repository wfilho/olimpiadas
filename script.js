const formulario = document.getElementById('form-registro');
const calendarioDiv = document.getElementById('calendario');
const insightsSection = document.getElementById('insights');
const tabelaRegistrosBody = document.querySelector('#tabela-registros tbody');
const limparRegistrosBtn = document.getElementById('limpar-registros');
const mesSelecionado = document.getElementById('mesSelecionado');

let diaSelecionado = null; // Para armazenar o dia selecionado

// Mapeamento atualizado de humor para valores
const humorParaValor = {
    'triste': 1,
    'ansioso': 2,
    'calmo': 3,
    'feliz': 4,
    'eufórico': 5
};

// Cor dos humores
const corHumor = {
    'triste': '#2196F3',
    'ansioso': '#FF5722',
    'calmo': '#4CAF50',
    'feliz': '#ffeb3b',
    'eufórico': '#FFD700'
};

// Cria um calendário
function criarCalendario() {
    const [ano, mes] = mesSelecionado.value.split('-').map(Number); // Corrigido para garantir que mes e ano são números
    const ultimoDia = new Date(ano, mes, 0);
    
    calendarioDiv.innerHTML = '';

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const diaDiv = document.createElement('div');
        diaDiv.textContent = dia;
        diaDiv.onclick = () => mostrarRegistro(dia);
        diaDiv.classList.add('dia-calendario');

        const registroExistente = JSON.parse(localStorage.getItem(`${ano}-${mes}-${dia}`));
        if (registroExistente) {
            diaDiv.style.backgroundColor = corHumor[registroExistente.humor];
        }

        calendarioDiv.appendChild(diaDiv);
    }
    console.log(localStorage);
    console.log(`Mês: ${mes}, Ano: ${ano}`); // Verifica os valores que estão sendo passados
    mostrarInsights(mes - 1, ano); // Chama a função para mostrar insights
    atualizarTabela(); // Atualiza a tabela ao criar o calendário
}

// Função para mostrar registro atual
function mostrarRegistro(dia) {
    diaSelecionado = dia; // Define qual dia foi selecionado
    const [ano, mes] = mesSelecionado.value.split('-');
    const dataSelecionada = new Date(ano, mes - 1, dia);
    const registroExistente = JSON.parse(localStorage.getItem(dataSelecionada.toISOString().split('T')[0]));

    // Limpa a cor dos dias
    const todosDias = calendarioDiv.children;
    for (let i = 0; i < todosDias.length; i++) {
        todosDias[i].style.opacity = '1'; // Restaura a opacidade para o dia anterior
    }

    // Muda a cor do dia selecionado
    if (todosDias[dia - 1]) {
        todosDias[dia - 1].style.opacity = '0.5'; // Muda a opacidade do dia selecionado
    }

    if (registroExistente) {
        document.getElementById('humor').value = registroExistente.humor;
        document.getElementById('atividades').value = registroExistente.atividades;
    } else {
        document.getElementById('humor').value = 'feliz';
        document.getElementById('atividades').value = '';
    }

    formulario.onsubmit = (evento) => {
        evento.preventDefault();

        const humor = document.getElementById('humor').value;
        const atividades = document.getElementById('atividades').value;

        const registro = {
            humor: humor,
            atividades: atividades
        };

        localStorage.setItem(dataSelecionada.toISOString().split('T')[0], JSON.stringify(registro));
        alert('Registro salvo com sucesso!');
        criarCalendario();
    };
}

// Função para atualizar a tabela de registros
function atualizarTabela() {
    tabelaRegistrosBody.innerHTML = ''; // Limpa a tabela antes de atualizar

    const registros = Object.keys(localStorage).filter(key => key.includes('-'));
    registros.forEach(key => {
        const registro = JSON.parse(localStorage.getItem(key));
        const notaHumor = humorParaValor[registro.humor] || 'N/A'; // Obtém a nota de humor

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${key}</td><td>${registro.humor}</td><td>${notaHumor}</td><td>${registro.atividades}</td>`;
        tabelaRegistrosBody.appendChild(tr);
    });
}

// Função para mostrar insights com base no mês
function mostrarInsights(mes, ano) {
    let totalHumor = 0;
    let contador = 0;

    console.log(`Analisando registro para o mês ${mes + 1} do ano ${ano}`);

    for (let dia = 1; dia <= new Date(ano, mes + 1, 0).getDate(); dia++) {
        // Abaixo, formata o mês para ter sempre 2 dígitos
        const mesFormatado = (mes + 1).toString().padStart(2, '0'); // Adiciona zero à esquerda se necessário
        const chave = `${ano}-${mesFormatado}-${dia}`; // Geração da chave corrigida
        const registro = JSON.parse(localStorage.getItem(chave));
        
        console.log(`Verificando chave: ${chave}`); // Log de chave

        if (registro) {
            console.log(`Registro encontrado: ${registro.humor}`); // Log do registro encontrado
            totalHumor += humorParaValor[registro.humor];
            contador++;
        } else {
            console.log(`Nenhum registro para a chave: ${chave}`); // Log quando não encontra o registro
        }
    }

    console.log(`Total humor: ${totalHumor}, Contador: ${contador}`);

    // Calcula a média
    const mediaHumor = (contador > 0) ? (totalHumor / contador) : 0; 
    let sugestao = "";

    // Define as sugestões com base na média
    if (mediaHumor < 2) {
        sugestao = "Sua saúde mental pode estar em risco. Considere conversar com alguém.";
    } else if (mediaHumor < 3) {
        sugestao = "Tente praticar atividades relaxantes, como meditação.";
    } else {
        sugestao = "Você parece estar se sentindo bem! Continue assim!";
    }

    // Atualiza a seção de insights
    insightsSection.innerHTML = `<p>Média de humor: ${mediaHumor.toFixed(2)}</p><p>${sugestao}</p>`;
}

// Limpar registros
limparRegistrosBtn.onclick = () => {
    localStorage.clear();
    alert('Todos os registros foram limpos!');
    criarCalendario();
};

// Atualiza o calendário ao mudar o mês
mesSelecionado.onchange = function() {
    criarCalendario();
};

// Executa ao carregar a página
window.onload = function() {
    criarCalendario();
    mostrarInsights(mes - 1, ano); // Calcular média ao abrir a página
};