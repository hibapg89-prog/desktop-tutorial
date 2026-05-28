"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRACKS = [
  {
    name: "Quiet Atelier",
    icon: "◇",
    // Pairs of [freq, detune] — slight detuning between pairs creates natural beating
    voices: [
      [55,  0],  [55,  3],   // deep sub drone
      [110, 0],  [110, 5],   // fundamental
      [165, 0],  [220, 2],   // overtones
    ] as [number, number][],
    filterFreq: 600,
  },
  {
    name: "Spa Garden",
    icon: "○",
    voices: [
      [65,  0],  [65,  4],
      [130, 0],  [130, 6],
      [195, 1],  [260, 3],
    ] as [number, number][],
    filterFreq: 700,
  },
  {
    name: "Golden Hour",
    icon: "✦",
    voices: [
      [82,  0],  [82,  5],
      [164, 0],  [164, 4],
      [246, 2],  [328, 1],
    ] as [number, number][],
    filterFreq: 750,
  },
];

interface SoundscapePlayerProps {
  /** Position: "top" renders below the status bar, "bottom" above nav */
  position?: "top" | "bottom";
}

export default function SoundscapePlayer({ position = "top" }: SoundscapePlayerProps) {
  const [playing, setPlaying]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [volume, setVolume]     = useState(32);
  const [wave, setWave]         = useState([3, 5, 8, 5, 3]);

  const ctxRef    = useRef<AudioContext | null>(null);
  const gainRef   = useRef<GainNode | null>(null);
  const oscsRef   = useRef<OscillatorNode[]>([]);
  const lfoRef    = useRef<number | null>(null);
  const waveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate waveform bars when playing
  useEffect(() => {
    if (playing) {
      waveTimer.current = setInterval(() => {
        setWave(Array.from({ length: 5 }, () => 2 + Math.random() * 10));
      }, 180);
    } else {
      if (waveTimer.current) clearInterval(waveTimer.current);
      setWave([3, 5, 8, 5, 3]);
    }
    return () => { if (waveTimer.current) clearInterval(waveTimer.current); };
  }, [playing]);

  const stopAudio = useCallback(() => {
    if (lfoRef.current) cancelAnimationFrame(lfoRef.current);
    oscsRef.current.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
    oscsRef.current = [];
    if (gainRef.current) gainRef.current.disconnect();
    gainRef.current = null;
  }, []);

  const startAudio = useCallback((tIdx: number, vol: number) => {
    stopAudio();
    const track = TRACKS[tIdx];

    // Create/resume AudioContext on user gesture
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Master gain → output
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Lowpass filter for softness
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = track.filterFreq;
    filter.Q.value = 0.7;
    filter.connect(masterGain);

    // Create oscillator voices
    track.voices.forEach(([freq, detune], i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      // Lower gain for higher harmonics — natural harmonic falloff
      gain.gain.value = 0.08 / (Math.floor(i / 2) + 1);
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      oscsRef.current.push(osc);
    });

    // 3-second fade-in (the "spa" effect)
    const target = (vol / 100) * 0.4;
    masterGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 3);
  }, [stopAudio]);

  const toggle = () => {
    if (playing) {
      // Fade out then stop
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1.2);
        setTimeout(stopAudio, 1300);
      }
      setPlaying(false);
      setExpanded(false);
    } else {
      startAudio(trackIdx, volume);
      setPlaying(true);
    }
  };

  const changeTrack = (idx: number) => {
    setTrackIdx(idx);
    if (playing) startAudio(idx, volume);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(
        (v / 100) * 0.4,
        ctxRef.current.currentTime + 0.3
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => () => { stopAudio(); ctxRef.current?.close(); }, [stopAudio]);

  const track = TRACKS[trackIdx];
  const posClass = position === "top"
    ? "top-3 left-0 right-0"
    : "bottom-20 left-0 right-0";

  return (
    <div className={`fixed ${posClass} z-40 flex flex-col items-center pointer-events-none`}>

      {/* ── Floating pill ── */}
      <button
        onClick={playing ? () => setExpanded(e => !e) : toggle}
        className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-500"
        style={{
          background: playing
            ? "rgba(11,60,38,0.88)"
            : "rgba(250,246,239,0.82)",
          backdropFilter: "blur(16px)",
          border: playing
            ? "1px solid rgba(200,176,106,0.3)"
            : "1px solid rgba(11,60,38,0.12)",
          boxShadow: playing
            ? "0 4px 20px rgba(11,60,38,0.25)"
            : "0 2px 12px rgba(11,60,38,0.08)",
        }}>

        {playing ? (
          <>
            {/* Mini waveform */}
            <div className="flex items-center gap-[2px]">
              {wave.map((h, i) => (
                <div key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: "2px",
                    height: `${h}px`,
                    background: "#C8B06A",
                    transition: "height 0.18s ease",
                  }} />
              ))}
            </div>
            <span className="font-sans text-[9px] tracking-[0.15em] text-[rgba(240,232,204,0.9)] uppercase">
              {track.name}
            </span>
            <span className="font-sans text-[8px] text-[rgba(200,176,106,0.6)] ml-0.5">
              {expanded ? "▲" : "▼"}
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] text-[#C8B06A]">✦</span>
            <span className="font-sans text-[9px] tracking-[0.18em] uppercase text-[#0B3C26] opacity-50">
              Soundscapes
            </span>
          </>
        )}
      </button>

      {/* ── Expanded tray ── */}
      <div
        className="pointer-events-auto mt-2 w-[88vw] max-w-sm rounded-2xl overflow-hidden transition-all duration-350"
        style={{
          maxHeight: expanded ? "200px" : "0px",
          opacity: expanded ? 1 : 0,
          background: "rgba(11,60,38,0.88)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(200,176,106,0.2)",
          boxShadow: "0 8px 32px rgba(11,60,38,0.3)",
        }}>

        <div className="p-4">
          {/* Tray header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-sans text-[7px] tracking-[0.3em] uppercase text-[rgba(200,176,106,0.6)] mb-0.5">
                Now playing
              </p>
              <p className="font-sans text-[11px] tracking-[0.08em] text-[rgba(240,232,204,0.9)]">
                {track.icon} {track.name}
              </p>
            </div>
            <button onClick={toggle}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.1)]"
              style={{ border: "1px solid rgba(200,176,106,0.25)" }}>
              <span className="text-[rgba(200,176,106,0.7)] text-xs">■</span>
            </button>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[rgba(200,176,106,0.5)] text-[10px]">♪</span>
            <div className="flex-1 relative">
              <input
                type="range" min={0} max={100} value={volume}
                onChange={e => changeVolume(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  height: "3px",
                  borderRadius: "2px",
                  background: `linear-gradient(90deg, #C8B06A ${volume}%, rgba(255,255,255,0.15) ${volume}%)`,
                  outline: "none",
                }} />
            </div>
            <span className="font-sans text-[9px] text-[rgba(200,176,106,0.6)] w-7 text-right">
              {volume}%
            </span>
          </div>

          {/* Track selector */}
          <div className="flex gap-2">
            {TRACKS.map((t, i) => (
              <button key={t.name}
                onClick={() => changeTrack(i)}
                className="flex-1 py-1.5 rounded-full font-sans text-[8px] tracking-[0.08em] uppercase cursor-pointer transition-all duration-200"
                style={{
                  background: trackIdx === i ? "rgba(200,176,106,0.25)" : "rgba(255,255,255,0.06)",
                  border: trackIdx === i ? "1px solid rgba(200,176,106,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: trackIdx === i ? "#E8D898" : "rgba(255,255,255,0.4)",
                }}>
                {t.icon} {t.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spa entry note — shown briefly on first play */}
      {playing && !expanded && (
        <p className="font-cormorant text-[11px] italic text-[rgba(11,60,38,0.4)] mt-1.5 tracking-wide">
          Your music takes priority · tap to adjust
        </p>
      )}
    </div>
  );
}
