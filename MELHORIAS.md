# Plano de Melhorias - Catequese para Adultos

Este documento apresenta melhorias sugeridas para o projeto, organizadas por prioridade e categoria.

## Legenda de Prioridade

- **P0 (Crítica)**: Problemas que afetam funcionalidade ou segurança
- **P1 (Alta)**: Melhorias importantes para UX e performance
- **P2 (Média)**: Funcionalidades desejáveis
- **P3 (Baixa)**: Melhorias incrementais

---

## 1. PWA e Funcionalidades Offline (P1)

### 1.1 Criar Manifest Web App Real
**Status atual**: O arquivo `manifest.json` é um manifest Readium (audiobook), não um PWA manifest.

**Implementação**:
```json
// Criar: manifest.webmanifest
{
  "name": "Catequese para Adultos",
  "short_name": "Catequese",
  "description": "Curso de catequese católica com Padre Paulo Ricardo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/image/capa.jpg",
      "sizes": "192x192",
      "type": "image/jpeg",
      "purpose": "any maskable"
    },
    {
      "src": "/image/catequese-para-adultos-desktop.jpg",
      "sizes": "512x512",
      "type": "image/jpeg",
      "purpose": "any maskable"
    }
  ]
}
```

**Atualizar index.html**:
```html
<link rel="manifest" href="/manifest.webmanifest">
```

**Impacto**: Permite instalação real como app nativo, melhor integração com SO.

---

### 1.2 Melhorar Service Worker
**Problemas atuais**:
- Cache estático básico
- Não há estratégia de atualização
- Áudios não são cacheados proativamente

**Implementação**:

```javascript
// sw.js - Melhorado
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;
const MAX_AUDIO_CACHE = 10; // Limitar cache de áudios

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/polyfills/fetch.js',
  '/polyfills/urlsearchparams.js',
  '/player.js',
  '/manifest.json',
  '/image/capa.jpg',
  '/image/christo_nihil_præponere.png'
];

// Install: cachear recursos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key.startsWith('static-') || key.startsWith('audio-'))
            .filter(key => key !== STATIC_CACHE && key !== AUDIO_CACHE)
            .map(key => caches.delete(key))
      );
    })
  );
  clients.claim();
});

// Fetch: estratégias diferentes para estático vs áudio
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Áudio: Cache first, com limit
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) return response;

          return fetch(event.request).then(fetchResponse => {
            // Só cachear se sucesso
            if (fetchResponse.ok) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Estático: Network first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

**Benefícios**:
- Cache inteligente de áudios (sob demanda)
- Atualização automática de recursos estáticos
- Melhor performance offline
- Gestão de espaço em disco

---

## 2. Experiência do Usuário (P1)

### 2.1 Controles de Velocidade de Reprodução
**Implementação**:

```javascript
// Adicionar em player.js
var speedControl = document.getElementById('playback-speed');
speedControl.addEventListener('change', function() {
  audio.playbackRate = parseFloat(this.value);
  localStorage.setItem('playbackRate', this.value);
});

// Restaurar velocidade salva
var savedSpeed = localStorage.getItem('playbackRate');
if (savedSpeed) {
  audio.playbackRate = parseFloat(savedSpeed);
  speedControl.value = savedSpeed;
}
```

```html
<!-- Adicionar em index.html -->
<select id="playback-speed" class="form-control" style="width: auto; margin: 10px auto;">
  <option value="0.5">0.5x</option>
  <option value="0.75">0.75x</option>
  <option value="1" selected>1x</option>
  <option value="1.25">1.25x</option>
  <option value="1.5">1.5x</option>
  <option value="1.75">1.75x</option>
  <option value="2">2x</option>
</select>
```

---

### 2.2 Skip Forward/Backward (15 segundos)
```html
<!-- Adicionar botões -->
<button id="skip-back" class="btn btn-secondary">⏪ -15s</button>
<button id="skip-forward" class="btn btn-secondary">+15s ⏩</button>
```

```javascript
document.getElementById('skip-back').addEventListener('click', () => {
  audio.currentTime = Math.max(0, audio.currentTime - 15);
});

