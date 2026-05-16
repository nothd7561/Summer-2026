// landing.jsx — 3D center as full-screen backdrop, panels overlaid
const { useState: useStateL, useEffect: useEffectL, useMemo: useMemoL, useRef: useRefL } = React;

const LANDING_T = {
  EN: {
    eyebrow: 'Summer 2026',
    headline1: 'Get Started',
    headline2: 'with',
    headlineItalic: 'Pokemon!',
    desc: 'A project that combines data extraction and graphic design.',
    diveLabel: 'Ready to explore',
    dive: 'Dive In',
    back: '← back',
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
    diveLabel: '探索の準備はできた？',
    dive: '飛び込む',
    back: '← 戻る',
    viewing: '現在表示中',
    searchLabel: 'ポケデックス検索',
    placeholder: '名前または図鉴番号',
    confirm: '確認',
    surprise: '↻ サプライズ',
  },
  ZH: {
    eyebrow: 'Summer 2026',
    headline1: '了解',
    headline2: '你的',
    headlineItalic: '宝可梦。',
    desc: 'A project that combines data extraction and graphic design.',
    diveLabel: '准备好探索了吗',
    dive: '进入',
    back: '← 返回',
    viewing: '当前查看',
    searchLabel: '搜索图鉴',
    placeholder: '名称或图鉴编号',
    confirm: '确认',
    surprise: '↻ 随机',
  },
};

// viewPhase:
//  'idle'      — panoramic view, left typography visible
//  'zooming'   — zoom animation, back button visible
//  'diveIn'    — zoom done, right panel shows "Dive In?" confirmation
//  'searching' — search panel visible on right

