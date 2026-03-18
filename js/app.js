function goTo(screenId) {
  if (screenId === 'screen-app' || screenId === 'screen-splash') {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    return;
  }
}

// Forçar splash imediatamente (script está no final do body, DOM já está pronto)
goTo('screen-splash');

function toggleMenu() {
  const app = document.getElementById('screen-app');
  if (app) app.classList.toggle('menu-closed');
}

// Navegação entre páginas de conteúdo
document.querySelectorAll('.menu-item').forEach(btn => {
  btn.addEventListener('click', function() {
    const pageId = this.getAttribute('data-page');
    if (!pageId) return;

    const currentPage = document.querySelector('.content-page.active');
    const nextPage = document.getElementById(pageId);
    const clickedBtn = this;

    if (!nextPage || currentPage === nextPage) return;

    // Animação de saída
    currentPage.classList.add('leaving');
    currentPage.classList.remove('active');

    setTimeout(() => {
      currentPage.classList.remove('leaving');
      nextPage.classList.add('active');

      // Atualiza item ativo no menu
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      clickedBtn.classList.add('active');

      // Scroll para o topo
      document.querySelector('.content-pages').scrollTop = 0;

      // Foca no carrossel se for a página Perspectiva (para teclado)
      if (pageId === 'page-perspectiva') {
        const carousel = nextPage.querySelector('.carousel-container');
        if (carousel) carousel.focus();
      }
    }, 350);
  });
});

// Lightbox para ampliar imagens
function openImagemLightbox(src, alt) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lightbox && img) {
    img.src = src;
    img.alt = alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeImagemLightbox(e) {
  if (e && e.target !== e.currentTarget) return;
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeImagemLightbox();
});

// Sempre abrir apenas a tela inicial (splash)
document.addEventListener('DOMContentLoaded', function() {
  goTo('screen-splash');
  const firstMenuItem = document.querySelector('.menu-item[data-page="page-amenities"]');
  if (firstMenuItem) firstMenuItem.classList.add('active');
  initCarousel();
});

window.addEventListener('load', function() {
  goTo('screen-splash');
});

window.addEventListener('pageshow', function() {
  goTo('screen-splash');
});

// Carrossel Perspectiva
function initCarousel() {
  const container = document.querySelector('.carousel-container');
  if (!container) return;

  const slides = container.querySelectorAll('.carousel-slide');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');
  const dotsContainer = container.querySelector('.carousel-dots');
  const counterEl = container.querySelector('.carousel-counter');
  const total = slides.length;

  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = ((index % total) + total) % total;
    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
    
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
      });
    }
    
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${total}`;
    }
  }

  function createDots() {
    if (!dotsContainer) return;
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir para imagem ${i + 1}`);
      dot.addEventListener('click', () => showSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  createDots();
  showSlide(0);

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
  });

  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  container.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) showSlide(currentIndex + (diff > 0 ? 1 : -1));
  });
}
