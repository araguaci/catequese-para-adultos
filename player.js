/* Simple prototype for an Audiobook Player based on <audio> */
// Função auxiliar para substituir todas as ocorrências (sem modificar prototype)
function replaceAll(str, find, replace) {
  if (find === replace) return str;
  return str.split(find).join(replace);
}

// Materiais de referência por aula
// Estrutura: chave é o nome do arquivo (sem extensão), valor é array de objetos {title, url, icon}
var referenceMaterials = {
  '1-por-que-estamos-neste-mundo': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Catecismo da Igreja Católica', url: 'https://www.vatican.va/archive/catechism_po/index.html', icon: '📖' }
  ],
  '2-como-deus-quer-que-sejamos-felizes': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '3-o-deus-que-se-revela': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Bíblia Online', url: 'https://www.bibliaon.com/', icon: '📜' }
  ],
  '4-nao-ha-cristo-sem-igreja': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '5-como-nasce-a-virtude-da-fe': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '6-como-saber-onde-esta-a-verdadeira-fe': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '7-o-magisterio-da-igreja-e-os-dogmas-da-fe': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Catecismo da Igreja Católica', url: 'https://www.vatican.va/archive/catechism_po/index.html', icon: '📖' }
  ],
  '8-deus-existe': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '9-o-que-significa-criar': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Bíblia Online', url: 'https://www.bibliaon.com/', icon: '📜' }
  ],
  '10-as-coisas-visiveis-e-invisiveis': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '11-mal-uma-invencao-angelica': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' }
  ],
  '12-a-promessa-do-salvador': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Bíblia Online', url: 'https://www.bibliaon.com/', icon: '📜' }
  ],
  '13-e-o-verbo-se-fez-carne': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Bíblia Online', url: 'https://www.bibliaon.com/', icon: '📜' }
  ],
  '14-o-misterio-da-santissima-trindade': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Catecismo da Igreja Católica', url: 'https://www.vatican.va/archive/catechism_po/index.html', icon: '📖' }
  ],
  '15-o-misterio-de-JESUS-cristo': [
    { title: 'Site do Padre Paulo Ricardo', url: 'https://padrepauloricardo.org/', icon: '🌐' },
    { title: 'Bíblia Online', url: 'https://www.bibliaon.com/', icon: '📜' }
  ]
  // Adicione mais materiais conforme necessário
};

