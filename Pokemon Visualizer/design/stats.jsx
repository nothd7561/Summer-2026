// stats.jsx — clean, spaced, witch-style minimal
const { useState: useStateS, useMemo: useMemoS, useRef: useRefS, useEffect: useEffectS } = React;

const STAT_T = {
  EN: {
    menu: '// MENU', back: '← BACK', random: '↻ RANDOM', dossier: 'DOSSIER',
    nav: ['Overview', 'Statistics', 'Morphology', 'Environment', 'Abilities'],
    stage: (n, t) => `STAGE ${n} OF ${t} · CLICK TO SWITCH`,
    noChain: 'NO EVOLUTIONARY CHAIN',
    legendary: 'LEGENDARY', mythical: 'MYTHICAL',
    height: 'HEIGHT', weight: 'WEIGHT', bst: 'BASE STAT TOTAL', xp: 'BASE XP',
    shape: 'SHAPE', color: 'COLOR', habitat: 'HABITAT', growth: 'GROWTH',
    capture: 'CAPTURE', happiness: 'HAPPINESS', eggGroups: 'EGG GROUPS',
    ability: 'ABILITY', hiddenAbility: 'HIDDEN ABILITY', bstTotal: 'BASE STAT TOTAL',
    morphDesc: 'Physical form, scale, and visual classification.',
    envDesc: 'Habitat and reproduction.', gen: 'gen',
  },
  JP: {
    menu: '// メニュー', back: '← 戻る', random: '↻ ランダム', dossier: 'ファイル',
    nav: ['概要', '統計', '形態', '環境', '技能'],
    stage: (n, t) => `段階 ${n}/${t} · クリックで切替`,
    noChain: '進化なし',
    legendary: '伝説', mythical: '幻',
    height: '高さ', weight: '重さ', bst: '合計種族値', xp: '基本経験値',
    shape: '形', color: '色', habitat: '生息地', growth: '成長率',
    capture: '捕獲率', happiness: '親密度', eggGroups: '卵グループ',
    ability: '特性', hiddenAbility: '夢特性', bstTotal: '合計種族値',
    morphDesc: '外見・サイズ・形態分類', envDesc: '生息地と繁殖', gen: '世代',
  },
  ZH: {
    menu: '// 菜单', back: '← 返回', random: '↻ 随机', dossier: '档案',
    nav: ['概览', '统计', '形态', '环境', '技能'],
    stage: (n, t) => `阶段 ${n}/${t} · 点击切换`,
    noChain: '无进化链',
    legendary: '传说', mythical: '幻之',
    height: '身高', weight: '体重', bst: '种族值合计', xp: '基础经验',
    shape: '形状', color: '颜色', habitat: '栖息地', growth: '成长速度',
    capture: '捕获率', happiness: '亲密度', eggGroups: '蛋组',
    ability: '特性', hiddenAbility: '梦特性', bstTotal: '种族值合计',
    morphDesc: '外形、体型与视觉分类', envDesc: '栖息地与繁殖', gen: '世代',
  },
};

// rings sized dynamically per sprite — see dynBASE_R / dynRING_GAP in Stats