document.getElementById('skip-forward').addEventListener('click', () => {
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
});
```

---

### 2.3 Índice de Aulas com Busca
**Criar modal com lista de todas as aulas**:

```html
<!-- Modal Bootstrap -->
<button class="btn btn-primary" data-toggle="modal" data-target="#trackList">
  📋 Índice de Aulas
</button>

<div class="modal fade" id="trackList">
  <div class="modal-dialog modal-lg">
    <div class="modal-content" style="background: #222;">
      <div class="modal-header">
        <h5 class="modal-title">Todas as Aulas</h5>
        <input type="text" id="search-tracks" class="form-control" placeholder="Buscar aula...">
      </div>
      <div class="modal-body">
        <div id="track-list"></div>
      </div>
    </div>
  </div>
</div>
```

```javascript
// Gerar lista de aulas do manifest
function renderTrackList(tracks) {
  const container = document.getElementById('track-list');
  const searchInput = document.getElementById('search-tracks');

  function render(filter = '') {
    container.innerHTML = tracks
      .map((track, idx) => {
        const name = track.href.substring(6, track.href.length - 4)
                              .replaceAll('-', ' ')
                              .replaceAll('_', ' ');
        if (filter && !name.toLowerCase().includes(filter.toLowerCase())) {
          return '';
        }
        return `<div class="track-item" data-index="${idx}">
          ${idx + 1}. ${name}
        </div>`;
      })
      .join('');
  }

  searchInput.addEventListener('input', (e) => render(e.target.value));
  render();
}
```

---

### 2.4 Barra de Progresso Visual
```html
<!-- Substituir audio controls padrão -->
<div class="custom-controls">
  <div class="progress" style="height: 8px; cursor: pointer;" id="progress-bar">
    <div class="progress-bar" id="progress-fill" style="width: 0%"></div>
  </div>
  <div class="time-display">
    <span id="current-time">0:00</span> / <span id="total-time">0:00</span>
  </div>
</div>
```

```javascript
// Atualizar progresso
audio.addEventListener('timeupdate', () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progress-fill').style.width = percent + '%';
  document.getElementById('current-time').textContent = formatTime(audio.currentTime);
  document.getElementById('total-time').textContent = formatTime(audio.duration);
});

