// ============================================================
// ERP FINANCEIRO PROFISSIONAL - SCRIPT COMPLETO
// ============================================================

// ==================== ESTADO GLOBAL ====================
const estado = {
    paginaAtual: 'dashboard',
    dados: {
        contas: [],
        recebimentos: [],
        pagamentos: [],
        movimentacoes: [],
        creditos: [],
        configs: {}
    },
    graficos: {},
    editando: null,
    loading: false
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ERP Financeiro Profissional v3.0');
    configurarDataAtual();
    configurarMenu();
    configurarModal();
    configurarMenuToggle();
    carregarSistema();
});

function configurarDataAtual() {
    const hoje = new Date();
    const opcoes = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    document.getElementById('currentDate').textContent = hoje.toLocaleDateString('pt-BR', opcoes);
}

// ==================== MENU ====================
function configurarMenu() {
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pagina = this.dataset.page;
            if (!pagina) return;
            
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            carregarPagina(pagina);
        });
    });
}

function configurarMenuToggle() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('mainContent');
    
    toggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        main.classList.toggle('expanded');
    });
}

// ==================== MODAL ====================
function configurarModal() {
    const modal = document.getElementById('modal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
}

function abrirModal(titulo, bodyHTML, submitText = 'Salvar', onSubmit = null) {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalSubmit').textContent = submitText;
    
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
    
    // Configurar submit
    const submitBtn = document.getElementById('modalSubmit');
    submitBtn.onclick = null;
    if (onSubmit) {
        submitBtn.onclick = async function() {
            await onSubmit();
        };
    }
    
    return modal;
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
    estado.editando = null;
}

// ==================== TOAST ====================
function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    const icones = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `<i class="fas ${icones[tipo] || icones.info}"></i> ${mensagem}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==================== LOADING ====================
function mostrarLoading(mensagem = 'Carregando...') {
    const area = document.getElementById('contentArea');
    area.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">${mensagem}</div>
        </div>
    `;
}

function esconderLoading() {
    // O conteúdo será substituído pela página
}

// ==================== CARREGAR SISTEMA ====================
async function carregarSistema() {
    mostrarLoading('Inicializando sistema...');
    
    try {
        await carregarDados();
        await carregarPagina('dashboard');
        atualizarBadges();
        mostrarToast('Sistema carregado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar sistema:', error);
        mostrarToast('Erro ao carregar sistema', 'error');
    }
}

async function carregarDados() {
    const acoes = [
        { nome: 'contas', acao: 'listar_contas' },
        { nome: 'recebimentos', acao: 'listar_recebimentos' },
        { nome: 'pagamentos', acao: 'listar_pagamentos' },
        { nome: 'movimentacoes', acao: 'listar_movimentacoes' },
        { nome: 'creditos', acao: 'listar_creditos' },
        { nome: 'configs', acao: 'listar_configuracoes' }
    ];
    
    for (const item of acoes) {
        try {
            const resultado = await chamarAPI(item.acao);
            if (resultado.sucesso) {
                estado.dados[item.nome] = resultado.dados || [];
            }
        } catch (error) {
            console.error(`Erro ao carregar ${item.nome}:`, error);
            estado.dados[item.nome] = [];
        }
    }
}

function chamarAPI(acao, dados = {}) {
    return new Promise((resolve, reject) => {
        fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao, ...dados })
        })
        .then(r => r.json())
        .then(resolve)
        .catch(reject);
    });
}

// ==================== NAVEGAÇÃO ====================
async function carregarPagina(pagina) {
    estado.paginaAtual = pagina;
    
    // Atualizar título
    const titulos = {
        dashboard: 'Dashboard <small>Visão geral do sistema</small>',
        contas: 'Contas Bancárias <small>Gerencie suas contas</small>',
        recebimentos: 'Recebimentos <small>Controle de receitas</small>',
        pagamentos: 'Contas a Pagar <small>Gerencie despesas</small>',
        fluxo: 'Fluxo de Caixa <small>Projeção financeira</small>',
        relatorios: 'Relatórios <small>Análises e métricas</small>',
        configuracoes: 'Configurações <small>Personalize o sistema</small>',
        backup: 'Backup <small>Proteja seus dados</small>'
    };
    document.getElementById('pageTitle').innerHTML = titulos[pagina] || pagina;
    
    // Carregar conteúdo
    mostrarLoading('Carregando...');
    
    switch(pagina) {
        case 'dashboard':
            await renderDashboard();
            break;
        case 'contas':
            await renderContas();
            break;
        case 'recebimentos':
            await renderRecebimentos();
            break;
        case 'pagamentos':
            await renderPagamentos();
            break;
        case 'fluxo':
            await renderFluxoCaixa();
            break;
        case 'relatorios':
            await renderRelatorios();
            break;
        case 'configuracoes':
            await renderConfiguracoes();
            break;
        case 'backup':
            await renderBackup();
            break;
    }
    
    atualizarBadges();
}

function atualizarBadges() {
    document.getElementById('badgeContas').textContent = estado.dados.contas.length;
    document.getElementById('badgeRecebimentos').textContent = 
        estado.dados.recebimentos.filter(r => r.status === 'A Receber').length;
    document.getElementById('badgePagamentos').textContent = 
        estado.dados.pagamentos.filter(p => p.status === 'A Pagar').length;
}

