import * as THREE from 'three/webgpu'
import * as TSL from 'three/tsl'
import { ssr } from 'three/examples/jsm/tsl/display/SSRNode'
import { traa } from 'three/examples/jsm/tsl/display/TRAANode'
import { lut3D } from 'three/examples/jsm/tsl/display/Lut3DNode'
import { ssgi } from 'three/examples/jsm/tsl/display/SSGINode'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode'

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, useGLTF, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'

/*
  自动生成
  ✨ Auto-généré
*/
function Model({ url }) {
  const { nodes } = useGLTF(url)
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} scale={7}>
      <group rotation={[Math.PI / 13.5, -Math.PI / 5.8, Math.PI / 5.6]}>
        <mesh receiveShadow castShadow geometry={nodes.planet002.geometry} material={nodes.planet002.material} />
        <mesh geometry={nodes.planet003.geometry} material={nodes.planet003.material} />
      </group>
    </group>
  )
}

export default function App() {

  // 监听 .content 元素的真实高度，用于同步 Canvas 高度
  // ✨ Observer la hauteur réelle de .content pour synchroniser la hauteur du Canvas
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(1000)

  // 音频播放系统（随机起始位置 + 顺序播放）
  // ✨ Système audio (position aléatoire + lecture séquentielle)

useEffect(() => {
  // 记录所有 jukebox，便于通过一次点击统一控制
  // ✨ Enregistrer tous les jukebox pour pouvoir les contrôler via un seul clic
  const jukeboxes = [];

  function createJukebox(audioId, sourceId, tracks, options = {}) {
    const audio = document.getElementById(audioId);
    const source = document.getElementById(sourceId);
    if (!audio || !source || !tracks || !tracks.length) return;

    let index = Math.floor(Math.random() * tracks.length);

    // 切换并播放下一首
    // ✨ Charger et préparer la piste suivante
    function playTrack() {
      source.src = tracks[index];
      audio.load();

      // 加载元数据后跳到随机时间点（仅 DiskD）
      // ✨ Sauter à un moment aléatoire après le chargement des métadonnées (DiskD uniquement)
      if (options.randomStart) {
        const setRandomStart = () => {
          audio.removeEventListener('loadedmetadata', setRandomStart);
          const duration = audio.duration;
          const len = isFinite(duration) ? duration : 3600;
          audio.currentTime = Math.random() * len;
        };
        audio.addEventListener('loadedmetadata', setRandomStart);
      }
    }

    // 音频结束后自动播放下一首
    // ✨ Lecture automatique de la piste suivante à la fin de l’audio
    const onEnded = () => {
      index = (index + 1) % tracks.length;
      playTrack();
      // 尝试继续播放（如果已被用户解锁）  
      // ✨ Essayer de continuer la lecture (si déjà débloqué par l’utilisateur)
      audio.play().catch(() => {});
    };
    audio.addEventListener('ended', onEnded);

    // 初始化第一首曲目
    // ✨ Initialiser la première piste
    playTrack();

    // 记录当前 jukebox，供全局点击处理使用
    // ✨ Enregistrer ce jukebox pour la gestion globale du clic
    jukeboxes.push({ audio, playTrack, onEnded });
  }

  const cfg = window.APP_CONFIG;
  if (!cfg) return;

  // DiskC：正常播放
  // ✨ DiskC : lecture normale
  createJukebox('DiskC', 'DiskCSource', cfg.DiskC, { randomStart: false });

  // DiskD：随机起始位置
  // ✨ DiskD : démarrage à un moment aléatoire
  createJukebox('DiskD', 'DiskDSource', cfg.DiskD, { randomStart: true });

  let clickCount = 0;

  // 全局点击处理：第一次点击解锁音频，第二次点击跳转
  // ✨ Gestion globale du clic : premier clic pour débloquer l'audio, deuxième clic pour la redirection
  const handleClick = () => {
    clickCount += 1;

    if (clickCount === 1) {
      // 第一次点击 → 尝试播放所有音频以解锁自动播放
      // ✨ Premier clic → essayer de lancer tous les audios pour débloquer l’autoplay
      jukeboxes.forEach(({ audio }) => {
        audio.play().catch(() => {
          // 忽略错误：部分浏览器仍可能需要额外交互
          // ✨ Ignorer les erreurs : certains navigateurs peuvent encore demander plus d’interactions
        });
      });
    } else if (clickCount === 2) {
      // 第二次点击 → 始终跳转到下一页面
      // ✨ Deuxième clic → toujours rediriger vers la page suivante
      document.location.href = window.APP_CONFIG.Next;
    }
  };

  document.addEventListener('click', handleClick);

  // 清理事件监听器
  // ✨ Nettoyer les écouteurs d’événements
  return () => {
    document.removeEventListener('click', handleClick);
    jukeboxes.forEach(({ audio, onEnded }) => {
      audio.removeEventListener('ended', onEnded);
    });
  };
}, []);


  // 使用 ResizeObserver 自动同步 Canvas 高度
  // ✨ Utilisation de ResizeObserver pour synchroniser automatiquement la hauteur du Canvas
  useEffect(() => {
    if (!contentRef.current) return

    const el = contentRef.current

    const updateHeight = () => {
      const h = el.offsetHeight || 0
      setContentHeight(h || 1000)
    }

    updateHeight()

    const observer = new ResizeObserver(() => {
      updateHeight()
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* 隐藏的音频播放器 */}
      {/* ✨ Lecteurs audio cachés */}
      <audio id="DiskC" autoPlay crossOrigin="anonymous" style={{ display: 'none' }}>
        <source id="DiskCSource" type="audio/mpeg" />
      </audio>

      <audio id="DiskD" autoPlay crossOrigin="anonymous" style={{ display: 'none' }}>
        <source id="DiskDSource" type="audio/mpeg" />
      </audio>

      {/* 内容区域（决定 Canvas 高度） */}
      {/* ✨ Zone de contenu (détermine la hauteur du Canvas) */}
      <div
        ref={contentRef}
        className="content"
        dangerouslySetInnerHTML={{
          __html: window.APP_CONFIG?.htmlContent || '',
        }}
      />

      {/* Canvas 高度始终保持与 content 一致 */}
      {/* ✨ La hauteur du Canvas reste toujours identique à celle de .content */}
      <Canvas
        dpr={[1.5, 2]}
        linear
        shadows
        style={{
          width: '100%',
          height: `${contentHeight}px`,
        }}
      >
        <fog attach="fog" args={['#272730', 16, 30]} />
        <ambientLight intensity={0.75 * Math.PI} />
        <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={75}>
          <spotLight
            castShadow
            intensity={2.25 * Math.PI}
            decay={0}
            angle={0.2}
            penumbra={1}
            position={[-25, 20, -15]}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
        </PerspectiveCamera>

        <Suspense fallback={null}>
          <Model url={`${process.env.PUBLIC_URL}/scene.glb`} />
        </Suspense>

        <OrbitControls autoRotate enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
        <Stars radius={500} depth={50} count={1000} factor={10} />
      </Canvas>

      <Loader />

      <a
        href="https://president.mydream42.com"
        className="link top-right"
        children="Hire ❄️ Me"
      />
      <a
        href="https://yelizariev.mydream42.com/?debug=https://x.com/yelizariev"
        className="link bottom-right"
        children="Fire 🔥 Me"
      />
    </>
  )
}
