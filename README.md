# 🎬 Terwal Treinamento — Player de Vídeo

Um player de vídeo moderno, leve e completo para treinamentos e conciliações, desenvolvido com HTML5, CSS3 e JavaScript vanilla.

![Preview](preview.png)

---

## ✨ Funcionalidades

### Reprodução
- ▶️ Play/Pause com clique no vídeo ou tecla `K` / `Espaço`
- ⏪ Retroceder 10s (`J`) | ⏩ Avançar 10s (`L`)
- ⏮️ Retroceder 5s (`←`) | ⏭️ Avançar 5s (`→`)
- 🎞️ Navegação quadro a quadro (`,` e `.`)
- 🔁 Loop contínuo (`Shift + L`)
- ⚡ Velocidade de reprodução: 0.25× até 2×

### Controles
- 🔊 Volume com slider expansível e tooltip de porcentagem
- 🔇 Mudo rápido (`M`)
- 🖼️ Picture-in-Picture (`P`)
- ⛶ Tela cheia (`F`)
- 📊 Timeline com preview de thumbnail ao passar o mouse
- 📥 Barra de progresso com buffer visual

### Arquivos
- 📂 Abrir arquivo local (`Ctrl + O`)
- 🖱️ Drag & Drop com overlay visual
- 📋 Playlist com múltiplos vídeos
- ⬇️ Download do vídeo atual

### Interface
- 🌗 Tema claro/escuro com persistência (`T`)
- 📱 Totalmente responsivo (desktop, tablet, mobile)
- ♿ Suporte a `prefers-reduced-motion`
- 🔔 Notificações toast para feedback

### Estatísticas
- Resolução, taxa de quadros (FPS real), formato
- Duração, taxa de bits, tamanho do arquivo
- Codecs de vídeo e áudio

---

## 🚀 Como Usar

### Opção 1: Abrir diretamente
```bash
# Basta abrir o index.html no navegador
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

### Opção 2: Servidor local (recomendado)
```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```
Acesse: `http://localhost:8080`

---

## 📁 Estrutura do Projeto

```
terwal-player/
├── index.html          # Estrutura principal
├── styles.css          # Estilos e temas
├── script.js           # Lógica do player
├── icon.png            # Ícone do aplicativo
└── video.mp4           # Vídeo padrão (opcional)
```

---

## ⌨️ Atalhos de Teclado

| Ação | Atalho |
|------|--------|
| Play/Pause | `K` ou `Espaço` |
| Retroceder 10s | `J` |
| Avançar 10s | `L` |
| Retroceder 5s | `←` |
| Avançar 5s | `→` |
| Quadro anterior | `,` |
| Próximo quadro | `.` |
| Aumentar volume | `↑` |
| Diminuir volume | `↓` |
| Mudo | `M` |
| Tela cheia | `F` |
| Picture-in-Picture | `P` |
| Velocidade + | `Shift + >` |
| Velocidade − | `Shift + <` |
| Loop | `Shift + L` |
| Início do vídeo | `Home` ou `0` |
| Fim do vídeo | `End` |
| Alternar tema | `T` |
| Abrir arquivo | `Ctrl + O` |

---

## 🎨 Temas

O player detecta automaticamente a preferência do sistema e permite alternar manualmente:

- **Claro**: Fundo suave com acentos azuis
- **Escuro**: Fundo escuro com acentos ciano

A preferência é salva no `localStorage`.

---

## 🛠️ Tecnologias

- **HTML5** — Semântica e acessibilidade
- **CSS3** — Variáveis, Grid, Flexbox, animações
- **JavaScript ES6+** — Módulos, APIs modernas
- **APIs do Navegador**:
  - Fullscreen API
  - Picture-in-Picture API
  - File API (drag & drop)
  - Media API

---

## 📱 Compatibilidade

| Navegador | Versão mínima |
|-----------|---------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

> ⚠️ Picture-in-Picture pode não estar disponível em todos os navegadores.

---

## 📄 Licença

Projeto desenvolvido para uso interno da **Terwal Treinamento Conciliador**.

---

<p align="center">
  <sub>Feito com 💙 pela equipe Terwal</sub>
</p>
