import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipBack, SkipForward, ChevronDown, Music2, Play, Pause } from "lucide-react";

const TRACKS = [
  { name: "Parisian Atelier",   mood: "Elegant & warm",      photo: "photo-1502602898657-3e91760cbb34" },
  { name: "Japanese Garden",    mood: "Zen & meditative",    photo: "photo-1528360983277-13d401cdc186" },
  { name: "Montmartre Evening", mood: "Dreamy & nocturnal",  photo: "photo-1549144511-f099e773c147" },
  { name: "The Muse's Studio",  mood: "Cinematic & focused", photo: "photo-1513364776144-60967b0f800f" },
  { name: "Coastal Morning",    mood: "Light & awakening",   photo: "photo-1507525428034-b723cf961d3e" },
];

// ── Ambient soundscape generators (Web Audio API — no CDN required) ─────────
const SOUNDSCAPE_GENERATORS = [
  // 0: Parisian Atelier — warm C major chord with gentle tremolo
  (ctx, dest) => {
    const nodes = [];
    [130.81, 164.81, 196.0, 261.63].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const g    = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoG = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 === 0 ? 1 : -1) * 3;
      g.gain.value = 0.15 / 4;
      lfo.type = "sine";
      lfo.frequency.value = 0.18 + i * 0.04;
      lfoG.gain.value = 0.018;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      osc.connect(g); g.connect(dest);
      lfo.start(); osc.start();
      nodes.push(osc, lfo);
    });
    return nodes;
  },

  // 1: Japanese Garden — bandpass noise + 528 Hz zen tone
  (ctx, dest) => {
    const nodes = [];
    const bufSize = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass"; filter.frequency.value = 500; filter.Q.value = 0.4;
    const ng = ctx.createGain(); ng.gain.value = 0.09;
    noise.connect(filter); filter.connect(ng); ng.connect(dest);
    noise.start(); nodes.push(noise);
    const tone  = ctx.createOscillator();
    const toneG = ctx.createGain();
    tone.frequency.value = 528; tone.type = "sine"; toneG.gain.value = 0.04;
    tone.connect(toneG); toneG.connect(dest); tone.start(); nodes.push(tone);
    return nodes;
  },

  // 2: Montmartre Evening — dreamy Fm pad with slow vibrato
  (ctx, dest) => {
    const nodes = [];
    [87.31, 174.61, 207.65, 261.63].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const g    = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoG = ctx.createGain();
      osc.type = i < 2 ? "triangle" : "sine";
      osc.frequency.value = freq; osc.detune.value = i * 4;
      g.gain.value = 0.12 / 4;
      lfo.frequency.value = 0.07 + i * 0.02;
      lfoG.gain.value = freq * 0.0025;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      osc.connect(g); g.connect(dest);
      lfo.start(); osc.start();
      nodes.push(osc, lfo);
    });
    return nodes;
  },

  // 3: The Muse's Studio — brown noise + deep A1 drone
  (ctx, dest) => {
    const nodes = [];
    const bufSize = ctx.sampleRate * 5;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      d[i] = (last + 0.02 * white) / 1.02;
      last = d[i]; d[i] *= 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 180;
    const ng = ctx.createGain(); ng.gain.value = 0.14;
    noise.connect(filter); filter.connect(ng); ng.connect(dest);
    noise.start(); nodes.push(noise);
    const bass  = ctx.createOscillator();
    const bassG = ctx.createGain();
    bass.frequency.value = 55; bass.type = "sine"; bassG.gain.value = 0.07;
    bass.connect(bassG); bassG.connect(dest); bass.start(); nodes.push(bass);
    return nodes;
  },

  // 4: Coastal Morning — AM-modulated white noise (ocean waves) + bright G5
  (ctx, dest) => {
    const nodes = [];
    const bufSize = ctx.sampleRate * 6;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass"; filter.frequency.value = 750; filter.Q.value = 0.6;
    const ng  = ctx.createGain(); ng.gain.value = 0.11;
    const lfo  = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.13; lfoG.gain.value = 0.055;
    lfo.connect(lfoG); lfoG.connect(ng.gain);
    noise.connect(filter); filter.connect(ng); ng.connect(dest);
    noise.start(); lfo.start(); nodes.push(noise, lfo);
    const tone  = ctx.createOscillator();
    const toneG = ctx.createGain();
    tone.frequency.value = 784; tone.type = "sine"; toneG.gain.value = 0.018;
    tone.connect(toneG); toneG.connect(dest); tone.start(); nodes.push(tone);
    return nodes;
  },
];

