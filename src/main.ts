import './style.css';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene }     from './scenes/BootScene';
import { TitleScene }    from './scenes/TitleScene';
import { ShopScene }     from './scenes/ShopScene';
import { GameScene }     from './scenes/GameScene';
import { UIScene }       from './scenes/UIScene';
import { PassportScene } from './scenes/PassportScene';

const config: Phaser.Types.Core.GameConfig = {
  type:            Phaser.AUTO,
  width:           GAME_WIDTH,
  height:          GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  parent:          document.body,
  physics: {
    default: 'arcade',
    arcade:  { gravity: { x: 0, y: 0 }, debug: false },
  },
  dom: {
    createContainer: true,
  },
  scene: [
    BootScene,
    TitleScene,
    ShopScene,
    GameScene,
    UIScene,
    PassportScene,
  ],
};

new Phaser.Game(config);