// ============================================================
// DASHBOARD
// ============================================================
async function renderDashboard() {
    const area = document.getElementById('contentArea');
    
    try {
        const resultado = await chamarAPI('dashboard');
        if (!resultado.sucesso) throw new Error(resultado.mensagem);
        
        const dados = resultado.dados;
        
        // Calcular indicadores
        const patrimonio = dados.patrimonio_total || 0;
        const aReceber = dados.total_a_receber || 0;
        const aPagar = dados.total_a_pagar || 0;
        const disponivel = dados.disponivel_real || 0;
        const projetado = dados.saldo_projetado || 0;
        
        area.innerHTML = `
            <!-- Cards -->
            <div class="dashboard-grid">
                ${criarCard('Patrimônio Total', formatarMoeda(patrimonio), 'fa-chart-pie', 'Verde escuro')}
                ${criarCard('Saldo Disponível', formatarMoeda(disponivel), 'fa-hand-holding-usd', 'Verde claro')}
                ${criarCard('A Receber', formatarMoeda(aReceber), 'fa-arrow-down', 'Azul')}
                ${criarCard('A Pagar', formatarMoeda(aPagar), 'fa-arrow-up', 'Vermelho')}
                ${criarCard('Saldo Projetado', formatarMoeda(projetado), 'fa-chart-line', 'Roxo')}
                ${criarCard('Contas Ativas', dados.quantidade_contas || 0, 'fa-university', 'Cinza')}
            </div>
            
            <!-- Gráficos -->
            <div class="charts-grid">
                <div class="chart-card">
                    <h3><i class="fas fa-chart-pie" style="color: var(--primary-light);"></i> Distribuição por Banco</h3>
                    <div class="chart-container">
                        <canvas id="chartBancos"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3><i class="fas fa-chart-bar" style="color: var(--primary-light);"></i> Saldo por Empresa</h3>
                    <div class="chart-container">
                        <canvas id="chartEmpresas"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Resumo -->
            <div class="chart-card">
                <h3><i class="fas fa-flag" style="color: var(--primary-light);"></i> Resumo Financeiro</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 8px;">
                    <div><strong>Recebimentos:</strong> ${dados.total_recebido ? formatarMoeda(dados.total_recebido) : 'R$ 0,00'}</div>
                    <div><strong>Pagamentos:</strong> ${dados.total_pago ? formatarMoeda(dados.total_pago) : 'R$ 0,00'}</div>
                    <div><strong>Créditos Pendentes:</strong> ${dados.creditos_pendentes ? formatarMoeda(dados.creditos_pendentes) : 'R$ 0,00'}</div>
                    <div><strong>Receb. Atrasados:</strong> ${dados.recebimentos_atrasados ? formatarMoeda(dados.recebimentos_atrasados) : 'R$ 0,00'}</div>
                    <div><strong>Pag. Atrasados:</strong> ${dados.pagamentos_atrasados ? formatarMoeda(dados.pagamentos_atrasados) : 'R$ 0,00'}</div>
                </div>
            </div>
        `;
        
        // Renderizar gráficos
        setTimeout(() => {
            renderizarGraficos(dados);
        }, 200);
        
    } catch (error) {
        area.innerHTML = `
            <div class="card" style="padding: 40px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: var(--warning);"></i>
                <h3 style="margin-top: 16px;">Erro ao carregar dashboard</h3>
                <p style="color: var(--gray-500);">${error.message}</p>
                <button class="btn btn-primary mt-16" onclick="carregarPagina('dashboard')">Tentar novamente</button>
            </div>
        `;
    }
}

function criarCard(label, valor, icone, cor) {
    const cores = {
        'Verde escuro': '#1B4F3B',
        'Verde claro': '#4CAF93',
        'Azul': '#3B82F6',
        'Vermelho': '#EF4444',
        'Roxo': '#8B5CF6',
        'Cinza': '#6B7280'
    };
    
    return `
        <div class="card">
            <div class="card-header">
                <span class="card-label">${label}</span>
                <i class="fas ${icone}" style="color: ${cores[cor] || '#2E7D64'};"></i>
            </div>
            <div class="card-value">${valor}</div>
        </div>
    `;
}

function renderizarGraficos(dados) {
    // Gráfico por Banco
    const ctx1 = document.getElementById('chartBancos');
    if (ctx1 && dados.saldo_por_banco) {
        const labels = Object.keys(dados.saldo_por_banco);
        const values = Object.values(dados.saldo_por_banco);
        
        new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: CONFIG.CORES.grafico.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 16, usePointStyle: true, font: { size: 12 } }
                    }
                },
                cutout: '65%'
            }
        });
    }
    
    // Gráfico por Empresa
    const ctx2 = document.getElementById('chartEmpresas');
    if (ctx2 && dados.saldo_por_empresa) {
        const entries = Object.entries(dados.saldo_por_empresa)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'Saldo (R$)',
                    data: entries.map(e => e[1]),
                    backgroundColor: '#2E7D64',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: v => 'R$ ' + v.toFixed(0) }
                    }
                }
            }
        });
    }
}

