// mega.jsx — mega evolution reveal section
const { useState: useStateM, useEffect: useEffectM, useMemo: useMemoM } = React;

function megaDisplayName(name) {
  const m1 = name.match(/^(.+?)-Mega(-\w+)?$/i);
  if (m1) {
    const base = m1[1].toUpperCase();
    const variant = m1[2] ? ' ' + m1[2].slice(1).toUpperCase() : '';
    return 'MEGA-' + base + variant;
  }
  const m2 = name.match(/^(.+?)-(.+)-Mega$/i);
  if (m2) return 'MEGA-' + m2[1].toUpperCase() + ' ' + m2[2].toUpperCase();
  return 'MEGA-' + name.toUpperCase();
}

function megaVariantLabel(name) {
  const m1 = name.match(/^.+?-Mega-(\w+)$/i);
  if (m1) return m1[1];
  const m2 = name.match(/^.+?-(\w+)-Mega$/i);
  if (m2) return m2[1];
  return null;
}

function formatEvoMethod(det) {
  if (!det || !det.trigger) return 'Evolution';
  const trigger = det.trigger.name;
  const tc = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (trigger === 'level-up') {
    if (det.min_level)       return `Level ${det.min_level}`;
    if (det.min_happiness)   return `Friendship ≥ ${det.min_happiness}`;
    if (det.known_move_type) return `Know ${tc(det.known_move_type.name || '')} move`;
    if (det.time_of_day)     return `Level up · ${det.time_of_day}`;
    if (det.min_beauty)      return `Beauty ≥ ${det.min_beauty}`;
    return 'Level up';
  }
  if (trigger === 'use-item') return tc(det.item?.name || 'item');
  if (trigger === 'trade')    return det.held_item ? `Trade · ${tc(det.held_item.name || '')}` : 'Trade';
  if (trigger === 'shed')     return 'Level 20 + free slot';
  return tc(trigger);
}