// ── Animated waveform bars ──────────────────────────────────────────────────
function Waveform({ active }) {
  const bars = [6, 11, 16, 8, 14, 7, 12];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 14 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          style={{ width: 3, borderRadius: 2, backgroundColor: "#C8B06A" }}
          animate={active ? { height: [h, Math.max(3, 16 - h), h] } : { height: 3 }}
          transition={
            active
              ? { duration: 0.55 + i * 0.09, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }
              : { duration: 0.35 }
          }
        />
      ))}
    </div>
  );
}

// ── SVG circular volume ring with draggable gold dot ───────────────────────
function VolumeRing({ volume, onChange }) {
  const R = 28;
  const C = 2 * Math.PI * R;
  const filled = (volume / 100) * C;
  const angle = -Math.PI / 2 + (volume / 100) * 2 * Math.PI;
  const dotX = 36 + R * Math.cos(angle);
  const dotY = 36 + R * Math.sin(angle);
  const svgRef = useRef(null);
  const isDragging = useRef(false);

  const volFromEvent = useCallback((e) => {
    const el = svgRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = e.touches ? e.touches[0].clientX : e.clientX;
    const py = e.touches ? e.touches[0].clientY : e.clientY;
    let a = Math.atan2(py - cy, px - cx) + Math.PI / 2;
    if (a < 0) a += 2 * Math.PI;
    return Math.round(Math.min(100, Math.max(0, (a / (2 * Math.PI)) * 100)));
  }, []);

  useEffect(() => {
    const onMove = (e) => { if (!isDragging.current) return; const v = volFromEvent(e); if (v !== null) onChange(v); };
    const onUp   = () => { isDragging.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [onChange, volFromEvent]);

  return (
    <svg
      ref={svgRef}
      width={72} height={72} viewBox="0 0 72 72"
      style={{ cursor: "pointer", flexShrink: 0 }}
      onPointerDown={(e) => { isDragging.current = true; e.preventDefault(); }}
    >
      <circle cx={36} cy={36} r={R} fill="none" stroke="rgba(200,176,106,0.15)" strokeWidth={4} />
      <circle
        cx={36} cy={36} r={R} fill="none"
        stroke="rgba(200,176,106,0.75)" strokeWidth={4}
        strokeDasharray={`${filled} ${C}`}
        strokeDashoffset={C * 0.25}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <circle cx={dotX} cy={dotY} r={5} fill="#C8B06A" />
      <text x={36} y={36} textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fontWeight={300} style={{ fill: "rgba(var(--color-text-primary-rgb), 0.55)" }} fontFamily="sans-serif">
        {volume}
      </text>
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SoundscapePlayer({ calmMode = false }) {
  const [uiState, setUiState]             = useState("pill");
  const [status, setStatus]               = useState("idle");
  const [volume, setVolume]               = useState(35);
  const [trackIdx, setTrackIdx]           = useState(0);
  const [externalAudio, setExternalAudio] = useState(false);

  // Web Audio API refs — no <audio> element needed
  const audioCtxRef    = useRef(null);
  const masterGainRef  = useRef(null);
  const activeNodesRef = useRef([]);

  const fadeRef             = useRef(null);
  const rafRef              = useRef(null);
  const progressBarRef      = useRef(null);
  const carouselRef         = useRef(null);
  const volumeRef           = useRef(volume);
  const statusRef           = useRef(status);
  const intentionalPauseRef = useRef(false);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { audioCtxRef.current?.close(); } catch (e) {}
    };
  }, []);

  // Breathing progress bar while playing (ambient loops have no fixed duration)
  useEffect(() => {
    if (status !== "playing") {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (progressBarRef.current) progressBarRef.current.style.width = "0%";
      return;
    }
    const startTime = performance.now();
    const PERIOD = 8000;
    const tick = () => {
      const t = (performance.now() - startTime) % PERIOD;
      const phase = t < PERIOD / 2 ? t / (PERIOD / 2) : 1 - (t - PERIOD / 2) / (PERIOD / 2);
      if (progressBarRef.current) progressBarRef.current.style.width = `${phase * 100}%`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [status]);

  // Scroll carousel to active track
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || uiState !== "bloom") return;
    const CARD_W = 130 + 12;
    const offset = trackIdx * CARD_W - (el.clientWidth / 2 - CARD_W / 2);
    el.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [trackIdx, uiState]);

  // ── AudioContext helpers ──────────────────────────────────────────────────
  const getOrCreateCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx    = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      audioCtxRef.current   = ctx;
      masterGainRef.current = master;
    }
    return audioCtxRef.current;
  }, []);

  const stopActiveNodes = useCallback(() => {
    activeNodesRef.current.forEach(node => {
      try { node.stop?.(); } catch (e) {}
      try { node.disconnect?.(); } catch (e) {}
    });
    activeNodesRef.current = [];
  }, []);

  const clearFade = () => { if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; } };

  // 3-second fade in via master gain
  const fadeIn = useCallback(() => {
    const master = masterGainRef.current;
    if (!master) return;
    clearFade();
    master.gain.value = 0;
    const target = volumeRef.current / 100;
    const step   = target / 60;
    fadeRef.current = setInterval(() => {
      const next = master.gain.value + step;
      if (next >= target) { master.gain.value = target; clearFade(); }
      else master.gain.value = next;
    }, 50);
  }, []);

  // 1-second fade out then suspend context
  const fadeOut = useCallback((onDone) => {
    const master = masterGainRef.current;
    if (!master) { onDone?.(); return; }
    clearFade();
    intentionalPauseRef.current = true;
    const step = Math.max(master.gain.value / 20, 0.005);
    fadeRef.current = setInterval(() => {
      const next = master.gain.value - step;
      if (next <= 0.005) {
        master.gain.value = 0;
        clearFade();
        try { audioCtxRef.current?.suspend(); } catch (e) {}
        onDone?.();
      } else {
        master.gain.value = next;
      }
    }, 50);
  }, []);

  const startSoundscape = useCallback((idx) => {
    stopActiveNodes();
    const ctx    = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    activeNodesRef.current = SOUNDSCAPE_GENERATORS[idx](ctx, master);
  }, [stopActiveNodes]);

  // ── Transport ─────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const ctx = getOrCreateCtx();
    ctx.resume()
      .then(() => {
        startSoundscape(trackIdx);
        setExternalAudio(false);
        setStatus("playing");
        fadeIn();
      })
      .catch(() => {
        setStatus("permission_required");
      });
  }, [getOrCreateCtx, startSoundscape, trackIdx, fadeIn]);

  const pause = useCallback(() => {
    fadeOut(() => setStatus("paused"));
  }, [fadeOut]);

  const switchTrack = useCallback((idx) => {
    if (statusRef.current === "playing") {
      fadeOut(() => {
        setTrackIdx(idx);
        const ctx = getOrCreateCtx();
        ctx.resume().then(() => {
          startSoundscape(idx);
          setStatus("playing");
          fadeIn();
        });
      });
    } else {
      setTrackIdx(idx);
    }
  }, [fadeOut, getOrCreateCtx, startSoundscape, fadeIn]);

  const handleVolume = useCallback((v) => {
    setVolume(v);
    if (masterGainRef.current && statusRef.current === "playing") {
      masterGainRef.current.gain.value = v / 100;
    }
  }, []);

  // Pause when Calm Mode is enabled while playing
  useEffect(() => {
    if (calmMode && statusRef.current === "playing") {
      pause();
    }
  }, [calmMode, pause]);

  const track     = TRACKS[trackIdx];
  const isPlaying = status === "playing";

  return (
    <>
      {/* ── State A: Invisi-Pill ──────────────────────────────────────────── */}
      <AnimatePresence>
        {uiState === "pill" && (
          <motion.div
            key="pill"
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 200 }}
            style={{
              position: "fixed", bottom: 76, left: 0, right: 0, zIndex: 40,
              display: "flex", justifyContent: "center", pointerEvents: "none",
            }}
          >
            <motion.button
              onClick={() => setUiState("bloom")}
              whileTap={{ scale: 0.97 }}
              style={{
                pointerEvents: "auto", height: 42,
                display: "flex", alignItems: "center", gap: 10,
                paddingLeft: 16, paddingRight: 16, borderRadius: 999,
                border: `1px solid ${
                  isPlaying ? "rgba(200,176,106,0.45)"
                  : externalAudio ? "rgba(188,143,143,0.3)"
                  : "var(--color-border)"
                }`,
                background: isPlaying ? "var(--color-pill-bg-playing)"
                  : externalAudio ? "var(--color-pill-bg-external)"
                  : "var(--color-pill-bg-idle)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                boxShadow: isPlaying
                  ? "0 4px 20px rgba(200,176,106,0.2), 0 1px 4px rgba(var(--color-text-primary-rgb), 0.06)"
                  : "0 2px 12px rgba(var(--color-text-primary-rgb), 0.08)",
                cursor: "pointer",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isPlaying ? (
                  <motion.div key="playing" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 4 }} transition={{ duration: 0.18 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Waveform active />
                    <span style={{ fontSize: 12, fontWeight: 300, color: "var(--color-text-primary)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{track.name}</span>
                  </motion.div>
                ) : externalAudio ? (
                  <motion.div key="external" initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.18 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Music2 size={12} color="#BC8F8F" />
                    <span style={{ fontSize: 12, fontWeight: 300, color: "#BC8F8F", letterSpacing: "0.05em" }}>Staying quiet</span>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.18 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Waveform active={false} />
                    <span style={{ fontSize: 12, fontWeight: 300, color: "rgba(var(--color-text-primary-rgb), 0.4)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                      {status === "paused" ? `${track.name}  ·  paused` : "Sensory Mode"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── State B: Sonic Bloom bottom sheet ────────────────────────────── */}
      <AnimatePresence>
        {uiState === "bloom" && (
          <motion.div
            key="bloom"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 180 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
              borderRadius: "24px 24px 0 0", background: "var(--color-bg)", overflow: "hidden",
              boxShadow: "0 -8px 48px rgba(var(--color-text-primary-rgb), 0.12), 0 -1px 0 rgba(200,176,106,0.2)",
              paddingBottom: "max(env(safe-area-inset-bottom, 0px), 80px)",
            }}
          >
            <div style={{ padding: "16px 20px 0" }}>

              {/* Drag handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(var(--color-text-primary-rgb), 0.1)", margin: "0 auto 20px" }} />

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 400, color: "var(--color-text-primary)", lineHeight: 1.1, margin: 0 }}>
                    Soundscapes
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: "rgba(var(--color-text-primary-rgb), 0.4)", fontStyle: "italic", margin: "4px 0 0" }}>
                    Curated by The Muse
                  </p>
                </div>
                <motion.button type="button" onClick={() => setUiState("pill")} whileTap={{ scale: 0.9 }}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(var(--color-text-primary-rgb), 0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ChevronDown size={16} color="var(--color-text-primary)" />
                </motion.button>
              </div>

              {/* Gold divider */}
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(200,176,106,0.45), transparent)", marginBottom: 20 }} />

              {/* Photo carousel */}
              <div ref={carouselRef} className="hide-scrollbar"
                style={{
                  display: "flex", gap: 12, overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  paddingLeft: "calc(50% - 65px)", paddingRight: "calc(50% - 65px)",
                  paddingBottom: 6, marginBottom: 20, WebkitOverflowScrolling: "touch",
                }}>
                {TRACKS.map((t, i) => {
                  const isActive = i === trackIdx;
                  return (
                    <motion.div key={t.name} onClick={() => switchTrack(i)} whileTap={{ scale: 0.97 }}
                      style={{
                        flexShrink: 0, width: 130, height: 160, borderRadius: 18,
                        scrollSnapAlign: "center", cursor: "pointer",
                        position: "relative", overflow: "hidden",
                        border: isActive ? "2px solid rgba(200,176,106,0.7)" : "2px solid var(--color-border)",
                        boxShadow: isActive ? "0 0 0 1px rgba(200,176,106,0.2), 0 8px 24px rgba(200,176,106,0.2)" : "none",
                        transition: "border 0.35s ease, box-shadow 0.35s ease",
                      }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: `url(https://images.unsplash.com/${t.photo}?w=260&h=320&fit=crop&q=80)`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        filter: isActive ? "brightness(0.82) saturate(1.05)" : "brightness(0.55) saturate(0.55) grayscale(0.3)",
                        transition: "filter 0.4s ease",
                      }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
                      <p style={{
                        position: "absolute", bottom: 10, left: 8, right: 8, margin: 0,
                        fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: 400,
                        color: "rgba(255,255,255,0.95)", textAlign: "center", lineHeight: 1.25,
                      }}>
                        {t.name}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Controls row */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <VolumeRing volume={volume} onChange={handleVolume} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Breathing indicator line */}
                  <div style={{ height: 2, borderRadius: 1, background: "rgba(200,176,106,0.2)", overflow: "hidden" }}>
                    <div ref={progressBarRef} style={{
                      height: "100%", width: "0%",
                      background: "linear-gradient(90deg, rgba(200,176,106,0.6), #C8B06A)",
                      borderRadius: 1, transition: "none",
                    }} />
                  </div>
                  {/* Transport */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                    <motion.button type="button" onClick={() => switchTrack((trackIdx - 1 + TRACKS.length) % TRACKS.length)} whileTap={{ scale: 0.88 }}
                      style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}>
                      <SkipBack size={20} strokeWidth={1.5} color="var(--color-text-primary)" />
                    </motion.button>
                    <motion.button type="button" onClick={() => { if (isPlaying) pause(); else play(); }} whileTap={{ scale: 0.93 }}
                      style={{
                        width: 48, height: 48, borderRadius: "50%", background: "#043927", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, boxShadow: "0 4px 16px rgba(4,57,39,0.28)",
                      }}>
                      <AnimatePresence mode="wait" initial={false}>
                        {isPlaying ? (
                          <motion.div key="pause" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}>
                            <Pause size={20} fill="#C8B06A" color="#C8B06A" />
                          </motion.div>
                        ) : (
                          <motion.div key="play" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }} style={{ marginLeft: 2 }}>
                            <Play size={20} fill="#C8B06A" color="#C8B06A" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <motion.button type="button" onClick={() => switchTrack((trackIdx + 1) % TRACKS.length)} whileTap={{ scale: 0.88 }}
                      style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}>
                      <SkipForward size={20} strokeWidth={1.5} color="var(--color-text-primary)" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Status messages */}
              {((externalAudio && !isPlaying) || status === "idle") && (
                <div style={{ textAlign: "center", paddingBottom: 8 }}>
                  {externalAudio && !isPlaying && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 11, color: "#BC8F8F", fontWeight: 300, fontStyle: "italic", margin: 0 }}>
                        Your music is playing — we're staying out of the way
                      </p>
                      <button type="button" onClick={play}
                        style={{ fontSize: 11, color: "rgba(var(--color-text-primary-rgb), 0.5)", fontWeight: 300, textDecoration: "underline", textUnderlineOffset: 3, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Play anyway
                      </button>
                    </div>
                  )}
                  {!externalAudio && status === "idle" && (
                    <p style={{ fontSize: 11, color: "rgba(var(--color-text-primary-rgb), 0.3)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>
                      Silent by default — we never interrupt your music
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* ── Permission overlay (browser autoplay policy) ── */}
            <AnimatePresence>
              {status === "permission_required" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "var(--color-pill-bg-playing)",
                    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 28, padding: "32px 28px",
                  }}
                >
                  <Waveform active={false} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 400, color: "var(--color-text-primary)", textAlign: "center", lineHeight: 1.25, margin: 0 }}>
                      Embark on your sound journey.
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(var(--color-text-primary-rgb), 0.5)", textAlign: "center", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                      Your browser requires a gentle tap<br />to begin the symphony.
                    </p>
                  </div>
                  <motion.button type="button"
                    onClick={() => { setStatus("idle"); play(); }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: "linear-gradient(135deg, #D4B896 0%, #C8B06A 50%, #B8956A 100%)",
                      border: "none", borderRadius: 999, padding: "14px 40px",
                      fontSize: 12, fontWeight: 400, color: "#043927",
                      letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                      boxShadow: "0 4px 24px rgba(200, 176, 106, 0.5), 0 1px 4px rgba(4,57,39,0.08)",
                    }}
                  >
                    Begin Soundscape
                  </motion.button>
                  <button type="button" onClick={() => setStatus("idle")}
                    style={{ fontSize: 11, color: "rgba(var(--color-text-primary-rgb), 0.3)", fontWeight: 300, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                    not now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
