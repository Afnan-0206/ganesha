// Elegant Abstract Calligraphic Glyphs for Manuscript Scribing
// Invented cultural calligraphy symbols (not real scripture characters).
// Designed with authentic reed-pen (kalam) stroke modulation, thick-and-thin tapers, and flourishes.

export const GLYPH_TYPES = [
  {
    id: 'shiro_loop',
    name: 'Crown Loop',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Horizontal ligature top-bar
      ctx.beginPath();
      ctx.moveTo(x - size * 0.55, y - size * 0.35);
      ctx.lineTo(x + size * 0.55, y - size * 0.35);
      ctx.lineWidth = size * 0.16;
      ctx.stroke();

      // Sweeping calligraphic loop descending
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1, y - size * 0.35);
      ctx.bezierCurveTo(
        x - size * 0.45, y + size * 0.05,
        x + size * 0.1, y + size * 0.55,
        x + size * 0.38, y + size * 0.2
      );
      ctx.bezierCurveTo(
        x + size * 0.5, y - size * 0.05,
        x + size * 0.15, y - size * 0.15,
        x, y + size * 0.15
      );
      ctx.lineWidth = size * 0.13;
      ctx.stroke();

      if (isWetGold) {
        ctx.fillStyle = '#FDE68A';
        ctx.beginPath();
        ctx.arc(x - size * 0.45, y - size * 0.35, size * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
  {
    id: 'crescent_bindu',
    name: 'Chandra Mark',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';

      // Broad sweeping upward crescent
      ctx.beginPath();
      ctx.arc(x, y + size * 0.05, size * 0.4, Math.PI * 0.15, Math.PI * 0.85);
      ctx.lineWidth = size * 0.2;
      ctx.stroke();

      // Fine tapered finials on tips
      ctx.beginPath();
      ctx.arc(x, y + size * 0.05, size * 0.4, Math.PI * 0.1, Math.PI * 0.9);
      ctx.lineWidth = size * 0.08;
      ctx.stroke();

      // Auspicious Calligraphic Diamond / Bindu above
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.42);
      ctx.lineTo(x + size * 0.13, y - size * 0.27);
      ctx.lineTo(x, y - size * 0.12);
      ctx.lineTo(x - size * 0.13, y - size * 0.27);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'kundala_swirl',
    name: 'Sacred Spiral',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = 'round';

      // Fluid spiral coil
      ctx.beginPath();
      ctx.arc(x - size * 0.05, y - size * 0.05, size * 0.32, 0, Math.PI * 1.75);
      ctx.lineWidth = size * 0.18;
      ctx.stroke();

      // Inner coil loop
      ctx.beginPath();
      ctx.arc(x - size * 0.05, y - size * 0.05, size * 0.16, Math.PI * 0.2, Math.PI * 1.9);
      ctx.lineWidth = size * 0.12;
      ctx.stroke();

      // Descending calligraphy tail with flourish
      ctx.beginPath();
      ctx.moveTo(x + size * 0.26, y - size * 0.1);
      ctx.bezierCurveTo(
        x + size * 0.45, y + size * 0.25,
        x + size * 0.15, y + size * 0.5,
        x - size * 0.2, y + size * 0.45
      );
      ctx.lineWidth = size * 0.12;
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'ankusha_hook',
    name: "Scribe's Hook",
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';

      // Top serif accent
      ctx.beginPath();
      ctx.moveTo(x - size * 0.35, y - size * 0.38);
      ctx.lineTo(x + size * 0.15, y - size * 0.38);
      ctx.lineWidth = size * 0.14;
      ctx.stroke();

      // Bold vertical shoulder stroke
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1, y - size * 0.38);
      ctx.lineTo(x - size * 0.1, y + size * 0.25);
      ctx.lineWidth = size * 0.2;
      ctx.stroke();

      // Dynamic hooked curl sweeping right
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1, y + size * 0.25);
      ctx.bezierCurveTo(
        x - size * 0.1, y + size * 0.52,
        x + size * 0.45, y + size * 0.52,
        x + size * 0.4, y + size * 0.1
      );
      ctx.lineWidth = size * 0.12;
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'trishul_crest',
    name: 'Trishula Crest',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = 'round';

      // Central spear shaft
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.45);
      ctx.lineTo(x, y + size * 0.45);
      ctx.lineWidth = size * 0.18;
      ctx.stroke();

      // Left curving wing
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.1);
      ctx.bezierCurveTo(
        x - size * 0.45, y + size * 0.1,
        x - size * 0.45, y - size * 0.3,
        x - size * 0.35, y - size * 0.35
      );
      ctx.lineWidth = size * 0.11;
      ctx.stroke();

      // Right curving wing
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.1);
      ctx.bezierCurveTo(
        x + size * 0.45, y + size * 0.1,
        x + size * 0.45, y - size * 0.3,
        x + size * 0.35, y - size * 0.35
      );
      ctx.lineWidth = size * 0.11;
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'sagar_wave',
    name: 'Sagar Wave',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';

      // Elegant undulating double wave
      ctx.beginPath();
      ctx.moveTo(x - size * 0.5, y + size * 0.15);
      ctx.bezierCurveTo(
        x - size * 0.25, y - size * 0.4,
        x - size * 0.05, y + size * 0.4,
        x + size * 0.2, y - size * 0.2
      );
      ctx.bezierCurveTo(
        x + size * 0.35, y - size * 0.45,
        x + size * 0.55, y - size * 0.1,
        x + size * 0.45, y + size * 0.25
      );
      ctx.lineWidth = size * 0.17;
      ctx.stroke();

      // Fine shadow baseline
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3, y + size * 0.35);
      ctx.lineTo(x + size * 0.3, y + size * 0.35);
      ctx.lineWidth = size * 0.08;
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'danda_arch',
    name: 'Sacred Danda',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = 'round';

      // Top shirorekha bar
      ctx.beginPath();
      ctx.moveTo(x - size * 0.4, y - size * 0.36);
      ctx.lineTo(x + size * 0.4, y - size * 0.36);
      ctx.lineWidth = size * 0.15;
      ctx.stroke();

      // Bold vertical stem with slight flare
      ctx.beginPath();
      ctx.moveTo(x + size * 0.05, y - size * 0.36);
      ctx.lineTo(x + size * 0.05, y + size * 0.42);
      ctx.lineWidth = size * 0.2;
      ctx.stroke();

      // Left arch joining the stem
      ctx.beginPath();
      ctx.moveTo(x - size * 0.35, y + size * 0.3);
      ctx.bezierCurveTo(
        x - size * 0.35, y - size * 0.1,
        x - size * 0.1, y - size * 0.2,
        x + size * 0.05, y - size * 0.1
      );
      ctx.lineWidth = size * 0.12;
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'granthi_knot',
    name: 'Auspicious Granthi',
    drawCalligraphy: (ctx, x, y, size = 26, color = '#201B1D', isWetGold = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = 'round';

      // Diagonal stroke 1
      ctx.beginPath();
      ctx.moveTo(x - size * 0.38, y - size * 0.3);
      ctx.lineTo(x + size * 0.38, y + size * 0.3);
      ctx.lineWidth = size * 0.18;
      ctx.stroke();

      // Diagonal stroke 2
      ctx.beginPath();
      ctx.moveTo(x + size * 0.38, y - size * 0.3);
      ctx.lineTo(x - size * 0.38, y + size * 0.3);
      ctx.lineWidth = size * 0.18;
      ctx.stroke();

      // Central interlocking knot ring
      ctx.beginPath();
      ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.1;
      ctx.stroke();

      // Center golden core dot
      if (isWetGold) {
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
];

export function getRandomGlyph() {
  return GLYPH_TYPES[Math.floor(Math.random() * GLYPH_TYPES.length)];
}
