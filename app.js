// Global State - In-Memory Data Storage
let state = {
  usuarios: [
    { user: 'admin', senha: 'admin123' },
    { user: 'operador', senha: 'operador123' },
    { user: 'gerente', senha: 'gerente123' }
  ],
  currentUser: null,
  clientes: [],
  paineis: [
    { id: 1, nome: 'America', status: 'ativo' },
    { id: 2, nome: 'UNIPLAY', status: 'ativo' },
    { id: 3, nome: 'P2CINE', status: 'ativo' },
    { id: 4, nome: '2Live 21', status: 'ativo' },
    { id: 5, nome: 'ANDS', status: 'ativo' },
    { id: 6, nome: 'BRPRO', status: 'ativo' }
  ],
  planos: [
    { id: 1, nome: 'Plano Basic', preco: 20 },
    { id: 2, nome: 'Plano Plus', preco: 25 },
    { id: 3, nome: 'Plano Premium', preco: 30 }
  ],
  assinaturas: [],
  pagamentos: [],
  nextClienteId: 1,
  nextAssinaturaId: 1,
  nextPagamentoId: 1
};

// Charts instances
let charts = {};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  initializeSampleData();
  setupEventListeners();
  checkLoginStatus();
});

// Check Login Status
function checkLoginStatus() {
  if (state.currentUser) {
    showMainApp();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  document.getElementById('currentUser').textContent = 'Usuário: ' + state.currentUser;
  updateCurrentDate();
  renderDashboard();
  renderClientes();
  renderAssinaturas();
  renderPaineis();
  renderRelatorios();
}

// Sample Data Generator
function initializeSampleData() {
  // Sample Clients
  const sampleClientes = [
    { nome: 'João Silva', email: 'joao.silva@email.com', telefone: '(11) 98765-4321', cpf: '123.456.789-00', endereco: 'Rua A, 123', status: 'ativo' },
    { nome: 'Maria Santos', email: 'maria.santos@email.com', telefone: '(21) 99876-5432', cpf: '987.654.321-00', endereco: 'Av. B, 456', status: 'ativo' },
    { nome: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', telefone: '(31) 98765-1234', cpf: '456.789.123-00', endereco: 'Rua C, 789', status: 'ativo' },
    { nome: 'Ana Costa', email: 'ana.costa@email.com', telefone: '(41) 97654-3210', cpf: '321.654.987-00', endereco: 'Av. D, 321', status: 'ativo' },
    { nome: 'Carlos Souza', email: 'carlos.souza@email.com', telefone: '(51) 96543-2109', cpf: '654.321.987-00', endereco: 'Rua E, 654', status: 'inativo' }
  ];

  sampleClientes.forEach(cliente => {
    addCliente(cliente, false);
  });

  // Sample Subscriptions
  const today = new Date();
  const subscriptions = [
    { clienteId: 1, painelId: 1, planoId: 3, diasInicio: -30, diasVencimento: 0, status: 'pago' },
    { clienteId: 2, painelId: 2, planoId: 2, diasInicio: -25, diasVencimento: 5, status: 'pago' },
    { clienteId: 3, painelId: 3, planoId: 1, diasInicio: -20, diasVencimento: 10, status: 'pendente' },
    { clienteId: 4, painelId: 1, planoId: 3, diasInicio: -15, diasVencimento: 15, status: 'pago' },
    { clienteId: 1, painelId: 4, planoId: 2, diasInicio: -10, diasVencimento: 20, status: 'pendente' },
    { clienteId: 2, painelId: 5, planoId: 1, diasInicio: -60, diasVencimento: -5, status: 'atrasado' }
  ];

  subscriptions.forEach(sub => {
    const dataInicio = new Date(today);
    dataInicio.setDate(dataInicio.getDate() + sub.diasInicio);
    const dataVencimento = new Date(today);
    dataVencimento.setDate(dataVencimento.getDate() + sub.diasVencimento);

    addAssinatura({
      cliente_id: sub.clienteId,
      painel_id: sub.painelId,
      plano_id: sub.planoId,
      data_inicio: formatDateInput(dataInicio),
      data_vencimento: formatDateInput(dataVencimento),
      status_pagamento: sub.status
    }, false);
  });
}

// Event Listeners
function setupEventListeners() {
  // Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // Report Tabs
  document.querySelectorAll('.report-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      switchReportTab(this.dataset.report);
    });
  });

  // Search and Filter
  document.getElementById('searchCliente')?.addEventListener('input', filterClientes);
  document.getElementById('filterStatus')?.addEventListener('change', filterClientes);

  // Select All Checkbox
  document.getElementById('selectAll')?.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.cliente-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
    updateDeleteButton();
  });

  // Form Submissions
  document.getElementById('formLogin')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('formCliente')?.addEventListener('submit', handleClienteSubmit);
  document.getElementById('formAssinatura')?.addEventListener('submit', handleAssinaturaSubmit);
  document.getElementById('formPagamento')?.addEventListener('submit', handlePagamentoSubmit);

  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this.id);
      }
    });
  });
}

