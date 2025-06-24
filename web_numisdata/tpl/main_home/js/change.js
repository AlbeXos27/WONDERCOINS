
    document.getElementById('btn-change').addEventListener('click', function() {

      let elemento1 = document.getElementById('text');
      let elemento2 = document.getElementById('main');
      let elemento3 = document.getElementById('fondo');
      let elemento4 = document.getElementById('btn-change');
      let elemento5 = document.getElementById('fondo2');

      // Aplicamos la animación
      elemento1.classList.add('left');
      elemento2.classList.add('opacidad');
      elemento4.classList.add('right');

      // Después de 500ms (duración de la animación), aplicamos display: none
      setTimeout(() => {
        elemento1.classList.add('oculto');
        elemento4.classList.add('oculto');
      }, 1000); // El tiempo debe coincidir con el transition
      setTimeout(() => {
        elemento2.classList.add('ocultar-fondo');
        elemento2.classList.remove('opacidad');
        elemento3.classList.remove('oculto');
        elemento3.classList.add('ima_fondo');
        elemento5.classList.remove('oculto');
        elemento5.classList.add('moneda');
      }, 1050); // El tiempo debe coincidir con el transition
      setTimeout(() => {
        elemento3.classList.add('show');
        elemento5.classList.add('show');
      }, 1060); // El tiempo debe coincidir con el transition
    });
