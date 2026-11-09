/* Architek — interactions.
   Règle 7 : le script ne fait que basculer des classes, jamais d'injection de contenu
   (le compteur réécrit un chiffre puis restitue exactement le texte d'origine).
   Sélection par classe, jamais par id. */

/* ---------- Menu mobile de la maquette (WordPress utilise son bloc Navigation) ---------- */
(function () {
  var entete = document.querySelector('.entete');
  var burger = document.querySelector('.burger');
  if (!entete || !burger) return;
  burger.addEventListener('click', function () {
    var ouvert = entete.classList.toggle('est-ouvert');
    burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
})();

/* ---------- Animations au défilement ---------- */
(function () {
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduit || !('IntersectionObserver' in window)) return; // tout reste visible, sans mouvement

  var racine = document.documentElement;
  racine.classList.add('anime');

  // effet -> éléments concernés (mêmes classes dans la maquette et dans WordPress)
  var effets = {
    'a-monter': '.etiquette, .titre-section, .titre-intro, .titre-page, .page-chapo, .texte-courant,' +
                ' .methode-texte, .domaines-texte, .equipe-texte, .territoire-texte, .vision-legende,' +
                ' .carte-projet, .carte-domaine, .carte-methode, .membre, .etape, .chiffre, .coord,' +
                ' .atouts > *, .formulaire',
    'a-rideau': '.bandeau, .cta-photo',
    'a-glisser': '.demi-disque',
    'a-eclore': '.tranche, .repere',
    'a-lateral': '.cta-bloc'
  };

  // Un élément entièrement masqué par clip-path est vu comme hors écran par Chrome :
  // pour ces effets, on observe le parent, qui déclenche ses enfants animés.
  var parParent = { 'a-glisser': true };
  var cibles = new Map(); // élément observé -> éléments à révéler

  var observateur = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      observateur.unobserve(e.target);
      (cibles.get(e.target) || []).forEach(function (el) {
        el.classList.add('est-visible');
        el.querySelectorAll('.chiffre-valeur').forEach(compter);
      });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  Object.keys(effets).forEach(function (classe) {
    document.querySelectorAll(effets[classe]).forEach(function (el) {
      if (el.closest('.hero') || el.matches('.a-monter, .a-rideau, .a-glisser, .a-eclore, .a-lateral')) return;
      el.classList.add(classe);
      var observe = parParent[classe] ? el.parentElement : el;
      if (!cibles.has(observe)) { cibles.set(observe, []); observateur.observe(observe); }
      cibles.get(observe).push(el);
    });
  });

  // Compteur : 0 -> valeur, puis restitution exacte du texte (« 97 % », « 18k+ »)
  function compter(el) {
    var texte = el.textContent;
    var m = texte.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    var cible = parseInt(m[2], 10), debut = null, duree = 1600;
    function pas(t) {
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      var v = Math.round(cible * (1 - Math.pow(1 - p, 3)));
      el.textContent = p < 1 ? m[1] + v + m[3] : texte;
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  // Profondeur du héros : la photo défile à 70 % de la vitesse de la page
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var enAttente = false;
  window.addEventListener('scroll', function () {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(function () {
      var y = Math.min(window.scrollY, hero.offsetHeight);
      racine.style.setProperty('--defilement', y);
      enAttente = false;
    });
  }, { passive: true });
})();