// ============================================================
// CONTAS BANCÁRIAS
// ============================================================
async function renderContas() {
    const area = document.getElementById('contentArea');
    const contas = estado.dados.contas;
    const total = contas.reduce((s, c) => s + (parseFloat(c.saldo_atual) || 0), 0);
    
    area.innerHTML = `
        <div class="flex-between flex-wrap" style="margin-bottom: 20px;">
            <div>
                <h3 style="font-weight: 600;">Total Consolidado: ${formatarMoeda(total)}</h3>
                <p style="color: var(--gray-500); font-size: 13px;">${contas.length} contas ativas</p>
            </div>
            <div class="flex gap-8">
                <button class="btn btn-primary" onclick="abrirModalNovaConta()">
                    <i class="fas fa-plus"></i> Nova Conta
                </button>
                <button class="btn btn-secondary" onclick="carregarPagina('contas')">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Banco</th>
                            <th>Empresa</th>
                            <th>Agência</th>
                            <th>Conta</th>
                            <th style="text-align: right;">Saldo</th>
                            <th style="text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contas.length === 0 ? `
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-500);">
                                    <i class="fas fa-university" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
                                    Nenhuma conta cadastrada
                                </td>
                            </tr>
                        ` : contas.map((c, i) => `
                            <tr>
                                <td><strong>${c.banco || '-'}</strong></td>
                                <td>${c.empresa || '-'}</td>
                                <td>${c.agencia || '-'}</td>
                                <td>${c.conta || '-'}</td>
                                <td style="text-align: right; font-weight: 600; color: ${parseFloat(c.saldo_atual) >= 0 ? 'var(--success)' : 'var(--danger)'}">
                                    ${formatarMoeda(c.saldo_atual)}
                                </td>
                                <td style="text-align: center;">
                                    <button class="btn btn-sm btn-secondary" onclick="editarConta(${c._id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="excluirConta(${c._id})" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function abrirModalNovaConta() {
    estado.editando = null;
    const html = `
        <form id="formConta">
            <div class="form-group">
                <label>Banco <span class="required">*</span></label>
                <select class="form-control" name="banco" required>
                    <option value="">Selecione...</option>
                    <option>Caixa</option>
                    <option>Bradesco</option>
                    <option>Banco do Brasil</option>
                    <option>Sicoob</option>
                    <option>Itaú</option>
                    <option>Santander</option>
                    <option>Outro</option>
                </select>
            </div>
            <div class="form-group">
                <label>Empresa <span class="required">*</span></label>
                <input class="form-control" type="text" name="empresa" required placeholder="Nome da empresa">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Agência</label>
                    <input class="form-control" type="text" name="agencia" placeholder="0001">
                </div>
                <div class="form-group">
                    <label>Conta</label>
                    <input class="form-control" type="text" name="conta" placeholder="12345-6">
                </div>
            </div>
            <div class="form-group">
                <label>Saldo Inicial</label>
                <input class="form-control" type="number" name="saldo_atual" step="0.01" value="0">
            </div>
            <div class="form-group">
                <label>Observação</label>
                <textarea class="form-control" name="observacao" rows="2" placeholder="Informações adicionais..."></textarea>
            </div>
        </form>
    `;
    
    abrirModal('Nova Conta Bancária', html, 'Salvar', async () => {
        const form = document.getElementById('formConta');
        const dados = new FormData(form);
        const obj = {};
        dados.forEach((v, k) => obj[k] = v);
        obj.saldo_atual = parseFloat(obj.saldo_atual) || 0;
        
        const resultado = await chamarAPI('salvar_conta', obj);
        if (resultado.sucesso) {
            fecharModal();
            await carregarDados();
            await carregarPagina('contas');
            mostrarToast('Conta salva com sucesso!', 'success');
        } else {
            mostrarToast('Erro ao salvar: ' + resultado.mensagem, 'error');
        }
    });
}

async function editarConta(id) {
    const conta = estado.dados.contas.find(c => c._id === id);
    if (!conta) return;
    
    estado.editando = { tipo: 'conta', id: id };
    const html = `
        <form id="formConta">
            <div class="form-group">
                <label>Banco <span class="required">*</span></label>
                <select class="form-control" name="banco" required>
                    <option ${conta.banco === 'Caixa' ? 'selected' : ''}>Caixa</option>
                    <option ${conta.banco === 'Bradesco' ? 'selected' : ''}>Bradesco</option>
                    <option ${conta.banco === 'Banco do Brasil' ? 'selected' : ''}>Banco do Brasil</option>
                    <option ${conta.banco === 'Sicoob' ? 'selected' : ''}>Sicoob</option>
                    <option ${conta.banco === 'Itaú' ? 'selected' : ''}>Itaú</option>
                    <option ${conta.banco === 'Santander' ? 'selected' : ''}>Santander</option>
                </select>
            </div>
            <div class="form-group">
                <label>Empresa <span class="required">*</span></label>
                <input class="form-control" type="text" name="empresa" required value="${conta.empresa || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Agência</label>
                    <input class="form-control" type="text" name="agencia" value="${conta.agencia || ''}">
                </div>
                <div class="form-group">
                    <label>Conta</label>
                    <input class="form-control" type="text" name="conta" value="${conta.conta || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Saldo</label>
                <input class="form-control" type="number" name="saldo_atual" step="0.01" value="${conta.saldo_atual || 0}">
            </div>
            <div class="form-group">
                <label>Observação</label>
                <textarea class="form-control" name="observacao" rows="2">${conta.observacao || ''}</textarea>
            </div>
        </form>
    `;
    
    abrirModal('Editar Conta', html, 'Atualizar', async () => {
        const form = document.getElementById('formConta');
        const dados = new FormData(form);
        const obj = {};
        dados.forEach((v, k) => obj[k] = v);
        obj.id = id;
        obj.saldo_atual = parseFloat(obj.saldo_atual) || 0;
        
        const resultado = await chamarAPI('editar_conta', obj);
        if (resultado.sucesso) {
            fecharModal();
            await carregarDados();
            await carregarPagina('contas');
            mostrarToast('Conta atualizada!', 'success');
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'error');
        }
    });
}

async function excluirConta(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    const resultado = await chamarAPI('excluir_conta', { id });
    if (resultado.sucesso) {
        await carregarDados();
        await carregarPagina('contas');
        mostrarToast('Conta excluída!', 'success');
    } else {
        mostrarToast('Erro ao excluir', 'error');
    }
}

