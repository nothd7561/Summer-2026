// transition.jsx — smooth reveal loader, starts when scrolled into view
const { useEffect: useEffectT, useState: useStateT, useRef: useRefT } = React;

function Transition({ pokemon, onDone }) {
  const [started, setStarted] = useStateT(false);
  const [tick, setTick] = useStateT(0);
  const containerRef = useRefT(null);

  // Start only when scrolled into view
  useEffectT(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Advance tick after started
  useEffectT(() => {
    if (!started) return;
    const start = performance.now();
    const total = 3000;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / total);
      setTick(p);
      if (p < 1) raf = requestAnimationFrame(step);
      else setTimeout(onDone, 380);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  const phases = ['parse sprite', 'normalize stats', 'trace evolutions', 'compile dossier'];
  const activePhase = Math.min(phases.length - 1, Math.floor(tick * phases.length));

  return (
    <div ref={containerRef} style={{
      position:'relative', width:'100%', height:'100vh',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex: 5,
    }}>
      <style>{`
        @keyframes tRing {
          0%   { transform: scale(0.65); opacity: 0; }
          25%  { opacity: 0.38; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes tSpriteReveal {
          0%   { filter: grayscale(1) blur(10px) brightness(0.3); opacity: 0.2; transform: scale(0.84); }
          35%  { filter: grayscale(0.6) blur(4px) brightness(0.6); opacity: 0.65; transform: scale(0.95); }
          100% { filter: grayscale(0) blur(0px) brightness(1);    opacity: 1;   transform: scale(1); }
        }
        @keyframes tTextIn {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tBarIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 36 }}>

        {/* Rings + Sprite */}
        <div style={{
          position:'relative', width: 300, height: 300,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position:'absolute', width: 220, height: 220, borderRadius:'50%',
              border: '1px solid var(--ink)',
              animation: started ? `tRing 2.6s ${i * 0.78}s infinite ease-out` : 'none',
              opacity: 0,
            }}/>
          ))}
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            style={{
              width: 200, height: 200, objectFit:'contain', imageRendering:'pixelated',
              animation: started ? 'tSpriteReveal 3s ease-out forwards' : 'none',
              filter: started ? undefined : 'grayscale(1) blur(10px) brightness(0.3)',
              opacity: started ? undefined : 0.2,
            }}
          />
        </div>

        {/* Name + phase */}
        <div style={{
          textAlign:'center',
          animation: started ? 'tTextIn 600ms 280ms ease-out forwards' : 'none',
          opacity: started ? undefined : 0,
        }}>
          <div style={{
            fontFamily:'var(--display)', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 60px)',
            letterSpacing:'-0.04em', lineHeight: 1, textTransform:'uppercase',
          }}>
            {pokemon.name}
          </div>
          <div style={{
            fontFamily:'var(--mono)', fontSize: 11,
            letterSpacing:'0.24em', textTransform:'uppercase',
            color:'var(--ink-mute)', marginTop: 10,
          }}>
            #{String(pokemon.number).padStart(4,'0')} · {phases[activePhase]}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width:'min(360px, 58vw)',
          animation: started ? 'tBarIn 500ms 500ms ease-out forwards' : 'none',
          opacity: started ? undefined : 0,
        }}>
          <div style={{
            height: 2, background:'rgba(17,17,17,0.1)',
            borderRadius: 999, overflow:'hidden',
          }}>
            <div style={{
              height:'100%', background:'var(--ink)',
              borderRadius: 999,
              width:`${tick * 100}%`,
              transition:'width 80ms linear',
            }}/>
          </div>
          <div style={{
            marginTop: 10, display:'flex', justifyContent:'space-between',
            fontFamily:'var(--mono)', fontSize: 10,
            letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ink-mute)',
          }}>
            <span>scanning</span>
            <span>{Math.round(tick * 100)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}

window.Transition = Transition;