// Função para formatar título em texto legível para humanos
function formatTrackTitle(filename) {
  // Remove "audio/" do início e ".mp3" do final
  var title = filename;
  if (title.indexOf('audio/') === 0) {
    title = title.substring(6);
  }
  if (title.indexOf('.mp3') === title.length - 4) {
    title = title.substring(0, title.length - 4);
  }
  
  // Substitui underscores por espaços
  title = replaceAll(title, '_', ' ');
  
  // Substitui hífens por espaços
  title = replaceAll(title, '-', ' ');
  
  // Remove número inicial seguido de hífen ou espaço (ex: "1-", "1 ")
  title = title.replace(/^\d+\s*[- ]\s*/, '');
  
  // Divide em palavras
  var words = title.split(/\s+/);
  
  // Capitaliza cada palavra (primeira letra maiúscula, resto minúscula)
  var formattedWords = words.map(function(word) {
    if (word.length === 0) return word;
    
    // Converte palavra toda em maiúscula para formato título (ex: "JESUS" → "Jesus")
    if (word === word.toUpperCase() && word.length > 1) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Capitaliza palavra normal
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  // Junta as palavras com espaços
  title = formattedWords.join(' ');
  
  // Remove espaços múltiplos
  title = title.replace(/\s+/g, ' ').trim();
  
  return title;
}
(function () {
  var DEFAULT_MANIFEST = "manifest.json";
  var current_url_params = new URLSearchParams(location.href);

  if (current_url_params.has("href")) {
    console.log("Found manifest in params");
    var manifest_url = current_url_params.get("href");
  } else {
    current = window.location.href;
    current = current.replace("/index.html", "");
    current = current.replace("index.html", "");
    var manifest_url = current + "/" + DEFAULT_MANIFEST;
    console.log(manifest_url);
  }

  if (current_url_params.has("track")) {
    console.log("Found reference to a document in params");
    var track = current_url_params.get("track");
  } else {
    var track = undefined;
  }

  var audio = document.getElementById("audio-element");
  var audio_source = document.getElementById("audio-source");
  var cover = document.getElementById("cover");
  var next = document.getElementById("next");
  var previous = document.getElementById("previous");
  var ting = document.getElementById("current");
  
  // Elementos de progresso
  var currentTimeDisplay = document.getElementById("current-time");
  var totalTimeDisplay = document.getElementById("total-time");
  var audioProgressFill = document.getElementById("audio-progress-fill");
  var audioProgressBar = document.getElementById("audio-progress-bar");
  var courseProgressFill = document.getElementById("course-progress-fill");
  var courseProgressText = document.getElementById("course-progress-text");
  
  // Rastreamento de progresso do curso
  var completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
  var totalLessons = 34; // Total de aulas no curso
  var currentLessonIndex = -1; // Índice da aula atual (0-based)

  var saved_track = localStorage.getItem(manifest_url + "#track");
  var saved_position = localStorage.getItem(manifest_url + "#t");
  if (saved_position && saved_track) {
    console.log(
      "Found previous position at: " + saved_track + "#t=" + saved_position
    );
    initializeNavigation(manifest_url, saved_track)
      .then(function () {
        audio.currentTime = saved_position;
        updateAudioProgress();
        updateCourseProgress();
      })
      .catch(function () {});
  } else {
    initializeNavigation(manifest_url, track)
      .then(function() {
        updateCourseProgress();
      })
      .catch(function () {});
  }

  // Função para formatar tempo (segundos para MM:SS)
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + secs.toString().padStart(2, '0');
  }
  
  // Função para atualizar barra de progresso do áudio
  function updateAudioProgress() {
    if (!audio || !isFinite(audio.duration) || audio.duration <= 0) {
      if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
      if (totalTimeDisplay) totalTimeDisplay.textContent = '0:00';
      if (audioProgressFill) audioProgressFill.style.width = '0%';
      if (audioProgressBar) audioProgressBar.setAttribute('aria-valuenow', '0');
      return;
    }
    
    var current = audio.currentTime || 0;
    var duration = audio.duration;
    var percent = (current / duration) * 100;
    
    if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(current);
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(duration);
    if (audioProgressFill) audioProgressFill.style.width = percent + '%';
    if (audioProgressBar) {
      audioProgressBar.setAttribute('aria-valuenow', Math.round(percent));
    }
  }
  
  // Função para atualizar barra de progresso do curso
  function updateCourseProgress() {
    // Calcula progresso baseado na posição atual (índice + 1)
    // Se está na aula 15 (índice 14), mostra 15/34
    var currentPosition = currentLessonIndex >= 0 ? currentLessonIndex + 1 : 0;
    
    // Considera aulas concluídas ou posição atual, o que for maior
    var completed = completedLessons.length;
    var progress = Math.max(completed, currentPosition);
    
    // Limita ao total de aulas
    progress = Math.min(progress, totalLessons);
    
    var percent = totalLessons > 0 ? (progress / totalLessons) * 100 : 0;
    
    if (courseProgressFill) courseProgressFill.style.width = percent + '%';
    if (courseProgressText) {
      courseProgressText.textContent = progress + ' / ' + totalLessons + ' aulas';
    }
    if (document.getElementById('course-progress-bar')) {
      document.getElementById('course-progress-bar').setAttribute('aria-valuenow', Math.round(percent));
    }
  }
  
  // Permitir seek clicando na barra de progresso
  if (audioProgressBar) {
    audioProgressBar.addEventListener('click', function(e) {
      if (!audio || !isFinite(audio.duration) || audio.duration <= 0) return;
      
      var rect = e.currentTarget.getBoundingClientRect();
      var percent = (e.clientX - rect.left) / rect.width;
      var newTime = percent * audio.duration;
      audio.currentTime = Math.max(0, Math.min(audio.duration, newTime));
      updateAudioProgress();
    });
  }
  
  audio.addEventListener("timeupdate", function () {
    updateAudioProgress();
    if (Math.round(audio.currentTime) % 10 == 1) {
      localStorage.setItem(manifest_url + "#t", audio.currentTime);
    }
  });
  
  // Atualizar progresso quando metadados carregarem
  audio.addEventListener("loadedmetadata", function() {
    updateAudioProgress();
  });
  
  // Marcar aula como concluída quando terminar
  audio.addEventListener("ended", function () {
    // Marca a aula atual como concluída
    var currentTrack = audio_source.src;
    if (currentTrack && completedLessons.indexOf(currentTrack) === -1) {
      completedLessons.push(currentTrack);
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
      updateCourseProgress();
    }
    
    if (next.hasAttribute("href")) {
      updateTrack(manifest_url, next.href).then(function () {
        audio.play();
      });
    }
  });

  audio.addEventListener("ended", function () {
    if (next.hasAttribute("href")) {
      updateTrack(manifest_url, next.href).then(function () {
        audio.play();
      });
    }
  });

  next.addEventListener("click", function (event) {
    if (next.hasAttribute("href")) {
      updateTrack(manifest_url, next.href).then(function () {
        audio.play();
      });
    }
    event.preventDefault();
  });

  previous.addEventListener("click", function (event) {
    if (previous.hasAttribute("href")) {
      updateTrack(manifest_url, previous.href).then(function () {
        audio.play();
      });
    }
    event.preventDefault();
  });

  // Tratamento de erros no áudio
  audio.addEventListener('error', function (e) {
    var error = audio.error;
    var message = 'Erro ao carregar áudio';
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_NETWORK:
          message = 'Erro de rede ao carregar áudio. Verifique sua conexão.';
          break;
        case error.MEDIA_ERR_DECODE:
          message = 'Erro ao decodificar áudio. O arquivo pode estar corrompido.';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Formato de áudio não suportado pelo navegador.';
          break;
        default:
          message = 'Erro desconhecido ao carregar áudio.';
      }
    }
    
    console.error('Erro no áudio:', error);
    showError(message);
  });

  // Controle de velocidade de reprodução
  var speedControl = document.getElementById('playback-speed');
  if (speedControl) {
    speedControl.addEventListener('change', function () {
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

  // Botões Skip ±15s
  var skipBack = document.getElementById('skip-back');
  var skipForward = document.getElementById('skip-forward');
  
  function skipAudio(seconds) {
    // Verifica se o áudio está pronto
    if (audio.readyState === 0) {
      // Se ainda não iniciou, espera carregar
      audio.addEventListener('loadedmetadata', function handler() {
        audio.removeEventListener('loadedmetadata', handler);
        skipAudio(seconds);
      }, { once: true });
      return;
    }
    
    // Verifica se tem duração válida
    if (!isFinite(audio.duration) || audio.duration <= 0) {
      console.warn('Áudio ainda não tem duração válida');
      return;
    }
    
    // Calcula novo tempo
    var currentTime = audio.currentTime || 0;
    var newTime = currentTime + seconds;
    
    // Limita entre 0 e duração
    newTime = Math.max(0, Math.min(audio.duration, newTime));
    
    // Aplica o novo tempo
    if (newTime !== currentTime) {
      audio.currentTime = newTime;
    }
  }
  
  if (skipBack) {
    skipBack.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      skipAudio(-15);
    });
  }
  
  if (skipForward) {
    skipForward.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      skipAudio(15);
    });
  }

  // Função para atualizar materiais de referência
  function updateReferenceMaterials(audioHref) {
    var materialsContainer = document.getElementById('reference-materials');
    var linksContainer = document.getElementById('reference-links');
    var iframeContainer = document.getElementById('reference-iframe-container');
    var iframe = document.getElementById('reference-iframe');
    var useIframe = document.getElementById('use-iframe');
    var iframeError = document.getElementById('iframe-error');
    var openInNewTabBtn = document.getElementById('open-in-new-tab');
    var currentIframeUrl = '';
    
    if (!materialsContainer || !linksContainer) return;
    
    // Extrai o nome do arquivo (sem "audio/" e sem ".mp3")
    var filename = audioHref;
    if (filename.indexOf('audio/') === 0) {
      filename = filename.substring(6);
    }
    if (filename.indexOf('.mp3') === filename.length - 4) {
      filename = filename.substring(0, filename.length - 4);
    }
    
    // Busca materiais para esta aula
    var materials = referenceMaterials[filename] || [];
    
    if (materials.length === 0) {
      materialsContainer.style.display = 'none';
      return;
    }
    
    // Mostra o container
    materialsContainer.style.display = 'block';
    
    // Limpa links anteriores
    linksContainer.innerHTML = '';
    
    // Cria links
    materials.forEach(function(material) {
      var link = document.createElement('a');
      link.href = material.url;
      link.className = 'reference-link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = '<span class="reference-link-icon">' + (material.icon || '🔗') + '</span><span>' + material.title + '</span>';
      
      // Se iframe estiver ativado, abre no iframe
      if (useIframe && useIframe.checked) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          var url = material.url;
          if (iframeContainer) {
            iframeContainer.dataset.currentUrl = url;
          }
          if (iframe) {
            iframe.src = url;
            if (iframeError) iframeError.style.display = 'none';
          }
          if (openInNewTabBtn) {
            openInNewTabBtn.href = url;
          }
          iframeContainer.style.display = 'block';
          iframeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          
          // Timeout para detectar se o iframe foi bloqueado
          setTimeout(function() {
            try {
              // Tenta acessar o iframe para verificar se foi bloqueado
              if (iframe.contentWindow && iframe.contentWindow.location.href) {
                // Se conseguir acessar, está OK
                if (iframeError) iframeError.style.display = 'none';
              }
            } catch (e) {
              // Erro de cross-origin ou X-Frame-Options - mostra mensagem
              if (iframeError) {
                iframeError.style.display = 'block';
              }
            }
          }, 1000);
        });
      }
      
      linksContainer.appendChild(link);
    });
    
    // Handler para fechar iframe (só adiciona uma vez)
    var closeIframeBtn = document.getElementById('close-iframe');
    
    if (closeIframeBtn && !closeIframeBtn.dataset.listenerAdded) {
      closeIframeBtn.dataset.listenerAdded = 'true';
      closeIframeBtn.addEventListener('click', function() {
        iframeContainer.style.display = 'none';
        if (iframe) iframe.src = '';
        if (iframeContainer) iframeContainer.dataset.currentUrl = '';
        if (iframeError) iframeError.style.display = 'none';
      });
    }
    
    // Handler para abrir em nova aba
    if (openInNewTabBtn && !openInNewTabBtn.dataset.listenerAdded) {
      openInNewTabBtn.dataset.listenerAdded = 'true';
      openInNewTabBtn.addEventListener('click', function(e) {
        var url = iframeContainer ? iframeContainer.dataset.currentUrl : '';
        if (!url && openInNewTabBtn.href) {
          url = openInNewTabBtn.href;
        }
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    }
    
    // Handler para erro no iframe (X-Frame-Options)
    if (iframe && !iframe.dataset.errorListenerAdded) {
      iframe.dataset.errorListenerAdded = 'true';
      iframe.addEventListener('load', function() {
        // Tenta detectar se o iframe carregou com sucesso
        try {
          // Se conseguir acessar o conteúdo, não há erro
          if (iframe.contentWindow && iframe.contentWindow.location) {
            if (iframeError) iframeError.style.display = 'none';
          }
        } catch (e) {
          // Erro de cross-origin ou X-Frame-Options
          if (iframeError) {
            iframeError.style.display = 'block';
            if (openInNewTabBtn) {
              openInNewTabBtn.href = currentIframeUrl;
            }
          }
        }
      });
      
      // Listener adicional para detectar bloqueio
      iframe.addEventListener('error', function() {
        if (iframeError) {
          iframeError.style.display = 'block';
          if (openInNewTabBtn) {
            openInNewTabBtn.href = currentIframeUrl;
          }
        }
      });
    }
    
    // Handler para toggle iframe (só adiciona uma vez)
    if (useIframe && !useIframe.dataset.listenerAdded) {
      useIframe.dataset.listenerAdded = 'true';
      useIframe.addEventListener('change', function() {
        // Atualiza todos os links quando o toggle muda
        var links = linksContainer.querySelectorAll('.reference-link');
        links.forEach(function(link) {
          var url = link.href;
          var title = link.querySelector('span:last-child').textContent;
          var icon = link.querySelector('.reference-link-icon').textContent;
          
          // Remove link antigo
          link.remove();
          
          // Cria novo link
          var newLink = document.createElement('a');
          newLink.href = url;
          newLink.className = 'reference-link';
          newLink.innerHTML = '<span class="reference-link-icon">' + icon + '</span><span>' + title + '</span>';
          
          if (useIframe.checked) {
            newLink.addEventListener('click', function(e) {
              e.preventDefault();
              if (iframeContainer) {
                iframeContainer.dataset.currentUrl = url;
              }
              if (iframe) {
                iframe.src = url;
                if (iframeError) iframeError.style.display = 'none';
              }
              if (openInNewTabBtn) {
                openInNewTabBtn.href = url;
              }
              iframeContainer.style.display = 'block';
              iframeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              
              // Timeout para detectar se o iframe foi bloqueado
              setTimeout(function() {
                try {
                  if (iframe.contentWindow && iframe.contentWindow.location.href) {
                    if (iframeError) iframeError.style.display = 'none';
                  }
                } catch (e) {
                  if (iframeError) {
                    iframeError.style.display = 'block';
                  }
                }
              }, 1000);
            });
          } else {
            newLink.target = '_blank';
            newLink.rel = 'noopener noreferrer';
          }
          
          linksContainer.appendChild(newLink);
        });
      });
    }
  }

  function getManifest(url) {
    return fetch(url)
      .catch(function (error) {
        console.warn('Erro ao buscar manifest, tentando cache:', error);
        return caches.match(url);
      })
      .then(function (response) {
        if (!response) {
          throw new Error('Manifest não encontrado');
        }
        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        console.error('Erro ao processar manifest:', error);
        showError('Não foi possível carregar o curso. Verifique sua conexão e recarregue a página.');
        throw error;
      });
  }

  function showError(message) {
    var errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.style.margin = '20px';
    errorDiv.textContent = message;
    var main = document.querySelector('main');
    if (main) {
      main.insertBefore(errorDiv, main.firstChild);
    }
  }

  function announceTrackChange(trackName) {
    var status = document.getElementById('status');
    if (status) {
      status.textContent = 'Reproduzindo: ' + trackName;
    }
  }

  function initializeNavigation(url, track_url) {
    return getManifest(url)
      .then(function (json) {
        var title = json.metadata.title;
        console.log("Title of the publication: " + title);
        document.querySelector("title").textContent = title;

        //Search for cover and add it
        if (json.links) {
          json.links.forEach(function (link) {
            if (link.rel) {
              if (link.rel == "cover") {
                console.log("Found cover: " + link.href);
                // cover.src = new URL(link.href, url).href; // doesnt work coz default manifest is not a url
                cover.src = new URL(link.href).href;
              }
            }
          }, this);
        }

        return json.readingOrder;
      })
      .then(function (readingOrder) {
        // Atualiza total de aulas baseado no manifest
        totalLessons = readingOrder.length;
        
        //Set start track
        var start_url = new URL(readingOrder[0].href, url).href;

        if (track_url) {
          updateTrack(url, track_url);
        } else {
          updateTrack(url, start_url);
        }
      });
  }

  function updateTrack(url, current) {
    console.log("Getting " + url);
    if (current) {
      var current_src = current;
    } else {
      var current_src = audio_source.src;
    }
    return getManifest(url)
      .then(function (json) {
        return json.readingOrder;
      })
      .then(function (readingOrder) {
        var current_index = readingOrder.findIndex(function (element) {
          var element_url = new URL(element.href, url);
          return element_url.href == current_src;
        });
        temp = readingOrder[current_index].href;
        temp = formatTrackTitle(temp);
        ting.innerHTML = temp;
        announceTrackChange(temp);
        
        // Atualizar materiais de referência
        if (current_index >= 0) {
          updateReferenceMaterials(readingOrder[current_index].href);
        }
        
        if (current_index >= 0) {
          // Atualiza o índice da aula atual
          currentLessonIndex = current_index;
          
          audio_source.src = new URL(
            readingOrder[current_index].href,
            url
          ).href;
          localStorage.setItem(url + "#track", audio_source.src);
          audio_source.type = readingOrder[current_index].type;
          audio.load();
          
          // Atualizar progresso quando metadados carregarem
          audio.addEventListener('loadedmetadata', function handler() {
            audio.removeEventListener('loadedmetadata', handler);
            updateAudioProgress();
            updateCourseProgress();
          }, { once: true });

          if (current_index > 0) {
            console.log(
              "Previous track is: " + readingOrder[current_index - 1].href
            );
            previous.href = new URL(
              readingOrder[current_index - 1].href,
              url
            ).href;
          } else {
            previous.removeAttribute("href");
          }

          if (current_index < readingOrder.length - 1) {
            console.log(
              "Next track is: " + readingOrder[current_index + 1].href
            );
            next.href = new URL(readingOrder[current_index + 1].href, url).href;
          } else {
            next.removeAttribute("href");
          }
        }
      });
  }
})();
