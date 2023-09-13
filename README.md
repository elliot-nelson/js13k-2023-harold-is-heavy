# js13k-2023-harold-is-heavy

> My 2023 entry for the js13kgames competition, Harold is Heavy.

![Welcome Screenshot](dist/final/400x250.png)

## PLAY THE GAME!

 - Play the version submitted to game jam at: https://js13kgames.com/entries/harold-is-heavy
 - The most recent version is available at: https://harold-is-heavy.7tonshark.com

(See changelog below for more information on changes, bug fixes, etc.)

## INSTRUCTIONS

It's the 13th century in the Floating Isles of Isildor, and the king is rounding up baby dragonkin everywhere. All but the improbably heavy Harold (because nobody could figure out how to move him).

Throw Harold's weight around in this silly platformer and rescue your friends from the king's ugly, boring crates! Arrow keys or WASD to move, spacebar to jump.

## BUILD

To build the game for yourself:

 1. Clone the repository
 2. `npm install`
 3. `gulp build` (or just `gulp` to enter watch mode)

A normal build doesn't run the full terser / roadroller / zipping steps; for that, run `gulp build --dist`.

## TOOLS

 - Levels are built using [Tiled](https://www.mapeditor.org/). The level structure is flattened/minimized and inserted into the LevelData during the gulp build.
 - Art created using [Aseprite](https://www.aseprite.org/). All aseprite files in the assets folder is automatically smashed into a spritesheet during the build.
 - Sound effects created using [ZZFX](https://killedbyapixel.github.io/ZzFX/).
 - Music composed in [Sound Box](https://sb.bitsnbites.eu/).

## CHANGELOG

#### [v1.0.0](https://github.com/elliot-nelson/js13k-2023-harold-is-heavy/releases/tag/v1.0.0) (2023-09-12)

 - Submitted to game jam.
