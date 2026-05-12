// pokecenter.jsx — Pokemon Center full-mesh view, horizontal-only movement
const { useEffect: useEffectPC, useRef: useRefPC, useState: useStatePC } = React;

const GLB_PATH = '../pokemon_center.glb';

function PokeCenterScene({ cmdRef, onZoomStart, onZoomComplete }) {
  const [ready, setReady] = useStatePC(false);
  const mountRef         = useRefPC(null);
  const svgLearnRef      = useRefPC(null);
  const svgGlowRef       = useRefPC(null);
  const svgArrowRef      = useRefPC(null);
  const svgRingRef       = useRefPC(null);
  const learnRef         = useRefPC(null);
  const controlsRef      = useRefPC(null);
  const zoomActiveRef    = useRefPC(false);
  const zoomDoneFiredRef = useRefPC(false);
  const hoverRef         = useRefPC(false);
  const lineProg         = useRefPC(0);
  const ballZoomActiveRef = useRefPC(false);
  const ballZoomCbRef     = useRefPC(null);

  useEffectPC(() => {
    let cancelled = false;
    let animId, renderer, controls, cleanupResize, cleanupMouseMove;
    let idleMixer = null, actionMixer = null, actionInterval = null, dittoMixer = null;

    function init() {
      if (cancelled || !mountRef.current) return;
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader || !THREE.OrbitControls) return;

      const container = mountRef.current;
      const W = container.parentElement?.clientWidth  || 1100;
      const H = container.parentElement?.clientHeight || 580;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(Math.round(W * 0.22), Math.round(H * 0.22));
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 0);
      if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.domElement.style.display        = 'block';
      renderer.domElement.style.width          = '100%';
      renderer.domElement.style.height         = '100%';
      renderer.domElement.style.imageRendering = 'pixelated';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();

      const STARTPOS     = new THREE.Vector3();
      const STARTLOOK    = new THREE.Vector3();
      const ZOOMPOS      = new THREE.Vector3();
      const ZOOMLOOK     = new THREE.Vector3();
      const BALLZOOMPOS  = new THREE.Vector3();
      const BALLZOOMLOOK = new THREE.Vector3();

      const camera = new THREE.PerspectiveCamera(60, W / H, 0.01, 500);

      scene.add(new THREE.AmbientLight(0xffffff, 3.0));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(4, 8, 5);
      scene.add(sun);

      camera.position.set(0, 2, 6);
      camera.lookAt(0, 0, 0);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
      controls.enabled = false;

      const currentLook    = new THREE.Vector3();
      const resetFromPos   = new THREE.Vector3();
      const resetFromLook  = new THREE.Vector3();
      let resetT      = 0;
      let resetActive = false;
      const pokeballPos = new THREE.Vector3();
      const meshTopPos  = new THREE.Vector3();

      const loader = new THREE.GLTFLoader();
      const clock  = new THREE.Clock();
      let toxtricityIdle = null, toxtricityAction = null;
      let toxtricityActionClip = null, isActionPlaying = false;
      let idleClipAction = null;

      loader.load(
        GLB_PATH,
        (gltf) => {
          if (cancelled) return;
          const model = gltf.scene;

          const box  = new THREE.Box3().setFromObject(model);
          const cent = box.getCenter(new THREE.Vector3());
          model.position.sub(cent);
          scene.add(model);

          const b  = new THREE.Box3().setFromObject(model);
          const sz = b.getSize(new THREE.Vector3());
          console.log('[PokéCenter] centered bounds:', b.min, b.max, 'size:', sz);

          const midY = b.min.y + sz.y * 0.585;
          const camZ = b.max.z + sz.z * 0.05;

          STARTPOS.set(sz.x * 0.015, midY, camZ);
          STARTLOOK.set(sz.x * 0.015, midY, 0);

          ZOOMPOS.set(sz.x * 0.32, b.min.y + sz.y * 0.58, b.min.z * 0.22);
          ZOOMLOOK.set(sz.x * 0.20, b.min.y + sz.y * 0.60, b.min.z * 0.52);
          pokeballPos.set(sz.x * 0.20, b.min.y + sz.y * 0.60, b.min.z * 0.52);
          meshTopPos.set(sz.x * 0.20, b.max.y, b.min.z * 0.52);
          BALLZOOMPOS.set(sz.x * 0.20, b.min.y + sz.y * 0.60, b.min.z * 0.52 + 1.1);
          BALLZOOMLOOK.copy(pokeballPos);

          camera.position.copy(STARTPOS);
          camera.lookAt(STARTLOOK);
          controls.target.copy(STARTLOOK);
          controls.update();
          currentLook.copy(STARTLOOK);

          if (cmdRef) {
            cmdRef.current = {
              resetToStart() {
                resetFromPos.copy(camera.position);
                resetFromLook.copy(currentLook);
                resetT = 0;
                zoomActiveRef.current = false;
                zoomDoneFiredRef.current = false;
                ballZoomActiveRef.current = false;
                resetActive = true;
              },
              zoomToCenter(cb) {
                ballZoomCbRef.current = cb;
                ballZoomActiveRef.current = true;
                hoverRef.current = false;
                lineProg.current = 0;
              },
              snapToStart() {
                camera.position.copy(STARTPOS);
                currentLook.copy(STARTLOOK);
                camera.lookAt(STARTLOOK);
                controls.target.copy(STARTLOOK);
                controls.update();
                resetActive = false;
                resetT = 0;
                zoomActiveRef.current = false;
                zoomDoneFiredRef.current = true;  // keep non-interactive in search mode
                ballZoomActiveRef.current = false;
                ballZoomCbRef.current = null;
                hoverRef.current = false;
                lineProg.current = 0;
              },
            };
          }

          // ── Toxtricity models ──────────────────────────────────────────
          function placePokemon(m) {
            const pBox = new THREE.Box3().setFromObject(m);
            const pH   = pBox.getSize(new THREE.Vector3()).y;
            const sc   = (sz.y * 0.8) / pH;
            m.scale.setScalar(sc);
            const sBox = new THREE.Box3().setFromObject(m);
            m.position.set(-sz.x * 0.30, b.min.y - sBox.min.y + sz.y * 0.21, b.min.z * 0.28);
            m.rotation.y = Math.PI * 1.916;
          }
          loader.load('../toxtricity.glb', (tGltf) => {
            if (cancelled) return;
            toxtricityIdle = tGltf.scene;
            placePokemon(toxtricityIdle);
            scene.add(toxtricityIdle);
            if (tGltf.animations.length > 0) {
              idleMixer = new THREE.AnimationMixer(toxtricityIdle);
              const idleClip = tGltf.animations.find(a => /idle/i.test(a.name)) || tGltf.animations[0];
              idleClipAction = idleMixer.clipAction(idleClip);
              idleClipAction.play();
            }
          }, undefined, (err) => console.warn('[Toxtricity idle]', err));

          loader.load('../ditto_dancing_pokemon.glb', (dGltf) => {
            if (cancelled) return;
            const ditto = dGltf.scene;
            const dBox  = new THREE.Box3().setFromObject(ditto);
            const dH    = dBox.getSize(new THREE.Vector3()).y;
            const dSc   = (sz.y * 0.28) / dH;
            ditto.scale.setScalar(dSc);
            const dBox2 = new THREE.Box3().setFromObject(ditto);
            ditto.position.set(0, b.min.y - dBox2.min.y + sz.y * 0.29, b.min.z * 0.43);
            ditto.rotation.y = 0;
            scene.add(ditto);
            if (dGltf.animations.length > 0) {
              dittoMixer = new THREE.AnimationMixer(ditto);
              dittoMixer.clipAction(dGltf.animations[0]).play();
            }
          }, undefined, (err) => console.warn('[Ditto]', err));
          // ───────────────────────────────────────────────────────────────

          setReady(true);
        },
        undefined,
        (err) => console.error('[PokéCenter] GLB error:', err)
      );

      function updateAnnotations() {
        const cW = container.parentElement?.clientWidth  || W;
        const cH = container.parentElement?.clientHeight || H;
        const learnEl   = learnRef.current;
        const learnLine = svgLearnRef.current;
        if (!learnEl || !learnLine) return;

        const p  = pokeballPos.clone().project(camera);
        const bx = ((p.x + 1) / 2) * cW;
        const by = ((-p.y + 1) / 2) * cH;
        const sx = bx - 7;

        const pt     = meshTopPos.clone().project(camera);
        const topY   = ((-pt.y + 1) / 2) * cH;
        const labelY = topY - 16;

        const prog = Math.max(0, Math.min(1, lineProg.current));
        const bob  = Math.sin(Date.now() * 0.0018) * 3;

        // Arrow: permanently above pokeball, points down, bobs gently, fades out as line appears
        const isZooming = zoomActiveRef.current || zoomDoneFiredRef.current || resetActive;
        const arrowEl = svgArrowRef.current;
        if (arrowEl) {
          const aw = 5;
          const tipY  = by - 42 + bob;
          const baseY = by - 56 + bob;
          arrowEl.setAttribute('points', `${sx-aw},${baseY} ${sx+aw},${baseY} ${sx},${tipY}`);
          const baseOpacity = isZooming ? 0 : Math.max(0, (1 - prog * 2) * 0.75);
          arrowEl.setAttribute('opacity', baseOpacity);
        }

        // Line: grows upward from just above pokeball to label on hover (separate from arrow)
        const lineBottom = by - 30;
        const lineTop    = labelY + 22;
        const lineY1     = lineBottom + (lineTop - lineBottom) * prog;
        learnLine.setAttribute('x1', sx);
        learnLine.setAttribute('y1', lineY1);
        learnLine.setAttribute('x2', sx);
        learnLine.setAttribute('y2', lineBottom);
        learnLine.setAttribute('opacity', prog * 0.7);

        // Glow bloom
        const glowEl = svgGlowRef.current;
        if (glowEl) {
          glowEl.setAttribute('cx', bx - 5);
          glowEl.setAttribute('cy', by);
          glowEl.setAttribute('r', 70);
          glowEl.style.opacity = String(prog * 0.42);
        }

        // Stroke ring — expands and brightens on hover
        const ringEl = svgRingRef.current;
        if (ringEl) {
          ringEl.setAttribute('cx', bx - 5);
          ringEl.setAttribute('cy', by);
          ringEl.setAttribute('r', String(30 + prog * 14));
          ringEl.setAttribute('opacity', String(prog * 0.9));
        }

        learnEl.style.left      = sx + 'px';
        learnEl.style.top       = labelY + 'px';
        learnEl.style.transform = 'translateX(-50%)';
        learnEl.style.opacity   = String(prog);
      }

      const animate = () => {
        if (cancelled) return;
        animId = requestAnimationFrame(animate);

        if (zoomActiveRef.current && !zoomDoneFiredRef.current) {
          camera.position.lerp(ZOOMPOS, 0.036);
          currentLook.lerp(ZOOMLOOK, 0.036);
          camera.lookAt(currentLook);
          if (camera.position.distanceTo(ZOOMPOS) < 0.06) {
            zoomActiveRef.current = false;
            zoomDoneFiredRef.current = true;
            onZoomComplete?.();
          }
        } else if (resetActive) {
          resetT = Math.min(resetT + 0.012, 1);
          const ease = resetT * resetT * (3 - 2 * resetT);
          camera.position.lerpVectors(resetFromPos, STARTPOS, ease);
          currentLook.lerpVectors(resetFromLook, STARTLOOK, ease);
          camera.lookAt(currentLook);
          if (resetT >= 1) {
            resetActive = false;
            camera.position.copy(STARTPOS);
            currentLook.copy(STARTLOOK);
            controls.target.copy(STARTLOOK);
            controls.update();
          }
        }

        if (ballZoomActiveRef.current) {
          camera.position.lerp(BALLZOOMPOS, 0.045);
          currentLook.lerp(BALLZOOMLOOK, 0.045);
          camera.lookAt(currentLook);
          if (camera.position.distanceTo(BALLZOOMPOS) < 0.18) {
            ballZoomActiveRef.current = false;
            const cb = ballZoomCbRef.current;
            ballZoomCbRef.current = null;
            cb?.();
          }
        }

        const hT = (hoverRef.current && !zoomActiveRef.current && !zoomDoneFiredRef.current && !ballZoomActiveRef.current) ? 1 : 0;
        lineProg.current += (hT - lineProg.current) * 0.09;

        const delta = clock.getDelta();
        idleMixer?.update(delta);
        actionMixer?.update(delta);
        dittoMixer?.update(delta);
        renderer.render(scene, camera);
        updateAnnotations();
      };
      animate();

      const onResize = () => {
        const nW = container.parentElement?.clientWidth  || W;
        const nH = container.parentElement?.clientHeight || H;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(Math.round(nW * 0.22), Math.round(nH * 0.22));
      };
      window.addEventListener('resize', onResize);
      cleanupResize = () => window.removeEventListener('resize', onResize);

      function pokeballScreenPos() {
        const cW = container.parentElement?.clientWidth  || W;
        const cH = container.parentElement?.clientHeight || H;
        const p  = pokeballPos.clone().project(camera);
        return {
          bx: ((p.x + 1) / 2) * cW,
          by: ((-p.y + 1) / 2) * cH,
        };
      }

      const onMouseMove = (e) => {
        if (zoomActiveRef.current || zoomDoneFiredRef.current) {
          hoverRef.current = false;
          renderer.domElement.style.cursor = 'default';
          return;
        }
        const rect = renderer.domElement.getBoundingClientRect();
        const { bx, by } = pokeballScreenPos();
        const hit = Math.hypot(e.clientX - rect.left - bx, e.clientY - rect.top - by) < 60;
        hoverRef.current = hit;
        renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
      };

      const onCanvasClick = (e) => {
        if (zoomActiveRef.current || zoomDoneFiredRef.current) return;
        const rect = renderer.domElement.getBoundingClientRect();
        const { bx, by } = pokeballScreenPos();
        if (Math.hypot(e.clientX - rect.left - bx, e.clientY - rect.top - by) < 60) {
          zoomActiveRef.current = true;
          onZoomStart?.();
        }
      };

      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onCanvasClick);
      cleanupMouseMove = () => {
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onCanvasClick);
      };

    }

    const poll = setInterval(() => {
      if (window.THREE && window.THREE.GLTFLoader && window.THREE.OrbitControls) {
        clearInterval(poll);
        init();
      }
    }, 50);

    return () => {
      cancelled = true;
      clearInterval(poll);
      cancelAnimationFrame(animId);
      cleanupResize?.();
      cleanupMouseMove?.();
      controls?.dispose();
      controlsRef.current = null;
      clearInterval(actionInterval);
      idleMixer?.stopAllAction();
      actionMixer?.stopAllAction();
      dittoMixer?.stopAllAction();
      if (cmdRef) cmdRef.current = null;
      if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
    };
  }, []);

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>

      <div ref={mountRef} style={{ position:'absolute', inset:0 }}/>

      <svg style={{
        position:'absolute', inset:0, width:'100%', height:'100%',
        pointerEvents:'none', overflow:'visible', zIndex:2,
      }}>
        <defs>
          <radialGradient id="pokeball-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--hot)" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="var(--hot)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle ref={svgGlowRef} cx="0" cy="0" r="70"
          fill="url(#pokeball-glow)" style={{opacity:0}}/>
        <circle ref={svgRingRef} cx="0" cy="0" r="22"
          fill="none" stroke="var(--hot)" strokeWidth="1.5" opacity="0"/>
        <line ref={svgLearnRef} x1="0" y1="0" x2="0" y2="0"
          stroke="var(--ink)" strokeWidth="1.2" opacity="0"/>
        <polygon ref={svgArrowRef} points="0,0 0,0 0,0"
          fill="var(--ink)" opacity="0.75"/>
      </svg>

      {ready && (
        <div ref={learnRef} style={{ position:'absolute', top:0, left:0, zIndex:3, pointerEvents:'none', opacity:0 }}>
          <span style={{
            fontFamily:'var(--mono)', fontSize:9, fontWeight:700, letterSpacing:'0.16em',
            textTransform:'uppercase', color:'var(--ink)',
            borderBottom:'1.5px solid var(--ink)', paddingBottom:2,
            whiteSpace:'nowrap',
          }}>Get Started with Pokemon!</span>
        </div>
      )}
    </div>
  );
}

window.PokeCenterScene = PokeCenterScene;
