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

function Chrome({ screen, locale = 'EN', onLocaleChange, showBlurb = false }) {
  const t = CHROME_T[locale] || CHROME_T.EN;
  return (
    <div className="chrome">
      <div className="chrome-inner">
        <div className="chrome-top">
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

Object.assign(window, { BgBubbles, Chrome, Sparkle, Sprite, ScrollHint });
