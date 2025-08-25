import React, { useState, useEffect } from "react";

const DIGITS: Record<string, string[]> = {
  "0": [" ██ ", "█  █", "█  █", "█  █", " ██ "],
  "1": ["  █ ", " ██ ", "  █ ", "  █ ", " ███"],
  "2": ["███ ", "   █", " ██ ", "█   ", "████"],
  "3": ["███ ", "   █", " ██ ", "   █", "███ "],
  "4": ["█  █", "█  █", "████", "   █", "   █"],
  "5": ["████", "█   ", "███ ", "   █", "███ "],
  "6": [" ██ ", "█   ", "███ ", "█  █", " ██ "],
  "7": ["████", "   █", "  █ ", " █  ", " █  "],
  "8": [" ██ ", "█  █", " ██ ", "█  █", " ██ "],
  "9": [" ██ ", "█  █", " ███", "   █", " ██ "],
  ":": ["   ", " ░ ", "   ", " ░ ", "   "],
};

function renderAsciiTime(time: string, scale: number): string {
  const rows: string[] = [];
  for (let row = 0; row < 5; row++) {
    let line = "";
    for (const ch of time.split("")) {
      const digit = DIGITS[ch] || [" ", " ", " ", " ", " "];
      const part = digit[row]
        .split("")
        .map((c) => c.repeat(scale))
        .join("");
      line += part + " ";
    }
    for (let s = 0; s < scale; s++) rows.push(line);
  }
  return rows.join("\n");
}

function renderCircularClock(date: Date, scale: number = 2): string {
  const radius = scale * 6;
  const borderLayers = 3;

  const topPadding = borderLayers + 2;
  const bottomPadding = borderLayers + 2;
  const leftPadding = borderLayers * 2 + 2;
  const rightPadding = borderLayers * 2 + 2;

  const diameter = radius * 2 + 1;
  const gridWidth = diameter * 2 + leftPadding + rightPadding;
  const gridHeight = diameter + topPadding + bottomPadding;

  const grid: string[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(" "));

  const cx = Math.floor(gridWidth / 2);
  const cy = radius + topPadding;

  // Draw hands
  function drawHand(angle: number, length: number, char: string) {
    for (let r = 1; r <= length; r++) {
      const x = Math.round(cx + Math.cos(angle) * r * 2);
      const y = Math.round(cy + Math.sin(angle) * r);
      if (grid[y] && grid[y][x] !== undefined) grid[y][x] = char;
    }
  }

  const sec = date.getSeconds();
  const min = date.getMinutes();
  const hr = date.getHours() % 12;

  const secAngle = (Math.PI / 30) * sec - Math.PI / 2;
  const minAngle = (Math.PI / 30) * min - Math.PI / 2;
  const hrAngle = (Math.PI / 6) * hr + (Math.PI / 360) * min - Math.PI / 2;

  drawHand(hrAngle, Math.floor(radius * 0.5), "H");
  drawHand(minAngle, Math.floor(radius * 0.7), "M");
  drawHand(secAngle, Math.floor(radius * 0.9), "S");

  // Draw border layers
  const xStretch = 2;
  for (let i = 0; i < borderLayers; i++) {
    const layerRadius = radius + i;
    const step = 0.25; // fine step for smooth circle
    for (let deg = 0; deg < 360; deg += step) {
      const rad = (deg * Math.PI) / 180;
      const dx = Math.cos(rad) * layerRadius * xStretch;
      const dy = Math.sin(rad) * layerRadius;
      const x = Math.round(cx + dx);
      const y = Math.round(cy + dy);
      if (!grid[y] || grid[y][x] === undefined) continue;
      const sx = Math.sign(dx) || 1;
      const sy = Math.sign(dy) || 1;
      grid[y][x] = sx * sy > 0 ? "\\" : "/";
    }
  }

  // Tick marks
  for (let s = 0; s < 60; s++) {
    const angle = (Math.PI / 30) * s - Math.PI / 2;
    const tickRadius = radius - 1;
    const x = Math.round(cx + Math.cos(angle) * tickRadius * 2);
    const y = Math.round(cy + Math.sin(angle) * tickRadius);
    if (grid[y] && grid[y][x] !== undefined) grid[y][x] = s % 5 === 0 ? "•" : ".";
  }

  // ASCII numbers 1-12
  for (let n = 1; n <= 12; n++) {
    const angle = (Math.PI / 6) * (n - 3);
    const nx = Math.round(cx + Math.cos(angle) * (radius - 3) * 2);
    const ny = Math.round(cy + Math.sin(angle) * (radius - 3));

    const digits = n.toString().split("");
    const asciiLines: string[] = [];
    for (let row = 0; row < 5; row++) asciiLines.push(digits.map((d) => DIGITS[d][row]).join(" "));

    for (let row = 0; row < asciiLines.length; row++) {
      const y = ny - Math.floor(asciiLines.length / 2) + row;
      if (y >= 0 && y < grid.length) {
        const line = asciiLines[row];
        for (let col = 0; col < line.length; col++) {
          const x = nx - Math.floor(line.length / 2) + col;
          if (x >= 0 && x < grid[0].length && line[col] !== " ") grid[y][x] = line[col];
        }
      }
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

const AsciiClockApp: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [is24h, setIs24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [scale, setScale] = useState(3);
  const [circular, setCircular] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let display = "";
  if (circular) {
    display = renderCircularClock(time, scale);
  } else {
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    if (!is24h) h = ((h + 11) % 12) + 1;
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    const text = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    display = renderAsciiTime(text, scale);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        whiteSpace: "pre",
        fontFamily: "monospace",
        position: "relative",
      }}>
      <pre>{display}</pre>

      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          background: "rgba(0,0,0,0.05)",
          padding: "0.5rem",
        }}>
        <button onClick={() => setCircular(!circular)}>Switch to {circular ? "Digital" : "Circular"}</button>
        <button onClick={() => setIs24h(!is24h)} disabled={circular}>
          Switch to {is24h ? "12h" : "24h"}
        </button>
        <button onClick={() => setShowSeconds(!showSeconds)} disabled={circular}>
          {showSeconds ? "Hide Seconds" : "Show Seconds"}
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          Size:
          <input type="range" min={1} max={5} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
};

export default AsciiClockApp;