function Stats({ pokemon, chain, onBack, onPick, locale = 'EN' }) {
  const [tab, setTab] = useStateS('overview');
  const [hoveredRing, setHoveredRing] = useStateS(null);
  const t = STAT_T[locale] || STAT_T.EN;
  const mainline = window.PokeData.mainlineChain(chain);
  const NAV = t.nav.map((label, i) => ({ id: ['overview','statistics','morphology','environment','abilities'][i], label }));
  const hovP = hoveredRing !== null ? mainline[hoveredRing] : null;

  // dynamic ring sizing — measure the actual rendered sprite container
  const spriteRef = useRefS(null);
  const popupRef = useRefS(null);
  const [shiny, setShiny] = useStateS(false);
  const [spriteR, setSpriteR] = useStateS(Math.min(320, window.innerWidth * 0.32) / 2);

  useEffectS(() => {
    if (!spriteRef.current) return;
    const obs = new ResizeObserver(([e]) => setSpriteR(e.contentRect.width / 2));
    obs.observe(spriteRef.current);
    return () => obs.disconnect();
  }, []);

  // Reset shiny when pokemon changes
  useEffectS(() => { setShiny(false); }, [pokemon.number]);

  const dynBASE_R = spriteR + 55;
  const dynRING_GAP = 24;

  const shinySprite = pokemon.sprite?.replace('/pokemon/', '/pokemon/shiny/');

  function handleRingMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
    let closest = null, minDiff = 24;
    for (let i = 0; i < mainline.length; i++) {
      const r = dynBASE_R + i * dynRING_GAP;
      const diff = Math.abs(dist - r);
      if (diff < minDiff) { minDiff = diff; closest = i; }
    }
    setHoveredRing(closest);
  }

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', zIndex: 5,
      display:'grid',
      gridTemplateColumns: 'minmax(160px, 200px) 1fr minmax(300px, 400px)',
      gridTemplateRows: '1fr',
      overflow: 'hidden',
    }}>

      {/* LEFT NAV — buttons at top under brand, nav centered */}
      <div style={{
        position:'relative',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'0 0 0 clamp(24px, 3.5vw, 70px)',
      }}>
        <div style={{
          position:'absolute', top:'clamp(70px, 9vh, 100px)', left:'clamp(24px, 3.5vw, 70px)',
          display:'flex', flexDirection:'column', gap:10,
        }}>
          <div style={{ display:'flex', gap:6 }}>
            <button className="btn ghost" onClick={onBack}
              style={{ padding:'7px 14px', fontSize:10, letterSpacing:'0.16em' }}>
              {t.back}
            </button>
            <button className="btn" onClick={() => {
              const pool = window.__pokeAll || [];
              const r = pool[Math.floor(Math.random() * pool.length)];
              if (r && onPick) onPick(r);
            }} style={{ padding:'7px 14px', fontSize:10, letterSpacing:'0.16em' }}>
              {t.random}
            </button>
          </div>
          <div style={{
            fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.16em',
            textTransform:'uppercase', color:'var(--ink-mute)', paddingLeft:2,
          }}>
            Hover over lines for evolution stages
          </div>
        </div>
        <div className="sidenav">
          {NAV.map(item => (
            <button key={item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER — rings sized to sprite, popup outside ring area so it's clickable */}
      <div style={{ position:'relative', display:'flex', flexDirection:'column',
        alignItems:'center',
        padding:'clamp(70px, 9vh, 100px) 16px clamp(50px, 6vh, 75px) 16px',
        minHeight:0, overflow:'hidden',
      }}>
        {/* ring + sprite — mousemove here drives ring detection */}
        <div style={{
          position:'relative', flex:1, minHeight:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          width:'100%',
          cursor: hovP && hovP.number !== pokemon.number ? 'pointer' : 'default',
        }}
          onMouseMove={handleRingMouseMove}
          onMouseLeave={() => setHoveredRing(null)}
          onClick={() => { if (hovP && hovP.number !== pokemon.number) onPick && onPick(hovP); }}>

          <EvolutionRings rings={Math.max(1, mainline.length)} active={pokemon} chain={mainline}
            hoveredRing={hoveredRing} baseR={dynBASE_R} ringGap={dynRING_GAP}/>

          <div ref={spriteRef}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.classList.remove('bounce'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('bounce'); }}
            style={{ position:'relative', zIndex:3, width:'min(320px, 32vw)', aspectRatio:'1/1', cursor:'pointer' }}>
            <style>{`@keyframes spriteBounce{0%,100%{transform:translateY(0) scale(1);}30%{transform:translateY(-18px) scale(1.05);}60%{transform:translateY(7px) scale(0.98);}} .bounce img{animation:spriteBounce 700ms cubic-bezier(.2,.7,.2,1);}`}</style>
<img src={shiny ? shinySprite : pokemon.sprite} alt={pokemon.name} style={{
              width:'100%', height:'100%', objectFit:'contain', imageRendering:'pixelated',
              filter:'drop-shadow(0 24px 28px rgba(0,0,0,0.22))',
            }}/>
          </div>
        </div>

        {/* evolution popup — sibling of ring area; cursor leaving ring starts a 150ms timer,
            entering popup cancels it, so the card stays alive for clicking */}
        {hovP && (
          <div ref={popupRef}
            onClick={() => { if (hovP.number !== pokemon.number) onPick && onPick(hovP); }}
            style={{
              position:'fixed', bottom:40, left:'clamp(24px, 3.5vw, 70px)',
              zIndex:10, pointerEvents:'auto',
              cursor: hovP.number !== pokemon.number ? 'pointer' : 'default',
              background:'var(--card)', border:'1px solid var(--line)',
              borderRadius:16, padding:'10px 14px',
              display:'flex', alignItems:'center', gap:10,
              boxShadow:'0 8px 24px rgba(0,0,0,0.1)',
              whiteSpace:'nowrap',
            }}>
            <img src={hovP.sprite} alt={hovP.name} style={{ width:44, height:44, objectFit:'contain', imageRendering:'pixelated' }}/>
            <div>
              <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13 }}>{hovP.name}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em', marginTop:2 }}>#{String(hovP.number).padStart(4,'0')}</div>
            </div>
            <span className={'type-chip t-' + hovP.type1.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>{hovP.type1}</span>
            {hovP.type2 && <span className={'type-chip t-' + hovP.type2.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>{hovP.type2}</span>}
            {hovP.number !== pokemon.number && (
              <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--hot)', letterSpacing:'0.14em' }}>→ SWITCH</span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — name + dossier panel */}
      <div style={{
        padding:'clamp(70px, 9vh, 100px) clamp(24px, 3.5vw, 70px) clamp(50px, 6vh, 75px) 12px',
        display:'flex', flexDirection:'column', gap:14, minWidth:0, overflow:'hidden',
      }}>
        <div style={{
          fontFamily:'var(--display)', fontWeight:600,
          fontSize:12, letterSpacing:'0.32em', textTransform:'uppercase',
          color:'var(--ink-mute)',
        }}>
          {t.dossier} — › {String(pokemon.number).padStart(4,'0')}
        </div>

        <div>
          <h1 style={{
            fontFamily:'var(--display)', fontWeight:900,
            fontSize:`clamp(30px, ${Math.max(26, 100 - pokemon.name.length * 6)}px, 88px)`,
            lineHeight:0.88, letterSpacing:'-0.05em',
            color:'var(--hot)', margin:0, wordBreak:'break-word',
            textTransform:'uppercase', fontStyle:'italic',
            textShadow:'3px 3px 0 rgba(17,17,17,0.92)',
          }}>
            {pokemon.name}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
              {t.gen} {pokemon.generation.replace('gen-','').toUpperCase()}
            </div>
            <button onClick={() => setShiny(s => !s)} style={{
              all:'unset', cursor:'pointer',
              fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase',
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'4px 10px', borderRadius:999,
              border:`1px solid ${shiny ? '#c79a2a' : 'rgba(17,17,17,0.25)'}`,
              color: shiny ? '#c79a2a' : 'var(--ink-mute)',
              background: shiny ? 'rgba(199,154,42,0.1)' : 'transparent',
              transition:'all 200ms ease',
            }}>
              ✦ shiny
            </button>
          </div>
        </div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <span className={'type-chip solid t-' + pokemon.type1.toLowerCase()}>{pokemon.type1}</span>
          {pokemon.type2 && <span className={'type-chip solid t-' + pokemon.type2.toLowerCase()}>{pokemon.type2}</span>}
          {pokemon.isLegendary && <span className="type-chip" style={{ color:'var(--hot)', borderColor:'var(--hot)' }}>{t.legendary}</span>}
          {pokemon.isMythical && <span className="type-chip" style={{ color:'var(--hot)', borderColor:'var(--hot)' }}>{t.mythical}</span>}
        </div>

        <div className="dot-rule"/>

        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0 }}>
          <div style={{ marginBottom:16, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:16, letterSpacing:'0.18em', textTransform:'uppercase' }}>
              → {NAV.find(n=>n.id===tab)?.label}
            </span>
            <div style={{ display:'flex', gap:14 }}>
              {NAV.findIndex(n => n.id === tab) > 0 && (
                <button onClick={() => setTab(NAV[NAV.findIndex(n => n.id === tab) - 1].id)} style={{
                  all:'unset', cursor:'pointer',
                  fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase',
                  color:'var(--ink-mute)', borderBottom:'1px dashed var(--ink-mute)', paddingBottom:1,
                  transition:'color 160ms, border-color 160ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--ink)'; e.currentTarget.style.borderColor='var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--ink-mute)'; e.currentTarget.style.borderColor='var(--ink-mute)'; }}>
                  ← back
                </button>
              )}
              {NAV.findIndex(n => n.id === tab) < NAV.length - 1 && (
                <button onClick={() => setTab(NAV[NAV.findIndex(n => n.id === tab) + 1].id)} style={{
                  all:'unset', cursor:'pointer',
                  fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase',
                  color:'var(--ink-mute)', borderBottom:'1px dashed var(--ink-mute)', paddingBottom:1,
                  transition:'color 160ms, border-color 160ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--ink)'; e.currentTarget.style.borderColor='var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--ink-mute)'; e.currentTarget.style.borderColor='var(--ink-mute)'; }}>
                  next →
                </button>
              )}
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', paddingRight:6 }} className="no-scrollbar">
            <div style={{ display: tab === 'overview'     ? undefined : 'none' }}><Overview p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'statistics'   ? undefined : 'none' }}><Statistics p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'morphology'   ? undefined : 'none' }}><Morphology p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'environment'  ? undefined : 'none' }}><Environment p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'abilities'    ? undefined : 'none' }}><Abilities p={pokemon} t={t}/></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ——— tabs ——— */
