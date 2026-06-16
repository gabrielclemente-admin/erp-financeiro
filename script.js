// ============================================================
// 🚀 ERP FINANCEIRO PROFISSIONAL - SCRIPT COMPLETO
// Versão 3.0 - Sistema Robusto e Escalável
// ============================================================

// ==================== ESTADO GLOBAL ====================
const estado = {
    paginaAtual: 'dashboard',
    contas: [],
    recebimentos: [],
    pagamentos: [],
    movimentacoes: [],
    creditos: [],
    graficos: {},
    editando: null,
    tema: 'claro'
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ERP Financeiro Profissional v3.0');
    configurarData();
    configurarMenu();
    configurarModal();
    configurarMenuToggle();
    carregarTema();
    carregarSistema();
});

// ==================== CONFIGURAÇÕES INICIAIS ====================
function configurarData() {
    const hoje = new Date();
    document.getElementById('currentDate').textContent = 
        hoje.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function configurarMenuToggle() {
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

function configurarModal() {
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
}

function configurarMenu() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const pagina = this.dataset.page;
            if (!pagina) return;
            
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const titulos = {
                dashboard: 'Dashboard <small>Visão geral do sistema</small>',
                contas: 'Contas Bancárias <small>Gerencie suas contas</small>',
                recebimentos: 'Recebimentos <small>Controle de receitas</small>',
                pagamentos: 'Contas a Pagar <small>Gerencie despesas</small>',
                fluxo: 'Fluxo de Caixa <small>Projeção financeira</small>',
                creditos: 'Créditos D+1 <small>Créditos futuros</small>',
                relatorios: 'Relatórios <small>Análises e métricas</small>',
                configuracoes: 'Configurações <small>Personalize o sistema</small>',
                backup: 'Backup <small>Proteja seus dados</small>'
            };
            document.getElementById('pageTitle').innerHTML = titulos[pagina] || pagina;
            
            carregarPagina(pagina);
        });
    });
}

// ==================== TEMA (CLARO/ESCURO) ====================
function carregarTema() {
    const tema = localStorage.getItem('tema') || 'claro';
    estado.tema = tema;
    aplicarTema(tema);
}

function aplicarTema(tema) {
    if (tema === 'escuro') {
        document.documentElement.style.setProperty('--gray-50', '#1A2420');
        document.documentElement.style.setProperty('--gray-100', '#2D3A35');
        document.documentElement.style.setProperty('--gray-200', '#4D5C56');
        document.documentElement.style.setProperty('--white', '#2D3A35');
        document.documentElement.style.setProperty('--gray-800', '#F0F2F1');
        document.documentElement.style.setProperty('--gray-700', '#E4E7E6');
        document.documentElement.style.setProperty('--gray-600', '#CDD2D0');
        document.querySelector('.topbar').style.background = 'rgba(26, 36, 32, 0.92)';
        document.querySelector('.topbar').style.borderBottomColor = '#2D3A35';
        document.querySelector('#menuToggle').style.color = '#E4E7E6';
        document.querySelector('.topbar-btn').style.background = '#2D3A35';
        document.querySelector('.topbar-btn').style.color = '#CDD2D0';
    } else {
        document.documentElement.style.setProperty('--gray-50', '#F8FAF9');
        document.documentElement.style.setProperty('--gray-100', '#F0F2F1');
        document.documentElement.style.setProperty('--gray-200', '#E4E7E6');
        document.documentElement.style.setProperty('--white', '#FFFFFF');
        document.documentElement.style.setProperty('--gray-800', '#2D3A35');
        document.documentElement.style.setProperty('--gray-700', '#4D5C56');
        document.documentElement.style.setProperty('--gray-600', '#6C7A75');
        document.querySelector('.topbar').style.background = 'rgba(255,255,255,0.92)';
        document.querySelector('.topbar').style.borderBottomColor = '#E4E7E6';
        document.querySelector('#menuToggle').style.color = '#4D5C56';
        document.querySelector('.topbar-btn').style.background = '#F0F2F1';
        document.querySelector('.topbar-btn').style.color = '#6C7A75';
    }
    localStorage.setItem('tema', tema);
}

function alternarTema() {
    const novoTema = estado.tema === 'claro' ? 'escuro' : 'claro';
    estado.tema = novoTema;
    aplicarTema(novoTema);
}

// ==================== API ====================
async function chamarAPI(acao, dados = {}) {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao, ...dados })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        return { sucesso: false, erro: error.message };
    }
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
    }, 4000);
}

