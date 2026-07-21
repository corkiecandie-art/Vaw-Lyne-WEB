/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string; // YouTube Video ID
  title: string;
  category: 'single' | 'visualizer' | 'release';
  releaseYear: string;
  description: string;
  genre: 'Afro Soul' | 'Afro House' | 'Amapiano' | 'Deep House' | 'Afro-pop' | 'Afrobeats' | 'R&B' | 'Soulful melodies';
  duration: string;
}

export interface Playlist {
  id: string; // Playlist ID
  title: string;
  type: 'album' | 'ep';
  releaseYear: string;
  embedUrl: string;
  description: string;
  tracksCount: number;
  genre: string;
  coverImage: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  category: 'streaming' | 'social';
  highlighted?: boolean;
}
