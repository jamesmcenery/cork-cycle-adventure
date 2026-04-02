import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';
import { BIKE_CONFIGS, BIKE_ORDER } from '../data/bikes';
import { ATTRACTIONS } from '../data/attractions';

// All programmatic textures are generated here during BootScene.create()
export class TextureFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createAll(): void {
    this.createTileset();
    this.createBikeTextures();
    this.createAttractionMarkers();
    this.createSkatepark();
    this.createChasers();
    this.createRamp();
    this.createShamrock();
    this.createUIElements();
    this.createTitleAssets();
    this.createShopBackground();
    this.createPassportPage();
  }

  // ── Tileset: 10 tiles × 64 px = 640×64 image ─────────────────────────────
  private createTileset(): void {
    const W = TILE_SIZE * 10;
    const H = TILE_SIZE;
    const ct = this.scene.textures.createCanvas('tileset', W, H)!;
    const ctx = ct.getContext() as CanvasRenderingContext2D;

    const drawTile = (idx: number, fn: (ctx: CanvasRenderingContext2D, x: number) => void) => {
      fn(ctx, idx * TILE_SIZE);
    };

    // 0 – GRASS
    drawTile(0, (c, x) => {
      c.fillStyle = '#4a8c3f'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#3d7a34';
      for (const [dx, dy] of [[8,5],[22,44],[40,12],[55,38],[14,55],[48,28],[30,50]]) {
        c.fillRect(x + dx, dy, 2, 7);
      }
    });

    // 1 – ROAD  (direction-neutral — no vertical/horizontal dashes)
    drawTile(1, (c, x) => {
      c.fillStyle = '#4a4a4a'; c.fillRect(x, 0, 64, 64);
      // Subtle edge shading on all 4 sides (no directional bias)
      c.fillStyle = '#383838';
      c.fillRect(x,      0,  64, 3);   // top
      c.fillRect(x,     61,  64, 3);   // bottom
      c.fillRect(x,      0,   3, 64);  // left
      c.fillRect(x + 61, 0,   3, 64);  // right
      // Small centre marker (looks like road markings from above)
      c.fillStyle = '#5a5a5a';
      c.fillRect(x + 27, 27, 10, 10);
      c.fillStyle = '#ffffff';
      c.fillRect(x + 29, 29,  6,  6);
      c.fillStyle = '#4a4a4a';
      c.fillRect(x + 31, 31,  2,  2);  // inner void = dot ring effect
    });

    // 2 – CYCLE PATH
    drawTile(2, (c, x) => {
      c.fillStyle = '#3d6b55'; c.fillRect(x, 0, 64, 64);
      // bike lane marking (white dashes)
      c.fillStyle = '#a8e6cf';
      c.fillRect(x + 28, 2, 8, 14);
      c.fillRect(x + 28, 48, 8, 14);
      // tiny bike icon in centre
      c.fillStyle = '#ccffcc';
      c.fillRect(x + 28, 22, 8, 2);  // handlebar
      c.fillRect(x + 30, 24, 4, 8);  // body
      c.beginPath(); c.arc(x + 32, 20, 4, 0, Math.PI * 2); c.fillStyle = '#aaddaa'; c.fill();
      c.beginPath(); c.arc(x + 32, 44, 4, 0, Math.PI * 2); c.fill();
    });

    // 3 – PARK
    drawTile(3, (c, x) => {
      c.fillStyle = '#56c456'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#4ab54a';
      for (const [dx, dy, r] of [[16,16,10],[44,44,8],[10,50,6],[52,12,9],[32,32,12]]) {
        c.beginPath(); c.arc(x + dx, dy, r, 0, Math.PI * 2); c.fill();
      }
    });

    // 4 – BUILDING  (solid, collidable)
    drawTile(4, (c, x) => {
      c.fillStyle = '#8b7355'; c.fillRect(x, 0, 64, 64);
      // window pattern
      c.fillStyle = '#c9a96e';
      c.fillRect(x + 8,  8,  12, 14);
      c.fillRect(x + 26, 8,  12, 14);
      c.fillRect(x + 44, 8,  12, 14);
      c.fillRect(x + 8,  30, 12, 14);
      c.fillRect(x + 26, 30, 12, 14);
      c.fillRect(x + 44, 30, 12, 14);
      c.fillStyle = '#aaddff';
      c.fillRect(x + 10, 10, 8, 10);
      c.fillRect(x + 28, 10, 8, 10);
      c.fillRect(x + 46, 10, 8, 10);
      c.fillRect(x + 10, 32, 8, 10);
      c.fillRect(x + 28, 32, 8, 10);
      c.fillRect(x + 46, 32, 8, 10);
      // dark top edge (3D feel)
      c.fillStyle = '#4a3d28';
      c.fillRect(x, 0, 64, 4);
    });

    // 5 – WATER  (solid, collidable)
    drawTile(5, (c, x) => {
      c.fillStyle = '#1b6ca8'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#2980b9';
      for (const y of [10, 28, 46]) {
        c.fillRect(x + 4,  y, 56, 4);
      }
      c.fillStyle = '#5dade2';
      c.fillRect(x + 10, 14, 20, 2);
      c.fillRect(x + 36, 32, 22, 2);
      c.fillRect(x + 8,  50, 18, 2);
    });

    // 6 – COBBLESTONE
    drawTile(6, (c, x) => {
      c.fillStyle = '#6e6e6e'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#555555';
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const ox = (row % 2 === 0) ? 0 : 8;
          c.fillRect(x + col * 16 + ox, row * 16, 14, 14);
        }
      }
      c.fillStyle = '#444444';
      for (let i = 0; i < 64; i += 16) { c.fillRect(x, i, 64, 2); }
    });

    // 7 – DIRT
    drawTile(7, (c, x) => {
      c.fillStyle = '#9a7a5a'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#8a6a4a';
      for (const [dx, dy] of [[6,4],[20,22],[38,8],[52,38],[14,50],[44,55],[28,34]]) {
        c.beginPath(); c.arc(x + dx, dy, 5, 0, Math.PI * 2); c.fill();
      }
    });

    // 8 – PLAZA
    drawTile(8, (c, x) => {
      c.fillStyle = '#c0b090'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#a89870';
      for (let i = 0; i < 64; i += 16) {
        c.fillRect(x, i, 64, 2);
        c.fillRect(x + i, 0, 2, 64);
      }
    });

    // 9 – SIDEWALK
    drawTile(9, (c, x) => {
      c.fillStyle = '#d4c9a8'; c.fillRect(x, 0, 64, 64);
      c.fillStyle = '#b8ad8c';
      for (let i = 0; i < 64; i += 32) {
        c.fillRect(x, i, 64, 2);
        c.fillRect(x + i, 0, 2, 64);
      }
    });

    ct.refresh();
  }

  // ── Bike + Scott sprites (64×64 each) ─────────────────────────────────────
  // Sprite orientation: TOP = FRONT of bike. Phaser rotates the whole sprite.
  // Front wheel at y≈10, rear wheel at y≈54.
  private createBikeTextures(): void {
    for (const id of BIKE_ORDER) {
      const cfg = BIKE_CONFIGS[id];
      const ct  = this.scene.textures.createCanvas(`bike_${id}`, 64, 64)!;
      const ctx = ct.getContext() as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, 64, 64);
      const fc = '#' + cfg.frameColor.toString(16).padStart(6, '0');
      const ac = '#' + cfg.accentColor.toString(16).padStart(6, '0');
      this.drawBikeTopDown(ctx, id, fc, ac);
      ct.refresh();
    }
  }

  // Elongated ellipse tire — looks like a real wheel from above
  private drawTire(ctx: CanvasRenderingContext2D, cx: number, cy: number, rw: number, rh: number) {
    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555555'; // rim
    ctx.beginPath(); ctx.ellipse(cx, cy, rw - 2, rh - 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#999999'; // hub
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
  }

  private drawBikeTopDown(ctx: CanvasRenderingContext2D, id: string, fc: string, ac: string): void {
    const PI2 = Math.PI * 2;

    if (id === 'bmx') {
      // Fat tyres, wide flat handlebars, axle pegs
      this.drawTire(ctx, 32, 54, 6, 9);          // rear — fat
      this.drawTire(ctx, 32, 10, 6, 9);          // front
      ctx.strokeStyle = fc; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(32,10); ctx.lineTo(32,54); ctx.stroke(); // main tube
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(26,20); ctx.lineTo(38,42); ctx.stroke(); // chainstay L
      ctx.beginPath(); ctx.moveTo(38,20); ctx.lineTo(26,42); ctx.stroke(); // chainstay R
      ctx.strokeStyle = '#aaaaaa'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(14,8); ctx.lineTo(50,8); ctx.stroke();   // wide handlebars
      ctx.beginPath(); ctx.moveTo(32,8); ctx.lineTo(32,14); ctx.stroke();  // stem
      ctx.strokeStyle = '#888'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(13,54); ctx.lineTo(20,54); ctx.stroke(); // peg L
      ctx.beginPath(); ctx.moveTo(44,54); ctx.lineTo(51,54); ctx.stroke(); // peg R

    } else if (id === 'mountain') {
      // Chunky fat tyres, dual fork, riser bars
      this.drawTire(ctx, 32, 54, 7, 10);
      this.drawTire(ctx, 32, 10, 7, 10);
      ctx.strokeStyle = '#aaaaaa'; ctx.lineWidth = 3; // dual suspension forks
      ctx.beginPath(); ctx.moveTo(27,10); ctx.lineTo(27,26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(37,10); ctx.lineTo(37,26); ctx.stroke();
      ctx.strokeStyle = fc; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(32,22); ctx.lineTo(32,54); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(27,26); ctx.lineTo(32,44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(37,26); ctx.lineTo(32,44); ctx.stroke();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(18,10); ctx.lineTo(46,10); ctx.stroke(); // flat riser bar
      ctx.beginPath(); ctx.moveTo(32,10); ctx.lineTo(32,20); ctx.stroke(); // stem

    } else if (id === 'racer') {
      // Skinny tyres, drop handlebars
      this.drawTire(ctx, 32, 54, 4, 9);
      this.drawTire(ctx, 32, 10, 4, 9);
      ctx.strokeStyle = fc; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(32,10); ctx.lineTo(32,54); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(32,22); ctx.lineTo(26,44); ctx.stroke(); // seat stay
      ctx.beginPath(); ctx.moveTo(32,22); ctx.lineTo(38,44); ctx.stroke();
      ctx.strokeStyle = '#999'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(22,8); ctx.lineTo(42,8); ctx.stroke();   // tops
      ctx.beginPath(); ctx.moveTo(22,8); ctx.bezierCurveTo(22,15,26,15,26,10); ctx.stroke(); // drop L
      ctx.beginPath(); ctx.moveTo(42,8); ctx.bezierCurveTo(42,15,38,15,38,10); ctx.stroke(); // drop R
      ctx.strokeStyle = ac; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(28,8); ctx.lineTo(36,8); ctx.stroke();   // handlebar tape

    } else if (id === 'cargo') {
      // Small front wheel, big cargo box, large rear wheel
      this.drawTire(ctx, 32, 54, 6, 9);          // rear
      this.drawTire(ctx, 32, 24, 5, 7);          // small front
      ctx.fillStyle = ac;
      ctx.fillRect(14, 4, 36, 18);               // cargo box
      ctx.strokeStyle = fc; ctx.lineWidth = 2;
      ctx.strokeRect(14, 4, 36, 18);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; // X brace
      ctx.beginPath(); ctx.moveTo(14,4); ctx.lineTo(50,22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50,4); ctx.lineTo(14,22); ctx.stroke();
      ctx.strokeStyle = fc; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(32,24); ctx.lineTo(32,54); ctx.stroke();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(22,24); ctx.lineTo(42,24); ctx.stroke(); // handlebars

    } else {
      // Electric: sleek frame, visible battery pack
      this.drawTire(ctx, 32, 54, 5, 9);
      this.drawTire(ctx, 32, 10, 5, 9);
      ctx.strokeStyle = fc; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(32,10); ctx.lineTo(32,54); ctx.stroke();
      ctx.fillStyle = ac;                        // battery pack
      ctx.fillRect(24, 28, 16, 10);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(25, 30, 12, 6);               // charge bar (full)
      ctx.fillStyle = '#003300';
      ctx.fillRect(25, 30, 4, 6);                // charge level
      ctx.strokeStyle = '#bbbbbb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(20,9); ctx.lineTo(44,9); ctx.stroke();   // clean bars
      ctx.beginPath(); ctx.moveTo(32,9); ctx.lineTo(32,15); ctx.stroke();
      // Lightning bolt
      ctx.fillStyle = '#ffd60a';
      ctx.beginPath();
      ctx.moveTo(34,20); ctx.lineTo(29,27); ctx.lineTo(33,27); ctx.lineTo(29,36);
      ctx.lineTo(37,27); ctx.lineTo(33,27); ctx.closePath(); ctx.fill();
    }

    // === SCOTT — drawn on top of every bike ===
    // He straddles the frame, leans forward, arms reach handlebars.
    // Helmet colour matches the bike frame so each bike looks distinct.

    // Legs (straddling, jeans)
    ctx.fillStyle = '#1e4d80';
    ctx.fillRect(24, 35, 7, 13); // left leg
    ctx.fillRect(33, 35, 7, 13); // right leg

    // Torso (orange jacket)
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(26, 22, 12, 15);

    // Arms reaching forward
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(14, 19, 13, 5); // left arm
    ctx.fillRect(37, 19, 13, 5); // right arm

    // Helmet (matches bike frame colour — distinctive!)
    ctx.fillStyle = fc;
    ctx.beginPath(); ctx.ellipse(32, 20, 7, 8, 0, 0, PI2); ctx.fill();
    // Helmet sheen
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.ellipse(29, 16, 3, 4, -0.4, 0, PI2); ctx.fill();
    // Yellow visor stripe (direction indicator for player!)
    ctx.fillStyle = '#ffd60a';
    ctx.fillRect(26, 16, 12, 4);

    // White direction arrow at the very front (unmistakably shows "forward")
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(32, 1);  // tip
    ctx.lineTo(26, 9);
    ctx.lineTo(38, 9);
    ctx.closePath();
    ctx.fill();
  }

  // ── Attraction marker: glowing circle with emoji-style icon ───────────────
  private createAttractionMarkers(): void {
    for (const att of ATTRACTIONS) {
      const key = `marker_${att.id}`;
      const ct  = this.scene.textures.createCanvas(key, 80, 80)!;
      const ctx = ct.getContext() as CanvasRenderingContext2D;

      const col = '#' + att.stamptint.toString(16).padStart(6, '0');
      // Outer glow
      const grad = ctx.createRadialGradient(40, 40, 10, 40, 40, 38);
      grad.addColorStop(0, col + 'cc');
      grad.addColorStop(1, col + '00');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(40, 40, 38, 0, Math.PI * 2); ctx.fill();
      // Circle
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(40, 40, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(40, 40, 18, 0, Math.PI * 2); ctx.fill();
      // Emoji / letter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(att.emoji, 40, 41);

      ct.refresh();
    }
  }

  // ── Ramp ──────────────────────────────────────────────────────────────────
  // ── Chaser characters — top-down person sprite with colour coding ────────────
  createChasers(): void {
    const chars: { key: string; body: string; head: string; label: string }[] = [
      { key: 'chaser_mam',    body: '#e63946', head: '#f4a261', label: 'M' },  // Esther  — red
      { key: 'chaser_dad',    body: '#2a78c7', head: '#f4a261', label: 'D' },  // Cillian — blue
      { key: 'chaser_uncle',  body: '#8338ec', head: '#f4a261', label: 'J' },  // James   — purple
      { key: 'chaser_auntie', body: '#e07a5f', head: '#f4a261', label: 'T' },  // Therese — orange
      { key: 'chaser_finn',   body: '#3a86ff', head: '#f4a261', label: 'F' },  // Finn    — light blue
      { key: 'chaser_culann', body: '#2d6a4f', head: '#f4a261', label: 'C' },  // Culann  — green
    ];

    for (const ch of chars) {
      const ct  = this.scene.textures.createCanvas(ch.key, 40, 40)!;
      const ctx = ct.getContext() as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, 40, 40);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(20, 36, 9, 4, 0, 0, Math.PI * 2); ctx.fill();

      // Body (top-down torso)
      ctx.fillStyle = ch.body;
      ctx.beginPath(); ctx.ellipse(20, 24, 9, 11, 0, 0, Math.PI * 2); ctx.fill();

      // Head
      ctx.fillStyle = ch.head;
      ctx.beginPath(); ctx.arc(20, 12, 9, 0, Math.PI * 2); ctx.fill();

      // Hair (dark cap)
      ctx.fillStyle = '#3a2010';
      ctx.beginPath();
      ctx.arc(20, 12, 9, Math.PI, 0); ctx.fill();

      // Initial letter on body
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ch.label, 20, 28);

      ct.refresh();
    }
  }

  // ── Skate park — top-down concrete area with half-pipe and quarter pipes ────
  createSkatepark(): void {
    // 192×128 px — fits 3×2 tiles
    const ct  = this.scene.textures.createCanvas('skatepark', 192, 128)!;
    const ctx = ct.getContext() as CanvasRenderingContext2D;

    // Concrete base
    ctx.fillStyle = '#b0a898';
    ctx.fillRect(0, 0, 192, 128);

    // Concrete panel lines
    ctx.strokeStyle = '#9a9288';
    ctx.lineWidth = 1;
    for (let x = 0; x < 192; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke(); }
    for (let y = 0; y < 128; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(192, y); ctx.stroke(); }

    // Half-pipe — top view (oval bowl shape)
    ctx.strokeStyle = '#7a7068';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(96, 48, 72, 32, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#666058';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(96, 48, 58, 20, 0, 0, Math.PI * 2); ctx.stroke();
    // Deep end shade
    ctx.fillStyle = '#8a8278';
    ctx.beginPath(); ctx.ellipse(96, 48, 44, 14, 0, 0, Math.PI * 2); ctx.fill();

    // Quarter pipe left
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath(); ctx.moveTo(8, 100); ctx.lineTo(40, 100); ctx.lineTo(8, 72); ctx.closePath(); ctx.fill();

    // Quarter pipe right
    ctx.beginPath(); ctx.moveTo(184, 100); ctx.lineTo(152, 100); ctx.lineTo(184, 72); ctx.closePath(); ctx.fill();

    // Grind rail (centre bottom)
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(60, 108); ctx.lineTo(132, 108); ctx.stroke();
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 106); ctx.lineTo(132, 106); ctx.stroke();

    // "SKATE PARK" label
    ctx.fillStyle = '#444038';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SKATE PARK', 96, 122);

    ct.refresh();
  }

  private createRamp(): void {
    const ct  = this.scene.textures.createCanvas('ramp', 80, 40)!;
    const ctx = ct.getContext() as CanvasRenderingContext2D;
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath();
    ctx.moveTo(0, 40); ctx.lineTo(80, 40); ctx.lineTo(80, 0); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e63946';
    ctx.fillRect(0, 38, 80, 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RAMP', 55, 30);
    ct.refresh();
  }

  // ── Shamrock collectible ──────────────────────────────────────────────────
  private createShamrock(): void {
    const ct  = this.scene.textures.createCanvas('shamrock', 32, 32)!;
    const ctx = ct.getContext() as CanvasRenderingContext2D;
    ctx.fillStyle = '#52b788';
    // Three leaves
    for (const [cx, cy] of [[16,10],[10,18],[22,18]]) {
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    }
    // Stem
    ctx.fillStyle = '#3a7d5a';
    ctx.fillRect(14, 24, 4, 6);
    ct.refresh();
  }

  // ── UI elements ───────────────────────────────────────────────────────────
  private createUIElements(): void {
    // Stamp slot (empty / collected)
    const sizes = [48, 48];
    for (const [key, filled] of [['stamp_empty', false], ['stamp_filled', true]]) {
      const ct  = this.scene.textures.createCanvas(key as string, sizes[0], sizes[1])!;
      const ctx = ct.getContext() as CanvasRenderingContext2D;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(24, 24, 20, 0, Math.PI * 2); ctx.stroke();
      if (filled) {
        ctx.fillStyle = '#ffd60a';
        ctx.beginPath(); ctx.arc(24, 24, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e63946';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 24, 25);
      }
      ct.refresh();
    }

    // Score panel bg
    const panel = this.scene.textures.createCanvas('score_panel', 200, 60)!;
    const pctx  = panel.getContext() as CanvasRenderingContext2D;
    pctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.roundRect(pctx, 0, 0, 200, 60, 12);
    pctx.fill();
    panel.refresh();

    // Mini-map background
    const mm   = this.scene.textures.createCanvas('minimap_bg', 160, 120)!;
    const mctx = mm.getContext() as CanvasRenderingContext2D;
    mctx.fillStyle = 'rgba(0,0,0,0.6)';
    mctx.fillRect(0, 0, 160, 120);
    mctx.strokeStyle = '#ffffff44';
    mctx.lineWidth = 1;
    mctx.strokeRect(1, 1, 158, 118);
    mm.refresh();

    // Player dot for minimap
    const dot  = this.scene.textures.createCanvas('minimap_dot', 8, 8)!;
    const dctx = dot.getContext() as CanvasRenderingContext2D;
    dctx.fillStyle = '#ffd60a';
    dctx.beginPath(); dctx.arc(4, 4, 4, 0, Math.PI * 2); dctx.fill();
    dot.refresh();
  }

  private createTitleAssets(): void {
    // Cork skyline silhouette (title background)
    const sky = this.scene.textures.createCanvas('skyline', 960, 640)!;
    const ctx = sky.getContext() as CanvasRenderingContext2D;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 640);
    grad.addColorStop(0, '#0d1b2a');
    grad.addColorStop(0.6, '#1b3a5c');
    grad.addColorStop(1, '#2a7a40');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 640);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137.5) % 960;
      const sy = (i * 53.3) % 280;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Hills / ground
    ctx.fillStyle = '#1a4a25';
    ctx.beginPath();
    ctx.moveTo(0, 640);
    ctx.lineTo(0, 450);
    ctx.bezierCurveTo(200, 380, 400, 440, 600, 400);
    ctx.bezierCurveTo(700, 380, 800, 430, 960, 410);
    ctx.lineTo(960, 640);
    ctx.closePath();
    ctx.fill();

    // Shandon steeple silhouette
    ctx.fillStyle = '#0d2e1a';
    ctx.fillRect(360, 320, 30, 110);
    ctx.beginPath(); ctx.moveTo(358, 320); ctx.lineTo(375, 290); ctx.lineTo(392, 320); ctx.fill();
    // Clock faces
    ctx.fillStyle = '#1a4a25';
    for (const [ox, oy] of [[-4,0],[16,0],[6,-10],[6,10]]) {
      ctx.beginPath(); ctx.arc(375 + ox, 310 + oy, 6, 0, Math.PI * 2); ctx.fill();
    }

    // St Fin Barre's two spires
    ctx.fillStyle = '#0d2e1a';
    ctx.fillRect(550, 330, 20, 100);
    ctx.beginPath(); ctx.moveTo(548, 330); ctx.lineTo(560, 295); ctx.lineTo(572, 330); ctx.fill();
    ctx.fillRect(590, 340, 18, 90);
    ctx.beginPath(); ctx.moveTo(588, 340); ctx.lineTo(599, 308); ctx.lineTo(610, 340); ctx.fill();

    // River Lee glimmer
    ctx.fillStyle = 'rgba(30, 100, 180, 0.4)';
    ctx.fillRect(0, 430, 960, 18);
    ctx.fillStyle = 'rgba(80, 150, 220, 0.3)';
    ctx.fillRect(0, 448, 960, 8);

    sky.refresh();

    // Title logo panel
    const logo = this.scene.textures.createCanvas('logo_panel', 700, 160)!;
    const lctx = logo.getContext() as CanvasRenderingContext2D;
    lctx.fillStyle = 'rgba(0,0,0,0.65)';
    this.roundRect(lctx, 0, 0, 700, 160, 20);
    lctx.fill();
    lctx.strokeStyle = '#ffd60a';
    lctx.lineWidth = 3;
    this.roundRect(lctx, 2, 2, 696, 156, 18);
    lctx.stroke();
    logo.refresh();
  }

  private createShopBackground(): void {
    const shop = this.scene.textures.createCanvas('shop_bg', 960, 640)!;
    const ctx  = shop.getContext() as CanvasRenderingContext2D;

    // Floor
    ctx.fillStyle = '#6b4c1e'; ctx.fillRect(0, 0, 960, 640);

    // Corrugated metal walls (The Bike Shed / shipping-container aesthetic)
    ctx.fillStyle = '#8a7a6a';
    ctx.fillRect(0, 0, 960, 400);
    // Wall ridges
    ctx.fillStyle = '#9a8a7a';
    for (let i = 0; i < 640; i += 20) {
      ctx.fillRect(i, 0, 4, 400);
    }

    // No wall sign, no tyre sculpture — clean wall

    // Floor planks
    ctx.fillStyle = '#5a3e1a';
    for (let i = 400; i < 640; i += 28) {
      ctx.fillRect(0, i, 960, 26);
      ctx.fillStyle = i % 56 === 0 ? '#4a3010' : '#5a3e1a';
    }

    // Counter / desk
    ctx.fillStyle = '#3d2b0d';
    ctx.fillRect(700, 350, 220, 80);
    ctx.fillStyle = '#6b4a1e';
    ctx.fillRect(700, 340, 220, 14);

    shop.refresh();
  }

  private createPassportPage(): void {
    const pp  = this.scene.textures.createCanvas('passport_bg', 700, 480)!;
    const ctx = pp.getContext() as CanvasRenderingContext2D;

    // Passport cover look
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, 700, 480);
    ctx.strokeStyle = '#ffd60a';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 684, 464);
    ctx.strokeRect(16, 16, 668, 448);

    // Shamrock decoration
    ctx.fillStyle = '#2d6a4f';
    for (const [cx, cy] of [[60,60],[640,60],[60,420],[640,420]]) {
      for (const [lx, ly] of [[cx,cy-15],[cx-13,cy+8],[cx+13,cy+8]]) {
        ctx.beginPath(); ctx.arc(lx, ly, 12, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillRect(cx - 3, cy + 8, 6, 16);
    }

    // No title text baked in — PassportScene renders it as Phaser text objects

    pp.refresh();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
