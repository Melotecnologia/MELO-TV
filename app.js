// ========== DADOS EM MEMÓRIA ==========
const usuarioLogado = {
    id: null,
    username: '',
    role: ''
};

const API = {
    usuarios: [
        { id: 1, username: 'admin', email: 'admin@melotv.com', senha: 'admin123', role: 'Admin', status: 'ativo', data_criacao: '2025-01-10' },
        { id: 2, username: 'operador', email: 'operador@melotv.com', senha: 'operador123', role: 'Operador', status: 'ativo', data_criacao: '2025-01-15' }
    ],
    clientes: [
        { id: 1, nome: 'João Silva', telefone: '11987654321', painel_id: 1, plano_id: 1, data_vencimento: '2025-02-20', status_pagamento: 'pago', status: 'ativo', data_cadastro: '2025-01-15' },
        { id: 2, nome: 'Maria Santos', telefone: '11987654322', painel_id: 2, plano_id: 2, data_vencimento: '2025-02-25', status_pagamento: 'pendente', status: 'ativo', data_cadastro: '2025-01-16' }
    ],
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
    assinaturas: [
        { id: 1, cliente_id: 1, painel_id: 1, plano_id: 1, data_inicio: '2025-01-20', data_vencimento: '2025-02-20', status_pagamento: 'pago' }
    ],
    nextClienteId: 3,
    nextAssinaturaId: 2,
    nextUsuarioId: 3
};

// ========== LOGIN ==========
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const senha = document.getElementById('login-senha').value;
    
    const usuario = API.usuarios.find(u => u.username === user && u.senha === senha);
    
    if (usuario) {
        usuarioLogado.id = usuario.id;
        usuarioLogado.username = usuario.username;
        usuarioLogado.role = usuario.role;
        
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('sistema-container').style.display = 'block';
        document.getElementById('user-display').textContent = usuario.username + ' (' + usuario.role + ')';
        
        if (usuario.role === 'Admin') {
            document.getElementById('tab-admin').style.display = 'inline-block';
        }
        
        inicializarSistema();
    } else {
        document.getElementById('login-erro').textContent = '❌ Usuário ou senha incorretos!';
    }
});

// ========== LOGOUT ==========
document.getElementById('btn-logout')?.addEventListener('click', function() {
    usuarioLogado.id = null;
    usuarioLogado.username = '';
    usuarioLogado.role = '';
    
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('sistema-container').style.display = 'none';
    document.getElementById('login-form').reset();
    document.getElementById('login-erro').textContent = '';
});

// ========== FUNÇÕES UTILITÁRIAS ==========
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// ========== NAVEGAÇÃO ABAS ==========
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
    });
});

// ========== MODALS ==========
const modals = {
    cliente: document.getElementById('modal-cliente'),
    usuario: document.getElementById('modal-usuario'),
    trocarSenha: document.getElementById('modal-trocar-senha'),
    assinatura: document.getElementById('modal-assinatura')
};

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', function() {
        Object.values(modals).forEach(m => m.style.display = 'none');
    });
});

window.addEventListener('click', (e) => {
    Object.values(modals).forEach(m => {
        if (e.target === m) m.style.display = 'none';
    });
});

// ========== DASHBOARD ==========
let chartInstances = {};

