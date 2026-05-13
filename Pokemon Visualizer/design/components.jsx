// components.jsx — shared chrome
const { useEffect, useState, useRef, useMemo } = React;

function BgBubbles({ count = 11, seed = 1 }) {
  const items = useMemo(() => {
    const out = []; let s = seed * 9301 + 49297;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < count; i++) {
      out.push({
        size: 80 + r() * 280,
        x: r() * 100, y: r() * 100,
        dur: 22 + r() * 22, delay: -r() * 30, id: i,
      });
    }
    return out;
  }, [count, seed]);
  return (
    <div className="bg-stage">
      {items.map(b => (
        <div key={b.id} className="bubble" style={{
          width: b.size, height: b.size,
          left: `calc(${b.x}% - ${b.size/2}px)`,
          top:  `calc(${b.y}% - ${b.size/2}px)`,
          animationDuration: `${b.dur}s`,
          animationDelay: `${b.delay}s`,
        }}/>
      ))}
    </div>
  );
}

const CHROME_T = {
  EN: {
    footer: '© VISUALIZER 2.0 · POKÉDEX FIELD STUDY · 1,302 ENTRIES',
    screens: ['SELECT', 'EXTRACT', 'DOSSIER'],
  },
  JP: {
    footer: '© ビジュアライザー 2.0 · ポケデックス 調査 · 1,302 種',
    screens: ['選択', '抽出', 'ファイル'],
  },
  ZH: {
    footer: '© 可视化工具 2.0 · 宝可梦图鉴调查 · 1,302 条目',
    screens: ['选择', '提取', '档案'],
  },
};

