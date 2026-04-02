import Phaser from 'phaser';
import { BIKE_CONFIGS, type BikeConfig } from '../data/bikes';
import { TILE_SPEED } from '../constants';

export type TrickName =
  | 'WHEELIE!'
  | 'BUNNY HOP!'
  | '360 SPIN!'
  | 'BACKFLIP!'
  | 'SUPERMAN!'
  | 'NO-HANDER!'
  | 'TAILWHIP!';

export interface TrickResult {
  name:  TrickName;
  score: number;
}

export class Bike extends Phaser.Physics.Arcade.Sprite {
  private cfg: BikeConfig;
  private _speed = 0;

  // Jump state
  private _isJumping   = false;
  private jumpTimer    = 0;
  private jumpDuration = 1500;    // ms
  private trickPending: TrickName | null = null;

  // Trick combo
  private comboTimer   = 0;
  private comboCount   = 0;
  private lastTrick    = '';

  // Current surface speed multiplier
  surfaceMultiplier = 1.0;

  // Visual shadow
  shadow: Phaser.GameObjects.Ellipse;

  // Events emitted to parent scene
  onTrick?: (result: TrickResult) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, bikeId: string) {
    super(scene, x, y, `bike_${bikeId}`);
    this.cfg    = BIKE_CONFIGS[bikeId];
    this.shadow = scene.add.ellipse(x, y + 10, 42, 20, 0x000000, 0.35);
    this.shadow.setDepth(9);
    this.setDepth(10);
    this.setOrigin(0.5, 0.5);
  }

  /** Called from GameScene.update */
  update(
    cursors:  Phaser.Types.Input.Keyboard.CursorKeys,
    spaceKey: Phaser.Input.Keyboard.Key,
    delta:    number,
  ): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // ── Combo timer ──────────────────────────────────────────────────────────
    if (this.comboCount > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    // ── Jump timer ───────────────────────────────────────────────────────────
    if (this._isJumping) {
      this.jumpTimer -= delta;

      // Trick detection while in air
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.detectAirTrick(cursors);
      }

      if (this.jumpTimer <= 0) {
        this.land();
      }
      return;   // no steering while in air — momentum only
    }

    // ── Ground: Acceleration / Braking ──────────────────────────────────────
    const speedFactor = this.cfg.maxSpeed * this.surfaceMultiplier;

    if (cursors.up.isDown) {
      this._speed = Math.min(this._speed + this.cfg.acceleration, speedFactor);
    } else if (cursors.down.isDown) {
      this._speed = Math.max(this._speed - this.cfg.acceleration * 2.2, -speedFactor * 0.25);
    } else {
      this._speed *= this.cfg.drag;
      if (Math.abs(this._speed) < 3) this._speed = 0;
    }

    // ── Steering  (turn radius scales with speed) ────────────────────────────
    if (Math.abs(this._speed) > 8) {
      const speedRatio = Math.abs(this._speed) / this.cfg.maxSpeed;
      const turn = this.cfg.turnRate * (0.4 + speedRatio * 0.6);
      if (cursors.left.isDown)  this.angle -= turn;
      if (cursors.right.isDown) this.angle += turn;
    }

    // ── Apply velocity (with drift feel) ─────────────────────────────────────
    const rad = Phaser.Math.DegToRad(this.angle - 90);
    const targetVX = Math.cos(rad) * this._speed;
    const targetVY = Math.sin(rad) * this._speed;
    const drift = this.cfg.id === 'bmx' ? 0.78 : 0.88;
    body.velocity.x = body.velocity.x * (1 - drift) + targetVX * drift;
    body.velocity.y = body.velocity.y * (1 - drift) + targetVY * drift;

    // ── Ground tricks ─────────────────────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(spaceKey) && !this._isJumping) {
      this.doGroundTrick(cursors);
    }

    // ── Shadow tracks bike ────────────────────────────────────────────────────
    this.shadow.setPosition(this.x + 4, this.y + 6);
    this.shadow.setScale(1, 1);
    this.shadow.setAlpha(0.35);
  }

  // ── Jump (triggered externally from GameScene on ramp overlap) ─────────────
  launchJump(): void {
    if (this._isJumping) return;
    this._isJumping   = true;
    this.jumpTimer    = this.jumpDuration;
    this.trickPending = null;

    // Animate: scale up
    this.scene.tweens.add({
      targets: this,
      scaleX:  1.35,
      scaleY:  1.35,
      duration: this.jumpDuration * 0.15,
      ease:    'Quad.easeOut',
    });
    // Shadow: spread out (below)
    this.scene.tweens.add({
      targets:  this.shadow,
      scaleX:   2.2,
      scaleY:   1.5,
      alpha:    0.15,
      duration: this.jumpDuration * 0.4,
    });
    // Extra forward boost
    const body = this.body as Phaser.Physics.Arcade.Body;
    const rad  = Phaser.Math.DegToRad(this.angle - 90);
    body.velocity.x += Math.cos(rad) * 60;
    body.velocity.y += Math.sin(rad) * 60;
  }

  private land(): void {
    this._isJumping = false;

    this.scene.tweens.add({
      targets:  this,
      scaleX:   1,
      scaleY:   1,
      duration: 150,
      ease:     'Bounce.easeOut',
    });
    this.scene.tweens.add({
      targets:  this.shadow,
      scaleX:   1,
      scaleY:   1,
      alpha:    0.35,
      duration: 150,
    });

    if (this.trickPending && this.onTrick) {
      const score = this.trickScore(this.trickPending) * this.comboMultiplier();
      this.comboCount++;
      this.comboTimer = 3000;
      this.lastTrick  = this.trickPending;
      this.onTrick({ name: this.trickPending, score: Math.round(score) });
      this.trickPending = null;

      // Spin animation on land
      this.scene.tweens.add({
        targets: this,
        angle:   this.angle + 360,
        duration: 300,
        ease: 'Quad.easeOut',
      });
    }

    // Camera bump
    this.scene.cameras.main.shake(120, 0.008);
  }

  private detectAirTrick(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    let trick: TrickName = '360 SPIN!';
    if (cursors.up.isDown && cursors.left.isDown)  trick = 'SUPERMAN!';
    else if (cursors.up.isDown && cursors.right.isDown) trick = 'NO-HANDER!';
    else if (cursors.up.isDown)   trick = 'SUPERMAN!';
    else if (cursors.down.isDown) trick = 'BACKFLIP!';
    else if (cursors.left.isDown || cursors.right.isDown) trick = '360 SPIN!';

    this.trickPending = trick;

    // Show trick animation (spin in air)
    const dir = cursors.left.isDown ? -1 : 1;
    this.scene.tweens.add({
      targets:  this,
      angle:    this.angle + dir * 360,
      duration: 500,
      ease:     'Quad.easeInOut',
    });
  }

  private doGroundTrick(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (Math.abs(this._speed) > 40 && cursors.up.isDown) {
      // Wheelie
      const result: TrickResult = {
        name:  'WHEELIE!',
        score: Math.round(80 * this.comboMultiplier()),
      };
      this.comboCount++;
      this.comboTimer = 3000;
      this.onTrick?.(result);

      this.scene.tweens.add({
        targets: this,
        scaleY:  1.15,
        duration: 300,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    } else if (Math.abs(this._speed) < 60) {
      // Bunny hop
      const result: TrickResult = {
        name:  'BUNNY HOP!',
        score: Math.round(50 * this.comboMultiplier()),
      };
      this.comboCount++;
      this.comboTimer = 3000;
      this.onTrick?.(result);

      this.scene.tweens.add({
        targets: this,
        scaleX:  1.2,
        scaleY:  1.2,
        duration: 200,
        yoyo:    true,
      });
    }
  }

  private trickScore(name: TrickName): number {
    const base: Record<TrickName, number> = {
      'WHEELIE!':    80,
      'BUNNY HOP!':  50,
      '360 SPIN!':   200,
      'BACKFLIP!':   350,
      'SUPERMAN!':   500,
      'NO-HANDER!':  400,
      'TAILWHIP!':   450,
    };
    return Math.round((base[name] ?? 100) * this.cfg.trickMultiplier);
  }

  comboMultiplier(): number {
    if (this.comboCount <= 0)  return 1;
    if (this.comboCount <= 2)  return 2;
    if (this.comboCount <= 4)  return 3;
    return 5;
  }

  // ── Surface modifier ─────────────────────────────────────────────────────
  applyTileSpeed(tileIndex: number): void {
    const mult = TILE_SPEED[tileIndex] ?? 1.0;
    // Mountain bike ignores off-road penalty
    this.surfaceMultiplier = this.cfg.id === 'mountain'
      ? Math.max(mult, 0.9)
      : mult;
  }

  get speed()     { return this._speed; }
  get isJumping() { return this._isJumping; }
  get combo()     { return this.comboCount; }
  get bikeId()    { return this.cfg.id; }
  get bikeName()  { return this.cfg.name; }

  destroy(fromScene?: boolean): void {
    this.shadow.destroy();
    super.destroy(fromScene);
  }
}