// Permitir seek clicando
document.getElementById('progress-bar').addEventListener('click', (e) => {
  const bounds = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - bounds.left) / bounds.width;
  audio.currentTime = percent * audio.duration;
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## 3. Acessibilidade (P1)

### 3.1 ARIA Labels e Semântica
```html
<!-- Melhorar HTML semântico -->
<nav aria-label="Navegação de aulas">
  <button id="previous" aria-label="Aula anterior">⬅ Anterior</button>
  <button id="next" aria-label="Próxima aula">Próximo ➡</button>
</nav>

<audio
  id="audio-element"
  aria-label="Player de áudio"
  aria-live="polite"
  autoplay
  controls>
</audio>

<!-- Adicionar live region para anúncios -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only" id="status"></div>
```

```javascript
// Anunciar mudanças
function announceTrackChange(trackName) {
  document.getElementById('status').textContent = `Reproduzindo: ${trackName}`;
}
```

---

### 3.2 Suporte a Teclado
```javascript
// Atalhos de teclado
document.addEventListener('keydown', (e) => {
  // Ignorar se estiver em input
  if (e.target.tagName === 'INPUT') return;

  switch(e.key) {
    case ' ':
    case 'k':
      e.preventDefault();
      audio.paused ? audio.play() : audio.pause();
      break;
    case 'ArrowLeft':
      audio.currentTime -= 5;
      break;
    case 'ArrowRight':
      audio.currentTime += 5;
      break;
    case 'j':
      audio.currentTime -= 10;
      break;
    case 'l':
      audio.currentTime += 10;
      break;
    case 'n':
      if (next.hasAttribute('href')) next.click();
      break;
    case 'p':
      if (previous.hasAttribute('href')) previous.click();
      break;
    case 'm':
      audio.muted = !audio.muted;
      break;
  }
});
```

**Adicionar legenda de atalhos**:
```html
<button data-toggle="modal" data-target="#shortcuts">⌨️ Atalhos</button>
<div class="modal" id="shortcuts">
  <h5>Atalhos de Teclado</h5>
  <ul>
    <li><kbd>Espaço</kbd> ou <kbd>K</kbd> - Play/Pause</li>
    <li><kbd>→</kbd> - Avançar 5s</li>
    <li><kbd>←</kbd> - Voltar 5s</li>
    <li><kbd>J</kbd> - Voltar 10s</li>
    <li><kbd>L</kbd> - Avançar 10s</li>
    <li><kbd>N</kbd> - Próxima aula</li>
    <li><kbd>P</kbd> - Aula anterior</li>
    <li><kbd>M</kbd> - Mute</li>
  </ul>
</div>
```

---

## 4. SEO e Metadados (P1)

### 4.1 Schema.org Structured Data
```html
<!-- Adicionar em index.html -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Catequese para Adultos",
  "description": "A fé de dois mil anos da Igreja, explicada de forma concisa, simples e acessível a todos",
  "provider": {
    "@type": "Person",
    "name": "Padre Paulo Ricardo"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "instructor": {
      "@type": "Person",
      "name": "Padre Paulo Ricardo"
    }
  },
  "inLanguage": "pt-BR",
  "numberOfLessons": 34,
  "educationalLevel": "adulto"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AudioObject",
  "name": "Catequese para Adultos - Curso Completo",
  "description": "Curso de catequese católica em 34 aulas",
  "contentUrl": "https://catequese-para-adultos.vercel.app/",
  "encodingFormat": "audio/mpeg",
  "inLanguage": "pt-BR",
  "author": {
    "@type": "Person",
    "name": "Padre Paulo Ricardo"
  }
}
</script>
```

### 4.2 Meta Tags Melhoradas
```html
<!-- Adicionar/melhorar -->
<meta name="keywords" content="catequese, católica, padre paulo ricardo, doutrina, fé católica">
<meta name="author" content="Padre Paulo Ricardo">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://catequese-para-adultos.vercel.app/">

<!-- Open Graph melhorado -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Catequese para Adultos">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@padrepauloricardo">
```

---

## 5. Código e Arquitetura (P0-P1)

### 5.1 Remover Modificação de Prototype (P0)
**Problema**: `String.prototype.replaceAll` pode conflitar com outras bibliotecas.

**Solução**:
```javascript
// player.js - REMOVER:
// String.prototype.replaceAll = function(stringToFind, stringToReplace) { ... }

// USAR em vez disso:
function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// Ou usar regex:
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// Atualizar uso:
temp = replaceAll(temp, '_', ' ');
```

---

### 5.2 Tratamento de Erros (P1)
```javascript
function getManifest(url) {
  return fetch(url)
    .catch(error => {
      console.error('Erro ao buscar manifest:', error);
      return caches.match(url);
    })
    .then(response => {
      if (!response) {
        throw new Error('Manifest não encontrado');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Erro ao processar manifest:', error);
      showError('Não foi possível carregar o curso. Verifique sua conexão.');
      throw error;
    });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger';
  errorDiv.textContent = message;
  document.querySelector('main').prepend(errorDiv);
}

// Adicionar listeners de erro no audio
audio.addEventListener('error', (e) => {
  const error = audio.error;
  let message = 'Erro ao carregar áudio';

  switch(error.code) {
    case error.MEDIA_ERR_NETWORK:
      message = 'Erro de rede ao carregar áudio';
      break;
    case error.MEDIA_ERR_DECODE:
      message = 'Erro ao decodificar áudio';
      break;
    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      message = 'Formato de áudio não suportado';
      break;
  }

  showError(message);
});
```

---

### 5.3 Remover jQuery Desnecessário (P2)
**Problema**: jQuery é carregado mas não usado.

**Solução**: Bootstrap 4 pode ser usado sem jQuery para funcionalidades básicas, ou migrar para Bootstrap 5 (sem jQuery).

```html
<!-- REMOVER -->
<script src="https://code.jquery.com/jquery-3.5.0.slim.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>

<!-- OU migrar para Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

---

## 6. Funcionalidades Avançadas (P2)

### 6.1 Marcadores/Favoritos
```javascript
// Salvar marcadores
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');

function addBookmark(track, time, note) {
  const id = Date.now();
  bookmarks[id] = { track, time, note, created: new Date() };
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function jumpToBookmark(id) {
  const bookmark = bookmarks[id];
  updateTrack(manifest_url, bookmark.track).then(() => {
    audio.currentTime = bookmark.time;
    audio.play();
  });
}
```

---

### 6.2 Notas Pessoais
```javascript
// Sistema de notas por aula
function saveNote(trackUrl, note) {
  const notes = JSON.parse(localStorage.getItem('notes') || '{}');
  notes[trackUrl] = {
    content: note,
    updated: new Date()
  };
  localStorage.setItem('notes', JSON.stringify(notes));
}
```

---

### 6.3 Estatísticas de Progresso
```javascript
// Rastrear progresso
const stats = {
  lessonsCompleted: new Set(),
  totalListeningTime: 0,
  startDate: new Date()
};

audio.addEventListener('ended', () => {
  stats.lessonsCompleted.add(audio_source.src);
  localStorage.setItem('stats', JSON.stringify({
    ...stats,
    lessonsCompleted: Array.from(stats.lessonsCompleted)
  }));
});

audio.addEventListener('timeupdate', () => {
  if (Math.round(audio.currentTime) % 60 === 0) {
    stats.totalListeningTime += 60;
  }
});

// Dashboard de progresso
function showProgress() {
  const total = 34; // Total de aulas
  const completed = stats.lessonsCompleted.size;
  const percent = (completed / total * 100).toFixed(1);

  return `
    <h3>Seu Progresso</h3>
    <p>Aulas concluídas: ${completed}/${total} (${percent}%)</p>
    <p>Tempo total: ${Math.floor(stats.totalListeningTime / 3600)}h</p>
    <div class="progress">
      <div class="progress-bar" style="width: ${percent}%"></div>
    </div>
  `;
}
```

---

### 6.4 Compartilhamento de Posição
```javascript
// Gerar URL com timestamp
function sharePosition() {
  const currentTrackIndex = getCurrentTrackIndex();
  const time = Math.floor(audio.currentTime);
  const url = `${window.location.origin}?track=${currentTrackIndex}&t=${time}`;

  // Web Share API
  if (navigator.share) {
    navigator.share({
      title: 'Catequese para Adultos',
      text: `Ouça esta aula: ${getCurrentTrackName()}`,
      url: url
    });
  } else {
    // Fallback: copiar para clipboard
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  }
}

// Ler timestamp da URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('t')) {
  const timestamp = parseInt(urlParams.get('t'));
  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = timestamp;
  }, { once: true });
}
```

---

### 6.5 Modo Sleep Timer
```html
<select id="sleep-timer" class="form-control">
  <option value="">Sem timer</option>
  <option value="15">15 minutos</option>
  <option value="30">30 minutos</option>
  <option value="45">45 minutos</option>
  <option value="60">60 minutos</option>