// Login Functions
function handleLoginSubmit(e) {
  e.preventDefault();
  
  const user = document.getElementById('loginUser').value;
  const senha = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  const usuario = state.usuarios.find(u => u.user === user && u.senha === senha);
  
  if (usuario) {
    state.currentUser = usuario.user;
    errorEl.classList.remove('active');
    errorEl.textContent = '';
    showMainApp();
  } else {
    errorEl.textContent = 'Usuário ou senha incorretos!';
    errorEl.classList.add('active');
  }
}

function logout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    state.currentUser = null;
    document.getElementById('formLogin').reset();
    showLoginScreen();
  }
}

// Tab Switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');

  // Refresh content when switching tabs
  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'clientes') renderClientes();
  if (tabName === 'assinaturas') renderAssinaturas();
  if (tabName === 'paineis') renderPaineis();
  if (tabName === 'relatorios') renderRelatorios();
}

function switchReportTab(tabName) {
  document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.report-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-report="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// Update Current Date
function updateCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('pt-BR', options);
}

// DASHBOARD Functions
function renderDashboard() {
  updateStats();
  renderCharts();
  renderVencimentosProximos();
}

function updateStats() {
  const totalClientes = state.clientes.filter(c => c.status === 'ativo').length;
  const assinaturasAtivas = state.assinaturas.filter(a => a.status_pagamento === 'pago').length;
  const receitaMensal = calculateReceitaMensal();
  const pagamentosPendentes = state.assinaturas.filter(a => a.status_pagamento === 'pendente').length;

  document.getElementById('totalClientes').textContent = totalClientes;
  document.getElementById('assinaturasAtivas').textContent = assinaturasAtivas;
  document.getElementById('receitaMensal').textContent = formatCurrency(receitaMensal);
  document.getElementById('pagamentosPendentes').textContent = pagamentosPendentes;
}

function calculateReceitaMensal() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return state.assinaturas
    .filter(a => {
      const vencimento = new Date(a.data_vencimento);
      return vencimento.getMonth() === currentMonth && 
             vencimento.getFullYear() === currentYear &&
             a.status_pagamento === 'pago';
    })
    .reduce((sum, a) => {
      const plano = state.planos.find(p => p.id === a.plano_id);
      return sum + (plano ? plano.preco : 0);
    }, 0);
}

function renderCharts() {
  renderReceitaChart();
  renderPlanosChart();
  renderPaineisChart();
}

function renderReceitaChart() {
  const ctx = document.getElementById('chartReceita');
  if (!ctx) return;

  if (charts.receita) charts.receita.destroy();

  const data = getReceitaMensalData();
  
  charts.receita = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Receita (R$)',
        data: data.values,
        borderColor: '#0066CC',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function getReceitaMensalData() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const today = new Date();
  const currentMonth = today.getMonth();
  const labels = [];
  const values = [];

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(months[monthIndex]);
    
    const receita = state.assinaturas
      .filter(a => {
        const vencimento = new Date(a.data_vencimento);
        return vencimento.getMonth() === monthIndex && a.status_pagamento === 'pago';
      })
      .reduce((sum, a) => {
        const plano = state.planos.find(p => p.id === a.plano_id);
        return sum + (plano ? plano.preco : 0);
      }, 0);
    
    values.push(receita);
  }

  return { labels, values };
}

