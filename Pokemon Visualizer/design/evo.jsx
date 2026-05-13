// evo.jsx — evolution line reveal section
const { useState: useStateE, useEffect: useEffectE, useMemo: useMemoE, useRef: useRefE } = React;

function formatEvoDetail(det) {
  if (!det || !det.trigger) return { title: 'Unknown', sub: '' };
  const trigger = det.trigger.name;
  const tc = s => (s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (trigger === 'level-up') {
    const conds = [];

    if (det.gender === 1) conds.push('Female only');
    if (det.gender === 2) conds.push('Male only');

    if (det.location) conds.push('at ' + tc(det.location.name));
    if (det.party_species) conds.push('with ' + tc(det.party_species.name) + ' in party');
    if (det.party_type) conds.push('with a ' + tc(det.party_type.name) + '-type in party');

    if (det.held_item) conds.push('holding ' + tc(det.held_item.name));
    if (det.known_move) conds.push('knowing ' + tc(det.known_move.name));
    if (det.known_move_type) conds.push('knowing a ' + tc(det.known_move_type.name) + '-type move');

    if (det.needs_overworld_rain) conds.push('while it is raining outdoors');
    if (det.turn_upside_down) conds.push('hold the console upside down');

    if (det.relative_physical_stats === 1)  conds.push('Attack stat > Defense stat');
    if (det.relative_physical_stats === -1) conds.push('Defense stat > Attack stat');
    if (det.relative_physical_stats === 0)  conds.push('Attack stat = Defense stat');

    if (det.time_of_day === 'day')   conds.push('between 10:00 AM – 7:59 PM');
    if (det.time_of_day === 'night') conds.push('between 8:00 PM – 3:59 AM');
    if (det.time_of_day === 'dusk')  conds.push('between 5:00 PM – 5:59 PM');

    if (det.min_beauty)    conds.push('Beauty ≥ ' + det.min_beauty + ' (feed Poffins to raise it)');
    if (det.min_affection) conds.push('Affection ≥ ' + det.min_affection + ' hearts via Pokémon-Amie or Camp');

    if (det.min_happiness) {
      const friendshipLine = 'Raise Friendship to ' + det.min_happiness + '+ (walk, use vitamins, avoid fainting)';
      if (det.min_level) {
        return { title: 'Level ' + det.min_level, sub: [friendshipLine, ...conds].join(' · ') };
      }
      return { title: 'Friendship', sub: [friendshipLine, ...conds].join(' · ') };
    }

    if (det.min_level) {
      const sub = conds.length ? conds.join(' · ') : 'Gain EXP to reach this level (via battle, Rare Candy, etc.)';
      return { title: 'Level ' + det.min_level, sub };
    }

    const sub = conds.length ? conds.join(' · ') : 'Level up once (any level, any method)';
    return { title: 'Level Up', sub };
  }

  if (trigger === 'use-item') {
    const item = tc(det.item?.name || 'Item');
    const gender = det.gender === 1 ? ' — Female only' : det.gender === 2 ? ' — Male only' : '';
    return { title: item, sub: 'Open your bag and use this item directly on the Pokémon' + gender };
  }

  if (trigger === 'trade') {
    if (det.held_item) return {
      title: 'Trade',
      sub: 'Give the Pokémon ' + tc(det.held_item.name) + ' to hold, then trade it via Link Cable or online',
    };
    if (det.trade_species) return {
      title: 'Trade',
      sub: 'Trade this Pokémon specifically in exchange for ' + tc(det.trade_species.name),
    };
    return { title: 'Trade', sub: 'Trade via Link Cable or online with any other trainer' };
  }

  if (trigger === 'shed') return {
    title: 'Level 20',
    sub: 'Level Nincada to 20 with an empty slot in your party AND a spare Poké Ball in your bag — Shedinja appears in the empty slot',
  };

  if (trigger === 'three-critical-hits') return {
    title: '3 Critical Hits',
    sub: 'Land exactly 3 critical hits against a single opponent in one battle, then level up',
  };

  if (trigger === 'take-damage') return {
    title: 'Take Damage',
    sub: 'Lose 49+ HP in a single battle without fainting, then walk under the stone arch in the Dusty Bowl (Wild Area)',
  };

  if (trigger === 'spin') return {
    title: 'Spin',
    sub: 'Give Milcery a Sweet item to hold, then spin your character in place until they strike a pose',
  };

  if (trigger === 'tower-of-darkness') return {
    title: 'Tower of Darkness',
    sub: 'Bring Kubfu to the Tower of Darkness and complete all trials to unlock Single Strike Style',
  };

  if (trigger === 'tower-of-waters') return {
    title: 'Tower of Waters',
    sub: 'Bring Kubfu to the Tower of Waters and complete all trials to unlock Rapid Strike Style',
  };

  if (trigger === 'agile-style-move') return {
    title: 'Agile Style ×20',
    sub: 'Use ' + tc(det.known_move?.name || 'the required move') + ' in Agile Style 20 times in Pokémon Legends: Arceus, then level up',
  };

  if (trigger === 'strong-style-move') return {
    title: 'Strong Style ×20',
    sub: 'Use ' + tc(det.known_move?.name || 'the required move') + ' in Strong Style 20 times in Pokémon Legends: Arceus, then level up',
  };

  if (trigger === 'recoil-damage') return {
    title: 'Recoil Damage',
    sub: 'Accumulate enough recoil damage across battles (roughly 294 HP total) in Pokémon Legends: Arceus, then level up',
  };

  if (trigger === 'other') return {
    title: 'Special',
    sub: 'Unique condition — check Bulbapedia for the exact steps specific to this Pokémon',
  };

  return { title: tc(trigger), sub: '' };
}

const GMAX_MOVES = {
  'venusaur-gmax':               'G-Max Vine Lash',
  'charizard-gmax':              'G-Max Wildfire',
  'blastoise-gmax':              'G-Max Cannonade',
  'butterfree-gmax':             'G-Max Befuddle',
  'pikachu-gmax':                'G-Max Volt Crash',
  'meowth-gmax':                 'G-Max Gold Rush',
  'machamp-gmax':                'G-Max Chi Strike',
  'gengar-gmax':                 'G-Max Terror',
  'kingler-gmax':                'G-Max Foam Burst',
  'lapras-gmax':                 'G-Max Resonance',
  'eevee-gmax':                  'G-Max Cuddle',
  'snorlax-gmax':                'G-Max Replenish',
  'garbodor-gmax':               'G-Max Malodor',
  'melmetal-gmax':               'G-Max Meltdown',
  'rillaboom-gmax':              'G-Max Drum Solo',
  'cinderace-gmax':              'G-Max Fireball',
  'inteleon-gmax':               'G-Max Hydrosnipe',
  'corviknight-gmax':            'G-Max Wind Rage',
  'orbeetle-gmax':               'G-Max Gravitas',
  'drednaw-gmax':                'G-Max Stonesurge',
  'coalossal-gmax':              'G-Max Volcalith',
  'flapple-gmax':                'G-Max Tartness',
  'appletun-gmax':               'G-Max Sweetness',
  'sandaconda-gmax':             'G-Max Sandblast',
  'toxtricity-amped-gmax':       'G-Max Stun Shock',
  'toxtricity-low-key-gmax':     'G-Max Stun Shock',
  'centiskorch-gmax':            'G-Max Centiferno',
  'hatterene-gmax':              'G-Max Smite',
  'grimmsnarl-gmax':             'G-Max Snooze',
  'alcremie-gmax':               'G-Max Finale',
  'copperajah-gmax':             'G-Max Steelsurge',
  'duraludon-gmax':              'G-Max Depletion',
  'urshifu-single-strike-gmax':  'G-Max One Blow',
  'urshifu-rapid-strike-gmax':   'G-Max Rapid Flow',
};

function StatPolygon({ family, activePokemon, size = 340 }) {
  const cx = size / 2, cy = size / 2;
  const R = size * 0.36;
  const AXES  = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed'];
  const LABELS = ['HP', 'ATK', 'DEF', 'SP.ATK', 'SP.DEF', 'SPD'];
  const MAX_STAT = 255;

  function pts(p) {
    return AXES.map((key, i) => {
      const ang = ((i * 60 - 90) * Math.PI) / 180;
      const r = ((p[key] || 0) / MAX_STAT) * R;
      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    });
  }
  const str = arr => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const others = family.filter(p => p.number !== activePokemon.number);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Web grid */}
      {gridLevels.map(lv => (
        <polygon key={lv}
          points={str(AXES.map((_, i) => {
            const ang = ((i * 60 - 90) * Math.PI) / 180;
            return [cx + lv * R * Math.cos(ang), cy + lv * R * Math.sin(ang)];
          }))}
          fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.09"
        />
      ))}
      {/* Axis spokes */}
      {AXES.map((_, i) => {
        const ang = ((i * 60 - 90) * Math.PI) / 180;
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + R * Math.cos(ang)} y2={cy + R * Math.sin(ang)}
            stroke="var(--ink)" strokeWidth="0.6" opacity="0.09"
          />
        );
      })}
      {/* Other chain members — faint */}
      {others.map(p => (
        <polygon key={p.number}
          points={str(pts(p))}
          fill="var(--ink)" fillOpacity="0.05"
          stroke="var(--ink)" strokeWidth="1" strokeOpacity="0.14"
        />
      ))}
      {/* Active pokemon — hot color */}
      <polygon
        points={str(pts(activePokemon))}
        fill="var(--hot)" fillOpacity="0.10"
        stroke="var(--hot)" strokeWidth="1.5" strokeOpacity="0.45"
      />
      {/* Axis labels */}
      {LABELS.map((label, i) => {
        const ang = ((i * 60 - 90) * Math.PI) / 180;
        const lr = R + 17;
        return (
          <text key={i}
            x={cx + lr * Math.cos(ang)} y={cy + lr * Math.sin(ang)}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="var(--haas)" fontSize="7.5" fontWeight="600"
            fill="var(--ink)" opacity="0.28" letterSpacing="0.08em"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function EvoView({ pokemon, chain, onBack, onPick }) {
  const [revealed, setRevealed] = useStateE(false);
  const [evoMethods, setEvoMethods] = useStateE({});
  const [evoOrder, setEvoOrder] = useStateE({});
  const [gmaxScrolled, setGmaxScrolled] = useStateE(false);
  const gmaxRef = useRefE(null);

  // Sorted by API chain order (pre-order DFS), not dex number — fixes baby Pokémon like Pichu
  const evoFamily = useMemoE(() => {
    const fam = (chain || []).filter(p => !p.isForm);
    if (Object.keys(evoOrder).length > 0) {
      return [...fam].sort((a, b) => {
        const oa = evoOrder[a.name.toLowerCase()] ?? 999;
        const ob = evoOrder[b.name.toLowerCase()] ?? 999;
        return oa - ob;
      });
    }
    return [...fam].sort((a, b) => a.number - b.number);
  }, [chain, evoOrder]);

  // Find Gigantamax form for this pokemon
  const gmaxForm = useMemoE(() => {
    const all = window.__pokeAllFull || [];
    const baseName = pokemon.name.toLowerCase();
    return all.find(p => p.name.toLowerCase() === baseName + '-gmax') || null;
  }, [pokemon.name]);

  useEffectE(() => {
    if (!pokemon?.chainId) return;
    setRevealed(false);
    setEvoOrder({});
    const t = setTimeout(() => setRevealed(true), 300);

    fetch(`https://pokeapi.co/api/v2/evolution-chain/${pokemon.chainId}/`)
      .then(r => r.json())
      .then(data => {
        const methodMap = {};
        const orderMap = {};
        let idx = 0;
        function walk(node) {
          orderMap[node.species.name.toLowerCase()] = idx++;
          for (const evo of node.evolves_to) {
            methodMap[evo.species.name.toLowerCase()] = formatEvoDetail(evo.evolution_details[0] || {});
            walk(evo);
          }
        }
        walk(data.chain);
        setEvoMethods(methodMap);
        setEvoOrder(orderMap);
      })
      .catch(() => {});
    return () => clearTimeout(t);
  }, [pokemon?.chainId]);

  // Auto-hide G-MAX tabs when user scrolls the gmax section into view
  useEffectE(() => {
    if (!gmaxForm || gmaxScrolled) return;
    const root = document.getElementById('root');
    if (!root) return;
    const check = () => {
      if (!gmaxRef.current) return;
      if (gmaxRef.current.getBoundingClientRect().top < window.innerHeight * 0.75) {
        setGmaxScrolled(true);
      }
    };
    root.addEventListener('scroll', check, { passive: true });
    return () => root.removeEventListener('scroll', check);
  }, [gmaxForm, gmaxScrolled]);

  const noEvo = evoFamily.length <= 1;
  const gmaxMoveName = gmaxForm ? (GMAX_MOVES[gmaxForm.name.toLowerCase()] || 'G-Max Move') : null;

  function scrollToGmax() {
    const root = document.getElementById('root');
    if (root && gmaxRef.current) {
      const rect = gmaxRef.current.getBoundingClientRect();
      root.scrollTo({ top: root.scrollTop + rect.top, behavior: 'smooth' });
    }
    setGmaxScrolled(true);
  }

  return (
    <div style={{
      position: 'relative', width: '100%',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      opacity: revealed ? 1 : 0,
      transition: 'opacity 800ms ease-out',
    }}>
      <style>{`
        @keyframes evoUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gmaxPulse {
          0%, 100% { opacity: 0.14; transform: scale(1); }
          50%       { opacity: 0.26; transform: scale(1.08); }
        }
        @keyframes gmaxBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(7px); }
        }
      `}</style>

      {/* ─── SECTION 1: Evolution Chain ─── */}
      <div style={{
        position: 'relative', width: '100%', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Subtle blue glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(168,200,255,0.13), transparent 70%)',
        }}/>

        {/* Stat polygon radar — right-side panel */}
        <div style={{
          position: 'absolute', right: 'clamp(20px, 3.5vw, 56px)', top: '50vh',
          transform: 'translateY(-50%)',
          zIndex: 3, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          animation: 'evoUp 800ms 500ms ease-out both',
        }}>
          <div style={{
            fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.26em',
            textTransform: 'uppercase', color: 'var(--ink-mute)',
          }}>
            Base Stats
          </div>
          <StatPolygon family={evoFamily} activePokemon={pokemon} size={220}/>
          {evoFamily.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {evoFamily.map(p => {
                const isActive = p.number === pokemon.number;
                return (
                  <div key={p.number} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: isActive ? 'var(--hot)' : 'var(--ink)',
                      opacity: isActive ? 1 : 0.28,
                    }}/>
                    <div style={{
                      fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.08em',
                      color: isActive ? 'var(--ink)' : 'var(--ink-mute)',
                      opacity: isActive ? 0.85 : 0.5,
                    }}>
                      {p.name}<span style={{ marginLeft: 5, opacity: 0.6 }}>{p.bst}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back button */}
        <div style={{
          position: 'absolute', top: 'clamp(78px,9vh,106px)', left: 'clamp(24px,3.5vw,70px)',
          zIndex: 4,
          animation: 'evoUp 600ms 250ms ease-out both',
        }}>
          <button className="btn ghost" onClick={onBack}
            style={{ padding: '7px 16px', fontSize: 10, letterSpacing: '0.18em' }}>
            ← BACK
          </button>
        </div>

        {/* Title */}
        <div style={{
          textAlign: 'center', zIndex: 2,
          marginBottom: 'clamp(32px, 5vh, 64px)',
          animation: 'evoUp 700ms 150ms ease-out both',
        }}>
          <div style={{
            fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8,
          }}>
            #{String(pokemon.number).padStart(4,'0')} · EVOLUTIONARY LINE
          </div>
          <div style={{
            fontFamily: 'var(--haas)', fontWeight: 900,
            fontSize: 'clamp(28px, 4.5vw, 60px)',
            letterSpacing: '-0.04em', lineHeight: 0.9,
            textTransform: 'uppercase', fontStyle: 'italic',
            color: 'var(--ink)',
            textShadow: '2px 2px 0 rgba(17,17,17,0.08)',
          }}>
            Evolution Line
          </div>
        </div>

        {/* Does not evolve */}
        {noEvo ? (
          <div style={{
            zIndex: 2, textAlign: 'center',
            animation: 'evoUp 700ms 350ms ease-out both',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
          }}>
            <img src={pokemon.sprite} alt={pokemon.name} style={{
              width: 'min(220px, 26vw)', height: 'min(220px, 26vw)',
              objectFit: 'contain', imageRendering: 'pixelated',
              filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.2))',
            }}/>
            <div style={{
              fontFamily: 'var(--haas)', fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--ink-mute)',
            }}>
              This Pokémon does not evolve.
            </div>
          </div>
        ) : (
          /* Chain — horizontally scrollable for long families (Eevee etc.) */
          <div style={{
            zIndex: 2, width: '100%', overflowX: 'auto', overflowY: 'visible',
            display: 'flex', justifyContent: 'center',
            animation: 'evoUp 700ms 350ms ease-out both',
            padding: '96px clamp(32px,5vw,80px) 20px',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {evoFamily.map((p, i) => {
                const isActive = p.number === pokemon.number;
                const method = i > 0 ? evoMethods[p.name.toLowerCase()] : null;
                return (
                  <React.Fragment key={p.number}>

                    {/* Arrow + requirement card */}
                    {i > 0 && (
                      <div style={{
                        position: 'relative', display: 'flex', alignItems: 'center',
                        padding: '0 16px', flexShrink: 0,
                      }}>
                        {/* Card floats above the arrow */}
                        <div style={{
                          position: 'absolute', bottom: 'calc(100% + 18px)', left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'var(--paper)',
                          border: '1px solid rgba(17,17,17,0.14)',
                          borderRadius: 14, padding: '12px 18px',
                          display: 'flex', flexDirection: 'column', gap: 6,
                          alignItems: 'center', textAlign: 'center',
                          boxShadow: '0 6px 22px rgba(0,0,0,0.11)',
                          minWidth: 140, maxWidth: 210,
                          zIndex: 5,
                          whiteSpace: 'normal',
                        }}>
                          <div style={{
                            fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.22em',
                            textTransform: 'uppercase', color: 'var(--ink-mute)',
                          }}>
                            How to Evolve
                          </div>
                          <div style={{
                            fontFamily: 'var(--haas)', fontWeight: 800,
                            fontSize: 'clamp(14px, 1.4vw, 19px)',
                            letterSpacing: '-0.02em', lineHeight: 1.1,
                            color: 'var(--ink)',
                          }}>
                            {method?.title || '…'}
                          </div>
                          {method?.sub && (
                            <div style={{
                              fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.08em',
                              color: 'var(--ink-mute)', lineHeight: 1.55,
                              textAlign: 'center',
                            }}>
                              {method.sub}
                            </div>
                          )}
                        </div>
                        {/* Arrow */}
                        <svg width="96" height="28" viewBox="0 0 96 28" style={{ display: 'block' }}>
                          <line x1="0" y1="14" x2="74" y2="14" stroke="var(--ink)" strokeWidth="2.5" opacity="0.32"/>
                          <polygon points="74,7 96,14 74,21" fill="var(--ink)" opacity="0.32"/>
                        </svg>
                      </div>
                    )}

                    {/* Pokémon stage */}
                    <div
                      onClick={() => !isActive && onPick?.(p)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                        opacity: isActive ? 1 : 0.48,
                        transform: isActive ? 'scale(1.1)' : 'scale(0.88)',
                        transition: 'all 220ms ease',
                        cursor: isActive ? 'default' : 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <img src={p.sprite} alt={p.name} style={{
                        width: 'min(190px, 16vw)', height: 'min(190px, 16vw)',
                        objectFit: 'contain', imageRendering: 'pixelated',
                        filter: isActive
                          ? 'drop-shadow(0 6px 18px rgba(217,74,61,0.5))'
                          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))',
                        transition: 'filter 220ms ease',
                      }}/>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          fontFamily: 'var(--haas)', fontWeight: 700,
                          fontSize: 'clamp(12px, 1.2vw, 16px)',
                          letterSpacing: '-0.01em',
                          color: isActive ? 'var(--hot)' : 'var(--ink)',
                        }}>
                          {p.name}
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <span className={'type-chip t-' + p.type1.toLowerCase()}
                            style={{ fontSize: 9, padding: '3px 9px' }}>{p.type1}</span>
                          {p.type2 && <span className={'type-chip t-' + p.type2.toLowerCase()}
                            style={{ fontSize: 9, padding: '3px 9px' }}>{p.type2}</span>}
                        </div>
                      </div>
                    </div>

                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ─── G-MAX side tabs — fixed, mid-screen, disappear on scroll or click ─── */}
      {gmaxForm && !gmaxScrolled && (
        <>
          {/* Left tab */}
          <div
            onClick={scrollToGmax}
            style={{
              position: 'fixed', left: 0, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 60, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--paper)',
              border: '1px solid rgba(217,74,61,0.30)',
              borderLeft: 'none',
              borderRadius: '0 10px 10px 0',
              padding: '12px 16px 12px 10px',
              boxShadow: '3px 0 16px rgba(0,0,0,0.10)',
              transition: 'background 160ms, box-shadow 160ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,74,61,0.07)'; e.currentTarget.style.boxShadow = '3px 0 22px rgba(0,0,0,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.boxShadow = '3px 0 16px rgba(0,0,0,0.10)'; }}
          >
            <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0 }}>
              <polyline points="2,2 8,7 2,12" fill="none" stroke="var(--hot)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontFamily: 'var(--haas)', fontSize: 7, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                scroll to
              </div>
              <div style={{ fontFamily: 'var(--haas)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--hot)' }}>
                G-MAX
              </div>
            </div>
          </div>

          {/* Right tab */}
          <div
            onClick={scrollToGmax}
            style={{
              position: 'fixed', right: 0, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 60, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--paper)',
              border: '1px solid rgba(217,74,61,0.30)',
              borderRight: 'none',
              borderRadius: '10px 0 0 10px',
              padding: '12px 10px 12px 16px',
              boxShadow: '-3px 0 16px rgba(0,0,0,0.10)',
              transition: 'background 160ms, box-shadow 160ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,74,61,0.07)'; e.currentTarget.style.boxShadow = '-3px 0 22px rgba(0,0,0,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.boxShadow = '-3px 0 16px rgba(0,0,0,0.10)'; }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
              <div style={{ fontFamily: 'var(--haas)', fontSize: 7, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                scroll to
              </div>
              <div style={{ fontFamily: 'var(--haas)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--hot)' }}>
                G-MAX
              </div>
            </div>
            <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0 }}>
              <polyline points="8,2 2,7 8,12" fill="none" stroke="var(--hot)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </>
      )}

      {/* ─── SECTION 2: Gigantamax ─── */}
      {gmaxForm && (
        <div ref={gmaxRef} style={{
          position: 'relative', width: '100%', minHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(48px,7vh,80px) clamp(24px,4vw,60px)',
          boxSizing: 'border-box',
        }}>
          {/* Crimson radial glow */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,50,50,0.10), transparent 75%)',
          }}/>
          {/* Pulsing aura blob */}
          <div style={{
            position: 'absolute', zIndex: 0, pointerEvents: 'none',
            width: 'min(420px, 46vw)', height: 'min(420px, 46vw)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,60,60,0.18), transparent 70%)',
            animation: 'gmaxPulse 3s ease-in-out infinite',
          }}/>

          {/* Section title */}
          <div style={{
            zIndex: 2, textAlign: 'center',
            marginBottom: 'clamp(28px,4vh,52px)',
            animation: 'evoUp 700ms 150ms ease-out both',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center',
              marginBottom: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--hot)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--haas)', fontWeight: 900, fontSize: 18,
                boxShadow: '0 4px 14px rgba(217,74,61,0.45)', flexShrink: 0,
              }}>G</div>
              <div style={{
                fontFamily: 'var(--haas)', fontWeight: 900,
                fontSize: 'clamp(26px,4vw,56px)',
                letterSpacing: '-0.04em', lineHeight: 0.9,
                textTransform: 'uppercase', fontStyle: 'italic',
                color: 'var(--ink)',
              }}>
                Gigantamax
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--hot)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--haas)', fontWeight: 900, fontSize: 18,
                boxShadow: '0 4px 14px rgba(217,74,61,0.45)', flexShrink: 0,
              }}>G</div>
            </div>
            <div style={{
              fontFamily: 'var(--haas)', fontSize: 9, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--ink-mute)',
            }}>
              Sword &amp; Shield · Max Raid Battles
            </div>
          </div>

          {/* Sprite comparison: base → Gmax */}
          <div style={{
            zIndex: 2, display: 'flex', alignItems: 'center',
            gap: 'clamp(16px,3vw,52px)',
            marginBottom: 'clamp(24px,4vh,48px)',
            animation: 'evoUp 700ms 300ms ease-out both',
          }}>
            {/* Base form */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity:0.52 }}>
              <img src={pokemon.sprite} alt={pokemon.name} style={{
                width: 'min(96px,9vw)', height: 'min(96px,9vw)',
                objectFit: 'contain', imageRendering: 'pixelated',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.14))',
              }}/>
              <div style={{
                fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--ink-mute)',
              }}>
                {pokemon.name}
              </div>
            </div>

            {/* Arrow with label */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--hot)',
              }}>
                Gigantamax Factor
              </div>
              <svg width="80" height="20" viewBox="0 0 80 20" style={{ display:'block' }}>
                <line x1="0" y1="10" x2="60" y2="10" stroke="var(--hot)" strokeWidth="2" opacity="0.7"/>
                <polygon points="60,4 80,10 60,16" fill="var(--hot)" opacity="0.7"/>
              </svg>
            </div>

            {/* Gmax form (large) */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <img src={gmaxForm.sprite} alt={gmaxForm.name} style={{
                width: 'min(240px,22vw)', height: 'min(240px,22vw)',
                objectFit: 'contain', imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 30px rgba(217,74,61,0.58)) drop-shadow(0 12px 24px rgba(0,0,0,0.26))',
              }}/>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{
                  fontFamily: 'var(--haas)', fontWeight: 800,
                  fontSize: 'clamp(14px,1.4vw,19px)',
                  letterSpacing: '-0.01em', color: 'var(--hot)',
                }}>
                  {gmaxForm.name}
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <span className={'type-chip t-' + gmaxForm.type1.toLowerCase()}
                    style={{ fontSize:9, padding:'3px 9px' }}>{gmaxForm.type1}</span>
                  {gmaxForm.type2 && <span className={'type-chip t-' + gmaxForm.type2.toLowerCase()}
                    style={{ fontSize:9, padding:'3px 9px' }}>{gmaxForm.type2}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* G-Max move badge + description */}
          <div style={{
            zIndex: 2, textAlign: 'center', maxWidth: 520,
            animation: 'evoUp 700ms 450ms ease-out both',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(217,74,61,0.10)',
              border: '1px solid rgba(217,74,61,0.35)',
              borderRadius: 10, padding: '8px 20px',
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: 'var(--haas)', fontSize: 8, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'var(--ink-mute)',
              }}>G-Max Move</div>
              <div style={{
                fontFamily: 'var(--haas)', fontWeight: 800,
                fontSize: 'clamp(13px,1.3vw,17px)',
                letterSpacing: '-0.01em', color: 'var(--hot)',
              }}>
                {gmaxMoveName}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--haas)', fontSize: 10, letterSpacing: '0.08em',
              color: 'var(--ink-mute)', lineHeight: 1.8,
            }}>
              Only Pokémon bearing the <strong style={{ color:'var(--ink)' }}>Gigantamax Factor</strong> can
              reach this form — most commonly obtained through Max Raid Battles in Pokémon Sword &amp; Shield,
              or by feeding a <strong style={{ color:'var(--ink)' }}>Max Soup</strong> (Isle of Armor DLC).
              Once Gigantamaxed, the standard Max Move is replaced by the exclusive{' '}
              <strong style={{ color:'var(--hot)' }}>{gmaxMoveName}</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.EvoView = EvoView;
