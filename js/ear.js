// Jeux d'oreille absolue : « deviner » (un son, 7 notes en cercle) et « placer » (un son, on place
// la note sur la portée). Montés dans le cadre de jeu commun par js/game.js (`kit`).
window.Notanext = window.Notanext || {};

(function () {
  const { data, staff, playNote, instruments, instrumentMenu } = window.Notanext;
  const { FR, FREQ, label, CLEFS, clefById, notesOf } = data;
  const { renderStaff, eventToStep } = staff;

  const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  const rand = (list) => list[Math.floor(Math.random() * list.length)];

  // ---------- Oreille absolue — deviner ----------
  // Pas de partition : un bouton rond joue le son, 7 notes en cercle (Do en haut, sens horaire).
  // Les touches clavier configurées restent valables (boutons enregistrés via kit.setActiveAnswers).
  function mountGuess(ex, kit) {
    const circle = FR.map((n, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / FR.length;
      const x = 50 + 36 * Math.cos(a);
      const y = 50 + 36 * Math.sin(a);
      return `<button type="button" class="ear-note" data-note="${n}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"><span class="ans-name">${label(n)}</span><span class="key-hint"></span></button>`;
    }).join('');
    const frame = kit.openFrame({
      title: ex.title,
      cls: 'ear-guess',
      stageHtml: `<div class="ear-wheel">${circle}<button type="button" class="ear-play" id="ear-play" aria-label="Jouer ou rejouer le son">${PLAY_ICON}</button></div>`,
      answersHtml: instrumentMenu.bigRowHtml(),
      onBack: () => kit.showGrid(),
    });

    const byName = {};
    frame.root.querySelectorAll('.ear-note').forEach((b) => { byName[b.dataset.note] = b; });
    kit.setActiveAnswers(byName);

    let current = null;
    let previous = null;
    let locked = false;
    let dead = false;
    let timer = null;
    const play = () => { if (current) playNote(FREQ[current + '4']); };

    function next() {
      if (dead) return;
      locked = false;
      Object.values(byName).forEach((b) => { b.classList.remove('good', 'bad', 'reveal'); });
      do { current = rand(FR); } while (current === previous);
      previous = current;
      frame.setFeedback('');
      play();
    }

    function answer(name) {
      if (locked || !current) return;
      locked = true;
      const ok = name === current;
      byName[name].classList.add(ok ? 'good' : 'bad');
      if (!ok) byName[current].classList.add('reveal');
      if (ok) frame.setFeedback(rand(kit.CORRECT_PHRASES), 'correct');
      else frame.setFeedback(`Raté, c'était <b>${label(current)}</b>`);
      frame.session.record(ok);
      timer = setTimeout(next, ok ? 1000 : 1600);
    }

    Object.entries(byName).forEach(([name, b]) => b.addEventListener('click', () => answer(name)));
    document.getElementById('ear-play').addEventListener('click', play);

    const unmountRow = instrumentMenu.mountBig(frame.root);
    instruments.load(instruments.get()).catch(() => {});
    frame.setDestroy(() => {
      dead = true;
      clearTimeout(timer);
      unmountRow();
    });
    next();
  }

  // ---------- Oreille absolue — placer ----------
  // Même mécanique que « Placer la note », mais la note est jouée au lieu d'être nommée, et seule la
  // position exacte est juste (l'octave compte).
  // Souris : survol puis clic. Toucher : on pose le doigt, on glisse, on relâche pour valider.
  // Option « Afficher le nom de la note » : le nom suit la position, écrit sur la note.
  const NAMES_KEY = 'notanext.earplace.names';
  function mountPlace(ex, kit) {
    let namesOn = false;
    try { namesOn = localStorage.getItem(NAMES_KEY) === '1'; } catch (e) { /* désactivé */ }
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const IDLE = coarse ? 'Touche la portée et fais glisser' : 'Écoute le son, puis place la note';

    const frame = kit.openFrame({
      title: ex.title,
      cls: 'ear-place',
      config: `<label class="switch"><input type="checkbox" id="ear-names" role="switch"${namesOn ? ' checked' : ''}><span class="switch-track"><span class="switch-thumb"></span></span><span>Afficher le nom de la note</span></label>`,
      configAfter: `${instrumentMenu.html()}<span class="inst-note" id="inst-note" hidden></span>`,
      stageHtml: `<div class="ear-stage">
          <button type="button" class="ear-play small" id="ear-play" aria-label="Jouer ou rejouer le son">${PLAY_ICON}</button>
          <div class="stage-row">
            <div class="clef-side"><select id="clef-sel" aria-label="Choisir une clé">${CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div>
            <div class="staff-box"><svg class="staff-svg placing" id="staff" role="img" aria-label="Portée"></svg></div>
          </div>
        </div>`,
      onBack: () => kit.showGrid(),
    });

    const svg = document.getElementById('staff');
    svg.style.touchAction = 'none';
    const clefSel = document.getElementById('clef-sel');
    const namesBox = document.getElementById('ear-names');
    const noteEl = document.getElementById('inst-note');
    const clef = () => clefById(clefSel.value);

    let current = null;
    let locked = false;
    let hoverStep = null;
    let hoverTouch = false;
    let dead = false;
    let timer = null;

    const play = () => { if (current) playNote(current.freq); };
    const nameAt = (step) => {
      const n = notesOf(clef()).find((x) => x.step === step);
      return n ? label(n.name) : '';
    };
    const draw = (extra) => renderStaff(svg, Object.assign({ wide: true, clef: clef() }, extra));

    function drawGhost(step, touch) {
      hoverStep = step;
      hoverTouch = touch;
      const opts = { ghostStep: step };
      if (namesOn) { opts.ghostLabel = nameAt(step); opts.ghostLabelAbove = touch; }
      draw(opts);
    }
    const clearGhost = () => { hoverStep = null; if (!locked) draw(); };

    // Seules les notes que l'instrument joue à leur vraie hauteur sont proposées : la position
    // exacte sur la portée est alors la seule bonne réponse (pas d'ambiguïté d'octave).
    const MIN_POOL = 3;
    const pool = () => notesOf(clef()).filter((n) => instruments.inRange(instruments.get(), n.freq));

    function next() {
      if (dead) return;
      clearTimeout(timer);
      hoverStep = null;
      const notes = pool();
      noteEl.hidden = notes.length === notesOf(clef()).length;
      noteEl.textContent = noteEl.hidden ? '' : `${notes.length} ${notes.length > 1 ? 'notes jouables' : 'note jouable'} avec cet instrument`;
      if (notes.length < MIN_POOL) {
        current = null;
        locked = true;
        frame.setFeedback('Cet instrument couvre trop peu cette clé : change d\'instrument ou de clé.');
        draw();
        return;
      }
      locked = false;
      current = rand(notes);
      frame.setFeedback(IDLE);
      draw();
      play();
    }

    function commit(step) {
      if (locked || !current) return;
      locked = true;
      const correctSteps = [current.step];
      const ok = step === current.step;
      draw({ reveal: { correctSteps, correctName: current.name, clickedStep: step, ok } });
      if (ok) frame.setFeedback(rand(kit.CORRECT_PHRASES), 'correct');
      else frame.setFeedback(`Raté, c'était <b>${label(current.name)}</b>`);
      frame.session.record(ok);
      timer = setTimeout(next, ok ? 1000 : 1600);
    }

    const stepOf = (e) => eventToStep(svg, e.clientY, e.clientX);
    svg.addEventListener('pointermove', (e) => {
      if (locked) return;
      if (e.pointerType === 'mouse' || e.buttons) drawGhost(stepOf(e), e.pointerType !== 'mouse');
    });
    svg.addEventListener('pointerdown', (e) => {
      if (locked || e.pointerType === 'mouse') return;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* capture indisponible : on suit quand même */ }
      drawGhost(stepOf(e), true);
    });
    svg.addEventListener('pointerup', (e) => {
      if (locked || e.pointerType === 'mouse') return;
      commit(stepOf(e));
    });
    svg.addEventListener('pointercancel', clearGhost);
    svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') clearGhost(); });
    svg.addEventListener('click', (e) => {
      if (locked) return;
      commit(hoverStep != null ? hoverStep : stepOf(e));
    });

    namesBox.addEventListener('change', () => {
      namesOn = namesBox.checked;
      try { localStorage.setItem(NAMES_KEY, namesOn ? '1' : '0'); } catch (e) { /* valable pour la session */ }
      if (hoverStep != null && !locked) drawGhost(hoverStep, hoverTouch);
    });

    clefSel.addEventListener('change', next);
    document.getElementById('ear-play').addEventListener('click', play);

    const onResize = () => { if (!locked) draw(hoverStep != null ? { ghostStep: hoverStep } : {}); };
    const onNotation = () => { if (hoverStep != null && !locked) drawGhost(hoverStep, hoverTouch); };
    window.addEventListener('resize', onResize);
    window.addEventListener('notanext:notation', onNotation);
    window.addEventListener('notanext:instrument', next);
    const unmountMenu = instrumentMenu.mount(frame.root);
    instruments.load(instruments.get()).catch(() => {});

    frame.setDestroy(() => {
      dead = true;
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('notanext:notation', onNotation);
      window.removeEventListener('notanext:instrument', next);
      unmountMenu();
    });
    next();
  }

  window.Notanext.ear = { mountGuess, mountPlace };
})();