function atualizarDashboard() {
    document.getElementById('total-clientes').textContent = API.clientes.length;
    document.getElementById('total-assinaturas').textContent = API.assinaturas.length;
    
    const receita = API.assinaturas.reduce((sum, a) => {
        const plano = API.planos.find(p => p.id === a.plano_id);
        return sum + plano.preco;
    }, 0);
    document.getElementById('receita-mensal').textContent = formatarMoeda(receita);
    
    const pendentes = API.assinaturas.filter(a => a.status_pagamento === 'pendente').length;
    document.getElementById('pagamentos-pendentes').textContent = pendentes;

    if (document.getElementById('receitaChart')) {
        if (chartInstances.receita) chartInstances.receita.destroy();
        const ctx1 = document.getElementById('receitaChart').getContext('2d');
        chartInstances.receita = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Receita Mensal',
                    data: [receita*0.8, receita*0.9, receita, receita*1.1, receita*0.95, receita],
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.4
                }]
            },
            options: { responsive: true }
        });

        if (chartInstances.plano) chartInstances.plano.destroy();
        const ctx2 = document.getElementById('planoChart').getContext('2d');
        chartInstances.plano = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: API.planos.map(p => p.nome),
                datasets: [{
                    data: API.planos.map(p => API.assinaturas.filter(a => a.plano_id === p.id).length),
                    backgroundColor: ['#0066CC', '#FFCC00', '#000000']
                }]
            },
            options: { responsive: true }
        });
    }

    const hoje = new Date();
    const vencimentos = API.assinaturas.filter(a => {
        const venc = new Date(a.data_vencimento);
        const dias = (venc - hoje) / (1000 * 60 * 60 * 24);
        return dias >= 0 && dias <= 7;
    });

    document.getElementById('lista-vencimentos').innerHTML = vencimentos.map(v => {
        const cliente = API.clientes.find(c => c.id === v.cliente_id);
        const painel = API.paineis.find(p => p.id === v.painel_id);
        return `<p>📅 ${cliente?.nome || 'N/A'} - ${painel?.nome || 'N/A'} - Vence em ${formatarData(v.data_vencimento)}</p>`;
    }).join('') || '<p>Nenhum vencimento próximo</p>';
}