function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

function Overview({ p, t }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <p style={{ margin:0, fontSize:13, lineHeight:1.75 }}>{p.flavor ? toSentenceCase(p.flavor) : '—'}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Cell label={t.height} value={p.height + ' m'}/>
        <Cell label={t.weight} value={p.weight + ' kg'}/>
        <Cell label={t.bst} value={p.bst}/>
        <Cell label={t.xp} value={p.baseXp || '—'}/>
      </div>
    </div>
  );
}

function Statistics({ p, t }) {
  const stats = [
    ['HP', p.hp, p.hpN], ['ATTACK', p.atk, p.atkN], ['DEFENSE', p.def, p.defN],
    ['SP. ATK', p.spAtk, p.spAtkN], ['SP. DEF', p.spDef, p.spDefN], ['SPEED', p.speed, p.speedN],
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {stats.map(([name, val, norm]) => (
        <div key={name}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 7 }}>
            <span style={{ fontFamily:'var(--display)', fontWeight:600, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-mute)' }}>{name}</span>
            <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:14 }}>
              {val}<span style={{color:'var(--ink-mute)', fontWeight:400, fontSize:10}}> /255</span>
            </span>
          </div>
          <div className={'statbar ' + (norm > 0.65 ? 'hot' : '')}>
            <div style={{ width: `${((norm||0) * 100).toFixed(1)}%` }}/>
          </div>
        </div>
      ))}
      <div className="dot-rule" style={{ marginTop: 4 }}/>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
        <span>{t.bstTotal}</span>
        <span style={{color:'var(--ink)'}}><b>{p.bst}</b> / 720</span>
      </div>
    </div>
  );
}

