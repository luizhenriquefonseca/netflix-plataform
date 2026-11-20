import { catalogItems } from './data.js';

// Estado da aplicação
let myList = JSON.parse(localStorage.getItem('netflix_my_list') || '[]');
let currentFilter = 'all';
let searchQuery = '';

// Elementos do DOM
const mainContent = document.getElementById('main-content');
const heroBanner = document.getElementById('hero-banner');
const navbar = document.getElementById('navbar');
const myListCount = document.getElementById('mylist-count');
const toastEl = document.getElementById('toast');

// Modal elements
const modal = document.getElementById('movie-modal');
const modalMedia = document.getElementById('modal-media');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalSynopsis = document.getElementById('modal-synopsis');
const modalGenres = document.getElementById('modal-genres');
const modalCast = document.getElementById('modal-cast');
const modalMyListBtn = document.getElementById('modal-mylist-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    updateMyListBadge();
    renderCatalog();
    setupEventListeners();
});

// Carrega nome e avatar do perfil escolhido na tela inicial
function loadUserProfile() {
    const saved = JSON.parse(localStorage.getItem('netflix_active_profile') || 'null');
    if (saved) {
        const nameEl = document.getElementById('active-profile-name');
        const avatarEl = document.getElementById('active-profile-avatar');
        if (nameEl) nameEl.textContent = saved.name;
        if (avatarEl && saved.avatar) {
            avatarEl.src = saved.avatar.startsWith('http')
                ? saved.avatar
                : `../${saved.avatar}`;
        }
    }
}

// Exibe mensagem rápida no canto inferior
function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

// Adiciona ou remove item de "Minha Lista"
function toggleMyList(itemId) {
    const item = catalogItems.find(i => i.id === itemId);
    if (!item) return;

    if (myList.includes(itemId)) {
        myList = myList.filter(id => id !== itemId);
        showToast(`"${item.title}" removido da Minha Lista`);
    } else {
        myList.push(itemId);
        showToast(`"${item.title}" adicionado à Minha Lista`);
    }

    localStorage.setItem('netflix_my_list', JSON.stringify(myList));
    updateMyListBadge();
    renderCatalog();
}

function updateMyListBadge() {
    if (myListCount) myListCount.textContent = myList.length;
}

// Cria o HTML de um card de filme/série
function createMovieCard(item) {
    const inList = myList.includes(item.id);
    const card = document.createElement('article');
    card.className = `movie-card ${item.progress ? 'has-progress' : ''}`;

    card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'">
        ${item.top10 ? `
            <div class="badge-top10">
                <span class="top">TOP</span>
                <span class="number">${item.top10}</span>
            </div>
        ` : ''}
        <div class="card-title-overlay">${item.title}</div>
        ${item.progress ? `
            <div class="progress-bar-container">
                <div class="progress-value" style="width: ${item.progress}%"></div>
            </div>
        ` : ''}
        <div class="card-details">
            <div class="details-buttons">
                <div class="left-buttons">
                    <button class="btn-icon btn-play-icon" data-action="play" title="Assistir trailer">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon ${inList ? 'added' : ''}" data-action="list" title="${inList ? 'Remover da lista' : 'Adicionar à Minha Lista'}">
                        <i class="fas ${inList ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                </div>
                <div class="right-buttons">
                    <button class="btn-icon" data-action="info" title="Mais informações">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            <div class="details-info">
                <span class="match-score">${item.match}</span>
                <span class="age-badge ${item.ageRed ? 'red-accent' : ''}">${item.age}</span>
                <span class="duration">${item.duration}</span>
                <span class="resolution">${item.resolution}</span>
            </div>
            <div class="details-tags">
                ${item.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
        </div>
    `;

    // Eventos dos botões dentro do card
    card.querySelector('[data-action="play"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(item, true);
    });

    card.querySelector('[data-action="list"]').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMyList(item.id);
    });

    card.querySelector('[data-action="info"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(item, false);
    });

    card.addEventListener('click', () => openModal(item, false));

    return card;
}

// Renderiza o catálogo conforme aba ativa ou termo buscado
function renderCatalog() {
    mainContent.innerHTML = '';

    // Modo Busca ou Filtro Específico
    if (searchQuery.trim() !== '' || currentFilter !== 'all') {
        heroBanner.classList.add('hidden');
        mainContent.classList.add('no-hero');

        let filtered = catalogItems;

        if (currentFilter === 'series') {
            filtered = filtered.filter(i => i.type === 'series');
        } else if (currentFilter === 'movies') {
            filtered = filtered.filter(i => i.type === 'movies');
        } else if (currentFilter === 'trending') {
            filtered = filtered.filter(i => i.trending);
        } else if (currentFilter === 'mylist') {
            filtered = filtered.filter(i => myList.includes(i.id));
        }

        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                i.title.toLowerCase().includes(q) ||
                i.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        const section = document.createElement('section');
        const titlesMap = {
            all: `Resultados para "${searchQuery}"`,
            series: 'Séries',
            movies: 'Filmes',
            trending: 'Bombando Agora',
            mylist: 'Minha Lista'
        };

        const headerTitle = searchQuery.trim() !== ''
            ? `Resultados para "${searchQuery}"`
            : titlesMap[currentFilter];

        section.innerHTML = `<h2 class="slider-title">${headerTitle}</h2>`;

        if (filtered.length === 0) {
            section.innerHTML += `
                <div class="empty-state">
                    <p>Nenhum título encontrado nesta seção.</p>
                </div>
            `;
        } else {
            const grid = document.createElement('div');
            grid.className = 'results-grid';
            filtered.forEach(item => grid.appendChild(createMovieCard(item)));
            section.appendChild(grid);
        }

        mainContent.appendChild(section);
        return;
    }

    // Modo Home Padrão (com Hero Banner e Carrosséis por Categoria)
    heroBanner.classList.remove('hidden');
    mainContent.classList.remove('no-hero');

    const categories = [
        'Em alta no Brasil',
        'Continuar assistindo',
        'Filmes de Ficção Científica e Ação'
    ];

    categories.forEach(category => {
        const items = catalogItems.filter(i => i.category === category);
        if (items.length === 0) return;

        const section = document.createElement('section');
        section.className = 'slider-section';
        section.innerHTML = `
            <div class="slider-header">
                <h2 class="slider-title">${category}</h2>
            </div>
            <div class="row-wrapper">
                <button class="row-nav-btn prev" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>
                <div class="movie-row"></div>
                <button class="row-nav-btn next" aria-label="Próximo"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;

        const row = section.querySelector('.movie-row');
        items.forEach(item => row.appendChild(createMovieCard(item)));

        // Botões de rolagem lateral do carrossel
        section.querySelector('.prev').addEventListener('click', () => {
            const cardWidth = row.querySelector('.movie-card')?.getBoundingClientRect().width || 245;
            row.scrollBy({ left: -(cardWidth * 2 + 20), behavior: 'smooth' });
        });
        section.querySelector('.next').addEventListener('click', () => {
            const cardWidth = row.querySelector('.movie-card')?.getBoundingClientRect().width || 245;
            row.scrollBy({ left: cardWidth * 2 + 20, behavior: 'smooth' });
        });

        mainContent.appendChild(section);
    });
}