// ========== CLIENTES ==========
function listarClientes() {
    document.getElementById('tabela-clientes').innerHTML = API.clientes.map(c => {
        const painel = API.paineis.find(p => p.id === c.painel_id);
        const plano = API.planos.find(p => p.id === c.plano_id);
        return `
            <tr>
                <td><input type="checkbox" class="cliente-checkbox" value="${c.id}"></td>
                <td>${c.id}</td>
                <td>${c.nome}</td>
                <td>${c.telefone}</td>
                <td>${painel?.nome || 'N/A'}</td>
                <td>${plano?.nome || 'N/A'}</td>
                <td>${formatarData(c.data_vencimento)}</td>
                <td><span class="status ${c.status_pagamento}">${c.status_pagamento}</span></td>
                <td><span class="status ${c.status}">${c.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editarCliente(${c.id})">✏️</button>
                    <button class="btn btn-danger" onclick="deletarClienteUnico(${c.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    atualizarBotaoDeletarSelecionados();
    adicionarEventosCheckbox();
}

function atualizarBotaoDeletarSelecionados() {
    const selecionados = document.querySelectorAll('.cliente-checkbox:checked').length;
    const btn = document.getElementById('btn-deletar-selecionados');
    if (btn) {
        btn.style.display = selecionados > 0 ? 'block' : 'none';
    }
}

function adicionarEventosCheckbox() {
    document.querySelectorAll('.cliente-checkbox').forEach(cb => {
        cb.removeEventListener('change', atualizarBotaoDeletarSelecionados);
        cb.addEventListener('change', atualizarBotaoDeletarSelecionados);
    });

    const checkboxTodos = document.getElementById('checkbox-todos');
    if (checkboxTodos) {
        checkboxTodos.removeEventListener('change', toggleTodosCheckboxes);
        checkboxTodos.addEventListener('change', toggleTodosCheckboxes);
    }
}

function toggleTodosCheckboxes() {
    const checkboxTodos = document.getElementById('checkbox-todos');
    document.querySelectorAll('.cliente-checkbox').forEach(cb => {
        cb.checked = checkboxTodos.checked;
    });
    atualizarBotaoDeletarSelecionados();
}

document.getElementById('btn-deletar-selecionados')?.addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.cliente-checkbox:checked');
    const selecionados = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (selecionados.length === 0) {
        alert('Selecione ao menos um cliente!');
        return;
    }
    
    if (confirm(`Deletar ${selecionados.length} cliente(s)? Esta ação é irreversível!`)) {
        API.clientes = API.clientes.filter(c => !selecionados.includes(c.id));
        listarClientes();
        atualizarDashboard();
        alert('✅ Cliente(s) deletado(s) com sucesso!');
    }
});

document.getElementById('btn-novo-cliente')?.addEventListener('click', () => {
    document.getElementById('form-cliente').reset();
    document.getElementById('cliente-id').value = '';
    popularSelectsCliente();
    modals.cliente.style.display = 'block';
});

function popularSelectsCliente() {
    const selectPainel = document.getElementById('cliente-painel');
    selectPainel.innerHTML = '<option value="">Selecione um Painel *</option>' + API.paineis.map(p => 
        `<option value="${p.id}">${p.nome}</option>`
    ).join('');

    const selectPlano = document.getElementById('cliente-plano');
    selectPlano.innerHTML = '<option value="">Selecione um Plano *</option>' + API.planos.map(p => 
        `<option value="${p.id}">${p.nome} - ${formatarMoeda(p.preco)}</option>`
    ).join('');
}

document.getElementById('form-cliente')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('cliente-id').value;
    const cliente = {
        nome: document.getElementById('cliente-nome').value.trim(),
        telefone: document.getElementById('cliente-telefone').value.trim(),
        painel_id: parseInt(document.getElementById('cliente-painel').value),
        plano_id: parseInt(document.getElementById('cliente-plano').value),
        data_vencimento: document.getElementById('cliente-vencimento').value,
        status_pagamento: document.getElementById('cliente-status-pagto').value,
        status: document.getElementById('cliente-status').value
    };

    if (!cliente.nome || !cliente.telefone || !cliente.painel_id || !cliente.plano_id) {
        alert('❌ Preencha todos os campos obrigatórios!');
        return;
    }

    if (id) {
        const idx = API.clientes.findIndex(c => c.id == id);
        if (idx >= 0) {
            Object.assign(API.clientes[idx], cliente);
            alert('✅ Cliente atualizado!');
        }
    } else {
        cliente.id = API.nextClienteId++;
        cliente.data_cadastro = new Date().toISOString().split('T')[0];
        API.clientes.push(cliente);
        alert('✅ Cliente criado!');
    }
    
    modals.cliente.style.display = 'none';
    listarClientes();
    atualizarDashboard();
});

function editarCliente(id) {
    const cliente = API.clientes.find(c => c.id === id);
    if (!cliente) return;
    
    document.getElementById('cliente-id').value = cliente.id;
    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('cliente-telefone').value = cliente.telefone;
    
    popularSelectsCliente();
    
    setTimeout(() => {
        document.getElementById('cliente-painel').value = cliente.painel_id;
        document.getElementById('cliente-plano').value = cliente.plano_id;
    }, 100);
    
    document.getElementById('cliente-vencimento').value = cliente.data_vencimento;
    document.getElementById('cliente-status-pagto').value = cliente.status_pagamento;
    document.getElementById('cliente-status').value = cliente.status;
    modals.cliente.style.display = 'block';
}

function deletarClienteUnico(id) {
    if (confirm('Deletar este cliente? Esta ação é irreversível!')) {
        API.clientes = API.clientes.filter(c => c.id !== id);
        listarClientes();
        atualizarDashboard();
        alert('✅ Cliente deletado!');
    }
}

document.getElementById('busca-cliente')?.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    if (!termo) {
        listarClientes();
        return;
    }
    const filtrados = API.clientes.filter(c => c.nome.toLowerCase().includes(termo));
    document.getElementById('tabela-clientes').innerHTML = filtrados.map(c => {
        const painel = API.paineis.find(p => p.id === c.painel_id);
        const plano = API.planos.find(p => p.id === c.plano_id);
        return `
            <tr>
                <td><input type="checkbox" class="cliente-checkbox" value="${c.id}"></td>
                <td>${c.id}</td>
                <td>${c.nome}</td>
                <td>${c.telefone}</td>
                <td>${painel?.nome || 'N/A'}</td>
                <td>${plano?.nome || 'N/A'}</td>
                <td>${formatarData(c.data_vencimento)}</td>
                <td><span class="status ${c.status_pagamento}">${c.status_pagamento}</span></td>
                <td><span class="status ${c.status}">${c.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editarCliente(${c.id})">✏️</button>
                    <button class="btn btn-danger" onclick="deletarClienteUnico(${c.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
    adicionarEventosCheckbox();
});

document.getElementById('filtro-status')?.addEventListener('change', (e) => {
    const status = e.target.value;
    if (!status) {
        listarClientes();
        return;
    }
    const filtrados = API.clientes.filter(c => c.status === status);
    document.getElementById('tabela-clientes').innerHTML = filtrados.map(c => {
        const painel = API.paineis.find(p => p.id === c.painel_id);
        const plano = API.planos.find(p => p.id === c.plano_id);
        return `
            <tr>
                <td><input type="checkbox" class="cliente-checkbox" value="${c.id}"></td>
                <td>${c.id}</td>
                <td>${c.nome}</td>
                <td>${c.telefone}</td>
                <td>${painel?.nome || 'N/A'}</td>
                <td>${plano?.nome || 'N/A'}</td>
                <td>${formatarData(c.data_vencimento)}</td>
                <td><span class="status ${c.status_pagamento}">${c.status_pagamento}</span></td>
                <td><span class="status ${c.status}">${c.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editarCliente(${c.id})">✏️</button>
                    <button class="btn btn-danger" onclick="deletarClienteUnico(${c.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
    adicionarEventosCheckbox();
});

// ========== ADMIN - USUÁRIOS ==========
function listarUsuarios() {
    document.getElementById('tabela-usuarios').innerHTML = API.usuarios.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${formatarData(u.data_criacao)}</td>
            <td><span class="status ${u.status}">${u.status}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="editarUsuario(${u.id})">✏️</button>
                <button class="btn btn-secondary" onclick="abrirTrocarSenha(${u.id})">🔑</button>
                <button class="btn btn-danger" onclick="deletarUsuario(${u.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btn-novo-usuario')?.addEventListener('click', () => {
    document.getElementById('form-usuario').reset();
    document.getElementById('usuario-id').value = '';
    modals.usuario.style.display = 'block';
});

document.getElementById('form-usuario')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('usuario-id').value;
    const username = document.getElementById('usuario-username').value.trim();
    const email = document.getElementById('usuario-email').value.trim();
    const senha = document.getElementById('usuario-senha').value;
    const confirmar = document.getElementById('usuario-confirmar-senha').value;
    const role = document.getElementById('usuario-role').value;
    const status = document.getElementById('usuario-status').value;

    if (senha !== confirmar) {
        alert('❌ As senhas não conferem!');
        return;
    }

    if (senha.length < 6) {
        alert('❌ Senha deve ter no mínimo 6 caracteres!');
        return;
    }

    const emailExiste = API.usuarios.find(u => u.email === email && u.id != id);
    if (emailExiste) {
        alert('❌ Este email já está registrado!');
        return;
    }

    if (id) {
        const usuario = API.usuarios.find(u => u.id == id);
        if (usuario) {
            usuario.username = username;
            usuario.email = email;
            usuario.role = role;
            usuario.status = status;
            if (documento.getElementById('usuario-senha').value) {
                usuario.senha = senha;
            }
            alert('✅ Usuário atualizado!');
        }
    } else {
        const novoUsuario = {
            id: API.nextUsuarioId++,
            username: username,
            email: email,
            senha: senha,
            role: role,
            status: status,
            data_criacao: new Date().toISOString().split('T')[0]
        };
        API.usuarios.push(novoUsuario);
        alert('✅ Usuário criado com sucesso!');
    }

    modals.usuario.style.display = 'none';
    listarUsuarios();
});

function editarUsuario(id) {
    const usuario = API.usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    document.getElementById('usuario-id').value = usuario.id;
    document.getElementById('usuario-username').value = usuario.username;
    document.getElementById('usuario-email').value = usuario.email;
    document.getElementById('usuario-role').value = usuario.role;
    document.getElementById('usuario-status').value = usuario.status;
    document.getElementById('usuario-senha').value = '';
    document.getElementById('usuario-confirmar-senha').value = '';
    modals.usuario.style.display = 'block';
}

function abrirTrocarSenha(id) {
    document.getElementById('trocar-usuario-id').value = id;
    document.getElementById('form-trocar-senha').reset();
    modals.trocarSenha.style.display = 'block';
}

document.getElementById('form-trocar-senha')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const usuarioId = parseInt(document.getElementById('trocar-usuario-id').value);
    const senhaAtual = document.getElementById('trocar-senha-atual').value;
    const senhaNova = document.getElementById('trocar-senha-nova').value;
    const confirmarNova = document.getElementById('trocar-confirmar-nova').value;

    const usuario = API.usuarios.find(u => u.id === usuarioId);
    if (!usuario) return;

    if (usuario.senha !== senhaAtual) {
        alert('❌ Senha atual incorreta!');
        return;
    }

    if (senhaNova !== confirmarNova) {
        alert('❌ As novas senhas não conferem!');
        return;
    }

    if (senhaNova.length < 6) {
        alert('❌ Senha deve ter no mínimo 6 caracteres!');
        return;
    }

    usuario.senha = senhaNova;
    alert('✅ Senha atualizada com sucesso!');
    modals.trocarSenha.style.display = 'none';
});

function deletarUsuario(id) {
    if (API.usuarios.length <= 1) {
        alert('❌ Você deve manter pelo menos um usuário!');
        return;
    }

    if (confirm('Deletar este usuário?')) {
        API.usuarios = API.usuarios.filter(u => u.id !== id);
        alert('✅ Usuário deletado!');
        listarUsuarios();
    }
}

// ========== ASSINATURAS ==========
function listarAssinaturas() {
    document.getElementById('tabela-assinaturas').innerHTML = API.assinaturas.map(a => {
        const cliente = API.clientes.find(c => c.id === a.cliente_id);
        const painel = API.paineis.find(p => p.id === a.painel_id);
        const plano = API.planos.find(p => p.id === a.plano_id);
        return `
            <tr>
                <td>${cliente?.nome || 'N/A'}</td>
                <td>${painel?.nome || 'N/A'}</td>
                <td>${plano?.nome || 'N/A'}</td>
                <td>${formatarData(a.data_inicio)}</td>
                <td>${formatarData(a.data_vencimento)}</td>
                <td><span class="status ${a.status_pagamento}">${a.status_pagamento}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="registrarPagamento(${a.id})">💳</button>
                </td>
            </tr>
        `;
    }).join('');
}

document.getElementById('btn-nova-assinatura')?.addEventListener('click', () => {
    document.getElementById('form-assinatura').reset();
    popularSelectsAssinatura();
    modals.assinatura.style.display = 'block';
});

function popularSelectsAssinatura() {
    const select = document.getElementById('assinatura-cliente');
    select.innerHTML = '<option value="">Selecione um cliente</option>' + API.clientes.map(c => 
        `<option value="${c.id}">${c.nome}</option>`
    ).join('');

    const select2 = document.getElementById('assinatura-painel');
    select2.innerHTML = '<option value="">Selecione um painel</option>' + API.paineis.map(p => 
        `<option value="${p.id}">${p.nome}</option>`
    ).join('');

    const select3 = document.getElementById('assinatura-plano');
    select3.innerHTML = '<option value="">Selecione um plano</option>' + API.planos.map(p => 
        `<option value="${p.id}">${p.nome} - ${formatarMoeda(p.preco)}</option>`
    ).join('');
}

document.getElementById('form-assinatura')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const assinatura = {
        id: API.nextAssinaturaId++,
        cliente_id: parseInt(document.getElementById('assinatura-cliente').value),
        painel_id: parseInt(document.getElementById('assinatura-painel').value),
        plano_id: parseInt(document.getElementById('assinatura-plano').value),
        data_inicio: document.getElementById('assinatura-inicio').value,
        data_vencimento: document.getElementById('assinatura-vencimento').value,
        status_pagamento: 'pendente'
    };
    API.assinaturas.push(assinatura);
    alert('✅ Assinatura criada!');
    modals.assinatura.style.display = 'none';
    listarAssinaturas();
    atualizarDashboard();
});

function registrarPagamento(assinaturaId) {
    const assinatura = API.assinaturas.find(a => a.id === assinaturaId);
    if (assinatura) {
        assinatura.status_pagamento = 'pago';
        alert('✅ Pagamento registrado!');
        listarAssinaturas();
        atualizarDashboard();
    }
}

// ========== PAINÉIS ==========
function listarPaineis() {
    document.getElementById('tabela-paineis').innerHTML = API.paineis.map(p => {
        const assinCount = API.assinaturas.filter(a => a.painel_id === p.id).length;
        const receita = API.assinaturas
            .filter(a => a.painel_id === p.id)
            .reduce((sum, a) => {
                const plano = API.planos.find(pl => pl.id === a.plano_id);
                return sum + plano.preco;
            }, 0);
        return `
            <tr>
                <td>${p.nome}</td>
                <td><span class="status ${p.status}">${p.status}</span></td>
                <td>${assinCount}</td>
                <td>${formatarMoeda(receita)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="togglePainel(${p.id})">
                        ${p.status === 'ativo' ? '⏸️' : '▶️'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function togglePainel(painelId) {
    const painel = API.paineis.find(p => p.id === painelId);
    if (painel) {
        painel.status = painel.status === 'ativo' ? 'inativo' : 'ativo';
        listarPaineis();
    }
}

// ========== RELATÓRIOS ==========
document.querySelectorAll('.relatorio-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.relatorio-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.relatorio-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('relatorio-' + this.dataset.rel).classList.add('active');
    });
});

function inicializarRelatorios() {
    if (document.getElementById('receitaPorPlanoChart')) {
        if (chartInstances.receitaPlano) chartInstances.receitaPlano.destroy();
        const ctx = document.getElementById('receitaPorPlanoChart').getContext('2d');
        const receitaPorPlano = API.planos.map(p => {
            return API.assinaturas
                .filter(a => a.plano_id === p.id)
                .reduce((sum, a) => sum + p.preco, 0);
        });

        chartInstances.receitaPlano = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: API.planos.map(p => p.nome),
                datasets: [{
                    label: 'Receita',
                    data: receitaPorPlano,
                    backgroundColor: ['#0066CC', '#FFCC00', '#000000']
                }]
            },
            options: { responsive: true }
        });
    }

    if (document.getElementById('receitaPorPainelChart')) {
        if (chartInstances.receitaPainel) chartInstances.receitaPainel.destroy();
        const ctx2 = document.getElementById('receitaPorPainelChart').getContext('2d');
        const receitaPorPainel = API.paineis.map(p => {
            return API.assinaturas
                .filter(a => a.painel_id === p.id)
                .reduce((sum, a) => {
                    const plano = API.planos.find(pl => pl.id === a.plano_id);
                    return sum + plano.preco;
                }, 0);
        });

        chartInstances.receitaPainel = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: API.paineis.map(p => p.nome),
                datasets: [{
                    label: 'Receita',
                    data: receitaPorPainel,
                    backgroundColor: '#0066CC'
                }]
            },
            options: { responsive: true }
        });
    }

    const infoClientes = document.getElementById('info-clientes');
    if (infoClientes) {
        infoClientes.innerHTML = `
            <h3>Resumo de Clientes</h3>
            <p><strong>Total:</strong> ${API.clientes.length}</p>
            <p><strong>Ativos:</strong> ${API.clientes.filter(c => c.status === 'ativo').length}</p>
            <p><strong>Inativos:</strong> ${API.clientes.filter(c => c.status === 'inativo').length}</p>
        `;
    }
}

// ========== INICIALIZAÇÃO ==========
function inicializarSistema() {
    listarClientes();
    listarAssinaturas();
    listarPaineis();
    listarUsuarios();
    atualizarDashboard();
    inicializarRelatorios();
}

document.addEventListener('DOMContentLoaded', function() {
    // Sistema inicia com tela de login
});