// ==================== MODAL ====================
function abrirModal(titulo, bodyHTML, submitText = 'Salvar', onSubmit = null) {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalSubmit').textContent = submitText;
    
    document.getElementById('modal').classList.add('active');
    
    const submitBtn = document.getElementById('modalSubmit');
    submitBtn.onclick = null;
    if (onSubmit) {
        submitBtn.onclick = async function() {
            await onSubmit();
        };
    }
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
    estado.editando = null;
}

// ==================== CARREGAR SISTEMA ====================
async function carregarSistema() {
    mostrarLoading('Inicializando sistema...');
    
    await Promise.all([
        carregarContas(),
        carregarRecebimentos(),
        carregarPagamentos(),
        carregarMovimentacoes(),
        carregarCreditos()
    ]);
    
    await carregarPagina('dashboard');
    atualizarBadges();
    mostrarToast('Sistema carregado com sucesso!', 'success');
}

function mostrarLoading(mensagem = 'Carregando...') {
    document.getElementById('content').innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">${mensagem}</div>
        </div>
    `;
}

// ==================== CARREGAR DADOS ====================
async function carregarContas() {
    const resultado = await chamarAPI('listar_contas');
    estado.contas = resultado.sucesso ? resultado.dados : [];
}

async function carregarRecebimentos() {
    const resultado = await chamarAPI('listar_recebimentos');
    estado.recebimentos = resultado.sucesso ? resultado.dados : [];
}

async function carregarPagamentos() {
    const resultado = await chamarAPI('listar_pagamentos');
    estado.pagamentos = resultado.sucesso ? resultado.dados : [];
}

async function carregarMovimentacoes() {
    // Placeholder - implementar depois
    estado.movimentacoes = [];
}

async function carregarCreditos() {
    // Placeholder - implementar depois
    estado.creditos = [];
}

function recarregar() {
    mostrarToast('Recarregando dados...', 'info');
    carregarSistema();
}

function atualizarBadges() {
    document.getElementById('badgeContas').textContent = estado.contas.length;
    document.getElementById('badgeRecebimentos').textContent = 
        estado.recebimentos.filter(r => r.status === 'A Receber').length;
    document.getElementById('badgePagamentos').textContent = 
        estado.pagamentos.filter(p => p.status === 'A Pagar').length;
}

// ==================== NAVEGAÇÃO ====================
async function carregarPagina(pagina) {
    estado.paginaAtual = pagina;
    mostrarLoading('Carregando...');
    
    switch(pagina) {
        case 'dashboard': await renderDashboard(); break;
        case 'contas': await renderContas(); break;
        case 'recebimentos': await renderRecebimentos(); break;
        case 'pagamentos': await renderPagamentos(); break;
        case 'fluxo': await renderFluxoCaixa(); break;
        case 'creditos': await renderCreditos(); break;
        case 'relatorios': await renderRelatorios(); break;
        case 'configuracoes': await renderConfiguracoes(); break;
        case 'backup': await renderBackup(); break;
        default: document.getElementById('content').innerHTML = '<div class="card"><p>Página não encontrada</p></div>';
    }
}

// ============================================================
// DASHBOARD
// ============================================================
async function renderDashboard() {
    const content = document.getElementById('content');
    
    try {
        const resultado = await chamarAPI('dashboard');
        const dados = resultado.sucesso ? resultado.dados : { patrimonio_financeiro: 0, quantidade_contas: 0 };
        
        const total = dados.patrimonio_financeiro || 0;
        const aReceber = estado.recebimentos.filter(r => r.status === 'A Receber').reduce((s, r) => s + (parseFloat(r.valor_previsto) || 0), 0);
        const aPagar = estado.pagamentos.filter(p => p.status === 'A Pagar').reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
        const disponivel = total - aPagar;
        const projetado = total + aReceber - aPagar;
        
        content.innerHTML = `
            <!-- Cards -->
            <div class="dashboard-grid">
                ${criarCard('Patrimônio Total', formatarMoeda(total), 'fa-chart-pie', '#1B4F3B')}
                ${criarCard('Disponível Real', formatarMoeda(disponivel), 'fa-hand-holding-usd', '#2E7D64')}
                ${criarCard('A Receber', formatarMoeda(aReceber), 'fa-arrow-down', '#22C55E')}
                ${criarCard('A Pagar', formatarMoeda(aPagar), 'fa-arrow-up', '#EF4444')}
                ${criarCard('Saldo Projetado', formatarMoeda(projetado), 'fa-chart-line', '#8B5CF6')}
                ${criarCard('Contas Ativas', dados.quantidade_contas || 0, 'fa-university', '#6B7280')}
            </div>
            
            <!-- Gráficos -->
            <div class="charts-grid">
                <div class="chart-card">
                    <h3><i class="fas fa-chart-pie" style="color:var(--primary-light);"></i> Distribuição por Banco</h3>
                    <div class="chart-container"><canvas id="chartBancos"></canvas></div>
                </div>
                <div class="chart-card">
                    <h3><i class="fas fa-chart-bar" style="color:var(--primary-light);"></i> Saldo por Empresa</h3>
                    <div class="chart-container"><canvas id="chartEmpresas"></canvas></div>
                </div>
                <div class="chart-card" style="grid-column: 1 / -1;">
                    <h3><i class="fas fa-chart-line" style="color:var(--primary-light);"></i> Evolução do Patrimônio</h3>
                    <div class="chart-container" style="height:220px;"><canvas id="chartEvolucao"></canvas></div>
                </div>
            </div>
            
            <!-- Últimas Movimentações -->
            <div class="table-container">
                <div class="table-header">
                    <h3>📋 Últimas Movimentações</h3>
                    <span style="color:var(--gray-500);font-size:13px;">${estado.contas.length} contas ativas</span>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Banco</th><th>Empresa</th><th style="text-align:right;">Saldo</th><th>Atualizado</th></tr></thead>
                        <tbody>
                            ${estado.contas.slice(0, 5).map(c => `
                                <tr>
                                    <td><strong>${c.banco || '-'}</strong></td>
                                    <td>${c.empresa || '-'}</td>
                                    <td style="text-align:right;font-weight:600;color:${parseFloat(c.saldo_atual) >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatarMoeda(c.saldo_atual)}</td>
                                    <td style="font-size:12px;color:var(--gray-500);">${c.data_atualizacao ? new Date(c.data_atualizacao).toLocaleDateString('pt-BR') : '-'}</td>
                                </tr>
                            `).join('')}
                            ${estado.contas.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--gray-500);padding:24px;">Nenhuma conta cadastrada</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Renderizar gráficos
        setTimeout(() => renderizarGraficosDashboard(dados), 200);
        
    } catch (error) {
        content.innerHTML = `
            <div class="card" style="padding:40px;text-align:center;">
                <i class="fas fa-exclamation-triangle" style="font-size:40px;color:var(--warning);"></i>
                <h3 style="margin-top:16px;">Erro ao carregar dashboard</h3>
                <p style="color:var(--gray-500);">${error.message}</p>
                <button class="btn btn-primary" style="margin-top:16px;" onclick="recarregar()">Tentar novamente</button>
            </div>
        `;
    }
}