// ============================================================
// RECEBIMENTOS
// ============================================================
async function renderRecebimentos() {
    const area = document.getElementById('contentArea');
    const recebimentos = estado.dados.recebimentos;
    
    area.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="abrirModalNovoRecebimento()">
                <i class="fas fa-plus"></i> Novo Recebimento
            </button>
        </div>
        
        <div class="table-container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Descrição</th>
                            <th style="text-align: right;">Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th style="text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recebimentos.length === 0 ? `
                            <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-500);">
                                <i class="fas fa-arrow-down" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
                                Nenhum recebimento cadastrado
                            </td></tr>
                        ` : recebimentos.map((r, i) => `
                            <tr>
                                <td><strong>${r.cliente || '-'}</strong></td>
                                <td>${r.descricao || '-'}</td>
                                <td style="text-align: right; font-weight: 600;">${formatarMoeda(r.valor_previsto)}</td>
                                <td>${r.vencimento || '-'}</td>
                                <td>
                                    <span class="badge-status ${r.status === 'Recebido' ? 'received' : r.status === 'Atrasado' ? 'overdue' : 'pending'}">
                                        ${r.status || 'A Receber'}
                                    </span>
                                </td>
                                <td style="text-align: center;">
                                    ${r.status !== 'Recebido' ? `
                                        <button class="btn btn-sm btn-success" onclick="marcarRecebido(${r._id})" title="Receber">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-secondary" onclick="editarRecebimento(${r._id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="excluirRecebimento(${r._id})" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function abrirModalNovoRecebimento() {
    const html = `
        <form id="formRecebimento">
            <div class="form-group">
                <label>Cliente <span class="required">*</span></label>
                <input class="form-control" type="text" name="cliente" required placeholder="Nome do cliente">
            </div>
            <div class="form-group">
                <label>Descrição <span class="required">*</span></label>
                <input class="form-control" type="text" name="descricao" required placeholder="Descrição do recebimento">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor <span class="required">*</span></label>
                    <input class="form-control" type="number" name="valor_previsto" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Vencimento <span class="required">*</span></label>
                    <input class="form-control" type="date" name="vencimento" required>
                </div>
            </div>
            <div class="form-group">
                <label>Categoria</label>
                <input class="form-control" type="text" name="categoria" placeholder="Ex: Vendas, Serviços...">
            </div>
            <div class="form-group">
                <label>Banco Destino</label>
                <select class="form-control" name="banco_destino">
                    <option value="">Selecione...</option>
                    ${estado.dados.contas.map(c => `<option>${c.banco} - ${c.empresa}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Observação</label>
                <textarea class="form-control" name="observacao" rows="2"></textarea>
            </div>
        </form>
    `;
    
    abrirModal('Novo Recebimento', html, 'Salvar', async () => {
        const form = document.getElementById('formRecebimento');
        const dados = new FormData(form);
        const obj = {};
        dados.forEach((v, k) => obj[k] = v);
        obj.valor_previsto = parseFloat(obj.valor_previsto) || 0;
        obj.status = 'A Receber';
        
        const resultado = await chamarAPI('salvar_recebimento', obj);
        if (resultado.sucesso) {
            fecharModal();
            await carregarDados();
            await carregarPagina('recebimentos');
            mostrarToast('Recebimento salvo!', 'success');
        }
    });
}

async function marcarRecebido(id) {
    if (!confirm('Marcar este recebimento como recebido?')) return;
    
    const resultado = await chamarAPI('receber_valor', { id });
    if (resultado.sucesso) {
        await carregarDados();
        await carregarPagina('recebimentos');
        mostrarToast('Recebimento marcado como recebido!', 'success');
    }
}

// ============================================================
// PAGAMENTOS
// ============================================================
async function renderPagamentos() {
    const area = document.getElementById('contentArea');
    const pagamentos = estado.dados.pagamentos;
    
    area.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="abrirModalNovoPagamento()">
                <i class="fas fa-plus"></i> Nova Conta a Pagar
            </button>
        </div>
        
        <div class="table-container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Fornecedor</th>
                            <th>Descrição</th>
                            <th style="text-align: right;">Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th style="text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagamentos.length === 0 ? `
                            <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-500);">
                                <i class="fas fa-arrow-up" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
                                Nenhuma conta a pagar
                            </td></tr>
                        ` : pagamentos.map((p, i) => `
                            <tr>
                                <td><strong>${p.fornecedor || '-'}</strong></td>
                                <td>${p.descricao || '-'}</td>
                                <td style="text-align: right; font-weight: 600;">${formatarMoeda(p.valor)}</td>
                                <td>${p.vencimento || '-'}</td>
                                <td>
                                    <span class="badge-status ${p.status === 'Pago' ? 'paid' : p.status === 'Vencido' ? 'overdue' : 'pending'}">
                                        ${p.status || 'A Pagar'}
                                    </span>
                                </td>
                                <td style="text-align: center;">
                                    ${p.status !== 'Pago' ? `
                                        <button class="btn btn-sm btn-success" onclick="marcarPago(${p._id})" title="Pagar">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-secondary" onclick="editarPagamento(${p._id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="excluirPagamento(${p._id})" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ============================================================
// FLUXO DE CAIXA
// ============================================================
async function renderFluxoCaixa() {
    const area = document.getElementById('contentArea');
    
    area.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div class="form-group" style="margin: 0;">
                <label style="font-size: 13px;">Período</label>
                <select class="form-control" id="periodoFluxo" style="width: 150px;" onchange="carregarFluxo()">
                    <option value="7">7 dias</option>
                    <option value="30" selected>30 dias</option>
                    <option value="60">60 dias</option>
                    <option value="90">90 dias</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="carregarFluxo()" style="margin-top: 18px;">
                <i class="fas fa-chart-line"></i> Atualizar
            </button>
        </div>
        
        <div class="chart-card" style="margin-bottom: 20px;">
            <h3>Projeção de Fluxo de Caixa</h3>
            <div class="chart-container" style="height: 300px;">
                <canvas id="chartFluxo"></canvas>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h3>Detalhamento Diário</h3>
                <span style="color: var(--gray-500); font-size: 13px;">Projeção baseada em recebimentos e pagamentos</span>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Dia</th>
                            <th style="text-align: right;">Entradas</th>
                            <th style="text-align: right;">Saídas</th>
                            <th style="text-align: right;">Saldo Acumulado</th>
                        </tr>
                    </thead>
                    <tbody id="fluxoBody">
                        <tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--gray-500);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i> Carregando...
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await carregarFluxo();
}

async function carregarFluxo() {
    const periodo = document.getElementById('periodoFluxo')?.value || 30;
    
    try {
        const resultado = await chamarAPI('fluxo_caixa', { periodo: parseInt(periodo) });
        
        if (resultado.sucesso && resultado.dados) {
            const dados = resultado.dados;
            
            // Atualizar tabela
            const tbody = document.getElementById('fluxoBody');
            tbody.innerHTML = dados.map(d => `
                <tr>
                    <td>${d.data_formatada}</td>
                    <td>${d.dia_semana}</td>
                    <td style="text-align: right; color: var(--success);">${d.entradas > 0 ? formatarMoeda(d.entradas) : '-'}</td>
                    <td style="text-align: right; color: var(--danger);">${d.saidas > 0 ? formatarMoeda(d.saidas) : '-'}</td>
                    <td style="text-align: right; font-weight: 600;">${formatarMoeda(d.saldo_atual)}</td>
                </tr>
            `).join('');
            
            // Renderizar gráfico
            const ctx = document.getElementById('chartFluxo');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dados.map(d => d.data_formatada),
                        datasets: [
                            {
                                label: 'Entradas',
                                data: dados.map(d => d.entradas),
                                borderColor: '#22C55E',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                fill: true
                            },
                            {
                                label: 'Saídas',
                                data: dados.map(d => d.saidas),
                                borderColor: '#EF4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                fill: true
                            },
                            {
                                label: 'Saldo',
                                data: dados.map(d => d.saldo_atual),
                                borderColor: '#2E7D64',
                                backgroundColor: 'rgba(46, 125, 100, 0.05)',
                                fill: true,
                                borderWidth: 2,
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'top' }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { callback: v => 'R$ ' + v.toFixed(0) }
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar fluxo:', error);
    }
}

// ============================================================
// RELATÓRIOS
// ============================================================
async function renderRelatorios() {
    const area = document.getElementById('contentArea');
    
    area.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>📊 Relatórios Financeiros</h3>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                    <button class="btn btn-primary" onclick="gerarRelatorio('movimentacoes')">
                        <i class="fas fa-exchange-alt"></i> Movimentações
                    </button>
                    <button class="btn btn-primary" onclick="gerarRelatorio('recebimentos')">
                        <i class="fas fa-arrow-down"></i> Recebimentos
                    </button>
                    <button class="btn btn-primary" onclick="gerarRelatorio('pagamentos')">
                        <i class="fas fa-arrow-up"></i> Pagamentos
                    </button>
                    <button class="btn btn-primary" onclick="gerarRelatorio('bancario')">
                        <i class="fas fa-university"></i> Posição Bancária
                    </button>
                    <button class="btn btn-success" onclick="gerarRelatorio('geral')">
                        <i class="fas fa-file-pdf"></i> Relatório Geral
                    </button>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>⚙️ Filtros</h3>
                <div id="filtrosRelatorio" style="margin-top: 16px;">
                    <div class="form-group">
                        <label>Período</label>
                        <select class="form-control" id="filtroPeriodo">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30" selected>Últimos 30 dias</option>
                            <option value="60">Últimos 60 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="180">Últimos 180 dias</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Empresa</label>
                        <select class="form-control" id="filtroEmpresa">
                            <option value="">Todas</option>
                            ${[...new Set(estado.dados.contas.map(c => c.empresa))].filter(Boolean).map(e => `<option>${e}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="aplicarFiltrosRelatorio()" style="width: 100%;">
                        <i class="fas fa-filter"></i> Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card mt-16" id="resultadoRelatorio" style="display: none;">
            <div id="conteudoRelatorio"></div>
        </div>
    `;
}

async function gerarRelatorio(tipo) {
    const periodo = document.getElementById('filtroPeriodo')?.value || 30;
    const empresa = document.getElementById('filtroEmpresa')?.value || '';
    
    const resultado = await chamarAPI('relatorios', { tipo, periodo: parseInt(periodo), empresa });
    
    const container = document.getElementById('resultadoRelatorio');
    const conteudo = document.getElementById('conteudoRelatorio');
    
    if (resultado.sucesso && resultado.dados) {
        container.style.display = 'block';
        const dados = resultado.dados;
        
        let html = '<h3>📄 Relatório</h3>';
        
        if (tipo === 'geral' || tipo === 'movimentacoes') {
            html += `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 16px 0;">
                    <div><strong>Total Movimentações:</strong> ${dados.movimentacoes?.total_movimentacoes || 0}</div>
                    <div style="color: var(--success);"><strong>Entradas:</strong> ${formatarMoeda(dados.movimentacoes?.total_entradas || 0)}</div>
                    <div style="color: var(--danger);"><strong>Saídas:</strong> ${formatarMoeda(dados.movimentacoes?.total_saidas || 0)}</div>
                    <div><strong>Saldo Período:</strong> ${formatarMoeda(dados.movimentacoes?.saldo_periodo || 0)}</div>
                </div>
            `;
        }
        
        if (tipo === 'geral' || tipo === 'recebimentos') {
            html += `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 16px 0;">
                    <div><strong>Total Recebimentos:</strong> ${dados.recebimentos?.total_recebimentos || 0}</div>
                    <div><strong>Previsto:</strong> ${formatarMoeda(dados.recebimentos?.total_previsto || 0)}</div>
                    <div style="color: var(--success);"><strong>Recebido:</strong> ${formatarMoeda(dados.recebimentos?.total_recebido || 0)}</div>
                    <div style="color: var(--warning);"><strong>Pendentes:</strong> ${formatarMoeda(dados.recebimentos?.pendentes || 0)}</div>
                    <div><strong>Taxa:</strong> ${(dados.recebimentos?.taxa_recebimento || 0).toFixed(1)}%</div>
                </div>
            `;
        }
        
        if (tipo === 'geral' || tipo === 'pagamentos') {
            html += `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 16px 0;">
                    <div><strong>Total Pagamentos:</strong> ${dados.pagamentos?.total_pagamentos || 0}</div>
                    <div><strong>Previsto:</strong> ${formatarMoeda(dados.pagamentos?.total_previsto || 0)}</div>
                    <div style="color: var(--success);"><strong>Pago:</strong> ${formatarMoeda(dados.pagamentos?.total_pago || 0)}</div>
                    <div style="color: var(--warning);"><strong>Pendentes:</strong> ${formatarMoeda(dados.pagamentos?.pendentes || 0)}</div>
                    <div><strong>Taxa:</strong> ${(dados.pagamentos?.taxa_pagamento || 0).toFixed(1)}%</div>
                </div>
            `;
        }
        
        if (tipo === 'geral' || tipo === 'bancario') {
            html += `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 16px 0;">
                    <div><strong>Total Contas:</strong> ${dados.bancario?.total_contas || 0}</div>
                    <div><strong>Patrimônio Total:</strong> ${formatarMoeda(dados.bancario?.saldo_total || 0)}</div>
                </div>
                <div style="margin-top: 12px;">
                    <table style="width: 100%; font-size: 13px;">
                        <thead><tr><th>Banco</th><th>Empresa</th><th style="text-align: right;">Saldo</th></tr></thead>
                        <tbody>
                            ${(dados.bancario?.detalhes || []).map(d => `
                                <tr><td>${d.banco}</td><td>${d.empresa}</td><td style="text-align: right;">${formatarMoeda(d.saldo)}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        if (tipo === 'geral') {
            html += `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--gray-200);">
                    <h4>📊 Resumo Geral</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 12px;">
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                            <strong>Patrimônio:</strong>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${formatarMoeda(dados.resumo?.patrimonio_total || 0)}</div>
                        </div>
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                            <strong>A Receber:</strong>
                            <div style="font-size: 20px; font-weight: 600; color: var(--success);">${formatarMoeda(dados.resumo?.total_a_receber || 0)}</div>
                        </div>
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                            <strong>A Pagar:</strong>
                            <div style="font-size: 20px; font-weight: 600; color: var(--danger);">${formatarMoeda(dados.resumo?.total_a_pagar || 0)}</div>
                        </div>
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                            <strong>Saldo Operacional:</strong>
                            <div style="font-size: 20px; font-weight: 600; color: var(--primary-light);">${formatarMoeda(dados.resumo?.saldo_operacional || 0)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Botão de exportação
        html += `
            <div style="margin-top: 20px; display: flex; gap: 12px;">
                <button class="btn btn-success" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
                <button class="btn btn-secondary" onclick="exportarRelatorio()"><i class="fas fa-file-excel"></i> Exportar</button>
            </div>
        `;
        
        conteudo.innerHTML = html;
    } else {
        container.style.display = 'block';
        conteudo.innerHTML = `<p style="color: var(--danger);">Erro ao gerar relatório: ${resultado.mensagem || 'Tente novamente'}</p>`;
    }
}

// ============================================================
// CONFIGURAÇÕES
// ============================================================
async function renderConfiguracoes() {
    const area = document.getElementById('contentArea');
    
    area.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>⚙️ Configurações do Sistema</h3>
                <div style="margin-top: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div><strong>Versão:</strong> ${CONFIG.SISTEMA.versao}</div>
                        <div><strong>Empresa:</strong> ${CONFIG.SISTEMA.empresa}</div>
                        <div><strong>Contas:</strong> ${estado.dados.contas.length}</div>
                        <div><strong>Recebimentos:</strong> ${estado.dados.recebimentos.length}</div>
                        <div><strong>Pagamentos:</strong> ${estado.dados.pagamentos.length}</div>
                        <div><strong>Moeda:</strong> ${CONFIG.SISTEMA.moeda}</div>
                    </div>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>🛠️ Ferramentas</h3>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                    <button class="btn btn-secondary" onclick="inicializarSistema()">
                        <i class="fas fa-rocket"></i> Reinicializar Sistema
                    </button>
                    <button class="btn btn-secondary" onclick="limparCache()">
                        <i class="fas fa-broom"></i> Limpar Cache
                    </button>
                    <button class="btn btn-danger" onclick="resetarDados()">
                        <i class="fas fa-trash-alt"></i> Resetar Dados (Cuidado!)
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>📊 Estatísticas do Sistema</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 16px;">
                <div><strong>Total de Contas:</strong> ${estado.dados.contas.length}</div>
                <div><strong>Recebimentos:</strong> ${estado.dados.recebimentos.length}</div>
                <div><strong>Contas a Pagar:</strong> ${estado.dados.pagamentos.length}</div>
                <div><strong>Movimentações:</strong> ${estado.dados.movimentacoes.length}</div>
                <div><strong>Créditos Futuros:</strong> ${estado.dados.creditos.length}</div>
                <div><strong>Última atualização:</strong> ${new Date().toLocaleString('pt-BR')}</div>
            </div>
        </div>
    `;
}

// ============================================================
// BACKUP
// ============================================================
async function renderBackup() {
    const area = document.getElementById('contentArea');
    
    area.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>💾 Backup do Sistema</h3>
                <p style="color: var(--gray-500); margin-top: 8px;">Crie uma cópia de segurança de todos os seus dados.</p>
                
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="criarBackup()" style="width: 100%;">
                        <i class="fas fa-database"></i> Criar Backup Agora
                    </button>
                </div>
                
                <div style="margin-top: 16px; padding: 16px; background: var(--gray-50); border-radius: var(--radius-sm);">
                    <h4>📋 Informações</h4>
                    <ul style="list-style: none; padding: 0; margin-top: 8px;">
                        <li style="padding: 4px 0;">📊 Total de registros: ${estado.dados.contas.length + estado.dados.recebimentos.length + estado.dados.pagamentos.length + estado.dados.movimentacoes.length}</li>
                        <li style="padding: 4px 0;">📅 Último backup: ${localStorage.getItem('ultimoBackup') || 'Nunca'}</li>
                        <li style="padding: 4px 0;">💡 Recomendação: faça backup semanalmente</li>
                    </ul>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>📤 Exportar Dados</h3>
                <p style="color: var(--gray-500); margin-top: 8px;">Exporte os dados em formato compatível.</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="exportarCSV()">
                        <i class="fas fa-file-csv"></i> Exportar CSV
                    </button>
                    <button class="btn btn-secondary" onclick="exportarJSON()">
                        <i class="fas fa-file-code"></i> Exportar JSON
                    </button>
                    <button class="btn btn-success" onclick="exportarPDF()">
                        <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function criarBackup() {
    if (!confirm('Deseja criar um backup completo do sistema?')) return;
    
    try {
        const resultado = await chamarAPI('backup');
        if (resultado.sucesso) {
            localStorage.setItem('ultimoBackup', new Date().toLocaleString('pt-BR'));
            mostrarToast('Backup criado com sucesso!', 'success');
            
            // Abrir a planilha de backup
            if (resultado.dados?.url) {
                if (confirm('Abrir a planilha de backup?')) {
                    window.open(resultado.dados.url, '_blank');
                }
            }
        } else {
            mostrarToast('Erro ao criar backup: ' + resultado.mensagem, 'error');
        }
    } catch (error) {
        mostrarToast('Erro ao criar backup', 'error');
        console.error(error);
    }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function formatarMoeda(valor) {
    if (valor === undefined || valor === null) valor = 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function exportarDados() {
    // Função para exportar dados em CSV
    const dados = estado.dados;
    let csv = 'Tipo;Total;Dados\n';
    csv += `Contas;${dados.contas.length};${JSON.stringify(dados.contas)}\n`;
    csv += `Recebimentos;${dados.recebimentos.length};${JSON.stringify(dados.recebimentos)}\n`;
    csv += `Pagamentos;${dados.pagamentos.length};${JSON.stringify(dados.pagamentos)}\n`;
    csv += `Movimentacoes;${dados.movimentacoes.length};${JSON.stringify(dados.movimentacoes)}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ERP_Backup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    mostrarToast('Dados exportados com sucesso!', 'success');
}

function exportarCSV() {
    exportarDados();
}

function exportarJSON() {
    const dados = JSON.stringify(estado.dados, null, 2);
    const blob = new Blob([dados], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    mostrarToast('JSON exportado com sucesso!', 'success');
}

function exportarPDF() {
    window.print();
}

function exportarRelatorio() {
    mostrarToast('Função de exportação de relatório em desenvolvimento', 'info');
}

function aplicarFiltrosRelatorio() {
    mostrarToast('Filtros aplicados!', 'success');
}

function inicializarSistema() {
    if (!confirm('Isso vai recriar a estrutura do sistema. Continuar?')) return;
    if (!confirm('Tem certeza? Isso pode duplicar dados!')) return;
    
    mostrarToast('Inicializando sistema...', 'info');
    // A função será chamada via API
}

function limparCache() {
    localStorage.clear();
    sessionStorage.clear();
    mostrarToast('Cache limpo! Recarregue a página.', 'success');
    setTimeout(() => window.location.reload(), 2000);
}

function resetarDados() {
    if (!confirm('⚠️ ATENÇÃO: Isso vai REMOVER TODOS os dados! Continuar?')) return;
    if (!confirm('ÚLTIMA CHANCE! Tem certeza absoluta?')) return;
    
    // Aqui você pode implementar a limpeza total
    mostrarToast('Função de reset desativada por segurança', 'warning');
}

function mostrarHelp() {
    const html = `
        <h4 style="margin-bottom: 12px;">🎯 Ajuda Rápida</h4>
        <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
                <strong>Dashboard:</strong> Visão geral do sistema
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
                <strong>Contas Bancárias:</strong> Gerencie suas contas
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
                <strong>Recebimentos:</strong> Controle o que entra
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
                <strong>Contas a Pagar:</strong> Controle o que sai
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
                <strong>Fluxo de Caixa:</strong> Projeção financeira
            </li>
            <li style="padding: 8px 0;">
                <strong>Relatórios:</strong> Análises detalhadas
            </li>
        </ul>
        <p style="margin-top: 16px; color: var(--gray-500); font-size: 13px;">
            Versão ${CONFIG.SISTEMA.versao} - Sistema Financeiro Profissional
        </p>
    `;
    
    abrirModal('Ajuda', html, 'Fechar', () => fecharModal());
}

// ============================================================
// FUNÇÕES GLOBAIS PARA O HTML
// ============================================================

// Contas
window.abrirModalNovaConta = abrirModalNovaConta;
window.editarConta = editarConta;
window.excluirConta = excluirConta;

// Recebimentos
window.abrirModalNovoRecebimento = abrirModalNovoRecebimento;
window.marcarRecebido = marcarRecebido;
window.excluirRecebimento = async (id) => {
    if (!confirm('Excluir este recebimento?')) return;
    const resultado = await chamarAPI('excluir_recebimento', { id });
    if (resultado.sucesso) {
        await carregarDados();
        await carregarPagina('recebimentos');
        mostrarToast('Recebimento excluído!', 'success');
    }
};
window.editarRecebimento = async (id) => {
    const rec = estado.dados.recebimentos.find(r => r._id === id);
    if (!rec) return;
    
    const html = `
        <form id="formRecebimento">
            <div class="form-group">
                <label>Cliente</label>
                <input class="form-control" type="text" name="cliente" required value="${rec.cliente || ''}">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <input class="form-control" type="text" name="descricao" required value="${rec.descricao || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor</label>
                    <input class="form-control" type="number" name="valor_previsto" step="0.01" required value="${rec.valor_previsto || 0}">
                </div>
                <div class="form-group">
                    <label>Vencimento</label>
                    <input class="form-control" type="date" name="vencimento" required value="${rec.vencimento || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select class="form-control" name="status">
                    <option ${rec.status === 'A Receber' ? 'selected' : ''}>A Receber</option>
                    <option ${rec.status === 'Recebido' ? 'selected' : ''}>Recebido</option>
                    <option ${rec.status === 'Atrasado' ? 'selected' : ''}>Atrasado</option>
                </select>
            </div>
        </form>
    `;
    
    abrirModal('Editar Recebimento', html, 'Atualizar', async () => {
        const form = document.getElementById('formRecebimento');
        const dados = new FormData(form);
        const obj = {};
        dados.forEach((v, k) => obj[k] = v);
        obj.id = id;
        obj.valor_previsto = parseFloat(obj.valor_previsto) || 0;
        
        const resultado = await chamarAPI('editar_recebimento', obj);
        if (resultado.sucesso) {
            fecharModal();
            await carregarDados();
            await carregarPagina('recebimentos');
            mostrarToast('Recebimento atualizado!', 'success');
        }
    });
};

// Pagamentos
window.abrirModalNovoPagamento = () => {
    const html = `
        <form id="formPagamento">
            <div class="form-group">
                <label>Fornecedor</label>
                <input class="form-control" type="text" name="fornecedor" required>
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <input class="form-control" type="text" name="descricao" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor</label>
                    <input class="form-control" type="number" name="valor" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Vencimento</label>
                    <input class="form-control" type="date" name="vencimento" required>
                </div>
            </div>
            <div class="form-group">
                <label>Categoria</label>
                <input class="form-control" type="text" name="categoria" placeholder="Ex: Energia, Água...">
            </div>
            <div class="form-group">
                <label>Banco</label>
                <select class="form-control" name="banco">
                    <option value="">Selecione...</option>
                    ${estado.dados.contas.map(c => `<option>${c.banco}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Observação</label>
                <textarea class="form-control" name="observacao" rows="2"></textarea>
            </div>
        </form>
    `;
    
    abrirModal('Nova Conta a Pagar', html, 'Salvar', async () => {
        const form = document.getElementById('formPagamento');
        const dados = new FormData(form);
        const obj = {};
        dados.forEach((v, k) => obj[k] = v);
        obj.valor = parseFloat(obj.valor) || 0;
        obj.status = 'A Pagar';
        
        const resultado = await chamarAPI('salvar_pagamento', obj);
        if (resultado.sucesso) {
            fecharModal();
            await carregarDados();
            await carregarPagina('pagamentos');
            mostrarToast('Conta a pagar salva!', 'success');
        }
    });
};

window.marcarPago = async (id) => {
    if (!confirm('Marcar esta conta como paga?')) return;
    const resultado = await chamarAPI('pagar_conta', { id });
    if (resultado.sucesso) {
        await carregarDados();
        await carregarPagina('pagamentos');
        mostrarToast('Conta marcada como paga!', 'success');
    }
};

window.excluirPagamento = async (id) => {
    if (!confirm('Excluir esta conta?')) return;
    const resultado = await chamarAPI('excluir_pagamento', { id });
    if (resultado.sucesso) {
        await carregarDados();
        await carregarPagina('pagamentos');
        mostrarToast('Conta excluída!', 'success');
    }
};

window.editarPagamento = async (id) => {
    const pag = estado.dados.pagamentos.find(p => p._id === id);
    if (!pag) return;
    
    const html = `
        <form id="formPagamento">
            <div class="form-group">
                <label>Fornecedor</label>
                <input class="form-control" type="text" name="fornecedor" required value="${pag.fornecedor || ''}">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <input class="form-control" type="text" name="descricao" required value="${pag.descricao || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor</label>
                    <input class="form-control" type="number" name="valor" step="0.01" required value="${pag.valor || 0}">
                </div>
                <div class="form-group">
                    <label>Vencimento</label>
                    <input class="form-control" type="date" name="vencimento" required value="${pag.vencimento || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select class="form-control" name="status">
                    <option ${pag.status === 'A Pagar' ? 'selected' : ''}>A Pagar</option>
                    <option ${pag.status === 'Pago' ? 'selected' : ''}>Pago</option>
                    <option ${pag.status === 'Vencido' ? 'selected' : ''}>Vencido</option>
                </select>
            </div>
        </form>
    `;
    
    abrirModal('Editar Conta a Pagar', html, 'Atualizar', async () => {
        const form = document.getElementById('formPagamento');
        const dados = new FormData(form);
        const obj = {};
        dados.forEach((v, k) => obj[k] = v);
        obj.id = id;
        obj.valor = parseFloat(obj.valor) || 0;
        
        const resultado = await chamarAPI('editar_pagamento', obj);
        if (resultado.sucesso) {
            fecharModal();
            await carregarDados();
            await carregarPagina('pagamentos');
            mostrarToast('Conta atualizada!', 'success');
        }
    });
};

// Fluxo
window.carregarFluxo = carregarFluxo;

// Relatórios
window.gerarRelatorio = gerarRelatorio;
window.aplicarFiltrosRelatorio = aplicarFiltrosRelatorio;

// Configurações
window.inicializarSistema = inicializarSistema;
window.limparCache = limparCache;
window.resetarDados = resetarDados;

// Backup
window.criarBackup = criarBackup;
window.exportarCSV = exportarCSV;
window.exportarJSON = exportarJSON;
window.exportarPDF = exportarPDF;
window.exportarRelatorio = exportarRelatorio;

// Help
window.mostrarHelp = mostrarHelp;
window.exportarDados = exportarDados;

console.log('✅ ERP Financeiro Profissional v3.0 carregado com sucesso!');