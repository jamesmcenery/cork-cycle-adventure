const KEY_STAMPS    = 'cca_stamps';
const KEY_SCORES    = 'cca_scores';
const KEY_UNLOCKED  = 'cca_unlocked';

export interface ScoreEntry {
  name:    string;
  score:   number;
  bikeId:  string;
  date:    string;
}

const SaveManager = {
  getStamps(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEY_STAMPS) ?? '[]');
    } catch { return []; }
  },

  addStamp(attractionId: string): void {
    const stamps = this.getStamps();
    if (!stamps.includes(attractionId)) {
      stamps.push(attractionId);
      localStorage.setItem(KEY_STAMPS, JSON.stringify(stamps));
    }
  },

  clearStamps(): void {
    localStorage.removeItem(KEY_STAMPS);
  },

  getScores(): ScoreEntry[] {
    try {
      return JSON.parse(localStorage.getItem(KEY_SCORES) ?? '[]');
    } catch { return []; }
  },

  addScore(entry: ScoreEntry): void {
    const scores = this.getScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(KEY_SCORES, JSON.stringify(scores.slice(0, 10)));
  },

  getUnlockedBikes(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEY_UNLOCKED) ?? '["bmx","mountain"]');
    } catch { return ['bmx', 'mountain']; }
  },

  unlockBike(bikeId: string): void {
    const unlocked = this.getUnlockedBikes();
    if (!unlocked.includes(bikeId)) {
      unlocked.push(bikeId);
      localStorage.setItem(KEY_UNLOCKED, JSON.stringify(unlocked));
    }
  },
};

export default SaveManager;