function criarCard(label, valor, icone, cor) {
    return `
        <div class="card">
            <div class="card-header">
                <span class="card-label">${label}</span>
                <i class="fas ${icone}" style="color:${cor};opacity:0.7;"></i>
            </div>
            <div class="card-value">${valor}</div>
        </div>
    `;
}

function renderizarGraficosDashboard(dados) {
    // Gráfico por Banco
    const ctx1 = document.getElementById('chartBancos');
    if (ctx1 && dados.saldo_por_banco) {
        const labels = Object.keys(dados.saldo_por_banco);
        const values = Object.values(dados.saldo_por_banco);
        
        if (estado.graficos.bancos) estado.graficos.bancos.destroy();
        
        estado.graficos.bancos = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: CONFIG.CORES.primarias.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } }
                },
                cutout: '65%'
            }
        });
    }
    
    // Gráfico por Empresa
    const ctx2 = document.getElementById('chartEmpresas');
    if (ctx2 && dados.saldo_por_empresa) {
        const entries = Object.entries(dados.saldo_por_empresa).sort((a,b) => b[1] - a[1]).slice(0, 8);
        
        if (estado.graficos.empresas) estado.graficos.empresas.destroy();
        
        estado.graficos.empresas = new Chart(ctx2, {
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
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v.toFixed(0) } }
                }
            }
        });
    }
    
    // Gráfico de Evolução
    const ctx3 = document.getElementById('chartEvolucao');
    if (ctx3 && dados.evolucao) {
        if (estado.graficos.evolucao) estado.graficos.evolucao.destroy();
        
        estado.graficos.evolucao = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Patrimônio',
                    data: [8000000, 8500000, 9000000, 9500000, 10000000, 10500000, 10877806],
                    borderColor: '#2E7D64',
                    backgroundColor: 'rgba(46,125,100,0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + (v/1000000).toFixed(1) + 'M' } }
                }
            }
        });
    }
}

