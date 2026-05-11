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
  if (e.key === 'Escape') {
    closeImagemLightbox();
    closeVideoModal();
    closeAmenityGallery();
    closeVikVideoModal();
  }
});

function openVikVideoModal() {
  const modal = document.getElementById('vik-video-modal');
  const video = document.getElementById('vik-video');
  if (!modal || !video) return;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  try { video.play(); } catch (_) {}
}

function closeVikVideoModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const modal = document.getElementById('vik-video-modal');
  const video = document.getElementById('vik-video');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (video) {
    try { video.pause(); } catch (_) {}
    try { video.currentTime = 0; } catch (_) {}
  }
}

let amenityGalleryItems = [];
let amenityGalleryIndex = 0;

function normalizeAmenityLabel(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function keywordToRegex(label) {
  const t = normalizeAmenityLabel(label);
  // Mapeamento por intenção (captions do carrossel Perspectiva)
  if (t.includes('piscina de ondas') || t.includes('ondas') || t.includes('wavegarden')) return /(piscina de ondas|wave)/i;
  if (t.includes('piscina') && (t.includes('adulto') || t.includes('infantil'))) return /(piscinas adulto|infantil)/i;
  if (t.includes('haras') || t.includes('equestrian')) return /(haras|equestrian)/i;
  if (t.includes('hotel') || t.includes('vik')) return /(hotel vik|vik)/i;
  if (t.includes('implantacao')) return /(implantacao)/i;
  if (t.includes('farmers')) return /(farmers)/i;
  if (t.includes('kids')) return /(kids)/i;
  if (t.includes('praia') || t.includes('beach')) return /(praia|beach)/i;
  if (t.includes('portaria')) return /(portaria)/i;
  if (t.includes('spa')) return /(spa)/i;
  if (t.includes('fitness') || t.includes('academia')) return /(fitness)/i;
  if (t.includes('pavilhao')) return /(pavilh)/i;
  return null;
}

function getPerspectiveItemsForAmenity(label) {
  const re = keywordToRegex(label);
  if (!re) return [];

  const slides = document.querySelectorAll('#page-perspectiva .carousel-slide');
  const items = [];
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    const caption = slide.querySelector('.carousel-caption');
    const src = img ? img.getAttribute('src') : '';
    const cap = caption ? caption.textContent.trim() : (img ? (img.getAttribute('alt') || '').trim() : '');
    if (!src) return;
    if (re.test(cap) || re.test(img?.getAttribute('alt') || '')) {
      items.push({ src, caption: cap });
    }
  });
  return items;
}

function renderAmenityGallery() {
  const modal = document.getElementById('amenity-gallery');
  const imgEl = document.getElementById('amenity-gallery-img');
  const capEl = document.getElementById('amenity-gallery-caption');
  const dotsEl = document.getElementById('amenity-gallery-dots');
  if (!modal || !imgEl || !capEl || !dotsEl) return;

  const current = amenityGalleryItems[amenityGalleryIndex];
  if (!current) return;

  imgEl.src = current.src;
  imgEl.alt = current.caption || '';
  capEl.textContent = current.caption || '';

  dotsEl.innerHTML = '';
  amenityGalleryItems.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'amenity-gallery-dot' + (i === amenityGalleryIndex ? ' active' : '');
    dotsEl.appendChild(dot);
  });
}

function openAmenityGallery(label) {
  const modal = document.getElementById('amenity-gallery');
  const titleEl = document.getElementById('amenity-gallery-title');
  if (!modal || !titleEl) return;

  const items = getPerspectiveItemsForAmenity(label);
  if (!items.length) {
    // Se não encontrou imagens específicas, abre a página Perspectiva como fallback
    const menuBtn = document.querySelector('.menu-item[data-page="page-perspectiva"]');
    if (menuBtn) menuBtn.click();
    return;
  }

  amenityGalleryItems = items;
  amenityGalleryIndex = 0;
  titleEl.textContent = label || 'Amenity';

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderAmenityGallery();
}

function closeAmenityGallery(e) {
  if (e && e.target !== e.currentTarget) return;
  const modal = document.getElementById('amenity-gallery');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  amenityGalleryItems = [];
  amenityGalleryIndex = 0;
}

function nextAmenityGallery(step) {
  if (!amenityGalleryItems.length) return;
  amenityGalleryIndex = (amenityGalleryIndex + step + amenityGalleryItems.length) % amenityGalleryItems.length;
  renderAmenityGallery();
}

function initAmenityClicks() {
  const items = document.querySelectorAll('#page-amenities .amenity-item');
  items.forEach(el => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');

    const nameEl = el.querySelector('.amenity-name');
    const label = nameEl ? nameEl.textContent.trim() : 'Amenity';

    el.addEventListener('click', () => openAmenityGallery(label));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAmenityGallery(label);
      }
    });
  });

  const prev = document.querySelector('.amenity-gallery-prev');
  const next = document.querySelector('.amenity-gallery-next');
  if (prev) prev.addEventListener('click', () => nextAmenityGallery(-1));
  if (next) next.addEventListener('click', () => nextAmenityGallery(1));
}

function openVideoModal() {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('project-video');
  if (!modal || !video) return;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  try { video.play(); } catch (_) {}
}

function closeVideoModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('project-video');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (video) {
    try { video.pause(); } catch (_) {}
    try { video.currentTime = 0; } catch (_) {}
  }
}

// Sempre abrir apenas a tela inicial (splash)
document.addEventListener('DOMContentLoaded', function() {
  goTo('screen-splash');
  const firstMenuItem = document.querySelector('.menu-item[data-page="page-vik"]');
  if (firstMenuItem) firstMenuItem.classList.add('active');
  initCarousel();
  initAmenityClicks();
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
