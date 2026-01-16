import { create } from 'zustand';

export interface TokenAnimation {
    id: string;
    fromId: string;
    toId: string;
    count: number;
    delay?: number;
}

interface AnimationState {
    animations: TokenAnimation[];
    triggerTokenAnimation: (fromId: string, toId: string, count: number, delay?: number) => void;
    removeAnimation: (id: string) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
    animations: [],

    triggerTokenAnimation: (fromId, toId, count, delay = 0) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
            animations: [...state.animations, { id, fromId, toId, count, delay }]
        }));
    },

    removeAnimation: (id) => {
        set((state) => ({
            animations: state.animations.filter(a => a.id !== id)
        }));
    }
}));
