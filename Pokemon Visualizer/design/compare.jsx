// compare.jsx — side-by-side pokemon comparison: stats, radar, type matchup
const { useState: useStateC, useMemo: useMemoC, useEffect: useEffectC, useRef: useRefC } = React;

const TYPE_CHART_CMP = {
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
const ALL_TYPES_CMP = ['Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];

function getDefenseChartCmp(type1, type2) {
  return ALL_TYPES_CMP.reduce((out, atk) => {
    const row = TYPE_CHART_CMP[atk] || {};
    out[atk] = (row[type1] ?? 1) * (type2 ? (row[type2] ?? 1) : 1);
    return out;
  }, {});
}

function fmtEff(v) {
  if (v === 0)    return '0×';
  if (v === 0.25) return '¼×';
  if (v === 0.5)  return '½×';
  if (v === 2)    return '2×';
  if (v === 4)    return '4×';
  return v + '×';
}

// hex → rgba string — works only with real hex colors (not CSS variables)
function rgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const CMP_STYLES = `
  @keyframes cmpPageIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes colEnterL  { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes colEnterR  { from{opacity:0;transform:translateX(24px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes barScaleIn { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes chipPopIn  { from{opacity:0;transform:scale(0.78)} to{opacity:1;transform:scale(1)} }
  @keyframes statRowIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ruleExpand { from{opacity:0;transform:scaleX(0.6)} to{opacity:1;transform:scaleX(1)} }
  @keyframes vsAppear   { from{opacity:0;transform:scale(0.7) rotate(-6deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
  @keyframes bgNumIn    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanLine   { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
`;

// ── Single-pokemon radar ──────────────────────────────────────────────────────
function SingleRadar({ pokemon, color, size = 280 }) {
  const STAT_KEYS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed'];
  const LABELS    = ['HP', 'ATK', 'DEF', 'SP.A', 'SP.D', 'SPD'];
  const n = 6, cx = size / 2, cy = size / 2, r = size * 0.36, MAX = 255;
  function angle(i) { return (Math.PI * 2 * i) / n - Math.PI / 2; }

  const polyPath = pokemon
    ? STAT_KEYS.map((k, i) => {
        const v = Math.max(0.04, (pokemon[k] || 0) / MAX);
        const a = angle(i);
        return (i === 0 ? 'M' : 'L') + (cx + r * v * Math.cos(a)).toFixed(1) + ',' + (cy + r * v * Math.sin(a)).toFixed(1);
      }).join(' ') + 'Z'
    : '';

  return (
    <svg width={size} height={size} style={{ overflow:'visible', display:'block' }}>
      {[0.25, 0.5, 0.75, 1].map(frac => {
        const pts = Array.from({length: n}, (_, i) => {
          const a = angle(i);
          return `${(cx + r * frac * Math.cos(a)).toFixed(1)},${(cy + r * frac * Math.sin(a)).toFixed(1)}`;
        });
        return <path key={frac} d={'M' + pts.join('L') + 'Z'} fill="none" stroke="var(--ink)" strokeWidth="0.7" opacity="0.1"/>;
      })}
      {Array.from({length: n}, (_, i) => {
        const a = angle(i);
        return <line key={i} x1={cx} y1={cy}
          x2={(cx + r * Math.cos(a)).toFixed(1)} y2={(cy + r * Math.sin(a)).toFixed(1)}
          stroke="var(--ink)" strokeWidth="0.7" opacity="0.1"/>;
      })}
      {polyPath && (
        <path d={polyPath} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
      )}
      {LABELS.map((label, i) => {
        const a = angle(i);
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        const anchor = Math.cos(a) > 0.15 ? 'start' : Math.cos(a) < -0.15 ? 'end' : 'middle';
        return (
          <text key={i} x={lx.toFixed(1)} y={(ly + 4).toFixed(1)} textAnchor={anchor}
            fontFamily="var(--mono)" fontSize="9" fontWeight="800"
            letterSpacing="0.08em" fill="var(--ink)" opacity="0.45">
            {label}
          </text>
        );
      })}
      {pokemon && STAT_KEYS.map((k, i) => {
        const v = Math.max(0.04, (pokemon[k] || 0) / MAX);
        const a = angle(i);
        return <circle key={i}
          cx={(cx + r * v * Math.cos(a)).toFixed(1)} cy={(cy + r * v * Math.sin(a)).toFixed(1)}
          r="3.5" fill={color}/>;
      })}
    </svg>
  );
}

// ── Animated stat bar ─────────────────────────────────────────────────────────
function StatBar({ label, valA, valB, idx, colorA, colorB }) {
  const MAX = 255;
  const pA  = Math.round((valA / MAX) * 100);
  const pB  = Math.round((valB / MAX) * 100);
  const win = valA > valB ? 'A' : valB > valA ? 'B' : null;
  const d   = idx * 55;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, animation:`statRowIn 380ms ${d}ms ease both` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
          {label}
        </span>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:win==='A'?800:500, minWidth:32, textAlign:'right',
            color: win === 'A' ? colorA : 'var(--ink)' }}>{valA}</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', opacity:0.3 }}>·</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:win==='B'?800:500, minWidth:32,
            color: win === 'B' ? colorB : 'var(--ink)' }}>{valB}</span>
          {win && <span style={{ fontFamily:'var(--mono)', fontSize:8, color: win==='A'?colorA:colorB, opacity:0.7 }}>▲</span>}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
        {[[pA, colorA, d+80], [pB, colorB, d+120]].map(([pct, col, dd], ri) => (
          <div key={ri} style={{ position:'relative', height:7, background:'rgba(0,0,0,0.07)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              position:'absolute', left:0, top:0, height:'100%', width: pct+'%',
              background: col, borderRadius:99, opacity: win===(ri===0?'A':'B') ? 0.88 : 0.45,
              transformOrigin:'left', animation:`barScaleIn 600ms ${dd}ms cubic-bezier(.2,.8,.2,1) both`,
            }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Defense section ───────────────────────────────────────────────────────────
function DefenseSection({ pokemon, color }) {
  const chart = useMemoC(() => pokemon ? getDefenseChartCmp(pokemon.type1, pokemon.type2) : null, [pokemon]);
  if (!chart) return null;

  const groups = [
    { mult:4,    label:'4× weak' },
    { mult:2,    label:'2× weak' },
    { mult:0.5,  label:'½× resist' },
    { mult:0.25, label:'¼× resist' },
    { mult:0,    label:'immune' },
  ];

  return (
    <div style={{ width:'100%' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase',
        color, marginBottom:12, fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:color, display:'inline-block' }}/>
        defenses
      </div>
      {groups.map(({ mult, label }, gi) => {
        const types = ALL_TYPES_CMP.filter(t => chart[t] === mult);
        if (!types.length) return null;
        return (
          <div key={mult} style={{ marginBottom:9 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase',
              color:'var(--ink-mute)', marginBottom:4 }}>
              {label}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {types.map((t, ti) => (
                <span key={t} className={'type-chip t-' + t.toLowerCase()}
                  style={{ fontSize:10, padding:'3px 9px', animation:`chipPopIn 280ms ${(gi*4+ti)*35}ms ease both` }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── STAB attack matchup ───────────────────────────────────────────────────────
function AttackMatchup({ attacker, defender, color, delay = 0 }) {
  if (!attacker || !defender) return null;
  const results = [attacker.type1, attacker.type2].filter(Boolean).map(t => {
    const row = TYPE_CHART_CMP[t] || {};
    return { type: t, eff: (row[defender.type1] ?? 1) * (defender.type2 ? (row[defender.type2] ?? 1) : 1) };
  });

  return (
    <div style={{ animation:`statRowIn 400ms ${delay}ms ease both` }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase',
        color:'var(--ink-mute)', marginBottom:12 }}>
        {attacker.name}<span style={{ opacity:0.35, margin:'0 7px' }}>→</span>{defender.name}
      </div>
      <div style={{ display:'flex', gap:16, alignItems:'flex-end', flexWrap:'wrap' }}>
        {results.map(({ type, eff }, i) => (
          <div key={type} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            animation:`chipPopIn 300ms ${delay+i*70}ms ease both` }}>
            <span className={'type-chip t-' + type.toLowerCase()} style={{ fontSize:10, padding:'3px 9px' }}>{type}</span>
            <span style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:800, letterSpacing:'-0.01em',
              color: eff >= 2 ? color : eff === 0 ? 'var(--ink-mute)' : 'var(--ink)' }}>
              {fmtEff(eff)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Search picker ─────────────────────────────────────────────────────────────
function ComparePicker({ label, dotColor, value, onPick }) {
  const [query, setQuery]       = useStateC('');
  const [hover, setHover]       = useStateC(0);
  const [picked, setPicked]     = useStateC(false);
  const [dropRect, setDropRect] = useStateC(null);
  const dropRef  = useRefC(null);
  const inputRef = useRefC(null);

  const matches = useMemoC(() => {
    if (!query || picked) return [];
    return window.PokeData.fuzzySearch(query, window.__pokeAll || [], 6);
  }, [query, picked]);

  useEffectC(() => { setHover(0); }, [query]);
  useEffectC(() => {
    if (!matches.length || picked) { setDropRect(null); return; }
    const update = () => {
      const el = dropRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setDropRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [matches, picked]);

  function pick(p)  { setQuery(p.name); setPicked(true); setDropRect(null); onPick(p); }
  function clear()  { setQuery(''); setPicked(false); onPick(null); setTimeout(() => inputRef.current?.focus(), 30); }

  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
        <span style={{ width:9, height:9, borderRadius:'50%', background:dotColor, flexShrink:0 }}/>
        <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
          {label}
        </span>
        {value && (
          <button onClick={clear} style={{ all:'unset', cursor:'pointer', marginLeft:'auto',
            fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', opacity:0.55 }}>× clear</button>
        )}
      </div>
      <div ref={dropRef} style={{ display:'flex', alignItems:'center', gap:8,
        border:'1px solid var(--ink)', borderRadius:999, padding:'6px 12px 6px 20px', background:'var(--paper)' }}>
        <input ref={inputRef} value={query}
          onChange={e => { setQuery(e.target.value); setPicked(false); onPick(null); }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHover(h => Math.min(h+1, matches.length-1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHover(h => Math.max(h-1, 0)); }
            else if (e.key === 'Enter' && matches[hover]) { pick(matches[hover]); }
          }}
          placeholder="name or #"
          style={{ flex:1, border:'none', outline:'none', background:'transparent',
            fontFamily:'var(--display)', fontWeight:500, fontSize:15, color:'var(--ink)', minWidth:0 }}
        />
      </div>
      {dropRect && !picked && matches.length > 0 && ReactDOM.createPortal(
        <div className="card" style={{ position:'fixed', top:dropRect.top, left:dropRect.left, width:dropRect.width,
          zIndex:2000, padding:6, borderRadius:22, overflow:'auto', maxHeight:'min(260px,30vh)' }}>
          {matches.map((p, i) => (
            <div key={p.number} onMouseEnter={() => setHover(i)}
              onMouseDown={e => { e.preventDefault(); pick(p); }}
              style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', alignItems:'center', gap:10,
                padding:'7px 12px', cursor:'pointer', borderRadius:14,
                background: hover===i ? 'rgba(217,74,61,0.06)' : 'transparent' }}>
              <img src={p.sprite} alt="" style={{ width:40, height:40, objectFit:'contain', imageRendering:'pixelated' }}/>
              <div>
                <div style={{ fontFamily:'var(--display)', fontWeight:hover===i?700:500, fontSize:14, letterSpacing:'-0.01em' }}>{p.name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)' }}>#{String(p.number).padStart(4,'0')}</div>
              </div>
              <span className={'type-chip t-' + p.type1.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>{p.type1}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Per-pokemon column ────────────────────────────────────────────────────────
function PokeColumn({ pokemon, color, colorHex, radarSize, side }) {
  const enterAnim = side === 'left' ? 'colEnterL' : 'colEnterR';

  if (!pokemon) {
    return (
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        minHeight: radarSize + 200,
        background:'var(--paper)', borderRadius:20,
        border:'1.5px dashed rgba(0,0,0,0.1)',
        opacity:0.3,
        animation:`${enterAnim} 420ms ease both`,
      }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
          select pokémon
        </span>
      </div>
    );
  }

  const bst = (pokemon.hp||0)+(pokemon.atk||0)+(pokemon.def||0)+(pokemon.spAtk||0)+(pokemon.spDef||0)+(pokemon.speed||0);

  return (
    <div style={{
      position:'relative',
      display:'flex', flexDirection:'column', alignItems:'center', gap:14,
      background:'var(--paper)', borderRadius:20,
      padding:'clamp(16px,2vw,28px)',
      boxShadow:`0 2px 24px rgba(0,0,0,0.06), 0 0 0 1px ${rgba(colorHex, 0.14)}`,
      borderTop:`3px solid ${color}`,
      overflow:'hidden',
      animation:`${enterAnim} 450ms cubic-bezier(.2,.8,.2,1) both`,
    }}>
      {/* Dex number watermark */}
      <div aria-hidden="true" style={{
        position:'absolute', top:-8, right:-10,
        fontFamily:'var(--display)', fontWeight:900,
        fontSize:'clamp(64px,9vw,100px)',
        letterSpacing:'-0.06em', color:colorHex,
        opacity:0.055, userSelect:'none', pointerEvents:'none', lineHeight:1,
        animation:`bgNumIn 600ms 150ms ease both`,
      }}>
        {String(pokemon.number).padStart(3,'0')}
      </div>

      {/* Sprite */}
      <img src={pokemon.sprite} alt={pokemon.name}
        style={{ position:'relative', zIndex:1,
          width:'min(120px,14vw)', height:'min(120px,14vw)', objectFit:'contain', imageRendering:'pixelated',
          filter:`drop-shadow(0 6px 14px ${rgba(colorHex, 0.28)})` }}/>

      {/* Name + dex */}
      <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:17, letterSpacing:'-0.02em', textTransform:'uppercase' }}>
          {pokemon.name}
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', marginTop:2 }}>
          #{String(pokemon.number).padStart(4,'0')}
        </div>
      </div>

      {/* Types */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center', position:'relative', zIndex:1 }}>
        <span className={'type-chip t-' + pokemon.type1.toLowerCase()} style={{ fontSize:10 }}>
          <span className="sw"/>{pokemon.type1}
        </span>
        {pokemon.type2 && (
          <span className={'type-chip t-' + pokemon.type2.toLowerCase()} style={{ fontSize:10 }}>
            <span className="sw"/>{pokemon.type2}
          </span>
        )}
      </div>

      {/* BST pill */}
      <div style={{
        fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.14em', fontWeight:700,
        color, background:rgba(colorHex, 0.08), borderRadius:999,
        padding:'4px 16px', border:`1px solid ${rgba(colorHex, 0.18)}`,
        position:'relative', zIndex:1,
      }}>
        BST {bst}
      </div>

      {/* Radar */}
      <div style={{ position:'relative', zIndex:1 }}>
        <SingleRadar pokemon={pokemon} color={color} size={radarSize}/>
      </div>

      {/* Divider */}
      <div style={{ width:'100%', height:1, background:'rgba(0,0,0,0.07)', margin:'4px 0' }}/>

      {/* Defenses */}
      <div style={{ width:'100%', position:'relative', zIndex:1 }}>
        <DefenseSection pokemon={pokemon} color={color}/>
      </div>
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionRule({ label, delay = 0 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, margin:'44px 0 24px',
      animation:`ruleExpand 500ms ${delay}ms ease both` }}>
      <span style={{ flex:1, height:1, background:'rgba(0,0,0,0.09)' }}/>
      <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase',
        color:'var(--ink-mute)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--ink-mute)', opacity:0.4, display:'inline-block' }}/>
        {label}
        <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--ink-mute)', opacity:0.4, display:'inline-block' }}/>
      </span>
      <span style={{ flex:1, height:1, background:'rgba(0,0,0,0.09)' }}/>
    </div>
  );
}

// ── BST comparison ────────────────────────────────────────────────────────────
function BstCompare({ pokeA, pokeB, colorA, colorB, colorAHex, colorBHex }) {
  const bstA = (pokeA.hp||0)+(pokeA.atk||0)+(pokeA.def||0)+(pokeA.spAtk||0)+(pokeA.spDef||0)+(pokeA.speed||0);
  const bstB = (pokeB.hp||0)+(pokeB.atk||0)+(pokeB.def||0)+(pokeB.spAtk||0)+(pokeB.spDef||0)+(pokeB.speed||0);
  const MAX_BST = 720;
  const winA = bstA > bstB, winB = bstB > bstA;
  const diff = Math.abs(bstA - bstB);

  return (
    <div style={{ animation:'statRowIn 400ms ease both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:800, color: winA ? colorA : 'var(--ink)' }}>{bstA}</span>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ink-mute)' }}>Total BST</div>
          {diff > 0 && (
            <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em',
              color: winA ? colorA : colorB, marginTop:2 }}>
              {winA ? pokeA.name : pokeB.name} +{diff}
            </div>
          )}
        </div>
        <span style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:800, color: winB ? colorB : 'var(--ink)' }}>{bstB}</span>
      </div>
      {[[bstA, colorA, colorAHex, 100], [bstB, colorB, colorBHex, 160]].map(([bst, col, colHex, d], i) => (
        <div key={i} style={{ position:'relative', height:8, background:'rgba(0,0,0,0.07)', borderRadius:99, overflow:'hidden', marginBottom:3 }}>
          <div style={{
            position:'absolute', left:0, top:0, height:'100%',
            width: Math.round((bst / MAX_BST) * 100) + '%',
            background:col, borderRadius:99, opacity:0.75,
            transformOrigin:'left', animation:`barScaleIn 700ms ${d}ms cubic-bezier(.2,.8,.2,1) both`,
          }}/>
        </div>
      ))}
    </div>
  );
}

// ── Corner crosshair decoration ───────────────────────────────────────────────
function Crosshair({ style }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" style={{ position:'fixed', opacity:0.1, pointerEvents:'none', ...style }}>
      <line x1="14" y1="0"  x2="14" y2="28" stroke="var(--ink)" strokeWidth="1"/>
      <line x1="0"  y1="14" x2="28" y2="14" stroke="var(--ink)" strokeWidth="1"/>
      <circle cx="14" cy="14" r="5" fill="none" stroke="var(--ink)" strokeWidth="1"/>
    </svg>
  );
}

// ── Corner L-bracket ─────────────────────────────────────────────────────────
function CornerBracket({ style }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ position:'fixed', opacity:0.08, pointerEvents:'none', ...style }}>
      <path d="M 26 0 L 0 0 L 0 26" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="square"/>
    </svg>
  );
}

// ── Main compare view ─────────────────────────────────────────────────────────
function CompareView({ onBack }) {
  const [pokeA, setPokeA]   = useStateC(null);
  const [pokeB, setPokeB]   = useStateC(null);
  const [entered, setEntered] = useStateC(false);
  const [ballHover, setBallHover] = useStateC(false);
  const [exiting, setExiting]     = useStateC(false);
  // Read the actual computed hex for --hot so rgba() works on both sides
  const [hotHex, setHotHex] = useStateC('#d94a3d');
  useEffectC(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--hot').trim();
    if (v) setHotHex(v);
  }, []);

  useEffectC(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  const STAT_KEYS = [
    { key:'hp',    label:'HP' },
    { key:'atk',   label:'Attack' },
    { key:'def',   label:'Defense' },
    { key:'spAtk', label:'Sp. Atk' },
    { key:'spDef', label:'Sp. Def' },
    { key:'speed', label:'Speed' },
  ];

  const COLOR_A     = 'var(--hot)';
  const COLOR_B     = '#3d77d9';
  const COLOR_A_HEX = hotHex;
  const COLOR_B_HEX = '#3d77d9';

  const hasAny  = pokeA || pokeB;
  const hasBoth = pokeA && pokeB;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:400,
      background:'var(--bg)', overflowY:'auto',
      opacity: entered ? 1 : 0,
      transform: entered ? 'translateY(0)' : 'translateY(12px)',
      transition:'opacity 380ms ease, transform 380ms ease',
    }}>
      <style>{CMP_STYLES}</style>

      {/* ── Background layers ── */}
      {/* Dot grid */}
      <div aria-hidden="true" style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize:'28px 28px',
      }}/>

      {/* Diagonal stripe accents */}
      <div aria-hidden="true" style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:`repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 60px,
          rgba(0,0,0,0.012) 60px,
          rgba(0,0,0,0.012) 61px
        )`,
      }}/>

      {/* Corner crosshairs */}
      <Crosshair style={{ top:72, left:20 }}/>
      <Crosshair style={{ top:72, right:20 }}/>
      <Crosshair style={{ bottom:24, left:20 }}/>
      <Crosshair style={{ bottom:24, right:20 }}/>

      {/* Ghosted pokemon names in background when selected */}
      {pokeA && (
        <div aria-hidden="true" style={{
          position:'fixed', left:'-2vw', top:'30vh',
          fontFamily:'var(--display)', fontWeight:900,
          fontSize:'clamp(48px,7vw,88px)',
          letterSpacing:'-0.04em', textTransform:'uppercase',
          color:COLOR_A_HEX, opacity:0.04,
          userSelect:'none', pointerEvents:'none',
          writingMode:'vertical-rl', textOrientation:'mixed',
          transform:'rotate(180deg)',
        }}>
          {pokeA.name}
        </div>
      )}
      {pokeB && (
        <div aria-hidden="true" style={{
          position:'fixed', right:'-2vw', top:'30vh',
          fontFamily:'var(--display)', fontWeight:900,
          fontSize:'clamp(48px,7vw,88px)',
          letterSpacing:'-0.04em', textTransform:'uppercase',
          color:COLOR_B_HEX, opacity:0.04,
          userSelect:'none', pointerEvents:'none',
          writingMode:'vertical-rl', textOrientation:'mixed',
        }}>
          {pokeB.name}
        </div>
      )}

      {/* Bottom metadata strip */}
      <div aria-hidden="true" style={{
        position:'fixed', bottom:18, left:'clamp(40px,6vw,100px)',
        display:'flex', gap:20, alignItems:'center',
        fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.26em',
        textTransform:'uppercase', color:'var(--ink)', opacity:0.1,
        pointerEvents:'none', zIndex:0,
      }}>
        <span>SELECT</span>
        <span style={{ width:14, height:1, background:'var(--ink)', display:'inline-block' }}/>
        <span>COMPARE</span>
        <span style={{ width:14, height:1, background:'var(--ink)', display:'inline-block' }}/>
        <span>ANALYZE</span>
      </div>

      {/* Large concentric rings — top right */}
      <svg aria-hidden="true" style={{
        position:'fixed', top:'-80px', right:'-80px',
        width:'min(500px,52vmin)', height:'min(500px,52vmin)',
        pointerEvents:'none', zIndex:0, opacity:0.05,
      }} viewBox="0 0 500 500">
        <circle cx="480" cy="20" r="300" fill="none" stroke="var(--ink)" strokeWidth="1.2"/>
        <circle cx="480" cy="20" r="220" fill="none" stroke="var(--ink)" strokeWidth="0.7"/>
        <circle cx="480" cy="20" r="145" fill="none" stroke="var(--ink)" strokeWidth="0.5"/>
        <circle cx="480" cy="20" r="75"  fill="none" stroke="var(--ink)" strokeWidth="0.4"/>
      </svg>

      {/* Large concentric rings — bottom left */}
      <svg aria-hidden="true" style={{
        position:'fixed', bottom:'-60px', left:'-60px',
        width:'min(420px,44vmin)', height:'min(420px,44vmin)',
        pointerEvents:'none', zIndex:0, opacity:0.05,
      }} viewBox="0 0 420 420">
        <circle cx="20" cy="400" r="260" fill="none" stroke="var(--ink)" strokeWidth="1.2"/>
        <circle cx="20" cy="400" r="180" fill="none" stroke="var(--ink)" strokeWidth="0.7"/>
        <circle cx="20" cy="400" r="110" fill="none" stroke="var(--ink)" strokeWidth="0.5"/>
      </svg>

      {/* Large centered diamond */}
      <svg aria-hidden="true" style={{
        position:'fixed', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'min(560px,58vmin)', height:'min(560px,58vmin)',
        pointerEvents:'none', zIndex:0, opacity:0.028,
      }} viewBox="0 0 560 560">
        <polygon points="280,8 552,280 280,552 8,280" fill="none" stroke="var(--ink)" strokeWidth="1.5"/>
        <polygon points="280,90 470,280 280,470 90,280" fill="none" stroke="var(--ink)" strokeWidth="1"/>
        <polygon points="280,170 390,280 280,390 170,280" fill="none" stroke="var(--ink)" strokeWidth="0.6"/>
      </svg>

      {/* Corner L-brackets */}
      <CornerBracket style={{ top:10, left:10 }}/>
      <CornerBracket style={{ top:10, right:10, transform:'scaleX(-1)' }}/>
      <CornerBracket style={{ bottom:10, left:10, transform:'scaleY(-1)' }}/>
      <CornerBracket style={{ bottom:10, right:10, transform:'scale(-1,-1)' }}/>

      {/* Scattered small diamonds */}
      {[
        [7, 24], [94, 19], [4, 64], [96, 60],
        [18, 90], [80, 86], [50, 6], [33, 95], [68, 10],
      ].map(([lp, tp], i) => (
        <div key={i} aria-hidden="true" style={{
          position:'fixed', left:lp+'%', top:tp+'%',
          width:6, height:6,
          border:'1px solid var(--ink)',
          transform:'rotate(45deg)',
          opacity:0.07,
          pointerEvents:'none', zIndex:0,
        }}/>
      ))}

      {/* Exit flash */}
      <div style={{
        position:'fixed', inset:0, zIndex:600,
        background:'white',
        opacity: exiting ? 1 : 0,
        pointerEvents: exiting ? 'auto' : 'none',
        transition:'opacity 280ms ease-in',
      }}/>

      {/* Return pokeball */}
      <div style={{
        position:'fixed', top:22, left:'50%', transform:'translateX(-50%)',
        zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      }}>
        <button
          onClick={() => { setExiting(true); setTimeout(onBack, 320); }}
          onMouseEnter={() => setBallHover(true)}
          onMouseLeave={() => setBallHover(false)}
          style={{
            all:'unset', cursor:'pointer',
            width:40, height:40, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'var(--paper)',
            border:'1px solid rgba(17,17,17,0.14)',
            boxShadow: ballHover ? '0 6px 22px rgba(0,0,0,0.18)' : '0 4px 18px rgba(0,0,0,0.13)',
            transform: ballHover ? 'scale(1.1)' : 'scale(1)',
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
        <div style={{
          opacity: ballHover ? 1 : 0,
          transition:'opacity 220ms ease',
          pointerEvents:'none',
          background:'var(--paper)',
          border:'1px solid rgba(17,17,17,0.10)',
          borderRadius:10, padding:'6px 12px',
          boxShadow:'0 4px 14px rgba(0,0,0,0.09)',
          whiteSpace:'nowrap',
        }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
            <span style={{ color:'var(--hot)', fontWeight:700 }}>1×</span> Return to Centre
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <div style={{
        position:'sticky', top:0, zIndex:10,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'15px clamp(24px,5vw,80px)',
        background:'var(--bg)', borderBottom:'1px solid rgba(17,17,17,0.08)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ opacity:0.35 }}>
            <path d="M3 12 A9 9 0 0 1 21 12 Z" fill="var(--hot)"/>
            <path d="M3 12 A9 9 0 0 0 21 12 Z" fill="white"/>
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--ink)" strokeWidth="1.5"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="var(--ink)" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2.8" fill="white" stroke="var(--ink)" strokeWidth="1.5"/>
          </svg>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
            Pokémon
          </span>
          <span style={{ width:1, height:14, background:'rgba(0,0,0,0.15)' }}/>
          <span style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:20, letterSpacing:'-0.03em', textTransform:'uppercase' }}>
            Compare
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          {hasBoth && (
            <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase',
              color:'var(--ink-mute)', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:COLOR_A, fontWeight:700 }}>{pokeA.name}</span>
              <span style={{ opacity:0.3 }}>vs</span>
              <span style={{ color:COLOR_B, fontWeight:700 }}>{pokeB.name}</span>
            </span>
          )}
          <button onClick={onBack} style={{ all:'unset', cursor:'pointer',
            fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase',
            color:'var(--ink-mute)', borderBottom:'1px solid var(--ink-mute)', paddingBottom:2 }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ position:'relative', zIndex:1, padding:'clamp(24px,3vh,48px) clamp(24px,5vw,80px)',
        maxWidth:1100, margin:'0 auto', animation:'cmpPageIn 500ms 80ms ease both' }}>

        {/* Pickers */}
        <div style={{ display:'flex', gap:20, alignItems:'flex-end', marginBottom:40 }}>
          <ComparePicker label="Pokémon A" dotColor={COLOR_A} value={pokeA} onPick={setPokeA}/>
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, paddingBottom:10 }}>
            <div style={{ width:1, height:16, background:'rgba(0,0,0,0.12)' }}/>
            <span style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:12, letterSpacing:'0.1em',
              color:'var(--ink-mute)', opacity:0.55 }}>VS</span>
            <div style={{ width:1, height:16, background:'rgba(0,0,0,0.12)' }}/>
          </div>
          <ComparePicker label="Pokémon B" dotColor={COLOR_B} value={pokeB} onPick={setPokeB}/>
        </div>

        {!hasAny && (
          <div style={{ textAlign:'center', padding:'80px 0',
            fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-mute)', opacity:0.4 }}>
            Select two Pokémon to compare
          </div>
        )}

        {hasAny && (
          <>
            {/* A vs B banner */}
            {hasBoth && (
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24,
                animation:'vsAppear 400ms 200ms ease both' }}>
                <div style={{ flex:1, height:1, background:rgba(COLOR_A_HEX, 0.35) }}/>
                <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:11, letterSpacing:'0.16em',
                  display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color:COLOR_A }}>{pokeA.name}</span>
                  <span style={{ color:'var(--ink-mute)', opacity:0.35, fontFamily:'var(--mono)', fontWeight:400 }}>vs</span>
                  <span style={{ color:COLOR_B }}>{pokeB.name}</span>
                </div>
                <div style={{ flex:1, height:1, background:rgba(COLOR_B_HEX, 0.35) }}/>
              </div>
            )}

            {/* Columns — key triggers re-entrance animation on pokemon change */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(16px,3vw,40px)', alignItems:'start' }}>
              <PokeColumn key={pokeA?.number ?? 'empty-a'} pokemon={pokeA}
                color={COLOR_A} colorHex={COLOR_A_HEX} radarSize={290} side="left"/>
              <PokeColumn key={pokeB?.number ?? 'empty-b'} pokemon={pokeB}
                color={COLOR_B} colorHex={COLOR_B_HEX} radarSize={290} side="right"/>
            </div>

            {/* Stats */}
            {hasBoth && (
              <>
                <SectionRule label="Base Stats" delay={100}/>
                <div style={{ maxWidth:620, margin:'0 auto', display:'flex', flexDirection:'column', gap:18 }}>
                  <BstCompare pokeA={pokeA} pokeB={pokeB}
                    colorA={COLOR_A} colorB={COLOR_B}
                    colorAHex={COLOR_A_HEX} colorBHex={COLOR_B_HEX}/>
                  <div style={{ height:1, background:'rgba(0,0,0,0.07)' }}/>
                  {STAT_KEYS.map(({ key, label }, idx) => (
                    <StatBar key={key} label={label} valA={pokeA[key]||0} valB={pokeB[key]||0}
                      idx={idx} colorA={COLOR_A} colorB={COLOR_B}/>
                  ))}
                </div>

                <SectionRule label="Attack Matchup" delay={200}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(16px,3vw,40px)' }}>
                  <AttackMatchup attacker={pokeA} defender={pokeB} color={COLOR_A} delay={0}/>
                  <AttackMatchup attacker={pokeB} defender={pokeA} color={COLOR_B} delay={80}/>
                </div>
              </>
            )}
          </>
        )}
        <div style={{ height:80 }}/>
      </div>
    </div>
  );
}

window.CompareView = CompareView;
