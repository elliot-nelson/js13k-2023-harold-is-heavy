// Audio

import { ZZFX } from './lib/zzfx';
import { CPlayer } from './lib/player-small';
import { song } from './songs/ThirteenthCenturyVibes';

export const TRACK_COMBAT = 5;
export const TRACK_WAVE = 6;

export const Audio = {
    init() {
        Audio.contextCreated = false;
        Audio.readyToPlay = false;
        Audio.musicEnabled = true;
        Audio.sfxEnabled = true;
        Audio.musicVolume = 0;
        Audio.sfxVolume = 0;

        Audio.levelStart = [5.02,,7,,,.18,,.37,,25,124,.03,.03,,,,.13,.35,.01]; // Random 807

        Audio.playerJump = [,,315,,.08,.07,,.77,-16,,,,,,,,,.91,.01];
        Audio.playerLand = [1.33,,423,.01,,.06,2,2.64,-3.8,,,,,.1,,.2,,.54,.01]; // Hit 491
        Audio.playerDeath = [1.11,,779,.01,.2,.48,4,4.56,.4,,,,.02,.9,,1,,.34,.13]; // Explosion 566
        Audio.playerSlam = [2.05,,374,.01,.05,.02,2,.59,-8.2,,,,,,,.5,.29,.65,.09]; // Shoot 673

        Audio.littleJump = [1.01,,491,,.01,.05,,1.02,25,,,,,,,.1,,.45,.08]; // Jump 438
        Audio.littleEscape = [,,433,.01,.18,.24,,.51,,,418,,.06,.1,,,,.43,.25,.11]; // Powerup 426

        Audio.enemyDeath = [1.81,,135,.01,.04,.18,1,.11,-6.6,,,,,.2,,.3,.15,.74,.09]; // Hit 569
    },

    initContext() {
        if (Audio.contextCreated) return;

        // In Safari, ensure our target AudioContext is created inside a
        // click or tap event (this ensures we don't interact with it until
        // after user input).
        //
        // Chrome and Firefox are more relaxed, but this approach works for all 3.
        ZZFX.x = Audio.ctx = new AudioContext();
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        ZZFX.destination = Audio.gain_;

        Audio.contextCreated = true;
    },

    initTracks() {
        // In this game, we ensure the screen that calls this function happens after the
        // user has interacted at least once (and that interaction called initContext above),
        // so we know it's safe to interact with the audio context.
        if (!Audio.musicPlaying) {
            this.player = new CPlayer();
            this.player.init(song);

            for (;;) {
                if (this.player.generate() === 1) break;
            }

            this.musicGainNodes = [];
            this.songSources = [];

            for (let i = 0; i < song.numChannels; i++) {
                let buffer = this.player.createAudioBuffer(Audio.ctx, i);
                this.songSource = Audio.ctx.createBufferSource();

                let gainNode = Audio.ctx.createGain();
                gainNode.connect(Audio.gain_);
                this.musicGainNodes.push(gainNode);

                /*if (i === TRACK_COMBAT || i === TRACK_WAVE) {
                    gainNode.gain.value = 0;
                }*/

                this.songSource.buffer = buffer;
                this.songSource.loop = true;
                this.songSource.connect(gainNode);
                this.songSources.push(this.songSource);
            }

            this.musicStartTime = Audio.ctx.currentTime + 0.1;

            for (let i = 0; i < song.numChannels; i++) {
                this.songSources[i].start(this.musicStartTime);
                // comment out music
            }

            Audio.musicPlaying = true;
        }

        Audio.readyToPlay = true;
    },

    update() {
        if (!Audio.readyToPlay) return;

        this.sfxVolume = this.sfxEnabled ? 0.3 : 0;
        this.musicVolume = this.musicEnabled ? 1 : 0;

        ZZFX.volume = this.sfxVolume;

        if (this.sfxEnabled) {
            ZZFX.volume = 0.3;
        } else {
            ZZFX.volume = 0;
        }
    },

    play(sound) {
        if (!Audio.readyToPlay) return;
        ZZFX.play(...sound);
    },

    // It's important we do pausing and unpausing as specific events and not in general update(),
    // because update() is triggered by the animation frame trigger which does not run if the
    // page is not visible. (So, if you want the music to fade in the background, for example,
    // that's not helpful if it won't work because you aren't looking at the page!)

    pause() {
        if (Audio.readyToPlay) {
            Audio.gain_.gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 1);
        }
    },

    unpause() {
        if (Audio.readyToPlay) {
            Audio.gain_.gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
        }
    }
};
