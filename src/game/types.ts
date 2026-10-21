/**
 * StudyVerse 10 — 3D Game & Academy Engine Types
 */

export type GameSceneType = 'hub' | 'chapter_1_lab' | 'settings' | 'chapter_select';

export type SciBuddyAnimationState = 'idle' | 'point' | 'explain' | 'think' | 'celebrate' | 'retry';

export interface PlayerInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  respawn: boolean;
  joystickAngle: number | null; // in radians
  joystickMagnitude: number; // 0 to 1
}

export interface ChapterPortalData {
  chapterId: string;
  chapterNumber: number;
  title: string;
  unitTitle: string;
  status: 'active' | 'locked';
  position: [number, number, number];
  color: number;
  description: string;
}

export interface GameSettings {
  language: 'english' | 'hindi' | 'hinglish';
  soundEnabled: boolean;
  captionsEnabled: boolean;
  graphicsQuality: 'low' | 'balanced';
  reducedMotion: boolean;
}