function Chrome({ screen, locale = 'EN', onLocaleChange, showBlurb = false, statsActions = null }) {
  const t = CHROME_T[locale] || CHROME_T.EN;
  return (
    <div className="chrome">
      <div className="chrome-inner">
        <div className="chrome-top">
          <div style={{ display:'flex', flexDirection:'column', gap: statsActions ? 10 : 0, alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="brand">poké<span className="dot">.</span><span className="sup">°</span></div>
              {showBlurb && (
                <div style={{
                  fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.13em',
                  textTransform:'uppercase', color:'var(--ink-mute)', lineHeight:1.4,
                  transition:'opacity 400ms ease',
                }}>double click<br/>pokeball · return</div>
              )}
            </div>
            {statsActions && (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn ghost" onClick={statsActions.onBack}
                    style={{ padding:'5px 12px', fontSize:9, letterSpacing:'0.16em' }}>
                    ← BACK
                  </button>
                  <button className="btn" onClick={statsActions.onRandom}
                    style={{ padding:'5px 12px', fontSize:9, letterSpacing:'0.16em' }}>
                    ↻ RANDOM
                  </button>
                </div>
                <div style={{
                  fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.14em',
                  textTransform:'uppercase', color:'var(--ink-mute)', paddingLeft:2,
                }}>
                  Hover rings · Evolution stages
                </div>
              </div>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:7 }}>
            <div style={{
              fontFamily:'var(--haas)', fontWeight:700,
              fontSize:11, letterSpacing:'-0.01em',
              color:'var(--ink)', whiteSpace:'nowrap',
              lineHeight:1,
            }}>Coded and Designed by Lucas Lu</div>
            <div className="locale">
              {['EN','JP','ZH'].map(l => (
                <button key={l} className={'pill' + (locale === l ? ' on' : '')}
                  onClick={() => onLocaleChange && onLocaleChange(l)}
                  style={{ all:'unset', cursor:'pointer', width:28, height:28, borderRadius:999,
                    border:'1px solid var(--ink)', display:'inline-flex', alignItems:'center',
                    justifyContent:'center', fontWeight:600,
                    background: locale === l ? 'var(--ink)' : 'transparent',
                    color: locale === l ? 'var(--paper)' : 'var(--ink)',
                    transition:'background 160ms, color 160ms',
                  }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="chrome-bottom">
          <div/>
          <div className="mono-meta" style={{ textAlign:'right' }}>
            0{screen} / 03 · {t.screens[screen - 1] || ''}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkle({ size = 16, color = 'currentColor', style = {} }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}>
      <path fill={color} d="M12 0 C12 8 12 8 24 12 C12 16 12 16 12 24 C12 16 12 16 0 12 C12 8 12 8 12 0 Z"/>
    </svg>
  );
}

function Sprite({ url, size = 320, alt = '' }) {
  return (
    <div style={{
      width: size, height: size, position:'relative',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <img src={url} alt={alt} style={{
        width:'100%', height:'100%', objectFit:'contain',
        imageRendering:'pixelated',
        filter:'drop-shadow(0 28px 30px rgba(0,0,0,0.22)) drop-shadow(0 6px 8px rgba(0,0,0,0.1))',
      }}/>
    </div>
  );
}

function ScrollHint({ onClick }) {
  return (
    <div style={{
      position:'absolute', bottom: 48, left:'50%', transform:'translateX(-50%)',
      zIndex: 10, pointerEvents:'auto',
    }}>
      <style>{`
        @keyframes shIn {
          0% { opacity:0; transform:translateY(14px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes shBob {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-8px); }
        }
        .scroll-hint-wrap {
          animation: shIn 700ms 300ms cubic-bezier(.2,.7,.2,1) both;
        }
        .scroll-hint-icon {
          animation: shBob 2s 1000ms ease-in-out infinite;
        }
      `}</style>
      <button
        className="scroll-hint-wrap"
        onClick={onClick}
        style={{
          all:'unset', cursor:'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', gap: 8,
        }}
      >
        <span style={{
          fontFamily:'var(--mono)', fontSize: 9, letterSpacing:'0.3em',
          textTransform:'uppercase', color:'var(--ink-mute)',
        }}>INFO</span>
        <div className="scroll-hint-icon" style={{
          width: 38, height: 38, borderRadius:'50%',
          border:'1px solid rgba(17,17,17,0.22)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 16, color:'var(--ink)',
          background:'rgba(255,255,255,0.55)',
          backdropFilter:'blur(4px)',
        }}>↓</div>
      </button>
    </div>
  );
}

function FlowShield({ size = 180 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * DPR;
    canvas.height = size * DPR;
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    const cx = size / 2, cy = size / 2;
    const R = size * 0.38;
    const particles = Array.from({ length: 56 }, (_, i) => ({
      angle: (i / 56) * Math.PI * 2,
      r: R,
      speed: (0.005 + Math.random() * 0.008) * (Math.random() > 0.45 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
      trail: [],
    }));
    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, size, size);
      t += 0.014;
      for (const p of particles) {
        p.angle += p.speed * (1 + 0.35 * Math.sin(t * 1.6 + p.phase));
        p.r = R + Math.sin(p.angle * 3 + t * 2.4 + p.phase) * 9;
        const x = cx + p.r * Math.cos(p.angle);
        const y = cy + p.r * Math.sin(p.angle);
        p.trail.push({ x, y });
        if (p.trail.length > 12) p.trail.shift();
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = 'rgba(217,74,61,0.5)';
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217,74,61,0.2)'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,140,120,0.9)'; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      width: size, height: size,
      pointerEvents: 'none', zIndex: 0,
    }}/>
  );
}

function CloudBg({ r = 217, g = 74, b = 61 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let w = 0, h = 0, blobs = [], raf;
    function init() {
      w = canvas.offsetWidth || 800;
      h = canvas.offsetHeight || 400;
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      blobs = Array.from({ length: 9 }, () => ({
        x: Math.random() * w,
        y: h * 0.15 + Math.random() * h * 0.7,
        radius: 110 + Math.random() * 160,
        dx: (0.18 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1),
        speed: 0.25 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.22 + Math.random() * 0.28,
      }));
    }
    init();
    const ctx = canvas.getContext('2d');
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      t += 0.004;
      for (const bl of blobs) {
        bl.x += bl.dx;
        if (bl.dx > 0 && bl.x - bl.radius > w) bl.x = -bl.radius;
        if (bl.dx < 0 && bl.x + bl.radius < 0) bl.x = w + bl.radius;
        const y = bl.y + Math.sin(t * bl.speed + bl.phase) * 22;
        const grd = ctx.createRadialGradient(bl.x, y, 0, bl.x, y, bl.radius);
        grd.addColorStop(0,   `rgba(${r},${g},${b},${bl.alpha})`);
        grd.addColorStop(0.55,`rgba(${r},${g},${b},${bl.alpha * 0.4})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(bl.x, y, bl.radius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => init();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [r, g, b]);
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
      filter: 'blur(55px) saturate(1.3)',
    }}/>
  );
}

Object.assign(window, { BgBubbles, Chrome, Sparkle, Sprite, ScrollHint, FlowShield, CloudBg });
