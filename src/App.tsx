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
    for (let s = 0; s < scale; s++) {
      rows.push(line);
    }
  }
  return rows.join("\n");
}

function renderCircularClock(date: Date, scale: number = 2): string {
  const radius = scale * 6; // base radius multiplied by scale
  const diameter = radius * 2 + 1;
  const grid: string[][] = Array.from({ length: diameter }, () => Array(diameter).fill(" "));

  const cx = radius;
  const cy = radius;

  // Place numbers 1–12 around the circle
  for (let n = 1; n <= 12; n++) {
    const angle = (Math.PI / 6) * (n - 3);
    const nx = Math.round(cx + Math.cos(angle) * (radius - 1));
    const ny = Math.round(cy + Math.sin(angle) * (radius - 1));
    const numStr = n.toString();
    for (let i = 0; i < numStr.length; i++) {
      if (grid[ny] && grid[ny][nx + i] !== undefined) {
        grid[ny][nx + i] = numStr[i];
      }
    }
  }

  // Function to draw hands
  function drawHand(angle: number, length: number, char: string) {
    for (let r = 1; r <= length; r++) {
      const x = Math.round(cx + Math.cos(angle) * r);
      const y = Math.round(cy + Math.sin(angle) * r);
      if (grid[y] && grid[y][x] !== undefined) {
        grid[y][x] = char;
      }
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

  // Draw circle outline
  for (let deg = 0; deg < 360; deg++) {
    const rad = (deg * Math.PI) / 180;
    const x = Math.round(cx + Math.cos(rad) * radius);
    const y = Math.round(cy + Math.sin(rad) * radius);
    if (grid[y] && grid[y][x] !== undefined && grid[y][x] === " ") {
      grid[y][x] = "*";
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

const AsciiClockApp: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [is24h, setIs24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [scale, setScale] = useState(2);
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
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        whiteSpace: "pre",
        fontFamily: "monospace",
      }}>
      <pre>{display}</pre>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setCircular(!circular)}>Switch to {circular ? "Digital" : "Circular"}</button>
        <button onClick={() => setIs24h(!is24h)} disabled={circular}>
          Switch to {is24h ? "12h" : "24h"}
        </button>
        <button onClick={() => setShowSeconds(!showSeconds)} disabled={circular}>
          {showSeconds ? "Hide Seconds" : "Show Seconds"}
        </button>
        <label style={{ marginLeft: "1rem" }}>
          Size:{" "}
          <input type="range" min={1} max={4} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
};

export default AsciiClockApp;
