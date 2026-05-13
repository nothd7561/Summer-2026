// stats.jsx — clean, spaced, witch-style minimal
const { useState: useStateS, useMemo: useMemoS, useRef: useRefS, useEffect: useEffectS } = React;

const STAT_T = {
  EN: {
    menu: '// MENU', back: '← BACK', random: '↻ RANDOM', dossier: 'DOSSIER',
    nav: ['Overview', 'Statistics', 'Morphology', 'Environment', 'Abilities', 'Combat', 'Evolution'],
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
    nav: ['概要', '統計', '形態', '環境', '技能', '対戦', '進化'],
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
    nav: ['概览', '统计', '形态', '环境', '技能', '战斗', '进化'],
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

// ── Type matchup chart (Gen 6+) — attacker → { defender: multiplier } ──
const TYPE_CHART = {
  Normal:   { Rock:0.5, Ghost:0, Steel:0.5 },
  Fire:     { Fire:0.5, Water:0.5, Grass:2, Ice:2, Bug:2, Rock:0.5, Dragon:0.5, Steel:2 },
  Water:    { Fire:2, Water:0.5, Grass:0.5, Ground:2, Rock:2, Dragon:0.5 },
  Grass:    { Fire:0.5, Water:2, Grass:0.5, Poison:0.5, Ground:2, Flying:0.5, Bug:0.5, Rock:2, Dragon:0.5, Steel:0.5 },
  Electric: { Water:2, Electric:0.5, Grass:0.5, Ground:0, Flying:2, Dragon:0.5 },
  Ice:      { Water:0.5, Grass:2, Ice:0.5, Ground:2, Flying:2, Dragon:2, Steel:0.5 },
  Fighting: { Normal:2, Ice:2, Poison:0.5, Flying:0.5, Psychic:0.5, Bug:0.5, Rock:2, Ghost:0, Dark:2, Steel:2, Fairy:0.5 },
  Poison:   { Grass:2, Poison:0.5, Ground:0.5, Rock:0.5, Ghost:0.5, Steel:0, Fairy:2 },
  Ground:   { Fire:2, Electric:2, Grass:0.5, Poison:2, Flying:0, Bug:0.5, Rock:2, Steel:2 },
  Flying:   { Electric:0.5, Grass:2, Fighting:2, Bug:2, Rock:0.5, Steel:0.5 },
  Psychic:  { Fighting:2, Poison:2, Psychic:0.5, Dark:0, Steel:0.5 },
  Bug:      { Fire:0.5, Grass:2, Fighting:0.5, Poison:0.5, Flying:0.5, Psychic:2, Ghost:0.5, Dark:2, Steel:0.5, Fairy:0.5 },
  Rock:     { Fire:2, Ice:2, Fighting:0.5, Ground:0.5, Flying:2, Bug:2, Steel:0.5 },
  Ghost:    { Normal:0, Psychic:2, Ghost:2, Dark:0.5 },
  Dragon:   { Dragon:2, Steel:0.5, Fairy:0 },
  Dark:     { Fighting:0.5, Psychic:2, Ghost:2, Dark:0.5, Fairy:0.5 },
  Steel:    { Fire:0.5, Water:0.5, Electric:0.5, Ice:2, Rock:2, Steel:0.5, Fairy:2 },
  Fairy:    { Fire:0.5, Fighting:2, Poison:0.5, Dragon:2, Dark:2, Steel:0.5 },
};
const ALL_TYPES = ['Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];

function getDefenseChart(type1, type2) {
  return ALL_TYPES.reduce((out, atk) => {
    const row = TYPE_CHART[atk] || {};
    out[atk] = (row[type1] ?? 1) * (type2 ? (row[type2] ?? 1) : 1);
    return out;
  }, {});
}

function Combat({ p }) {
  const chart = getDefenseChart(p.type1, p.type2);
  const groups = {};
  for (const [type, mult] of Object.entries(chart)) {
    if (mult !== 1) { if (!groups[mult]) groups[mult] = []; groups[mult].push(type); }
  }
  const rows = [
    { mult:4,    label:'4×', sub:'quad weakness',   color:'#d94a3d' },
    { mult:2,    label:'2×', sub:'weak',             color:'#e07c40' },
    { mult:0.5,  label:'½×', sub:'resistant',        color:'#3d77d9' },
    { mult:0.25, label:'¼×', sub:'quad resistant',   color:'#2a5aa0' },
    { mult:0,    label:'0×', sub:'immune',           color:'#8a8a9a' },
  ].filter(r => groups[r.mult]?.length);

  if (!rows.length) return (
    <div style={{ fontFamily:'var(--haas)', fontSize:11, color:'var(--ink-mute)', paddingTop:8 }}>
      All types deal neutral damage to {p.name}.
    </div>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
        Damage taken when attacked by each type
      </div>
      {rows.map(({ mult, label, sub, color }) => (
        <div key={mult} style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontFamily:'var(--haas)', fontWeight:700, fontSize:18, color, lineHeight:1 }}>{label}</span>
            <span style={{ fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)' }}>{sub}</span>
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {groups[mult].map(type => (
              <span key={type} className={'type-chip t-' + type.toLowerCase()} style={{ fontSize:9, padding:'3px 9px' }}>{type}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// rings sized dynamically per sprite — see dynBASE_R / dynRING_GAP in Stats

function MegaStoneIcon({ size = 44 }) {
  const C = ['transparent','#1a3a2a','#7ae8dc','#ffffff','#3ecfb2','#a070ff'];
  const px = [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,3,3,2,2,2,1,0],
    [1,2,3,2,4,4,4,2,2,1],
    [1,2,3,4,4,4,4,4,2,1],
    [1,2,4,4,4,4,4,4,2,1],
    [1,2,4,4,5,5,4,4,2,1],
    [0,1,2,4,5,4,4,2,1,0],
    [0,0,1,2,4,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
  ];
  const n = px[0].length;
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      filter:`drop-shadow(0 0 ${size*0.28}px rgba(122,232,220,0.95)) drop-shadow(0 0 ${size*0.55}px rgba(160,112,255,0.55))`,
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}
        style={{ imageRendering:'pixelated', display:'block' }}>
        {px.flatMap((row, r) =>
          row.map((c, col) =>
            c ? <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={C[c]}/> : null
          ).filter(Boolean)
        )}
      </svg>
    </div>
  );
}

// MegaRing renders only the visual rings — the clickable stone is a fixed portal rendered by Stats
function MegaRing({ r }) {
  return (
    <div style={{
      position:'absolute', inset:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      pointerEvents:'none', zIndex:2,
    }}>
      <style>{`
        @keyframes mPing { 0%{transform:scale(1);opacity:0.75} 100%{transform:scale(1.26);opacity:0} }
        @keyframes mHue  { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
      `}</style>
      {/* Outward ping rings */}
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:'absolute', width:r*2, height:r*2, borderRadius:'50%',
          border:`1.5px solid ${['#a8edea','#d4b3ff','#90ee90'][i]}`,
          animation:`mPing 2.6s ${i*0.87}s ease-out infinite`,
          opacity:0, pointerEvents:'none',
        }}/>
      ))}
      {/* Rainbow rotating ring */}
      <div style={{
        position:'absolute', width:r*2, height:r*2, borderRadius:'50%',
        animation:'mHue 5s linear infinite, rrA 22s linear infinite',
        pointerEvents:'none',
      }}>
        <svg viewBox={`0 0 ${r*2} ${r*2}`} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
          <defs>
            <linearGradient id="mgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#d4b3ff"/>
              <stop offset="33%"  stopColor="#a8edea"/>
              <stop offset="66%"  stopColor="#90ee90"/>
              <stop offset="100%" stopColor="#d4b3ff"/>
            </linearGradient>
          </defs>
          <circle cx={r} cy={r} r={r-1.5} fill="none" stroke="url(#mgGrad)" strokeWidth="2" opacity="0.8"/>
        </svg>
      </div>
    </div>
  );
}

function Stats({ pokemon, chain, onBack, onPick, onMega = () => {}, onEvo, locale = 'EN' }) {
  const [tab, setTab] = useStateS('overview');
  const [hoveredRing, setHoveredRing] = useStateS(null);
  const t = STAT_T[locale] || STAT_T.EN;
  const mainline = window.PokeData.mainlineChain(chain, pokemon);
  const BASE_IDS = ['overview','statistics','morphology','environment','abilities','combat'];
  const NAV = t.nav.slice(0, 6).map((label, i) => ({ id: BASE_IDS[i], label }));
  const hovP = hoveredRing !== null ? mainline[hoveredRing] : null;

  // dynamic ring sizing — measure the actual rendered sprite container
  const spriteRef = useRefS(null);
  const popupRef = useRefS(null);
  const [shiny, setShiny] = useStateS(false);
  const [activeForm, setActiveForm] = useStateS(null);
  const [morphPhase, setMorphPhase] = useStateS(null);
  const [spriteR, setSpriteR] = useStateS(Math.min(320, window.innerWidth * 0.32) / 2);

  useEffectS(() => {
    if (!spriteRef.current) return;
    const obs = new ResizeObserver(([e]) => setSpriteR(e.contentRect.width / 2));
    obs.observe(spriteRef.current);
    return () => obs.disconnect();
  }, []);

  // Reset shiny + active form when pokemon changes
  useEffectS(() => { setShiny(false); setActiveForm(null); setMorphPhase(null); }, [pokemon.number]);

  const dynBASE_R = spriteR + 55;
  const dynRING_GAP = 24;

  // Mega evolution
  const isFinalEvo = !mainline.length || pokemon.number === mainline[mainline.length - 1].number;
  const megaForms = (() => {
    if (!isFinalEvo) return [];
    const pokeLower = pokemon.name.toLowerCase();
    const raw = (window.__pokeAllFull || []).filter(
      p => p.isForm
        && p.chainId === pokemon.chainId
        && p.name.toLowerCase().includes('mega')
        && p.name.toLowerCase().startsWith(pokeLower + '-')
    );
    // Attach GIF sprites from MEGA_GIF_MAP, then deduplicate by effective sprite
    const gifMap = window.MEGA_GIF_MAP || {};
    const withGif = raw.map(p => ({ ...p, gifSprite: gifMap[p.name] || null }));
    const seen = new Set();
    return withGif.filter(p => {
      const key = p.gifSprite || p.sprite;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const hasMega = megaForms.length > 0;

  // Alt forms — same-root name variants (excludes mega, gmax, totem, cap, cosplay, starter)
  const SKIP_FORM = ['mega','gmax','totem','cap','cosplay','starter','partner'];
  const formRoot = pokemon.name.split('-')[0].toLowerCase();
  const altForms = (window.__pokeAllFull || []).filter(p =>
    p.isForm &&
    p.chainId === pokemon.chainId &&
    !SKIP_FORM.some(s => p.name.toLowerCase().includes(s)) &&
    p.name.toLowerCase().startsWith(formRoot + '-') &&
    p.name.toLowerCase() !== pokemon.name.toLowerCase()
  );

  const displayPokemon = activeForm || pokemon;
  const displaySprite = shiny
    ? displayPokemon.sprite?.replace('/pokemon/', '/pokemon/shiny/')
    : displayPokemon.sprite;

  function switchForm(form) {
    if (morphPhase) return;
    setMorphPhase('out');
    setTimeout(() => {
      setActiveForm(prev => prev?.number === form.number ? null : form);
      setMorphPhase('in');
      setTimeout(() => setMorphPhase(null), 550);
    }, 350);
  }

  // Mega ring: always a full ringGap + 20px past the last evo ring, capped to stay on screen
  const lastEvoRingR = dynBASE_R + Math.max(0, mainline.length - 1) * dynRING_GAP;
  const dynMegaR = Math.min(
    Math.max(lastEvoRingR + dynRING_GAP + 20, dynBASE_R + Math.max(1, mainline.length) * dynRING_GAP + 20),
    Math.min(window.innerWidth, window.innerHeight) * 0.44
  );
  const [megaAnimPhase, setMegaAnimPhase] = useStateS(null);
  const [megaStonePos, setMegaStonePos] = useStateS(null);
  // Fixed-position coords for the portal stone button (escapes overflow:hidden clipping)
  const [megaStoneFixed, setMegaStoneFixed] = useStateS(null);

  useEffectS(() => {
    if (!hasMega || !spriteRef.current) { setMegaStoneFixed(null); return; }
    const update = () => {
      const rect = spriteRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMegaStoneFixed({ x: rect.left + rect.width / 2 + dynMegaR, y: rect.top + rect.height / 2 });
    };
    update();
    window.addEventListener('resize', update);
    const root = document.getElementById('root');
    root?.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      root?.removeEventListener('scroll', update);
    };
  }, [hasMega, spriteR, pokemon.number]);

  function triggerMega(forms) {
    const rect = spriteRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    setMegaStonePos({ cx, cy });
    // fly → land on sprite (700ms) → sit there for 1.5s → white flash → scroll
    setMegaAnimPhase('fly');
    setTimeout(() => {
      setMegaAnimPhase('landed');
      setTimeout(() => {
        setMegaAnimPhase('flash');
        onMega(forms);                          // pass full forms array to MegaView
        setTimeout(() => setMegaAnimPhase(null), 1900);
      }, 1500);
    }, 700);
  }

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

      {/* BACKGROUND DECORATION */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none',
      }}>
        {/* Faded giant Pokémon name watermark */}
        <div style={{
          position:'absolute', left:'50%', bottom:'-0.12em',
          transform:'translateX(-50%)',
          fontFamily:'var(--haas)', fontWeight:900,
          fontSize:'min(22vw, 220px)', letterSpacing:'-0.05em',
          textTransform:'uppercase', color:'var(--ink)',
          opacity:0.04, userSelect:'none', lineHeight:1, whiteSpace:'nowrap',
        }}>
          {pokemon.name}
        </div>
        {/* Subtle vertical spine between left nav and center */}
        <div style={{
          position:'absolute', top:'10%', bottom:'10%',
          left:'minmax(160px,200px)', width:1,
          background:'var(--ink)', opacity:0.06,
        }}/>
      </div>

      {/* LEFT NAV — sidenav only, centered vertically */}
      <div style={{
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'clamp(90px, 12vh, 140px) 0 clamp(110px, 15vh, 170px) clamp(24px, 3.5vw, 70px)',
      }}>
        <div className="sidenav">
          {NAV.map(item => (
            <button key={item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
          {!hasMega && (
            <button onClick={() => onEvo?.()}>
              {t.nav[6] || 'Evolution'}
            </button>
          )}
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
            hoveredRing={hoveredRing} baseR={dynBASE_R} ringGap={dynRING_GAP} hasMega={hasMega}/>

          {hasMega && <MegaRing r={dynMegaR}/>}

          <div ref={spriteRef}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.classList.remove('bounce'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('bounce'); }}
            style={{ position:'relative', zIndex:3, width:'min(320px, 32vw)', aspectRatio:'1/1', cursor:'pointer' }}>
            <style>{`
              @keyframes spriteBounce{0%,100%{transform:translateY(0) scale(1);}30%{transform:translateY(-18px) scale(1.05);}60%{transform:translateY(7px) scale(0.98);}}
              .bounce img{animation:spriteBounce 700ms cubic-bezier(.2,.7,.2,1);}
              @keyframes formOut{0%{opacity:1;transform:scale(1);filter:blur(0px) brightness(1);}100%{opacity:0;transform:scale(1.08);filter:blur(7px) brightness(2.4);}}
              @keyframes formIn{0%{opacity:0;transform:scale(0.88);filter:blur(10px) brightness(2.2);}100%{opacity:1;transform:scale(1);filter:blur(0px) brightness(1);}}
              @keyframes formWave{0%{transform:scale(0.35);opacity:0.85;}100%{transform:scale(2.4);opacity:0;}}
            `}</style>
            <img src={displaySprite} alt={displayPokemon.name} style={{
              width:'100%', height:'100%', objectFit:'contain', imageRendering:'pixelated',
              filter:'drop-shadow(0 24px 28px rgba(0,0,0,0.22))',
              animation: morphPhase === 'out' ? 'formOut 350ms ease-out forwards'
                       : morphPhase === 'in'  ? 'formIn 550ms ease-out forwards'
                       : undefined,
            }}/>
            {/* Wave rings during morph */}
            {morphPhase && [0,1,2].map(i => (
              <div key={i} style={{
                position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                pointerEvents:'none',
              }}>
                <div style={{
                  width:'100%', height:'100%', borderRadius:'50%',
                  border:`2px solid ${['rgba(168,237,234,0.9)','rgba(200,160,255,0.75)','rgba(144,238,144,0.7)'][i]}`,
                  animation:`formWave 0.62s ${i * 0.13}s ease-out forwards`,
                }}/>
              </div>
            ))}
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
              <div style={{ fontFamily:'var(--haas)', fontWeight:700, fontSize:13 }}>{hovP.name}</div>
              <div style={{ fontFamily:'var(--haas)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em', marginTop:2 }}>#{String(hovP.number).padStart(4,'0')}</div>
            </div>
            <span className={'type-chip t-' + hovP.type1.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>{hovP.type1}</span>
            {hovP.type2 && <span className={'type-chip t-' + hovP.type2.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>{hovP.type2}</span>}
            {hovP.number !== pokemon.number && (
              <span style={{ fontFamily:'var(--haas)', fontSize:9, color:'var(--hot)', letterSpacing:'0.14em' }}>→ SWITCH</span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — name + dossier panel */}
      <div style={{
        padding:'clamp(90px, 12vh, 140px) clamp(24px, 3.5vw, 70px) clamp(40px, 5vh, 70px) 12px',
        display:'flex', flexDirection:'column', gap:14, justifyContent:'center', minWidth:0, overflow:'hidden',
      }}>
        <div style={{
          fontFamily:'var(--haas)', fontWeight:600,
          fontSize:12, letterSpacing:'0.32em', textTransform:'uppercase',
          color:'var(--ink-mute)',
        }}>
          {t.dossier} — › {String(pokemon.number).padStart(4,'0')}
        </div>

        <div>
          <h1 style={{
            fontFamily:'var(--haas)', fontWeight:900,
            fontSize:`clamp(30px, ${Math.max(26, 100 - pokemon.name.length * 6)}px, 88px)`,
            lineHeight:0.88, letterSpacing:'-0.05em',
            color:'var(--hot)', margin:0, wordBreak:'break-word',
            textTransform:'uppercase', fontStyle:'italic',
            textShadow:'3px 3px 0 rgba(17,17,17,0.92)',
          }}>
            {pokemon.name}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, flexWrap:'wrap' }}>
            <div style={{ fontFamily:'var(--haas)', fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
              {t.gen} {pokemon.generation.replace('gen-','').toUpperCase()}
            </div>
            <button onClick={() => setShiny(s => !s)} style={{
              all:'unset', cursor:'pointer',
              fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase',
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'4px 10px', borderRadius:999,
              border:`1px solid ${shiny ? '#c79a2a' : 'rgba(17,17,17,0.25)'}`,
              color: shiny ? '#c79a2a' : 'var(--ink-mute)',
              background: shiny ? 'rgba(199,154,42,0.1)' : 'transparent',
              transition:'all 200ms ease',
            }}>
              ✦ shiny
            </button>
            {altForms.map(form => {
              const label = form.name.slice(formRoot.length + 1).replace(/-/g, ' ');
              const isActive = activeForm?.number === form.number;
              return (
                <button key={form.number} onClick={() => switchForm(form)} style={{
                  all:'unset', cursor:'pointer',
                  fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase',
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'4px 10px', borderRadius:999,
                  border:`1px solid ${isActive ? 'var(--hot)' : 'rgba(17,17,17,0.25)'}`,
                  color: isActive ? 'var(--hot)' : 'var(--ink-mute)',
                  background: isActive ? 'rgba(217,74,61,0.08)' : 'transparent',
                  transition:'all 200ms ease',
                }}>
                  ◈ {label}
                </button>
              );
            })}
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
            <span style={{ fontFamily:'var(--haas)', fontWeight:700, fontSize:16, letterSpacing:'0.18em', textTransform:'uppercase' }}>
              → {NAV.find(n=>n.id===tab)?.label}
            </span>
            <div style={{ display:'flex', gap:14 }}>
              {NAV.findIndex(n => n.id === tab) > 0 && (
                <button onClick={() => setTab(NAV[NAV.findIndex(n => n.id === tab) - 1].id)} style={{
                  all:'unset', cursor:'pointer',
                  fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase',
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
                  fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase',
                  color:'var(--ink-mute)', borderBottom:'1px dashed var(--ink-mute)', paddingBottom:1,
                  transition:'color 160ms, border-color 160ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--ink)'; e.currentTarget.style.borderColor='var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--ink-mute)'; e.currentTarget.style.borderColor='var(--ink-mute)'; }}>
                  next →
                </button>
              )}
              {NAV.findIndex(n => n.id === tab) === NAV.length - 1 && !hasMega && onEvo && (
                <button onClick={() => onEvo()} style={{
                  all:'unset', cursor:'pointer',
                  fontFamily:'var(--haas)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase',
                  color:'var(--hot)', borderBottom:'1px dashed var(--hot)', paddingBottom:1,
                  transition:'color 160ms, border-color 160ms',
                }}>
                  evolution →
                </button>
              )}
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', paddingRight:6 }}>
            <div style={{ display: tab === 'overview'     ? undefined : 'none' }}><Overview p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'statistics'   ? undefined : 'none' }}><Statistics p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'morphology'   ? undefined : 'none' }}><Morphology p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'environment'  ? undefined : 'none' }}><Environment p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'abilities'    ? undefined : 'none' }}><Abilities p={pokemon} t={t}/></div>
            <div style={{ display: tab === 'combat'       ? undefined : 'none' }}><Combat p={pokemon}/></div>
          </div>
        </div>
      </div>

      {/* Portal: mega stone button at fixed position — never clipped by overflow:hidden */}
      {hasMega && megaStoneFixed && megaAnimPhase === null && ReactDOM.createPortal(
        <div
          onClick={() => triggerMega(megaForms)}
          title="Mega Evolve"
          style={{
            position:'fixed', left: megaStoneFixed.x, top: megaStoneFixed.y,
            transform:'translate(-50%,-50%)',
            zIndex:30, cursor:'pointer', pointerEvents:'auto',
          }}
        >
          <style>{`@keyframes mStonePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}`}</style>
          <div style={{ animation:'mStonePulse 2s ease-in-out infinite' }}>
            <MegaStoneIcon size={38}/>
          </div>
        </div>,
        document.body
      )}

      {/* ── Mega animation overlays (all portaled to body to escape clipping) ── */}

      {/* Phase 1 — fly: stone travels from ring edge to sprite center, stays visible */}
      {megaAnimPhase === 'fly' && megaStonePos && ReactDOM.createPortal(
        <div style={{ position:'fixed', left: megaStonePos.cx + dynMegaR, top: megaStonePos.cy, zIndex:270, pointerEvents:'none' }}>
          <style>{`@keyframes mStoneFly{
            0%   { transform:translate(-50%,-50%) scale(1);   opacity:1; }
            65%  { transform:translate(calc(-50% - ${dynMegaR}px),-50%) scale(1.6); opacity:1; }
            100% { transform:translate(calc(-50% - ${dynMegaR}px),-50%) scale(1.15); opacity:1; }
          }`}</style>
          <div style={{ animation:'mStoneFly 700ms cubic-bezier(.2,.8,.3,1) forwards' }}>
            <MegaStoneIcon size={58}/>
          </div>
        </div>,
        document.body
      )}

      {/* Phase 2 — landed: stone sits on sprite for 1.5s with building glow */}
      {megaAnimPhase === 'landed' && megaStonePos && ReactDOM.createPortal(
        <div style={{ position:'fixed', left: megaStonePos.cx, top: megaStonePos.cy, transform:'translate(-50%,-50%)', zIndex:270, pointerEvents:'none' }}>
          <style>{`
            @keyframes mLandPulse { 0%{transform:scale(1.1)} 100%{transform:scale(1.42)} }
            @keyframes mLandGlow  { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
          `}</style>
          {/* Expanding white radial glow that builds to cover the whole screen */}
          <div style={{
            position:'fixed', left: megaStonePos.cx, top: megaStonePos.cy,
            width: Math.max(window.innerWidth, window.innerHeight) * 2.8,
            height: Math.max(window.innerWidth, window.innerHeight) * 2.8,
            borderRadius:'50%',
            background:'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(230,240,255,0.7) 25%, rgba(200,220,255,0.3) 55%, transparent 75%)',
            animation:'mLandGlow 1.5s ease-out forwards',
            pointerEvents:'none', zIndex:269,
          }}/>
          {/* The stone itself — pulses while landed */}
          <div style={{ position:'relative', zIndex:271, animation:'mLandPulse 0.44s ease-in-out infinite alternate' }}>
            <MegaStoneIcon size={66}/>
          </div>
        </div>,
        document.body
      )}

      {/* Phase 3 — flash: single div animated so opacity:0 at unmount, no abrupt snap */}
      {megaAnimPhase === 'flash' && ReactDOM.createPortal(
        <>
          <style>{`@keyframes mFlashFade{0%,38%{opacity:1}100%{opacity:0}}`}</style>
          <div style={{
            position:'fixed', inset:0, zIndex:280,
            background:'white', pointerEvents:'none',
            animation:'mFlashFade 1900ms ease-in-out forwards',
          }}/>
        </>,
        document.body
      )}
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
            <span style={{ fontFamily:'var(--haas)', fontWeight:600, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-mute)' }}>{name}</span>
            <span style={{ fontFamily:'var(--haas)', fontWeight:700, fontSize:14 }}>
              {val}<span style={{color:'var(--ink-mute)', fontWeight:400, fontSize:10}}> /255</span>
            </span>
          </div>
          <div className={'statbar ' + (norm > 0.65 ? 'hot' : '')}>
            <div style={{ width: `${((norm||0) * 100).toFixed(1)}%` }}/>
          </div>
        </div>
      ))}
      <div className="dot-rule" style={{ marginTop: 4 }}/>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--haas)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
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
  const [descs, setDescs] = useStateS({});

  useEffectS(() => {
    const all = [...(p.abilities || []), p.hiddenAbility].filter(Boolean);
    all.forEach(async (name) => {
      if (descs[name] !== undefined) return;
      const slug = name.toLowerCase().replace(/[\s_]+/g, '-');
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/ability/${slug}/`);
        if (!res.ok) { setDescs(d => ({ ...d, [name]: '' })); return; }
        const json = await res.json();
        const entry = json.flavor_text_entries?.find(e => e.language.name === 'en');
        setDescs(d => ({ ...d, [name]: entry ? entry.flavor_text.replace(/\s+/g, ' ') : '' }));
      } catch { setDescs(d => ({ ...d, [name]: '' })); }
    });
  }, [p.number]);

  const AbilityBlock = ({ name, dashed }) => (
    <div style={{ borderTop: dashed ? '1px dashed var(--hot)' : '1px solid var(--line)', paddingTop: 12 }}>
      <div className="mono-meta" style={dashed ? { color:'var(--hot)' } : {}}>
        {dashed ? t.hiddenAbility : t.ability}
      </div>
      <div style={{ fontFamily:'var(--haas)', fontWeight:700, fontSize:18, letterSpacing:'-0.01em', marginTop:4, lineHeight:1.1 }}>
        {window.PokeData.titleCase(name)}
      </div>
      {descs[name] ? (
        <p style={{ margin:'6px 0 0', fontSize:11, lineHeight:1.65, color:'var(--ink-mute)', wordBreak:'break-word' }}>
          {descs[name]}
        </p>
      ) : descs[name] === undefined ? (
        <p style={{ margin:'6px 0 0', fontSize:10, color:'var(--ink-mute)', opacity:0.5, fontFamily:'var(--haas)', letterSpacing:'0.1em' }}>loading…</p>
      ) : null}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {p.abilities.map(a => <AbilityBlock key={a} name={a} dashed={false}/>)}
      {p.hiddenAbility && <AbilityBlock name={p.hiddenAbility} dashed={true}/>}
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <div className="mono-meta">{label}</div>
      <div style={{ fontFamily:'var(--haas)', fontWeight:700, fontSize:20, marginTop:5 }}>{value || '—'}</div>
    </div>
  );
}

function Swatch({ color }) {
  const map = { red:'#d94a3d', blue:'#4a73d9', yellow:'#e7c14b', green:'#5fb05f', black:'#1a1a1a', brown:'#7a5b3a', purple:'#7e3f9e', gray:'#8b8b8b', white:'#ececec', pink:'#e89bbb' };
  const hex = map[color] || '#bbb';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:48, height:48, background: hex, borderRadius: 12, border:'1px solid var(--line)', flexShrink:0 }}/>
      <div style={{ fontFamily:'var(--haas)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase' }}>
        {color} · {hex}
      </div>
    </div>
  );
}

function EvolutionRings({ rings, active, chain, hoveredRing, baseR, ringGap, hasMega }) {
  const prevNumRef   = useRefS(null);
  const [tracingIdx, setTracingIdx] = useStateS(null);
  const traceCircRef = useRefS(null);

  // Detect switch TO outermost ring → trigger trace animation
  useEffectS(() => {
    const outerIdx = rings - 1;
    const activeIdx = chain.findIndex(p => p && p.number === active.number);
    if (hasMega && activeIdx === outerIdx && chain.length > 1 && prevNumRef.current !== null && prevNumRef.current !== active.number) {
      setTracingIdx(outerIdx);
      const t = setTimeout(() => setTracingIdx(null), 1500);
      prevNumRef.current = active.number;
      return () => clearTimeout(t);
    }
    // Navigated away from outer ring — clear any in-flight trace immediately
    setTracingIdx(null);
    prevNumRef.current = active.number;
  }, [active.number, rings, hasMega]);

  // Kick off the stroke-dashoffset draw on next frame
  useEffectS(() => {
    if (tracingIdx === null || !traceCircRef.current) return;
    requestAnimationFrame(() => {
      if (traceCircRef.current) traceCircRef.current.style.strokeDashoffset = '0';
    });
  }, [tracingIdx]);

  return (
    <div style={{ position:'absolute', inset:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      pointerEvents:'none', zIndex: 1 }}>
      <style>{`
        @keyframes rrA{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes rrB{from{transform:rotate(360deg)}to{transform:rotate(0)}}
        @keyframes ringBreath{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes traceHue{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
      `}</style>
      {Array.from({ length: rings }).map((_, i) => {
        const r = baseR + i * ringGap;
        const dur = 28 + i * 9;
        const dir = i % 2 === 0 ? 'rrA' : 'rrB';
        const p = chain[i];
        const isActive = p && p.number === active.number;
        const isHovered = hoveredRing === i;
        const isTracing = tracingIdx === i;
        const circumference = 2 * Math.PI * (r - 1);
        return (
          <div key={i} style={{
            position:'absolute', width: r*2, height: r*2, borderRadius:'50%',
            animation:`${dir} ${dur}s linear infinite${i === 0 ? ', ringBreath 4.5s ease-in-out infinite' : ''}${isTracing ? ', traceHue 1.4s linear' : ''}`,
          }}>
            <svg viewBox={`0 0 ${r*2} ${r*2}`} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              {isTracing && (
                <defs>
                  <linearGradient id="traceGrad" gradientUnits="userSpaceOnUse" x1={r*2} y1={r} x2={0} y2={r}>
                    <stop offset="0%"   stopColor="#d4b3ff"/>
                    <stop offset="50%"  stopColor="#a8edea"/>
                    <stop offset="100%" stopColor="#90ee90"/>
                  </linearGradient>
                </defs>
              )}
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
              {isTracing && (
                <circle
                  ref={traceCircRef}
                  cx={r} cy={r} r={r-1}
                  fill="none" stroke="url(#traceGrad)"
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  transform={`rotate(-90 ${r} ${r})`}
                  style={{ transition:'stroke-dashoffset 1.3s cubic-bezier(.35,0,.2,1)' }}
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