function renderPlanosChart() {
  const ctx = document.getElementById('chartPlanos');
  if (!ctx) return;

  if (charts.planos) charts.planos.destroy();

  const data = state.planos.map(plano => {
    return state.assinaturas.filter(a => a.plano_id === plano.id).length;
  });

  charts.planos = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: state.planos.map(p => p.nome),
      datasets: [{
        data: data,
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderPaineisChart() {
  const ctx = document.getElementById('chartPaineis');
  if (!ctx) return;

  if (charts.paineis) charts.paineis.destroy();

  const data = state.paineis.map(painel => {
    return state.assinaturas.filter(a => a.painel_id === painel.id).length;
  });

  charts.paineis = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: state.paineis.map(p => p.nome),
      datasets: [{
        label: 'Assinaturas',
        data: data,
        backgroundColor: '#FFCC00'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderVencimentosProximos() {
  const container = document.getElementById('vencimentosProximos');
  if (!container) return;

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const vencimentos = state.assinaturas
    .filter(a => {
      const vencimento = new Date(a.data_vencimento);
      return vencimento >= today && vencimento <= nextWeek;
    })
    .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento))
    .slice(0, 5);

  if (vencimentos.length === 0) {
    container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Nenhum vencimento nos próximos 7 dias</p>';
    return;
  }

  container.innerHTML = vencimentos.map(a => {
    const cliente = state.clientes.find(c => c.id === a.cliente_id);
    const plano = state.planos.find(p => p.id === a.plano_id);
    return `
      <div class="vencimento-item">
        <div class="vencimento-info">
          <strong>${cliente ? cliente.nome : 'N/A'}</strong>
          <small>${plano ? plano.nome : 'N/A'} - ${formatCurrency(plano ? plano.preco : 0)}</small>
        </div>
        <div class="vencimento-date">${formatDate(a.data_vencimento)}</div>
      </div>
    `;
  }).join('');
}

// CLIENTES Functions
function renderClientes() {
  filterClientes();
}

function filterClientes() {
  const searchTerm = document.getElementById('searchCliente')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  let filtered = state.clientes.filter(cliente => {
    const matchSearch = cliente.nome.toLowerCase().includes(searchTerm) || 
                       cliente.email.toLowerCase().includes(searchTerm);
    const matchStatus = !statusFilter || cliente.status === statusFilter;
    return matchSearch && matchStatus;
  });

  renderClientesTable(filtered);
}

function renderClientesTable(clientes) {
  const tbody = document.getElementById('clientesTableBody');
  if (!tbody) return;

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">Nenhum cliente encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = clientes.map(cliente => {
    const assinatura = state.assinaturas.find(a => a.cliente_id === cliente.id);
    const painel = assinatura ? state.paineis.find(p => p.id === assinatura.painel_id) : null;
    const plano = assinatura ? state.planos.find(p => p.id === assinatura.plano_id) : null;
    
    return `
    <tr>
      <td><input type="checkbox" class="cliente-checkbox" data-id="${cliente.id}" onchange="updateDeleteButton()"></td>
      <td>${cliente.id}</td>
      <td>${cliente.nome}</td>
      <td>${cliente.email}</td>
      <td>${cliente.telefone}</td>
      <td>${painel ? painel.nome : 'N/A'}</td>
      <td>${plano ? plano.nome : 'N/A'}</td>
      <td>${assinatura ? formatDate(assinatura.data_vencimento) : 'N/A'}</td>
      <td><span class="status-badge status-${cliente.status}">${cliente.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-info btn-sm" onclick="editCliente(${cliente.id})">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCliente(${cliente.id})">🗑️ Deletar</button>
        </div>
      </td>
    </tr>
    `;
  }).join('');
}

function updateDeleteButton() {
  const checkboxes = document.querySelectorAll('.cliente-checkbox:checked');
  const btn = document.getElementById('btnDeleteSelected');
  if (btn) {
    btn.style.display = checkboxes.length > 0 ? 'block' : 'none';
  }
}

function openClienteModal(id = null) {
  const modal = document.getElementById('modalCliente');
  const form = document.getElementById('formCliente');
  const title = document.getElementById('modalClienteTitle');

  form.reset();
  populateClientePainelPlanoSelects();

  if (id) {
    const cliente = state.clientes.find(c => c.id === id);
    if (cliente) {
      title.textContent = 'Editar Cliente';
      document.getElementById('clienteId').value = cliente.id;
      document.getElementById('clienteNome').value = cliente.nome;
      document.getElementById('clienteEmail').value = cliente.email;
      document.getElementById('clienteTelefone').value = cliente.telefone;
      document.getElementById('clienteCPF').value = cliente.cpf;
      document.getElementById('clienteEndereco').value = cliente.endereco || '';
      
      // Find cliente's active subscription
      const assinatura = state.assinaturas.find(a => a.cliente_id === cliente.id);
      if (assinatura) {
        document.getElementById('clientePainel').value = assinatura.painel_id;
        document.getElementById('clientePlano').value = assinatura.plano_id;
        document.getElementById('clienteDataInicio').value = assinatura.data_inicio;
        document.getElementById('clienteDataVencimento').value = assinatura.data_vencimento;
        document.getElementById('clienteStatusPagamento').value = assinatura.status_pagamento;
      }
      
      document.getElementById('clienteStatus').value = cliente.status;
    }
  } else {
    title.textContent = 'Novo Cliente';
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('clienteDataInicio').value = formatDateInput(today);
    document.getElementById('clienteDataVencimento').value = formatDateInput(nextMonth);
    document.getElementById('clienteStatusPagamento').value = 'pendente';
    document.getElementById('clienteStatus').value = 'ativo';
  }

  modal.classList.add('active');
}

function populateClientePainelPlanoSelects() {
  const painelSelect = document.getElementById('clientePainel');
  const planoSelect = document.getElementById('clientePlano');

  painelSelect.innerHTML = '<option value="">Selecione um painel</option>' +
    state.paineis.filter(p => p.status === 'ativo').map(p => 
      `<option value="${p.id}">${p.nome}</option>`
    ).join('');

  planoSelect.innerHTML = '<option value="">Selecione um plano</option>' +
    state.planos.map(p => 
      `<option value="${p.id}">${p.nome} - ${formatCurrency(p.preco)}</option>`
    ).join('');
}

function handleClienteSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('clienteId').value;
  const clienteData = {
    nome: document.getElementById('clienteNome').value,
    email: document.getElementById('clienteEmail').value,
    telefone: document.getElementById('clienteTelefone').value,
    cpf: document.getElementById('clienteCPF').value,
    endereco: document.getElementById('clienteEndereco').value,
    status: document.getElementById('clienteStatus').value
  };
  
  const assinaturaData = {
    painel_id: parseInt(document.getElementById('clientePainel').value),
    plano_id: parseInt(document.getElementById('clientePlano').value),
    data_inicio: document.getElementById('clienteDataInicio').value,
    data_vencimento: document.getElementById('clienteDataVencimento').value,
    status_pagamento: document.getElementById('clienteStatusPagamento').value
  };

  // Validation
  if (!validateEmail(clienteData.email)) {
    alert('Email inválido!');
    return;
  }

  if (!validateTelefone(clienteData.telefone)) {
    alert('Telefone inválido! Use o formato (00) 00000-0000');
    return;
  }

  if (!validateCPF(clienteData.cpf)) {
    alert('CPF inválido! Use o formato 000.000.000-00');
    return;
  }

  // Check for duplicate email
  const duplicate = state.clientes.find(c => 
    c.email === clienteData.email && c.id !== parseInt(id)
  );
  if (duplicate) {
    alert('Este email já está cadastrado!');
    return;
  }

  if (id) {
    updateCliente(parseInt(id), clienteData);
    // Update existing subscription
    const assinatura = state.assinaturas.find(a => a.cliente_id === parseInt(id));
    if (assinatura) {
      updateAssinatura(assinatura.id, { ...assinaturaData, cliente_id: parseInt(id) });
    } else {
      addAssinatura({ ...assinaturaData, cliente_id: parseInt(id) }, false);
    }
  } else {
    const clienteId = addCliente(clienteData);
    // Create subscription for new client
    addAssinatura({ ...assinaturaData, cliente_id: clienteId }, false);
  }

  closeModal('modalCliente');
  renderClientes();
  renderDashboard();
}

function addCliente(data, showAlert = true) {
  const cliente = {
    id: state.nextClienteId++,
    ...data,
    data_cadastro: data.data_cadastro || new Date().toISOString().split('T')[0]
  };
  state.clientes.push(cliente);
  if (showAlert) alert('Cliente cadastrado com sucesso!');
  return cliente.id;
}

function updateCliente(id, data) {
  const index = state.clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    state.clientes[index] = { ...state.clientes[index], ...data };
    alert('Cliente atualizado com sucesso!');
  }
}

