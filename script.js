const canvas = document.querySelector("#signal-canvas");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (canvas) {
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let points = [];
  let frame = 0;

  const palette = ["#f6f3ec", "#d8a63c", "#e48f66", "#79c7a6"];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(28, Math.floor((width * height) / 12000));
    points = Array.from({ length: count }, (_, index) => ({
      x: (index * 89) % width,
      y: (index * 137) % height,
      phase: index * 0.37,
      speed: 0.6 + (index % 5) * 0.12,
      color: palette[index % palette.length],
    }));
  }

  function draw() {
    frame += prefersReducedMotion ? 0 : 0.012;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#0d4034";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(246, 243, 236, 0.12)";
    context.lineWidth = 1;
    for (let x = 32; x < width; x += 46) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 32; y < height; y += 46) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    points.forEach((point, index) => {
      const x = (point.x + Math.sin(frame * point.speed + point.phase) * 24 + width) % width;
      const y = (point.y + Math.cos(frame * point.speed + point.phase) * 18 + height) % height;

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const otherX = (other.x + Math.sin(frame * other.speed + other.phase) * 24 + width) % width;
        const otherY = (other.y + Math.cos(frame * other.speed + other.phase) * 18 + height) % height;
        const distance = Math.hypot(x - otherX, y - otherY);

        if (distance < 116) {
          context.strokeStyle = `rgba(246, 243, 236, ${0.14 - distance / 900})`;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(otherX, otherY);
          context.stroke();
        }
      }

      context.fillStyle = point.color;
      context.beginPath();
      context.arc(x, y, index % 7 === 0 ? 4 : 2.5, 0, Math.PI * 2);
      context.fill();
    });

    if (!prefersReducedMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  resize();
  draw();
  window.addEventListener("resize", () => {
    resize();
    if (prefersReducedMotion) {
      draw();
    }
  });
}