</select>
```

```javascript
let sleepTimer = null;

document.getElementById('sleep-timer').addEventListener('change', (e) => {
  if (sleepTimer) clearTimeout(sleepTimer);

  const minutes = parseInt(e.target.value);
  if (minutes) {
    sleepTimer = setTimeout(() => {
      audio.pause();
      alert('Timer encerrado. Boa noite!');
    }, minutes * 60 * 1000);
  }
});
```

---

## 7. Performance (P2)

### 7.1 Lazy Loading de Imagens
```html
<img src="/image/capa.jpg" loading="lazy" alt="Capa do curso">
```

### 7.2 Preload de Próxima Faixa
```javascript
// Precarregar próximo áudio quando atual passar de 80%
audio.addEventListener('timeupdate', () => {
  if (audio.currentTime / audio.duration > 0.8) {
    if (next.hasAttribute('href') && !next.dataset.preloaded) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = next.href;
      document.head.appendChild(link);
      next.dataset.preloaded = 'true';
    }
  }
});
```

### 7.3 Compression de Assets
- Minificar player.js, polyfills
- Otimizar imagens (usar WebP com fallback)
- Habilitar compressão gzip/brotli no servidor

---

## 8. Analytics e Monitoramento (P3)

### 8.1 Eventos Importantes para Rastrear
```javascript
// Integração simples (exemplo com GA4)
function trackEvent(eventName, params) {
  if (window.gtag) {
    gtag('event', eventName, params);
  }
}

