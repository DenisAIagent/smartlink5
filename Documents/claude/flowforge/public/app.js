// Application FlowForge - Interface utilisateur
class FlowForgeApp {
  constructor() {
    this.currentUser = null;
    this.sessionToken = localStorage.getItem('flowforge_session');
    this.currentConversation = null;
    
    this.init();
  }

  async init() {
    // Vérifier si l'utilisateur est connecté
    if (this.sessionToken) {
      const isValid = await this.validateSession();
      if (isValid) {
        this.showMainApp();
        return;
      }
    }
    
    this.showLoginPage();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-page]')) {
        e.preventDefault();
        this.navigateToPage(e.target.dataset.page);
      }
    });

    // Formulaires d'authentification
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Liens de basculement login/register
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterPage();
    });

    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginPage();
    });

    // Déconnexion
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.handleLogout();
    });

    // Chat
    document.getElementById('chatForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendChatMessage();
    });

    // Auto-resize du textarea de chat
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      });
    }
  }

  // Authentification
  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.querySelector('#loginForm button');
    const btnText = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    const alert = document.getElementById('loginAlert');

    this.setLoading(btn, btnText, spinner, true);
    alert.innerHTML = '';

    try {
      const response = await fetch('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.sessionToken = data.sessionToken;
        localStorage.setItem('flowforge_session', this.sessionToken);
        this.currentUser = data.user;
        this.showMainApp();
      } else {
        this.showAlert(alert, 'error', data.error || 'Erreur de connexion');
      }
    } catch (error) {
      this.showAlert(alert, 'error', 'Erreur de connexion au serveur');
    } finally {
      this.setLoading(btn, btnText, spinner, false);
    }
  }

  async handleRegister() {
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const btn = document.querySelector('#registerForm button');
    const btnText = document.getElementById('registerBtnText');
    const spinner = document.getElementById('registerSpinner');
    const alert = document.getElementById('registerAlert');

    this.setLoading(btn, btnText, spinner, true);
    alert.innerHTML = '';

    try {
      const response = await fetch('/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.showAlert(alert, 'success', 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => this.showLoginPage(), 2000);
      } else {
        this.showAlert(alert, 'error', data.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      this.showAlert(alert, 'error', 'Erreur de connexion au serveur');
    } finally {
      this.setLoading(btn, btnText, spinner, false);
    }
  }

  async validateSession() {
    try {
      const response = await fetch('/v1/auth/validate', {
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        return true;
      }
    } catch (error) {
      console.error('Erreur validation session:', error);
    }

    localStorage.removeItem('flowforge_session');
    this.sessionToken = null;
    return false;
  }

  handleLogout() {
    localStorage.removeItem('flowforge_session');
    this.sessionToken = null;
    this.currentUser = null;
    this.currentConversation = null;
    this.showLoginPage();
  }

  // Navigation
  showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
  }

  showRegisterPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
  }

  showMainApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    this.updateUserInfo();
    this.loadInitialData();
  }

  navigateToPage(pageId) {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    // Afficher la page
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(`${pageId}Page`).classList.add('active');

    // Charger les données spécifiques à la page
    this.loadPageData(pageId);
  }

  updateUserInfo() {
    if (this.currentUser) {
      const initials = (this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '');
      document.getElementById('userAvatar').textContent = initials || 'U';
      document.getElementById('userName').textContent = 
        `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'Utilisateur';
      document.getElementById('userEmail').textContent = this.currentUser.email || '';
    }
  }

  async loadInitialData() {
    await this.startChatConversation();
    this.loadPageData('chat');
  }

  async loadPageData(pageId) {
    switch (pageId) {
      case 'chat':
        if (!this.currentConversation) {
          await this.startChatConversation();
        }
        break;
      case 'workflows':
        await this.loadWorkflows();
        break;
      case 'integrations':
        await this.loadIntegrations();
        break;
      case 'logs':
        await this.loadLogs();
        break;
      case 'admin':
        if (this.currentUser?.role === 'admin') {
          await this.loadUsers();
        }
        break;
    }
  }

  // Chat
  async startChatConversation() {
    try {
      const response = await fetch('/v1/chat/start', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentConversation = data.conversation;
        await this.loadChatMessages();
      }
    } catch (error) {
      console.error('Erreur démarrage conversation:', error);
    }
  }

  async loadChatMessages() {
    if (!this.currentConversation) return;

    try {
      const response = await fetch(`/v1/chat/${this.currentConversation.session_id}/messages`, {
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        const messages = await response.json();
        this.renderChatMessages(messages);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  }

  renderChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';

    messages.forEach(message => {
      const messageEl = this.createMessageElement(message);
      container.appendChild(messageEl);
    });

    container.scrollTop = container.scrollHeight;
  }

  createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `chat-message ${message.role}`;

    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${message.role}`;
    avatar.textContent = message.role === 'user' ? 
      (this.currentUser?.firstName?.[0] || 'U') : 'IA';

    const content = document.createElement('div');
    content.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message.content;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date(message.created_at).toLocaleTimeString('fr-FR');

    content.appendChild(bubble);
    content.appendChild(time);

    div.appendChild(avatar);
    div.appendChild(content);

    return div;
  }

  async sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !this.currentConversation) return;

    // Ajouter le message utilisateur immédiatement
    const userMessage = {
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };
    
    const container = document.getElementById('chatMessages');
    container.appendChild(this.createMessageElement(userMessage));
    container.scrollTop = container.scrollHeight;

    input.value = '';
    input.style.height = 'auto';

    try {
      const response = await fetch(`/v1/chat/${this.currentConversation.session_id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ajouter la réponse de l'assistant
        const assistantMessage = {
          role: 'assistant',
          content: data.content,
          created_at: new Date().toISOString()
        };
        
        container.appendChild(this.createMessageElement(assistantMessage));
        container.scrollTop = container.scrollHeight;

        // Recharger les workflows si un nouveau a été créé
        if (data.metadata?.workflow_created) {
          this.showAlert(
            document.getElementById('chatMessages'),
            'success',
            `Workflow "${data.metadata.workflow_created.name}" créé avec succès !`
          );
        }
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Veuillez réessayer.',
        created_at: new Date().toISOString()
      };
      
      container.appendChild(this.createMessageElement(errorMessage));
      container.scrollTop = container.scrollHeight;
    }
  }

  // Workflows
  async loadWorkflows() {
    try {
      const response = await fetch('/v1/workflows', {
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        const workflows = await response.json();
        this.renderWorkflows(workflows);
      }
    } catch (error) {
      console.error('Erreur chargement workflows:', error);
    }
  }

  renderWorkflows(workflows) {
    const container = document.getElementById('workflowsList');
    
    if (workflows.length === 0) {
      container.innerHTML = '<p class="text-center">Aucun workflow créé. Utilisez l\'assistant IA pour en créer un !</p>';
      return;
    }

    container.innerHTML = workflows.map(workflow => `
      <div class="card mb-2">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="font-weight: 600; margin-bottom: 0.25rem;">${workflow.name}</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">
              Action: ${workflow.action_key} • 
              Créé: ${new Date(workflow.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge ${workflow.is_active ? 'badge-success' : 'badge-secondary'}">
              ${workflow.is_active ? 'Actif' : 'Inactif'}
            </span>
            <button class="btn btn-outline btn-small" onclick="app.toggleWorkflow(${workflow.id}, ${!workflow.is_active})">
              ${workflow.is_active ? 'Désactiver' : 'Activer'}
            </button>
            <button class="btn btn-danger btn-small" onclick="app.deleteWorkflow(${workflow.id})">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async toggleWorkflow(id, isActive) {
    try {
      const response = await fetch(`/v1/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (response.ok) {
        await this.loadWorkflows();
      }
    } catch (error) {
      console.error('Erreur modification workflow:', error);
    }
  }

  async deleteWorkflow(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workflow ?')) {
      return;
    }

    try {
      const response = await fetch(`/v1/workflows/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        await this.loadWorkflows();
      }
    } catch (error) {
      console.error('Erreur suppression workflow:', error);
    }
  }

  // Intégrations
  async loadIntegrations() {
    try {
      const response = await fetch('/v1/integrations', {
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        const integrations = await response.json();
        this.renderIntegrations(integrations);
      }
    } catch (error) {
      console.error('Erreur chargement intégrations:', error);
    }
  }

  renderIntegrations(integrations) {
    const container = document.getElementById('integrationsList');
    
    // Services disponibles
    const availableServices = [
      { key: 'claude', name: 'Claude (Anthropic)', category: 'IA' },
      { key: 'google', name: 'Google APIs', category: 'Productivité' },
      { key: 'brevo', name: 'Brevo', category: 'Email' },
      { key: 'discord', name: 'Discord', category: 'Communication' },
      { key: 'slack', name: 'Slack', category: 'Communication' },
      { key: 'github', name: 'GitHub', category: 'Développement' }
    ];

    container.innerHTML = availableServices.map(service => {
      const integration = integrations.find(int => int.service_name === service.key);
      const isConfigured = !!integration;
      
      return `
        <div class="card mb-2">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 style="font-weight: 600; margin-bottom: 0.25rem;">${service.name}</h3>
              <p style="color: var(--text-secondary); font-size: 0.875rem;">
                Catégorie: ${service.category}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge ${isConfigured ? 'badge-success' : 'badge-secondary'}">
                ${isConfigured ? 'Configuré' : 'Non configuré'}
              </span>
              <button class="btn btn-primary btn-small" onclick="app.configureIntegration('${service.key}')">
                ${isConfigured ? 'Modifier' : 'Configurer'}
              </button>
              ${isConfigured ? `
                <button class="btn btn-outline btn-small" onclick="app.testIntegration(${integration.id})">
                  Tester
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  configureIntegration(serviceKey) {
    // Ici on pourrait ouvrir une modal de configuration
    alert(`Configuration de ${serviceKey} - Fonctionnalité à implémenter`);
  }

  async testIntegration(id) {
    try {
      const response = await fetch(`/v1/integrations/${id}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Test de connexion réussi !');
      } else {
        alert(`Échec du test: ${result.error}`);
      }
    } catch (error) {
      alert('Erreur lors du test de connexion');
    }
  }

  // Logs
  async loadLogs() {
    try {
      const response = await fetch('/v1/logs', {
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        const logs = await response.json();
        this.renderLogs(logs);
      }
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    }
  }

  renderLogs(logs) {
    const tbody = document.getElementById('logsTableBody');
    
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun log disponible</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(log => `
      <tr>
        <td>Workflow ${log.workflow_id}</td>
        <td>
          <span class="badge ${this.getStatusBadgeClass(log.status)}">
            ${log.status.toUpperCase()}
          </span>
        </td>
        <td>${new Date(log.started_at).toLocaleString('fr-FR')}</td>
        <td>${log.finished_at ? new Date(log.finished_at).toLocaleString('fr-FR') : '-'}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
          ${log.logs || '-'}
        </td>
      </tr>
    `).join('');
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'success': return 'badge-success';
      case 'error': return 'badge-error';
      case 'running': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  // Administration
  async loadUsers() {
    if (this.currentUser?.role !== 'admin') {
      document.getElementById('usersList').innerHTML = 
        '<p class="text-center">Accès non autorisé</p>';
      return;
    }

    try {
      const response = await fetch('/v1/admin/users', {
        headers: { 'Authorization': `Bearer ${this.sessionToken}` }
      });

      if (response.ok) {
        const users = await response.json();
        this.renderUsers(users);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  }

  renderUsers(users) {
    const container = document.getElementById('usersList');
    
    container.innerHTML = users.map(user => `
      <div class="card mb-2">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 style="font-weight: 600; margin-bottom: 0.25rem;">
              ${user.first_name} ${user.last_name}
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">
              ${user.email} • 
              Inscrit: ${new Date(user.created_at).toLocaleDateString('fr-FR')} •
              Dernière connexion: ${user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge ${user.role === 'admin' ? 'badge-warning' : 'badge-secondary'}">
              ${user.role.toUpperCase()}
            </span>
            <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}">
              ${user.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Utilitaires
  setLoading(btn, textEl, spinner, loading) {
    btn.disabled = loading;
    textEl.style.display = loading ? 'none' : 'inline';
    spinner.classList.toggle('hidden', !loading);
  }

  showAlert(container, type, message) {
    const alertClass = type === 'error' ? 'alert-error' : 
                     type === 'success' ? 'alert-success' : 'alert-info';
    
    container.innerHTML = `
      <div class="alert ${alertClass}">
        ${message}
      </div>
    `;
  }
}

// Initialiser l'application
const app = new FlowForgeApp();

