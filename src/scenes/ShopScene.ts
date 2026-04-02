import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENE } from '../constants';
import { BIKE_CONFIGS, BIKE_ORDER } from '../data/bikes';

export class ShopScene extends Phaser.Scene {
  private selectedIndex = 0;
  private bikeImages:    Phaser.GameObjects.Image[] = [];
  private infoTexts:     Phaser.GameObjects.Text[]  = [];
  private statsBars:     Phaser.GameObjects.Rectangle[][] = [];
  private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private shopkeeperTxt!: Phaser.GameObjects.Text;

  constructor() { super({ key: SCENE.SHOP }); }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'shop_bg');

    this.add.text(GAME_WIDTH / 2, 38, 'CHOOSE YOUR BIKE, SCOTT!', {
      fontSize:   '22px',
      fontFamily: 'Arial',
      fontStyle:  'bold',
      color:      '#ffd60a',
      stroke:     '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 64, '← → Browse  |  Enter to ride!', {
      fontSize:   '13px',
      fontFamily: 'Arial',
      color:      '#cccccc',
      stroke:     '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.buildBikeDisplays();
    this.buildInfoPanel();
    this.buildShopkeeper();

    this.cursor   = this.input.keyboard!.createCursorKeys();
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.selectBike(0);
  }

  private buildBikeDisplays(): void {
    const spacing = GAME_WIDTH / (BIKE_ORDER.length + 1);

    BIKE_ORDER.forEach((id, i) => {
      const x = spacing * (i + 1);
      const y = 200;

      const img = this.add.image(x, y, `bike_${id}`)
        .setScale(2.5)
        .setInteractive()
        .on('pointerdown', () => { this.selectBike(i); });

      this.bikeImages.push(img);
    });
  }

  private buildInfoPanel(): void {
    // Panel background
    const px = GAME_WIDTH / 2;
    const py = 390;
    const pw = 640;
    const ph = 180;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(px - pw / 2, py - 20, pw, ph, 12);
    panel.lineStyle(2, 0xffd60a, 1);
    panel.strokeRoundedRect(px - pw / 2 + 1, py - 19, pw - 2, ph - 2, 11);

    // Bike name
    this.infoTexts.push(
      this.add.text(px, py + 6, '', {
        fontSize:   '22px',
        fontFamily: 'Arial',
        fontStyle:  'bold',
        color:      '#ffd60a',
      }).setOrigin(0.5),
    );

    // Description
    this.infoTexts.push(
      this.add.text(px, py + 32, '', {
        fontSize:   '14px',
        fontFamily: 'Arial',
        color:      '#ffffff',
        align:      'center',
        wordWrap:   { width: 580 },
      }).setOrigin(0.5),
    );

    // Price (left column)
    this.infoTexts.push(
      this.add.text(px - 290, py + 56, '', {
        fontSize:   '14px',
        fontFamily: 'Arial',
        color:      '#aaddff',
      }).setOrigin(0, 0),
    );

    // Special ability (left column, below price)
    this.infoTexts.push(
      this.add.text(px - 290, py + 80, '', {
        fontSize:   '13px',
        fontFamily: 'Arial',
        color:      '#aaffaa',
        fontStyle:  'italic',
        wordWrap:   { width: 240 },
      }).setOrigin(0, 0),
    );

    // Stats bars (right column)
    const stats = ['Speed', 'Tricks', 'Handling', 'Terrain'];
    const barX  = px + 30;
    const barW  = 180;
    stats.forEach((label, i) => {
      const ly = py + 56 + i * 26;
      this.add.text(barX, ly, label + ':', {
        fontSize:   '13px',
        fontFamily: 'Arial',
        color:      '#cccccc',
      });
      const bgBar  = this.add.rectangle(barX + 80, ly + 7, barW, 12, 0x333333).setOrigin(0, 0.5);
      bgBar;
      const fillBar = this.add.rectangle(barX + 80, ly + 7, 10, 12, 0x4a8c3f).setOrigin(0, 0.5);
      this.statsBars.push([fillBar]);
    });
  }

  private buildShopkeeper(): void {
    // Shopkeeper speech bubble area
    this.shopkeeperTxt = this.add.text(750, 310, '', {
      fontSize:   '14px',
      fontFamily: 'Arial',
      color:      '#ffffff',
      backgroundColor: '#00000088',
      padding:    { x: 10, y: 8 },
      wordWrap:   { width: 170 },
    }).setOrigin(0, 0.5);
  }

  private selectBike(index: number): void {
    this.selectedIndex = index;
    const id  = BIKE_ORDER[index];
    const cfg = BIKE_CONFIGS[id];

    // Update images — highlight selected
    this.bikeImages.forEach((img, i) => {
      img.setScale(i === index ? 3.2 : 2.2);
      img.setAlpha(i === index ? 1 : 0.55);
    });

    // Update info panel
    this.infoTexts[0].setText(cfg.name);
    this.infoTexts[1].setText(cfg.description);
    this.infoTexts[2].setText(`💰 ${cfg.price}`);
    this.infoTexts[3].setText(`✨ ${cfg.specialAbility}`);

    // Update stats bars
    const maxSpeed = 360;
    const barStats = [
      cfg.maxSpeed / maxSpeed,
      cfg.trickMultiplier / 2.5,
      (cfg.turnRate - 2) / 2.5,
      cfg.id === 'mountain' ? 1.0 : 1 - (1 - (BIKE_CONFIGS[id].drag - 0.93) / 0.04) * 0.3,
    ];

    const barColors = [0xe63946, 0xffd60a, 0x4a8c3f, 0x2a78c7];
    this.statsBars.forEach(([bar], i) => {
      const val = Math.max(0.05, Math.min(1, barStats[i]));
      this.tweens.add({
        targets:  bar,
        width:    val * 180,
        duration: 300,
        ease:     'Quad.easeOut',
      });
      bar.setFillStyle(barColors[i]);
    });

    // Shopkeeper quip
    const quips: Record<string, string> = {
      bmx:      '"Best for tricks, Scott!\nTry the ramps on Magazine Road!"',
      mountain: '"Take it anywhere, boi!\nEven over the grass in Fitz\'s Park!"',
      racer:    '"Fast as lightning!\nWatch out for the cobblestones though!"',
      cargo:    '"Grand for carrying\nyour shopping from the English Market!"',
      electric: '"Eco-friendly and deadly fast!\nYour Mam would approve."',
    };
    this.shopkeeperTxt.setText(quips[id] ?? '');

    // Play a little bounce on selected bike
    this.tweens.add({
      targets:  this.bikeImages[index],
      y:        this.bikeImages[index].y - 12,
      duration: 200,
      yoyo:     true,
      ease:     'Sine.easeOut',
    });
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.cursor.left!)) {
      this.selectBike((this.selectedIndex - 1 + BIKE_ORDER.length) % BIKE_ORDER.length);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursor.right!)) {
      this.selectBike((this.selectedIndex + 1) % BIKE_ORDER.length);
    }
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.startRide();
    }
  }

  private startRide(): void {
    const bikeId = BIKE_ORDER[this.selectedIndex];
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE.GAME, { bikeId });
    });
  }
}