// Eventos
audio.addEventListener('play', () => {
  trackEvent('audio_play', {
    track_name: getCurrentTrackName(),
    track_index: getCurrentTrackIndex()
  });
});

audio.addEventListener('ended', () => {
  trackEvent('audio_complete', {
    track_name: getCurrentTrackName()
  });
});

next.addEventListener('click', () => {
  trackEvent('navigation', { direction: 'next' });
});
```

---

## 9. Testes (P2)

### 9.1 Estrutura de Testes
```javascript
// tests/player.test.js (usando Jest ou similar)
describe('Audiobook Player', () => {
  test('should load manifest', async () => {
    const manifest = await getManifest('manifest.json');
    expect(manifest.metadata.title).toBe('Catequese para Adultos');
  });

  test('should navigate to next track', () => {
    // ...
  });

  test('should save playback position', () => {
    // ...
  });
});
```

---

## 10. Integração Git (P1)

### 10.1 Inicializar Repositório
```bash
git init
git add .
git commit -m "Initial commit"
```

### 10.2 Criar .gitignore
```
# .gitignore
.history/
.DS_Store
Thumbs.db
desktop.ini
node_modules/
*.log
```

### 10.3 Adicionar Versionamento Semântico
Criar `package.json` básico:
```json
{
  "name": "catequese-para-adultos",
  "version": "1.0.0",
  "description": "Audiobook player PWA para curso de catequese",
  "scripts": {
    "serve": "npx http-server -p 8000",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["pwa", "audiobook", "catequese"],
  "author": "Padre Paulo Ricardo",
  "license": "MIT"
}
```

---

## Roadmap Sugerido

### Fase 1 - Fundação (2-3 semanas)
1. ✅ Criar CLAUDE.md
2. Inicializar Git
3. Corrigir problema de prototype (P0)
4. Criar manifest.webmanifest real
5. Melhorar service worker
6. Adicionar tratamento de erros

### Fase 2 - UX Essencial (2 semanas)
1. Controles de velocidade
2. Skip forward/backward
3. Barra de progresso visual
4. Índice de aulas com busca
5. Atalhos de teclado

### Fase 3 - Acessibilidade (1 semana)
1. ARIA labels
2. Suporte completo a teclado
3. Testes com screen readers
4. Documentação de acessibilidade

### Fase 4 - SEO e Metadados (1 semana)
1. Schema.org structured data
2. Meta tags melhoradas
3. Sitemap
4. robots.txt

### Fase 5 - Funcionalidades Avançadas (2-3 semanas)
1. Marcadores/Favoritos
2. Notas pessoais
3. Estatísticas de progresso
4. Sleep timer
5. Compartilhamento

### Fase 6 - Performance e Testes (1-2 semanas)
1. Otimização de imagens
2. Lazy loading
3. Implementar testes
4. Auditoria Lighthouse
5. Testes de dispositivos

---

## Métricas de Sucesso

### Performance
- Lighthouse Score > 90 (Performance, Accessibility, Best Practices, SEO)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Offline functionality 100%

### Engagement
- Taxa de conclusão de aulas > 60%
- Tempo médio de sessão > 20min
- Taxa de retorno (7 dias) > 40%

### Acessibilidade
- WCAG 2.1 Level AA compliance
- Navegação completa por teclado
- Suporte a screen readers

---

## Ferramentas Recomendadas

### Desenvolvimento
- **VS Code** com extensões: ESLint, Prettier, Live Server
- **Chrome DevTools** para debug e PWA testing
- **Lighthouse** para auditorias
- **Wave** para testes de acessibilidade

### Testing
- **Jest** para testes unitários
- **Cypress** ou **Playwright** para testes E2E
- **axe DevTools** para acessibilidade

### Deployment
- **Vercel** (atual) ou **Netlify**
- **GitHub Actions** para CI/CD

---

## Recursos e Referências

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [W3C - Web Audio API](https://www.w3.org/TR/webaudio/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Schema.org - Course](https://schema.org/Course)
- [Readium Web Publications](https://readium.org/webpub-manifest/)

---

**Data de criação**: 2025-12-14
**Versão**: 1.0
**Autor**: Claude Code Analysis
