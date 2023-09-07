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

        Audio.playerJump = [,,315,,.08,.07,,.77,-16,,,,,,,,,.91,.01];
        Audio.playerLand = [1.33,,423,.01,,.06,2,2.64,-3.8,,,,,.1,,.2,,.54,.01]; // Hit 491
        Audio.playerDeath = [1.11,,779,.01,.2,.48,4,4.56,.4,,,,.02,.9,,1,,.34,.13]; // Explosion 566

        Audio.littleJump = [1.01,,491,,.01,.05,,1.02,25,,,,,,,.1,,.45,.08]; // Jump 438
        Audio.littleEscape = [,,433,.01,.18,.24,,.51,,,418,,.06,.1,,,,.43,.25,.11]; // Powerup 426

        Audio.enemyDeath = [1.81,,135,.01,.04,.18,1,.11,-6.6,,,,,.2,,.3,.15,.74,.09]; // Hit 569

        Audio.towerShoot = [1.01,,1250,.01,.09,.14,,1.77,-6.3,,,,,,23,,,.46,.02];
        Audio.mothDeath = [1.04,,363,.01,.08,.52,2,.31,.3,,,,,1.5,,.9,,.34,.07];
        Audio.ghostDeath = [2.01,,332,.02,.05,.16,1,.53,-0.8,,-7,.01,,.1,,,.03,.48,.04];
        Audio.buildingFinished = [2.03,0,65.40639,.03,.66,.18,2,.95,,,,,.3,.4,,,.19,.21,.1,.04];
        Audio.waveCountdown = [1.56,0,261.6256,,.13,.3,,.41,,,,,,.2,,,.05,.2,.19,.22];
        Audio.tile = [1.68,,0,.01,.01,0,,1.83,-28,-7,,,,,,,.02,,.01];
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

    startWave() {
        if (!Audio.musicPlaying) return;

        if (!this.trackWavePlaying) {
            let sequenceLength = song.rowLen * 4 / 44100;
            let intoPattern = (Audio.ctx.currentTime - this.musicStartTime) % sequenceLength;
            let startTime = Audio.ctx.currentTime - intoPattern + sequenceLength;

            //this.musicGainNodes[TRACK_WAVE].gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 3);
            this.musicGainNodes[TRACK_WAVE].gain.setValueAtTime(1, startTime);
            this.trackWavePlaying = true;
        }
    },

    stopWave() {
        if (!Audio.musicPlaying) return;

        if (this.trackWavePlaying) {
            this.musicGainNodes[TRACK_WAVE].gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 4);
            this.trackWavePlaying = false;
        }
    },

    startCombat() {
        if (!Audio.musicPlaying) return;

        if (!this.trackCombatPlaying) {
            let sequenceLength = song.rowLen * 4 / 44100;
            let intoPattern = (Audio.ctx.currentTime - this.musicStartTime) % sequenceLength;
            let startTime = Audio.ctx.currentTime - intoPattern + sequenceLength;

            //this.musicGainNodes[TRACK_COMBAT].gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
            this.musicGainNodes[TRACK_COMBAT].gain.setValueAtTime(1, startTime);
            this.trackCombatPlaying = true;
        }
    },

    stopCombat() {
        if (!Audio.musicPlaying) return;

        if (this.trackCombatPlaying) {
            this.musicGainNodes[TRACK_COMBAT].gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 4);
            this.trackCombatPlaying = false;
        }
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
