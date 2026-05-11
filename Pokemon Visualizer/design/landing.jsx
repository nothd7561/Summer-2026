// landing.jsx — typography top-left, sprite center, search on the right
const { useState: useStateL, useEffect: useEffectL, useMemo: useMemoL, useRef: useRefL } = React;

const LANDING_T = {
  EN: {
    eyebrow: 'Summer 2026',
    headline1: 'Learn About',
    headline2: 'Your',
    headlineItalic: 'Pokémon.',
    desc: 'A project that combines data extraction and graphic design.',
    viewing: 'NOW VIEWING',
    searchLabel: 'SEARCH POKÉDEX',
    placeholder: 'name or pokédex #',
    confirm: 'CONFIRM',
    surprise: '↻ surprise me',
  },
  JP: {
    eyebrow: 'Summer 2026',
    headline1: '知ろう',
    headline2: 'あなたの',
    headlineItalic: 'ポケモン。',
    desc: 'A project that combines data extraction and graphic design.',
    viewing: '現在表示中',
    searchLabel: 'ポケデックス検索',
    placeholder: '名前または図鑑番号',
    confirm: '確認',
    surprise: '↻ サプライズ',
  },
};

function Landing({ data, onConfirm, locale = 'EN' }) {
  const t = LANDING_T[locale] || LANDING_T.EN;
  const [query, setQuery] = useStateL('');
  const [selected, setSelected] = useStateL(null);
  const [hover, setHover] = useStateL(0);
  const [picked, setPicked] = useStateL(false);
  const inputRef = useRefL(null);

  const starters = useMemoL(() => {
    const ids = [9, 6, 3, 25, 94, 130, 143, 149, 196, 448, 658];
    return ids.map(n => data.all.find(p => p.number === n)).filter(Boolean);
  }, [data]);
  const [heroIdx, setHeroIdx] = useStateL(0);
  useEffectL(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % starters.length), 4400);
    return () => clearInterval(t);
  }, [starters.length]);

  const featured = selected || starters[heroIdx];
  const matches = useMemoL(() => query ? window.PokeData.fuzzySearch(query, data.all, 6) : [], [query, data]);
  useEffectL(() => { setHover(0); }, [query]);

  function pick(p) { setSelected(p); setQuery(p.name); setHover(0); setPicked(true); }
  function confirm() {
    const target = selected || matches[0] || starters[heroIdx];
    if (target) onConfirm(target);
  }
  function surprise() {
    const pool = data.all.filter(p => !p.isForm);
    const r = pool[Math.floor(Math.random() * pool.length)];
    onConfirm(r);
  }
  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHover(h => Math.min(h+1, matches.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHover(h => Math.max(h-1, 0)); }
    else if (e.key === 'Enter') { onConfirm(matches[hover] || selected || matches[0] || starters[heroIdx]); }
  }

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', zIndex: 5 }}>

      {/* TYPOGRAPHY — top left */}
      <div style={{ position:'absolute', left: 'clamp(40px, 7vw, 130px)', top: 170, maxWidth: 'min(440px, 32vw)', zIndex: 2 }}>
        <div style={{
          display:'flex', alignItems:'center', gap: 14, marginBottom: 22,
          fontFamily:'var(--mono)', fontSize: 11, letterSpacing:'0.24em',
          textTransform:'uppercase'
        }}>
          <span style={{ width: 28, height: 1, background:'var(--ink)' }}/>
          <span>{t.eyebrow}</span>
        </div>
        <h1 style={{
          fontFamily:'var(--display)', fontWeight: 800,
          fontSize: 'clamp(40px, 4.8vw, 88px)',
          lineHeight: 0.96, letterSpacing: '-0.045em', margin: 0,
          textTransform:'uppercase',
        }}>
          {t.headline1}<br/>
          {t.headline2} <span style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic', textTransform:'none' }}>{t.headlineItalic}</span>
        </h1>
        <p style={{
          marginTop: 22, maxWidth: 380, color:'var(--ink-mute)',
          fontFamily:'var(--display)', fontWeight: 400,
          fontSize: 13, lineHeight: 1.7,
        }}>
          {t.desc}
        </p>
      </div>

      {/* SPRITE — dead center, behind text layers */}
      <div style={{
        position:'absolute', left: '50%', top: '50%',
        transform:'translate(-50%, -50%)',
        width: 'min(380px, 28vw)', height: 'min(380px, 28vw)',
        display:'flex', alignItems:'center', justifyContent:'center',
        pointerEvents:'none', zIndex: 1,
      }}>
        {/* faded dex number sits behind */}
        <div style={{
          position:'absolute',
          fontFamily:'var(--display)', fontWeight:900,
          fontSize: 'clamp(220px, 28vw, 380px)', letterSpacing:'-0.06em', lineHeight: 0.85,
          color:'rgba(17,17,17,0.04)', userSelect:'none', whiteSpace:'nowrap',
        }}>
          {String(featured.number).padStart(3,'0')}
        </div>

        {starters.map((p, i) => {
          const show = (!selected && i === heroIdx) || (selected && p.number === selected.number);
          return (
            <div key={p.number} style={{
              position:'absolute',
              opacity: show ? 1 : 0,
              transform: show ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(28px)',
              transition:'opacity 700ms ease, transform 1100ms cubic-bezier(.2,.7,.2,1)',
            }}>
              <FloatHero pokemon={p}/>
            </div>
          );
        })}
        {selected && !starters.find(s => s.number === selected.number) && (
          <div style={{ position:'absolute' }}><FloatHero pokemon={selected}/></div>
        )}
      </div>

      {/* SEARCH — right side, vertically centred */}
      <div style={{
        position:'absolute', right: 'clamp(40px, 7vw, 130px)',
        top: 170,
        width: 'min(340px, 28vw)',
        display:'flex', flexDirection:'column', gap: 10,
        zIndex: 2,
      }}>
        <div style={{
          fontFamily:'var(--mono)', fontSize: 10, letterSpacing:'0.28em',
          textTransform:'uppercase', color:'var(--ink-mute)',
          display:'flex', alignItems:'center', gap: 10,
        }}>
          <span style={{ color:'var(--hot)' }}>✦</span> {t.viewing}
          <span style={{ marginLeft:'auto' }}>#{String(featured.number).padStart(4,'0')}</span>
        </div>
        <div>
          <div style={{
            fontFamily:'var(--display)', fontWeight:700, fontSize: 28,
            letterSpacing:'-0.02em', textTransform:'uppercase',
          }}>
            {featured.name}
          </div>
          <div style={{
            fontFamily:'var(--serif)', fontStyle:'italic',
            fontSize: 14, color:'var(--ink-mute)', marginTop: 4,
          }}>
            {featured.genus?.toLowerCase()}
          </div>
        </div>

        <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
          <span className={'type-chip t-' + featured.type1.toLowerCase()}>
            <span className="sw"/>{featured.type1}
          </span>
          {featured.type2 && (
            <span className={'type-chip t-' + featured.type2.toLowerCase()}>
              <span className="sw"/>{featured.type2}
            </span>
          )}
        </div>

        <div className="dot-rule" style={{ margin:'8px 0' }}/>

        <div className="mono-meta">{t.searchLabel}</div>
        <div style={{
          display:'flex', alignItems:'center',
          border:'1px solid var(--ink)', borderRadius: 999,
          padding: '6px 8px 6px 22px', background:'var(--card)',
        }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setPicked(false); }}
            onKeyDown={onKey}
            placeholder={t.placeholder}
            autoFocus
            style={{
              flex:1, border:'none', outline:'none', background:'transparent',
              fontFamily:'var(--display)', fontWeight:500, fontSize: 15,
              padding: '10px 0', color:'var(--ink)'
            }}
          />
          <button className="btn" onClick={confirm}>
            {t.confirm} <span>→</span>
          </button>
        </div>
        <button onClick={surprise} style={{
          all:'unset', cursor:'pointer', marginTop: 6,
          fontFamily:'var(--mono)', fontSize: 10, letterSpacing:'0.28em',
          textTransform:'uppercase', color:'var(--ink-mute)',
          borderBottom:'1px dashed var(--ink-mute)', alignSelf:'flex-start',
          paddingBottom: 2,
        }}>{t.surprise}</button>

        {!picked && matches.length > 0 && (
          <div className="card" style={{ padding: 6, borderRadius: 22, overflow:'auto', maxHeight: 'min(300px, 35vh)' }}>
            {matches.map((p, i) => (
              <div key={p.number}
                onMouseEnter={() => setHover(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(p); }}
                style={{
                  display:'grid', gridTemplateColumns:'40px 1fr auto',
                  alignItems:'center', gap:12, padding:'8px 12px', cursor:'pointer',
                  borderRadius: 16,
                  background: hover === i ? 'rgba(217,74,61,0.06)' : 'transparent',
                }}>
                <img src={p.sprite} alt="" style={{
                  width: 40, height: 40, objectFit:'contain', imageRendering:'pixelated'
                }}/>
                <div>
                  <div style={{
                    fontFamily:'var(--display)', fontWeight: hover === i ? 700 : 500,
                    fontSize:14, letterSpacing:'-0.01em'
                  }}>{p.name}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)' }}>
                    #{String(p.number).padStart(4,'0')}
                  </div>
                </div>
                <span className={'type-chip t-' + p.type1.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>
                  {p.type1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FloatHero({ pokemon }) {
  return (
    <div style={{
      animation:'heroFloat 6.5s ease-in-out infinite',
      width: 'min(380px, 28vw)', height: 'min(380px, 28vw)',
    }}>
      <style>{`@keyframes heroFloat { 0%,100%{transform:translateY(-10px) rotate(-2deg);} 50%{transform:translateY(14px) rotate(2deg);} }`}</style>
      <img src={pokemon.sprite} alt={pokemon.name} style={{
        width:'100%', height:'100%', objectFit:'contain', imageRendering:'pixelated',
        filter:'drop-shadow(0 28px 30px rgba(0,0,0,0.22))',
      }}/>
    </div>
  );
}

window.Landing = Landing;
