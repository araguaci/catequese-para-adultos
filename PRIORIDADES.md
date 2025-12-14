# Prioridades Imediatas - Quick Wins

Este documento lista as melhorias mais impactantes que podem ser implementadas rapidamente.

## 🔴 Crítico - Implementar Imediatamente

### 1. Corrigir String.prototype (player.js:2-11)
**Problema**: Modificar prototypes nativos pode causar conflitos.

**Fix rápido**:
```javascript
// Substituir esta função por uma função local
function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// Linha 150: temp = temp.replaceAll('_', ' ');
// Mudar para: temp = replaceAll(temp, '_', ' ');
```

**Tempo**: 5 minutos
**Impacto**: Evita bugs em produção

---

## 🟡 Alta Prioridade - Esta Semana

### 2. Criar Manifest PWA Real
**Arquivo**: `manifest.webmanifest` (novo)

```json
{
  "name": "Catequese para Adultos",
  "short_name": "Catequese",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/image/capa.jpg",
      "sizes": "512x512",
      "type": "image/jpeg"
    }
  ]
}
```

**Atualizar index.html**:
```html
<link rel="manifest" href="/manifest.webmanifest">
```

**Tempo**: 15 minutos
**Impacto**: App instalável em dispositivos móveis

---

### 3. Adicionar Tratamento de Erros Básico
**Arquivo**: `player.js`

```javascript
// Adicionar após linha 89
audio.addEventListener('error', (e) => {
  console.error('Erro no áudio:', audio.error);
  alert('Erro ao carregar o áudio. Verifique sua conexão e tente novamente.');
});

// Atualizar getManifest (linha 88)
function getManifest(url) {
  return fetch(url)
    .catch(function () {
      console.warn('Erro ao buscar manifest, tentando cache');
      return caches.match(url);
    })
    .then(function (response) {
      if (!response) {
        throw new Error('Manifest não encontrado');
      }
      return response.json();
    })
    .catch(function(error) {
      console.error('Erro fatal:', error);
      alert('Não foi possível carregar o curso. Recarregue a página.');
      throw error;
    });
}
```

**Tempo**: 20 minutos
**Impacto**: Melhor experiência quando há problemas

---

### 4. Controles de Velocidade de Reprodução
**Arquivo**: `index.html` (após linha 88)

```html
<div style="text-align: center; margin: 10px;">
  <label for="playback-speed">Velocidade: </label>
  <select id="playback-speed" class="form-control" style="width: auto; display: inline-block;">
    <option value="0.75">0.75x</option>
    <option value="1" selected>1x (Normal)</option>
    <option value="1.25">1.25x</option>
    <option value="1.5">1.5x</option>
    <option value="2">2x</option>
  </select>
</div>
```

**Arquivo**: `player.js` (após linha 86)

```javascript
// Adicionar controle de velocidade
var speedControl = document.getElementById('playback-speed');
if (speedControl) {
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
}
```

**Tempo**: 15 minutos
**Impacto**: Feature muito solicitada pelos usuários

---

### 5. Botões Skip ±15s
**Arquivo**: `index.html` (entre linha 90-93)

```html
<nav style="text-align: center; padding: 20px;">
  <a id="previous" rel="prev">&lt;&nbsp;Anterior</a>
  &nbsp;
  <button id="skip-back" class="btn btn-sm btn-secondary">⏪ -15s</button>
  &nbsp;
  <button id="skip-forward" class="btn btn-sm btn-secondary">+15s ⏩</button>
  &nbsp;
  <a id="next" rel="next">Próximo&nbsp;&gt;</a>
</nav>
```

**Arquivo**: `player.js` (após linha 86)

```javascript
// Skip buttons
document.getElementById('skip-back').addEventListener('click', function() {
  audio.currentTime = Math.max(0, audio.currentTime - 15);
});

document.getElementById('skip-forward').addEventListener('click', function() {
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
});
```

**Tempo**: 10 minutos
**Impacto**: Melhora muito a navegação no áudio

---

## 🟢 Melhorias Importantes - Este Mês

### 6. Atalhos de Teclado
**Arquivo**: `player.js` (final do arquivo)

```javascript
// Atalhos de teclado
document.addEventListener('keydown', function(e) {
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
  }
});
```

**Tempo**: 10 minutos
**Impacto**: Melhor acessibilidade e UX

---

### 7. ARIA Labels para Acessibilidade
**Arquivo**: `index.html`

```html
<!-- Atualizar linha 85 -->
<audio id="audio-element"
       aria-label="Player de áudio da catequese"
       autoplay controls>

<!-- Atualizar linhas 91-93 -->
<a id="previous"
   rel="prev"
   aria-label="Aula anterior">&lt;&nbsp;Anterior</a>

<a id="next"
   rel="next"
   aria-label="Próxima aula">Próximo&nbsp;&gt;</a>
```

**Tempo**: 10 minutos
**Impacto**: Melhor para usuários de screen readers

---

### 8. Schema.org para SEO
**Arquivo**: `index.html` (antes da tag `</head>`)

```html
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
  "inLanguage": "pt-BR",
  "numberOfLessons": 34,
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "instructor": {
      "@type": "Person",
      "name": "Padre Paulo Ricardo"
    }
  }
}
</script>
```

**Tempo**: 5 minutos
**Impacto**: Melhor indexação no Google

---

## Ordem de Implementação Recomendada

```
Dia 1 (30 min):
  ✓ #1 - Corrigir prototype
  ✓ #2 - Criar manifest PWA
  ✓ #8 - Adicionar Schema.org

Dia 2 (45 min):
  ✓ #3 - Tratamento de erros
  ✓ #4 - Controle de velocidade
  ✓ #5 - Botões skip

Dia 3 (30 min):
  ✓ #6 - Atalhos de teclado
  ✓ #7 - ARIA labels
  ✓ Testar tudo
```

**Total**: ~2 horas de trabalho para 8 melhorias significativas

---

## Comandos para Testar

```bash
# Servir localmente
python -m http.server 8000
# ou
npx http-server -p 8000

# Abrir no navegador
# http://localhost:8000

# Testar PWA
# Chrome DevTools > Application > Manifest
# Chrome DevTools > Application > Service Workers

# Testar acessibilidade
# Chrome DevTools > Lighthouse
# Marcar: Performance, Accessibility, Best Practices, SEO
```

---

## Checklist de Validação

Após implementar, validar:

- [ ] App pode ser instalado no mobile (ícone "Instalar App")
- [ ] Controle de velocidade funciona e persiste
- [ ] Botões -15s e +15s funcionam
- [ ] Espaço pausa/resume o áudio
- [ ] Setas esquerda/direita navegam no áudio
- [ ] Mensagens de erro aparecem quando sem internet
- [ ] Lighthouse Score > 80 em todas as categorias
- [ ] Funciona offline após primeira visita

---

## Próximos Passos (Backlog)

Após concluir as prioridades acima:

1. Melhorar Service Worker (cache inteligente)
2. Adicionar índice de aulas com busca
3. Implementar barra de progresso visual
4. Sleep timer
5. Sistema de marcadores
6. Estatísticas de progresso
7. Compartilhamento de posição

Veja **MELHORIAS.md** para detalhes completos.

---

**Última atualização**: 2025-12-14
