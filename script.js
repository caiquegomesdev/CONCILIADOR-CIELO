(function() {
  'use strict';

  // ========== ELEMENTOS ==========
  const video = document.getElementById('video');
  const playerWrapper = document.getElementById('playerWrapper');
  const videoContainer = document.getElementById('videoContainer');
  const videoOverlay = document.getElementById('videoOverlay');
  const centerPlay = document.getElementById('centerPlay');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const rewindBtn = document.getElementById('rewindBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const prevFrameBtn = document.getElementById('prevFrameBtn');
  const nextFrameBtn = document.getElementById('nextFrameBtn');
  const muteBtn = document.getElementById('muteBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeTooltip = document.getElementById('volumeTooltip');
  const speedSelector = document.getElementById('speedSelector');
  const pipBtn = document.getElementById('pipBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const loopBtn = document.getElementById('loopBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFilled = document.getElementById('progressFilled');
  const progressBuffer = document.getElementById('progressBuffer');
  const timeTooltip = document.getElementById('timeTooltip');
  const timeDisplay = document.getElementById('timeDisplay');
  const filePicker = document.getElementById('filePicker');
  const downloadLink = document.getElementById('downloadLink');
  const videoLoading = document.getElementById('videoLoading');
  const videoError = document.getElementById('videoError');
  const themeToggle = document.getElementById('themeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');
  const thumbnailPreview = document.getElementById('thumbnailPreview');
  const thumbCanvas = document.getElementById('thumbCanvas');
  const thumbTime = document.getElementById('thumbTime');
  const playlist = document.getElementById('playlist');
  const controlsWrapper = document.getElementById('controlsWrapper');

  // Stats
  const resolutionEl = document.getElementById('resolution');
  const framerateEl = document.getElementById('framerate');
  const formatEl = document.getElementById('format');
  const durationEl = document.getElementById('duration');
  const bitrateEl = document.getElementById('bitrate');
  const filesizeEl = document.getElementById('filesize');
  const codecEl = document.getElementById('codec');
  const audioCodecEl = document.getElementById('audioCodec');

  // ========== ESTADO ==========
  let hideControlsTimeout;
  let currentFileSize = 0;
  let isLooping = false;
  let isDragging = false;
  let wasPlayingBeforeDrag = false;
  let playlistData = [];
  let currentPlaylistIndex = -1;
  let toastContainer = null;

  // ========== UTILITÁRIOS ==========
  function formatTime(seconds) {
    if (!isFinite(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  function showToast(message, type = 'info') {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ========== TEMA ==========
  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('terwal-theme', theme);
    iconSun.style.display = theme === 'dark' ? 'none' : 'block';
    iconMoon.style.display = theme === 'dark' ? 'block' : 'none';
  }

  themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  const savedTheme = localStorage.getItem('terwal-theme') || 'light';
  setTheme(savedTheme);

  // ========== REPRODUÇÃO ==========
  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function updatePlayButton() {
    const playIcon = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const pauseIcon = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    playPauseBtn.innerHTML = video.paused ? playIcon : pauseIcon;
    centerPlay.innerHTML = video.paused ? playIcon : pauseIcon;
    centerPlay.style.opacity = video.paused ? '1' : '';
  }

  // ========== PROGRESSO ==========
  function updateTime() {
    const current = video.currentTime || 0;
    const duration = video.duration || 0;
    const percent = duration ? (current / duration) * 100 : 0;
    progressFilled.style.width = `${percent}%`;
    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }

  function updateBuffer() {
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const percent = (bufferedEnd / video.duration) * 100;
      progressBuffer.style.width = `${percent}%`;
    }
  }

  function seek(e) {
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
    updateTime();
  }

  function showTooltip(e) {
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pos * video.duration;
    timeTooltip.textContent = formatTime(time);
    timeTooltip.style.left = `${(pos * 100)}%`;
  }

  // Thumbnail preview na timeline
  function showThumbnailPreview(e) {
    if (!video.videoWidth) return;
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pos * video.duration;

    thumbCanvas.width = 160;
    thumbCanvas.height = 90;
    const ctx = thumbCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 160, 90);
    thumbTime.textContent = formatTime(time);

    thumbnailPreview.style.display = 'flex';
    thumbnailPreview.style.left = `${e.clientX - rect.left}px`;
  }

  function hideThumbnailPreview() {
    thumbnailPreview.style.display = 'none';
  }

  // ========== VOLUME ==========
  function updateVolume() {
    video.volume = parseFloat(volumeSlider.value);
    video.muted = video.volume === 0;
    volumeTooltip.textContent = Math.round(video.volume * 100) + '%';
    updateMuteButton();
  }

  function updateMuteButton() {
    const volHigh = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    const volLow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    const volMute = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

    muteBtn.innerHTML = video.muted || video.volume === 0 ? volMute : 
                        video.volume < 0.5 ? volLow : volHigh;
  }

  function toggleMute() {
    video.muted = !video.muted;
    if (video.muted) {
      volumeSlider.dataset.prevValue = volumeSlider.value;
      volumeSlider.value = 0;
    } else {
      volumeSlider.value = volumeSlider.dataset.prevValue || 1;
      video.volume = parseFloat(volumeSlider.value);
    }
    updateMuteButton();
  }

  // ========== VELOCIDADE ==========
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  function changeSpeed() {
    video.playbackRate = parseFloat(speedSelector.value);
    showToast(`Velocidade: ${speedSelector.value}×`, 'info');
  }

  function increaseSpeed() {
    const currentIndex = speeds.indexOf(video.playbackRate);
    if (currentIndex < speeds.length - 1) {
      video.playbackRate = speeds[currentIndex + 1];
      speedSelector.value = video.playbackRate;
      showToast(`Velocidade: ${video.playbackRate}×`, 'info');
    }
  }

  function decreaseSpeed() {
    const currentIndex = speeds.indexOf(video.playbackRate);
    if (currentIndex > 0) {
      video.playbackRate = speeds[currentIndex - 1];
      speedSelector.value = video.playbackRate;
      showToast(`Velocidade: ${video.playbackRate}×`, 'info');
    }
  }

  // ========== LOOP ==========
  function toggleLoop() {
    isLooping = !isLooping;
    video.loop = isLooping;
    loopBtn.classList.toggle('active', isLooping);
    showToast(isLooping ? 'Loop ativado' : 'Loop desativado', 'info');
  }

  // ========== FULLSCREEN & PIP ==========
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      playerWrapper.requestFullscreen().catch(err => {
        showToast('Fullscreen não disponível', 'error');
      });
    } else {
      document.exitFullscreen();
    }
  }

  async function togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
        await video.requestPictureInPicture();
        showToast('Picture-in-Picture ativado', 'success');
      }
    } catch (err) {
      showToast('PiP não disponível', 'error');
    }
  }

  // ========== QUADROS ==========
  function stepFrame(direction) {
    if (video.readyState >= 2) {
      video.pause();
      const frameTime = 1 / (video.getVideoPlaybackQuality?.().totalVideoFrames / video.duration || 30);
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + direction * frameTime));
    }
  }

  // ========== CONTROLES VISÍVEIS ==========
  function showControls() {
    const isFullscreen = !!document.fullscreenElement;
    if (isFullscreen) {
      playerWrapper.classList.add('show-controls');
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = setTimeout(() => {
        playerWrapper.classList.remove('show-controls');
      }, 3500);
    } else {
      videoContainer.classList.add('show-controls');
      clearTimeout(hideControlsTimeout);
      if (!video.paused) {
        hideControlsTimeout = setTimeout(() => {
          videoContainer.classList.remove('show-controls');
        }, 3500);
      }
    }
  }

  // ========== ESTATÍSTICAS ==========
  function updateStats() {
    if (video.videoWidth && video.videoHeight) {
      resolutionEl.textContent = `${video.videoWidth}×${video.videoHeight}`;
    }

    if (video.duration) {
      durationEl.textContent = formatTime(video.duration);
    }

    const source = video.currentSrc;
    if (source) {
      const ext = source.split('.').pop().split('?')[0].toUpperCase();
      formatEl.textContent = ext;
    }

    if (currentFileSize > 0) {
      filesizeEl.textContent = formatBytes(currentFileSize);
      if (video.duration && currentFileSize > 0) {
        const bitrate = (currentFileSize * 8) / video.duration;
        bitrateEl.textContent = `${(bitrate / 1000000).toFixed(2)} Mbps`;
      }
    }

    // Tentar detectar codecs
    if (video.src) {
      const mime = video.currentType || '';
      if (mime.includes('avc') || mime.includes('h264')) codecEl.textContent = 'H.264';
      else if (mime.includes('hevc') || mime.includes('h265')) codecEl.textContent = 'H.265';
      else if (mime.includes('vp9')) codecEl.textContent = 'VP9';
      else if (mime.includes('av1')) codecEl.textContent = 'AV1';
      else codecEl.textContent = 'Desconhecido';
    }

    framerateEl.textContent = '~30 fps';
  }

  // ========== PLAYLIST ==========
  function addToPlaylist(file) {
    const url = URL.createObjectURL(file);
    const item = {
      name: file.name,
      size: file.size,
      url: url,
      type: file.type
    };
    playlistData.push(item);
    renderPlaylist();

    if (playlistData.length === 1) {
      loadPlaylistItem(0);
    }
  }

  function renderPlaylist() {
    playlist.innerHTML = '';
    playlistData.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `playlist-item${index === currentPlaylistIndex ? ' active' : ''}`;
      el.innerHTML = `
        <div class="playlist-thumb" style="background:linear-gradient(135deg,var(--terwal-blue),var(--terwal-light))"></div>
        <div class="playlist-info">
          <div class="playlist-title">${item.name}</div>
          <div class="playlist-meta">${formatBytes(item.size)}</div>
        </div>
        <button class="playlist-remove" data-index="${index}" title="Remover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.playlist-remove')) {
          loadPlaylistItem(index);
        }
      });
      el.querySelector('.playlist-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromPlaylist(index);
      });
      playlist.appendChild(el);
    });
  }

  function loadPlaylistItem(index) {
    if (index < 0 || index >= playlistData.length) return;
    currentPlaylistIndex = index;
    const item = playlistData[index];
    video.src = item.url;
    video.play().catch(() => {});
    currentFileSize = item.size;
    downloadLink.href = item.url;
    downloadLink.download = item.name;
    renderPlaylist();
    showToast(`Reproduzindo: ${item.name}`, 'info');
  }

  function removeFromPlaylist(index) {
    URL.revokeObjectURL(playlistData[index].url);
    playlistData.splice(index, 1);
    if (currentPlaylistIndex === index) {
      currentPlaylistIndex = -1;
      video.src = '';
    } else if (currentPlaylistIndex > index) {
      currentPlaylistIndex--;
    }
    renderPlaylist();
  }

  // ========== CARREGAR ARQUIVO ==========
  function loadFile(file) {
    addToPlaylist(file);
  }

  // ========== DRAG & DROP ==========
  ['dragenter', 'dragover'].forEach(evt => {
    playerWrapper.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      playerWrapper.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    playerWrapper.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      playerWrapper.classList.remove('dragging');
    });
  });

  playerWrapper.addEventListener('drop', e => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    files.forEach(loadFile);
    if (files.length > 0) {
      showToast(`${files.length} vídeo(s) adicionado(s)`, 'success');
    }
  });

  filePicker.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      loadFile(file);
      showToast('Vídeo carregado', 'success');
    }
    filePicker.value = '';
  });

  // ========== EVENT LISTENERS - VÍDEO ==========
  playPauseBtn.addEventListener('click', togglePlay);
  centerPlay.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('play', updatePlayButton);
  video.addEventListener('pause', updatePlayButton);
  video.addEventListener('ended', () => {
    updatePlayButton();
    if (isLooping) {
      video.currentTime = 0;
      video.play();
    } else if (currentPlaylistIndex < playlistData.length - 1) {
      loadPlaylistItem(currentPlaylistIndex + 1);
    }
  });
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('progress', updateBuffer);
  video.addEventListener('loadedmetadata', () => {
    updateStats();
    updateTime();
  });
  video.addEventListener('waiting', () => {
    videoLoading.style.display = 'flex';
  });
  video.addEventListener('canplay', () => {
    videoLoading.style.display = 'none';
  });
  video.addEventListener('error', () => {
    videoLoading.style.display = 'none';
    videoError.style.display = 'flex';
    formatEl.textContent = 'Erro';
    showToast('Erro ao carregar vídeo', 'error');
  });
  video.addEventListener('loadstart', () => {
    videoError.style.display = 'none';
  });

  // ========== CONTROLS EVENTS ==========
  rewindBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
    showToast('-10s', 'info');
  });

  forwardBtn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    showToast('+10s', 'info');
  });

  prevFrameBtn.addEventListener('click', () => stepFrame(-1));
  nextFrameBtn.addEventListener('click', () => stepFrame(1));
  muteBtn.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', updateVolume);
  speedSelector.addEventListener('change', changeSpeed);
  pipBtn.addEventListener('click', togglePiP);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  loopBtn.addEventListener('click', toggleLoop);

  // Progress bar events
  progressBar.addEventListener('click', seek);
  progressBar.addEventListener('mousemove', showTooltip);
  progressBar.addEventListener('mouseenter', () => {
    progressBar.addEventListener('mousemove', showThumbnailPreview);
  });
  progressBar.addEventListener('mouseleave', () => {
    hideThumbnailPreview();
    progressBar.removeEventListener('mousemove', showThumbnailPreview);
  });

  // Drag na timeline
  progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    wasPlayingBeforeDrag = !video.paused;
    video.pause();
    seek(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      seek(e);
      showTooltip(e);
    }
  });
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      if (wasPlayingBeforeDrag) video.play();
    }
  });

  // Hover controls
  videoContainer.addEventListener('mousemove', showControls);
  playerWrapper.addEventListener('mousemove', showControls);
  controlsWrapper.addEventListener('mouseenter', () => {
    clearTimeout(hideControlsTimeout);
  });

  // ========== TECLADO ==========
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;

    const key = e.key.toLowerCase();
    const shift = e.shiftKey;

    switch(key) {
      case 'k':
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'j':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 10);
        showToast('-10s', 'info');
        break;
      case 'l':
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showToast('+10s', 'info');
        break;
      case 'arrowleft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'arrowright':
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
        break;
      case 'arrowup':
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.05);
        volumeSlider.value = video.volume;
        updateMuteButton();
        break;
      case 'arrowdown':
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.05);
        volumeSlider.value = video.volume;
        updateMuteButton();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'p':
        e.preventDefault();
        togglePiP();
        break;
      case 't':
        e.preventDefault();
        themeToggle.click();
        break;
      case '0':
      case 'home':
        e.preventDefault();
        video.currentTime = 0;
        break;
      case 'end':
        e.preventDefault();
        video.currentTime = video.duration;
        break;
      case ',':
        if (shift) {
          e.preventDefault();
          decreaseSpeed();
        } else {
          e.preventDefault();
          stepFrame(-1);
        }
        break;
      case '.':
        if (shift) {
          e.preventDefault();
          increaseSpeed();
        } else {
          e.preventDefault();
          stepFrame(1);
        }
        break;
      case 'l':
        if (shift) {
          e.preventDefault();
          toggleLoop();
        }
        break;
    }
  });

  // Atalho Ctrl+O para abrir arquivo
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      filePicker.click();
    }
  });

  // ========== INICIALIZAÇÃO ==========
  const defaultVideo = 'video.mp4';
  downloadLink.href = defaultVideo;
  downloadLink.download = defaultVideo.split('/').pop();

  updatePlayButton();
  updateMuteButton();

  // Atualizar stats periodicamente
  setInterval(() => {
    if (!video.paused && video.readyState >= 2) {
      updateStats();
    }
  }, 3000);

  // Detectar taxa de quadros real
  let lastTime = 0;
  let frameCount = 0;
  video.addEventListener('timeupdate', () => {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round(frameCount * 1000 / (now - lastTime));
      if (fps > 0) framerateEl.textContent = fps + ' fps';
      frameCount = 0;
      lastTime = now;
    }
  });

  console.log('🎬 Terwal Player v2.0 iniciado');
})();