function MegaView({ megaForms, basePokemon, onBack }) {
  const [activeIdx, setActiveIdx] = useStateM(0);
  const [revealed, setRevealed]   = useStateM(false);
  const [shiny, setShiny]         = useStateM(false);
  const [morphing, setMorphing]   = useStateM(false);
  const [evoMethods, setEvoMethods] = useStateM({});
  const [radarTarget, setRadarTarget] = useStateM(basePokemon);
  const [radarFading, setRadarFading] = useStateM(false);

  const megaPokemon = megaForms[activeIdx];
  const hasGif = !!megaPokemon?.gifSprite;
  const effectiveSprite = hasGif
    ? megaPokemon.gifSprite
    : (shiny
        ? megaPokemon?.sprite?.replace('/pokemon/', '/pokemon/shiny/')
        : megaPokemon?.sprite);

  const hasVariants = megaForms.length > 1;

  // Mainline evolution chain (base Pokémon only, no forms)
  const evoChain = useMemoM(() => {
    const all = window.__pokeAll || [];
    const chain = all.filter(p => p.chainId === basePokemon.chainId);
    return window.PokeData.mainlineChain(chain, basePokemon);
  }, [basePokemon.chainId, basePokemon.number]);

  // Fetch evolution methods from PokeAPI
  useEffectM(() => {
    if (!basePokemon.chainId) return;
    fetch(`https://pokeapi.co/api/v2/evolution-chain/${basePokemon.chainId}/`)
      .then(r => r.json())
      .then(data => {
        const map = {};
        function walk(node) {
          for (const evo of node.evolves_to) {
            map[evo.species.name.toLowerCase()] = formatEvoMethod(evo.evolution_details[0] || {});
            walk(evo);
          }
        }
        walk(data.chain);
        setEvoMethods(map);
      })
      .catch(() => {});
  }, [basePokemon.chainId]);

  useEffectM(() => { setRadarTarget(basePokemon); }, [basePokemon.number]);

  // Re-run reveal animation whenever the active pokemon changes
  useEffectM(() => {
    setRevealed(false);
    setShiny(false);
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, [megaPokemon?.number, megaPokemon?.name]);

  function selectRadarTarget(p) {
    if (p.number === radarTarget.number) return;
    setRadarFading(true);
    setTimeout(() => { setRadarTarget(p); setRadarFading(false); }, 200);
  }

  function switchVariant(idx) {
    if (idx === activeIdx || morphing) return;
    setMorphing(true);
    setRevealed(false);
    setTimeout(() => {
      setActiveIdx(idx);
      setTimeout(() => setMorphing(false), 600);
    }, 320);
  }

  if (!megaPokemon) return null;

  const displayName = megaDisplayName(megaPokemon.name);
  const SPRITE_SIZE = 'min(180px, 15vw)';
  const ARROW_W = 'min(72px, 6vw)';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
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
        @keyframes shadowBreathe {
          0%,100% { transform: translate(38px, -15px) scale(1.55); }
          50%      { transform: translate(38px, -15px) scale(1.63); }
        }
        @keyframes megaMorphWave {
          0%   { transform: translate(-50%,-50%) scale(0);   opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
        }
      `}</style>

      {/* Background: oversized shadowy face */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        pointerEvents: 'none', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          key={megaPokemon.name + '-shadow'}
          src={hasGif ? megaPokemon.gifSprite : megaPokemon.sprite}
          aria-hidden="true" alt=""
          style={{
            position: 'absolute',
            width: 'min(660px, 72vmin)', height: 'min(660px, 72vmin)',
            objectFit: 'contain',
            imageRendering: hasGif ? 'auto' : 'pixelated',
            transformOrigin: 'center 28%',
            animation: 'shadowBreathe 8s ease-in-out infinite',
            filter: 'grayscale(1) brightness(0.55) opacity(0.22)',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Animated radial glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 50% 48%, rgba(168,237,234,0.55), rgba(200,180,255,0.25), transparent 70%)',
        animation: 'megaGlowPulse 4.27s ease-in-out infinite, megaHueSpin 12s linear infinite',
      }}/>

      {/* Morph wave rings */}
      {morphing && [0,1,2].map(i => (
        <div key={i} style={{
          position:'absolute', left:'50%', top:'50%',
          width: 'min(360px, 40vw)', height: 'min(360px, 40vw)',
          borderRadius:'50%',
          border:`${2 - i * 0.5}px solid var(--hot)`,
          pointerEvents:'none', zIndex:3,
          animation: `megaMorphWave 0.62s ${i * 0.13}s ease-out both`,
        }}/>
      ))}

      {/* Top-left: revert button */}
      <div style={{
        position: 'absolute', top: 'clamp(78px,9vh,106px)', left: 'clamp(24px,3.5vw,70px)',
        zIndex: 4, display: 'flex', flexDirection: 'column', gap: 7,
        animation: revealed ? 'megaSlideUp 800ms 667ms ease-out both' : 'none',
      }}>
        <button className="btn ghost" onClick={onBack}
          style={{ padding: '7px 16px', fontSize: 10, letterSpacing: '0.18em' }}>
          ← REVERT
        </button>
      </div>

      {/* Left-side stat radar panel */}
      <div style={{
        position: 'absolute', left: 'clamp(24px,3.5vw,56px)', top: '32%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        animation: revealed ? 'megaSlideUp 800ms 900ms ease-out both' : 'none',
      }}>
        <div style={{
          fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.26em',
          textTransform: 'uppercase', color: 'var(--ink-mute)',
        }}>Base Stats</div>
        <div style={{
          opacity: radarFading ? 0 : 1,
          transform: radarFading ? 'scale(0.9)' : 'scale(1)',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}>
          <window.StatPolygon
            family={evoChain.length ? evoChain : [basePokemon]}
            activePokemon={radarTarget}
            size={198}
          />
        </div>
        {evoChain.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
            {evoChain.map(p => {
              const isSel = p.number === radarTarget.number;
              return (
                <button key={p.number} onClick={() => selectRadarTarget(p)} style={{
                  all: 'unset', cursor: isSel ? 'default' : 'pointer',
                  fontFamily: 'var(--haas)', fontSize: 8, padding: '4px 10px', borderRadius: 999,
                  border: `1px solid ${isSel ? 'rgba(217,74,61,0.5)' : 'rgba(17,17,17,0.15)'}`,
                  color: isSel ? 'var(--hot)' : 'var(--ink-mute)',
                  background: isSel ? 'rgba(217,74,61,0.08)' : 'transparent',
                  fontWeight: isSel ? 700 : 400, transition: 'all 160ms',
                }}>{p.name}</button>
              );
            })}
          </div>
        )}
      </div>

      {/* Top-right: MEGA name block */}
      <div style={{
        position: 'absolute', top: 'clamp(88px,9vh,116px)', right: 'clamp(24px,3.5vw,70px)',
        textAlign: 'right', zIndex: 4, maxWidth: 'min(320px, 32vw)',
        animation: revealed ? 'megaSlideIn 1067ms 267ms ease-out both' : 'none',
      }}>
        <div style={{
          fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 7,
        }}>
          #{String(megaPokemon.number).padStart(4,'0')} · MEGA EVOLUTION
        </div>
        <div style={{
          fontFamily: 'var(--haas)', fontWeight: 900,
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

        {/* Variant toggle */}
        {hasVariants && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10, flexWrap: 'wrap' }}>
            {megaForms.map((form, i) => {
              const label = megaVariantLabel(form.name) || 'Base';
              const isActive = i === activeIdx;
              return (
                <button key={i} onClick={() => switchVariant(i)} style={{
                  all: 'unset', cursor: 'pointer',
                  fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', borderRadius: 999,
                  border: `1px solid ${isActive ? 'var(--hot)' : 'rgba(17,17,17,0.22)'}`,
                  color: isActive ? 'var(--hot)' : 'var(--ink-mute)',
                  background: isActive ? 'rgba(217,74,61,0.08)' : 'transparent',
                  transition: 'all 200ms ease',
                  fontWeight: isActive ? 700 : 400,
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Shiny toggle */}
        {!hasGif && (
          <button onClick={() => setShiny(s => !s)} style={{
            all: 'unset', cursor: 'pointer', marginTop: 10,
            fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 999,
            border: `1px solid ${shiny ? '#c79a2a' : 'rgba(17,17,17,0.25)'}`,
            color: shiny ? '#c79a2a' : 'var(--ink-mute)',
            background: shiny ? 'rgba(199,154,42,0.1)' : 'transparent',
            transition: 'all 200ms ease',
          }}>✦ shiny</button>
        )}

        {/* Flavor description */}
        {basePokemon.flavor && (
          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: '1px solid rgba(17,17,17,0.1)',
            fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.07em',
            color: 'var(--ink-mute)', lineHeight: 1.75,
            fontStyle: 'italic', textAlign: 'right',
          }}>
            "{basePokemon.flavor}"
          </div>
        )}
      </div>

      {/* ── CENTER: mega sprite ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        marginTop: 'clamp(48px, 7vh, 88px)',
        animation: 'megaFloat 5.6s 133ms ease-in-out infinite',
      }}>
        <img
          key={megaPokemon.name}
          src={effectiveSprite}
          alt={megaPokemon.name}
          style={{
            width: 'min(260px, 28vw)', height: 'min(260px, 28vw)',
            objectFit: 'contain',
            imageRendering: hasGif ? 'auto' : 'pixelated',
            filter: 'drop-shadow(0 0 32px rgba(168,237,234,0.55)) drop-shadow(0 20px 24px rgba(0,0,0,0.2))',
            transition: 'opacity 280ms ease',
          }}
        />
      </div>

      {/* ── BELOW SPRITE: evolution chain + BST ── */}
      <div style={{
        position: 'relative', zIndex: 3,
        marginTop: 'clamp(20px, 3vh, 36px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        animation: revealed ? 'megaSlideUp 933ms 867ms ease-out both' : 'none',
      }}>

        {/* Evolution chain row — includes the mega as the final node */}
        {evoChain.length >= 1 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>

            {/* Standard evo stages */}
            {evoChain.map((p, i) => {
              const method = i > 0 ? (evoMethods[p.name.toLowerCase()] || '…') : null;
              return (
                <React.Fragment key={p.number}>

                  {/* Arrow with requirement box */}
                  {i > 0 && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                      {/* Requirement box — always visible, pinned above arrow */}
                      <div style={{
                        position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--paper)',
                        border: '1px solid rgba(17,17,17,0.18)',
                        borderRadius: 8, padding: '5px 12px',
                        fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.16em',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                        color: 'var(--ink)', fontWeight: 600,
                      }}>
                        {method}
                      </div>
                      <svg width={ARROW_W} height="18" viewBox="0 0 72 18" style={{ display: 'block', width: ARROW_W, height: 18 }}>
                        <line x1="0" y1="9" x2="56" y2="9" stroke="var(--ink)" strokeWidth="2" opacity="0.45"/>
                        <polygon points="56,4 72,9 56,14" fill="var(--ink)" opacity="0.45"/>
                      </svg>
                    </div>
                  )}

                  {/* Stage sprite */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    opacity: 0.5,
                    transform: 'scale(0.85)',
                    transition: 'all 220ms ease',
                  }}>
                    <img src={p.sprite} alt={p.name} style={{
                      width: SPRITE_SIZE, height: SPRITE_SIZE,
                      objectFit: 'contain', imageRendering: 'pixelated',
                    }}/>
                    <div style={{
                      fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.16em',
                      textTransform: 'uppercase', color: 'var(--ink-mute)',
                    }}>
                      {p.name}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Mega arrow */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
              {/* Mega Stone requirement box */}
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--paper)',
                border: '1px solid rgba(217,74,61,0.45)',
                borderRadius: 8, padding: '5px 12px',
                fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.16em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
                boxShadow: '0 3px 10px rgba(217,74,61,0.15)',
                color: 'var(--hot)', fontWeight: 700,
              }}>
                Mega Stone
              </div>
              <svg width={ARROW_W} height="18" viewBox="0 0 72 18" style={{ display: 'block', width: ARROW_W, height: 18 }}>
                <line x1="0" y1="9" x2="56" y2="9" stroke="var(--hot)" strokeWidth="2" opacity="0.7"/>
                <polygon points="56,4 72,9 56,14" fill="var(--hot)" opacity="0.7"/>
              </svg>
            </div>

            {/* Mega sprite — active / highlighted, sized at 60% of center sprite */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              opacity: 1,
              transition: 'all 220ms ease',
            }}>
              <img
                src={effectiveSprite}
                alt={megaPokemon.name}
                style={{
                  width: 'min(156px, 17vw)', height: 'min(156px, 17vw)',
                  objectFit: 'contain',
                  imageRendering: hasGif ? 'auto' : 'pixelated',
                  filter: 'drop-shadow(0 3px 14px rgba(217,74,61,0.65))',
                }}
              />
              <div style={{
                fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--hot)', fontWeight: 700,
              }}>
                {displayName}
              </div>
            </div>

          </div>
        )}

        {/* BST comparison */}
        <div style={{
          display: 'flex', gap: 28, alignItems: 'center',
          fontFamily: 'var(--haas)', fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--ink-mute)', whiteSpace: 'nowrap',
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
    </div>
  );
}

window.MegaView = MegaView;
window.megaDisplayName = megaDisplayName;
