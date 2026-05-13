// app.jsx — root, scroll layout, data loading, tweaks
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

const TWEAK_DEFAULTS = {
  "palette": "paper",
  "accent": "ember",
  "showChrome": true,
  "showBubbles": false
};

const PALETTES = {
  paper:  { bg:'#f4f3ef', paper:'#fafaf7', ink:'#0a0a0a', mute:'#6b6b66' },
  bone:   { bg:'#ece8df', paper:'#f3efe6', ink:'#111111', mute:'#6e6a60' },
  cool:   { bg:'#eef0f3', paper:'#f7f8fa', ink:'#0c0e12', mute:'#6a6e76' },
  ink:    { bg:'#101013', paper:'#16161a', ink:'#f1efe6', mute:'#8a8a86' },
};
const ACCENTS = {
  ember:  '#d94a3d',
  ocean:  '#3d77d9',
  moss:   '#5b8a3a',
  gold:   '#c79a2a',
};

function App() {
  const [data, setData] = useStateApp(null);
  const [target, setTarget] = useStateApp(null);
  const [transitionDone, setTransitionDone] = useStateApp(false);
  const [locale, setLocale]           = useStateApp('EN');
  const [landingPhase, setLandingPhase] = useStateApp('idle');
  const [pokeballLifted, setPokeballLifted] = useStateApp(false);
  const [megaTarget, setMegaTarget] = useStateApp(null);
  const [evoShown, setEvoShown] = useStateApp(false);
  const [pokeballHovered, setPokeballHovered] = useStateApp(false);
  const [introGone, setIntroGone] = useStateApp(false);

  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const statsRef     = useRefApp(null);
  const megaRef      = useRefApp(null);
  const evoRef       = useRefApp(null);
  const landingCmdRef = useRefApp(null);

  useEffectApp(() => {
    const t = setTimeout(() => setIntroGone(true), 1700);
    return () => clearTimeout(t);
  }, []);

  useEffectApp(() => {
    window.PokeData.loadPokemon().then(d => {
      window.__pokeAll = d.all.filter(p => !p.isForm);
      window.__pokeAllFull = d.all;
      setData(d);
    });
  }, []);

  // keyboard: B for back, R for random
  useEffectApp(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'b' || e.key === 'B') { reset(); }
      if (e.key === 'r' || e.key === 'R') {
        const pool = data && data.all.filter(p => !p.isForm);
        if (!pool) return;
        const r = pool[Math.floor(Math.random() * pool.length)];
        confirmPick(r);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data]);

  // auto-lift/lower pokeball based on scroll position when a pokemon is selected
  useEffectApp(() => {
    const root = document.getElementById('root');
    if (!root || !target) return;
    const update = () => setPokeballLifted(root.scrollTop > window.innerHeight * 0.3);
    root.addEventListener('scroll', update, { passive: true });
    return () => root.removeEventListener('scroll', update);
  }, [target]);

  // apply palette + accent to CSS vars
  useEffectApp(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.paper;
    document.documentElement.style.setProperty('--bg', p.bg);
    document.documentElement.style.setProperty('--paper', p.paper);
    document.documentElement.style.setProperty('--ink', p.ink);
    document.documentElement.style.setProperty('--ink-mute', p.mute);
    document.documentElement.style.setProperty('--hot', ACCENTS[tweaks.accent] || ACCENTS.ember);
  }, [tweaks.palette, tweaks.accent]);

  function activateMega(megaForms) {
    setMegaTarget(megaForms);  // now an array
    requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (root && megaRef.current) root.scrollTop = megaRef.current.offsetTop;
    });
  }

  function activateEvo() {
    setEvoShown(true);
    requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (root && evoRef.current) root.scrollTop = evoRef.current.offsetTop;
    });
  }

  function backFromEvo() {
    const root = document.getElementById('root');
    if (root && statsRef.current) root.scrollTo({ top: statsRef.current.offsetTop, behavior: 'smooth' });
    setTimeout(() => setEvoShown(false), 600);
  }

  function backFromMega() {
    const root = document.getElementById('root');
    if (root && statsRef.current) root.scrollTo({ top: statsRef.current.offsetTop, behavior: 'smooth' });
    setTimeout(() => setMegaTarget(null), 600);
  }

  function confirmPick(p) {
    setTarget(p);
    setMegaTarget(null);
    setEvoShown(false);
    setTransitionDone(false);
    setPokeballLifted(true);
    // Instant-jump to stats while flash covers the screen
    requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (root && statsRef.current) root.scrollTop = statsRef.current.offsetTop;
    });
  }

  function scrollToStats() {
    if (statsRef.current) {
      statsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function reset() {
    const root = document.getElementById('root');
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
    setPokeballLifted(false);
    setMegaTarget(null);
    setEvoShown(false);
    landingCmdRef.current?.goIdle();
    setTimeout(() => { setTarget(null); setTransitionDone(false); }, 650);
  }
  function backToSearch() {
    const root = document.getElementById('root');
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
    setPokeballLifted(false);
    setMegaTarget(null);
    setEvoShown(false);
    setTimeout(() => {
      landingCmdRef.current?.goSearch();
      setTimeout(() => { setTarget(null); setTransitionDone(false); }, 400);
    }, 500);
  }

  if (!data) {
    return (
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
        loading dossier · 1,302 entries
      </div>
    );
  }

  const screenNum = !target ? 1 : !transitionDone ? 2 : 3;
  const chain = target ? (data.chains[target.chainId] || [target]) : [];

  return (
    <div style={{ position:'relative', width:'100%', minHeight:'100%' }}>
      {/* Game-building entry: black screen fades out on first load */}
      {!introGone && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#000', pointerEvents: 'none',
          animation: 'introFade 1700ms ease-out forwards',
        }}>
          <style>{`@keyframes introFade { 0%,55%{opacity:1} 100%{opacity:0} }`}</style>
        </div>
      )}
      {tweaks.showBubbles && <BgBubbles count={14} seed={screenNum + 7}/>}
      {tweaks.showChrome && <Chrome screen={screenNum} locale={locale} onLocaleChange={setLocale}
        showBlurb={landingPhase === 'searching' && !megaTarget && !target}
        statsActions={target && transitionDone && !evoShown && !megaTarget ? {
          onBack: backToSearch,
          onRandom: () => {
            const pool = (data && data.all.filter(p => !p.isForm)) || [];
            const r = pool[Math.floor(Math.random() * pool.length)];
            if (r) confirmPick(r);
          },
        } : null}
      />}

      {/* Pokeball — hidden in pokecenter idle, visible during search + stats */}
      {(landingPhase === 'searching' || target) && <div style={{
        position:'fixed',
        top: pokeballLifted ? '22px' : (landingPhase === 'searching' ? 'clamp(108px,13vh,138px)' : 'clamp(82px,11vh,115px)'),
        left:'50%', transform:'translateX(-50%)',
        zIndex: 60,
        transition: 'top 400ms cubic-bezier(.2,.7,.2,1)',
        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      }}>
        <button
          onClick={() => { if (pokeballLifted) { backToSearch(); } else { document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' }); } }}
          onDoubleClick={reset}
          onMouseEnter={() => setPokeballHovered(true)}
          onMouseLeave={() => setPokeballHovered(false)}
          style={{
            all:'unset', cursor:'pointer',
            width: 40, height: 40, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'var(--paper)',
            border:'1px solid rgba(17,17,17,0.14)',
            boxShadow: pokeballHovered ? '0 6px 22px rgba(0,0,0,0.18)' : '0 4px 18px rgba(0,0,0,0.13)',
            transform: pokeballHovered ? 'scale(1.1)' : 'scale(1)',
            transition:'transform 160ms ease, box-shadow 160ms ease',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 12 A9 9 0 0 1 21 12 Z" fill="var(--hot)"/>
            <path d="M3 12 A9 9 0 0 0 21 12 Z" fill="white"/>
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--ink)" strokeWidth="1.5"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="var(--ink)" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2.8" fill="white" stroke="var(--ink)" strokeWidth="1.5"/>
          </svg>
        </button>
        {/* Hover tooltip — fades in below pokeball */}
        <div style={{
          opacity: pokeballHovered ? 1 : 0,
          transition: 'opacity 220ms ease',
          pointerEvents: 'none',
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          background:'var(--paper)',
          border:'1px solid rgba(17,17,17,0.10)',
          borderRadius:10,
          padding:'6px 12px',
          boxShadow:'0 4px 14px rgba(0,0,0,0.09)',
          whiteSpace:'nowrap',
        }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
            <span style={{ color:'var(--hot)', fontWeight:700 }}>1×</span> Return to Top
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
            <span style={{ color:'var(--hot)', fontWeight:700 }}>2×</span> Return to Centre
          </div>
        </div>
      </div>}

      {/* Landing section — always full viewport */}
      <div style={{ position:'relative', width:'100%', height:'100vh' }}>
        <Landing data={data} onConfirm={confirmPick} locale={locale} landingCmdRef={landingCmdRef} onPhaseChange={setLandingPhase}/>
        {target && <ScrollHint onClick={scrollToStats}/>}
      </div>

      {/* Stats section — below the fold, appears when a pokemon is selected */}
      {target && (
        <div ref={statsRef} style={{ position:'relative', width:'100%', height:'100vh' }}>
          {!transitionDone
            ? <Transition pokemon={target} onDone={() => setTransitionDone(true)}/>
            : <div style={{ position:'relative', width:'100%', height:'100%', animation:'statsFadeIn 600ms ease forwards' }}>
                <style>{`@keyframes statsFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
                <Stats
                  pokemon={target}
                  chain={chain}
                  onBack={backToSearch}
                  onPick={(p) => { setTarget(p); setMegaTarget(null); setEvoShown(false); setTransitionDone(true); }}
                  onMega={activateMega}
                  onEvo={activateEvo}
                  locale={locale}
                />
              </div>
          }
        </div>
      )}

      {/* Evo section — below stats, for non-mega pokemon; minHeight so Gmax can extend below */}
      {target && evoShown && (
        <div ref={evoRef} style={{ position:'relative', width:'100%', minHeight:'100vh' }}>
          <window.EvoView
            pokemon={target}
            chain={chain}
            onBack={backFromEvo}
            onPick={(p) => { setTarget(p); setEvoShown(false); setTransitionDone(true); }}
          />
        </div>
      )}

      {/* Mega section — below stats, appears after mega evolution triggered */}
      {target && megaTarget && (
        <div ref={megaRef} style={{ position:'relative', width:'100%', height:'100vh' }}>
          <window.MegaView
            megaForms={megaTarget}
            basePokemon={target}
            onBack={backFromMega}
          />
        </div>
      )}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="palette">
            <window.TweakColor
              label="palette"
              value={tweaks.palette}
              options={[
                ['#f4f3ef','#0a0a0a','#d94a3d'],
                ['#ece8df','#111111','#c79a2a'],
                ['#eef0f3','#0c0e12','#3d77d9'],
                ['#101013','#f1efe6','#d94a3d'],
              ]}
              onChange={(v, i) => {
                const keys = ['paper','bone','cool','ink'];
                setTweak('palette', keys[i] || 'paper');
              }}
            />
          </window.TweakSection>
          <window.TweakSection title="accent">
            <window.TweakColor
              label="accent color"
              value={ACCENTS[tweaks.accent]}
              options={Object.values(ACCENTS)}
              onChange={(v) => {
                const k = Object.keys(ACCENTS).find(k => ACCENTS[k] === v);
                setTweak('accent', k || 'ember');
              }}
            />
          </window.TweakSection>
          <window.TweakSection title="chrome">
            <window.TweakToggle label="show chrome" value={tweaks.showChrome} onChange={v => setTweak('showChrome', v)}/>
            <window.TweakToggle label="background bubbles" value={tweaks.showBubbles} onChange={v => setTweak('showBubbles', v)}/>
          </window.TweakSection>
          <window.TweakSection title="navigation">
            <window.TweakButton label="back to landing" onClick={reset}/>
            <window.TweakButton label="random pokémon" onClick={() => {
              const pool = data.all.filter(p => !p.isForm);
              const r = pool[Math.floor(Math.random() * pool.length)];
              confirmPick(r);
            }}/>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