// ============================================================
// CONTAS BANCÁRIAS (CRUD Completo)
// ============================================================
async function renderContas() {
    const content = document.getElementById('content');
    const total = estado.contas.reduce((s, c) => s + (parseFloat(c.saldo_atual) || 0), 0);
    
    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
            <div>
                <h3 style="font-weight:600;">Total Consolidado: ${formatarMoeda(total)}</h3>
                <p style="color:var(--gray-500);font-size:13px;">${estado.contas.length} contas ativas</p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="abrirModalNovaConta()"><i class="fas fa-plus"></i> Nova Conta</button>
                <button class="btn btn-secondary" onclick="recarregar()"><i class="fas fa-sync-alt"></i></button>
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
                            <th style="text-align:right;">Saldo</th>
                            <th style="text-align:center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estado.contas.length === 0 ? `
                            <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500);">
                                <i class="fas fa-university" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                                Nenhuma conta cadastrada
                            </td></tr>
                        ` : estado.contas.map(c => `
                            <tr>
                                <td><strong>${c.banco || '-'}</strong></td>
                                <td>${c.empresa || '-'}</td>
                                <td>${c.agencia || '-'}</td>
                                <td>${c.conta || '-'}</td>
                                <td style="text-align:right;font-weight:600;color:${parseFloat(c.saldo_atual) >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatarMoeda(c.saldo_atual)}</td>
                                <td style="text-align:center;">
                                    <button class="btn btn-sm btn-secondary" onclick="editarConta(${c._id})" title="Editar"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-danger" onclick="excluirConta(${c._id})" title="Excluir"><i class="fas fa-trash"></i></button>
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
            await carregarContas();
            await renderContas();
            atualizarBadges();
            mostrarToast('Conta salva com sucesso!', 'success');
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'error');
        }
    });
}

async function editarConta(id) {
    const conta = estado.contas.find(c => c._id === id);
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
            await carregarContas();
            await renderContas();
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
        await carregarContas();
        await renderContas();
        atualizarBadges();
        mostrarToast('Conta excluída!', 'success');
    } else {
        mostrarToast('Erro ao excluir', 'error');
    }
}

// ============================================================
// RECEBIMENTOS (CRUD Completo)
// ============================================================
async function renderRecebimentos() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button class="btn btn-primary" onclick="abrirModalNovoRecebimento()"><i class="fas fa-plus"></i> Novo Recebimento</button>
        </div>
        
        <div class="table-container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Descrição</th>
                            <th style="text-align:right;">Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th style="text-align:center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estado.recebimentos.length === 0 ? `
                            <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500);">
                                <i class="fas fa-arrow-down" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                                Nenhum recebimento cadastrado
                            </td></tr>
                        ` : estado.recebimentos.map(r => `
                            <tr>
                                <td><strong>${r.cliente || '-'}</strong></td>
                                <td>${r.descricao || '-'}</td>
                                <td style="text-align:right;font-weight:600;">${formatarMoeda(r.valor_previsto)}</td>
                                <td>${r.vencimento || '-'}</td>
                                <td><span class="badge-status badge-${r.status === 'Recebido' ? 'received' : r.status === 'Atrasado' ? 'overdue' : 'pending'}">${r.status || 'A Receber'}</span></td>
                                <td style="text-align:center;">
                                    ${r.status !== 'Recebido' ? `<button class="btn btn-sm btn-success" onclick="marcarRecebido(${r._id})" title="Receber"><i class="fas fa-check"></i></button>` : ''}
                                    <button class="btn btn-sm btn-secondary" onclick="editarRecebimento(${r._id})" title="Editar"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-danger" onclick="excluirRecebimento(${r._id})" title="Excluir"><i class="fas fa-trash"></i></button>
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
                    ${estado.contas.map(c => `<option>${c.banco} - ${c.empresa}</option>`).join('')}
                </select>
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
            await carregarRecebimentos();
            await renderRecebimentos();
            atualizarBadges();
            mostrarToast('Recebimento salvo!', 'success');
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'error');
        }
    });
}

