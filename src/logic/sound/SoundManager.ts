import { Howl } from 'howler';

export type SoundKey =
    | 'bgm_valhalla'
    | 'bgm_northern'
    | 'bgm_saga'
    | 'bgm_frost'
    | 'bgm_odin'
    | 'bgm_throne';

const MUSIC_PLAYLIST: SoundKey[] = [
    'bgm_valhalla',
    'bgm_northern',
    'bgm_saga',
    'bgm_frost',
    'bgm_odin',
    'bgm_throne'
];

class SoundManager {
    private sounds: Partial<Record<SoundKey, Howl>> = {};
    private isMuted: boolean = false;
    private volume: number = 0.5;

    // Core state tracking
    private currentTrack: SoundKey | null = null;
    private currentSoundId: number | undefined = undefined;

    constructor() {
        this.loadSounds();
    }

    private loadSounds() {
        const manifest: Record<SoundKey, string> = {
            'bgm_valhalla': '/sounds/bgm_valhalla.mp3',
            'bgm_northern': '/sounds/bgm_northern.mp3',
            'bgm_saga': '/sounds/bgm_saga.mp3',
            'bgm_frost': '/sounds/bgm_frost.mp3',
            'bgm_odin': '/sounds/bgm_odin.mp3',
            'bgm_throne': '/sounds/bgm_throne.mp3'
        };

        Object.entries(manifest).forEach(([key, src]) => {
            this.sounds[key as SoundKey] = new Howl({
                src: [src],
                volume: this.volume,
                html5: true, // Use HTML5 Audio for streaming
                preload: true,
                onend: (id) => {
                    // Only auto-advance if the finished track is the one we are currently tracking
                    // (prevents zombies from triggering this)
                    if (this.currentSoundId === id) {
                        this.playNextTrack();
                    }
                },
                onloaderror: (_id, err) => {
                    console.warn(`Failed to load music: ${key} (${src}) - ${err}`);
                }
            });
        });
    }

    /**
     * Start playing music. If stopped, starts random. If paused, resumes.
     */
    public playMusic() {
        if (this.currentTrack && this.currentSoundId) {
            // Already tracking a song.
            const sound = this.sounds[this.currentTrack];
            if (sound && !sound.playing(this.currentSoundId)) {
                // It's paused or stopped. Try to play.
                if (!this.isMuted) {
                    sound.play(this.currentSoundId);
                }
            }
            return;
        }

        // Start fresh
        const randomTrack = MUSIC_PLAYLIST[Math.floor(Math.random() * MUSIC_PLAYLIST.length)];
        this.playTrack(randomTrack);
    }

    public playNextTrack() {
        let nextTrack: SoundKey;

        if (!this.currentTrack) {
            nextTrack = MUSIC_PLAYLIST[0];
        } else {
            const currentIndex = MUSIC_PLAYLIST.indexOf(this.currentTrack);
            const nextIndex = (currentIndex + 1) % MUSIC_PLAYLIST.length;
            nextTrack = MUSIC_PLAYLIST[nextIndex];
        }

        this.playTrack(nextTrack);
    }

    private playTrack(key: SoundKey) {
        // 1. STOP previous track specifically
        if (this.currentTrack && this.currentSoundId) {
            const prevSound = this.sounds[this.currentTrack];
            if (prevSound) {
                prevSound.stop(this.currentSoundId);
            }
        }

        // 2. Prepare new track
        this.currentTrack = key;
        const sound = this.sounds[key];

        if (!sound) {
            console.warn('Sound not found:', key);
            return;
        }

        // 3. Play new instance and get ID
        this.currentSoundId = sound.play();

        // 4. Set volume
        sound.volume(this.volume, this.currentSoundId);

        // 5. Check mute state immediately
        if (this.isMuted) {
            // If muted, we started it (to get ID) but must pause immediately.
            console.log('[SoundManager] Starting muted -> PAUSING', key);
            sound.pause(this.currentSoundId);
        } else {
            console.log('[SoundManager] Starting playing', key);
        }
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(`[SoundManager] Toggle Mute: ${this.isMuted ? 'MUTED' : 'UNMUTED'}`);

        if (!this.currentTrack || !this.currentSoundId) {
            // If nothing is playing, just start music if unmuted
            if (!this.isMuted) {
                this.playMusic();
            }
            return this.isMuted;
        }

        const sound = this.sounds[this.currentTrack];
        if (!sound) return this.isMuted;

        if (this.isMuted) {
            // User hit MUTE -> PAUSE
            console.log('[SoundManager] Pausing music (Muted)');
            sound.pause(this.currentSoundId);
        } else {
            // User hit UNMUTE -> PLAY (Resume)
            console.log('[SoundManager] Resuming music (Unmuted)');

            // Ensure volume is correct
            sound.volume(this.volume, this.currentSoundId);
            sound.play(this.currentSoundId);
        }

        return this.isMuted;
    }

    public get currentVolume() {
        return this.volume;
    }

    public setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));

        if (this.currentTrack && this.currentSoundId) {
            const sound = this.sounds[this.currentTrack];
            // Update volume of the specific playing instance
            sound?.volume(this.volume, this.currentSoundId);
        }
    }

    public stopMusic() {
        if (this.currentTrack && this.currentSoundId) {
            const sound = this.sounds[this.currentTrack];
            sound?.stop(this.currentSoundId);
        }
    }
}

export const soundManager = new SoundManager();
// @ts-ignore
if (typeof window !== 'undefined') (window as any).soundManager = soundManager;
