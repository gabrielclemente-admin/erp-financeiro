// ============================================================
// CONFIGURAÇÕES DO ERP FINANCEIRO PROFISSIONAL
// ============================================================

const CONFIG = {
    // 🔑 COLE A URL DO SEU APPS SCRIPT AQUI
    API_URL: "https://script.google.com/macros/s/AKfycbwLflM-c02wN2lBcNA9PadiKSLV3tXcUWwq5MMRvFefUMX8XReDChNkXcsWtcPDGJE/exec",
    
    // Configurações do sistema
    SISTEMA: {
        nome: "ERP Financeiro Profissional",
        versao: "3.0",
        empresa: "Minha Empresa",
        moeda: "BRL",
        locale: "pt-BR"
    },
    
    // Cores dos gráficos
    CORES: {
        primary: '#2E7D64',
        secondary: '#4CAF93',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        grafico: ['#2E7D64', '#4CAF93', '#1B4F3B', '#6C7A75', '#22C55E', '#F59E0B']
    },
    
    // Status possíveis
    STATUS: {
        recebimento: ['A Receber', 'Recebido', 'Atrasado'],
        pagamento: ['A Pagar', 'Pago', 'Vencido']
    }
};