async function editarRecebimento(id) {
    const rec = estado.recebimentos.find(r => r._id === id);
    if (!rec) return;
    
    const html = `
        <form id="formRecebimento">
            <div class="form-group">
                <label>Cliente <span class="required">*</span></label>
                <input class="form-control" type="text" name="cliente" required value="${rec.cliente || ''}">
            </div>
            <div class="form-group">
                <label>Descrição <span class="required">*</span></label>
                <input class="form-control" type="text" name="descricao" required value="${rec.descricao || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor <span class="required">*</span></label>
                    <input class="form-control" type="number" name="valor_previsto" step="0.01" required value="${rec.valor_previsto || 0}">
                </div>
                <div class="form-group">
                    <label>Vencimento <span class="required">*</span></label>
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
            await carregarRecebimentos();
            await renderRecebimentos();
            mostrarToast('Recebimento atualizado!', 'success');
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'error');
        }
    });
}

async function marcarRecebido(id) {
    if (!confirm('Marcar este recebimento como recebido?')) return;
    
    const resultado = await chamarAPI('receber_valor', { id });
    if (resultado.sucesso) {
        await carregarRecebimentos();
        await renderRecebimentos();
        atualizarBadges();
        mostrarToast('Recebimento marcado como recebido!', 'success');
    } else {
        mostrarToast('Erro: ' + resultado.mensagem, 'error');
    }
}

async function excluirRecebimento(id) {
    if (!confirm('Tem certeza que deseja excluir este recebimento?')) return;
    
    const resultado = await chamarAPI('excluir_recebimento', { id });
    if (resultado.sucesso) {
        await carregarRecebimentos();
        await renderRecebimentos();
        mostrarToast('Recebimento excluído!', 'success');
    } else {
        mostrarToast('Erro ao excluir', 'error');
    }
}

// ============================================================
// CONTAS A PAGAR (CRUD Completo)
// ============================================================
async function renderPagamentos() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button class="btn btn-primary" onclick="abrirModalNovoPagamento()"><i class="fas fa-plus"></i> Nova Conta a Pagar</button>
        </div>
        
        <div class="table-container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Fornecedor</th>
                            <th>Descrição</th>
                            <th style="text-align:right;">Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th style="text-align:center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estado.pagamentos.length === 0 ? `
                            <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500);">
                                <i class="fas fa-arrow-up" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                                Nenhuma conta a pagar
                            </td></tr>
                        ` : estado.pagamentos.map(p => `
                            <tr>
                                <td><strong>${p.fornecedor || '-'}</strong></td>
                                <td>${p.descricao || '-'}</td>
                                <td style="text-align:right;font-weight:600;">${formatarMoeda(p.valor)}</td>
                                <td>${p.vencimento || '-'}</td>
                                <td><span class="badge-status badge-${p.status === 'Pago' ? 'paid' : p.status === 'Vencido' ? 'overdue' : 'pending'}">${p.status || 'A Pagar'}</span></td>
                                <td style="text-align:center;">
                                    ${p.status !== 'Pago' ? `<button class="btn btn-sm btn-success" onclick="marcarPago(${p._id})" title="Pagar"><i class="fas fa-check"></i></button>` : ''}
                                    <button class="btn btn-sm btn-secondary" onclick="editarPagamento(${p._id})" title="Editar"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-danger" onclick="excluirPagamento(${p._id})" title="Excluir"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function abrirModalNovoPagamento() {
    const html = `
        <form id="formPagamento">
            <div class="form-group">
                <label>Fornecedor <span class="required">*</span></label>
                <input class="form-control" type="text" name="fornecedor" required placeholder="Nome do fornecedor">
            </div>
            <div class="form-group">
                <label>Descrição <span class="required">*</span></label>
                <input class="form-control" type="text" name="descricao" required placeholder="Descrição da conta">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor <span class="required">*</span></label>
                    <input class="form-control" type="number" name="valor" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Vencimento <span class="required">*</span></label>
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
                    ${estado.contas.map(c => `<option>${c.banco}</option>`).join('')}
                </select>
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
            await carregarPagamentos();
            await renderPagamentos();
            atualizarBadges();
            mostrarToast('Conta a pagar salva!', 'success');
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'error');
        }
    });
}

async function editarPagamento(id) {
    const pag = estado.pagamentos.find(p => p._id === id);
    if (!pag) return;
    
    const html = `
        <form id="formPagamento">
            <div class="form-group">
                <label>Fornecedor <span class="required">*</span></label>
                <input class="form-control" type="text" name="fornecedor" required value="${pag.fornecedor || ''}">
            </div>
            <div class="form-group">
                <label>Descrição <span class="required">*</span></label>
                <input class="form-control" type="text" name="descricao" required value="${pag.descricao || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor <span class="required">*</span></label>
                    <input class="form-control" type="number" name="valor" step="0.01" required value="${pag.valor || 0}">
                </div>
                <div class="form-group">
                    <label>Vencimento <span class="required">*</span></label>
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
            await carregarPagamentos();
            await renderPagamentos();
            mostrarToast('Conta atualizada!', 'success');
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'error');
        }
    });
}

