/* =====================================================
   Site — js/principal.js
   Eventos compartilhados entre as páginas:
   navegação ativa, ano do rodapé e formulário de contato.
   ===================================================== */
(function () {
  'use strict';

  /* ---------- Tema de cores: aplica o par de personagens salvo em qualquer página ---------- */
  var TEMAS_VALIDOS = ['espaco', 'pets', 'comida'];
  var temaSalvo = null;
  try {
    temaSalvo = localStorage.getItem('jv-personagens');
  } catch (erro) {
    temaSalvo = null;
  }
  if (TEMAS_VALIDOS.indexOf(temaSalvo) !== -1) {
    document.body.setAttribute('data-tema', temaSalvo);
  }

  /* ---------- Marca o link da página atual na navbar ---------- */
  var linksNav = document.querySelectorAll('.navbar-nav .nav-link');
  var paginaAtual = location.pathname.split('/').pop() || 'index.html';
  if (paginaAtual === '') paginaAtual = 'index.html';

  for (var i = 0; i < linksNav.length; i++) {
    var href = (linksNav[i].getAttribute('href') || '').split('/').pop();
    if (href === paginaAtual) {
      linksNav[i].classList.add('active');
    }
  }

  /* ---------- Ano automático no rodapé ---------- */
  var anoEl = document.getElementById('anoAtual');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* ---------- Formulário de contato (validação no lado cliente) ---------- */
  var form = document.getElementById('formContato');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var campoNome = document.getElementById('campoNome');
    var campoEmail = document.getElementById('campoEmail');
    var campoMensagem = document.getElementById('campoMensagem');
    var alerta = document.getElementById('alertaContato');

    var nome = campoNome.value.trim();
    var email = campoEmail.value.trim();
    var mensagem = campoMensagem.value.trim();

    alerta.classList.remove('d-none', 'alert-success', 'alert-warning');

    if (!nome || !email || !mensagem) {
      alerta.classList.add('alert-warning');
      alerta.textContent = 'Preencha todos os campos antes de enviar.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alerta.classList.add('alert-warning');
      alerta.textContent = 'Digite um e-mail válido, exemplo: nome@exemplo.com.br.';
      return;
    }

    alerta.classList.add('alert-success');
    alerta.textContent = 'Mensagem enviada com sucesso! Obrigado, ' + nome + '. Em breve retornaremos o contato.';
    form.reset();
  });
})();