function Morphology({ p, t }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <p style={{ margin:0, fontSize:13, lineHeight:1.7, color:'var(--ink-mute)' }}>{t.morphDesc}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Cell label={t.shape} value={window.PokeData.titleCase(p.shape)}/>
        <Cell label={t.color} value={window.PokeData.titleCase(p.color)}/>
        <Cell label={t.height} value={p.height + ' m'}/>
        <Cell label={t.weight} value={p.weight + ' kg'}/>
      </div>
      <Swatch color={p.color}/>
    </div>
  );
}

function Environment({ p, t }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <p style={{ margin:0, fontSize:13, lineHeight:1.7, color:'var(--ink-mute)' }}>{t.envDesc}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Cell label={t.habitat} value={window.PokeData.titleCase(p.habitat || 'unknown')}/>
        <Cell label={t.growth} value={window.PokeData.titleCase(p.growthRate)}/>
        <Cell label={t.capture} value={p.captureRate}/>
        <Cell label={t.happiness} value={p.baseHappiness}/>
      </div>
      <div>
        <div className="mono-meta" style={{ marginBottom: 8 }}>{t.eggGroups}</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {(p.eggGroups || []).map(eg => (
            <span key={eg} className="type-chip"><span className="sw" style={{ background:'var(--ink)' }}/>{window.PokeData.titleCase(eg)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Abilities({ p, t }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {p.abilities.map(a => (
        <div key={a} style={{ borderTop:'1px solid var(--line)', paddingTop: 12 }}>
          <div className="mono-meta">{t.ability}</div>
          <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:20, letterSpacing:'-0.01em', marginTop: 4 }}>
            {window.PokeData.titleCase(a)}
          </div>
        </div>
      ))}
      {p.hiddenAbility && (
        <div style={{ borderTop:'1px dashed var(--hot)', paddingTop: 12 }}>
          <div className="mono-meta" style={{color:'var(--hot)'}}>{t.hiddenAbility}</div>
          <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:20, letterSpacing:'-0.01em', marginTop: 4 }}>
            {window.PokeData.titleCase(p.hiddenAbility)}
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <div className="mono-meta">{label}</div>
      <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:20, marginTop:5 }}>{value || '—'}</div>
    </div>
  );
}

