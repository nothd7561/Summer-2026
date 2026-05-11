// app.jsx — root, scroll layout, data loading, tweaks
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

const TWEAK_DEFAULTS = {
  "palette": "paper",
  "accent": "ember",
  "showChrome": true,
  "showBubbles": true
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
  const [locale, setLocale] = useStateApp('EN');
  const [scrolled, setScrolled] = useStateApp(false);
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const statsRef = useRefApp(null);

  // Track scroll for pokeball return-to-top button
  useEffectApp(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > 80);
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  useEffectApp(() => {
    window.PokeData.loadPokemon().then(d => {
      window.__pokeAll = d.all.filter(p => !p.isForm);
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

  // apply palette + accent to CSS vars
  useEffectApp(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.paper;
    document.documentElement.style.setProperty('--bg', p.bg);
    document.documentElement.style.setProperty('--paper', p.paper);
    document.documentElement.style.setProperty('--ink', p.ink);
    document.documentElement.style.setProperty('--ink-mute', p.mute);
    document.documentElement.style.setProperty('--hot', ACCENTS[tweaks.accent] || ACCENTS.ember);
  }, [tweaks.palette, tweaks.accent]);

  function confirmPick(p) {
    setTarget(p);
    setTransitionDone(false);
  }

  function scrollToStats() {
    if (statsRef.current) {
      statsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function reset() {
    const root = document.getElementById('root');
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { setTarget(null); setTransitionDone(false); }, 650);
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
      {tweaks.showBubbles && <BgBubbles count={14} seed={screenNum + 7}/>}
      {tweaks.showChrome && <Chrome screen={screenNum} locale={locale} onLocaleChange={setLocale}/>}

      {/* Pokeball scroll-to-top — appears when scrolled past landing */}
      <div style={{
        position:'fixed', top: 22, left:'50%', transform:'translateX(-50%)',
        zIndex: 60,
        opacity: scrolled ? 1 : 0,
        pointerEvents: scrolled ? 'auto' : 'none',
        transition: 'opacity 320ms ease',
      }}>
        <button
          onClick={() => document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top"
          style={{
            all:'unset', cursor:'pointer',
            width: 40, height: 40, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'var(--paper)',
            border:'1px solid rgba(17,17,17,0.14)',
            boxShadow:'0 4px 18px rgba(0,0,0,0.13)',
            transition:'transform 160ms ease, box-shadow 160ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 22px rgba(0,0,0,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(0,0,0,0.13)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 12 A9 9 0 0 1 21 12 Z" fill="var(--hot)"/>
            <path d="M3 12 A9 9 0 0 0 21 12 Z" fill="white"/>
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--ink)" strokeWidth="1.5"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="var(--ink)" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2.8" fill="white" stroke="var(--ink)" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>

      {/* Landing section — always full viewport */}
      <div style={{ position:'relative', width:'100%', height:'100vh' }}>
        <Landing data={data} onConfirm={confirmPick} locale={locale}/>
        {target && <ScrollHint onClick={scrollToStats}/>}
      </div>

      {/* Stats section — below the fold, appears when a pokemon is selected */}
      {target && (
        <div ref={statsRef} style={{ position:'relative', width:'100%', height:'100vh' }}>
          {!transitionDone
            ? <Transition pokemon={target} onDone={() => setTransitionDone(true)}/>
            : <Stats
                pokemon={target}
                chain={chain}
                onBack={reset}
                onPick={(p) => { setTarget(p); setTransitionDone(true); }}
                locale={locale}
              />
          }
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