// Abre o modal com detalhes ou trailer do YouTube
function openModal(item, autoplay = false) {
    modalTitle.textContent = item.title;
    modalSynopsis.textContent = item.synopsis;
    modalGenres.textContent = item.tags.join(', ');
    modalCast.textContent = item.cast;

    modalMeta.innerHTML = `
        <span class="match-score">${item.match}</span>
        <span class="age-badge ${item.ageRed ? 'red-accent' : ''}">${item.age}</span>
        <span>${item.duration}</span>
        <span class="resolution">${item.resolution}</span>
    `;

    if (autoplay && item.trailerId) {
        modalMedia.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${item.trailerId}?autoplay=1&rel=0"
                title="Trailer ${item.title}"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        `;
    } else {
        modalMedia.innerHTML = `<img src="${item.image}" alt="${item.title}">`;
    }

    const updateModalBtn = () => {
        const added = myList.includes(item.id);
        modalMyListBtn.innerHTML = added
            ? '<i class="fas fa-check"></i> Na Minha Lista'
            : '<i class="fas fa-plus"></i> Minha Lista';
    };
    updateModalBtn();

    modalMyListBtn.onclick = () => {
        toggleMyList(item.id);
        updateModalBtn();
    };

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalMedia.innerHTML = ''; // Para o vídeo ao fechar
}

// Configura eventos globais da interface
function setupEventListeners() {
    // Fundo da navbar ao rolar a página
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    // Botões do Hero Banner (Stranger Things)
    const featured = catalogItems[0];
    document.getElementById('hero-play-btn').addEventListener('click', () => openModal(featured, true));
    document.getElementById('hero-info-btn').addEventListener('click', () => openModal(featured, false));

    // Navegação entre abas (Início, Séries, Filmes, Bombando, Minha Lista)
    document.querySelectorAll('#category-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#category-nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            currentFilter = link.getAttribute('data-filter');
            renderCatalog();
        });
    });

    // Barra de pesquisa expansível
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');
    const clearSearch = document.getElementById('clear-search');

    document.getElementById('search-toggle').addEventListener('click', () => {
        searchBox.classList.toggle('open');
        if (searchBox.classList.contains('open')) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearSearch.classList.toggle('visible', searchQuery.length > 0);
        renderCatalog();
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearch.classList.remove('visible');
        renderCatalog();
    });

    // Dropdown de notificações
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => notifDropdown.classList.remove('show'));

    // Fechar modal no X, clicando fora ou tecla ESC
    document.getElementById('modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
}
