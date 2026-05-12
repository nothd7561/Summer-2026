// mega.jsx — mega evolution reveal section
const { useState: useStateM, useEffect: useEffectM } = React;

function megaDisplayName(name) {
  // "Charizard-Mega-X" → "MEGA-CHARIZARD X"
  const match = name.match(/^(.+?)-Mega(-[XY])?$/i);
  if (!match) return 'MEGA-' + name.toUpperCase();
  const base = match[1].toUpperCase();
  const variant = match[2] ? ' ' + match[2].slice(1).toUpperCase() : '';
  return 'MEGA-' + base + variant;
}

function MegaView({ megaPokemon, basePokemon, onBack }) {
  const [revealed, setRevealed] = useStateM(false);
  const [shiny, setShiny] = useStateM(false);

  useEffectM(() => {
    setRevealed(false);
    setShiny(false);
    // Start revealing at 300ms — flash holds for 264ms (22% of 1200ms),
    // so text begins sliding in as the flash is actively fading away.
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, [megaPokemon.number]);

  const displayName = megaDisplayName(megaPokemon.name);
  const shinySprite = megaPokemon.sprite?.replace('/pokemon/', '/pokemon/shiny/');

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: revealed ? 1 : 0,
      transition: 'opacity 1267ms ease-out',
    }}>
      <style>{`
        @keyframes megaFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.02); }
        }
        @keyframes megaGlowPulse {
          0%,100% { opacity: 0.22; }
          50%      { opacity: 0.45; }
        }
        @keyframes megaHueSpin {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes megaSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes megaSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Animated radial glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(168,237,234,0.55), rgba(200,180,255,0.25), transparent 70%)',
        animation: revealed ? 'megaGlowPulse 4.27s ease-in-out infinite, megaHueSpin 12s linear infinite' : 'none',
      }}/>

      {/* Faint MEGA watermark */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '-0.08em',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--display)', fontWeight: 900,
        fontSize: 'min(28vw, 280px)', letterSpacing: '-0.05em',
        textTransform: 'uppercase', color: 'var(--ink)',
        opacity: 0.035, userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>MEGA</div>

      {/* Top-left: revert button + blurb underneath */}
      <div style={{
        position: 'absolute', top: 'clamp(78px,9vh,106px)', left: 'clamp(24px,3.5vw,70px)',
        zIndex: 4, display: 'flex', flexDirection: 'column', gap: 7,
        animation: revealed ? 'megaSlideUp 800ms 667ms ease-out both' : 'none',
      }}>
        <button className="btn ghost" onClick={onBack}
          style={{ padding: '7px 16px', fontSize: 10, letterSpacing: '0.18em' }}>
          ← REVERT
        </button>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--ink-mute)', lineHeight: 1.5,
        }}>double click pokeball<br/>· return to pokémon centre</div>
      </div>

      {/* Top-right: MEGA name block */}
      <div style={{
        position: 'absolute', top: 'clamp(78px,9vh,106px)', right: 'clamp(24px,3.5vw,70px)',
        textAlign: 'right', zIndex: 4,
        animation: revealed ? 'megaSlideIn 1067ms 267ms ease-out both' : 'none',
      }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 7,
        }}>
          #{String(megaPokemon.number).padStart(4,'0')} · MEGA EVOLUTION
        </div>
        <div style={{
          fontFamily: 'var(--display)', fontWeight: 900,
          fontSize: `clamp(24px, ${Math.max(22, 88 - displayName.length * 3.2)}px, 68px)`,
          letterSpacing: '-0.04em', lineHeight: 0.88,
          textTransform: 'uppercase', fontStyle: 'italic',
          color: 'var(--hot)',
          textShadow: '3px 3px 0 rgba(17,17,17,0.9)',
        }}>
          {displayName}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 10 }}>
          <span className={'type-chip solid t-' + megaPokemon.type1.toLowerCase()}>{megaPokemon.type1}</span>
          {megaPokemon.type2 && <span className={'type-chip solid t-' + megaPokemon.type2.toLowerCase()}>{megaPokemon.type2}</span>}
        </div>
        <button onClick={() => setShiny(s => !s)} style={{
          all: 'unset', cursor: 'pointer', marginTop: 10,
          fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 999,
          border: `1px solid ${shiny ? '#c79a2a' : 'rgba(17,17,17,0.25)'}`,
          color: shiny ? '#c79a2a' : 'var(--ink-mute)',
          background: shiny ? 'rgba(199,154,42,0.1)' : 'transparent',
          transition: 'all 200ms ease',
        }}>✦ shiny</button>
      </div>

      {/* Center: mega sprite — arrives first, no additional transform animation needed */}
      <div style={{
        position: 'relative', zIndex: 2,
        animation: revealed ? 'megaFloat 5.6s 133ms ease-in-out infinite' : 'none',
      }}>
        <img
          src={shiny ? shinySprite : megaPokemon.sprite}
          alt={megaPokemon.name}
          style={{
            width: 'min(360px, 40vw)', height: 'min(360px, 40vw)',
            objectFit: 'contain', imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 32px rgba(168,237,234,0.55)) drop-shadow(0 20px 24px rgba(0,0,0,0.2))',
          }}
        />
      </div>

      {/* Bottom: BST comparison */}
      <div style={{
        position: 'absolute', bottom: 'clamp(32px,5vh,64px)', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 28, alignItems: 'center',
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--ink-mute)',
        animation: revealed ? 'megaSlideUp 933ms 867ms ease-out both' : 'none',
        zIndex: 3, whiteSpace: 'nowrap',
      }}>
        <span>BST {basePokemon.bst}
          <span style={{ margin: '0 8px', opacity: 0.4 }}>→</span>
          <span style={{ color: 'var(--hot)', fontWeight: 700 }}>{megaPokemon.bst}</span>
          <span style={{ color: megaPokemon.bst > basePokemon.bst ? 'var(--hot)' : 'inherit', marginLeft: 6, fontSize: 9 }}>
            {megaPokemon.bst > basePokemon.bst ? `+${megaPokemon.bst - basePokemon.bst}` : ''}
          </span>
        </span>
        <span style={{ width: 1, height: 14, background: 'var(--ink)', opacity: 0.2, display: 'inline-block' }}/>
        <span>GEN {basePokemon.generation.replace('gen-','').toUpperCase()}</span>
      </div>
    </div>
  );
}

window.MegaView = MegaView;
window.megaDisplayName = megaDisplayName;
