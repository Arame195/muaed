/* =========================================================
   MUAED · P2P — MAIN JS
   ========================================================= */

(function () {
  'use strict';


  /* =======================================================
     1. REVEAL ANIMATIONS
     ======================================================= */

  function initReveal() {
    const elements = document.querySelectorAll('.reveal');

    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      elements.forEach((el) => observer.observe(el));

      // Failsafe — показываем элементы, если observer не сработал
      window.addEventListener('load', function () {
        setTimeout(function () {
          document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
            const rect = el.getBoundingClientRect();

            if (rect.top < window.innerHeight * 1.5) {
              el.classList.add('in');
            }
          });
        }, 600);
      });

    } else {
      elements.forEach((el) => el.classList.add('in'));
    }
  }


  /* =======================================================
     2. SIDE NAV — ACTIVE SECTION
     ======================================================= */

  function initRailNavigation() {
    const railLinks = document.querySelectorAll('.rail a');

    if (!railLinks.length) return;

    const sectionIds = [
      'hero',
      'what',
      'program',
      'how',
      'author',
      'pricing',
      'faq'
    ];

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          railLinks.forEach((link) => {
            const section = link.getAttribute('data-sec');

            link.classList.toggle(
              'active',
              section === entry.target.id
            );
          });
        });
      },
      {
        threshold: 0.4,
        rootMargin: '-20% 0px -50% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));
  }


  /* =======================================================
     3. LIGHTBOX
     ======================================================= */

  function initLightbox() {
    const lightbox = document.getElementById('lb');
    const image = document.getElementById('lb-img');
    const scroll = document.getElementById('lb-scroll');

    // Если lightbox отсутствует — просто ничего не делаем
    if (!lightbox || !image || !scroll) return;


    window.openLB = function (element) {
      if (!element) return;

      const sourceImage = element.querySelector('img');

      if (!sourceImage) return;

      image.src = sourceImage.src;
      image.classList.remove('zoomed');

      lightbox.classList.add('open');

      document.body.style.overflow = 'hidden';

      scroll.scrollTop = 0;
      scroll.scrollLeft = 0;
    };


    window.closeLB = function (event) {
      if (event) {
        event.stopPropagation();
      }

      lightbox.classList.remove('open');

      image.classList.remove('zoomed');

      document.body.style.overflow = '';
    };


    image.addEventListener('click', function (event) {
      event.stopPropagation();

      image.classList.toggle('zoomed');
    });


    lightbox.addEventListener('click', function () {
      window.closeLB();
    });


    scroll.addEventListener('click', function (event) {
      if (event.target === scroll) {
        window.closeLB();
      }
    });
  }


  /* =======================================================
     4. MOBILE BURGER MENU
     ======================================================= */

  function initMobileMenu() {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mnav');

    // Главное: не падаем с JS-ошибкой,
    // если один из элементов отсутствует
    if (!burger || !menu) {
      console.warn(
        'Mobile menu: не найден #burger или #mnav'
      );
      return;
    }


    window.toggleMnav = function () {
      const isOpen = menu.classList.toggle('open');

      burger.classList.toggle('on', isOpen);

      document.body.style.overflow = isOpen
        ? 'hidden'
        : '';
    };


    window.closeMnav = function () {
      menu.classList.remove('open');

      burger.classList.remove('on');

      document.body.style.overflow = '';
    };


    // Закрытие по Escape
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        window.closeMnav();
      }
    });


    // Закрытие при клике по затемнению
    menu.addEventListener('click', function (event) {
      if (event.target === menu) {
        window.closeMnav();
      }
    });


    // Закрытие после клика по ссылке
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        window.closeMnav();
      });
    });
  }


  /* =======================================================
     5. TARIFF / GCM POPUP
     ======================================================= */

  const tariffs = {
    '1578213': {
      tag: 'Тариф Мини продукт',
      title: 'Мини продукт',
      subtitle: 'Разобраться самостоятельно',
      newPrice: '7 990 руб.',
      oldPrice: '15 990 руб.',
      scriptId: '24bbdec7788a3e0f66fdd4070a9ab1fdd8ac8722'
    },

    '1578236': {
      tag: 'Тариф С куратором',
      title: 'С куратором',
      subtitle: 'Новичку с опорой и разборами',
      newPrice: '13 990 руб.',
      oldPrice: '27 990 руб.',
      scriptId: 'c7cd0ff2788f1f8a522ba3bc1d8b18d7ecc500ac'
    },

    '1578240': {
      tag: 'Тариф С Киллой VIP',
      title: 'С Киллой VIP',
      subtitle: 'Максимум личного внимания',
      newPrice: '27 990 руб.',
      oldPrice: '49 990 руб.',
      scriptId: 'e9ed6ad12c63d74bc246dfc059404fa329bacb3a'
    }
  };


  const builtTariffs = {};


  function showTariff(id) {
    Object.keys(tariffs).forEach(function (tariffId) {
      const slot = document.getElementById(
        'slot-' + tariffId
      );

      if (!slot) return;

      slot.classList.toggle(
        'hide',
        tariffId !== id
      );
    });
  }


  function buildTariff(id) {
    const tariff = tariffs[id];

    const slot = document.getElementById(
      'slot-' + id
    );

    if (!tariff || !slot) {
      console.warn(
        'Tariff slot not found:',
        id
      );

      return;
    }


    // Защита от повторного создания iframe
    if (slot.querySelector('iframe')) {
      return;
    }


    const iframe = document.createElement('iframe');

    iframe.setAttribute('scrolling', 'yes');

    iframe.style.cssText = [
      'width:100%',
      'border:0',
      'display:block',
      'min-height:520px'
    ].join(';');


    slot.appendChild(iframe);


    const iframeDocument =
      iframe.contentWindow.document;


    const html = `
      <!doctype html>

      <html>

      <head>
        <meta charset="utf-8">

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        >

        <style>
          body {
            margin: 0;
            padding: 8px 4px;
            font-family:
              system-ui,
              -apple-system,
              sans-serif;
            background: #fff;
          }
        </style>
      </head>

      <body>

        <script
          id="${tariff.scriptId}"
          src="https://school.killap2p.ru/pl/lite/widget/script?id=${id}">
        <\/script>

      </body>

      </html>
    `;


    iframeDocument.open();
    iframeDocument.write(html);
    iframeDocument.close();


    // Автоматически увеличиваем iframe
    let attempts = 0;

    const interval = setInterval(function () {

      try {
        const height =
          iframeDocument.body
            ? iframeDocument.body.scrollHeight
            : 0;


        if (height > 60) {
          iframe.style.minHeight =
            (height + 90) + 'px';


          const loader =
            document.getElementById('gcm-load');


          if (loader) {
            loader.style.display = 'none';
          }
        }

      } catch (error) {
        // iframe может быть ещё недоступен
      }


      attempts++;

      if (attempts > 200) {
        clearInterval(interval);
      }

    }, 300);
  }


  window.openGcm = function (id) {
    const tariff = tariffs[id];

    const modal = document.getElementById('gcm');

    if (!tariff || !modal) {
      console.warn(
        'GCM: тариф или popup не найден:',
        id
      );

      return;
    }


    const tag = document.getElementById('gcm-tag');
    const title = document.getElementById('gcm-h');
    const subtitle = document.getElementById('gcm-sub');
    const newPrice = document.getElementById('gcm-np');
    const oldPrice = document.getElementById('gcm-op');


    if (tag) {
      tag.textContent = tariff.tag;
    }

    if (title) {
      title.textContent = tariff.title;
    }

    if (subtitle) {
      subtitle.textContent = tariff.subtitle;
    }

    if (newPrice) {
      newPrice.textContent = tariff.newPrice;
    }

    if (oldPrice) {
      oldPrice.textContent = tariff.oldPrice;
    }


    modal.classList.add('open');

    document.body.style.overflow = 'hidden';


    showTariff(id);


    const loader =
      document.getElementById('gcm-load');


    if (!builtTariffs[id]) {

      builtTariffs[id] = true;

      if (loader) {
        loader.style.display = 'block';
        loader.textContent =
          'Загружаем анкету…';
      }

      buildTariff(id);

    } else {

      if (loader) {
        loader.style.display = 'none';
      }

    }
  };


  window.closeGcm = function () {
    const modal =
      document.getElementById('gcm');

    if (!modal) return;

    modal.classList.remove('open');

    document.body.style.overflow = '';
  };


  function initGcmLinks() {

    document.addEventListener(
      'click',
      function (event) {

        const link =
          event.target.closest(
            'a[href^="#popup:"]'
          );


        if (!link) return;


        event.preventDefault();


        const href =
          link.getAttribute('href');


        if (!href) return;


        const id =
          href.split(':')[1];


        if (id) {
          window.openGcm(id);
        }
      }
    );


    const modal =
      document.getElementById('gcm');


    if (modal) {

      modal.addEventListener(
        'click',
        function (event) {

          if (event.target === modal) {
            window.closeGcm();
          }

        }
      );
    }


    document.addEventListener(
      'keydown',
      function (event) {

        if (event.key === 'Escape') {
          window.closeGcm();
        }

      }
    );
  }


  /* =======================================================
     6. INITIALIZATION
     ======================================================= */

  function init() {
    initReveal();
    initRailNavigation();
    initLightbox();
    initMobileMenu();
    initGcmLinks();
  }


  // Запускаем после загрузки DOM
  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

})();

//Animations !
const heroTitle = document.querySelector('.hero h1');

if (heroTitle) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('apple-reveal');

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2
    }
  );

  observer.observe(heroTitle);
}

const element = document.querySelector('.reveal');

if (element) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    },
    {
      threshold: 0.1
    }
  );

  observer.observe(element);
}