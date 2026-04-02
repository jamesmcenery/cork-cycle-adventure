import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

// Tile indices that chasers can walk on (everything except BUILDING=4 and WATER=5)
const WALKABLE = new Set([0, 1, 2, 3, 6, 7, 8, 9]);

export class Chaser extends Phaser.GameObjects.Container {
  readonly chaserName: string;
  readonly catchMsg:   string;
  readonly mapTint:    number;

  private tileCol:      number;
  private tileRow:      number;
  private targetWX:     number;
  private targetWY:     number;
  private baseSpeed:    number;
  private groundLayer:  Phaser.Tilemaps.TilemapLayer;
  private sprite:       Phaser.GameObjects.Image;
  private exclaim:      Phaser.GameObjects.Text;
  private prevDx = 0;
  private prevDy = -1; // default face north

  constructor(
    scene:       Phaser.Scene,
    tileCol:     number,
    tileRow:     number,
    textureKey:  string,
    name:        string,
    catchMsg:    string,
    speed:       number,
    groundLayer: Phaser.Tilemaps.TilemapLayer,
    mapTint      = 0xff4444,
  ) {
    const wx = tileCol * TILE_SIZE + TILE_SIZE / 2;
    const wy = tileRow * TILE_SIZE + TILE_SIZE / 2;
    super(scene, wx, wy);

    this.chaserName  = name;
    this.catchMsg    = catchMsg;
    this.mapTint     = mapTint;
    this.baseSpeed   = speed;
    this.groundLayer = groundLayer;
    this.tileCol     = tileCol;
    this.tileRow     = tileRow;
    this.targetWX    = wx;
    this.targetWY    = wy;

    // Sprite
    this.sprite = scene.add.image(0, 0, textureKey).setDisplaySize(40, 40);

    // Floating name badge
    const badge = scene.add.text(0, -30, name, {
      fontSize: '9px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff4444', stroke: '#000000', strokeThickness: 2,
      backgroundColor: '#00000099', padding: { x: 3, y: 1 },
    }).setOrigin(0.5);

    // Exclamation that pulses when close
    this.exclaim = scene.add.text(0, -46, '!', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff0000', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    this.add([this.sprite, badge, this.exclaim]);
    scene.add.existing(this);
    this.setDepth(15);

    // Gentle bob animation
    scene.tweens.add({
      targets: this.sprite, y: -4, duration: 500 + Math.random() * 200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  update(scottX: number, scottY: number, delta: number, elapsedSec: number): void {
    const dx = this.targetWX - this.x;
    const dy = this.targetWY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) {
      this.x = this.targetWX;
      this.y = this.targetWY;
      this.pickNextTile(scottX, scottY);
    } else {
      const speed = this.currentSpeed(elapsedSec);
      const step  = Math.min(speed * delta / 1000, dist);
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.prevDx = dx;
      this.prevDy = dy;
    }

    // Rotate sprite to face direction of movement
    this.sprite.setRotation(Math.atan2(this.prevDy, this.prevDx) + Math.PI / 2);

    // Pulse exclamation when within 300px of Scott
    const distToScott = Phaser.Math.Distance.Between(this.x, this.y, scottX, scottY);
    this.exclaim.setAlpha(distToScott < 300 ? 1 : 0);
  }

  /** Returns world-space distance to a point. */
  distanceTo(wx: number, wy: number): number {
    return Phaser.Math.Distance.Between(this.x, this.y, wx, wy);
  }

  private currentSpeed(elapsedSec: number): number {
    // Ramp from base speed up to 1.6× over 4 minutes
    const factor = Math.min(1.6, 1 + elapsedSec / 240);
    return this.baseSpeed * factor;
  }

  private pickNextTile(scottX: number, scottY: number): void {
    const scottCol = Math.floor(scottX / TILE_SIZE);
    const scottRow = Math.floor(scottY / TILE_SIZE);

    const dirs = [
      { dc:  0, dr: -1 },
      { dc:  0, dr:  1 },
      { dc: -1, dr:  0 },
      { dc:  1, dr:  0 },
    ];

    const candidates = dirs
      .map(d => ({ col: this.tileCol + d.dc, row: this.tileRow + d.dr }))
      .filter(t => this.isWalkable(t.col, t.row))
      .map(t => ({
        ...t,
        dist: Math.abs(t.col - scottCol) + Math.abs(t.row - scottRow),
      }))
      .sort((a, b) => a.dist - b.dist);

    if (candidates.length === 0) return;

    // 78% chance to chase directly, 22% random (breaks loops, keeps it fun)
    const chosen = Math.random() < 0.78
      ? candidates[0]
      : candidates[Math.floor(Math.random() * candidates.length)];

    this.tileCol = chosen.col;
    this.tileRow = chosen.row;
    this.targetWX = chosen.col * TILE_SIZE + TILE_SIZE / 2;
    this.targetWY = chosen.row * TILE_SIZE + TILE_SIZE / 2;
  }

  private isWalkable(col: number, row: number): boolean {
    const tile = this.groundLayer.getTileAt(col, row);
    return tile !== null && WALKABLE.has(tile.index);
  }
}