async function marcarPago(id) {
    if (!confirm('Marcar esta conta como paga?')) return;
    
    const resultado = await chamarAPI('pagar_conta', { id });
    if (resultado.sucesso) {
        await carregarPagamentos();
        await renderPagamentos();
        atualizarBadges();
        mostrarToast('Conta marcada como paga!', 'success');
    } else {
        mostrarToast('Erro: ' + resultado.mensagem, 'error');
    }
}

async function excluirPagamento(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    const resultado = await chamarAPI('excluir_pagamento', { id });
    if (resultado.sucesso) {
        await carregarPagamentos();
        await renderPagamentos();
        mostrarToast('Conta excluída!', 'success');
    } else {
        mostrarToast('Erro ao excluir', 'error');
    }
}

// ============================================================
// FLUXO DE CAIXA
// ============================================================
async function renderFluxoCaixa() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
            <div class="form-group" style="margin:0;">
                <label style="font-size:13px;">Período</label>
                <select class="form-control" id="periodoFluxo" style="width:150px;" onchange="carregarFluxo()">
                    <option value="7">7 dias</option>
                    <option value="30" selected>30 dias</option>
                    <option value="60">60 dias</option>
                    <option value="90">90 dias</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="carregarFluxo()" style="margin-top:18px;"><i class="fas fa-chart-line"></i> Atualizar</button>
        </div>
        
        <div class="chart-card" style="margin-bottom:20px;">
            <h3>📊 Projeção de Fluxo de Caixa</h3>
            <div class="chart-container" style="height:280px;"><canvas id="chartFluxo"></canvas></div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h3>📋 Detalhamento Diário</h3>
                <span style="color:var(--gray-500);font-size:13px;">Projeção baseada em recebimentos e pagamentos</span>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Dia</th>
                            <th style="text-align:right;">Entradas</th>
                            <th style="text-align:right;">Saídas</th>
                            <th style="text-align:right;">Saldo Acumulado</th>
                        </tr>
                    </thead>
                    <tbody id="fluxoBody">
                        <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gray-500);">
                            <i class="fas fa-spinner fa-spin"></i> Carregando...
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
            
            // Tabela
            const tbody = document.getElementById('fluxoBody');
            tbody.innerHTML = dados.map(d => `
                <tr>
                    <td>${d.data_formatada}</td>
                    <td>${d.dia_semana}</td>
                    <td style="text-align:right;color:var(--success);">${d.entradas > 0 ? formatarMoeda(d.entradas) : '-'}</td>
                    <td style="text-align:right;color:var(--danger);">${d.saidas > 0 ? formatarMoeda(d.saidas) : '-'}</td>
                    <td style="text-align:right;font-weight:600;">${formatarMoeda(d.saldo_atual)}</td>
                </tr>
            `).join('');
            
            // Gráfico
            const ctx = document.getElementById('chartFluxo');
            if (ctx) {
                if (estado.graficos.fluxo) estado.graficos.fluxo.destroy();
                
                estado.graficos.fluxo = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dados.map(d => d.data_formatada),
                        datasets: [
                            {
                                label: 'Entradas',
                                data: dados.map(d => d.entradas),
                                borderColor: '#22C55E',
                                backgroundColor: 'rgba(34,197,94,0.1)',
                                fill: true
                            },
                            {
                                label: 'Saídas',
                                data: dados.map(d => d.saidas),
                                borderColor: '#EF4444',
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                fill: true
                            },
                            {
                                label: 'Saldo',
                                data: dados.map(d => d.saldo_atual),
                                borderColor: '#2E7D64',
                                backgroundColor: 'rgba(46,125,100,0.05)',
                                fill: true,
                                borderWidth: 2,
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } },
                        scales: {
                            y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v.toFixed(0) } }
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
// CRÉDITOS D+1
// ============================================================
async function renderCreditos() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
            <div>
                <h3 style="font-weight:600;">Créditos Futuros D+1</h3>
                <p style="color:var(--gray-500);font-size:13px;">Gerencie créditos a receber</p>
            </div>
            <button class="btn btn-primary" onclick="abrirModalNovoCredito()"><i class="fas fa-plus"></i> Novo Crédito</button>
        </div>
        
        <div class="table-container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Conta</th>
                            <th>Empresa</th>
                            <th style="text-align:right;">Valor</th>
                            <th>Data Prevista</th>
                            <th>Status</th>
                            <th style="text-align:center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500);">
                            <i class="fas fa-calendar-alt" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                            Nenhum crédito cadastrado
                            <br><small style="font-size:12px;">Adicione seu primeiro crédito D+1</small>
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function abrirModalNovoCredito() {
    mostrarToast('Módulo de créditos em desenvolvimento', 'info');
}