function Swatch({ color }) {
  const map = { red:'#d94a3d', blue:'#4a73d9', yellow:'#e7c14b', green:'#5fb05f', black:'#1a1a1a', brown:'#7a5b3a', purple:'#7e3f9e', gray:'#8b8b8b', white:'#ececec', pink:'#e89bbb' };
  const hex = map[color] || '#bbb';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:48, height:48, background: hex, borderRadius: 12, border:'1px solid var(--line)', flexShrink:0 }}/>
      <div style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase' }}>
        {color} · {hex}
      </div>
    </div>
  );
}

function EvolutionRings({ rings, active, chain, hoveredRing, baseR, ringGap }) {
  return (
    <div style={{ position:'absolute', inset:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      pointerEvents:'none', zIndex: 1 }}>
      <style>{`
        @keyframes rrA{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes rrB{from{transform:rotate(360deg)}to{transform:rotate(0)}}
        @keyframes ringBreath{0%,100%{opacity:0.55}50%{opacity:1}}
      `}</style>
      {Array.from({ length: rings }).map((_, i) => {
        const r = baseR + i * ringGap;
        const dur = 28 + i * 9;
        const dir = i % 2 === 0 ? 'rrA' : 'rrB';
        const p = chain[i];
        const isActive = p && p.number === active.number;
        const isHovered = hoveredRing === i;
        return (
          <div key={i} style={{
            position:'absolute', width: r*2, height: r*2, borderRadius:'50%',
            animation:`${dir} ${dur}s linear infinite${i === 0 ? ', ringBreath 4.5s ease-in-out infinite' : ''}`,
          }}>
            <svg viewBox={`0 0 ${r*2} ${r*2}`} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              <circle cx={r} cy={r} r={r-1}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={isHovered ? 2.5 : (isActive ? 1.5 : 0.7)}
                opacity={isHovered ? 0.9 : (isActive ? 0.5 : 0.16)}
                style={{ transition:'stroke-width 160ms, opacity 160ms' }}
              />
              {isHovered && (
                <circle cx={r} cy={r} r={r-1}
                  fill="none" stroke="var(--hot)"
                  strokeWidth={2.5} opacity={0.55}
                  style={{ transition:'opacity 160ms' }}
                />
              )}
            </svg>
            {p && (
              <div style={{
                position:'absolute', top:'50%',
                right: isHovered || isActive ? -4.5 : -2,
                transform:'translateY(-50%)',
                width: isHovered || isActive ? 11 : 6,
                height: isHovered || isActive ? 11 : 6,
                borderRadius:'50%',
                background: isHovered ? 'var(--hot)' : (isActive ? 'var(--hot)' : 'var(--ink)'),
                boxShadow: isHovered || isActive ? '0 0 0 5px rgba(217,74,61,0.15)' : 'none',
                transition:'all 160ms',
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

window.Stats = Stats;