function editCliente(id) {
  openClienteModal(id);
}

function deleteCliente(id) {
  if (confirm('Tem certeza que deseja deletar este cliente?')) {
    const index = state.clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      state.clientes[index].status = 'inativo';
      renderClientes();
      renderDashboard();
      alert('Cliente deletado com sucesso!');
    }
  }
}

function deleteSelectedClientes() {
  const checkboxes = document.querySelectorAll('.cliente-checkbox:checked');
  if (checkboxes.length === 0) return;

  if (confirm(`Tem certeza que deseja deletar ${checkboxes.length} cliente(s)?`)) {
    checkboxes.forEach(cb => {
      const id = parseInt(cb.dataset.id);
      const index = state.clientes.findIndex(c => c.id === id);
      if (index !== -1) {
        state.clientes[index].status = 'inativo';
      }
    });
    document.getElementById('selectAll').checked = false;
    renderClientes();
    renderDashboard();
    alert('Clientes deletados com sucesso!');
  }
}

// ASSINATURAS Functions
function renderAssinaturas() {
  const tbody = document.getElementById('assinaturasTableBody');
  if (!tbody) return;

  if (state.assinaturas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #999;">Nenhuma assinatura cadastrada</td></tr>';
    return;
  }

  tbody.innerHTML = state.assinaturas.map(assinatura => {
    const cliente = state.clientes.find(c => c.id === assinatura.cliente_id);
    const painel = state.paineis.find(p => p.id === assinatura.painel_id);
    const plano = state.planos.find(p => p.id === assinatura.plano_id);

    return `
      <tr>
        <td>${assinatura.id}</td>
        <td>${cliente ? cliente.nome : 'N/A'}</td>
        <td>${painel ? painel.nome : 'N/A'}</td>
        <td>${plano ? plano.nome : 'N/A'} (${formatCurrency(plano ? plano.preco : 0)})</td>
        <td>${formatDate(assinatura.data_inicio)}</td>
        <td>${formatDate(assinatura.data_vencimento)}</td>
        <td><span class="status-badge status-${assinatura.status_pagamento}">${assinatura.status_pagamento}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-info btn-sm" onclick="editAssinatura(${assinatura.id})">✏️ Editar</button>
            <button class="btn btn-success btn-sm" onclick="openPagamentoModal(${assinatura.id})">💰 Pagar</button>
            <button class="btn btn-secondary btn-sm" onclick="viewAssinaturaDetalhes(${assinatura.id})">👁️ Ver</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAssinaturaModal(id = null) {
  const modal = document.getElementById('modalAssinatura');
  const form = document.getElementById('formAssinatura');
  const title = document.getElementById('modalAssinaturaTitle');

  form.reset();
  populateAssinaturaSelects();

  if (id) {
    const assinatura = state.assinaturas.find(a => a.id === id);
    if (assinatura) {
      title.textContent = 'Editar Assinatura';
      document.getElementById('assinaturaId').value = assinatura.id;
      document.getElementById('assinaturaCliente').value = assinatura.cliente_id;
      document.getElementById('assinaturaPainel').value = assinatura.painel_id;
      document.getElementById('assinaturaPlano').value = assinatura.plano_id;
      document.getElementById('assinaturaDataInicio').value = assinatura.data_inicio;
      document.getElementById('assinaturaDataVencimento').value = assinatura.data_vencimento;
      document.getElementById('assinaturaStatusPagamento').value = assinatura.status_pagamento;
    }
  } else {
    title.textContent = 'Nova Assinatura';
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('assinaturaDataInicio').value = formatDateInput(today);
    document.getElementById('assinaturaDataVencimento').value = formatDateInput(nextMonth);
    document.getElementById('assinaturaStatusPagamento').value = 'pendente';
  }

  modal.classList.add('active');
}

function populateAssinaturaSelects() {
  const clienteSelect = document.getElementById('assinaturaCliente');
  const painelSelect = document.getElementById('assinaturaPainel');
  const planoSelect = document.getElementById('assinaturaPlano');

  clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>' +
    state.clientes.filter(c => c.status === 'ativo').map(c => 
      `<option value="${c.id}">${c.nome}</option>`
    ).join('');

  painelSelect.innerHTML = '<option value="">Selecione um painel</option>' +
    state.paineis.filter(p => p.status === 'ativo').map(p => 
      `<option value="${p.id}">${p.nome}</option>`
    ).join('');

  planoSelect.innerHTML = '<option value="">Selecione um plano</option>' +
    state.planos.map(p => 
      `<option value="${p.id}">${p.nome} - ${formatCurrency(p.preco)}</option>`
    ).join('');
}

function handleAssinaturaSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('assinaturaId').value;
  const assinaturaData = {
    cliente_id: parseInt(document.getElementById('assinaturaCliente').value),
    painel_id: parseInt(document.getElementById('assinaturaPainel').value),
    plano_id: parseInt(document.getElementById('assinaturaPlano').value),
    data_inicio: document.getElementById('assinaturaDataInicio').value,
    data_vencimento: document.getElementById('assinaturaDataVencimento').value,
    status_pagamento: document.getElementById('assinaturaStatusPagamento').value
  };

  if (id) {
    updateAssinatura(parseInt(id), assinaturaData);
  } else {
    addAssinatura(assinaturaData);
  }

  closeModal('modalAssinatura');
  renderAssinaturas();
  renderDashboard();
}

function addAssinatura(data, showAlert = true) {
  const assinatura = {
    id: state.nextAssinaturaId++,
    ...data
  };
  state.assinaturas.push(assinatura);
  if (showAlert) alert('Assinatura criada com sucesso!');
}

function updateAssinatura(id, data) {
  const index = state.assinaturas.findIndex(a => a.id === id);
  if (index !== -1) {
    state.assinaturas[index] = { ...state.assinaturas[index], ...data };
    alert('Assinatura atualizada com sucesso!');
  }
}

function editAssinatura(id) {
  openAssinaturaModal(id);
}

function viewAssinaturaDetalhes(id) {
  const assinatura = state.assinaturas.find(a => a.id === id);
  if (!assinatura) return;

  const cliente = state.clientes.find(c => c.id === assinatura.cliente_id);
  const painel = state.paineis.find(p => p.id === assinatura.painel_id);
  const plano = state.planos.find(p => p.id === assinatura.plano_id);
  const pagamentos = state.pagamentos.filter(p => p.assinatura_id === assinatura.id);

  const content = `
    <div class="detalhe-row">
      <div class="detalhe-label">ID:</div>
      <div class="detalhe-value">${assinatura.id}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Cliente:</div>
      <div class="detalhe-value">${cliente ? cliente.nome : 'N/A'}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Email:</div>
      <div class="detalhe-value">${cliente ? cliente.email : 'N/A'}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Painel:</div>
      <div class="detalhe-value">${painel ? painel.nome : 'N/A'}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Plano:</div>
      <div class="detalhe-value">${plano ? plano.nome : 'N/A'} - ${formatCurrency(plano ? plano.preco : 0)}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Data Início:</div>
      <div class="detalhe-value">${formatDate(assinatura.data_inicio)}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Data Vencimento:</div>
      <div class="detalhe-value">${formatDate(assinatura.data_vencimento)}</div>
    </div>
    <div class="detalhe-row">
      <div class="detalhe-label">Status Pagamento:</div>
      <div class="detalhe-value"><span class="status-badge status-${assinatura.status_pagamento}">${assinatura.status_pagamento}</span></div>
    </div>
    ${pagamentos.length > 0 ? `
      <div style="margin-top: 20px;">
        <h4>Histórico de Pagamentos</h4>
        ${pagamentos.map(p => `
          <div class="detalhe-row">
            <div class="detalhe-label">${formatDate(p.data_pagamento)}:</div>
            <div class="detalhe-value">${formatCurrency(p.valor)} - ${p.metodo}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  document.getElementById('detalhesContent').innerHTML = content;
  document.getElementById('modalDetalhes').classList.add('active');
}

function openPagamentoModal(assinaturaId) {
  const modal = document.getElementById('modalPagamento');
  const form = document.getElementById('formPagamento');
  const assinatura = state.assinaturas.find(a => a.id === assinaturaId);
  const plano = state.planos.find(p => p.id === assinatura.plano_id);

  form.reset();
  document.getElementById('pagamentoAssinaturaId').value = assinaturaId;
  document.getElementById('pagamentoData').value = formatDateInput(new Date());
  document.getElementById('pagamentoValor').value = plano ? plano.preco : 0;
  document.getElementById('pagamentoMetodo').value = 'pix';

  modal.classList.add('active');
}

function handlePagamentoSubmit(e) {
  e.preventDefault();

  const pagamento = {
    id: state.nextPagamentoId++,
    assinatura_id: parseInt(document.getElementById('pagamentoAssinaturaId').value),
    data_pagamento: document.getElementById('pagamentoData').value,
    valor: parseFloat(document.getElementById('pagamentoValor').value),
    metodo: document.getElementById('pagamentoMetodo').value
  };

  state.pagamentos.push(pagamento);

  // Update assinatura status
  const assinatura = state.assinaturas.find(a => a.id === pagamento.assinatura_id);
  if (assinatura) {
    assinatura.status_pagamento = 'pago';
  }

  closeModal('modalPagamento');
  renderAssinaturas();
  renderDashboard();
  alert('Pagamento registrado com sucesso!');
}

// PAINÉIS Functions
function renderPaineis() {
  const tbody = document.getElementById('paineisTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.paineis.map(painel => {
    const assinaturas = state.assinaturas.filter(a => a.painel_id === painel.id);
    const receita = assinaturas.reduce((sum, a) => {
      if (a.status_pagamento === 'pago') {
        const plano = state.planos.find(p => p.id === a.plano_id);
        return sum + (plano ? plano.preco : 0);
      }
      return sum;
    }, 0);

    return `
      <tr>
        <td>${painel.id}</td>
        <td>${painel.nome}</td>
        <td>
          <label class="toggle-switch">
            <input type="checkbox" ${painel.status === 'ativo' ? 'checked' : ''} 
                   onchange="togglePainelStatus(${painel.id})">
            <span class="toggle-slider"></span>
          </label>
          <span class="status-badge status-${painel.status}">${painel.status}</span>
        </td>
        <td>${assinaturas.length}</td>
        <td>${formatCurrency(receita)}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="viewPainelAssinaturas(${painel.id})">👁️ Ver Assinaturas</button>
        </td>
      </tr>
    `;
  }).join('');
}

function togglePainelStatus(id) {
  const painel = state.paineis.find(p => p.id === id);
  if (painel) {
    painel.status = painel.status === 'ativo' ? 'inativo' : 'ativo';
    renderPaineis();
    renderDashboard();
  }
}

function viewPainelAssinaturas(painelId) {
  const painel = state.paineis.find(p => p.id === painelId);
  if (!painel) return;

  const assinaturas = state.assinaturas.filter(a => a.painel_id === painelId);

  document.getElementById('painelModalTitle').textContent = `Assinaturas do Painel ${painel.nome}`;
  const tbody = document.getElementById('painelAssinaturasBody');

  if (assinaturas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">Nenhuma assinatura neste painel</td></tr>';
  } else {
    tbody.innerHTML = assinaturas.map(a => {
      const cliente = state.clientes.find(c => c.id === a.cliente_id);
      const plano = state.planos.find(p => p.id === a.plano_id);

      return `
        <tr>
          <td>${cliente ? cliente.nome : 'N/A'}</td>
          <td>${plano ? plano.nome : 'N/A'}</td>
          <td>${formatDate(a.data_inicio)}</td>
          <td>${formatDate(a.data_vencimento)}</td>
          <td><span class="status-badge status-${a.status_pagamento}">${a.status_pagamento}</span></td>
        </tr>
      `;
    }).join('');
  }

  document.getElementById('modalPainelAssinaturas').classList.add('active');
}

// RELATÓRIOS Functions
function renderRelatorios() {
  renderReceitaMensalReport();
  renderReceitaPorPlano();
  renderVencimentosReport();
  renderUltimosCadastros();
  renderReceitaPaineisChart();
  renderTopPaineis();
}

function renderReceitaMensalReport() {
  const ctx = document.getElementById('chartReceitaMensal');
  if (!ctx) return;

  if (charts.receitaMensal) charts.receitaMensal.destroy();

  const data = getReceitaMensalData();
  
  charts.receitaMensal = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Receita (R$)',
        data: data.values,
        borderColor: '#0066CC',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderReceitaPorPlano() {
  const container = document.getElementById('receitaPorPlano');
  if (!container) return;

  const stats = state.planos.map(plano => {
    const receita = state.assinaturas
      .filter(a => a.plano_id === plano.id && a.status_pagamento === 'pago')
      .reduce((sum, a) => sum + plano.preco, 0);
    return { nome: plano.nome, receita };
  });

  container.innerHTML = stats.map(s => `
    <div class="stat-row">
      <strong>${s.nome}</strong>
      <span>${formatCurrency(s.receita)}</span>
    </div>
  `).join('');
}

function renderVencimentosReport() {
  const tbody = document.getElementById('reportVencimentos');
  if (!tbody) return;

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const vencimentos = state.assinaturas
    .filter(a => {
      const vencimento = new Date(a.data_vencimento);
      return vencimento >= today && vencimento <= nextWeek;
    })
    .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));

  if (vencimentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">Nenhum vencimento nos próximos 7 dias</td></tr>';
    return;
  }

  tbody.innerHTML = vencimentos.map(a => {
    const cliente = state.clientes.find(c => c.id === a.cliente_id);
    const plano = state.planos.find(p => p.id === a.plano_id);

    return `
      <tr>
        <td>${cliente ? cliente.nome : 'N/A'}</td>
        <td>${cliente ? cliente.email : 'N/A'}</td>
        <td>${formatDate(a.data_vencimento)}</td>
        <td>${plano ? plano.nome : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

function renderUltimosCadastros() {
  const tbody = document.getElementById('reportUltimosCadastros');
  if (!tbody) return;

  const ultimos = [...state.clientes]
    .sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro))
    .slice(0, 10);

  tbody.innerHTML = ultimos.map(c => `
    <tr>
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${formatDate(c.data_cadastro)}</td>
    </tr>
  `).join('');
}

function renderReceitaPaineisChart() {
  const ctx = document.getElementById('chartReceitaPaineis');
  if (!ctx) return;

  if (charts.receitaPaineis) charts.receitaPaineis.destroy();

  const data = state.paineis.map(painel => {
    return state.assinaturas
      .filter(a => a.painel_id === painel.id && a.status_pagamento === 'pago')
      .reduce((sum, a) => {
        const plano = state.planos.find(p => p.id === a.plano_id);
        return sum + (plano ? plano.preco : 0);
      }, 0);
  });

  charts.receitaPaineis = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: state.paineis.map(p => p.nome),
      datasets: [{
        label: 'Receita (R$)',
        data: data,
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderTopPaineis() {
  const container = document.getElementById('topPaineis');
  if (!container) return;

  const stats = state.paineis.map(painel => {
    const assinaturas = state.assinaturas.filter(a => a.painel_id === painel.id);
    const receita = assinaturas
      .filter(a => a.status_pagamento === 'pago')
      .reduce((sum, a) => {
        const plano = state.planos.find(p => p.id === a.plano_id);
        return sum + (plano ? plano.preco : 0);
      }, 0);
    return { nome: painel.nome, receita, assinaturas: assinaturas.length };
  }).sort((a, b) => b.receita - a.receita);

  container.innerHTML = stats.map(s => `
    <div class="stat-row">
      <strong>${s.nome}</strong>
      <span>${formatCurrency(s.receita)} (${s.assinaturas} assinaturas)</span>
    </div>
  `).join('');
}

// Export Functions
function exportPDF() {
  alert('Exportando relatório em PDF...\n\nEsta funcionalidade está simulada. Em produção, seria gerado um PDF com os dados do sistema.');
}

function exportCSV() {
  alert('Exportando dados em CSV...\n\nEsta funcionalidade está simulada. Em produção, seria gerado um arquivo CSV com os dados do sistema.');
}

// Modal Functions
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Utility Functions
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

function formatDateInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateTelefone(telefone) {
  const cleaned = telefone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

function validateCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}