function Landing({ data, onConfirm, locale = 'EN', landingCmdRef, onPhaseChange, onCompare }) {
  const t = LANDING_T[locale] || LANDING_T.EN;
  const [query, setQuery]         = useStateL('');
  const [selected, setSelected]   = useStateL(null);
  const [hover, setHover]         = useStateL(0);
  const [picked, setPicked]       = useStateL(false);
  const [viewPhase, setViewPhase] = useStateL('idle');
  const [flashing, setFlashing]       = useStateL(false);
  const [slowFlash, setSlowFlash]     = useStateL(false);
  const [showCompareConfirm, setShowCompareConfirm] = useStateL(false);
  const pendingTargetRef = useRefL(null);
  const inputRef         = useRefL(null);
  const pokeCenterCmdRef = useRefL(null);
  const dropdownRef      = useRefL(null);
  const [dropdownRect, setDropdownRect] = useStateL(null);

  const starters = useMemoL(() => {
    const ids = [9, 6, 3, 25, 94, 130, 143, 149, 196, 448, 658];
    return ids.map(n => data.all.find(p => p.number === n)).filter(Boolean);
  }, [data]);
  const [heroIdx, setHeroIdx] = useStateL(0);
  useEffectL(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % starters.length), 4400);
    return () => clearInterval(timer);
  }, [starters.length]);

  const featured = selected || starters[heroIdx];
  const matches  = useMemoL(() => query ? window.PokeData.fuzzySearch(query, data.all, 6) : [], [query, data]);
  useEffectL(() => { setHover(0); }, [query]);
  useEffectL(() => { onPhaseChange?.(viewPhase); }, [viewPhase]);
  useEffectL(() => {
    if (!matches.length || picked) { setDropdownRect(null); return; }
    const update = () => {
      const el = dropdownRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('resize', update);
    const root = document.getElementById('root');
    root?.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      root?.removeEventListener('scroll', update);
    };
  }, [matches, picked]);

  function pick(p)    { setSelected(p); setQuery(p.name); setHover(0); setPicked(true); }
  function confirm() {
    const tgt = selected || matches[0] || starters[heroIdx];
    if (!tgt) return;
    pendingTargetRef.current = tgt;
    setViewPhase('confirming');
    if (pokeCenterCmdRef.current?.zoomToCenter) {
      pokeCenterCmdRef.current.zoomToCenter(() => {
        setFlashing(true);
        setTimeout(() => {
          onConfirm(pendingTargetRef.current);
          setTimeout(() => {
            setFlashing(false);
            pokeCenterCmdRef.current?.snapToStart();
            setViewPhase('searching');
          }, 380);
        }, 360);
      });
    } else {
      onConfirm(tgt);
      pokeCenterCmdRef.current?.snapToStart();
      setViewPhase('searching');
    }
  }
  function surprise() { const pool = data.all.filter(p => !p.isForm); onConfirm(pool[Math.floor(Math.random() * pool.length)]); }
  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHover(h => Math.min(h+1, matches.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHover(h => Math.max(h-1, 0)); }
    else if (e.key === 'Enter') { onConfirm(matches[hover] || selected || matches[0] || starters[heroIdx]); }
  }
  function handleBackToStart() {
    pokeCenterCmdRef.current?.resetToStart();
    setViewPhase('idle');
  }

  function handleComputerAnnotationClick() {
    pokeCenterCmdRef.current?.startComputerZoom();
  }

  function handleComputerZoomComplete() {
    setShowCompareConfirm(true);
  }

  function handleConfirmCompare() {
    setShowCompareConfirm(false);
    setSlowFlash(true);
    setFlashing(true);
    setTimeout(() => {
      onCompare?.();
      pokeCenterCmdRef.current?.snapToStart();
      setTimeout(() => {
        setSlowFlash(false);
        setFlashing(false);
      }, 480);
    }, 400);
  }

  function handleCancelCompare() {
    setShowCompareConfirm(false);
    pokeCenterCmdRef.current?.resetToStart();
  }
  function handleDiveIn() {
    setViewPhase('confirming');
    setSlowFlash(true);
    setFlashing(true);                      // light starts building immediately
    if (pokeCenterCmdRef.current?.zoomToCenter) {
      pokeCenterCmdRef.current.zoomToCenter(() => {
        setTimeout(() => {
          // Screen is fully white — swap to search and reset camera while hidden
          setViewPhase('searching');
          pokeCenterCmdRef.current?.snapToStart();
          // Hold white a beat, then fade out to reveal the original prototype
          setTimeout(() => {
            setSlowFlash(false);
            setFlashing(false);
            setTimeout(() => inputRef.current?.focus(), 50);
          }, 480);
        }, 400);
      });
    } else {
      setViewPhase('searching');
      setSlowFlash(false);
      setFlashing(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  useEffectL(() => {
    if (!landingCmdRef) return;
    landingCmdRef.current = {
      goIdle() {
        pokeCenterCmdRef.current?.resetToStart();
        setQuery(''); setSelected(null); setPicked(false);
        setViewPhase('idle');
      },
      goSearch() {
        pokeCenterCmdRef.current?.snapToStart();
        setQuery(''); setSelected(null); setPicked(false);
        setViewPhase('searching');
      },
    };
    return () => { if (landingCmdRef) landingCmdRef.current = null; };
  }, []);

  const oTypo   = viewPhase === 'idle'      ? 1 : 0;
  const oDive   = viewPhase === 'diveIn'    ? 1 : 0;
  const oSearch = viewPhase === 'searching' ? 1 : 0;
  const oBack   = viewPhase === 'zooming'   ? 1 : 0;

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', zIndex:5 }}>

      {/* Gradient sky — separate so POKEMON text can sit between it and the canvas */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        background:'linear-gradient(180deg,#a8edea,#b3eae9,#bee7e8,#c8e4e7,#d3e2e7,#dedfe6,#e9dce5,#f3d9e4,#fed6e3)',
        opacity: (viewPhase === 'confirming' || viewPhase === 'searching') ? 0 : 1,
        transition: 'opacity 500ms ease',
        pointerEvents: 'none',
      }}/>

      {/* POKEMON tiled watermark — fills full viewport, clipped by overflow hidden */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        overflow:'hidden',
        userSelect:'none', pointerEvents:'none',
        opacity: oTypo * 0.065,
        transition:'opacity 400ms ease',
      }}>
        {Array.from({length:20}).map((_,i) => (
          <div key={i} style={{
            fontFamily:'var(--haas)', fontWeight:700,
            fontSize:'clamp(52px, 5.2vw, 94px)',
            lineHeight:0.9, letterSpacing:'-0.04em',
            textTransform:'uppercase', color:'var(--ink)',
            whiteSpace:'nowrap',
          }}>
            {'POKEMON '.repeat(10)}
          </div>
        ))}
      </div>

      {/* 3D POKEMON CENTER — later in DOM than POKEMON text, same zIndex:1, so canvas paints on top */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        opacity: (viewPhase === 'confirming' || viewPhase === 'searching') ? 0 : 1,
        transition: 'opacity 500ms ease',
        pointerEvents: (viewPhase === 'confirming' || viewPhase === 'searching') ? 'none' : 'auto',
      }}>
        <PokeCenterScene
          cmdRef={pokeCenterCmdRef}
          onZoomStart={() => setViewPhase('zooming')}
          onZoomComplete={() => setViewPhase('diveIn')}
          onComputerAnnotationClick={handleComputerAnnotationClick}
          onComputerZoomComplete={handleComputerZoomComplete}
        />
      </div>


      {/* SEARCH PHASE BACKGROUND DECORATION */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none',
        opacity: oSearch, transition:'opacity 700ms ease',
      }}>
        {/* Faded giant dex number */}
        <div style={{
          position:'absolute', left:'50%', top:'50%',
          transform:'translate(-50%,-54%)',
          fontFamily:'var(--display)', fontWeight:900,
          fontSize:'min(42vw, 420px)',
          letterSpacing:'-0.06em', color:'var(--ink)',
          opacity:0.035, userSelect:'none', lineHeight:1, whiteSpace:'nowrap',
        }}>
          {String(featured.number).padStart(4,'0')}
        </div>
        {/* Bottom-left metadata strip */}
        <div style={{
          position:'absolute', bottom:32, left:'clamp(40px,6vw,100px)',
          display:'flex', gap:24, alignItems:'center',
          fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.26em',
          textTransform:'uppercase', color:'var(--ink)', opacity:0.18,
        }}>
          <span>SELECT</span>
          <span style={{ width:18, height:1, background:'var(--ink)', display:'inline-block' }}/>
          <span>CONFIRM</span>
          <span style={{ width:18, height:1, background:'var(--ink)', display:'inline-block' }}/>
          <span>EXPLORE</span>
        </div>
        {/* Corner crosshair — top right */}
        <svg style={{ position:'absolute', top:20, right:160, width:24, height:24, opacity:0.12 }} viewBox="0 0 24 24">
          <line x1="12" y1="0" x2="12" y2="24" stroke="var(--ink)" strokeWidth="1"/>
          <line x1="0" y1="12" x2="24" y2="12" stroke="var(--ink)" strokeWidth="1"/>
          <circle cx="12" cy="12" r="4" fill="none" stroke="var(--ink)" strokeWidth="1"/>
        </svg>
      </div>

      {/* TOP CENTER TITLE */}
      <div style={{
        position:'absolute', left:'50%', top:'clamp(28px, 4vh, 52px)',
        transform:'translateX(-50%)',
        zIndex:3, pointerEvents:'none', textAlign:'center',
      }}>
        <div style={{
          opacity: viewPhase === 'idle' ? 1 : 0,
          transition:'opacity 480ms ease',
          fontFamily:'var(--display)', fontWeight:700,
          fontSize:'clamp(13px, 1.2vw, 20px)',
          letterSpacing:'0.14em', textTransform:'uppercase',
          color:'var(--ink)', whiteSpace:'nowrap',
          borderBottom:'1px solid var(--ink)', paddingBottom:3,
        }}>Pokémon Centre</div>
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          opacity: viewPhase !== 'idle' ? 1 : 0,
          transition:'opacity 480ms ease 200ms',
          whiteSpace:'nowrap',
        }}>
          <div style={{
            fontFamily:'var(--display)', fontWeight:800,
            fontSize:'clamp(13px, 1.2vw, 20px)',
            letterSpacing:'0.14em', textTransform:'uppercase',
            color:'var(--ink)', textDecoration:'underline',
          }}>Learn</div>
          <div style={{
            fontFamily:'var(--mono)', fontSize:9,
            letterSpacing:'0.18em', textTransform:'uppercase',
            color:'var(--ink-mute)', marginTop:5,
          }}>stats · evolutions · comparisons</div>
        </div>
      </div>

      {/* LEFT PANEL — typography fades out, dive-in fades in */}
      <div style={{
        position:'absolute', left:'clamp(40px, 7vw, 130px)',
        top:'clamp(68px, 8vh, 108px)',
        width:'min(340px, 26vw)',
        minHeight:'clamp(280px, 38vh, 440px)',
        zIndex:2, pointerEvents:'none',
      }}>
        {/* TYPOGRAPHY */}
        <div style={{
          position:'absolute', inset:0,
          opacity: oTypo, pointerEvents:'none',
          transition:'opacity 400ms ease',
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10, marginBottom:18,
            fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase',
          }}>
            <span style={{ width:22, height:1, background:'var(--ink)' }}/>
            <span>{t.eyebrow}</span>
          </div>
          <h1 style={{
            fontFamily:'var(--haas)', fontWeight:700,
            fontSize:'clamp(38px, 3.8vw, 68px)',
            lineHeight:0.93, letterSpacing:'-0.02em', margin:0,
            textTransform:'uppercase',
          }}>
            {t.headline1}<br/>
            {t.headline2}{' '}{t.headlineItalic}
          </h1>
        </div>

        {/* DIVE-IN */}
        <div style={{
          position:'absolute', inset:0,
          opacity:oDive, pointerEvents: oDive ? 'auto' : 'none',
          transition:'opacity 500ms ease',
          display:'flex', flexDirection:'column', gap:16,
          paddingTop:'clamp(44px, 5.5vh, 68px)',
        }}>
          <div style={{
            fontFamily:'var(--display)', fontWeight:800,
            fontSize:'clamp(36px, 3.5vw, 60px)',
            lineHeight:0.93, letterSpacing:'-0.04em',
            textTransform:'uppercase',
          }}>
            {t.dive}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
            <button className="btn" onClick={handleDiveIn}>
              {t.confirm} <span>→</span>
            </button>
            <button className="btn ghost" onClick={handleBackToStart}>
              {t.back}
            </button>
          </div>
        </div>
      </div>

      {/* LEFT TYPOGRAPHY — visible during search phase, same vertical position as search */}
      <div style={{
        position:'absolute', left:'clamp(40px, 6vw, 100px)',
        top:'50%', transform:'translateY(-50%)',
        width:'min(340px, 26vw)',
        minHeight:'clamp(280px, 38vh, 440px)',
        zIndex:2, pointerEvents:'none',
        opacity: oSearch,
        transition:'opacity 500ms ease',
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10, marginBottom:18,
          fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase',
        }}>
          <span style={{ width:22, height:1, background:'var(--ink)' }}/>
          <span>{t.eyebrow}</span>
        </div>
        <h1 style={{
          fontFamily:'var(--display)', fontWeight:800,
          fontSize:'clamp(38px, 3.8vw, 68px)',
          lineHeight:0.93, letterSpacing:'-0.045em', margin:0,
          textTransform:'uppercase',
        }}>
          {t.headline1}<br/>
          {t.headline2}{' '}
          <span style={{
            fontFamily:'var(--serif)', fontWeight:300,
            fontStyle:'italic', textTransform:'none',
          }}>{t.headlineItalic}</span>
        </h1>
      </div>

      {/* RIGHT PANEL — search */}
      <div style={{
        position:'absolute', right:'clamp(40px, 6vw, 100px)',
        top:'50%', transform:'translateY(-50%)',
        width:'min(340px, 26vw)',
        minHeight:'clamp(280px, 38vh, 440px)',
        zIndex:2, pointerEvents:'none',
      }}>

        {/* SEARCH */}
        <div style={{
          position:'absolute', inset:0,
          opacity:oSearch, pointerEvents: oSearch ? 'auto' : 'none',
          transition:'opacity 500ms ease',
          display:'flex', flexDirection:'column', gap:10,
        }}>
          <div style={{
            fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.28em',
            textTransform:'uppercase', color:'var(--ink-mute)',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{ color:'var(--hot)' }}>✦</span> {t.viewing}
            <span style={{ marginLeft:'auto' }}>#{String(featured.number).padStart(4,'0')}</span>
          </div>
          <div>
            <div style={{
              fontFamily:'var(--display)', fontWeight:700, fontSize:28,
              letterSpacing:'-0.02em', textTransform:'uppercase',
            }}>
              {featured.name}
            </div>
            <div style={{
              fontFamily:'var(--serif)', fontStyle:'italic',
              fontSize:14, color:'var(--ink-mute)', marginTop:4,
            }}>
              {featured.genus?.toLowerCase()}
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
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
          <div ref={dropdownRef} style={{
            display:'flex', alignItems:'center',
            border:'1px solid var(--ink)', borderRadius:999,
            padding:'6px 8px 6px 22px', background:'var(--card)',
          }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); setPicked(false); }}
              onKeyDown={onKey}
              placeholder={t.placeholder}
              style={{
                flex:1, border:'none', outline:'none', background:'transparent',
                fontFamily:'var(--display)', fontWeight:500, fontSize:15,
                padding:'10px 0', color:'var(--ink)',
              }}
            />
            <button className="btn" onClick={confirm}>
              {t.confirm} <span>→</span>
            </button>
          </div>
          <div style={{ marginTop:2 }}>
            <button onClick={surprise} style={{
              all:'unset', cursor:'pointer',
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.28em',
              textTransform:'uppercase', color:'var(--ink-mute)',
              borderBottom:'1px dashed var(--ink-mute)', paddingBottom:2,
            }}>{t.surprise}</button>
          </div>
        </div>

      </div>

      {/* CENTER SPRITE — featured pokemon in center during search */}
      <div style={{
        position:'absolute', left:'50%', top:'50%',
        width:0, height:0, zIndex:1, pointerEvents: oSearch ? 'auto' : 'none',
        opacity: viewPhase === 'searching' ? 1 : 0,
        transition:'opacity 600ms ease',
      }}>
        <img
          key={featured.number}
          src={featured.sprite}
          alt={featured.name}
          onClick={() => { setSelected(null); setQuery(''); setPicked(false); setHeroIdx(i => (i + 1) % starters.length); }}
          style={{
            position:'absolute',
            width:384, height:384,
            objectFit:'contain', imageRendering:'pixelated',
            transform:'translate(-50%,-50%)',
            animation:'sprite-pop 500ms ease forwards',
            opacity:0, cursor:'pointer',
          }}
        />
      </div>


      {/* DROPDOWN PORTAL — rendered into document.body to escape overflow clipping */}
      {dropdownRect && !picked && matches.length > 0 && ReactDOM.createPortal(
        <div className="card" style={{
          position:'fixed',
          top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width,
          zIndex:1000, padding:6, borderRadius:22,
          overflow:'auto', maxHeight:'min(280px, 32vh)',
        }}>
          {matches.map((p, i) => (
            <div key={p.number}
              onMouseEnter={() => setHover(i)}
              onMouseDown={e => { e.preventDefault(); pick(p); }}
              style={{
                display:'grid', gridTemplateColumns:'40px 1fr auto',
                alignItems:'center', gap:12, padding:'8px 12px', cursor:'pointer',
                borderRadius:16,
                background: hover === i ? 'rgba(217,74,61,0.06)' : 'transparent',
              }}>
              <img src={p.sprite} alt="" style={{ width:40, height:40, objectFit:'contain', imageRendering:'pixelated' }}/>
              <div>
                <div style={{ fontFamily:'var(--display)', fontWeight: hover === i ? 700 : 500, fontSize:14, letterSpacing:'-0.01em' }}>{p.name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)' }}>#{String(p.number).padStart(4,'0')}</div>
              </div>
              <span className={'type-chip t-' + p.type1.toLowerCase()} style={{ fontSize:9, padding:'3px 8px' }}>{p.type1}</span>
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* COMPARE CONFIRM DIALOG */}
      <style>{`@keyframes confIn { from{opacity:0;transform:scale(0.88) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
      {showCompareConfirm && (
        <div style={{
          position:'fixed', inset:0, zIndex:200,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.18)' }} onClick={handleCancelCompare}/>
          <div style={{
            position:'relative', zIndex:1,
            background:'var(--paper)',
            border:'1px solid rgba(17,17,17,0.1)',
            borderRadius:24,
            padding:'36px 44px',
            textAlign:'center',
            boxShadow:'0 16px 56px rgba(0,0,0,0.2)',
            animation:'confIn 260ms cubic-bezier(.2,.8,.2,1) both',
          }}>
            <div style={{
              fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.24em',
              textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:12,
            }}>pokémon centre</div>
            <div style={{
              fontFamily:'var(--display)', fontWeight:800, fontSize:30,
              letterSpacing:'-0.03em', marginBottom:8,
            }}>Wanna Compare?</div>
            <div style={{
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em',
              textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:28,
            }}>side-by-side stat comparison</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn" onClick={handleConfirmCompare}>Yes <span>→</span></button>
              <button className="btn ghost" onClick={handleCancelCompare}>No thanks</button>
            </div>
          </div>
        </div>
      )}

      {/* FLASH OVERLAY — slow build on dive-in, fast fade on reveal */}
      <div style={{
        position:'fixed', inset:0, zIndex:500,
        background:'white',
        opacity: flashing ? 1 : 0,
        pointerEvents: flashing ? 'auto' : 'none',
        transition: slowFlash ? 'opacity 1500ms ease-in' : 'opacity 320ms ease-out',
      }}/>

    </div>
  );
}

window.Landing = Landing;