// ============================================================
// RELATÓRIOS
// ============================================================
async function renderRelatorios() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>📊 Relatórios Financeiros</h3>
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
                    <button class="btn btn-primary" onclick="gerarRelatorio('movimentacoes')"><i class="fas fa-exchange-alt"></i> Movimentações</button>
                    <button class="btn btn-primary" onclick="gerarRelatorio('recebimentos')"><i class="fas fa-arrow-down"></i> Recebimentos</button>
                    <button class="btn btn-primary" onclick="gerarRelatorio('pagamentos')"><i class="fas fa-arrow-up"></i> Pagamentos</button>
                    <button class="btn btn-primary" onclick="gerarRelatorio('bancario')"><i class="fas fa-university"></i> Posição Bancária</button>
                    <button class="btn btn-success" onclick="gerarRelatorio('geral')"><i class="fas fa-file-pdf"></i> Relatório Geral</button>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>⚙️ Filtros</h3>
                <div style="margin-top:12px;">
                    <div class="form-group">
                        <label>Período</label>
                        <select class="form-control" id="filtroPeriodo">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30" selected>Últimos 30 dias</option>
                            <option value="60">Últimos 60 dias</option>
                            <option value="90">Últimos 90 dias</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Empresa</label>
                        <select class="form-control" id="filtroEmpresa">
                            <option value="">Todas</option>
                            ${[...new Set(estado.contas.map(c => c.empresa))].filter(Boolean).map(e => `<option>${e}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card" id="resultadoRelatorio" style="display:none;margin-top:20px;">
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
        
        let html = `<h3>📄 Relatório: ${tipo.toUpperCase()}</h3>`;
        
        html += `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:16px 0;">
                <div style="background:var(--gray-50);padding:16px;border-radius:8px;">
                    <strong>Total Registros</strong>
                    <div style="font-size:20px;font-weight:700;color:var(--primary);">${dados.total_registros || 0}</div>
                </div>
                <div style="background:var(--gray-50);padding:16px;border-radius:8px;">
                    <strong style="color:var(--success);">Entradas</strong>
                    <div style="font-size:20px;font-weight:700;color:var(--success);">${formatarMoeda(dados.resumo?.total_entradas || 0)}</div>
                </div>
                <div style="background:var(--gray-50);padding:16px;border-radius:8px;">
                    <strong style="color:var(--danger);">Saídas</strong>
                    <div style="font-size:20px;font-weight:700;color:var(--danger);">${formatarMoeda(dados.resumo?.total_saidas || 0)}</div>
                </div>
                <div style="background:var(--gray-50);padding:16px;border-radius:8px;">
                    <strong>Saldo</strong>
                    <div style="font-size:20px;font-weight:700;color:var(--primary-light);">${formatarMoeda(dados.resumo?.saldo || 0)}</div>
                </div>
            </div>
            <div style="display:flex;gap:12px;margin-top:12px;">
                <button class="btn btn-success" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
                <button class="btn btn-secondary" onclick="exportarCSV()"><i class="fas fa-file-excel"></i> Exportar CSV</button>
            </div>
        `;
        
        conteudo.innerHTML = html;
        mostrarToast('Relatório gerado com sucesso!', 'success');
    } else {
        container.style.display = 'block';
        conteudo.innerHTML = `<p style="color:var(--danger);">Erro ao gerar relatório</p>`;
    }
}

// ============================================================
// CONFIGURAÇÕES
// ============================================================
async function renderConfiguracoes() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>⚙️ Configurações do Sistema</h3>
                <div style="margin-top:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div><strong>Versão:</strong> ${CONFIG.SISTEMA.versao}</div>
                        <div><strong>Empresa:</strong> ${CONFIG.SISTEMA.empresa}</div>
                        <div><strong>Contas:</strong> ${estado.contas.length}</div>
                        <div><strong>Recebimentos:</strong> ${estado.recebimentos.length}</div>
                        <div><strong>Pagamentos:</strong> ${estado.pagamentos.length}</div>
                        <div><strong>Moeda:</strong> ${CONFIG.SISTEMA.moeda}</div>
                    </div>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>🛠️ Ferramentas</h3>
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
                    <button class="btn btn-secondary" onclick="recarregar()"><i class="fas fa-sync-alt"></i> Recarregar Dados</button>
                    <button class="btn btn-secondary" onclick="alternarTema()"><i class="fas fa-moon"></i> Alternar Tema</button>
                    <button class="btn btn-danger" onclick="resetarDados()"><i class="fas fa-trash-alt"></i> Resetar Dados (Cuidado!)</button>
                </div>
            </div>
        </div>
        
        <div class="card" style="margin-top:20px;">
            <h3>📊 Estatísticas do Sistema</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:12px;">
                <div><strong>Total de Contas:</strong> ${estado.contas.length}</div>
                <div><strong>Recebimentos:</strong> ${estado.recebimentos.length}</div>
                <div><strong>Contas a Pagar:</strong> ${estado.pagamentos.length}</div>
                <div><strong>Última atualização:</strong> ${new Date().toLocaleString('pt-BR')}</div>
            </div>
        </div>
    `;
}

// ============================================================
// BACKUP
// ============================================================
async function renderBackup() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>💾 Backup do Sistema</h3>
                <p style="color:var(--gray-500);margin-top:6px;">Crie uma cópia de segurança de todos os seus dados.</p>
                
                <button class="btn btn-primary" onclick="criarBackup()" style="width:100%;margin-top:16px;">
                    <i class="fas fa-database"></i> Criar Backup Agora
                </button>
                
                <div style="margin-top:16px;padding:16px;background:var(--gray-50);border-radius:var(--radius-sm);">
                    <h4>📋 Informações</h4>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        <li style="padding:4px 0;">📊 Total de registros: ${estado.contas.length + estado.recebimentos.length + estado.pagamentos.length}</li>
                        <li style="padding:4px 0;">📅 Último backup: ${localStorage.getItem('ultimoBackup') || 'Nunca'}</li>
                        <li style="padding:4px 0;">💡 Recomendação: faça backup semanalmente</li>
                    </ul>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>📤 Exportar Dados</h3>
                <p style="color:var(--gray-500);margin-top:6px;">Exporte os dados em formato compatível.</p>
                
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
                    <button class="btn btn-secondary" onclick="exportarCSV()"><i class="fas fa-file-csv"></i> Exportar CSV</button>
                    <button class="btn btn-secondary" onclick="exportarJSON()"><i class="fas fa-file-code"></i> Exportar JSON</button>
                    <button class="btn btn-success" onclick="window.print()"><i class="fas fa-file-pdf"></i> Imprimir</button>
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
        } else {
            mostrarToast('Erro ao criar backup', 'error');
        }
    } catch (error) {
        mostrarToast('Erro ao criar backup', 'error');
    }
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function formatarMoeda(valor) {
    if (valor === undefined || valor === null) valor = 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function exportarCSV() {
    const dados = estado.contas.map(c => `${c.banco};${c.empresa};${c.saldo_atual}`).join('\n');
    const csv = 'Banco;Empresa;Saldo\n' + dados;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ERP_Backup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    mostrarToast('CSV exportado!', 'success');
}

function exportarJSON() {
    const json = JSON.stringify(estado, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    mostrarToast('JSON exportado!', 'success');
}

function resetarDados() {
    if (!confirm('⚠️ ATENÇÃO: Isso vai REMOVER TODOS os dados do sistema! Continuar?')) return;
    if (!confirm('ÚLTIMA CHANCE! Tem certeza absoluta?')) return;
    
    localStorage.clear();
    mostrarToast('Dados resetados! Recarregue a página.', 'warning');
    setTimeout(() => window.location.reload(), 2000);
}

// ============================================================
// EXPORTAR FUNÇÕES PARA O GLOBAL
// ============================================================
window.abrirModalNovaConta = abrirModalNovaConta;
window.editarConta = editarConta;
window.excluirConta = excluirConta;
window.abrirModalNovoRecebimento = abrirModalNovoRecebimento;
window.editarRecebimento = editarRecebimento;
window.excluirRecebimento = excluirRecebimento;
window.marcarRecebido = marcarRecebido;
window.abrirModalNovoPagamento = abrirModalNovoPagamento;
window.editarPagamento = editarPagamento;
window.excluirPagamento = excluirPagamento;
window.marcarPago = marcarPago;
window.carregarFluxo = carregarFluxo;
window.gerarRelatorio = gerarRelatorio;
window.alternarTema = alternarTema;
window.recarregar = recarregar;
window.fecharModal = fecharModal;
window.exportarCSV = exportarCSV;
window.exportarJSON = exportarJSON;
window.criarBackup = criarBackup;
window.resetarDados = resetarDados;

console.log('✅ ERP Financeiro Profissional v3.0 carregado!');