/* =====================================================
   Jogo da Velha — js/jogo.js
   Lógica do tabuleiro, placar e escolha de personagens.
   Os personagens são imagens SVG livres em /assets.
   ===================================================== */
(function () {
  'use strict';

  /* ---- Catálogo de personagens (edite os caminhos aqui) ---- */
  var PERSONAGENS = {
    espaco: { rotulo: 'Foguete × Alien',      x: 'assets/foguete.svg',   o: 'assets/alien.svg' },
    pets:   { rotulo: 'Gato × Cachorro',      x: 'assets/gato.svg',      o: 'assets/cachorro.svg' },
    comida: { rotulo: 'Pizza × Fantasma',     x: 'assets/pizza.svg',     o: 'assets/fantasma.svg' }
  };

  var COMBINACOES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
    [0, 4, 8], [2, 4, 6]             // diagonais
  ];

  function criaTabuleiro() {
    return ['', '', '', '', '', '', '', '', ''];
  }

  /* Verifica o tabuleiro e retorna o vencedor e a linha vencedora. */
  function verificarVencedor(tab) {
    for (var i = 0; i < COMBINACOES.length; i++) {
      var c = COMBINACOES[i];
      if (tab[c[0]] !== '' && tab[c[0]] === tab[c[1]] && tab[c[0]] === tab[c[2]]) {
        return { simbolo: tab[c[0]], linha: c };
      }
    }
    return null;
  }

  function houveEmpate(tab) {
    for (var i = 0; i < tab.length; i++) {
      if (tab[i] === '') return false;
    }
    return true;
  }

  /* Expõe as funções puras para testes automatizados (Node) */
  if (typeof globalThis !== 'undefined') {
    globalThis.JV = {
      verificarVencedor: verificarVencedor,
      houveEmpate: houveEmpate,
      COMBINACOES: COMBINACOES
    };
  }

  /* ---- Daqui para baixo só executa no navegador ---- */
  if (typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', function () {
    var celulas = document.querySelectorAll('[data-celula]');
    if (!celulas.length) return;

    var statusTexto = document.getElementById('statusJogo');
    var pontosX = document.getElementById('pontosX');
    var pontosO = document.getElementById('pontosO');
    var pontosEmpate = document.getElementById('pontosEmpate');
    var rotX = document.getElementById('rotuloX');
    var rotO = document.getElementById('rotuloO');
    var imgRotX = document.getElementById('imgRotuloX');
    var imgRotO = document.getElementById('imgRotuloO');
    var btnReiniciar = document.getElementById('btnReiniciar');
    var btnZerar = document.getElementById('btnZerar');
    var botoesPar = document.querySelectorAll('[data-par]');

    var parId = localStorage.getItem('jv-personagens') || 'espaco';
    if (!PERSONAGENS[parId]) parId = 'espaco';

    /* Aplica a cor de fundo do site conforme o par de imagens escolhido */
    document.body.setAttribute('data-tema', parId);

    var placar;
    try {
      placar = JSON.parse(localStorage.getItem('jv-placar')) || { x: 0, o: 0, empates: 0 };
    } catch (erro) {
      placar = { x: 0, o: 0, empates: 0 };
    }

    var tabuleiro = criaTabuleiro();
    var jogadorAtual = 'X';
    var jogoAtivo = true;

    function imagensDoPar() { return PERSONAGENS[parId]; }

    function salvarPlacar() {
      localStorage.setItem('jv-placar', JSON.stringify(placar));
    }

    function imagemSimbolo(simbolo) {
      var par = imagensDoPar();
      return simbolo === 'X' ? par.x : par.o;
    }

    function rotuloSimbolo(simbolo) {
      var nomes = PERSONAGENS[parId].rotulo.split(' × ');
      return simbolo === 'X' ? nomes[0] : nomes[1];
    }

    function pintarCelula(celula, simbolo) {
      celula.innerHTML = '';
      if (!simbolo) return;
      var img = document.createElement('img');
      img.src = imagemSimbolo(simbolo);
      img.alt = simbolo;
      celula.appendChild(img);
    }

    function atualizarPlacar() {
      pontosX.textContent = placar.x;
      pontosO.textContent = placar.o;
      pontosEmpate.textContent = placar.empates;
      rotX.textContent = rotuloSimbolo('X');
      rotO.textContent = rotuloSimbolo('O');
      imgRotX.src = imagensDoPar().x;
      imgRotO.src = imagensDoPar().o;
      for (var i = 0; i < botoesPar.length; i++) {
        botoesPar[i].classList.toggle('ativa', botoesPar[i].getAttribute('data-par') === parId);
      }
    }

    function statusVez() {
      statusTexto.textContent = 'Vez de ' + rotuloSimbolo(jogadorAtual) + ' (' + jogadorAtual + ')';
    }

    function reiniciarPartida() {
      tabuleiro = criaTabuleiro();
      jogoAtivo = true;
      jogadorAtual = 'X';
      for (var i = 0; i < celulas.length; i++) {
        celulas[i].innerHTML = '';
        celulas[i].classList.remove('ocupada', 'vencedora');
      }
      statusVez();
    }

    for (var i = 0; i < celulas.length; i++) {
      (function (celula, indice) {
        celula.addEventListener('click', function () {
          if (!jogoAtivo || tabuleiro[indice] !== '') return;

          tabuleiro[indice] = jogadorAtual;
          pintarCelula(celula, jogadorAtual);
          celula.classList.add('ocupada');

          var resultado = verificarVencedor(tabuleiro);
          if (resultado) {
            jogoAtivo = false;
            for (var k = 0; k < resultado.linha.length; k++) {
              celulas[resultado.linha[k]].classList.add('vencedora');
            }
            if (jogadorAtual === 'X') placar.x++; else placar.o++;
            salvarPlacar();
            atualizarPlacar();
            statusTexto.textContent = rotuloSimbolo(jogadorAtual) + ' venceu a partida!';
            return;
          }

          if (houveEmpate(tabuleiro)) {
            jogoAtivo = false;
            placar.empates++;
            salvarPlacar();
            atualizarPlacar();
            statusTexto.textContent = 'Empate! Deu velha.';
            return;
          }

          jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
          statusVez();
        });
      })(celulas[i], i);
    }

    btnReiniciar.addEventListener('click', reiniciarPartida);

    btnZerar.addEventListener('click', function () {
      placar = { x: 0, o: 0, empates: 0 };
      salvarPlacar();
      atualizarPlacar();
      reiniciarPartida();
      statusTexto.textContent = 'Placar zerado. Boa partida!';
    });

    for (var j = 0; j < botoesPar.length; j++) {
      botoesPar[j].addEventListener('click', function () {
        parId = this.getAttribute('data-par');
        localStorage.setItem('jv-personagens', parId);
        document.body.setAttribute('data-tema', parId);
        reiniciarPartida();
        atualizarPlacar();
      });
    }

    atualizarPlacar();
    statusVez();
  });
})();
