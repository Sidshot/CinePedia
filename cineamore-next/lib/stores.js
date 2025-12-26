'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Watchlist Store
export const useWatchlistStore = create(
    persist(
        (set, get) => ({
            watchlist: [],
            addToWatchlist: (item) => {
                const exists = get().watchlist.find(m => m.id === item.id);
                if (!exists) {
                    set({ watchlist: [...get().watchlist, item] });
                }
            },
            removeFromWatchlist: (id) => {
                set({ watchlist: get().watchlist.filter(m => m.id !== id) });
            },
            isInWatchlist: (id) => {
                return get().watchlist.some(m => m.id === id);
            },
        }),
        {
            name: 'cinepedia-watchlist',
        }
    )
);

// User Preferences Store
export const usePreferencesStore = create(
    persist(
        (set) => ({
            defaultProvider: 'alpha',
            autoplay: false,
            volume: 0.8,
            setDefaultProvider: (provider) => set({ defaultProvider: provider }),
            setAutoplay: (enabled) => set({ autoplay: enabled }),
            setVolume: (vol) => set({ volume: vol }),
        }),
        {
            name: 'cinepedia-preferences',
        }
    )
);

// Player State Store (not persisted)
export const usePlayerStore = create((set) => ({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    setPlaying: (playing) => set({ isPlaying: playing }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (dur) => set({ duration: dur }),
    setBuffered: (buf) => set({ buffered: buf }),
}));
