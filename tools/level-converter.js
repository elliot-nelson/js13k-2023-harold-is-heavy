// level-converter
//
// Build the "world", a big data blob containing all the information we need about the
// world the player plays in, and assemble it as a source file. The map data comes from
// Tiled, and data like stats and messages and descriptions comes from a YAML file.

// Note for future readers: I have a bunch of junk in here about rooms and floors, but
// actually this game doesn't have "rooms" or "floors". I haven't deleted that code
// because I'll probably be copying and pasting this file next time I create a game
// that imports from Tiled.

const fs = require('fs');
const util = require('util');
const yaml = require('js-yaml');
const tmx = require('./tmx-parser');
const glob = require('glob');

const LevelConverter = {
    async convert(levelGlob, outputFile) {
        const levelFiles = glob.sync(levelGlob);

        console.log(levelFiles);

        const levelData = [];

        for (const levelFile of levelFiles) {
            levelData.push(await this._extractLevelFromTmx(levelFile));
        }

        console.log(JSON.stringify(levelData));

        this._writeOutputFile(levelData, outputFile);
    },

    async _extractLevelFromTmx(inputFile) {
        const tiled = await tmx.parseTmxFile(inputFile);

        const floors = [];

        for (let layer of tiled.layers.filter(layer => layer.type === 'group')) {
            let floor = {
                name: layer.name,
                tiles: [],
                objects: [],
                areas: []
            };

            for (let sublayer of layer.layers) {
                if (sublayer.name === 'TILES') {
                    floor.tiles = sublayer.tiles;
                } else if (sublayer.name === 'OBJECTS') {
                    floor.objects = sublayer.objects;
                } else if (sublayer.name === 'AREAS') {
                    floor.areas = sublayer.areas;
                }
            }

            if (floor.tiles) {
                floors.push(floor);
            }
        }

        const level = { floors, bounds: this._getBounds(floors) };

        this._positionObjectsAndAreas(level, tiled.tilewidth, tiled.tileheight);
        this._shrinkWorld(level);
        this._normalizeWorld(level);

        return level;
    },

    /*
     * Return the min/max bounds of the entire world in Tiled. The actual Tiled world is
     * probably quite a bit bigger than it needs to be, for ease of expanding in any
     * direction in the editor.
     */
    _getBounds(floors) {
        let bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];
        for (let floor of floors) {
            for (let y = 0; y < floor.tiles.length; y++) {
                for (let x = 0; x < floor.tiles[y].length; x++) {
                    if ((floor.tiles[y][x] & 0xff) > 1) {
                        if (x < bounds[0][0]) bounds[0][0] = x;
                        if (x > bounds[1][0]) bounds[1][0] = x;
                        if (y < bounds[0][1]) bounds[0][1] = y;
                        if (y > bounds[1][1]) bounds[1][1] = y;
                    }
                }
            }
        }

        bounds[1][0]++;
        bounds[1][1]++;

        console.log('LEVEL BOUNDS: ', bounds);
        return bounds;
    },

    /*
     * Convert the positions of areas and objects, which in are in "pixel" space in Tiled,
     * into coordinate space, so they match up with the tiles they are drawn on.
     */
    _positionObjectsAndAreas(world, tileWidth, tileHeight) {
        for (let floor of world.floors) {
            for (let object of floor.objects) {
                object.x = Math.floor(object.x / tileWidth);
                object.y = Math.floor(object.y / tileHeight);
            }
            for (let area of floor.areas) {
                // Rooms are "drawn" as rectangles on top of the walls in Tiled and aren't guaranteed
                // to be exactly right, so we want anything "inside the grid" to count.
                let x2 = Math.floor((area.x + area.width) / tileWidth);
                let y2 = Math.floor((area.y + area.height) / tileHeight);
                area.x = Math.floor(area.x / tileWidth);
                area.y = Math.floor(area.y / tileHeight);
                area.width = x2 - area.x + 1;
                area.height = y2 - area.y + 1;
            }
        }
    },

    /*
     * Given new bounds, shrink the entire world as small as possible to save space, making sure
     * to adjust the coordinates of rooms and objects at the same time.
     */
    _shrinkWorld(world) {
        let startX = world.bounds[0][0],
            endX = world.bounds[1][0],
            startY = world.bounds[0][1],
            endY = world.bounds[1][1];

        for (let floor of world.floors) {
            floor.tiles = floor.tiles.slice(startY, endY).map(row => row.slice(startX, endX));
            for (let object of floor.objects) {
                object.x -= startX;
                object.y -= startY;
            }
            for (let area of floor.areas) {
                area.x -= startX;
                area.y -= startY;
            }
        }

        world.bounds = [[0, 0], [endX - startX, endY - startY]];
    },

    /*
     * Grab-bag of small modifications to the world data to line it up with the expectations
     * of the game engine. Mostly we are converting from "Tiled" values to in-game "ASCII" values,
     * while making a few other miscellaneous adjustments.
     */
    _normalizeWorld(world) {
        let spawn;
        let floorNumber = 0;

        for (let floor of world.floors) {
            floor.id = floorNumber++;

            for (let y = 0; y < floor.tiles.length; y++) {
                for (let x = 0; x < floor.tiles[y].length; x++) {
                    // Strip any rotation / special effects
                    floor.tiles[y][x] = (floor.tiles[y][x] & 0xff);

                    // Offset by 1 (the first tile in the list is 0)
                    //
                    // A side-effect of this is that "blank tiles" will become sky, which in this
                    // particular game is expected.
                    if (floor.tiles[y][x] > 0) {
                        floor.tiles[y][x]--;
                    }
                }
            }

            for (let object of floor.objects) {
                if (object.name === 'SPAWN') {
                    spawn = [object.x, object.y, floor.id];
                }
            }

            // Turn our lists of rooms and objects into maps based on name. Since the generated
            // object will have the names of rooms and objects as keys, our terser setup will automatically
            // mangle them during the gulp build, significantly reducing the bytes used.
            //floor.rooms = Object.fromEntries(floor.rooms.map(room => [room.name, room]));
            //floor.objects = Object.fromEntries(floor.objects.map(object => [object.name, object]));
        }

        // Delete unused data from our entries (sheds a few bytes).
        for (let floor of world.floors) {
            for (let object of floor.objects) {
                delete object.id;
                delete object.objectType;
                delete object.props;
            }
            for (let area of floor.areas) {
                delete area.id;
                delete area.objectType;
                delete area.props;
            }
        }

        if (!spawn) throw new Error('No spawn location detected in world.');

        world.spawn = spawn;
    },

    /*
     * Update the generated World source file with the new world data.
     */
    _writeOutputFile(data, outputFile) {
        let js = fs.readFileSync(outputFile, 'utf8');

        let lines = js.split('\n');
        let prefix = lines.findIndex(value => value.match(/<generated-data>/));
        let suffix = lines.findIndex(value => value.match(/<\/generated-data>/));
        let generatedData = JSON.stringify(data, undefined, 4);
        let result = lines.slice(0, prefix + 1).join('\n') + '\n' + generatedData + '\n' + lines.slice(suffix).join('\n');

        fs.writeFileSync(outputFile, result, 'utf8');
    }
};

module.exports = LevelConverter;
