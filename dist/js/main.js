webpackJsonp([0,2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	//通过webpack.config.js里配置alias引用jquery
	var $ = __webpack_require__(1);
	var dxy_wechat_share = __webpack_require__(4);
	__webpack_require__(6);
	$(function ($) {
	    //Aliases
	    var Container = PIXI.Container,
	        autoDetectRenderer = PIXI.autoDetectRenderer,
	        loader = PIXI.loader,
	        resources = PIXI.loader.resources,
	        TextureCache = PIXI.utils.TextureCache,
	        Texture = PIXI.Texture,
	        Sprite = PIXI.Sprite,
	        Text = PIXI.Text,
	        Graphics = PIXI.Graphics;
	
	    //Create a Pixi stage and renderer and add the 
	    //renderer.view to the DOM
	    var stage = new Container(),
	        renderer = autoDetectRenderer(512, 512);
	    document.body.appendChild(renderer.view);
	
	    loader.add("../images/treasureHunter.json").load(setup);
	
	    //Define variables that might be used in more 
	    //than one function
	    var state, explorer, treasure, blobs, chimes, exit, player, dungeon, door, healthBar, message, gameScene, gameOverScene, enemies, id;
	
	    function setup() {
	
	        //Make the game scene and add it to the stage
	        gameScene = new Container();
	        stage.addChild(gameScene);
	
	        //Make the sprites and add them to the `gameScene`
	        //Create an alias for the texture atlas frame ids
	        id = resources["../images/treasureHunter.json"].textures;
	
	        //Dungeon
	        dungeon = new Sprite(id["dungeon.png"]);
	        gameScene.addChild(dungeon);
	
	        //Door
	        door = new Sprite(id["door.png"]);
	        door.position.set(32, 0);
	        gameScene.addChild(door);
	
	        //Explorer
	        explorer = new Sprite(id["explorer.png"]);
	        explorer.x = 68;
	        explorer.y = gameScene.height / 2 - explorer.height / 2;
	        explorer.vx = 0;
	        explorer.vy = 0;
	        gameScene.addChild(explorer);
	
	        //Treasure
	        treasure = new Sprite(id["treasure.png"]);
	        treasure.x = gameScene.width - treasure.width - 48;
	        treasure.y = gameScene.height / 2 - treasure.height / 2;
	        gameScene.addChild(treasure);
	
	        //Make the blobs
	        var numberOfBlobs = 6,
	            spacing = 48,
	            xOffset = 150,
	            speed = 2,
	            direction = 1;
	
	        //An array to store all the blob monsters
	        blobs = [];
	
	        //Make as many blobs as there are `numberOfBlobs`
	        for (var i = 0; i < numberOfBlobs; i++) {
	
	            //Make a blob
	            var blob = new Sprite(id["blob.png"]);
	
	            //Space each blob horizontally according to the `spacing` value.
	            //`xOffset` determines the point from the left of the screen
	            //at which the first blob should be added
	            var x = spacing * i + xOffset;
	
	            //Give the blob a random y position
	            var y = randomInt(0, stage.height - blob.height);
	
	            //Set the blob's position
	            blob.x = x;
	            blob.y = y;
	
	            //Set the blob's vertical velocity. `direction` will be either `1` or
	            //`-1`. `1` means the enemy will move down and `-1` means the blob will
	            //move up. Multiplying `direction` by `speed` determines the blob's
	            //vertical direction
	            blob.vy = speed * direction;
	
	            //Reverse the direction for the next blob
	            direction *= -1;
	
	            //Push the blob into the `blobs` array
	            blobs.push(blob);
	
	            //Add the blob to the `gameScene`
	            gameScene.addChild(blob);
	        }
	
	        //Create the health bar
	        healthBar = new Container();
	        healthBar.position.set(stage.width - 170, 6);
	        gameScene.addChild(healthBar);
	
	        //Create the black background rectangle
	        var innerBar = new Graphics();
	        innerBar.beginFill(0x000000);
	        innerBar.drawRect(0, 0, 128, 8);
	        innerBar.endFill();
	        healthBar.addChild(innerBar);
	
	        //Create the front red rectangle
	        var outerBar = new Graphics();
	        outerBar.beginFill(0xFF3300);
	        outerBar.drawRect(0, 0, 128, 8);
	        outerBar.endFill();
	        healthBar.addChild(outerBar);
	
	        healthBar.outer = outerBar;
	
	        //Create the `gameOver` scene
	        gameOverScene = new Container();
	        stage.addChild(gameOverScene);
	
	        //Make the `gameOver` scene invisible when the game first starts
	        gameOverScene.visible = false;
	
	        //Create the text sprite and add it to the `gameOver` scene
	        message = new Text("The End!", {
	            font: "64px Futura",
	            fill: "white"
	        });
	        message.x = 120;
	        message.y = stage.height / 2 - 32;
	        gameOverScene.addChild(message);
	
	        //Capture the keyboard arrow keys
	        var left = keyboard(37),
	            up = keyboard(38),
	            right = keyboard(39),
	            down = keyboard(40);
	
	        //Left arrow key `press` method
	        left.press = function () {
	
	            //Change the explorer's velocity when the key is pressed
	            explorer.vx = -5;
	            explorer.vy = 0;
	        };
	
	        //Left arrow key `release` method
	        left.release = function () {
	
	            //If the left arrow has been released, and the right arrow isn't down,
	            //and the explorer isn't moving vertically:
	            //Stop the explorer
	            if (!right.isDown && explorer.vy === 0) {
	                explorer.vx = 0;
	            }
	        };
	
	        //Up
	        up.press = function () {
	            explorer.vy = -5;
	            explorer.vx = 0;
	        };
	        up.release = function () {
	            if (!down.isDown && explorer.vx === 0) {
	                explorer.vy = 0;
	            }
	        };
	
	        //Right
	        right.press = function () {
	            explorer.vx = 5;
	            explorer.vy = 0;
	        };
	        right.release = function () {
	            if (!left.isDown && explorer.vy === 0) {
	                explorer.vx = 0;
	            }
	        };
	
	        //Down
	        down.press = function () {
	            explorer.vy = 5;
	            explorer.vx = 0;
	        };
	        down.release = function () {
	            if (!up.isDown && explorer.vx === 0) {
	                explorer.vy = 0;
	            }
	        };
	
	        //Set the game state
	        state = play;
	
	        //Start the game loop
	        gameLoop();
	    }
	
	    function gameLoop() {
	
	        //Loop this function 60 times per second
	        requestAnimationFrame(gameLoop);
	
	        //Update the current game state
	        state();
	
	        //Render the stage
	        renderer.render(stage);
	    }
	
	    function play() {
	
	        //use the explorer's velocity to make it move
	        explorer.x += explorer.vx;
	        explorer.y += explorer.vy;
	
	        //Contain the explorer inside the area of the dungeon
	        contain(explorer, {
	            x: 28,
	            y: 10,
	            width: 488,
	            height: 480
	        });
	        //contain(explorer, stage);
	
	        //Set `explorerHit` to `false` before checking for a collision
	        var explorerHit = false;
	
	        //Loop through all the sprites in the `enemies` array
	        blobs.forEach(function (blob) {
	
	            //Move the blob
	            blob.y += blob.vy;
	
	            //Check the blob's screen boundaries
	            var blobHitsWall = contain(blob, {
	                x: 28,
	                y: 10,
	                width: 488,
	                height: 480
	            });
	
	            //If the blob hits the top or bottom of the stage, reverse
	            //its direction
	            if (blobHitsWall === "top" || blobHitsWall === "bottom") {
	                blob.vy *= -1;
	            }
	
	            //Test for a collision. If any of the enemies are touching
	            //the explorer, set `explorerHit` to `true`
	            if (hitTestRectangle(explorer, blob)) {
	                explorerHit = true;
	            }
	        });
	
	        //If the explorer is hit...
	        if (explorerHit) {
	
	            //Make the explorer semi-transparent
	            explorer.alpha = 0.5;
	
	            //Reduce the width of the health bar's inner rectangle by 1 pixel
	            healthBar.outer.width -= 1;
	        } else {
	
	            //Make the explorer fully opaque (non-transparent) if it hasn't been hit
	            explorer.alpha = 1;
	        }
	
	        //Check for a collision between the explorer and the treasure
	        if (hitTestRectangle(explorer, treasure)) {
	
	            //If the treasure is touching the explorer, center it over the explorer
	            treasure.x = explorer.x + 8;
	            treasure.y = explorer.y + 8;
	        }
	
	        //Does the explorer have enough health? If the width of the `innerBar`
	        //is less than zero, end the game and display "You lost!"
	        if (healthBar.outer.width < 0) {
	            state = end;
	            message.text = "You lost!";
	        }
	
	        //If the explorer has brought the treasure to the exit,
	        //end the game and display "You won!"
	        if (hitTestRectangle(treasure, door)) {
	            state = end;
	            message.text = "You won!";
	        }
	    }
	
	    function end() {
	        gameScene.visible = false;
	        gameOverScene.visible = true;
	    }
	
	    /* Helper functions */
	
	    function contain(sprite, container) {
	
	        var collision = undefined;
	
	        //Left
	        if (sprite.x < container.x) {
	            sprite.x = container.x;
	            collision = "left";
	        }
	
	        //Top
	        if (sprite.y < container.y) {
	            sprite.y = container.y;
	            collision = "top";
	        }
	
	        //Right
	        if (sprite.x + sprite.width > container.width) {
	            sprite.x = container.width - sprite.width;
	            collision = "right";
	        }
	
	        //Bottom
	        if (sprite.y + sprite.height > container.height) {
	            sprite.y = container.height - sprite.height;
	            collision = "bottom";
	        }
	
	        //Return the `collision` value
	        return collision;
	    }
	
	    //The `hitTestRectangle` function
	    function hitTestRectangle(r1, r2) {
	
	        //Define the variables we'll need to calculate
	        var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
	
	        //hit will determine whether there's a collision
	        hit = false;
	
	        //Find the center points of each sprite
	        r1.centerX = r1.x + r1.width / 2;
	        r1.centerY = r1.y + r1.height / 2;
	        r2.centerX = r2.x + r2.width / 2;
	        r2.centerY = r2.y + r2.height / 2;
	
	        //Find the half-widths and half-heights of each sprite
	        r1.halfWidth = r1.width / 2;
	        r1.halfHeight = r1.height / 2;
	        r2.halfWidth = r2.width / 2;
	        r2.halfHeight = r2.height / 2;
	
	        //Calculate the distance vector between the sprites
	        vx = r1.centerX - r2.centerX;
	        vy = r1.centerY - r2.centerY;
	
	        //Figure out the combined half-widths and half-heights
	        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	        combinedHalfHeights = r1.halfHeight + r2.halfHeight;
	
	        //Check for a collision on the x axis
	        if (Math.abs(vx) < combinedHalfWidths) {
	
	            //A collision might be occuring. Check for a collision on the y axis
	            if (Math.abs(vy) < combinedHalfHeights) {
	
	                //There's definitely a collision happening
	                hit = true;
	            } else {
	
	                //There's no collision on the y axis
	                hit = false;
	            }
	        } else {
	
	            //There's no collision on the x axis
	            hit = false;
	        }
	
	        //`hit` will be either `true` or `false`
	        return hit;
	    };
	
	    //The `randomInt` helper function
	    function randomInt(min, max) {
	        return Math.floor(Math.random() * (max - min + 1)) + min;
	    }
	
	    //The `keyboard` helper function
	    function keyboard(keyCode) {
	        var key = {};
	        key.code = keyCode;
	        key.isDown = false;
	        key.isUp = true;
	        key.press = undefined;
	        key.release = undefined;
	        //The `downHandler`
	        key.downHandler = function (event) {
	            if (event.keyCode === key.code) {
	                if (key.isUp && key.press) key.press();
	                key.isDown = true;
	                key.isUp = false;
	            }
	            event.preventDefault();
	        };
	
	        //The `upHandler`
	        key.upHandler = function (event) {
	            if (event.keyCode === key.code) {
	                if (key.isDown && key.release) key.release();
	                key.isDown = false;
	                key.isUp = true;
	            }
	            event.preventDefault();
	        };
	
	        //Attach event listeners
	        window.addEventListener("keydown", key.downHandler.bind(key), false);
	        window.addEventListener("keyup", key.upHandler.bind(key), false);
	        return key;
	    }
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*! jQuery v1.11.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
	!function (a, b) {
	    "object" == ( false ? "undefined" : _typeof(module)) && "object" == _typeof(module.exports) ? module.exports = a.document ? b(a, !0) : function (a) {
	        if (!a.document) throw new Error("jQuery requires a window with a document");return b(a);
	    } : b(a);
	}("undefined" != typeof window ? window : undefined, function (a, b) {
	    var c = [],
	        d = c.slice,
	        e = c.concat,
	        f = c.push,
	        g = c.indexOf,
	        h = {},
	        i = h.toString,
	        j = h.hasOwnProperty,
	        k = {},
	        l = "1.11.1",
	        m = function m(a, b) {
	        return new m.fn.init(a, b);
	    },
	        n = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	        o = /^-ms-/,
	        p = /-([\da-z])/gi,
	        q = function q(a, b) {
	        return b.toUpperCase();
	    };m.fn = m.prototype = { jquery: l, constructor: m, selector: "", length: 0, toArray: function toArray() {
	            return d.call(this);
	        }, get: function get(a) {
	            return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this);
	        }, pushStack: function pushStack(a) {
	            var b = m.merge(this.constructor(), a);return b.prevObject = this, b.context = this.context, b;
	        }, each: function each(a, b) {
	            return m.each(this, a, b);
	        }, map: function map(a) {
	            return this.pushStack(m.map(this, function (b, c) {
	                return a.call(b, c, b);
	            }));
	        }, slice: function slice() {
	            return this.pushStack(d.apply(this, arguments));
	        }, first: function first() {
	            return this.eq(0);
	        }, last: function last() {
	            return this.eq(-1);
	        }, eq: function eq(a) {
	            var b = this.length,
	                c = +a + (0 > a ? b : 0);return this.pushStack(c >= 0 && b > c ? [this[c]] : []);
	        }, end: function end() {
	            return this.prevObject || this.constructor(null);
	        }, push: f, sort: c.sort, splice: c.splice }, m.extend = m.fn.extend = function () {
	        var a,
	            b,
	            c,
	            d,
	            e,
	            f,
	            g = arguments[0] || {},
	            h = 1,
	            i = arguments.length,
	            j = !1;for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == (typeof g === "undefined" ? "undefined" : _typeof(g)) || m.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++) {
	            if (null != (e = arguments[h])) for (d in e) {
	                a = g[d], c = e[d], g !== c && (j && c && (m.isPlainObject(c) || (b = m.isArray(c))) ? (b ? (b = !1, f = a && m.isArray(a) ? a : []) : f = a && m.isPlainObject(a) ? a : {}, g[d] = m.extend(j, f, c)) : void 0 !== c && (g[d] = c));
	            }
	        }return g;
	    }, m.extend({ expando: "jQuery" + (l + Math.random()).replace(/\D/g, ""), isReady: !0, error: function error(a) {
	            throw new Error(a);
	        }, noop: function noop() {}, isFunction: function isFunction(a) {
	            return "function" === m.type(a);
	        }, isArray: Array.isArray || function (a) {
	            return "array" === m.type(a);
	        }, isWindow: function isWindow(a) {
	            return null != a && a == a.window;
	        }, isNumeric: function isNumeric(a) {
	            return !m.isArray(a) && a - parseFloat(a) >= 0;
	        }, isEmptyObject: function isEmptyObject(a) {
	            var b;for (b in a) {
	                return !1;
	            }return !0;
	        }, isPlainObject: function isPlainObject(a) {
	            var b;if (!a || "object" !== m.type(a) || a.nodeType || m.isWindow(a)) return !1;try {
	                if (a.constructor && !j.call(a, "constructor") && !j.call(a.constructor.prototype, "isPrototypeOf")) return !1;
	            } catch (c) {
	                return !1;
	            }if (k.ownLast) for (b in a) {
	                return j.call(a, b);
	            }for (b in a) {}return void 0 === b || j.call(a, b);
	        }, type: function type(a) {
	            return null == a ? a + "" : "object" == (typeof a === "undefined" ? "undefined" : _typeof(a)) || "function" == typeof a ? h[i.call(a)] || "object" : typeof a === "undefined" ? "undefined" : _typeof(a);
	        }, globalEval: function globalEval(b) {
	            b && m.trim(b) && (a.execScript || function (b) {
	                a.eval.call(a, b);
	            })(b);
	        }, camelCase: function camelCase(a) {
	            return a.replace(o, "ms-").replace(p, q);
	        }, nodeName: function nodeName(a, b) {
	            return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
	        }, each: function each(a, b, c) {
	            var d,
	                e = 0,
	                f = a.length,
	                g = r(a);if (c) {
	                if (g) {
	                    for (; f > e; e++) {
	                        if (d = b.apply(a[e], c), d === !1) break;
	                    }
	                } else for (e in a) {
	                    if (d = b.apply(a[e], c), d === !1) break;
	                }
	            } else if (g) {
	                for (; f > e; e++) {
	                    if (d = b.call(a[e], e, a[e]), d === !1) break;
	                }
	            } else for (e in a) {
	                if (d = b.call(a[e], e, a[e]), d === !1) break;
	            }return a;
	        }, trim: function trim(a) {
	            return null == a ? "" : (a + "").replace(n, "");
	        }, makeArray: function makeArray(a, b) {
	            var c = b || [];return null != a && (r(Object(a)) ? m.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c;
	        }, inArray: function inArray(a, b, c) {
	            var d;if (b) {
	                if (g) return g.call(b, a, c);for (d = b.length, c = c ? 0 > c ? Math.max(0, d + c) : c : 0; d > c; c++) {
	                    if (c in b && b[c] === a) return c;
	                }
	            }return -1;
	        }, merge: function merge(a, b) {
	            var c = +b.length,
	                d = 0,
	                e = a.length;while (c > d) {
	                a[e++] = b[d++];
	            }if (c !== c) while (void 0 !== b[d]) {
	                a[e++] = b[d++];
	            }return a.length = e, a;
	        }, grep: function grep(a, b, c) {
	            for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) {
	                d = !b(a[f], f), d !== h && e.push(a[f]);
	            }return e;
	        }, map: function map(a, b, c) {
	            var d,
	                f = 0,
	                g = a.length,
	                h = r(a),
	                i = [];if (h) for (; g > f; f++) {
	                d = b(a[f], f, c), null != d && i.push(d);
	            } else for (f in a) {
	                d = b(a[f], f, c), null != d && i.push(d);
	            }return e.apply([], i);
	        }, guid: 1, proxy: function proxy(a, b) {
	            var c, e, f;return "string" == typeof b && (f = a[b], b = a, a = f), m.isFunction(a) ? (c = d.call(arguments, 2), e = function e() {
	                return a.apply(b || this, c.concat(d.call(arguments)));
	            }, e.guid = a.guid = a.guid || m.guid++, e) : void 0;
	        }, now: function now() {
	            return +new Date();
	        }, support: k }), m.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (a, b) {
	        h["[object " + b + "]"] = b.toLowerCase();
	    });function r(a) {
	        var b = a.length,
	            c = m.type(a);return "function" === c || m.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a;
	    }var s = function (a) {
	        var b,
	            c,
	            d,
	            e,
	            f,
	            g,
	            h,
	            i,
	            j,
	            k,
	            l,
	            m,
	            n,
	            o,
	            p,
	            q,
	            r,
	            s,
	            t,
	            u = "sizzle" + -new Date(),
	            v = a.document,
	            w = 0,
	            x = 0,
	            y = gb(),
	            z = gb(),
	            A = gb(),
	            B = function B(a, b) {
	            return a === b && (l = !0), 0;
	        },
	            C = "undefined",
	            D = 1 << 31,
	            E = {}.hasOwnProperty,
	            F = [],
	            G = F.pop,
	            H = F.push,
	            I = F.push,
	            J = F.slice,
	            K = F.indexOf || function (a) {
	            for (var b = 0, c = this.length; c > b; b++) {
	                if (this[b] === a) return b;
	            }return -1;
	        },
	            L = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	            M = "[\\x20\\t\\r\\n\\f]",
	            N = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
	            O = N.replace("w", "w#"),
	            P = "\\[" + M + "*(" + N + ")(?:" + M + "*([*^$|!~]?=)" + M + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + O + "))|)" + M + "*\\]",
	            Q = ":(" + N + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + P + ")*)|.*)\\)|)",
	            R = new RegExp("^" + M + "+|((?:^|[^\\\\])(?:\\\\.)*)" + M + "+$", "g"),
	            S = new RegExp("^" + M + "*," + M + "*"),
	            T = new RegExp("^" + M + "*([>+~]|" + M + ")" + M + "*"),
	            U = new RegExp("=" + M + "*([^\\]'\"]*?)" + M + "*\\]", "g"),
	            V = new RegExp(Q),
	            W = new RegExp("^" + O + "$"),
	            X = { ID: new RegExp("^#(" + N + ")"), CLASS: new RegExp("^\\.(" + N + ")"), TAG: new RegExp("^(" + N.replace("w", "w*") + ")"), ATTR: new RegExp("^" + P), PSEUDO: new RegExp("^" + Q), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + M + "*(even|odd|(([+-]|)(\\d*)n|)" + M + "*(?:([+-]|)" + M + "*(\\d+)|))" + M + "*\\)|)", "i"), bool: new RegExp("^(?:" + L + ")$", "i"), needsContext: new RegExp("^" + M + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + M + "*((?:-\\d)?\\d*)" + M + "*\\)|)(?=[^-]|$)", "i") },
	            Y = /^(?:input|select|textarea|button)$/i,
	            Z = /^h\d$/i,
	            $ = /^[^{]+\{\s*\[native \w/,
	            _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
	            ab = /[+~]/,
	            bb = /'|\\/g,
	            cb = new RegExp("\\\\([\\da-f]{1,6}" + M + "?|(" + M + ")|.)", "ig"),
	            db = function db(a, b, c) {
	            var d = "0x" + b - 65536;return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320);
	        };try {
	            I.apply(F = J.call(v.childNodes), v.childNodes), F[v.childNodes.length].nodeType;
	        } catch (eb) {
	            I = { apply: F.length ? function (a, b) {
	                    H.apply(a, J.call(b));
	                } : function (a, b) {
	                    var c = a.length,
	                        d = 0;while (a[c++] = b[d++]) {}a.length = c - 1;
	                } };
	        }function fb(a, b, d, e) {
	            var f, h, j, k, l, o, r, s, w, x;if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], !a || "string" != typeof a) return d;if (1 !== (k = b.nodeType) && 9 !== k) return [];if (p && !e) {
	                if (f = _.exec(a)) if (j = f[1]) {
	                    if (9 === k) {
	                        if (h = b.getElementById(j), !h || !h.parentNode) return d;if (h.id === j) return d.push(h), d;
	                    } else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j) return d.push(h), d;
	                } else {
	                    if (f[2]) return I.apply(d, b.getElementsByTagName(a)), d;if ((j = f[3]) && c.getElementsByClassName && b.getElementsByClassName) return I.apply(d, b.getElementsByClassName(j)), d;
	                }if (c.qsa && (!q || !q.test(a))) {
	                    if (s = r = u, w = b, x = 9 === k && a, 1 === k && "object" !== b.nodeName.toLowerCase()) {
	                        o = g(a), (r = b.getAttribute("id")) ? s = r.replace(bb, "\\$&") : b.setAttribute("id", s), s = "[id='" + s + "'] ", l = o.length;while (l--) {
	                            o[l] = s + qb(o[l]);
	                        }w = ab.test(a) && ob(b.parentNode) || b, x = o.join(",");
	                    }if (x) try {
	                        return I.apply(d, w.querySelectorAll(x)), d;
	                    } catch (y) {} finally {
	                        r || b.removeAttribute("id");
	                    }
	                }
	            }return i(a.replace(R, "$1"), b, d, e);
	        }function gb() {
	            var a = [];function b(c, e) {
	                return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e;
	            }return b;
	        }function hb(a) {
	            return a[u] = !0, a;
	        }function ib(a) {
	            var b = n.createElement("div");try {
	                return !!a(b);
	            } catch (c) {
	                return !1;
	            } finally {
	                b.parentNode && b.parentNode.removeChild(b), b = null;
	            }
	        }function jb(a, b) {
	            var c = a.split("|"),
	                e = a.length;while (e--) {
	                d.attrHandle[c[e]] = b;
	            }
	        }function kb(a, b) {
	            var c = b && a,
	                d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || D) - (~a.sourceIndex || D);if (d) return d;if (c) while (c = c.nextSibling) {
	                if (c === b) return -1;
	            }return a ? 1 : -1;
	        }function lb(a) {
	            return function (b) {
	                var c = b.nodeName.toLowerCase();return "input" === c && b.type === a;
	            };
	        }function mb(a) {
	            return function (b) {
	                var c = b.nodeName.toLowerCase();return ("input" === c || "button" === c) && b.type === a;
	            };
	        }function nb(a) {
	            return hb(function (b) {
	                return b = +b, hb(function (c, d) {
	                    var e,
	                        f = a([], c.length, b),
	                        g = f.length;while (g--) {
	                        c[e = f[g]] && (c[e] = !(d[e] = c[e]));
	                    }
	                });
	            });
	        }function ob(a) {
	            return a && _typeof(a.getElementsByTagName) !== C && a;
	        }c = fb.support = {}, f = fb.isXML = function (a) {
	            var b = a && (a.ownerDocument || a).documentElement;return b ? "HTML" !== b.nodeName : !1;
	        }, m = fb.setDocument = function (a) {
	            var b,
	                e = a ? a.ownerDocument || a : v,
	                g = e.defaultView;return e !== n && 9 === e.nodeType && e.documentElement ? (n = e, o = e.documentElement, p = !f(e), g && g !== g.top && (g.addEventListener ? g.addEventListener("unload", function () {
	                m();
	            }, !1) : g.attachEvent && g.attachEvent("onunload", function () {
	                m();
	            })), c.attributes = ib(function (a) {
	                return a.className = "i", !a.getAttribute("className");
	            }), c.getElementsByTagName = ib(function (a) {
	                return a.appendChild(e.createComment("")), !a.getElementsByTagName("*").length;
	            }), c.getElementsByClassName = $.test(e.getElementsByClassName) && ib(function (a) {
	                return a.innerHTML = "<div class='a'></div><div class='a i'></div>", a.firstChild.className = "i", 2 === a.getElementsByClassName("i").length;
	            }), c.getById = ib(function (a) {
	                return o.appendChild(a).id = u, !e.getElementsByName || !e.getElementsByName(u).length;
	            }), c.getById ? (d.find.ID = function (a, b) {
	                if (_typeof(b.getElementById) !== C && p) {
	                    var c = b.getElementById(a);return c && c.parentNode ? [c] : [];
	                }
	            }, d.filter.ID = function (a) {
	                var b = a.replace(cb, db);return function (a) {
	                    return a.getAttribute("id") === b;
	                };
	            }) : (delete d.find.ID, d.filter.ID = function (a) {
	                var b = a.replace(cb, db);return function (a) {
	                    var c = _typeof(a.getAttributeNode) !== C && a.getAttributeNode("id");return c && c.value === b;
	                };
	            }), d.find.TAG = c.getElementsByTagName ? function (a, b) {
	                return _typeof(b.getElementsByTagName) !== C ? b.getElementsByTagName(a) : void 0;
	            } : function (a, b) {
	                var c,
	                    d = [],
	                    e = 0,
	                    f = b.getElementsByTagName(a);if ("*" === a) {
	                    while (c = f[e++]) {
	                        1 === c.nodeType && d.push(c);
	                    }return d;
	                }return f;
	            }, d.find.CLASS = c.getElementsByClassName && function (a, b) {
	                return _typeof(b.getElementsByClassName) !== C && p ? b.getElementsByClassName(a) : void 0;
	            }, r = [], q = [], (c.qsa = $.test(e.querySelectorAll)) && (ib(function (a) {
	                a.innerHTML = "<select msallowclip=''><option selected=''></option></select>", a.querySelectorAll("[msallowclip^='']").length && q.push("[*^$]=" + M + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + M + "*(?:value|" + L + ")"), a.querySelectorAll(":checked").length || q.push(":checked");
	            }), ib(function (a) {
	                var b = e.createElement("input");b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + M + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:");
	            })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ib(function (a) {
	                c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", Q);
	            }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function (a, b) {
	                var c = 9 === a.nodeType ? a.documentElement : a,
	                    d = b && b.parentNode;return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)));
	            } : function (a, b) {
	                if (b) while (b = b.parentNode) {
	                    if (b === a) return !0;
	                }return !1;
	            }, B = b ? function (a, b) {
	                if (a === b) return l = !0, 0;var d = !a.compareDocumentPosition - !b.compareDocumentPosition;return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === e || a.ownerDocument === v && t(v, a) ? -1 : b === e || b.ownerDocument === v && t(v, b) ? 1 : k ? K.call(k, a) - K.call(k, b) : 0 : 4 & d ? -1 : 1);
	            } : function (a, b) {
	                if (a === b) return l = !0, 0;var c,
	                    d = 0,
	                    f = a.parentNode,
	                    g = b.parentNode,
	                    h = [a],
	                    i = [b];if (!f || !g) return a === e ? -1 : b === e ? 1 : f ? -1 : g ? 1 : k ? K.call(k, a) - K.call(k, b) : 0;if (f === g) return kb(a, b);c = a;while (c = c.parentNode) {
	                    h.unshift(c);
	                }c = b;while (c = c.parentNode) {
	                    i.unshift(c);
	                }while (h[d] === i[d]) {
	                    d++;
	                }return d ? kb(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0;
	            }, e) : n;
	        }, fb.matches = function (a, b) {
	            return fb(a, null, null, b);
	        }, fb.matchesSelector = function (a, b) {
	            if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, "='$1']"), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b))) try {
	                var d = s.call(a, b);if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d;
	            } catch (e) {}return fb(b, n, null, [a]).length > 0;
	        }, fb.contains = function (a, b) {
	            return (a.ownerDocument || a) !== n && m(a), t(a, b);
	        }, fb.attr = function (a, b) {
	            (a.ownerDocument || a) !== n && m(a);var e = d.attrHandle[b.toLowerCase()],
	                f = e && E.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null;
	        }, fb.error = function (a) {
	            throw new Error("Syntax error, unrecognized expression: " + a);
	        }, fb.uniqueSort = function (a) {
	            var b,
	                d = [],
	                e = 0,
	                f = 0;if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
	                while (b = a[f++]) {
	                    b === a[f] && (e = d.push(f));
	                }while (e--) {
	                    a.splice(d[e], 1);
	                }
	            }return k = null, a;
	        }, e = fb.getText = function (a) {
	            var b,
	                c = "",
	                d = 0,
	                f = a.nodeType;if (f) {
	                if (1 === f || 9 === f || 11 === f) {
	                    if ("string" == typeof a.textContent) return a.textContent;for (a = a.firstChild; a; a = a.nextSibling) {
	                        c += e(a);
	                    }
	                } else if (3 === f || 4 === f) return a.nodeValue;
	            } else while (b = a[d++]) {
	                c += e(b);
	            }return c;
	        }, d = fb.selectors = { cacheLength: 50, createPseudo: hb, match: X, attrHandle: {}, find: {}, relative: { ">": { dir: "parentNode", first: !0 }, " ": { dir: "parentNode" }, "+": { dir: "previousSibling", first: !0 }, "~": { dir: "previousSibling" } }, preFilter: { ATTR: function ATTR(a) {
	                    return a[1] = a[1].replace(cb, db), a[3] = (a[3] || a[4] || a[5] || "").replace(cb, db), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4);
	                }, CHILD: function CHILD(a) {
	                    return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || fb.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && fb.error(a[0]), a;
	                }, PSEUDO: function PSEUDO(a) {
	                    var b,
	                        c = !a[6] && a[2];return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3));
	                } }, filter: { TAG: function TAG(a) {
	                    var b = a.replace(cb, db).toLowerCase();return "*" === a ? function () {
	                        return !0;
	                    } : function (a) {
	                        return a.nodeName && a.nodeName.toLowerCase() === b;
	                    };
	                }, CLASS: function CLASS(a) {
	                    var b = y[a + " "];return b || (b = new RegExp("(^|" + M + ")" + a + "(" + M + "|$)")) && y(a, function (a) {
	                        return b.test("string" == typeof a.className && a.className || _typeof(a.getAttribute) !== C && a.getAttribute("class") || "");
	                    });
	                }, ATTR: function ATTR(a, b, c) {
	                    return function (d) {
	                        var e = fb.attr(d, a);return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0;
	                    };
	                }, CHILD: function CHILD(a, b, c, d, e) {
	                    var f = "nth" !== a.slice(0, 3),
	                        g = "last" !== a.slice(-4),
	                        h = "of-type" === b;return 1 === d && 0 === e ? function (a) {
	                        return !!a.parentNode;
	                    } : function (b, c, i) {
	                        var j,
	                            k,
	                            l,
	                            m,
	                            n,
	                            o,
	                            p = f !== g ? "nextSibling" : "previousSibling",
	                            q = b.parentNode,
	                            r = h && b.nodeName.toLowerCase(),
	                            s = !i && !h;if (q) {
	                            if (f) {
	                                while (p) {
	                                    l = b;while (l = l[p]) {
	                                        if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;
	                                    }o = p = "only" === a && !o && "nextSibling";
	                                }return !0;
	                            }if (o = [g ? q.firstChild : q.lastChild], g && s) {
	                                k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], l = n && q.childNodes[n];while (l = ++n && l && l[p] || (m = n = 0) || o.pop()) {
	                                    if (1 === l.nodeType && ++m && l === b) {
	                                        k[a] = [w, n, m];break;
	                                    }
	                                }
	                            } else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w) m = j[1];else while (l = ++n && l && l[p] || (m = n = 0) || o.pop()) {
	                                if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (s && ((l[u] || (l[u] = {}))[a] = [w, m]), l === b)) break;
	                            }return m -= e, m === d || m % d === 0 && m / d >= 0;
	                        }
	                    };
	                }, PSEUDO: function PSEUDO(a, b) {
	                    var c,
	                        e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || fb.error("unsupported pseudo: " + a);return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? hb(function (a, c) {
	                        var d,
	                            f = e(a, b),
	                            g = f.length;while (g--) {
	                            d = K.call(a, f[g]), a[d] = !(c[d] = f[g]);
	                        }
	                    }) : function (a) {
	                        return e(a, 0, c);
	                    }) : e;
	                } }, pseudos: { not: hb(function (a) {
	                    var b = [],
	                        c = [],
	                        d = h(a.replace(R, "$1"));return d[u] ? hb(function (a, b, c, e) {
	                        var f,
	                            g = d(a, null, e, []),
	                            h = a.length;while (h--) {
	                            (f = g[h]) && (a[h] = !(b[h] = f));
	                        }
	                    }) : function (a, e, f) {
	                        return b[0] = a, d(b, null, f, c), !c.pop();
	                    };
	                }), has: hb(function (a) {
	                    return function (b) {
	                        return fb(a, b).length > 0;
	                    };
	                }), contains: hb(function (a) {
	                    return function (b) {
	                        return (b.textContent || b.innerText || e(b)).indexOf(a) > -1;
	                    };
	                }), lang: hb(function (a) {
	                    return W.test(a || "") || fb.error("unsupported lang: " + a), a = a.replace(cb, db).toLowerCase(), function (b) {
	                        var c;do {
	                            if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-");
	                        } while ((b = b.parentNode) && 1 === b.nodeType);return !1;
	                    };
	                }), target: function target(b) {
	                    var c = a.location && a.location.hash;return c && c.slice(1) === b.id;
	                }, root: function root(a) {
	                    return a === o;
	                }, focus: function focus(a) {
	                    return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex);
	                }, enabled: function enabled(a) {
	                    return a.disabled === !1;
	                }, disabled: function disabled(a) {
	                    return a.disabled === !0;
	                }, checked: function checked(a) {
	                    var b = a.nodeName.toLowerCase();return "input" === b && !!a.checked || "option" === b && !!a.selected;
	                }, selected: function selected(a) {
	                    return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
	                }, empty: function empty(a) {
	                    for (a = a.firstChild; a; a = a.nextSibling) {
	                        if (a.nodeType < 6) return !1;
	                    }return !0;
	                }, parent: function parent(a) {
	                    return !d.pseudos.empty(a);
	                }, header: function header(a) {
	                    return Z.test(a.nodeName);
	                }, input: function input(a) {
	                    return Y.test(a.nodeName);
	                }, button: function button(a) {
	                    var b = a.nodeName.toLowerCase();return "input" === b && "button" === a.type || "button" === b;
	                }, text: function text(a) {
	                    var b;return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase());
	                }, first: nb(function () {
	                    return [0];
	                }), last: nb(function (a, b) {
	                    return [b - 1];
	                }), eq: nb(function (a, b, c) {
	                    return [0 > c ? c + b : c];
	                }), even: nb(function (a, b) {
	                    for (var c = 0; b > c; c += 2) {
	                        a.push(c);
	                    }return a;
	                }), odd: nb(function (a, b) {
	                    for (var c = 1; b > c; c += 2) {
	                        a.push(c);
	                    }return a;
	                }), lt: nb(function (a, b, c) {
	                    for (var d = 0 > c ? c + b : c; --d >= 0;) {
	                        a.push(d);
	                    }return a;
	                }), gt: nb(function (a, b, c) {
	                    for (var d = 0 > c ? c + b : c; ++d < b;) {
	                        a.push(d);
	                    }return a;
	                }) } }, d.pseudos.nth = d.pseudos.eq;for (b in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }) {
	            d.pseudos[b] = lb(b);
	        }for (b in { submit: !0, reset: !0 }) {
	            d.pseudos[b] = mb(b);
	        }function pb() {}pb.prototype = d.filters = d.pseudos, d.setFilters = new pb(), g = fb.tokenize = function (a, b) {
	            var c,
	                e,
	                f,
	                g,
	                h,
	                i,
	                j,
	                k = z[a + " "];if (k) return b ? 0 : k.slice(0);h = a, i = [], j = d.preFilter;while (h) {
	                (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({ value: c, type: e[0].replace(R, " ") }), h = h.slice(c.length));for (g in d.filter) {
	                    !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({ value: c, type: g, matches: e }), h = h.slice(c.length));
	                }if (!c) break;
	            }return b ? h.length : h ? fb.error(a) : z(a, i).slice(0);
	        };function qb(a) {
	            for (var b = 0, c = a.length, d = ""; c > b; b++) {
	                d += a[b].value;
	            }return d;
	        }function rb(a, b, c) {
	            var d = b.dir,
	                e = c && "parentNode" === d,
	                f = x++;return b.first ? function (b, c, f) {
	                while (b = b[d]) {
	                    if (1 === b.nodeType || e) return a(b, c, f);
	                }
	            } : function (b, c, g) {
	                var h,
	                    i,
	                    j = [w, f];if (g) {
	                    while (b = b[d]) {
	                        if ((1 === b.nodeType || e) && a(b, c, g)) return !0;
	                    }
	                } else while (b = b[d]) {
	                    if (1 === b.nodeType || e) {
	                        if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f) return j[2] = h[2];if (i[d] = j, j[2] = a(b, c, g)) return !0;
	                    }
	                }
	            };
	        }function sb(a) {
	            return a.length > 1 ? function (b, c, d) {
	                var e = a.length;while (e--) {
	                    if (!a[e](b, c, d)) return !1;
	                }return !0;
	            } : a[0];
	        }function tb(a, b, c) {
	            for (var d = 0, e = b.length; e > d; d++) {
	                fb(a, b[d], c);
	            }return c;
	        }function ub(a, b, c, d, e) {
	            for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++) {
	                (f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));
	            }return g;
	        }function vb(a, b, c, d, e, f) {
	            return d && !d[u] && (d = vb(d)), e && !e[u] && (e = vb(e, f)), hb(function (f, g, h, i) {
	                var j,
	                    k,
	                    l,
	                    m = [],
	                    n = [],
	                    o = g.length,
	                    p = f || tb(b || "*", h.nodeType ? [h] : h, []),
	                    q = !a || !f && b ? p : ub(p, m, a, h, i),
	                    r = c ? e || (f ? a : o || d) ? [] : g : q;if (c && c(q, r, h, i), d) {
	                    j = ub(r, n), d(j, [], h, i), k = j.length;while (k--) {
	                        (l = j[k]) && (r[n[k]] = !(q[n[k]] = l));
	                    }
	                }if (f) {
	                    if (e || a) {
	                        if (e) {
	                            j = [], k = r.length;while (k--) {
	                                (l = r[k]) && j.push(q[k] = l);
	                            }e(null, r = [], j, i);
	                        }k = r.length;while (k--) {
	                            (l = r[k]) && (j = e ? K.call(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l));
	                        }
	                    }
	                } else r = ub(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : I.apply(g, r);
	            });
	        }function wb(a) {
	            for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = rb(function (a) {
	                return a === b;
	            }, h, !0), l = rb(function (a) {
	                return K.call(b, a) > -1;
	            }, h, !0), m = [function (a, c, d) {
	                return !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
	            }]; f > i; i++) {
	                if (c = d.relative[a[i].type]) m = [rb(sb(m), c)];else {
	                    if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
	                        for (e = ++i; f > e; e++) {
	                            if (d.relative[a[e].type]) break;
	                        }return vb(i > 1 && sb(m), i > 1 && qb(a.slice(0, i - 1).concat({ value: " " === a[i - 2].type ? "*" : "" })).replace(R, "$1"), c, e > i && wb(a.slice(i, e)), f > e && wb(a = a.slice(e)), f > e && qb(a));
	                    }m.push(c);
	                }
	            }return sb(m);
	        }function xb(a, b) {
	            var c = b.length > 0,
	                e = a.length > 0,
	                f = function f(_f, g, h, i, k) {
	                var l,
	                    m,
	                    o,
	                    p = 0,
	                    q = "0",
	                    r = _f && [],
	                    s = [],
	                    t = j,
	                    u = _f || e && d.find.TAG("*", k),
	                    v = w += null == t ? 1 : Math.random() || .1,
	                    x = u.length;for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) {
	                    if (e && l) {
	                        m = 0;while (o = a[m++]) {
	                            if (o(l, g, h)) {
	                                i.push(l);break;
	                            }
	                        }k && (w = v);
	                    }c && ((l = !o && l) && p--, _f && r.push(l));
	                }if (p += q, c && q !== p) {
	                    m = 0;while (o = b[m++]) {
	                        o(r, s, g, h);
	                    }if (_f) {
	                        if (p > 0) while (q--) {
	                            r[q] || s[q] || (s[q] = G.call(i));
	                        }s = ub(s);
	                    }I.apply(i, s), k && !_f && s.length > 0 && p + b.length > 1 && fb.uniqueSort(i);
	                }return k && (w = v, j = t), r;
	            };return c ? hb(f) : f;
	        }return h = fb.compile = function (a, b) {
	            var c,
	                d = [],
	                e = [],
	                f = A[a + " "];if (!f) {
	                b || (b = g(a)), c = b.length;while (c--) {
	                    f = wb(b[c]), f[u] ? d.push(f) : e.push(f);
	                }f = A(a, xb(e, d)), f.selector = a;
	            }return f;
	        }, i = fb.select = function (a, b, e, f) {
	            var i,
	                j,
	                k,
	                l,
	                m,
	                n = "function" == typeof a && a,
	                o = !f && g(a = n.selector || a);if (e = e || [], 1 === o.length) {
	                if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
	                    if (b = (d.find.ID(k.matches[0].replace(cb, db), b) || [])[0], !b) return e;n && (b = b.parentNode), a = a.slice(j.shift().value.length);
	                }i = X.needsContext.test(a) ? 0 : j.length;while (i--) {
	                    if (k = j[i], d.relative[l = k.type]) break;if ((m = d.find[l]) && (f = m(k.matches[0].replace(cb, db), ab.test(j[0].type) && ob(b.parentNode) || b))) {
	                        if (j.splice(i, 1), a = f.length && qb(j), !a) return I.apply(e, f), e;break;
	                    }
	                }
	            }return (n || h(a, o))(f, b, !p, e, ab.test(a) && ob(b.parentNode) || b), e;
	        }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ib(function (a) {
	            return 1 & a.compareDocumentPosition(n.createElement("div"));
	        }), ib(function (a) {
	            return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href");
	        }) || jb("type|href|height|width", function (a, b, c) {
	            return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2);
	        }), c.attributes && ib(function (a) {
	            return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value");
	        }) || jb("value", function (a, b, c) {
	            return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue;
	        }), ib(function (a) {
	            return null == a.getAttribute("disabled");
	        }) || jb(L, function (a, b, c) {
	            var d;return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null;
	        }), fb;
	    }(a);m.find = s, m.expr = s.selectors, m.expr[":"] = m.expr.pseudos, m.unique = s.uniqueSort, m.text = s.getText, m.isXMLDoc = s.isXML, m.contains = s.contains;var t = m.expr.match.needsContext,
	        u = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
	        v = /^.[^:#\[\.,]*$/;function w(a, b, c) {
	        if (m.isFunction(b)) return m.grep(a, function (a, d) {
	            return !!b.call(a, d, a) !== c;
	        });if (b.nodeType) return m.grep(a, function (a) {
	            return a === b !== c;
	        });if ("string" == typeof b) {
	            if (v.test(b)) return m.filter(b, a, c);b = m.filter(b, a);
	        }return m.grep(a, function (a) {
	            return m.inArray(a, b) >= 0 !== c;
	        });
	    }m.filter = function (a, b, c) {
	        var d = b[0];return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? m.find.matchesSelector(d, a) ? [d] : [] : m.find.matches(a, m.grep(b, function (a) {
	            return 1 === a.nodeType;
	        }));
	    }, m.fn.extend({ find: function find(a) {
	            var b,
	                c = [],
	                d = this,
	                e = d.length;if ("string" != typeof a) return this.pushStack(m(a).filter(function () {
	                for (b = 0; e > b; b++) {
	                    if (m.contains(d[b], this)) return !0;
	                }
	            }));for (b = 0; e > b; b++) {
	                m.find(a, d[b], c);
	            }return c = this.pushStack(e > 1 ? m.unique(c) : c), c.selector = this.selector ? this.selector + " " + a : a, c;
	        }, filter: function filter(a) {
	            return this.pushStack(w(this, a || [], !1));
	        }, not: function not(a) {
	            return this.pushStack(w(this, a || [], !0));
	        }, is: function is(a) {
	            return !!w(this, "string" == typeof a && t.test(a) ? m(a) : a || [], !1).length;
	        } });var x,
	        y = a.document,
	        z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	        A = m.fn.init = function (a, b) {
	        var c, d;if (!a) return this;if ("string" == typeof a) {
	            if (c = "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? [null, a, null] : z.exec(a), !c || !c[1] && b) return !b || b.jquery ? (b || x).find(a) : this.constructor(b).find(a);if (c[1]) {
	                if (b = b instanceof m ? b[0] : b, m.merge(this, m.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : y, !0)), u.test(c[1]) && m.isPlainObject(b)) for (c in b) {
	                    m.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
	                }return this;
	            }if (d = y.getElementById(c[2]), d && d.parentNode) {
	                if (d.id !== c[2]) return x.find(a);this.length = 1, this[0] = d;
	            }return this.context = y, this.selector = a, this;
	        }return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : m.isFunction(a) ? "undefined" != typeof x.ready ? x.ready(a) : a(m) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), m.makeArray(a, this));
	    };A.prototype = m.fn, x = m(y);var B = /^(?:parents|prev(?:Until|All))/,
	        C = { children: !0, contents: !0, next: !0, prev: !0 };m.extend({ dir: function dir(a, b, c) {
	            var d = [],
	                e = a[b];while (e && 9 !== e.nodeType && (void 0 === c || 1 !== e.nodeType || !m(e).is(c))) {
	                1 === e.nodeType && d.push(e), e = e[b];
	            }return d;
	        }, sibling: function sibling(a, b) {
	            for (var c = []; a; a = a.nextSibling) {
	                1 === a.nodeType && a !== b && c.push(a);
	            }return c;
	        } }), m.fn.extend({ has: function has(a) {
	            var b,
	                c = m(a, this),
	                d = c.length;return this.filter(function () {
	                for (b = 0; d > b; b++) {
	                    if (m.contains(this, c[b])) return !0;
	                }
	            });
	        }, closest: function closest(a, b) {
	            for (var c, d = 0, e = this.length, f = [], g = t.test(a) || "string" != typeof a ? m(a, b || this.context) : 0; e > d; d++) {
	                for (c = this[d]; c && c !== b; c = c.parentNode) {
	                    if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && m.find.matchesSelector(c, a))) {
	                        f.push(c);break;
	                    }
	                }
	            }return this.pushStack(f.length > 1 ? m.unique(f) : f);
	        }, index: function index(a) {
	            return a ? "string" == typeof a ? m.inArray(this[0], m(a)) : m.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
	        }, add: function add(a, b) {
	            return this.pushStack(m.unique(m.merge(this.get(), m(a, b))));
	        }, addBack: function addBack(a) {
	            return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
	        } });function D(a, b) {
	        do {
	            a = a[b];
	        } while (a && 1 !== a.nodeType);return a;
	    }m.each({ parent: function parent(a) {
	            var b = a.parentNode;return b && 11 !== b.nodeType ? b : null;
	        }, parents: function parents(a) {
	            return m.dir(a, "parentNode");
	        }, parentsUntil: function parentsUntil(a, b, c) {
	            return m.dir(a, "parentNode", c);
	        }, next: function next(a) {
	            return D(a, "nextSibling");
	        }, prev: function prev(a) {
	            return D(a, "previousSibling");
	        }, nextAll: function nextAll(a) {
	            return m.dir(a, "nextSibling");
	        }, prevAll: function prevAll(a) {
	            return m.dir(a, "previousSibling");
	        }, nextUntil: function nextUntil(a, b, c) {
	            return m.dir(a, "nextSibling", c);
	        }, prevUntil: function prevUntil(a, b, c) {
	            return m.dir(a, "previousSibling", c);
	        }, siblings: function siblings(a) {
	            return m.sibling((a.parentNode || {}).firstChild, a);
	        }, children: function children(a) {
	            return m.sibling(a.firstChild);
	        }, contents: function contents(a) {
	            return m.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : m.merge([], a.childNodes);
	        } }, function (a, b) {
	        m.fn[a] = function (c, d) {
	            var e = m.map(this, b, c);return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = m.filter(d, e)), this.length > 1 && (C[a] || (e = m.unique(e)), B.test(a) && (e = e.reverse())), this.pushStack(e);
	        };
	    });var E = /\S+/g,
	        F = {};function G(a) {
	        var b = F[a] = {};return m.each(a.match(E) || [], function (a, c) {
	            b[c] = !0;
	        }), b;
	    }m.Callbacks = function (a) {
	        a = "string" == typeof a ? F[a] || G(a) : m.extend({}, a);var b,
	            c,
	            d,
	            e,
	            f,
	            g,
	            h = [],
	            i = !a.once && [],
	            j = function j(l) {
	            for (c = a.memory && l, d = !0, f = g || 0, g = 0, e = h.length, b = !0; h && e > f; f++) {
	                if (h[f].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
	                    c = !1;break;
	                }
	            }b = !1, h && (i ? i.length && j(i.shift()) : c ? h = [] : k.disable());
	        },
	            k = { add: function add() {
	                if (h) {
	                    var d = h.length;!function f(b) {
	                        m.each(b, function (b, c) {
	                            var d = m.type(c);"function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && f(c);
	                        });
	                    }(arguments), b ? e = h.length : c && (g = d, j(c));
	                }return this;
	            }, remove: function remove() {
	                return h && m.each(arguments, function (a, c) {
	                    var d;while ((d = m.inArray(c, h, d)) > -1) {
	                        h.splice(d, 1), b && (e >= d && e--, f >= d && f--);
	                    }
	                }), this;
	            }, has: function has(a) {
	                return a ? m.inArray(a, h) > -1 : !(!h || !h.length);
	            }, empty: function empty() {
	                return h = [], e = 0, this;
	            }, disable: function disable() {
	                return h = i = c = void 0, this;
	            }, disabled: function disabled() {
	                return !h;
	            }, lock: function lock() {
	                return i = void 0, c || k.disable(), this;
	            }, locked: function locked() {
	                return !i;
	            }, fireWith: function fireWith(a, c) {
	                return !h || d && !i || (c = c || [], c = [a, c.slice ? c.slice() : c], b ? i.push(c) : j(c)), this;
	            }, fire: function fire() {
	                return k.fireWith(this, arguments), this;
	            }, fired: function fired() {
	                return !!d;
	            } };return k;
	    }, m.extend({ Deferred: function Deferred(a) {
	            var b = [["resolve", "done", m.Callbacks("once memory"), "resolved"], ["reject", "fail", m.Callbacks("once memory"), "rejected"], ["notify", "progress", m.Callbacks("memory")]],
	                c = "pending",
	                d = { state: function state() {
	                    return c;
	                }, always: function always() {
	                    return e.done(arguments).fail(arguments), this;
	                }, then: function then() {
	                    var a = arguments;return m.Deferred(function (c) {
	                        m.each(b, function (b, f) {
	                            var g = m.isFunction(a[b]) && a[b];e[f[1]](function () {
	                                var a = g && g.apply(this, arguments);a && m.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments);
	                            });
	                        }), a = null;
	                    }).promise();
	                }, promise: function promise(a) {
	                    return null != a ? m.extend(a, d) : d;
	                } },
	                e = {};return d.pipe = d.then, m.each(b, function (a, f) {
	                var g = f[2],
	                    h = f[3];d[f[1]] = g.add, h && g.add(function () {
	                    c = h;
	                }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () {
	                    return e[f[0] + "With"](this === e ? d : this, arguments), this;
	                }, e[f[0] + "With"] = g.fireWith;
	            }), d.promise(e), a && a.call(e, e), e;
	        }, when: function when(a) {
	            var b = 0,
	                c = d.call(arguments),
	                e = c.length,
	                f = 1 !== e || a && m.isFunction(a.promise) ? e : 0,
	                g = 1 === f ? a : m.Deferred(),
	                h = function h(a, b, c) {
	                return function (e) {
	                    b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c);
	                };
	            },
	                i,
	                j,
	                k;if (e > 1) for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++) {
	                c[b] && m.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;
	            }return f || g.resolveWith(k, c), g.promise();
	        } });var H;m.fn.ready = function (a) {
	        return m.ready.promise().done(a), this;
	    }, m.extend({ isReady: !1, readyWait: 1, holdReady: function holdReady(a) {
	            a ? m.readyWait++ : m.ready(!0);
	        }, ready: function ready(a) {
	            if (a === !0 ? ! --m.readyWait : !m.isReady) {
	                if (!y.body) return setTimeout(m.ready);m.isReady = !0, a !== !0 && --m.readyWait > 0 || (H.resolveWith(y, [m]), m.fn.triggerHandler && (m(y).triggerHandler("ready"), m(y).off("ready")));
	            }
	        } });function I() {
	        y.addEventListener ? (y.removeEventListener("DOMContentLoaded", J, !1), a.removeEventListener("load", J, !1)) : (y.detachEvent("onreadystatechange", J), a.detachEvent("onload", J));
	    }function J() {
	        (y.addEventListener || "load" === event.type || "complete" === y.readyState) && (I(), m.ready());
	    }m.ready.promise = function (b) {
	        if (!H) if (H = m.Deferred(), "complete" === y.readyState) setTimeout(m.ready);else if (y.addEventListener) y.addEventListener("DOMContentLoaded", J, !1), a.addEventListener("load", J, !1);else {
	            y.attachEvent("onreadystatechange", J), a.attachEvent("onload", J);var c = !1;try {
	                c = null == a.frameElement && y.documentElement;
	            } catch (d) {}c && c.doScroll && !function e() {
	                if (!m.isReady) {
	                    try {
	                        c.doScroll("left");
	                    } catch (a) {
	                        return setTimeout(e, 50);
	                    }I(), m.ready();
	                }
	            }();
	        }return H.promise(b);
	    };var K = "undefined",
	        L;for (L in m(k)) {
	        break;
	    }k.ownLast = "0" !== L, k.inlineBlockNeedsLayout = !1, m(function () {
	        var a, b, c, d;c = y.getElementsByTagName("body")[0], c && c.style && (b = y.createElement("div"), d = y.createElement("div"), d.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", c.appendChild(d).appendChild(b), _typeof(b.style.zoom) !== K && (b.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1", k.inlineBlockNeedsLayout = a = 3 === b.offsetWidth, a && (c.style.zoom = 1)), c.removeChild(d));
	    }), function () {
	        var a = y.createElement("div");if (null == k.deleteExpando) {
	            k.deleteExpando = !0;try {
	                delete a.test;
	            } catch (b) {
	                k.deleteExpando = !1;
	            }
	        }a = null;
	    }(), m.acceptData = function (a) {
	        var b = m.noData[(a.nodeName + " ").toLowerCase()],
	            c = +a.nodeType || 1;return 1 !== c && 9 !== c ? !1 : !b || b !== !0 && a.getAttribute("classid") === b;
	    };var M = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	        N = /([A-Z])/g;function O(a, b, c) {
	        if (void 0 === c && 1 === a.nodeType) {
	            var d = "data-" + b.replace(N, "-$1").toLowerCase();if (c = a.getAttribute(d), "string" == typeof c) {
	                try {
	                    c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : M.test(c) ? m.parseJSON(c) : c;
	                } catch (e) {}m.data(a, b, c);
	            } else c = void 0;
	        }return c;
	    }function P(a) {
	        var b;for (b in a) {
	            if (("data" !== b || !m.isEmptyObject(a[b])) && "toJSON" !== b) return !1;
	        }return !0;
	    }function Q(a, b, d, e) {
	        if (m.acceptData(a)) {
	            var f,
	                g,
	                h = m.expando,
	                i = a.nodeType,
	                j = i ? m.cache : a,
	                k = i ? a[h] : a[h] && h;
	            if (k && j[k] && (e || j[k].data) || void 0 !== d || "string" != typeof b) return k || (k = i ? a[h] = c.pop() || m.guid++ : h), j[k] || (j[k] = i ? {} : { toJSON: m.noop }), ("object" == (typeof b === "undefined" ? "undefined" : _typeof(b)) || "function" == typeof b) && (e ? j[k] = m.extend(j[k], b) : j[k].data = m.extend(j[k].data, b)), g = j[k], e || (g.data || (g.data = {}), g = g.data), void 0 !== d && (g[m.camelCase(b)] = d), "string" == typeof b ? (f = g[b], null == f && (f = g[m.camelCase(b)])) : f = g, f;
	        }
	    }function R(a, b, c) {
	        if (m.acceptData(a)) {
	            var d,
	                e,
	                f = a.nodeType,
	                g = f ? m.cache : a,
	                h = f ? a[m.expando] : m.expando;if (g[h]) {
	                if (b && (d = c ? g[h] : g[h].data)) {
	                    m.isArray(b) ? b = b.concat(m.map(b, m.camelCase)) : b in d ? b = [b] : (b = m.camelCase(b), b = b in d ? [b] : b.split(" ")), e = b.length;while (e--) {
	                        delete d[b[e]];
	                    }if (c ? !P(d) : !m.isEmptyObject(d)) return;
	                }(c || (delete g[h].data, P(g[h]))) && (f ? m.cleanData([a], !0) : k.deleteExpando || g != g.window ? delete g[h] : g[h] = null);
	            }
	        }
	    }m.extend({ cache: {}, noData: { "applet ": !0, "embed ": !0, "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" }, hasData: function hasData(a) {
	            return a = a.nodeType ? m.cache[a[m.expando]] : a[m.expando], !!a && !P(a);
	        }, data: function data(a, b, c) {
	            return Q(a, b, c);
	        }, removeData: function removeData(a, b) {
	            return R(a, b);
	        }, _data: function _data(a, b, c) {
	            return Q(a, b, c, !0);
	        }, _removeData: function _removeData(a, b) {
	            return R(a, b, !0);
	        } }), m.fn.extend({ data: function data(a, b) {
	            var c,
	                d,
	                e,
	                f = this[0],
	                g = f && f.attributes;if (void 0 === a) {
	                if (this.length && (e = m.data(f), 1 === f.nodeType && !m._data(f, "parsedAttrs"))) {
	                    c = g.length;while (c--) {
	                        g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = m.camelCase(d.slice(5)), O(f, d, e[d])));
	                    }m._data(f, "parsedAttrs", !0);
	                }return e;
	            }return "object" == (typeof a === "undefined" ? "undefined" : _typeof(a)) ? this.each(function () {
	                m.data(this, a);
	            }) : arguments.length > 1 ? this.each(function () {
	                m.data(this, a, b);
	            }) : f ? O(f, a, m.data(f, a)) : void 0;
	        }, removeData: function removeData(a) {
	            return this.each(function () {
	                m.removeData(this, a);
	            });
	        } }), m.extend({ queue: function queue(a, b, c) {
	            var d;return a ? (b = (b || "fx") + "queue", d = m._data(a, b), c && (!d || m.isArray(c) ? d = m._data(a, b, m.makeArray(c)) : d.push(c)), d || []) : void 0;
	        }, dequeue: function dequeue(a, b) {
	            b = b || "fx";var c = m.queue(a, b),
	                d = c.length,
	                e = c.shift(),
	                f = m._queueHooks(a, b),
	                g = function g() {
	                m.dequeue(a, b);
	            };"inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
	        }, _queueHooks: function _queueHooks(a, b) {
	            var c = b + "queueHooks";return m._data(a, c) || m._data(a, c, { empty: m.Callbacks("once memory").add(function () {
	                    m._removeData(a, b + "queue"), m._removeData(a, c);
	                }) });
	        } }), m.fn.extend({ queue: function queue(a, b) {
	            var c = 2;return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? m.queue(this[0], a) : void 0 === b ? this : this.each(function () {
	                var c = m.queue(this, a, b);m._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && m.dequeue(this, a);
	            });
	        }, dequeue: function dequeue(a) {
	            return this.each(function () {
	                m.dequeue(this, a);
	            });
	        }, clearQueue: function clearQueue(a) {
	            return this.queue(a || "fx", []);
	        }, promise: function promise(a, b) {
	            var c,
	                d = 1,
	                e = m.Deferred(),
	                f = this,
	                g = this.length,
	                h = function h() {
	                --d || e.resolveWith(f, [f]);
	            };"string" != typeof a && (b = a, a = void 0), a = a || "fx";while (g--) {
	                c = m._data(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h));
	            }return h(), e.promise(b);
	        } });var S = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
	        T = ["Top", "Right", "Bottom", "Left"],
	        U = function U(a, b) {
	        return a = b || a, "none" === m.css(a, "display") || !m.contains(a.ownerDocument, a);
	    },
	        V = m.access = function (a, b, c, d, e, f, g) {
	        var h = 0,
	            i = a.length,
	            j = null == c;if ("object" === m.type(c)) {
	            e = !0;for (h in c) {
	                m.access(a, b, h, c[h], !0, f, g);
	            }
	        } else if (void 0 !== d && (e = !0, m.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function b(a, _b2, c) {
	            return j.call(m(a), c);
	        })), b)) for (; i > h; h++) {
	            b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
	        }return e ? a : j ? b.call(a) : i ? b(a[0], c) : f;
	    },
	        W = /^(?:checkbox|radio)$/i;!function () {
	        var a = y.createElement("input"),
	            b = y.createElement("div"),
	            c = y.createDocumentFragment();if (b.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", k.leadingWhitespace = 3 === b.firstChild.nodeType, k.tbody = !b.getElementsByTagName("tbody").length, k.htmlSerialize = !!b.getElementsByTagName("link").length, k.html5Clone = "<:nav></:nav>" !== y.createElement("nav").cloneNode(!0).outerHTML, a.type = "checkbox", a.checked = !0, c.appendChild(a), k.appendChecked = a.checked, b.innerHTML = "<textarea>x</textarea>", k.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue, c.appendChild(b), b.innerHTML = "<input type='radio' checked='checked' name='t'/>", k.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, k.noCloneEvent = !0, b.attachEvent && (b.attachEvent("onclick", function () {
	            k.noCloneEvent = !1;
	        }), b.cloneNode(!0).click()), null == k.deleteExpando) {
	            k.deleteExpando = !0;try {
	                delete b.test;
	            } catch (d) {
	                k.deleteExpando = !1;
	            }
	        }
	    }(), function () {
	        var b,
	            c,
	            d = y.createElement("div");for (b in { submit: !0, change: !0, focusin: !0 }) {
	            c = "on" + b, (k[b + "Bubbles"] = c in a) || (d.setAttribute(c, "t"), k[b + "Bubbles"] = d.attributes[c].expando === !1);
	        }d = null;
	    }();var X = /^(?:input|select|textarea)$/i,
	        Y = /^key/,
	        Z = /^(?:mouse|pointer|contextmenu)|click/,
	        $ = /^(?:focusinfocus|focusoutblur)$/,
	        _ = /^([^.]*)(?:\.(.+)|)$/;function ab() {
	        return !0;
	    }function bb() {
	        return !1;
	    }function cb() {
	        try {
	            return y.activeElement;
	        } catch (a) {}
	    }m.event = { global: {}, add: function add(a, b, c, d, e) {
	            var f,
	                g,
	                h,
	                i,
	                j,
	                k,
	                l,
	                n,
	                o,
	                p,
	                q,
	                r = m._data(a);if (r) {
	                c.handler && (i = c, c = i.handler, e = i.selector), c.guid || (c.guid = m.guid++), (g = r.events) || (g = r.events = {}), (k = r.handle) || (k = r.handle = function (a) {
	                    return (typeof m === "undefined" ? "undefined" : _typeof(m)) === K || a && m.event.triggered === a.type ? void 0 : m.event.dispatch.apply(k.elem, arguments);
	                }, k.elem = a), b = (b || "").match(E) || [""], h = b.length;while (h--) {
	                    f = _.exec(b[h]) || [], o = q = f[1], p = (f[2] || "").split(".").sort(), o && (j = m.event.special[o] || {}, o = (e ? j.delegateType : j.bindType) || o, j = m.event.special[o] || {}, l = m.extend({ type: o, origType: q, data: d, handler: c, guid: c.guid, selector: e, needsContext: e && m.expr.match.needsContext.test(e), namespace: p.join(".") }, i), (n = g[o]) || (n = g[o] = [], n.delegateCount = 0, j.setup && j.setup.call(a, d, p, k) !== !1 || (a.addEventListener ? a.addEventListener(o, k, !1) : a.attachEvent && a.attachEvent("on" + o, k))), j.add && (j.add.call(a, l), l.handler.guid || (l.handler.guid = c.guid)), e ? n.splice(n.delegateCount++, 0, l) : n.push(l), m.event.global[o] = !0);
	                }a = null;
	            }
	        }, remove: function remove(a, b, c, d, e) {
	            var f,
	                g,
	                h,
	                i,
	                j,
	                k,
	                l,
	                n,
	                o,
	                p,
	                q,
	                r = m.hasData(a) && m._data(a);if (r && (k = r.events)) {
	                b = (b || "").match(E) || [""], j = b.length;while (j--) {
	                    if (h = _.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) {
	                        l = m.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, n = k[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), i = f = n.length;while (f--) {
	                            g = n[f], !e && q !== g.origType || c && c.guid !== g.guid || h && !h.test(g.namespace) || d && d !== g.selector && ("**" !== d || !g.selector) || (n.splice(f, 1), g.selector && n.delegateCount--, l.remove && l.remove.call(a, g));
	                        }i && !n.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || m.removeEvent(a, o, r.handle), delete k[o]);
	                    } else for (o in k) {
	                        m.event.remove(a, o + b[j], c, d, !0);
	                    }
	                }m.isEmptyObject(k) && (delete r.handle, m._removeData(a, "events"));
	            }
	        }, trigger: function trigger(b, c, d, e) {
	            var f,
	                g,
	                h,
	                i,
	                k,
	                l,
	                n,
	                o = [d || y],
	                p = j.call(b, "type") ? b.type : b,
	                q = j.call(b, "namespace") ? b.namespace.split(".") : [];if (h = l = d = d || y, 3 !== d.nodeType && 8 !== d.nodeType && !$.test(p + m.event.triggered) && (p.indexOf(".") >= 0 && (q = p.split("."), p = q.shift(), q.sort()), g = p.indexOf(":") < 0 && "on" + p, b = b[m.expando] ? b : new m.Event(p, "object" == (typeof b === "undefined" ? "undefined" : _typeof(b)) && b), b.isTrigger = e ? 2 : 3, b.namespace = q.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + q.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : m.makeArray(c, [b]), k = m.event.special[p] || {}, e || !k.trigger || k.trigger.apply(d, c) !== !1)) {
	                if (!e && !k.noBubble && !m.isWindow(d)) {
	                    for (i = k.delegateType || p, $.test(i + p) || (h = h.parentNode); h; h = h.parentNode) {
	                        o.push(h), l = h;
	                    }l === (d.ownerDocument || y) && o.push(l.defaultView || l.parentWindow || a);
	                }n = 0;while ((h = o[n++]) && !b.isPropagationStopped()) {
	                    b.type = n > 1 ? i : k.bindType || p, f = (m._data(h, "events") || {})[b.type] && m._data(h, "handle"), f && f.apply(h, c), f = g && h[g], f && f.apply && m.acceptData(h) && (b.result = f.apply(h, c), b.result === !1 && b.preventDefault());
	                }if (b.type = p, !e && !b.isDefaultPrevented() && (!k._default || k._default.apply(o.pop(), c) === !1) && m.acceptData(d) && g && d[p] && !m.isWindow(d)) {
	                    l = d[g], l && (d[g] = null), m.event.triggered = p;try {
	                        d[p]();
	                    } catch (r) {}m.event.triggered = void 0, l && (d[g] = l);
	                }return b.result;
	            }
	        }, dispatch: function dispatch(a) {
	            a = m.event.fix(a);var b,
	                c,
	                e,
	                f,
	                g,
	                h = [],
	                i = d.call(arguments),
	                j = (m._data(this, "events") || {})[a.type] || [],
	                k = m.event.special[a.type] || {};if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
	                h = m.event.handlers.call(this, a, j), b = 0;while ((f = h[b++]) && !a.isPropagationStopped()) {
	                    a.currentTarget = f.elem, g = 0;while ((e = f.handlers[g++]) && !a.isImmediatePropagationStopped()) {
	                        (!a.namespace_re || a.namespace_re.test(e.namespace)) && (a.handleObj = e, a.data = e.data, c = ((m.event.special[e.origType] || {}).handle || e.handler).apply(f.elem, i), void 0 !== c && (a.result = c) === !1 && (a.preventDefault(), a.stopPropagation()));
	                    }
	                }return k.postDispatch && k.postDispatch.call(this, a), a.result;
	            }
	        }, handlers: function handlers(a, b) {
	            var c,
	                d,
	                e,
	                f,
	                g = [],
	                h = b.delegateCount,
	                i = a.target;if (h && i.nodeType && (!a.button || "click" !== a.type)) for (; i != this; i = i.parentNode || this) {
	                if (1 === i.nodeType && (i.disabled !== !0 || "click" !== a.type)) {
	                    for (e = [], f = 0; h > f; f++) {
	                        d = b[f], c = d.selector + " ", void 0 === e[c] && (e[c] = d.needsContext ? m(c, this).index(i) >= 0 : m.find(c, this, null, [i]).length), e[c] && e.push(d);
	                    }e.length && g.push({ elem: i, handlers: e });
	                }
	            }return h < b.length && g.push({ elem: this, handlers: b.slice(h) }), g;
	        }, fix: function fix(a) {
	            if (a[m.expando]) return a;var b,
	                c,
	                d,
	                e = a.type,
	                f = a,
	                g = this.fixHooks[e];g || (this.fixHooks[e] = g = Z.test(e) ? this.mouseHooks : Y.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new m.Event(f), b = d.length;while (b--) {
	                c = d[b], a[c] = f[c];
	            }return a.target || (a.target = f.srcElement || y), 3 === a.target.nodeType && (a.target = a.target.parentNode), a.metaKey = !!a.metaKey, g.filter ? g.filter(a, f) : a;
	        }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: { props: "char charCode key keyCode".split(" "), filter: function filter(a, b) {
	                return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a;
	            } }, mouseHooks: { props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function filter(a, b) {
	                var c,
	                    d,
	                    e,
	                    f = b.button,
	                    g = b.fromElement;return null == a.pageX && null != b.clientX && (d = a.target.ownerDocument || y, e = d.documentElement, c = d.body, a.pageX = b.clientX + (e && e.scrollLeft || c && c.scrollLeft || 0) - (e && e.clientLeft || c && c.clientLeft || 0), a.pageY = b.clientY + (e && e.scrollTop || c && c.scrollTop || 0) - (e && e.clientTop || c && c.clientTop || 0)), !a.relatedTarget && g && (a.relatedTarget = g === a.target ? b.toElement : g), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a;
	            } }, special: { load: { noBubble: !0 }, focus: { trigger: function trigger() {
	                    if (this !== cb() && this.focus) try {
	                        return this.focus(), !1;
	                    } catch (a) {}
	                }, delegateType: "focusin" }, blur: { trigger: function trigger() {
	                    return this === cb() && this.blur ? (this.blur(), !1) : void 0;
	                }, delegateType: "focusout" }, click: { trigger: function trigger() {
	                    return m.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), !1) : void 0;
	                }, _default: function _default(a) {
	                    return m.nodeName(a.target, "a");
	                } }, beforeunload: { postDispatch: function postDispatch(a) {
	                    void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result);
	                } } }, simulate: function simulate(a, b, c, d) {
	            var e = m.extend(new m.Event(), c, { type: a, isSimulated: !0, originalEvent: {} });d ? m.event.trigger(e, null, b) : m.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
	        } }, m.removeEvent = y.removeEventListener ? function (a, b, c) {
	        a.removeEventListener && a.removeEventListener(b, c, !1);
	    } : function (a, b, c) {
	        var d = "on" + b;a.detachEvent && (_typeof(a[d]) === K && (a[d] = null), a.detachEvent(d, c));
	    }, m.Event = function (a, b) {
	        return this instanceof m.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? ab : bb) : this.type = a, b && m.extend(this, b), this.timeStamp = a && a.timeStamp || m.now(), void (this[m.expando] = !0)) : new m.Event(a, b);
	    }, m.Event.prototype = { isDefaultPrevented: bb, isPropagationStopped: bb, isImmediatePropagationStopped: bb, preventDefault: function preventDefault() {
	            var a = this.originalEvent;this.isDefaultPrevented = ab, a && (a.preventDefault ? a.preventDefault() : a.returnValue = !1);
	        }, stopPropagation: function stopPropagation() {
	            var a = this.originalEvent;this.isPropagationStopped = ab, a && (a.stopPropagation && a.stopPropagation(), a.cancelBubble = !0);
	        }, stopImmediatePropagation: function stopImmediatePropagation() {
	            var a = this.originalEvent;this.isImmediatePropagationStopped = ab, a && a.stopImmediatePropagation && a.stopImmediatePropagation(), this.stopPropagation();
	        } }, m.each({ mouseenter: "mouseover", mouseleave: "mouseout", pointerenter: "pointerover", pointerleave: "pointerout" }, function (a, b) {
	        m.event.special[a] = { delegateType: b, bindType: b, handle: function handle(a) {
	                var c,
	                    d = this,
	                    e = a.relatedTarget,
	                    f = a.handleObj;return (!e || e !== d && !m.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c;
	            } };
	    }), k.submitBubbles || (m.event.special.submit = { setup: function setup() {
	            return m.nodeName(this, "form") ? !1 : void m.event.add(this, "click._submit keypress._submit", function (a) {
	                var b = a.target,
	                    c = m.nodeName(b, "input") || m.nodeName(b, "button") ? b.form : void 0;c && !m._data(c, "submitBubbles") && (m.event.add(c, "submit._submit", function (a) {
	                    a._submit_bubble = !0;
	                }), m._data(c, "submitBubbles", !0));
	            });
	        }, postDispatch: function postDispatch(a) {
	            a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && m.event.simulate("submit", this.parentNode, a, !0));
	        }, teardown: function teardown() {
	            return m.nodeName(this, "form") ? !1 : void m.event.remove(this, "._submit");
	        } }), k.changeBubbles || (m.event.special.change = { setup: function setup() {
	            return X.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (m.event.add(this, "propertychange._change", function (a) {
	                "checked" === a.originalEvent.propertyName && (this._just_changed = !0);
	            }), m.event.add(this, "click._change", function (a) {
	                this._just_changed && !a.isTrigger && (this._just_changed = !1), m.event.simulate("change", this, a, !0);
	            })), !1) : void m.event.add(this, "beforeactivate._change", function (a) {
	                var b = a.target;X.test(b.nodeName) && !m._data(b, "changeBubbles") && (m.event.add(b, "change._change", function (a) {
	                    !this.parentNode || a.isSimulated || a.isTrigger || m.event.simulate("change", this.parentNode, a, !0);
	                }), m._data(b, "changeBubbles", !0));
	            });
	        }, handle: function handle(a) {
	            var b = a.target;return this !== b || a.isSimulated || a.isTrigger || "radio" !== b.type && "checkbox" !== b.type ? a.handleObj.handler.apply(this, arguments) : void 0;
	        }, teardown: function teardown() {
	            return m.event.remove(this, "._change"), !X.test(this.nodeName);
	        } }), k.focusinBubbles || m.each({ focus: "focusin", blur: "focusout" }, function (a, b) {
	        var c = function c(a) {
	            m.event.simulate(b, a.target, m.event.fix(a), !0);
	        };m.event.special[b] = { setup: function setup() {
	                var d = this.ownerDocument || this,
	                    e = m._data(d, b);e || d.addEventListener(a, c, !0), m._data(d, b, (e || 0) + 1);
	            }, teardown: function teardown() {
	                var d = this.ownerDocument || this,
	                    e = m._data(d, b) - 1;e ? m._data(d, b, e) : (d.removeEventListener(a, c, !0), m._removeData(d, b));
	            } };
	    }), m.fn.extend({ on: function on(a, b, c, d, e) {
	            var f, g;if ("object" == (typeof a === "undefined" ? "undefined" : _typeof(a))) {
	                "string" != typeof b && (c = c || b, b = void 0);for (f in a) {
	                    this.on(f, b, c, a[f], e);
	                }return this;
	            }if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1) d = bb;else if (!d) return this;return 1 === e && (g = d, d = function d(a) {
	                return m().off(a), g.apply(this, arguments);
	            }, d.guid = g.guid || (g.guid = m.guid++)), this.each(function () {
	                m.event.add(this, a, d, c, b);
	            });
	        }, one: function one(a, b, c, d) {
	            return this.on(a, b, c, d, 1);
	        }, off: function off(a, b, c) {
	            var d, e;if (a && a.preventDefault && a.handleObj) return d = a.handleObj, m(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this;if ("object" == (typeof a === "undefined" ? "undefined" : _typeof(a))) {
	                for (e in a) {
	                    this.off(e, b, a[e]);
	                }return this;
	            }return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = bb), this.each(function () {
	                m.event.remove(this, a, c, b);
	            });
	        }, trigger: function trigger(a, b) {
	            return this.each(function () {
	                m.event.trigger(a, b, this);
	            });
	        }, triggerHandler: function triggerHandler(a, b) {
	            var c = this[0];return c ? m.event.trigger(a, b, c, !0) : void 0;
	        } });function db(a) {
	        var b = eb.split("|"),
	            c = a.createDocumentFragment();if (c.createElement) while (b.length) {
	            c.createElement(b.pop());
	        }return c;
	    }var eb = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	        fb = / jQuery\d+="(?:null|\d+)"/g,
	        gb = new RegExp("<(?:" + eb + ")[\\s/>]", "i"),
	        hb = /^\s+/,
	        ib = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	        jb = /<([\w:]+)/,
	        kb = /<tbody/i,
	        lb = /<|&#?\w+;/,
	        mb = /<(?:script|style|link)/i,
	        nb = /checked\s*(?:[^=]|=\s*.checked.)/i,
	        ob = /^$|\/(?:java|ecma)script/i,
	        pb = /^true\/(.*)/,
	        qb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	        rb = { option: [1, "<select multiple='multiple'>", "</select>"], legend: [1, "<fieldset>", "</fieldset>"], area: [1, "<map>", "</map>"], param: [1, "<object>", "</object>"], thead: [1, "<table>", "</table>"], tr: [2, "<table><tbody>", "</tbody></table>"], col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: k.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"] },
	        sb = db(y),
	        tb = sb.appendChild(y.createElement("div"));rb.optgroup = rb.option, rb.tbody = rb.tfoot = rb.colgroup = rb.caption = rb.thead, rb.th = rb.td;function ub(a, b) {
	        var c,
	            d,
	            e = 0,
	            f = _typeof(a.getElementsByTagName) !== K ? a.getElementsByTagName(b || "*") : _typeof(a.querySelectorAll) !== K ? a.querySelectorAll(b || "*") : void 0;if (!f) for (f = [], c = a.childNodes || a; null != (d = c[e]); e++) {
	            !b || m.nodeName(d, b) ? f.push(d) : m.merge(f, ub(d, b));
	        }return void 0 === b || b && m.nodeName(a, b) ? m.merge([a], f) : f;
	    }function vb(a) {
	        W.test(a.type) && (a.defaultChecked = a.checked);
	    }function wb(a, b) {
	        return m.nodeName(a, "table") && m.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a;
	    }function xb(a) {
	        return a.type = (null !== m.find.attr(a, "type")) + "/" + a.type, a;
	    }function yb(a) {
	        var b = pb.exec(a.type);return b ? a.type = b[1] : a.removeAttribute("type"), a;
	    }function zb(a, b) {
	        for (var c, d = 0; null != (c = a[d]); d++) {
	            m._data(c, "globalEval", !b || m._data(b[d], "globalEval"));
	        }
	    }function Ab(a, b) {
	        if (1 === b.nodeType && m.hasData(a)) {
	            var c,
	                d,
	                e,
	                f = m._data(a),
	                g = m._data(b, f),
	                h = f.events;if (h) {
	                delete g.handle, g.events = {};for (c in h) {
	                    for (d = 0, e = h[c].length; e > d; d++) {
	                        m.event.add(b, c, h[c][d]);
	                    }
	                }
	            }g.data && (g.data = m.extend({}, g.data));
	        }
	    }function Bb(a, b) {
	        var c, d, e;if (1 === b.nodeType) {
	            if (c = b.nodeName.toLowerCase(), !k.noCloneEvent && b[m.expando]) {
	                e = m._data(b);for (d in e.events) {
	                    m.removeEvent(b, d, e.handle);
	                }b.removeAttribute(m.expando);
	            }"script" === c && b.text !== a.text ? (xb(b).text = a.text, yb(b)) : "object" === c ? (b.parentNode && (b.outerHTML = a.outerHTML), k.html5Clone && a.innerHTML && !m.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : "input" === c && W.test(a.type) ? (b.defaultChecked = b.checked = a.checked, b.value !== a.value && (b.value = a.value)) : "option" === c ? b.defaultSelected = b.selected = a.defaultSelected : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue);
	        }
	    }m.extend({ clone: function clone(a, b, c) {
	            var d,
	                e,
	                f,
	                g,
	                h,
	                i = m.contains(a.ownerDocument, a);if (k.html5Clone || m.isXMLDoc(a) || !gb.test("<" + a.nodeName + ">") ? f = a.cloneNode(!0) : (tb.innerHTML = a.outerHTML, tb.removeChild(f = tb.firstChild)), !(k.noCloneEvent && k.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || m.isXMLDoc(a))) for (d = ub(f), h = ub(a), g = 0; null != (e = h[g]); ++g) {
	                d[g] && Bb(e, d[g]);
	            }if (b) if (c) for (h = h || ub(a), d = d || ub(f), g = 0; null != (e = h[g]); g++) {
	                Ab(e, d[g]);
	            } else Ab(a, f);return d = ub(f, "script"), d.length > 0 && zb(d, !i && ub(a, "script")), d = h = e = null, f;
	        }, buildFragment: function buildFragment(a, b, c, d) {
	            for (var e, f, g, h, i, j, l, n = a.length, o = db(b), p = [], q = 0; n > q; q++) {
	                if (f = a[q], f || 0 === f) if ("object" === m.type(f)) m.merge(p, f.nodeType ? [f] : f);else if (lb.test(f)) {
	                    h = h || o.appendChild(b.createElement("div")), i = (jb.exec(f) || ["", ""])[1].toLowerCase(), l = rb[i] || rb._default, h.innerHTML = l[1] + f.replace(ib, "<$1></$2>") + l[2], e = l[0];while (e--) {
	                        h = h.lastChild;
	                    }if (!k.leadingWhitespace && hb.test(f) && p.push(b.createTextNode(hb.exec(f)[0])), !k.tbody) {
	                        f = "table" !== i || kb.test(f) ? "<table>" !== l[1] || kb.test(f) ? 0 : h : h.firstChild, e = f && f.childNodes.length;while (e--) {
	                            m.nodeName(j = f.childNodes[e], "tbody") && !j.childNodes.length && f.removeChild(j);
	                        }
	                    }m.merge(p, h.childNodes), h.textContent = "";while (h.firstChild) {
	                        h.removeChild(h.firstChild);
	                    }h = o.lastChild;
	                } else p.push(b.createTextNode(f));
	            }h && o.removeChild(h), k.appendChecked || m.grep(ub(p, "input"), vb), q = 0;while (f = p[q++]) {
	                if ((!d || -1 === m.inArray(f, d)) && (g = m.contains(f.ownerDocument, f), h = ub(o.appendChild(f), "script"), g && zb(h), c)) {
	                    e = 0;while (f = h[e++]) {
	                        ob.test(f.type || "") && c.push(f);
	                    }
	                }
	            }return h = null, o;
	        }, cleanData: function cleanData(a, b) {
	            for (var d, e, f, g, h = 0, i = m.expando, j = m.cache, l = k.deleteExpando, n = m.event.special; null != (d = a[h]); h++) {
	                if ((b || m.acceptData(d)) && (f = d[i], g = f && j[f])) {
	                    if (g.events) for (e in g.events) {
	                        n[e] ? m.event.remove(d, e) : m.removeEvent(d, e, g.handle);
	                    }j[f] && (delete j[f], l ? delete d[i] : _typeof(d.removeAttribute) !== K ? d.removeAttribute(i) : d[i] = null, c.push(f));
	                }
	            }
	        } }), m.fn.extend({ text: function text(a) {
	            return V(this, function (a) {
	                return void 0 === a ? m.text(this) : this.empty().append((this[0] && this[0].ownerDocument || y).createTextNode(a));
	            }, null, a, arguments.length);
	        }, append: function append() {
	            return this.domManip(arguments, function (a) {
	                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
	                    var b = wb(this, a);b.appendChild(a);
	                }
	            });
	        }, prepend: function prepend() {
	            return this.domManip(arguments, function (a) {
	                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
	                    var b = wb(this, a);b.insertBefore(a, b.firstChild);
	                }
	            });
	        }, before: function before() {
	            return this.domManip(arguments, function (a) {
	                this.parentNode && this.parentNode.insertBefore(a, this);
	            });
	        }, after: function after() {
	            return this.domManip(arguments, function (a) {
	                this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
	            });
	        }, remove: function remove(a, b) {
	            for (var c, d = a ? m.filter(a, this) : this, e = 0; null != (c = d[e]); e++) {
	                b || 1 !== c.nodeType || m.cleanData(ub(c)), c.parentNode && (b && m.contains(c.ownerDocument, c) && zb(ub(c, "script")), c.parentNode.removeChild(c));
	            }return this;
	        }, empty: function empty() {
	            for (var a, b = 0; null != (a = this[b]); b++) {
	                1 === a.nodeType && m.cleanData(ub(a, !1));while (a.firstChild) {
	                    a.removeChild(a.firstChild);
	                }a.options && m.nodeName(a, "select") && (a.options.length = 0);
	            }return this;
	        }, clone: function clone(a, b) {
	            return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () {
	                return m.clone(this, a, b);
	            });
	        }, html: function html(a) {
	            return V(this, function (a) {
	                var b = this[0] || {},
	                    c = 0,
	                    d = this.length;if (void 0 === a) return 1 === b.nodeType ? b.innerHTML.replace(fb, "") : void 0;if (!("string" != typeof a || mb.test(a) || !k.htmlSerialize && gb.test(a) || !k.leadingWhitespace && hb.test(a) || rb[(jb.exec(a) || ["", ""])[1].toLowerCase()])) {
	                    a = a.replace(ib, "<$1></$2>");try {
	                        for (; d > c; c++) {
	                            b = this[c] || {}, 1 === b.nodeType && (m.cleanData(ub(b, !1)), b.innerHTML = a);
	                        }b = 0;
	                    } catch (e) {}
	                }b && this.empty().append(a);
	            }, null, a, arguments.length);
	        }, replaceWith: function replaceWith() {
	            var a = arguments[0];return this.domManip(arguments, function (b) {
	                a = this.parentNode, m.cleanData(ub(this)), a && a.replaceChild(b, this);
	            }), a && (a.length || a.nodeType) ? this : this.remove();
	        }, detach: function detach(a) {
	            return this.remove(a, !0);
	        }, domManip: function domManip(a, b) {
	            a = e.apply([], a);var c,
	                d,
	                f,
	                g,
	                h,
	                i,
	                j = 0,
	                l = this.length,
	                n = this,
	                o = l - 1,
	                p = a[0],
	                q = m.isFunction(p);if (q || l > 1 && "string" == typeof p && !k.checkClone && nb.test(p)) return this.each(function (c) {
	                var d = n.eq(c);q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b);
	            });if (l && (i = m.buildFragment(a, this[0].ownerDocument, !1, this), c = i.firstChild, 1 === i.childNodes.length && (i = c), c)) {
	                for (g = m.map(ub(i, "script"), xb), f = g.length; l > j; j++) {
	                    d = i, j !== o && (d = m.clone(d, !0, !0), f && m.merge(g, ub(d, "script"))), b.call(this[j], d, j);
	                }if (f) for (h = g[g.length - 1].ownerDocument, m.map(g, yb), j = 0; f > j; j++) {
	                    d = g[j], ob.test(d.type || "") && !m._data(d, "globalEval") && m.contains(h, d) && (d.src ? m._evalUrl && m._evalUrl(d.src) : m.globalEval((d.text || d.textContent || d.innerHTML || "").replace(qb, "")));
	                }i = c = null;
	            }return this;
	        } }), m.each({ appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith" }, function (a, b) {
	        m.fn[a] = function (a) {
	            for (var c, d = 0, e = [], g = m(a), h = g.length - 1; h >= d; d++) {
	                c = d === h ? this : this.clone(!0), m(g[d])[b](c), f.apply(e, c.get());
	            }return this.pushStack(e);
	        };
	    });var Cb,
	        Db = {};function Eb(b, c) {
	        var d,
	            e = m(c.createElement(b)).appendTo(c.body),
	            f = a.getDefaultComputedStyle && (d = a.getDefaultComputedStyle(e[0])) ? d.display : m.css(e[0], "display");return e.detach(), f;
	    }function Fb(a) {
	        var b = y,
	            c = Db[a];return c || (c = Eb(a, b), "none" !== c && c || (Cb = (Cb || m("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = (Cb[0].contentWindow || Cb[0].contentDocument).document, b.write(), b.close(), c = Eb(a, b), Cb.detach()), Db[a] = c), c;
	    }!function () {
	        var a;k.shrinkWrapBlocks = function () {
	            if (null != a) return a;a = !1;var b, c, d;return c = y.getElementsByTagName("body")[0], c && c.style ? (b = y.createElement("div"), d = y.createElement("div"), d.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", c.appendChild(d).appendChild(b), _typeof(b.style.zoom) !== K && (b.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1", b.appendChild(y.createElement("div")).style.width = "5px", a = 3 !== b.offsetWidth), c.removeChild(d), a) : void 0;
	        };
	    }();var Gb = /^margin/,
	        Hb = new RegExp("^(" + S + ")(?!px)[a-z%]+$", "i"),
	        Ib,
	        Jb,
	        Kb = /^(top|right|bottom|left)$/;a.getComputedStyle ? (Ib = function Ib(a) {
	        return a.ownerDocument.defaultView.getComputedStyle(a, null);
	    }, Jb = function Jb(a, b, c) {
	        var d,
	            e,
	            f,
	            g,
	            h = a.style;return c = c || Ib(a), g = c ? c.getPropertyValue(b) || c[b] : void 0, c && ("" !== g || m.contains(a.ownerDocument, a) || (g = m.style(a, b)), Hb.test(g) && Gb.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 === g ? g : g + "";
	    }) : y.documentElement.currentStyle && (Ib = function Ib(a) {
	        return a.currentStyle;
	    }, Jb = function Jb(a, b, c) {
	        var d,
	            e,
	            f,
	            g,
	            h = a.style;return c = c || Ib(a), g = c ? c[b] : void 0, null == g && h && h[b] && (g = h[b]), Hb.test(g) && !Kb.test(b) && (d = h.left, e = a.runtimeStyle, f = e && e.left, f && (e.left = a.currentStyle.left), h.left = "fontSize" === b ? "1em" : g, g = h.pixelLeft + "px", h.left = d, f && (e.left = f)), void 0 === g ? g : g + "" || "auto";
	    });function Lb(a, b) {
	        return { get: function get() {
	                var c = a();if (null != c) return c ? void delete this.get : (this.get = b).apply(this, arguments);
	            } };
	    }!function () {
	        var b, c, d, e, f, g, h;if (b = y.createElement("div"), b.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", d = b.getElementsByTagName("a")[0], c = d && d.style) {
	            (function () {
	                var i = function i() {
	                    var b, c, d, i;c = y.getElementsByTagName("body")[0], c && c.style && (b = y.createElement("div"), d = y.createElement("div"), d.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", c.appendChild(d).appendChild(b), b.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", e = f = !1, h = !0, a.getComputedStyle && (e = "1%" !== (a.getComputedStyle(b, null) || {}).top, f = "4px" === (a.getComputedStyle(b, null) || { width: "4px" }).width, i = b.appendChild(y.createElement("div")), i.style.cssText = b.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", i.style.marginRight = i.style.width = "0", b.style.width = "1px", h = !parseFloat((a.getComputedStyle(i, null) || {}).marginRight)), b.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", i = b.getElementsByTagName("td"), i[0].style.cssText = "margin:0;border:0;padding:0;display:none", g = 0 === i[0].offsetHeight, g && (i[0].style.display = "", i[1].style.display = "none", g = 0 === i[0].offsetHeight), c.removeChild(d));
	                };
	
	                c.cssText = "float:left;opacity:.5", k.opacity = "0.5" === c.opacity, k.cssFloat = !!c.cssFloat, b.style.backgroundClip = "content-box", b.cloneNode(!0).style.backgroundClip = "", k.clearCloneStyle = "content-box" === b.style.backgroundClip, k.boxSizing = "" === c.boxSizing || "" === c.MozBoxSizing || "" === c.WebkitBoxSizing, m.extend(k, { reliableHiddenOffsets: function reliableHiddenOffsets() {
	                        return null == g && i(), g;
	                    }, boxSizingReliable: function boxSizingReliable() {
	                        return null == f && i(), f;
	                    }, pixelPosition: function pixelPosition() {
	                        return null == e && i(), e;
	                    }, reliableMarginRight: function reliableMarginRight() {
	                        return null == h && i(), h;
	                    } });
	            })();
	        }
	    }(), m.swap = function (a, b, c, d) {
	        var e,
	            f,
	            g = {};for (f in b) {
	            g[f] = a.style[f], a.style[f] = b[f];
	        }e = c.apply(a, d || []);for (f in b) {
	            a.style[f] = g[f];
	        }return e;
	    };var Mb = /alpha\([^)]*\)/i,
	        Nb = /opacity\s*=\s*([^)]*)/,
	        Ob = /^(none|table(?!-c[ea]).+)/,
	        Pb = new RegExp("^(" + S + ")(.*)$", "i"),
	        Qb = new RegExp("^([+-])=(" + S + ")", "i"),
	        Rb = { position: "absolute", visibility: "hidden", display: "block" },
	        Sb = { letterSpacing: "0", fontWeight: "400" },
	        Tb = ["Webkit", "O", "Moz", "ms"];function Ub(a, b) {
	        if (b in a) return b;var c = b.charAt(0).toUpperCase() + b.slice(1),
	            d = b,
	            e = Tb.length;while (e--) {
	            if (b = Tb[e] + c, b in a) return b;
	        }return d;
	    }function Vb(a, b) {
	        for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) {
	            d = a[g], d.style && (f[g] = m._data(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && U(d) && (f[g] = m._data(d, "olddisplay", Fb(d.nodeName)))) : (e = U(d), (c && "none" !== c || !e) && m._data(d, "olddisplay", e ? c : m.css(d, "display"))));
	        }for (g = 0; h > g; g++) {
	            d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
	        }return a;
	    }function Wb(a, b, c) {
	        var d = Pb.exec(b);return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b;
	    }function Xb(a, b, c, d, e) {
	        for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) {
	            "margin" === c && (g += m.css(a, c + T[f], !0, e)), d ? ("content" === c && (g -= m.css(a, "padding" + T[f], !0, e)), "margin" !== c && (g -= m.css(a, "border" + T[f] + "Width", !0, e))) : (g += m.css(a, "padding" + T[f], !0, e), "padding" !== c && (g += m.css(a, "border" + T[f] + "Width", !0, e)));
	        }return g;
	    }function Yb(a, b, c) {
	        var d = !0,
	            e = "width" === b ? a.offsetWidth : a.offsetHeight,
	            f = Ib(a),
	            g = k.boxSizing && "border-box" === m.css(a, "boxSizing", !1, f);if (0 >= e || null == e) {
	            if (e = Jb(a, b, f), (0 > e || null == e) && (e = a.style[b]), Hb.test(e)) return e;d = g && (k.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0;
	        }return e + Xb(a, b, c || (g ? "border" : "content"), d, f) + "px";
	    }m.extend({ cssHooks: { opacity: { get: function get(a, b) {
	                    if (b) {
	                        var c = Jb(a, "opacity");return "" === c ? "1" : c;
	                    }
	                } } }, cssNumber: { columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 }, cssProps: { "float": k.cssFloat ? "cssFloat" : "styleFloat" }, style: function style(a, b, c, d) {
	            if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
	                var e,
	                    f,
	                    g,
	                    h = m.camelCase(b),
	                    i = a.style;if (b = m.cssProps[h] || (m.cssProps[h] = Ub(i, h)), g = m.cssHooks[b] || m.cssHooks[h], void 0 === c) return g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b];if (f = typeof c === "undefined" ? "undefined" : _typeof(c), "string" === f && (e = Qb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(m.css(a, b)), f = "number"), null != c && c === c && ("number" !== f || m.cssNumber[h] || (c += "px"), k.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), !(g && "set" in g && void 0 === (c = g.set(a, c, d))))) try {
	                    i[b] = c;
	                } catch (j) {}
	            }
	        }, css: function css(a, b, c, d) {
	            var e,
	                f,
	                g,
	                h = m.camelCase(b);return b = m.cssProps[h] || (m.cssProps[h] = Ub(a.style, h)), g = m.cssHooks[b] || m.cssHooks[h], g && "get" in g && (f = g.get(a, !0, c)), void 0 === f && (f = Jb(a, b, d)), "normal" === f && b in Sb && (f = Sb[b]), "" === c || c ? (e = parseFloat(f), c === !0 || m.isNumeric(e) ? e || 0 : f) : f;
	        } }), m.each(["height", "width"], function (a, b) {
	        m.cssHooks[b] = { get: function get(a, c, d) {
	                return c ? Ob.test(m.css(a, "display")) && 0 === a.offsetWidth ? m.swap(a, Rb, function () {
	                    return Yb(a, b, d);
	                }) : Yb(a, b, d) : void 0;
	            }, set: function set(a, c, d) {
	                var e = d && Ib(a);return Wb(a, c, d ? Xb(a, b, d, k.boxSizing && "border-box" === m.css(a, "boxSizing", !1, e), e) : 0);
	            } };
	    }), k.opacity || (m.cssHooks.opacity = { get: function get(a, b) {
	            return Nb.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : "";
	        }, set: function set(a, b) {
	            var c = a.style,
	                d = a.currentStyle,
	                e = m.isNumeric(b) ? "alpha(opacity=" + 100 * b + ")" : "",
	                f = d && d.filter || c.filter || "";c.zoom = 1, (b >= 1 || "" === b) && "" === m.trim(f.replace(Mb, "")) && c.removeAttribute && (c.removeAttribute("filter"), "" === b || d && !d.filter) || (c.filter = Mb.test(f) ? f.replace(Mb, e) : f + " " + e);
	        } }), m.cssHooks.marginRight = Lb(k.reliableMarginRight, function (a, b) {
	        return b ? m.swap(a, { display: "inline-block" }, Jb, [a, "marginRight"]) : void 0;
	    }), m.each({ margin: "", padding: "", border: "Width" }, function (a, b) {
	        m.cssHooks[a + b] = { expand: function expand(c) {
	                for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++) {
	                    e[a + T[d] + b] = f[d] || f[d - 2] || f[0];
	                }return e;
	            } }, Gb.test(a) || (m.cssHooks[a + b].set = Wb);
	    }), m.fn.extend({ css: function css(a, b) {
	            return V(this, function (a, b, c) {
	                var d,
	                    e,
	                    f = {},
	                    g = 0;if (m.isArray(b)) {
	                    for (d = Ib(a), e = b.length; e > g; g++) {
	                        f[b[g]] = m.css(a, b[g], !1, d);
	                    }return f;
	                }return void 0 !== c ? m.style(a, b, c) : m.css(a, b);
	            }, a, b, arguments.length > 1);
	        }, show: function show() {
	            return Vb(this, !0);
	        }, hide: function hide() {
	            return Vb(this);
	        }, toggle: function toggle(a) {
	            return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function () {
	                U(this) ? m(this).show() : m(this).hide();
	            });
	        } });function Zb(a, b, c, d, e) {
	        return new Zb.prototype.init(a, b, c, d, e);
	    }m.Tween = Zb, Zb.prototype = { constructor: Zb, init: function init(a, b, c, d, e, f) {
	            this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (m.cssNumber[c] ? "" : "px");
	        }, cur: function cur() {
	            var a = Zb.propHooks[this.prop];return a && a.get ? a.get(this) : Zb.propHooks._default.get(this);
	        }, run: function run(a) {
	            var b,
	                c = Zb.propHooks[this.prop];return this.pos = b = this.options.duration ? m.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Zb.propHooks._default.set(this), this;
	        } }, Zb.prototype.init.prototype = Zb.prototype, Zb.propHooks = { _default: { get: function get(a) {
	                var b;return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = m.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop];
	            }, set: function set(a) {
	                m.fx.step[a.prop] ? m.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[m.cssProps[a.prop]] || m.cssHooks[a.prop]) ? m.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
	            } } }, Zb.propHooks.scrollTop = Zb.propHooks.scrollLeft = { set: function set(a) {
	            a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
	        } }, m.easing = { linear: function linear(a) {
	            return a;
	        }, swing: function swing(a) {
	            return .5 - Math.cos(a * Math.PI) / 2;
	        } }, m.fx = Zb.prototype.init, m.fx.step = {};var $b,
	        _b,
	        ac = /^(?:toggle|show|hide)$/,
	        bc = new RegExp("^(?:([+-])=|)(" + S + ")([a-z%]*)$", "i"),
	        cc = /queueHooks$/,
	        dc = [ic],
	        ec = { "*": [function (a, b) {
	            var c = this.createTween(a, b),
	                d = c.cur(),
	                e = bc.exec(b),
	                f = e && e[3] || (m.cssNumber[a] ? "" : "px"),
	                g = (m.cssNumber[a] || "px" !== f && +d) && bc.exec(m.css(c.elem, a)),
	                h = 1,
	                i = 20;if (g && g[3] !== f) {
	                f = f || g[3], e = e || [], g = +d || 1;do {
	                    h = h || ".5", g /= h, m.style(c.elem, a, g + f);
	                } while (h !== (h = c.cur() / d) && 1 !== h && --i);
	            }return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c;
	        }] };function fc() {
	        return setTimeout(function () {
	            $b = void 0;
	        }), $b = m.now();
	    }function gc(a, b) {
	        var c,
	            d = { height: a },
	            e = 0;for (b = b ? 1 : 0; 4 > e; e += 2 - b) {
	            c = T[e], d["margin" + c] = d["padding" + c] = a;
	        }return b && (d.opacity = d.width = a), d;
	    }function hc(a, b, c) {
	        for (var d, e = (ec[b] || []).concat(ec["*"]), f = 0, g = e.length; g > f; f++) {
	            if (d = e[f].call(c, b, a)) return d;
	        }
	    }function ic(a, b, c) {
	        var d,
	            e,
	            f,
	            g,
	            h,
	            i,
	            j,
	            l,
	            n = this,
	            o = {},
	            p = a.style,
	            q = a.nodeType && U(a),
	            r = m._data(a, "fxshow");c.queue || (h = m._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () {
	            h.unqueued || i();
	        }), h.unqueued++, n.always(function () {
	            n.always(function () {
	                h.unqueued--, m.queue(a, "fx").length || h.empty.fire();
	            });
	        })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [p.overflow, p.overflowX, p.overflowY], j = m.css(a, "display"), l = "none" === j ? m._data(a, "olddisplay") || Fb(a.nodeName) : j, "inline" === l && "none" === m.css(a, "float") && (k.inlineBlockNeedsLayout && "inline" !== Fb(a.nodeName) ? p.zoom = 1 : p.display = "inline-block")), c.overflow && (p.overflow = "hidden", k.shrinkWrapBlocks() || n.always(function () {
	            p.overflow = c.overflow[0], p.overflowX = c.overflow[1], p.overflowY = c.overflow[2];
	        }));for (d in b) {
	            if (e = b[d], ac.exec(e)) {
	                if (delete b[d], f = f || "toggle" === e, e === (q ? "hide" : "show")) {
	                    if ("show" !== e || !r || void 0 === r[d]) continue;q = !0;
	                }o[d] = r && r[d] || m.style(a, d);
	            } else j = void 0;
	        }if (m.isEmptyObject(o)) "inline" === ("none" === j ? Fb(a.nodeName) : j) && (p.display = j);else {
	            r ? "hidden" in r && (q = r.hidden) : r = m._data(a, "fxshow", {}), f && (r.hidden = !q), q ? m(a).show() : n.done(function () {
	                m(a).hide();
	            }), n.done(function () {
	                var b;m._removeData(a, "fxshow");for (b in o) {
	                    m.style(a, b, o[b]);
	                }
	            });for (d in o) {
	                g = hc(q ? r[d] : 0, d, n), d in r || (r[d] = g.start, q && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0));
	            }
	        }
	    }function jc(a, b) {
	        var c, d, e, f, g;for (c in a) {
	            if (d = m.camelCase(c), e = b[d], f = a[c], m.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = m.cssHooks[d], g && "expand" in g) {
	                f = g.expand(f), delete a[d];for (c in f) {
	                    c in a || (a[c] = f[c], b[c] = e);
	                }
	            } else b[d] = e;
	        }
	    }function kc(a, b, c) {
	        var d,
	            e,
	            f = 0,
	            g = dc.length,
	            h = m.Deferred().always(function () {
	            delete i.elem;
	        }),
	            i = function i() {
	            if (e) return !1;for (var b = $b || fc(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) {
	                j.tweens[g].run(f);
	            }return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1);
	        },
	            j = h.promise({ elem: a, props: m.extend({}, b), opts: m.extend(!0, { specialEasing: {} }, c), originalProperties: b, originalOptions: c, startTime: $b || fc(), duration: c.duration, tweens: [], createTween: function createTween(b, c) {
	                var d = m.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);return j.tweens.push(d), d;
	            }, stop: function stop(b) {
	                var c = 0,
	                    d = b ? j.tweens.length : 0;if (e) return this;for (e = !0; d > c; c++) {
	                    j.tweens[c].run(1);
	                }return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this;
	            } }),
	            k = j.props;for (jc(k, j.opts.specialEasing); g > f; f++) {
	            if (d = dc[f].call(j, a, k, j.opts)) return d;
	        }return m.map(k, hc, j), m.isFunction(j.opts.start) && j.opts.start.call(a, j), m.fx.timer(m.extend(i, { elem: a, anim: j, queue: j.opts.queue })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
	    }m.Animation = m.extend(kc, { tweener: function tweener(a, b) {
	            m.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" ");for (var c, d = 0, e = a.length; e > d; d++) {
	                c = a[d], ec[c] = ec[c] || [], ec[c].unshift(b);
	            }
	        }, prefilter: function prefilter(a, b) {
	            b ? dc.unshift(a) : dc.push(a);
	        } }), m.speed = function (a, b, c) {
	        var d = a && "object" == (typeof a === "undefined" ? "undefined" : _typeof(a)) ? m.extend({}, a) : { complete: c || !c && b || m.isFunction(a) && a, duration: a, easing: c && b || b && !m.isFunction(b) && b };return d.duration = m.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in m.fx.speeds ? m.fx.speeds[d.duration] : m.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function () {
	            m.isFunction(d.old) && d.old.call(this), d.queue && m.dequeue(this, d.queue);
	        }, d;
	    }, m.fn.extend({ fadeTo: function fadeTo(a, b, c, d) {
	            return this.filter(U).css("opacity", 0).show().end().animate({ opacity: b }, a, c, d);
	        }, animate: function animate(a, b, c, d) {
	            var e = m.isEmptyObject(a),
	                f = m.speed(b, c, d),
	                g = function g() {
	                var b = kc(this, m.extend({}, a), f);(e || m._data(this, "finish")) && b.stop(!0);
	            };return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
	        }, stop: function stop(a, b, c) {
	            var d = function d(a) {
	                var b = a.stop;delete a.stop, b(c);
	            };return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function () {
	                var b = !0,
	                    e = null != a && a + "queueHooks",
	                    f = m.timers,
	                    g = m._data(this);if (e) g[e] && g[e].stop && d(g[e]);else for (e in g) {
	                    g[e] && g[e].stop && cc.test(e) && d(g[e]);
	                }for (e = f.length; e--;) {
	                    f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));
	                }(b || !c) && m.dequeue(this, a);
	            });
	        }, finish: function finish(a) {
	            return a !== !1 && (a = a || "fx"), this.each(function () {
	                var b,
	                    c = m._data(this),
	                    d = c[a + "queue"],
	                    e = c[a + "queueHooks"],
	                    f = m.timers,
	                    g = d ? d.length : 0;for (c.finish = !0, m.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;) {
	                    f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));
	                }for (b = 0; g > b; b++) {
	                    d[b] && d[b].finish && d[b].finish.call(this);
	                }delete c.finish;
	            });
	        } }), m.each(["toggle", "show", "hide"], function (a, b) {
	        var c = m.fn[b];m.fn[b] = function (a, d, e) {
	            return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(gc(b, !0), a, d, e);
	        };
	    }), m.each({ slideDown: gc("show"), slideUp: gc("hide"), slideToggle: gc("toggle"), fadeIn: { opacity: "show" }, fadeOut: { opacity: "hide" }, fadeToggle: { opacity: "toggle" } }, function (a, b) {
	        m.fn[a] = function (a, c, d) {
	            return this.animate(b, a, c, d);
	        };
	    }), m.timers = [], m.fx.tick = function () {
	        var a,
	            b = m.timers,
	            c = 0;for ($b = m.now(); c < b.length; c++) {
	            a = b[c], a() || b[c] !== a || b.splice(c--, 1);
	        }b.length || m.fx.stop(), $b = void 0;
	    }, m.fx.timer = function (a) {
	        m.timers.push(a), a() ? m.fx.start() : m.timers.pop();
	    }, m.fx.interval = 13, m.fx.start = function () {
	        _b || (_b = setInterval(m.fx.tick, m.fx.interval));
	    }, m.fx.stop = function () {
	        clearInterval(_b), _b = null;
	    }, m.fx.speeds = { slow: 600, fast: 200, _default: 400 }, m.fn.delay = function (a, b) {
	        return a = m.fx ? m.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function (b, c) {
	            var d = setTimeout(b, a);c.stop = function () {
	                clearTimeout(d);
	            };
	        });
	    }, function () {
	        var a, b, c, d, e;b = y.createElement("div"), b.setAttribute("className", "t"), b.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", d = b.getElementsByTagName("a")[0], c = y.createElement("select"), e = c.appendChild(y.createElement("option")), a = b.getElementsByTagName("input")[0], d.style.cssText = "top:1px", k.getSetAttribute = "t" !== b.className, k.style = /top/.test(d.getAttribute("style")), k.hrefNormalized = "/a" === d.getAttribute("href"), k.checkOn = !!a.value, k.optSelected = e.selected, k.enctype = !!y.createElement("form").enctype, c.disabled = !0, k.optDisabled = !e.disabled, a = y.createElement("input"), a.setAttribute("value", ""), k.input = "" === a.getAttribute("value"), a.value = "t", a.setAttribute("type", "radio"), k.radioValue = "t" === a.value;
	    }();var lc = /\r/g;m.fn.extend({ val: function val(a) {
	            var b,
	                c,
	                d,
	                e = this[0];{
	                if (arguments.length) return d = m.isFunction(a), this.each(function (c) {
	                    var e;1 === this.nodeType && (e = d ? a.call(this, c, m(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : m.isArray(e) && (e = m.map(e, function (a) {
	                        return null == a ? "" : a + "";
	                    })), b = m.valHooks[this.type] || m.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e));
	                });if (e) return b = m.valHooks[e.type] || m.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(lc, "") : null == c ? "" : c);
	            }
	        } }), m.extend({ valHooks: { option: { get: function get(a) {
	                    var b = m.find.attr(a, "value");return null != b ? b : m.trim(m.text(a));
	                } }, select: { get: function get(a) {
	                    for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++) {
	                        if (c = d[i], !(!c.selected && i !== e || (k.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && m.nodeName(c.parentNode, "optgroup"))) {
	                            if (b = m(c).val(), f) return b;g.push(b);
	                        }
	                    }return g;
	                }, set: function set(a, b) {
	                    var c,
	                        d,
	                        e = a.options,
	                        f = m.makeArray(b),
	                        g = e.length;while (g--) {
	                        if (d = e[g], m.inArray(m.valHooks.option.get(d), f) >= 0) try {
	                            d.selected = c = !0;
	                        } catch (h) {
	                            d.scrollHeight;
	                        } else d.selected = !1;
	                    }return c || (a.selectedIndex = -1), e;
	                } } } }), m.each(["radio", "checkbox"], function () {
	        m.valHooks[this] = { set: function set(a, b) {
	                return m.isArray(b) ? a.checked = m.inArray(m(a).val(), b) >= 0 : void 0;
	            } }, k.checkOn || (m.valHooks[this].get = function (a) {
	            return null === a.getAttribute("value") ? "on" : a.value;
	        });
	    });var mc,
	        nc,
	        oc = m.expr.attrHandle,
	        pc = /^(?:checked|selected)$/i,
	        qc = k.getSetAttribute,
	        rc = k.input;m.fn.extend({ attr: function attr(a, b) {
	            return V(this, m.attr, a, b, arguments.length > 1);
	        }, removeAttr: function removeAttr(a) {
	            return this.each(function () {
	                m.removeAttr(this, a);
	            });
	        } }), m.extend({ attr: function attr(a, b, c) {
	            var d,
	                e,
	                f = a.nodeType;if (a && 3 !== f && 8 !== f && 2 !== f) return _typeof(a.getAttribute) === K ? m.prop(a, b, c) : (1 === f && m.isXMLDoc(a) || (b = b.toLowerCase(), d = m.attrHooks[b] || (m.expr.match.bool.test(b) ? nc : mc)), void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = m.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), c) : void m.removeAttr(a, b));
	        }, removeAttr: function removeAttr(a, b) {
	            var c,
	                d,
	                e = 0,
	                f = b && b.match(E);if (f && 1 === a.nodeType) while (c = f[e++]) {
	                d = m.propFix[c] || c, m.expr.match.bool.test(c) ? rc && qc || !pc.test(c) ? a[d] = !1 : a[m.camelCase("default-" + c)] = a[d] = !1 : m.attr(a, c, ""), a.removeAttribute(qc ? c : d);
	            }
	        }, attrHooks: { type: { set: function set(a, b) {
	                    if (!k.radioValue && "radio" === b && m.nodeName(a, "input")) {
	                        var c = a.value;return a.setAttribute("type", b), c && (a.value = c), b;
	                    }
	                } } } }), nc = { set: function set(a, b, c) {
	            return b === !1 ? m.removeAttr(a, c) : rc && qc || !pc.test(c) ? a.setAttribute(!qc && m.propFix[c] || c, c) : a[m.camelCase("default-" + c)] = a[c] = !0, c;
	        } }, m.each(m.expr.match.bool.source.match(/\w+/g), function (a, b) {
	        var c = oc[b] || m.find.attr;oc[b] = rc && qc || !pc.test(b) ? function (a, b, d) {
	            var e, f;return d || (f = oc[b], oc[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, oc[b] = f), e;
	        } : function (a, b, c) {
	            return c ? void 0 : a[m.camelCase("default-" + b)] ? b.toLowerCase() : null;
	        };
	    }), rc && qc || (m.attrHooks.value = { set: function set(a, b, c) {
	            return m.nodeName(a, "input") ? void (a.defaultValue = b) : mc && mc.set(a, b, c);
	        } }), qc || (mc = { set: function set(a, b, c) {
	            var d = a.getAttributeNode(c);return d || a.setAttributeNode(d = a.ownerDocument.createAttribute(c)), d.value = b += "", "value" === c || b === a.getAttribute(c) ? b : void 0;
	        } }, oc.id = oc.name = oc.coords = function (a, b, c) {
	        var d;return c ? void 0 : (d = a.getAttributeNode(b)) && "" !== d.value ? d.value : null;
	    }, m.valHooks.button = { get: function get(a, b) {
	            var c = a.getAttributeNode(b);return c && c.specified ? c.value : void 0;
	        }, set: mc.set }, m.attrHooks.contenteditable = { set: function set(a, b, c) {
	            mc.set(a, "" === b ? !1 : b, c);
	        } }, m.each(["width", "height"], function (a, b) {
	        m.attrHooks[b] = { set: function set(a, c) {
	                return "" === c ? (a.setAttribute(b, "auto"), c) : void 0;
	            } };
	    })), k.style || (m.attrHooks.style = { get: function get(a) {
	            return a.style.cssText || void 0;
	        }, set: function set(a, b) {
	            return a.style.cssText = b + "";
	        } });var sc = /^(?:input|select|textarea|button|object)$/i,
	        tc = /^(?:a|area)$/i;m.fn.extend({ prop: function prop(a, b) {
	            return V(this, m.prop, a, b, arguments.length > 1);
	        }, removeProp: function removeProp(a) {
	            return a = m.propFix[a] || a, this.each(function () {
	                try {
	                    this[a] = void 0, delete this[a];
	                } catch (b) {}
	            });
	        } }), m.extend({ propFix: { "for": "htmlFor", "class": "className" }, prop: function prop(a, b, c) {
	            var d,
	                e,
	                f,
	                g = a.nodeType;if (a && 3 !== g && 8 !== g && 2 !== g) return f = 1 !== g || !m.isXMLDoc(a), f && (b = m.propFix[b] || b, e = m.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b];
	        }, propHooks: { tabIndex: { get: function get(a) {
	                    var b = m.find.attr(a, "tabindex");return b ? parseInt(b, 10) : sc.test(a.nodeName) || tc.test(a.nodeName) && a.href ? 0 : -1;
	                } } } }), k.hrefNormalized || m.each(["href", "src"], function (a, b) {
	        m.propHooks[b] = { get: function get(a) {
	                return a.getAttribute(b, 4);
	            } };
	    }), k.optSelected || (m.propHooks.selected = { get: function get(a) {
	            var b = a.parentNode;return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null;
	        } }), m.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
	        m.propFix[this.toLowerCase()] = this;
	    }), k.enctype || (m.propFix.enctype = "encoding");var uc = /[\t\r\n\f]/g;m.fn.extend({ addClass: function addClass(a) {
	            var b,
	                c,
	                d,
	                e,
	                f,
	                g,
	                h = 0,
	                i = this.length,
	                j = "string" == typeof a && a;if (m.isFunction(a)) return this.each(function (b) {
	                m(this).addClass(a.call(this, b, this.className));
	            });if (j) for (b = (a || "").match(E) || []; i > h; h++) {
	                if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(uc, " ") : " ")) {
	                    f = 0;while (e = b[f++]) {
	                        d.indexOf(" " + e + " ") < 0 && (d += e + " ");
	                    }g = m.trim(d), c.className !== g && (c.className = g);
	                }
	            }return this;
	        }, removeClass: function removeClass(a) {
	            var b,
	                c,
	                d,
	                e,
	                f,
	                g,
	                h = 0,
	                i = this.length,
	                j = 0 === arguments.length || "string" == typeof a && a;if (m.isFunction(a)) return this.each(function (b) {
	                m(this).removeClass(a.call(this, b, this.className));
	            });if (j) for (b = (a || "").match(E) || []; i > h; h++) {
	                if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(uc, " ") : "")) {
	                    f = 0;while (e = b[f++]) {
	                        while (d.indexOf(" " + e + " ") >= 0) {
	                            d = d.replace(" " + e + " ", " ");
	                        }
	                    }g = a ? m.trim(d) : "", c.className !== g && (c.className = g);
	                }
	            }return this;
	        }, toggleClass: function toggleClass(a, b) {
	            var c = typeof a === "undefined" ? "undefined" : _typeof(a);return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(m.isFunction(a) ? function (c) {
	                m(this).toggleClass(a.call(this, c, this.className, b), b);
	            } : function () {
	                if ("string" === c) {
	                    var b,
	                        d = 0,
	                        e = m(this),
	                        f = a.match(E) || [];while (b = f[d++]) {
	                        e.hasClass(b) ? e.removeClass(b) : e.addClass(b);
	                    }
	                } else (c === K || "boolean" === c) && (this.className && m._data(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : m._data(this, "__className__") || "");
	            });
	        }, hasClass: function hasClass(a) {
	            for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++) {
	                if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(uc, " ").indexOf(b) >= 0) return !0;
	            }return !1;
	        } }), m.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (a, b) {
	        m.fn[b] = function (a, c) {
	            return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
	        };
	    }), m.fn.extend({ hover: function hover(a, b) {
	            return this.mouseenter(a).mouseleave(b || a);
	        }, bind: function bind(a, b, c) {
	            return this.on(a, null, b, c);
	        }, unbind: function unbind(a, b) {
	            return this.off(a, null, b);
	        }, delegate: function delegate(a, b, c, d) {
	            return this.on(b, a, c, d);
	        }, undelegate: function undelegate(a, b, c) {
	            return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c);
	        } });var vc = m.now(),
	        wc = /\?/,
	        xc = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;m.parseJSON = function (b) {
	        if (a.JSON && a.JSON.parse) return a.JSON.parse(b + "");var c,
	            d = null,
	            e = m.trim(b + "");return e && !m.trim(e.replace(xc, function (a, b, e, f) {
	            return c && b && (d = 0), 0 === d ? a : (c = e || b, d += !f - !e, "");
	        })) ? Function("return " + e)() : m.error("Invalid JSON: " + b);
	    }, m.parseXML = function (b) {
	        var c, d;if (!b || "string" != typeof b) return null;try {
	            a.DOMParser ? (d = new DOMParser(), c = d.parseFromString(b, "text/xml")) : (c = new ActiveXObject("Microsoft.XMLDOM"), c.async = "false", c.loadXML(b));
	        } catch (e) {
	            c = void 0;
	        }return c && c.documentElement && !c.getElementsByTagName("parsererror").length || m.error("Invalid XML: " + b), c;
	    };var yc,
	        zc,
	        Ac = /#.*$/,
	        Bc = /([?&])_=[^&]*/,
	        Cc = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
	        Dc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	        Ec = /^(?:GET|HEAD)$/,
	        Fc = /^\/\//,
	        Gc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
	        Hc = {},
	        Ic = {},
	        Jc = "*/".concat("*");try {
	        zc = location.href;
	    } catch (Kc) {
	        zc = y.createElement("a"), zc.href = "", zc = zc.href;
	    }yc = Gc.exec(zc.toLowerCase()) || [];function Lc(a) {
	        return function (b, c) {
	            "string" != typeof b && (c = b, b = "*");var d,
	                e = 0,
	                f = b.toLowerCase().match(E) || [];if (m.isFunction(c)) while (d = f[e++]) {
	                "+" === d.charAt(0) ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c);
	            }
	        };
	    }function Mc(a, b, c, d) {
	        var e = {},
	            f = a === Ic;function g(h) {
	            var i;return e[h] = !0, m.each(a[h] || [], function (a, h) {
	                var j = h(b, c, d);return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1);
	            }), i;
	        }return g(b.dataTypes[0]) || !e["*"] && g("*");
	    }function Nc(a, b) {
	        var c,
	            d,
	            e = m.ajaxSettings.flatOptions || {};for (d in b) {
	            void 0 !== b[d] && ((e[d] ? a : c || (c = {}))[d] = b[d]);
	        }return c && m.extend(!0, a, c), a;
	    }function Oc(a, b, c) {
	        var d,
	            e,
	            f,
	            g,
	            h = a.contents,
	            i = a.dataTypes;while ("*" === i[0]) {
	            i.shift(), void 0 === e && (e = a.mimeType || b.getResponseHeader("Content-Type"));
	        }if (e) for (g in h) {
	            if (h[g] && h[g].test(e)) {
	                i.unshift(g);break;
	            }
	        }if (i[0] in c) f = i[0];else {
	            for (g in c) {
	                if (!i[0] || a.converters[g + " " + i[0]]) {
	                    f = g;break;
	                }d || (d = g);
	            }f = f || d;
	        }return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0;
	    }function Pc(a, b, c, d) {
	        var e,
	            f,
	            g,
	            h,
	            i,
	            j = {},
	            k = a.dataTypes.slice();if (k[1]) for (g in a.converters) {
	            j[g.toLowerCase()] = a.converters[g];
	        }f = k.shift();while (f) {
	            if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift()) if ("*" === f) f = i;else if ("*" !== i && i !== f) {
	                if (g = j[i + " " + f] || j["* " + f], !g) for (e in j) {
	                    if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
	                        g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));break;
	                    }
	                }if (g !== !0) if (g && a["throws"]) b = g(b);else try {
	                    b = g(b);
	                } catch (l) {
	                    return { state: "parsererror", error: g ? l : "No conversion from " + i + " to " + f };
	                }
	            }
	        }return { state: "success", data: b };
	    }m.extend({ active: 0, lastModified: {}, etag: {}, ajaxSettings: { url: zc, type: "GET", isLocal: Dc.test(yc[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: { "*": Jc, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript" }, contents: { xml: /xml/, html: /html/, json: /json/ }, responseFields: { xml: "responseXML", text: "responseText", json: "responseJSON" }, converters: { "* text": String, "text html": !0, "text json": m.parseJSON, "text xml": m.parseXML }, flatOptions: { url: !0, context: !0 } }, ajaxSetup: function ajaxSetup(a, b) {
	            return b ? Nc(Nc(a, m.ajaxSettings), b) : Nc(m.ajaxSettings, a);
	        }, ajaxPrefilter: Lc(Hc), ajaxTransport: Lc(Ic), ajax: function ajax(a, b) {
	            "object" == (typeof a === "undefined" ? "undefined" : _typeof(a)) && (b = a, a = void 0), b = b || {};var c,
	                d,
	                e,
	                f,
	                g,
	                h,
	                i,
	                j,
	                k = m.ajaxSetup({}, b),
	                l = k.context || k,
	                n = k.context && (l.nodeType || l.jquery) ? m(l) : m.event,
	                o = m.Deferred(),
	                p = m.Callbacks("once memory"),
	                q = k.statusCode || {},
	                r = {},
	                s = {},
	                t = 0,
	                u = "canceled",
	                v = { readyState: 0, getResponseHeader: function getResponseHeader(a) {
	                    var b;if (2 === t) {
	                        if (!j) {
	                            j = {};while (b = Cc.exec(f)) {
	                                j[b[1].toLowerCase()] = b[2];
	                            }
	                        }b = j[a.toLowerCase()];
	                    }return null == b ? null : b;
	                }, getAllResponseHeaders: function getAllResponseHeaders() {
	                    return 2 === t ? f : null;
	                }, setRequestHeader: function setRequestHeader(a, b) {
	                    var c = a.toLowerCase();return t || (a = s[c] = s[c] || a, r[a] = b), this;
	                }, overrideMimeType: function overrideMimeType(a) {
	                    return t || (k.mimeType = a), this;
	                }, statusCode: function statusCode(a) {
	                    var b;if (a) if (2 > t) for (b in a) {
	                        q[b] = [q[b], a[b]];
	                    } else v.always(a[v.status]);return this;
	                }, abort: function abort(a) {
	                    var b = a || u;return i && i.abort(b), x(0, b), this;
	                } };if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || zc) + "").replace(Ac, "").replace(Fc, yc[1] + "//"), k.type = b.method || b.type || k.method || k.type, k.dataTypes = m.trim(k.dataType || "*").toLowerCase().match(E) || [""], null == k.crossDomain && (c = Gc.exec(k.url.toLowerCase()), k.crossDomain = !(!c || c[1] === yc[1] && c[2] === yc[2] && (c[3] || ("http:" === c[1] ? "80" : "443")) === (yc[3] || ("http:" === yc[1] ? "80" : "443")))), k.data && k.processData && "string" != typeof k.data && (k.data = m.param(k.data, k.traditional)), Mc(Hc, k, b, v), 2 === t) return v;h = k.global, h && 0 === m.active++ && m.event.trigger("ajaxStart"), k.type = k.type.toUpperCase(), k.hasContent = !Ec.test(k.type), e = k.url, k.hasContent || (k.data && (e = k.url += (wc.test(e) ? "&" : "?") + k.data, delete k.data), k.cache === !1 && (k.url = Bc.test(e) ? e.replace(Bc, "$1_=" + vc++) : e + (wc.test(e) ? "&" : "?") + "_=" + vc++)), k.ifModified && (m.lastModified[e] && v.setRequestHeader("If-Modified-Since", m.lastModified[e]), m.etag[e] && v.setRequestHeader("If-None-Match", m.etag[e])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + Jc + "; q=0.01" : "") : k.accepts["*"]);for (d in k.headers) {
	                v.setRequestHeader(d, k.headers[d]);
	            }if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t)) return v.abort();u = "abort";for (d in { success: 1, error: 1, complete: 1 }) {
	                v[d](k[d]);
	            }if (i = Mc(Ic, k, b, v)) {
	                v.readyState = 1, h && n.trigger("ajaxSend", [v, k]), k.async && k.timeout > 0 && (g = setTimeout(function () {
	                    v.abort("timeout");
	                }, k.timeout));try {
	                    t = 1, i.send(r, x);
	                } catch (w) {
	                    if (!(2 > t)) throw w;x(-1, w);
	                }
	            } else x(-1, "No Transport");function x(a, b, c, d) {
	                var j,
	                    r,
	                    s,
	                    u,
	                    w,
	                    x = b;2 !== t && (t = 2, g && clearTimeout(g), i = void 0, f = d || "", v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, c && (u = Oc(k, v, c)), u = Pc(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (m.lastModified[e] = w), w = v.getResponseHeader("etag"), w && (m.etag[e] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + "", j ? o.resolveWith(l, [r, x, v]) : o.rejectWith(l, [v, x, s]), v.statusCode(q), q = void 0, h && n.trigger(j ? "ajaxSuccess" : "ajaxError", [v, k, j ? r : s]), p.fireWith(l, [v, x]), h && (n.trigger("ajaxComplete", [v, k]), --m.active || m.event.trigger("ajaxStop")));
	            }return v;
	        }, getJSON: function getJSON(a, b, c) {
	            return m.get(a, b, c, "json");
	        }, getScript: function getScript(a, b) {
	            return m.get(a, void 0, b, "script");
	        } }), m.each(["get", "post"], function (a, b) {
	        m[b] = function (a, c, d, e) {
	            return m.isFunction(c) && (e = e || d, d = c, c = void 0), m.ajax({ url: a, type: b, dataType: e, data: c, success: d });
	        };
	    }), m.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (a, b) {
	        m.fn[b] = function (a) {
	            return this.on(b, a);
	        };
	    }), m._evalUrl = function (a) {
	        return m.ajax({ url: a, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0 });
	    }, m.fn.extend({ wrapAll: function wrapAll(a) {
	            if (m.isFunction(a)) return this.each(function (b) {
	                m(this).wrapAll(a.call(this, b));
	            });if (this[0]) {
	                var b = m(a, this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode && b.insertBefore(this[0]), b.map(function () {
	                    var a = this;while (a.firstChild && 1 === a.firstChild.nodeType) {
	                        a = a.firstChild;
	                    }return a;
	                }).append(this);
	            }return this;
	        }, wrapInner: function wrapInner(a) {
	            return this.each(m.isFunction(a) ? function (b) {
	                m(this).wrapInner(a.call(this, b));
	            } : function () {
	                var b = m(this),
	                    c = b.contents();c.length ? c.wrapAll(a) : b.append(a);
	            });
	        }, wrap: function wrap(a) {
	            var b = m.isFunction(a);return this.each(function (c) {
	                m(this).wrapAll(b ? a.call(this, c) : a);
	            });
	        }, unwrap: function unwrap() {
	            return this.parent().each(function () {
	                m.nodeName(this, "body") || m(this).replaceWith(this.childNodes);
	            }).end();
	        } }), m.expr.filters.hidden = function (a) {
	        return a.offsetWidth <= 0 && a.offsetHeight <= 0 || !k.reliableHiddenOffsets() && "none" === (a.style && a.style.display || m.css(a, "display"));
	    }, m.expr.filters.visible = function (a) {
	        return !m.expr.filters.hidden(a);
	    };var Qc = /%20/g,
	        Rc = /\[\]$/,
	        Sc = /\r?\n/g,
	        Tc = /^(?:submit|button|image|reset|file)$/i,
	        Uc = /^(?:input|select|textarea|keygen)/i;function Vc(a, b, c, d) {
	        var e;if (m.isArray(b)) m.each(b, function (b, e) {
	            c || Rc.test(a) ? d(a, e) : Vc(a + "[" + ("object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) ? b : "") + "]", e, c, d);
	        });else if (c || "object" !== m.type(b)) d(a, b);else for (e in b) {
	            Vc(a + "[" + e + "]", b[e], c, d);
	        }
	    }m.param = function (a, b) {
	        var c,
	            d = [],
	            e = function e(a, b) {
	            b = m.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b);
	        };if (void 0 === b && (b = m.ajaxSettings && m.ajaxSettings.traditional), m.isArray(a) || a.jquery && !m.isPlainObject(a)) m.each(a, function () {
	            e(this.name, this.value);
	        });else for (c in a) {
	            Vc(c, a[c], b, e);
	        }return d.join("&").replace(Qc, "+");
	    }, m.fn.extend({ serialize: function serialize() {
	            return m.param(this.serializeArray());
	        }, serializeArray: function serializeArray() {
	            return this.map(function () {
	                var a = m.prop(this, "elements");return a ? m.makeArray(a) : this;
	            }).filter(function () {
	                var a = this.type;return this.name && !m(this).is(":disabled") && Uc.test(this.nodeName) && !Tc.test(a) && (this.checked || !W.test(a));
	            }).map(function (a, b) {
	                var c = m(this).val();return null == c ? null : m.isArray(c) ? m.map(c, function (a) {
	                    return { name: b.name, value: a.replace(Sc, "\r\n") };
	                }) : { name: b.name, value: c.replace(Sc, "\r\n") };
	            }).get();
	        } }), m.ajaxSettings.xhr = void 0 !== a.ActiveXObject ? function () {
	        return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && Zc() || $c();
	    } : Zc;var Wc = 0,
	        Xc = {},
	        Yc = m.ajaxSettings.xhr();a.ActiveXObject && m(a).on("unload", function () {
	        for (var a in Xc) {
	            Xc[a](void 0, !0);
	        }
	    }), k.cors = !!Yc && "withCredentials" in Yc, Yc = k.ajax = !!Yc, Yc && m.ajaxTransport(function (a) {
	        if (!a.crossDomain || k.cors) {
	            var _b3;return { send: function send(c, d) {
	                    var e,
	                        f = a.xhr(),
	                        g = ++Wc;if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields) for (e in a.xhrFields) {
	                        f[e] = a.xhrFields[e];
	                    }a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest");for (e in c) {
	                        void 0 !== c[e] && f.setRequestHeader(e, c[e] + "");
	                    }f.send(a.hasContent && a.data || null), _b3 = function b(c, e) {
	                        var h, i, j;if (_b3 && (e || 4 === f.readyState)) if (delete Xc[g], _b3 = void 0, f.onreadystatechange = m.noop, e) 4 !== f.readyState && f.abort();else {
	                            j = {}, h = f.status, "string" == typeof f.responseText && (j.text = f.responseText);try {
	                                i = f.statusText;
	                            } catch (k) {
	                                i = "";
	                            }h || !a.isLocal || a.crossDomain ? 1223 === h && (h = 204) : h = j.text ? 200 : 404;
	                        }j && d(h, i, j, f.getAllResponseHeaders());
	                    }, a.async ? 4 === f.readyState ? setTimeout(_b3) : f.onreadystatechange = Xc[g] = _b3 : _b3();
	                }, abort: function abort() {
	                    _b3 && _b3(void 0, !0);
	                } };
	        }
	    });function Zc() {
	        try {
	            return new a.XMLHttpRequest();
	        } catch (b) {}
	    }function $c() {
	        try {
	            return new a.ActiveXObject("Microsoft.XMLHTTP");
	        } catch (b) {}
	    }m.ajaxSetup({ accepts: { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" }, contents: { script: /(?:java|ecma)script/ }, converters: { "text script": function textScript(a) {
	                return m.globalEval(a), a;
	            } } }), m.ajaxPrefilter("script", function (a) {
	        void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1);
	    }), m.ajaxTransport("script", function (a) {
	        if (a.crossDomain) {
	            var b,
	                c = y.head || m("head")[0] || y.documentElement;return { send: function send(d, e) {
	                    b = y.createElement("script"), b.async = !0, a.scriptCharset && (b.charset = a.scriptCharset), b.src = a.url, b.onload = b.onreadystatechange = function (a, c) {
	                        (c || !b.readyState || /loaded|complete/.test(b.readyState)) && (b.onload = b.onreadystatechange = null, b.parentNode && b.parentNode.removeChild(b), b = null, c || e(200, "success"));
	                    }, c.insertBefore(b, c.firstChild);
	                }, abort: function abort() {
	                    b && b.onload(void 0, !0);
	                } };
	        }
	    });var _c = [],
	        ad = /(=)\?(?=&|$)|\?\?/;m.ajaxSetup({ jsonp: "callback", jsonpCallback: function jsonpCallback() {
	            var a = _c.pop() || m.expando + "_" + vc++;return this[a] = !0, a;
	        } }), m.ajaxPrefilter("json jsonp", function (b, c, d) {
	        var e,
	            f,
	            g,
	            h = b.jsonp !== !1 && (ad.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && ad.test(b.data) && "data");return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = m.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(ad, "$1" + e) : b.jsonp !== !1 && (b.url += (wc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function () {
	            return g || m.error(e + " was not called"), g[0];
	        }, b.dataTypes[0] = "json", f = a[e], a[e] = function () {
	            g = arguments;
	        }, d.always(function () {
	            a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, _c.push(e)), g && m.isFunction(f) && f(g[0]), g = f = void 0;
	        }), "script") : void 0;
	    }), m.parseHTML = function (a, b, c) {
	        if (!a || "string" != typeof a) return null;"boolean" == typeof b && (c = b, b = !1), b = b || y;var d = u.exec(a),
	            e = !c && [];return d ? [b.createElement(d[1])] : (d = m.buildFragment([a], b, e), e && e.length && m(e).remove(), m.merge([], d.childNodes));
	    };var bd = m.fn.load;m.fn.load = function (a, b, c) {
	        if ("string" != typeof a && bd) return bd.apply(this, arguments);var d,
	            e,
	            f,
	            g = this,
	            h = a.indexOf(" ");return h >= 0 && (d = m.trim(a.slice(h, a.length)), a = a.slice(0, h)), m.isFunction(b) ? (c = b, b = void 0) : b && "object" == (typeof b === "undefined" ? "undefined" : _typeof(b)) && (f = "POST"), g.length > 0 && m.ajax({ url: a, type: f, dataType: "html", data: b }).done(function (a) {
	            e = arguments, g.html(d ? m("<div>").append(m.parseHTML(a)).find(d) : a);
	        }).complete(c && function (a, b) {
	            g.each(c, e || [a.responseText, b, a]);
	        }), this;
	    }, m.expr.filters.animated = function (a) {
	        return m.grep(m.timers, function (b) {
	            return a === b.elem;
	        }).length;
	    };var cd = a.document.documentElement;function dd(a) {
	        return m.isWindow(a) ? a : 9 === a.nodeType ? a.defaultView || a.parentWindow : !1;
	    }m.offset = { setOffset: function setOffset(a, b, c) {
	            var d,
	                e,
	                f,
	                g,
	                h,
	                i,
	                j,
	                k = m.css(a, "position"),
	                l = m(a),
	                n = {};"static" === k && (a.style.position = "relative"), h = l.offset(), f = m.css(a, "top"), i = m.css(a, "left"), j = ("absolute" === k || "fixed" === k) && m.inArray("auto", [f, i]) > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), m.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (n.top = b.top - h.top + g), null != b.left && (n.left = b.left - h.left + e), "using" in b ? b.using.call(a, n) : l.css(n);
	        } }, m.fn.extend({ offset: function offset(a) {
	            if (arguments.length) return void 0 === a ? this : this.each(function (b) {
	                m.offset.setOffset(this, a, b);
	            });var b,
	                c,
	                d = { top: 0, left: 0 },
	                e = this[0],
	                f = e && e.ownerDocument;if (f) return b = f.documentElement, m.contains(b, e) ? (_typeof(e.getBoundingClientRect) !== K && (d = e.getBoundingClientRect()), c = dd(f), { top: d.top + (c.pageYOffset || b.scrollTop) - (b.clientTop || 0), left: d.left + (c.pageXOffset || b.scrollLeft) - (b.clientLeft || 0) }) : d;
	        }, position: function position() {
	            if (this[0]) {
	                var a,
	                    b,
	                    c = { top: 0, left: 0 },
	                    d = this[0];return "fixed" === m.css(d, "position") ? b = d.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), m.nodeName(a[0], "html") || (c = a.offset()), c.top += m.css(a[0], "borderTopWidth", !0), c.left += m.css(a[0], "borderLeftWidth", !0)), { top: b.top - c.top - m.css(d, "marginTop", !0), left: b.left - c.left - m.css(d, "marginLeft", !0) };
	            }
	        }, offsetParent: function offsetParent() {
	            return this.map(function () {
	                var a = this.offsetParent || cd;while (a && !m.nodeName(a, "html") && "static" === m.css(a, "position")) {
	                    a = a.offsetParent;
	                }return a || cd;
	            });
	        } }), m.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (a, b) {
	        var c = /Y/.test(b);m.fn[a] = function (d) {
	            return V(this, function (a, d, e) {
	                var f = dd(a);return void 0 === e ? f ? b in f ? f[b] : f.document.documentElement[d] : a[d] : void (f ? f.scrollTo(c ? m(f).scrollLeft() : e, c ? e : m(f).scrollTop()) : a[d] = e);
	            }, a, d, arguments.length, null);
	        };
	    }), m.each(["top", "left"], function (a, b) {
	        m.cssHooks[b] = Lb(k.pixelPosition, function (a, c) {
	            return c ? (c = Jb(a, b), Hb.test(c) ? m(a).position()[b] + "px" : c) : void 0;
	        });
	    }), m.each({ Height: "height", Width: "width" }, function (a, b) {
	        m.each({ padding: "inner" + a, content: b, "": "outer" + a }, function (c, d) {
	            m.fn[d] = function (d, e) {
	                var f = arguments.length && (c || "boolean" != typeof d),
	                    g = c || (d === !0 || e === !0 ? "margin" : "border");return V(this, function (b, c, d) {
	                    var e;return m.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? m.css(b, c, g) : m.style(b, c, d, g);
	                }, b, f ? d : void 0, f, null);
	            };
	        });
	    }), m.fn.size = function () {
	        return this.length;
	    }, m.fn.andSelf = m.fn.addBack, "function" == "function" && __webpack_require__(3) && !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return m;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));var ed = a.jQuery,
	        fd = a.$;return m.noConflict = function (b) {
	        return a.$ === m && (a.$ = fd), b && a.jQuery === m && (a.jQuery = ed), m;
	    }, (typeof b === "undefined" ? "undefined" : _typeof(b)) === K && (a.jQuery = a.$ = m), m;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var jQuery;if(true){jQuery=__webpack_require__(1);var wx=__webpack_require__(5)}else jQuery=$;!function(e){function n(n){var i=function(e){var i,r,s;i={debug:n.debug||!1,appId:e.appid,timestamp:e.timestamp,nonceStr:e.noncestr,signature:e.sign,jsApiList:["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareWeibo"]},r=window.WX_CONFIG||{title:n.title,desc:n.desc,link:n.link,imgUrl:n.imgUrl,success:n.success,cancel:n.cancel},s={title:r.title||document.title,desc:r.desc||document.title,imgUrl:r.imgUrl,success:r.success,cancel:r.cancel,link:r.link||window.location.href},wx.config(i),wx.ready(function(){wx.onMenuShareTimeline(s),wx.onMenuShareAppMessage(s),wx.onMenuShareQQ(s),wx.onMenuShareWeibo(s)})};if(window.wx_share){var r=window.wx_share;e.getJSON(r,i)}else console.error("window.wx_share不存在")}"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=n:window.dxy_wechat_share=n}(jQuery);
	//# sourceMappingURL=dxy-wechat-share.min.js.map


/***/ },
/* 5 */
/***/ function(module, exports) {

	!function (a, b) {
	    module.exports = b(a)
	}(window, function (a, b) {
	    function c(b, c, d) {
	        a.WeixinJSBridge ? WeixinJSBridge.invoke(b, e(c), function (a) {
	            h(b, a, d)
	        }) : k(b, d)
	    }
	
	    function d(b, c, d) {
	        a.WeixinJSBridge ? WeixinJSBridge.on(b, function (a) {
	            d && d.trigger && d.trigger(a), h(b, a, c)
	        }) : d ? k(b, d) : k(b, c)
	    }
	
	    function e(a) {
	        return a = a || {}, a.appId = D.appId, a.verifyAppId = D.appId, a.verifySignType = "sha1", a.verifyTimestamp = D.timestamp + "", a.verifyNonceStr = D.nonceStr, a.verifySignature = D.signature, a
	    }
	
	    function f(a) {
	        return {
	            timeStamp: a.timestamp + "",
	            nonceStr: a.nonceStr,
	            "package": a["package"],
	            paySign: a.paySign,
	            signType: a.signType || "SHA1"
	        }
	    }
	
	    function g(a) {
	        return a.postalCode = a.addressPostalCode, delete a.addressPostalCode, a.provinceName = a.proviceFirstStageName, delete a.proviceFirstStageName, a.cityName = a.addressCitySecondStageName, delete a.addressCitySecondStageName, a.countryName = a.addressCountiesThirdStageName, delete a.addressCountiesThirdStageName, a.detailInfo = a.addressDetailInfo, delete a.addressDetailInfo, a
	    }
	
	    function h(a, b, c) {
	        "openEnterpriseChat" == a && (b.errCode = b.err_code), delete b.err_code, delete b.err_desc, delete b.err_detail;
	        var d = b.errMsg;
	        d || (d = b.err_msg, delete b.err_msg, d = i(a, d), b.errMsg = d), c = c || {}, c._complete && (c._complete(b), delete c._complete), d = b.errMsg || "", D.debug && !c.isInnerInvoke && alert(JSON.stringify(b));
	        var e = d.indexOf(":"), f = d.substring(e + 1);
	        switch (f) {
	            case"ok":
	                c.success && c.success(b);
	                break;
	            case"cancel":
	                c.cancel && c.cancel(b);
	                break;
	            default:
	                c.fail && c.fail(b)
	        }
	        c.complete && c.complete(b)
	    }
	
	    function i(a, b) {
	        var c = a, d = q[c];
	        d && (c = d);
	        var e = "ok";
	        if (b) {
	            var f = b.indexOf(":");
	            e = b.substring(f + 1), "confirm" == e && (e = "ok"), "failed" == e && (e = "fail"), -1 != e.indexOf("failed_") && (e = e.substring(7)), -1 != e.indexOf("fail_") && (e = e.substring(5)), e = e.replace(/_/g, " "), e = e.toLowerCase(), ("access denied" == e || "no permission to execute" == e) && (e = "permission denied"), "config" == c && "function not exist" == e && (e = "ok"), "" == e && (e = "fail")
	        }
	        return b = c + ":" + e
	    }
	
	    function j(a) {
	        if (a) {
	            for (var b = 0, c = a.length; c > b; ++b) {
	                var d = a[b], e = p[d];
	                e && (a[b] = e)
	            }
	            return a
	        }
	    }
	
	    function k(a, b) {
	        if (!(!D.debug || b && b.isInnerInvoke)) {
	            var c = q[a];
	            c && (a = c), b && b._complete && delete b._complete, console.log('"' + a + '",', b || "")
	        }
	    }
	
	    function l(a) {
	        if (!(v || w || D.debug || "6.0.2" > A || C.systemType < 0)) {
	            var b = new Image;
	            C.appId = D.appId, C.initTime = B.initEndTime - B.initStartTime, C.preVerifyTime = B.preVerifyEndTime - B.preVerifyStartTime, I.getNetworkType({
	                isInnerInvoke: !0,
	                success: function (a) {
	                    C.networkType = a.networkType;
	                    var c = "https://open.weixin.qq.com/sdk/report?v=" + C.version + "&o=" + C.isPreVerifyOk + "&s=" + C.systemType + "&c=" + C.clientVersion + "&a=" + C.appId + "&n=" + C.networkType + "&i=" + C.initTime + "&p=" + C.preVerifyTime + "&u=" + C.url;
	                    b.src = c
	                }
	            })
	        }
	    }
	
	    function m() {
	        return (new Date).getTime()
	    }
	
	    function n(b) {
	        x && (a.WeixinJSBridge ? b() : r.addEventListener && r.addEventListener("WeixinJSBridgeReady", b, !1))
	    }
	
	    function o() {
	        I.invoke || (I.invoke = function (b, c, d) {
	            a.WeixinJSBridge && WeixinJSBridge.invoke(b, e(c), d)
	        }, I.on = function (b, c) {
	            a.WeixinJSBridge && WeixinJSBridge.on(b, c)
	        })
	    }
	
	    if (!a.jWeixin) {
	        var p = {
	            config: "preVerifyJSAPI",
	            onMenuShareTimeline: "menu:share:timeline",
	            onMenuShareAppMessage: "menu:share:appmessage",
	            onMenuShareQQ: "menu:share:qq",
	            onMenuShareWeibo: "menu:share:weiboApp",
	            onMenuShareQZone: "menu:share:QZone",
	            previewImage: "imagePreview",
	            getLocation: "geoLocation",
	            openProductSpecificView: "openProductViewWithPid",
	            addCard: "batchAddCard",
	            openCard: "batchViewCard",
	            chooseWXPay: "getBrandWCPayRequest",
	            openEnterpriseRedPacket: "getRecevieBizHongBaoRequest",
	            startSearchBeacons: "startMonitoringBeacons",
	            stopSearchBeacons: "stopMonitoringBeacons",
	            onSearchBeacons: "onBeaconsInRange",
	            consumeAndShareCard: "consumedShareCard",
	            openAddress: "editAddress"
	        }, q = function () {
	            var a = {};
	            for (var b in p)a[p[b]] = b;
	            return a
	        }(), r = a.document, s = r.title, t = navigator.userAgent.toLowerCase(), u = navigator.platform.toLowerCase(), v = !(!u.match("mac") && !u.match("win")), w = -1 != t.indexOf("wxdebugger"), x = -1 != t.indexOf("micromessenger"), y = -1 != t.indexOf("android"), z = -1 != t.indexOf("iphone") || -1 != t.indexOf("ipad"), A = function () {
	            var a = t.match(/micromessenger\/(\d+\.\d+\.\d+)/) || t.match(/micromessenger\/(\d+\.\d+)/);
	            return a ? a[1] : ""
	        }(), B = {initStartTime: m(), initEndTime: 0, preVerifyStartTime: 0, preVerifyEndTime: 0}, C = {
	            version: 1,
	            appId: "",
	            initTime: 0,
	            preVerifyTime: 0,
	            networkType: "",
	            isPreVerifyOk: 1,
	            systemType: z ? 1 : y ? 2 : -1,
	            clientVersion: A,
	            url: encodeURIComponent(location.href)
	        }, D = {}, E = {_completes: []}, F = {state: 0, data: {}};
	        n(function () {
	            B.initEndTime = m()
	        });
	        var G = !1, H = [], I = {
	            config: function (a) {
	                D = a, k("config", a);
	                var b = D.check === !1 ? !1 : !0;
	                n(function () {
	                    if (b)c(p.config, {verifyJsApiList: j(D.jsApiList)}, function () {
	                        E._complete = function (a) {
	                            B.preVerifyEndTime = m(), F.state = 1, F.data = a
	                        }, E.success = function (a) {
	                            C.isPreVerifyOk = 0
	                        }, E.fail = function (a) {
	                            E._fail ? E._fail(a) : F.state = -1
	                        };
	                        var a = E._completes;
	                        return a.push(function () {
	                            l()
	                        }), E.complete = function (b) {
	                            for (var c = 0, d = a.length; d > c; ++c)a[c]();
	                            E._completes = []
	                        }, E
	                    }()), B.preVerifyStartTime = m(); else {
	                        F.state = 1;
	                        for (var a = E._completes, d = 0, e = a.length; e > d; ++d)a[d]();
	                        E._completes = []
	                    }
	                }), D.beta && o()
	            }, ready: function (a) {
	                0 != F.state ? a() : (E._completes.push(a), !x && D.debug && a())
	            }, error: function (a) {
	                "6.0.2" > A || (-1 == F.state ? a(F.data) : E._fail = a)
	            }, checkJsApi: function (a) {
	                var b = function (a) {
	                    var b = a.checkResult;
	                    for (var c in b) {
	                        var d = q[c];
	                        d && (b[d] = b[c], delete b[c])
	                    }
	                    return a
	                };
	                c("checkJsApi", {jsApiList: j(a.jsApiList)}, function () {
	                    return a._complete = function (a) {
	                        if (y) {
	                            var c = a.checkResult;
	                            c && (a.checkResult = JSON.parse(c))
	                        }
	                        a = b(a)
	                    }, a
	                }())
	            }, onMenuShareTimeline: function (a) {
	                d(p.onMenuShareTimeline, {
	                    complete: function () {
	                        c("shareTimeline", {
	                            title: a.title || s,
	                            desc: a.title || s,
	                            img_url: a.imgUrl || "",
	                            link: a.link || location.href,
	                            type: a.type || "link",
	                            data_url: a.dataUrl || ""
	                        }, a)
	                    }
	                }, a)
	            }, onMenuShareAppMessage: function (a) {
	                d(p.onMenuShareAppMessage, {
	                    complete: function () {
	                        c("sendAppMessage", {
	                            title: a.title || s,
	                            desc: a.desc || "",
	                            link: a.link || location.href,
	                            img_url: a.imgUrl || "",
	                            type: a.type || "link",
	                            data_url: a.dataUrl || ""
	                        }, a)
	                    }
	                }, a)
	            }, onMenuShareQQ: function (a) {
	                d(p.onMenuShareQQ, {
	                    complete: function () {
	                        c("shareQQ", {
	                            title: a.title || s,
	                            desc: a.desc || "",
	                            img_url: a.imgUrl || "",
	                            link: a.link || location.href
	                        }, a)
	                    }
	                }, a)
	            }, onMenuShareWeibo: function (a) {
	                d(p.onMenuShareWeibo, {
	                    complete: function () {
	                        c("shareWeiboApp", {
	                            title: a.title || s,
	                            desc: a.desc || "",
	                            img_url: a.imgUrl || "",
	                            link: a.link || location.href
	                        }, a)
	                    }
	                }, a)
	            }, onMenuShareQZone: function (a) {
	                d(p.onMenuShareQZone, {
	                    complete: function () {
	                        c("shareQZone", {
	                            title: a.title || s,
	                            desc: a.desc || "",
	                            img_url: a.imgUrl || "",
	                            link: a.link || location.href
	                        }, a)
	                    }
	                }, a)
	            }, startRecord: function (a) {
	                c("startRecord", {}, a)
	            }, stopRecord: function (a) {
	                c("stopRecord", {}, a)
	            }, onVoiceRecordEnd: function (a) {
	                d("onVoiceRecordEnd", a)
	            }, playVoice: function (a) {
	                c("playVoice", {localId: a.localId}, a)
	            }, pauseVoice: function (a) {
	                c("pauseVoice", {localId: a.localId}, a)
	            }, stopVoice: function (a) {
	                c("stopVoice", {localId: a.localId}, a)
	            }, onVoicePlayEnd: function (a) {
	                d("onVoicePlayEnd", a)
	            }, uploadVoice: function (a) {
	                c("uploadVoice", {localId: a.localId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
	            }, downloadVoice: function (a) {
	                c("downloadVoice", {serverId: a.serverId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
	            }, translateVoice: function (a) {
	                c("translateVoice", {localId: a.localId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
	            }, chooseImage: function (a) {
	                c("chooseImage", {
	                    scene: "1|2",
	                    count: a.count || 9,
	                    sizeType: a.sizeType || ["original", "compressed"],
	                    sourceType: a.sourceType || ["album", "camera"]
	                }, function () {
	                    return a._complete = function (a) {
	                        if (y) {
	                            var b = a.localIds;
	                            b && (a.localIds = JSON.parse(b))
	                        }
	                    }, a
	                }())
	            }, getLocation: function (a) {
	            }, previewImage: function (a) {
	                c(p.previewImage, {current: a.current, urls: a.urls}, a)
	            }, uploadImage: function (a) {
	                c("uploadImage", {localId: a.localId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
	            }, downloadImage: function (a) {
	                c("downloadImage", {serverId: a.serverId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
	            }, getLocalImgData: function (a) {
	                G === !1 ? (G = !0, c("getLocalImgData", {localId: a.localId}, function () {
	                    return a._complete = function (a) {
	                        if (G = !1, H.length > 0) {
	                            var b = H.shift();
	                            wx.getLocalImgData(b)
	                        }
	                    }, a
	                }())) : H.push(a)
	            }, getNetworkType: function (a) {
	                var b = function (a) {
	                    var b = a.errMsg;
	                    a.errMsg = "getNetworkType:ok";
	                    var c = a.subtype;
	                    if (delete a.subtype, c)a.networkType = c; else {
	                        var d = b.indexOf(":"), e = b.substring(d + 1);
	                        switch (e) {
	                            case"wifi":
	                            case"edge":
	                            case"wwan":
	                                a.networkType = e;
	                                break;
	                            default:
	                                a.errMsg = "getNetworkType:fail"
	                        }
	                    }
	                    return a
	                };
	                c("getNetworkType", {}, function () {
	                    return a._complete = function (a) {
	                        a = b(a)
	                    }, a
	                }())
	            }, openLocation: function (a) {
	                c("openLocation", {
	                    latitude: a.latitude,
	                    longitude: a.longitude,
	                    name: a.name || "",
	                    address: a.address || "",
	                    scale: a.scale || 28,
	                    infoUrl: a.infoUrl || ""
	                }, a)
	            }, getLocation: function (a) {
	                a = a || {}, c(p.getLocation, {type: a.type || "wgs84"}, function () {
	                    return a._complete = function (a) {
	                        delete a.type
	                    }, a
	                }())
	            }, hideOptionMenu: function (a) {
	                c("hideOptionMenu", {}, a)
	            }, showOptionMenu: function (a) {
	                c("showOptionMenu", {}, a)
	            }, closeWindow: function (a) {
	                a = a || {}, c("closeWindow", {}, a)
	            }, hideMenuItems: function (a) {
	                c("hideMenuItems", {menuList: a.menuList}, a)
	            }, showMenuItems: function (a) {
	                c("showMenuItems", {menuList: a.menuList}, a)
	            }, hideAllNonBaseMenuItem: function (a) {
	                c("hideAllNonBaseMenuItem", {}, a)
	            }, showAllNonBaseMenuItem: function (a) {
	                c("showAllNonBaseMenuItem", {}, a)
	            }, scanQRCode: function (a) {
	                a = a || {}, c("scanQRCode", {
	                    needResult: a.needResult || 0,
	                    scanType: a.scanType || ["qrCode", "barCode"]
	                }, function () {
	                    return a._complete = function (a) {
	                        if (z) {
	                            var b = a.resultStr;
	                            if (b) {
	                                var c = JSON.parse(b);
	                                a.resultStr = c && c.scan_code && c.scan_code.scan_result
	                            }
	                        }
	                    }, a
	                }())
	            }, openAddress: function (a) {
	                c(p.openAddress, {}, function () {
	                    return a._complete = function (a) {
	                        a = g(a)
	                    }, a
	                }())
	            }, openProductSpecificView: function (a) {
	                c(p.openProductSpecificView, {pid: a.productId, view_type: a.viewType || 0, ext_info: a.extInfo}, a)
	            }, addCard: function (a) {
	                for (var b = a.cardList, d = [], e = 0, f = b.length; f > e; ++e) {
	                    var g = b[e], h = {card_id: g.cardId, card_ext: g.cardExt};
	                    d.push(h)
	                }
	                c(p.addCard, {card_list: d}, function () {
	                    return a._complete = function (a) {
	                        var b = a.card_list;
	                        if (b) {
	                            b = JSON.parse(b);
	                            for (var c = 0, d = b.length; d > c; ++c) {
	                                var e = b[c];
	                                e.cardId = e.card_id, e.cardExt = e.card_ext, e.isSuccess = e.is_succ ? !0 : !1, delete e.card_id, delete e.card_ext, delete e.is_succ
	                            }
	                            a.cardList = b, delete a.card_list
	                        }
	                    }, a
	                }())
	            }, chooseCard: function (a) {
	                c("chooseCard", {
	                    app_id: D.appId,
	                    location_id: a.shopId || "",
	                    sign_type: a.signType || "SHA1",
	                    card_id: a.cardId || "",
	                    card_type: a.cardType || "",
	                    card_sign: a.cardSign,
	                    time_stamp: a.timestamp + "",
	                    nonce_str: a.nonceStr
	                }, function () {
	                    return a._complete = function (a) {
	                        a.cardList = a.choose_card_info, delete a.choose_card_info
	                    }, a
	                }())
	            }, openCard: function (a) {
	                for (var b = a.cardList, d = [], e = 0, f = b.length; f > e; ++e) {
	                    var g = b[e], h = {card_id: g.cardId, code: g.code};
	                    d.push(h)
	                }
	                c(p.openCard, {card_list: d}, a)
	            }, consumeAndShareCard: function (a) {
	                c(p.consumeAndShareCard, {consumedCardId: a.cardId, consumedCode: a.code}, a)
	            }, chooseWXPay: function (a) {
	                c(p.chooseWXPay, f(a), a)
	            }, openEnterpriseRedPacket: function (a) {
	                c(p.openEnterpriseRedPacket, f(a), a)
	            }, startSearchBeacons: function (a) {
	                c(p.startSearchBeacons, {ticket: a.ticket}, a)
	            }, stopSearchBeacons: function (a) {
	                c(p.stopSearchBeacons, {}, a)
	            }, onSearchBeacons: function (a) {
	                d(p.onSearchBeacons, a)
	            }, openEnterpriseChat: function (a) {
	                c("openEnterpriseChat", {useridlist: a.userIds, chatname: a.groupName}, a)
	            }
	        }, J = 1, K = {};
	        return r.addEventListener("error", function (a) {
	            if (!y) {
	                var b = a.target, c = b.tagName, d = b.src;
	                if ("IMG" == c || "VIDEO" == c || "AUDIO" == c || "SOURCE" == c) {
	                    var e = -1 != d.indexOf("wxlocalresource://");
	                    if (e) {
	                        a.preventDefault(), a.stopPropagation();
	                        var f = b["wx-id"];
	                        if (f || (f = J++, b["wx-id"] = f), K[f])return;
	                        K[f] = !0, wx.getLocalImgData({
	                            localId: d, success: function (a) {
	                                b.src = a.localData
	                            }
	                        })
	                    }
	                }
	            }
	        }, !0), r.addEventListener("load", function (a) {
	            if (!y) {
	                var b = a.target, c = b.tagName;
	                b.src;
	                if ("IMG" == c || "VIDEO" == c || "AUDIO" == c || "SOURCE" == c) {
	                    var d = b["wx-id"];
	                    d && (K[d] = !1)
	                }
	            }
	        }, !0), b && (a.wx = a.jWeixin = I), I
	    }
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var require;var require;/* WEBPACK VAR INJECTION */(function(global, setImmediate) {"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	!function (t) {
	  if ("object" == ( false ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = t();else if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else {
	    var e;e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.PIXI = t();
	  }
	}(function () {
	  var t;return function e(t, r, i) {
	    function n(s, a) {
	      if (!r[s]) {
	        if (!t[s]) {
	          var h = "function" == typeof require && require;if (!a && h) return require(s, !0);if (o) return o(s, !0);var l = new Error("Cannot find module '" + s + "'");throw l.code = "MODULE_NOT_FOUND", l;
	        }var u = r[s] = { exports: {} };t[s][0].call(u.exports, function (e) {
	          var r = t[s][1][e];return n(r ? r : e);
	        }, u, u.exports, e, t, r, i);
	      }return r[s].exports;
	    }for (var o = "function" == typeof require && require, s = 0; s < i.length; s++) {
	      n(i[s]);
	    }return n;
	  }({ 1: [function (t, e, r) {
	      (function (r) {
	        t("./polyfill");var i = e.exports = t("./core");i.extras = t("./extras"), i.filters = t("./filters"), i.interaction = t("./interaction"), i.loaders = t("./loaders"), i.mesh = t("./mesh"), i.loader = new i.loaders.Loader(), Object.assign(i, t("./deprecation")), r.PIXI = i;
	      }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
	    }, { "./core": 29, "./deprecation": 78, "./extras": 85, "./filters": 102, "./interaction": 117, "./loaders": 120, "./mesh": 126, "./polyfill": 130 }], 2: [function (e, r, i) {
	      (function (e) {
	        !function () {
	          function i(t) {
	            var e = !1;return function () {
	              if (e) throw new Error("Callback was already called.");e = !0, t.apply(n, arguments);
	            };
	          }var n,
	              o,
	              s = {};n = this, null != n && (o = n.async), s.noConflict = function () {
	            return n.async = o, s;
	          };var a = Object.prototype.toString,
	              h = Array.isArray || function (t) {
	            return "[object Array]" === a.call(t);
	          },
	              l = function l(t, e) {
	            if (t.forEach) return t.forEach(e);for (var r = 0; r < t.length; r += 1) {
	              e(t[r], r, t);
	            }
	          },
	              u = function u(t, e) {
	            if (t.map) return t.map(e);var r = [];return l(t, function (t, i, n) {
	              r.push(e(t, i, n));
	            }), r;
	          },
	              c = function c(t, e, r) {
	            return t.reduce ? t.reduce(e, r) : (l(t, function (t, i, n) {
	              r = e(r, t, i, n);
	            }), r);
	          },
	              p = function p(t) {
	            if (Object.keys) return Object.keys(t);var e = [];for (var r in t) {
	              t.hasOwnProperty(r) && e.push(r);
	            }return e;
	          };"undefined" != typeof e && e.nextTick ? (s.nextTick = e.nextTick, s.setImmediate = "undefined" != typeof setImmediate ? function (t) {
	            setImmediate(t);
	          } : s.nextTick) : "function" == typeof setImmediate ? (s.nextTick = function (t) {
	            setImmediate(t);
	          }, s.setImmediate = s.nextTick) : (s.nextTick = function (t) {
	            setTimeout(t, 0);
	          }, s.setImmediate = s.nextTick), s.each = function (t, e, r) {
	            function n(e) {
	              e ? (r(e), r = function r() {}) : (o += 1, o >= t.length && r());
	            }if (r = r || function () {}, !t.length) return r();var o = 0;l(t, function (t) {
	              e(t, i(n));
	            });
	          }, s.forEach = s.each, s.eachSeries = function (t, e, r) {
	            if (r = r || function () {}, !t.length) return r();var i = 0,
	                n = function n() {
	              e(t[i], function (e) {
	                e ? (r(e), r = function r() {}) : (i += 1, i >= t.length ? r() : n());
	              });
	            };n();
	          }, s.forEachSeries = s.eachSeries, s.eachLimit = function (t, e, r, i) {
	            var n = d(e);n.apply(null, [t, r, i]);
	          }, s.forEachLimit = s.eachLimit;var d = function d(t) {
	            return function (e, r, i) {
	              if (i = i || function () {}, !e.length || 0 >= t) return i();var n = 0,
	                  o = 0,
	                  s = 0;!function a() {
	                if (n >= e.length) return i();for (; t > s && o < e.length;) {
	                  o += 1, s += 1, r(e[o - 1], function (t) {
	                    t ? (i(t), i = function i() {}) : (n += 1, s -= 1, n >= e.length ? i() : a());
	                  });
	                }
	              }();
	            };
	          },
	              f = function f(t) {
	            return function () {
	              var e = Array.prototype.slice.call(arguments);return t.apply(null, [s.each].concat(e));
	            };
	          },
	              v = function v(t, e) {
	            return function () {
	              var r = Array.prototype.slice.call(arguments);return e.apply(null, [d(t)].concat(r));
	            };
	          },
	              g = function g(t) {
	            return function () {
	              var e = Array.prototype.slice.call(arguments);return t.apply(null, [s.eachSeries].concat(e));
	            };
	          },
	              m = function m(t, e, r, i) {
	            if (e = u(e, function (t, e) {
	              return { index: e, value: t };
	            }), i) {
	              var n = [];t(e, function (t, e) {
	                r(t.value, function (r, i) {
	                  n[t.index] = i, e(r);
	                });
	              }, function (t) {
	                i(t, n);
	              });
	            } else t(e, function (t, e) {
	              r(t.value, function (t) {
	                e(t);
	              });
	            });
	          };s.map = f(m), s.mapSeries = g(m), s.mapLimit = function (t, e, r, i) {
	            return y(e)(t, r, i);
	          };var y = function y(t) {
	            return v(t, m);
	          };s.reduce = function (t, e, r, i) {
	            s.eachSeries(t, function (t, i) {
	              r(e, t, function (t, r) {
	                e = r, i(t);
	              });
	            }, function (t) {
	              i(t, e);
	            });
	          }, s.inject = s.reduce, s.foldl = s.reduce, s.reduceRight = function (t, e, r, i) {
	            var n = u(t, function (t) {
	              return t;
	            }).reverse();s.reduce(n, e, r, i);
	          }, s.foldr = s.reduceRight;var x = function x(t, e, r, i) {
	            var n = [];e = u(e, function (t, e) {
	              return { index: e, value: t };
	            }), t(e, function (t, e) {
	              r(t.value, function (r) {
	                r && n.push(t), e();
	              });
	            }, function (t) {
	              i(u(n.sort(function (t, e) {
	                return t.index - e.index;
	              }), function (t) {
	                return t.value;
	              }));
	            });
	          };s.filter = f(x), s.filterSeries = g(x), s.select = s.filter, s.selectSeries = s.filterSeries;var b = function b(t, e, r, i) {
	            var n = [];e = u(e, function (t, e) {
	              return { index: e, value: t };
	            }), t(e, function (t, e) {
	              r(t.value, function (r) {
	                r || n.push(t), e();
	              });
	            }, function (t) {
	              i(u(n.sort(function (t, e) {
	                return t.index - e.index;
	              }), function (t) {
	                return t.value;
	              }));
	            });
	          };s.reject = f(b), s.rejectSeries = g(b);var _ = function _(t, e, r, i) {
	            t(e, function (t, e) {
	              r(t, function (r) {
	                r ? (i(t), i = function i() {}) : e();
	              });
	            }, function (t) {
	              i();
	            });
	          };s.detect = f(_), s.detectSeries = g(_), s.some = function (t, e, r) {
	            s.each(t, function (t, i) {
	              e(t, function (t) {
	                t && (r(!0), r = function r() {}), i();
	              });
	            }, function (t) {
	              r(!1);
	            });
	          }, s.any = s.some, s.every = function (t, e, r) {
	            s.each(t, function (t, i) {
	              e(t, function (t) {
	                t || (r(!1), r = function r() {}), i();
	              });
	            }, function (t) {
	              r(!0);
	            });
	          }, s.all = s.every, s.sortBy = function (t, e, r) {
	            s.map(t, function (t, r) {
	              e(t, function (e, i) {
	                e ? r(e) : r(null, { value: t, criteria: i });
	              });
	            }, function (t, e) {
	              if (t) return r(t);var i = function i(t, e) {
	                var r = t.criteria,
	                    i = e.criteria;return i > r ? -1 : r > i ? 1 : 0;
	              };r(null, u(e.sort(i), function (t) {
	                return t.value;
	              }));
	            });
	          }, s.auto = function (t, e) {
	            e = e || function () {};var r = p(t),
	                i = r.length;if (!i) return e();var n = {},
	                o = [],
	                a = function a(t) {
	              o.unshift(t);
	            },
	                u = function u(t) {
	              for (var e = 0; e < o.length; e += 1) {
	                if (o[e] === t) return void o.splice(e, 1);
	              }
	            },
	                d = function d() {
	              i--, l(o.slice(0), function (t) {
	                t();
	              });
	            };a(function () {
	              if (!i) {
	                var t = e;e = function e() {}, t(null, n);
	              }
	            }), l(r, function (r) {
	              var i = h(t[r]) ? t[r] : [t[r]],
	                  o = function o(t) {
	                var i = Array.prototype.slice.call(arguments, 1);if (i.length <= 1 && (i = i[0]), t) {
	                  var o = {};l(p(n), function (t) {
	                    o[t] = n[t];
	                  }), o[r] = i, e(t, o), e = function e() {};
	                } else n[r] = i, s.setImmediate(d);
	              },
	                  f = i.slice(0, Math.abs(i.length - 1)) || [],
	                  v = function v() {
	                return c(f, function (t, e) {
	                  return t && n.hasOwnProperty(e);
	                }, !0) && !n.hasOwnProperty(r);
	              };if (v()) i[i.length - 1](o, n);else {
	                var g = function g() {
	                  v() && (u(g), i[i.length - 1](o, n));
	                };a(g);
	              }
	            });
	          }, s.retry = function (t, e, r) {
	            var i = 5,
	                n = [];"function" == typeof t && (r = e, e = t, t = i), t = parseInt(t, 10) || i;var o = function o(i, _o) {
	              for (var a = function a(t, e) {
	                return function (r) {
	                  t(function (t, i) {
	                    r(!t || e, { err: t, result: i });
	                  }, _o);
	                };
	              }; t;) {
	                n.push(a(e, !(t -= 1)));
	              }s.series(n, function (t, e) {
	                e = e[e.length - 1], (i || r)(e.err, e.result);
	              });
	            };return r ? o() : o;
	          }, s.waterfall = function (t, e) {
	            if (e = e || function () {}, !h(t)) {
	              var r = new Error("First argument to waterfall must be an array of functions");return e(r);
	            }if (!t.length) return e();var i = function i(t) {
	              return function (r) {
	                if (r) e.apply(null, arguments), e = function e() {};else {
	                  var n = Array.prototype.slice.call(arguments, 1),
	                      o = t.next();n.push(o ? i(o) : e), s.setImmediate(function () {
	                    t.apply(null, n);
	                  });
	                }
	              };
	            };i(s.iterator(t))();
	          };var T = function T(t, e, r) {
	            if (r = r || function () {}, h(e)) t.map(e, function (t, e) {
	              t && t(function (t) {
	                var r = Array.prototype.slice.call(arguments, 1);r.length <= 1 && (r = r[0]), e.call(null, t, r);
	              });
	            }, r);else {
	              var i = {};t.each(p(e), function (t, r) {
	                e[t](function (e) {
	                  var n = Array.prototype.slice.call(arguments, 1);n.length <= 1 && (n = n[0]), i[t] = n, r(e);
	                });
	              }, function (t) {
	                r(t, i);
	              });
	            }
	          };s.parallel = function (t, e) {
	            T({ map: s.map, each: s.each }, t, e);
	          }, s.parallelLimit = function (t, e, r) {
	            T({ map: y(e), each: d(e) }, t, r);
	          }, s.series = function (t, e) {
	            if (e = e || function () {}, h(t)) s.mapSeries(t, function (t, e) {
	              t && t(function (t) {
	                var r = Array.prototype.slice.call(arguments, 1);r.length <= 1 && (r = r[0]), e.call(null, t, r);
	              });
	            }, e);else {
	              var r = {};s.eachSeries(p(t), function (e, i) {
	                t[e](function (t) {
	                  var n = Array.prototype.slice.call(arguments, 1);n.length <= 1 && (n = n[0]), r[e] = n, i(t);
	                });
	              }, function (t) {
	                e(t, r);
	              });
	            }
	          }, s.iterator = function (t) {
	            var e = function e(r) {
	              var i = function i() {
	                return t.length && t[r].apply(null, arguments), i.next();
	              };return i.next = function () {
	                return r < t.length - 1 ? e(r + 1) : null;
	              }, i;
	            };return e(0);
	          }, s.apply = function (t) {
	            var e = Array.prototype.slice.call(arguments, 1);return function () {
	              return t.apply(null, e.concat(Array.prototype.slice.call(arguments)));
	            };
	          };var E = function E(t, e, r, i) {
	            var n = [];t(e, function (t, e) {
	              r(t, function (t, r) {
	                n = n.concat(r || []), e(t);
	              });
	            }, function (t) {
	              i(t, n);
	            });
	          };s.concat = f(E), s.concatSeries = g(E), s.whilst = function (t, e, r) {
	            t() ? e(function (i) {
	              return i ? r(i) : void s.whilst(t, e, r);
	            }) : r();
	          }, s.doWhilst = function (t, e, r) {
	            t(function (i) {
	              if (i) return r(i);var n = Array.prototype.slice.call(arguments, 1);e.apply(null, n) ? s.doWhilst(t, e, r) : r();
	            });
	          }, s.until = function (t, e, r) {
	            t() ? r() : e(function (i) {
	              return i ? r(i) : void s.until(t, e, r);
	            });
	          }, s.doUntil = function (t, e, r) {
	            t(function (i) {
	              if (i) return r(i);var n = Array.prototype.slice.call(arguments, 1);e.apply(null, n) ? r() : s.doUntil(t, e, r);
	            });
	          }, s.queue = function (t, e) {
	            function r(t, e, r, i) {
	              return t.started || (t.started = !0), h(e) || (e = [e]), 0 == e.length ? s.setImmediate(function () {
	                t.drain && t.drain();
	              }) : void l(e, function (e) {
	                var n = { data: e, callback: "function" == typeof i ? i : null };r ? t.tasks.unshift(n) : t.tasks.push(n), t.saturated && t.tasks.length === t.concurrency && t.saturated(), s.setImmediate(t.process);
	              });
	            }void 0 === e && (e = 1);var n = 0,
	                o = { tasks: [], concurrency: e, saturated: null, empty: null, drain: null, started: !1, paused: !1, push: function push(t, e) {
	                r(o, t, !1, e);
	              }, kill: function kill() {
	                o.drain = null, o.tasks = [];
	              }, unshift: function unshift(t, e) {
	                r(o, t, !0, e);
	              }, process: function process() {
	                if (!o.paused && n < o.concurrency && o.tasks.length) {
	                  var e = o.tasks.shift();o.empty && 0 === o.tasks.length && o.empty(), n += 1;var r = function r() {
	                    n -= 1, e.callback && e.callback.apply(e, arguments), o.drain && o.tasks.length + n === 0 && o.drain(), o.process();
	                  },
	                      s = i(r);t(e.data, s);
	                }
	              }, length: function length() {
	                return o.tasks.length;
	              }, running: function running() {
	                return n;
	              }, idle: function idle() {
	                return o.tasks.length + n === 0;
	              }, pause: function pause() {
	                o.paused !== !0 && (o.paused = !0, o.process());
	              }, resume: function resume() {
	                o.paused !== !1 && (o.paused = !1, o.process());
	              } };return o;
	          }, s.priorityQueue = function (t, e) {
	            function r(t, e) {
	              return t.priority - e.priority;
	            }function i(t, e, r) {
	              for (var i = -1, n = t.length - 1; n > i;) {
	                var o = i + (n - i + 1 >>> 1);r(e, t[o]) >= 0 ? i = o : n = o - 1;
	              }return i;
	            }function n(t, e, n, o) {
	              return t.started || (t.started = !0), h(e) || (e = [e]), 0 == e.length ? s.setImmediate(function () {
	                t.drain && t.drain();
	              }) : void l(e, function (e) {
	                var a = { data: e, priority: n, callback: "function" == typeof o ? o : null };t.tasks.splice(i(t.tasks, a, r) + 1, 0, a), t.saturated && t.tasks.length === t.concurrency && t.saturated(), s.setImmediate(t.process);
	              });
	            }var o = s.queue(t, e);return o.push = function (t, e, r) {
	              n(o, t, e, r);
	            }, delete o.unshift, o;
	          }, s.cargo = function (t, e) {
	            var r = !1,
	                i = [],
	                n = { tasks: i, payload: e, saturated: null, empty: null, drain: null, drained: !0, push: function push(t, r) {
	                h(t) || (t = [t]), l(t, function (t) {
	                  i.push({ data: t, callback: "function" == typeof r ? r : null }), n.drained = !1, n.saturated && i.length === e && n.saturated();
	                }), s.setImmediate(n.process);
	              }, process: function o() {
	                if (!r) {
	                  if (0 === i.length) return n.drain && !n.drained && n.drain(), void (n.drained = !0);var s = "number" == typeof e ? i.splice(0, e) : i.splice(0, i.length),
	                      a = u(s, function (t) {
	                    return t.data;
	                  });n.empty && n.empty(), r = !0, t(a, function () {
	                    r = !1;var t = arguments;l(s, function (e) {
	                      e.callback && e.callback.apply(null, t);
	                    }), o();
	                  });
	                }
	              }, length: function length() {
	                return i.length;
	              }, running: function running() {
	                return r;
	              } };return n;
	          };var S = function S(t) {
	            return function (e) {
	              var r = Array.prototype.slice.call(arguments, 1);e.apply(null, r.concat([function (e) {
	                var r = Array.prototype.slice.call(arguments, 1);"undefined" != typeof console && (e ? console.error && console.error(e) : console[t] && l(r, function (e) {
	                  console[t](e);
	                }));
	              }]));
	            };
	          };s.log = S("log"), s.dir = S("dir"), s.memoize = function (t, e) {
	            var r = {},
	                i = {};e = e || function (t) {
	              return t;
	            };var n = function n() {
	              var n = Array.prototype.slice.call(arguments),
	                  o = n.pop(),
	                  a = e.apply(null, n);a in r ? s.nextTick(function () {
	                o.apply(null, r[a]);
	              }) : a in i ? i[a].push(o) : (i[a] = [o], t.apply(null, n.concat([function () {
	                r[a] = arguments;var t = i[a];delete i[a];for (var e = 0, n = t.length; n > e; e++) {
	                  t[e].apply(null, arguments);
	                }
	              }])));
	            };return n.memo = r, n.unmemoized = t, n;
	          }, s.unmemoize = function (t) {
	            return function () {
	              return (t.unmemoized || t).apply(null, arguments);
	            };
	          }, s.times = function (t, e, r) {
	            for (var i = [], n = 0; t > n; n++) {
	              i.push(n);
	            }return s.map(i, e, r);
	          }, s.timesSeries = function (t, e, r) {
	            for (var i = [], n = 0; t > n; n++) {
	              i.push(n);
	            }return s.mapSeries(i, e, r);
	          }, s.seq = function () {
	            var t = arguments;return function () {
	              var e = this,
	                  r = Array.prototype.slice.call(arguments),
	                  i = r.pop();s.reduce(t, r, function (t, r, i) {
	                r.apply(e, t.concat([function () {
	                  var t = arguments[0],
	                      e = Array.prototype.slice.call(arguments, 1);i(t, e);
	                }]));
	              }, function (t, r) {
	                i.apply(e, [t].concat(r));
	              });
	            };
	          }, s.compose = function () {
	            return s.seq.apply(null, Array.prototype.reverse.call(arguments));
	          };var A = function A(t, e) {
	            var r = function r() {
	              var r = this,
	                  i = Array.prototype.slice.call(arguments),
	                  n = i.pop();return t(e, function (t, e) {
	                t.apply(r, i.concat([e]));
	              }, n);
	            };if (arguments.length > 2) {
	              var i = Array.prototype.slice.call(arguments, 2);return r.apply(this, i);
	            }return r;
	          };s.applyEach = f(A), s.applyEachSeries = g(A), s.forever = function (t, e) {
	            function r(i) {
	              if (i) {
	                if (e) return e(i);throw i;
	              }t(r);
	            }r();
	          }, "undefined" != typeof r && r.exports ? r.exports = s : "undefined" != typeof t && t.amd ? t([], function () {
	            return s;
	          }) : n.async = s;
	        }();
	      }).call(this, e("_process"));
	    }, { _process: 4 }], 3: [function (t, e, r) {
	      (function (t) {
	        function e(t, e) {
	          for (var r = 0, i = t.length - 1; i >= 0; i--) {
	            var n = t[i];"." === n ? t.splice(i, 1) : ".." === n ? (t.splice(i, 1), r++) : r && (t.splice(i, 1), r--);
	          }if (e) for (; r--; r) {
	            t.unshift("..");
	          }return t;
	        }function i(t, e) {
	          if (t.filter) return t.filter(e);for (var r = [], i = 0; i < t.length; i++) {
	            e(t[i], i, t) && r.push(t[i]);
	          }return r;
	        }var n = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
	            o = function o(t) {
	          return n.exec(t).slice(1);
	        };r.resolve = function () {
	          for (var r = "", n = !1, o = arguments.length - 1; o >= -1 && !n; o--) {
	            var s = o >= 0 ? arguments[o] : t.cwd();if ("string" != typeof s) throw new TypeError("Arguments to path.resolve must be strings");s && (r = s + "/" + r, n = "/" === s.charAt(0));
	          }return r = e(i(r.split("/"), function (t) {
	            return !!t;
	          }), !n).join("/"), (n ? "/" : "") + r || ".";
	        }, r.normalize = function (t) {
	          var n = r.isAbsolute(t),
	              o = "/" === s(t, -1);return t = e(i(t.split("/"), function (t) {
	            return !!t;
	          }), !n).join("/"), t || n || (t = "."), t && o && (t += "/"), (n ? "/" : "") + t;
	        }, r.isAbsolute = function (t) {
	          return "/" === t.charAt(0);
	        }, r.join = function () {
	          var t = Array.prototype.slice.call(arguments, 0);return r.normalize(i(t, function (t, e) {
	            if ("string" != typeof t) throw new TypeError("Arguments to path.join must be strings");return t;
	          }).join("/"));
	        }, r.relative = function (t, e) {
	          function i(t) {
	            for (var e = 0; e < t.length && "" === t[e]; e++) {}for (var r = t.length - 1; r >= 0 && "" === t[r]; r--) {}return e > r ? [] : t.slice(e, r - e + 1);
	          }t = r.resolve(t).substr(1), e = r.resolve(e).substr(1);for (var n = i(t.split("/")), o = i(e.split("/")), s = Math.min(n.length, o.length), a = s, h = 0; s > h; h++) {
	            if (n[h] !== o[h]) {
	              a = h;break;
	            }
	          }for (var l = [], h = a; h < n.length; h++) {
	            l.push("..");
	          }return l = l.concat(o.slice(a)), l.join("/");
	        }, r.sep = "/", r.delimiter = ":", r.dirname = function (t) {
	          var e = o(t),
	              r = e[0],
	              i = e[1];return r || i ? (i && (i = i.substr(0, i.length - 1)), r + i) : ".";
	        }, r.basename = function (t, e) {
	          var r = o(t)[2];return e && r.substr(-1 * e.length) === e && (r = r.substr(0, r.length - e.length)), r;
	        }, r.extname = function (t) {
	          return o(t)[3];
	        };var s = "b" === "ab".substr(-1) ? function (t, e, r) {
	          return t.substr(e, r);
	        } : function (t, e, r) {
	          return 0 > e && (e = t.length + e), t.substr(e, r);
	        };
	      }).call(this, t("_process"));
	    }, { _process: 4 }], 4: [function (t, e, r) {
	      function i() {
	        if (!a) {
	          a = !0;for (var t, e = s.length; e;) {
	            t = s, s = [];for (var r = -1; ++r < e;) {
	              t[r]();
	            }e = s.length;
	          }a = !1;
	        }
	      }function n() {}var o = e.exports = {},
	          s = [],
	          a = !1;o.nextTick = function (t) {
	        s.push(t), a || setTimeout(i, 0);
	      }, o.title = "browser", o.browser = !0, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = n, o.addListener = n, o.once = n, o.off = n, o.removeListener = n, o.removeAllListeners = n, o.emit = n, o.binding = function (t) {
	        throw new Error("process.binding is not supported");
	      }, o.cwd = function () {
	        return "/";
	      }, o.chdir = function (t) {
	        throw new Error("process.chdir is not supported");
	      }, o.umask = function () {
	        return 0;
	      };
	    }, {}], 5: [function (e, r, i) {
	      (function (e) {
	        !function (n) {
	          function o(t) {
	            throw RangeError(B[t]);
	          }function s(t, e) {
	            for (var r = t.length; r--;) {
	              t[r] = e(t[r]);
	            }return t;
	          }function a(t, e) {
	            return s(t.split(O), e).join(".");
	          }function h(t) {
	            for (var e, r, i = [], n = 0, o = t.length; o > n;) {
	              e = t.charCodeAt(n++), e >= 55296 && 56319 >= e && o > n ? (r = t.charCodeAt(n++), 56320 == (64512 & r) ? i.push(((1023 & e) << 10) + (1023 & r) + 65536) : (i.push(e), n--)) : i.push(e);
	            }return i;
	          }function l(t) {
	            return s(t, function (t) {
	              var e = "";return t > 65535 && (t -= 65536, e += N(t >>> 10 & 1023 | 55296), t = 56320 | 1023 & t), e += N(t);
	            }).join("");
	          }function u(t) {
	            return 10 > t - 48 ? t - 22 : 26 > t - 65 ? t - 65 : 26 > t - 97 ? t - 97 : E;
	          }function c(t, e) {
	            return t + 22 + 75 * (26 > t) - ((0 != e) << 5);
	          }function p(t, e, r) {
	            var i = 0;for (t = r ? I(t / C) : t >> 1, t += I(t / e); t > L * A >> 1; i += E) {
	              t = I(t / L);
	            }return I(i + (L + 1) * t / (t + w));
	          }function d(t) {
	            var e,
	                r,
	                i,
	                n,
	                s,
	                a,
	                h,
	                c,
	                d,
	                f,
	                v = [],
	                g = t.length,
	                m = 0,
	                y = R,
	                x = M;for (r = t.lastIndexOf(D), 0 > r && (r = 0), i = 0; r > i; ++i) {
	              t.charCodeAt(i) >= 128 && o("not-basic"), v.push(t.charCodeAt(i));
	            }for (n = r > 0 ? r + 1 : 0; g > n;) {
	              for (s = m, a = 1, h = E; n >= g && o("invalid-input"), c = u(t.charCodeAt(n++)), (c >= E || c > I((T - m) / a)) && o("overflow"), m += c * a, d = x >= h ? S : h >= x + A ? A : h - x, !(d > c); h += E) {
	                f = E - d, a > I(T / f) && o("overflow"), a *= f;
	              }e = v.length + 1, x = p(m - s, e, 0 == s), I(m / e) > T - y && o("overflow"), y += I(m / e), m %= e, v.splice(m++, 0, y);
	            }return l(v);
	          }function f(t) {
	            var e,
	                r,
	                i,
	                n,
	                s,
	                a,
	                l,
	                u,
	                d,
	                f,
	                v,
	                g,
	                m,
	                y,
	                x,
	                b = [];for (t = h(t), g = t.length, e = R, r = 0, s = M, a = 0; g > a; ++a) {
	              v = t[a], 128 > v && b.push(N(v));
	            }for (i = n = b.length, n && b.push(D); g > i;) {
	              for (l = T, a = 0; g > a; ++a) {
	                v = t[a], v >= e && l > v && (l = v);
	              }for (m = i + 1, l - e > I((T - r) / m) && o("overflow"), r += (l - e) * m, e = l, a = 0; g > a; ++a) {
	                if (v = t[a], e > v && ++r > T && o("overflow"), v == e) {
	                  for (u = r, d = E; f = s >= d ? S : d >= s + A ? A : d - s, !(f > u); d += E) {
	                    x = u - f, y = E - f, b.push(N(c(f + x % y, 0))), u = I(x / y);
	                  }b.push(N(c(u, 0))), s = p(r, m, i == n), r = 0, ++i;
	                }
	              }++r, ++e;
	            }return b.join("");
	          }function v(t) {
	            return a(t, function (t) {
	              return F.test(t) ? d(t.slice(4).toLowerCase()) : t;
	            });
	          }function g(t) {
	            return a(t, function (t) {
	              return P.test(t) ? "xn--" + f(t) : t;
	            });
	          }var m = "object" == (typeof i === "undefined" ? "undefined" : _typeof(i)) && i,
	              y = "object" == (typeof r === "undefined" ? "undefined" : _typeof(r)) && r && r.exports == m && r,
	              x = "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && e;(x.global === x || x.window === x) && (n = x);var b,
	              _,
	              T = 2147483647,
	              E = 36,
	              S = 1,
	              A = 26,
	              w = 38,
	              C = 700,
	              M = 72,
	              R = 128,
	              D = "-",
	              F = /^xn--/,
	              P = /[^ -~]/,
	              O = /\x2E|\u3002|\uFF0E|\uFF61/g,
	              B = { overflow: "Overflow: input needs wider integers to process", "not-basic": "Illegal input >= 0x80 (not a basic code point)", "invalid-input": "Invalid input" },
	              L = E - S,
	              I = Math.floor,
	              N = String.fromCharCode;if (b = { version: "1.2.4", ucs2: { decode: h, encode: l }, decode: d, encode: f, toASCII: g, toUnicode: v }, "function" == typeof t && "object" == _typeof(t.amd) && t.amd) t("punycode", function () {
	            return b;
	          });else if (m && !m.nodeType) {
	            if (y) y.exports = b;else for (_ in b) {
	              b.hasOwnProperty(_) && (m[_] = b[_]);
	            }
	          } else n.punycode = b;
	        }(this);
	      }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
	    }, {}], 6: [function (t, e, r) {
	      "use strict";
	      function i(t, e) {
	        return Object.prototype.hasOwnProperty.call(t, e);
	      }e.exports = function (t, e, r, o) {
	        e = e || "&", r = r || "=";var s = {};if ("string" != typeof t || 0 === t.length) return s;var a = /\+/g;t = t.split(e);var h = 1e3;o && "number" == typeof o.maxKeys && (h = o.maxKeys);var l = t.length;h > 0 && l > h && (l = h);for (var u = 0; l > u; ++u) {
	          var c,
	              p,
	              d,
	              f,
	              v = t[u].replace(a, "%20"),
	              g = v.indexOf(r);g >= 0 ? (c = v.substr(0, g), p = v.substr(g + 1)) : (c = v, p = ""), d = decodeURIComponent(c), f = decodeURIComponent(p), i(s, d) ? n(s[d]) ? s[d].push(f) : s[d] = [s[d], f] : s[d] = f;
	        }return s;
	      };var n = Array.isArray || function (t) {
	        return "[object Array]" === Object.prototype.toString.call(t);
	      };
	    }, {}], 7: [function (t, e, r) {
	      "use strict";
	      function i(t, e) {
	        if (t.map) return t.map(e);for (var r = [], i = 0; i < t.length; i++) {
	          r.push(e(t[i], i));
	        }return r;
	      }var n = function n(t) {
	        switch (typeof t === "undefined" ? "undefined" : _typeof(t)) {case "string":
	            return t;case "boolean":
	            return t ? "true" : "false";case "number":
	            return isFinite(t) ? t : "";default:
	            return "";}
	      };e.exports = function (t, e, r, a) {
	        return e = e || "&", r = r || "=", null === t && (t = void 0), "object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) ? i(s(t), function (s) {
	          var a = encodeURIComponent(n(s)) + r;return o(t[s]) ? i(t[s], function (t) {
	            return a + encodeURIComponent(n(t));
	          }).join(e) : a + encodeURIComponent(n(t[s]));
	        }).join(e) : a ? encodeURIComponent(n(a)) + r + encodeURIComponent(n(t)) : "";
	      };var o = Array.isArray || function (t) {
	        return "[object Array]" === Object.prototype.toString.call(t);
	      },
	          s = Object.keys || function (t) {
	        var e = [];for (var r in t) {
	          Object.prototype.hasOwnProperty.call(t, r) && e.push(r);
	        }return e;
	      };
	    }, {}], 8: [function (t, e, r) {
	      "use strict";
	      r.decode = r.parse = t("./decode"), r.encode = r.stringify = t("./encode");
	    }, { "./decode": 6, "./encode": 7 }], 9: [function (t, e, r) {
	      function i() {
	        this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, this.path = null, this.href = null;
	      }function n(t, e, r) {
	        if (t && l(t) && t instanceof i) return t;var n = new i();return n.parse(t, e, r), n;
	      }function o(t) {
	        return h(t) && (t = n(t)), t instanceof i ? t.format() : i.prototype.format.call(t);
	      }function s(t, e) {
	        return n(t, !1, !0).resolve(e);
	      }function a(t, e) {
	        return t ? n(t, !1, !0).resolveObject(e) : e;
	      }function h(t) {
	        return "string" == typeof t;
	      }function l(t) {
	        return "object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) && null !== t;
	      }function u(t) {
	        return null === t;
	      }function c(t) {
	        return null == t;
	      }var p = t("punycode");r.parse = n, r.resolve = s, r.resolveObject = a, r.format = o, r.Url = i;var d = /^([a-z0-9.+-]+:)/i,
	          f = /:[0-9]*$/,
	          v = ["<", ">", '"', "`", " ", "\r", "\n", "	"],
	          g = ["{", "}", "|", "\\", "^", "`"].concat(v),
	          m = ["'"].concat(g),
	          y = ["%", "/", "?", ";", "#"].concat(m),
	          x = ["/", "?", "#"],
	          b = 255,
	          _ = /^[a-z0-9A-Z_-]{0,63}$/,
	          T = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
	          E = { javascript: !0, "javascript:": !0 },
	          S = { javascript: !0, "javascript:": !0 },
	          A = { http: !0, https: !0, ftp: !0, gopher: !0, file: !0, "http:": !0, "https:": !0, "ftp:": !0, "gopher:": !0, "file:": !0 },
	          w = t("querystring");i.prototype.parse = function (t, e, r) {
	        if (!h(t)) throw new TypeError("Parameter 'url' must be a string, not " + (typeof t === "undefined" ? "undefined" : _typeof(t)));var i = t;i = i.trim();var n = d.exec(i);if (n) {
	          n = n[0];var o = n.toLowerCase();this.protocol = o, i = i.substr(n.length);
	        }if (r || n || i.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	          var s = "//" === i.substr(0, 2);!s || n && S[n] || (i = i.substr(2), this.slashes = !0);
	        }if (!S[n] && (s || n && !A[n])) {
	          for (var a = -1, l = 0; l < x.length; l++) {
	            var u = i.indexOf(x[l]);-1 !== u && (-1 === a || a > u) && (a = u);
	          }var c, f;f = -1 === a ? i.lastIndexOf("@") : i.lastIndexOf("@", a), -1 !== f && (c = i.slice(0, f), i = i.slice(f + 1), this.auth = decodeURIComponent(c)), a = -1;for (var l = 0; l < y.length; l++) {
	            var u = i.indexOf(y[l]);-1 !== u && (-1 === a || a > u) && (a = u);
	          }-1 === a && (a = i.length), this.host = i.slice(0, a), i = i.slice(a), this.parseHost(), this.hostname = this.hostname || "";var v = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];if (!v) for (var g = this.hostname.split(/\./), l = 0, C = g.length; C > l; l++) {
	            var M = g[l];if (M && !M.match(_)) {
	              for (var R = "", D = 0, F = M.length; F > D; D++) {
	                R += M.charCodeAt(D) > 127 ? "x" : M[D];
	              }if (!R.match(_)) {
	                var P = g.slice(0, l),
	                    O = g.slice(l + 1),
	                    B = M.match(T);B && (P.push(B[1]), O.unshift(B[2])), O.length && (i = "/" + O.join(".") + i), this.hostname = P.join(".");break;
	              }
	            }
	          }if (this.hostname = this.hostname.length > b ? "" : this.hostname.toLowerCase(), !v) {
	            for (var L = this.hostname.split("."), I = [], l = 0; l < L.length; ++l) {
	              var N = L[l];I.push(N.match(/[^A-Za-z0-9_-]/) ? "xn--" + p.encode(N) : N);
	            }this.hostname = I.join(".");
	          }var U = this.port ? ":" + this.port : "",
	              k = this.hostname || "";this.host = k + U, this.href += this.host, v && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), "/" !== i[0] && (i = "/" + i));
	        }if (!E[o]) for (var l = 0, C = m.length; C > l; l++) {
	          var j = m[l],
	              X = encodeURIComponent(j);X === j && (X = escape(j)), i = i.split(j).join(X);
	        }var G = i.indexOf("#");-1 !== G && (this.hash = i.substr(G), i = i.slice(0, G));var Y = i.indexOf("?");if (-1 !== Y ? (this.search = i.substr(Y), this.query = i.substr(Y + 1), e && (this.query = w.parse(this.query)), i = i.slice(0, Y)) : e && (this.search = "", this.query = {}), i && (this.pathname = i), A[o] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
	          var U = this.pathname || "",
	              N = this.search || "";this.path = U + N;
	        }return this.href = this.format(), this;
	      }, i.prototype.format = function () {
	        var t = this.auth || "";t && (t = encodeURIComponent(t), t = t.replace(/%3A/i, ":"), t += "@");var e = this.protocol || "",
	            r = this.pathname || "",
	            i = this.hash || "",
	            n = !1,
	            o = "";this.host ? n = t + this.host : this.hostname && (n = t + (-1 === this.hostname.indexOf(":") ? this.hostname : "[" + this.hostname + "]"), this.port && (n += ":" + this.port)), this.query && l(this.query) && Object.keys(this.query).length && (o = w.stringify(this.query));var s = this.search || o && "?" + o || "";return e && ":" !== e.substr(-1) && (e += ":"), this.slashes || (!e || A[e]) && n !== !1 ? (n = "//" + (n || ""), r && "/" !== r.charAt(0) && (r = "/" + r)) : n || (n = ""), i && "#" !== i.charAt(0) && (i = "#" + i), s && "?" !== s.charAt(0) && (s = "?" + s), r = r.replace(/[?#]/g, function (t) {
	          return encodeURIComponent(t);
	        }), s = s.replace("#", "%23"), e + n + r + s + i;
	      }, i.prototype.resolve = function (t) {
	        return this.resolveObject(n(t, !1, !0)).format();
	      }, i.prototype.resolveObject = function (t) {
	        if (h(t)) {
	          var e = new i();e.parse(t, !1, !0), t = e;
	        }var r = new i();if (Object.keys(this).forEach(function (t) {
	          r[t] = this[t];
	        }, this), r.hash = t.hash, "" === t.href) return r.href = r.format(), r;if (t.slashes && !t.protocol) return Object.keys(t).forEach(function (e) {
	          "protocol" !== e && (r[e] = t[e]);
	        }), A[r.protocol] && r.hostname && !r.pathname && (r.path = r.pathname = "/"), r.href = r.format(), r;if (t.protocol && t.protocol !== r.protocol) {
	          if (!A[t.protocol]) return Object.keys(t).forEach(function (e) {
	            r[e] = t[e];
	          }), r.href = r.format(), r;if (r.protocol = t.protocol, t.host || S[t.protocol]) r.pathname = t.pathname;else {
	            for (var n = (t.pathname || "").split("/"); n.length && !(t.host = n.shift());) {}t.host || (t.host = ""), t.hostname || (t.hostname = ""), "" !== n[0] && n.unshift(""), n.length < 2 && n.unshift(""), r.pathname = n.join("/");
	          }if (r.search = t.search, r.query = t.query, r.host = t.host || "", r.auth = t.auth, r.hostname = t.hostname || t.host, r.port = t.port, r.pathname || r.search) {
	            var o = r.pathname || "",
	                s = r.search || "";r.path = o + s;
	          }return r.slashes = r.slashes || t.slashes, r.href = r.format(), r;
	        }var a = r.pathname && "/" === r.pathname.charAt(0),
	            l = t.host || t.pathname && "/" === t.pathname.charAt(0),
	            p = l || a || r.host && t.pathname,
	            d = p,
	            f = r.pathname && r.pathname.split("/") || [],
	            n = t.pathname && t.pathname.split("/") || [],
	            v = r.protocol && !A[r.protocol];if (v && (r.hostname = "", r.port = null, r.host && ("" === f[0] ? f[0] = r.host : f.unshift(r.host)), r.host = "", t.protocol && (t.hostname = null, t.port = null, t.host && ("" === n[0] ? n[0] = t.host : n.unshift(t.host)), t.host = null), p = p && ("" === n[0] || "" === f[0])), l) r.host = t.host || "" === t.host ? t.host : r.host, r.hostname = t.hostname || "" === t.hostname ? t.hostname : r.hostname, r.search = t.search, r.query = t.query, f = n;else if (n.length) f || (f = []), f.pop(), f = f.concat(n), r.search = t.search, r.query = t.query;else if (!c(t.search)) {
	          if (v) {
	            r.hostname = r.host = f.shift();var g = r.host && r.host.indexOf("@") > 0 ? r.host.split("@") : !1;g && (r.auth = g.shift(), r.host = r.hostname = g.shift());
	          }return r.search = t.search, r.query = t.query, u(r.pathname) && u(r.search) || (r.path = (r.pathname ? r.pathname : "") + (r.search ? r.search : "")), r.href = r.format(), r;
	        }if (!f.length) return r.pathname = null, r.path = r.search ? "/" + r.search : null, r.href = r.format(), r;for (var m = f.slice(-1)[0], y = (r.host || t.host) && ("." === m || ".." === m) || "" === m, x = 0, b = f.length; b >= 0; b--) {
	          m = f[b], "." == m ? f.splice(b, 1) : ".." === m ? (f.splice(b, 1), x++) : x && (f.splice(b, 1), x--);
	        }if (!p && !d) for (; x--; x) {
	          f.unshift("..");
	        }!p || "" === f[0] || f[0] && "/" === f[0].charAt(0) || f.unshift(""), y && "/" !== f.join("/").substr(-1) && f.push("");var _ = "" === f[0] || f[0] && "/" === f[0].charAt(0);if (v) {
	          r.hostname = r.host = _ ? "" : f.length ? f.shift() : "";var g = r.host && r.host.indexOf("@") > 0 ? r.host.split("@") : !1;g && (r.auth = g.shift(), r.host = r.hostname = g.shift());
	        }return p = p || r.host && f.length, p && !_ && f.unshift(""), f.length ? r.pathname = f.join("/") : (r.pathname = null, r.path = null), u(r.pathname) && u(r.search) || (r.path = (r.pathname ? r.pathname : "") + (r.search ? r.search : "")), r.auth = t.auth || r.auth, r.slashes = r.slashes || t.slashes, r.href = r.format(), r;
	      }, i.prototype.parseHost = function () {
	        var t = this.host,
	            e = f.exec(t);e && (e = e[0], ":" !== e && (this.port = e.substr(1)), t = t.substr(0, t.length - e.length)), t && (this.hostname = t);
	      };
	    }, { punycode: 5, querystring: 8 }], 10: [function (t, e, r) {
	      "use strict";
	      function i(t, e, r) {
	        r = r || 2;var i = e && e.length,
	            a = i ? e[0] * r : t.length,
	            h = o(t, n(t, 0, a, r, !0)),
	            l = [];if (!h) return l;var c, p, d, f, v, g, m;if (i && (h = u(t, e, h, r)), t.length > 80 * r) {
	          c = d = t[0], p = f = t[1];for (var y = r; a > y; y += r) {
	            v = t[y], g = t[y + 1], c > v && (c = v), p > g && (p = g), v > d && (d = v), g > f && (f = g);
	          }m = Math.max(d - c, f - p);
	        }return s(t, h, l, r, c, p, m), l;
	      }function n(t, e, r, i, n) {
	        var o,
	            s,
	            a,
	            h = 0;for (o = e, s = r - i; r > o; o += i) {
	          h += (t[s] - t[o]) * (t[o + 1] + t[s + 1]), s = o;
	        }if (n === h > 0) for (o = e; r > o; o += i) {
	          a = A(o, a);
	        } else for (o = r - i; o >= e; o -= i) {
	          a = A(o, a);
	        }return a;
	      }function o(t, e, r) {
	        r || (r = e);var i,
	            n = e;do {
	          if (i = !1, x(t, n.i, n.next.i) || 0 === y(t, n.prev.i, n.i, n.next.i)) {
	            if (n.prev.next = n.next, n.next.prev = n.prev, n.prevZ && (n.prevZ.nextZ = n.nextZ), n.nextZ && (n.nextZ.prevZ = n.prevZ), n = r = n.prev, n === n.next) return null;i = !0;
	          } else n = n.next;
	        } while (i || n !== r);return r;
	      }function s(t, e, r, i, n, u, c, p) {
	        if (e) {
	          p || void 0 === n || d(t, e, n, u, c);for (var f, v, g = e; e.prev !== e.next;) {
	            if (f = e.prev, v = e.next, a(t, e, n, u, c)) r.push(f.i / i), r.push(e.i / i), r.push(v.i / i), v.prev = f, f.next = v, e.prevZ && (e.prevZ.nextZ = e.nextZ), e.nextZ && (e.nextZ.prevZ = e.prevZ), e = v.next, g = v.next;else if (e = v, e === g) {
	              p ? 1 === p ? (e = h(t, e, r, i), s(t, e, r, i, n, u, c, 2)) : 2 === p && l(t, e, r, i, n, u, c) : s(t, o(t, e), r, i, n, u, c, 1);break;
	            }
	          }
	        }
	      }function a(t, e, r, i, n) {
	        var o = e.prev.i,
	            s = e.i,
	            a = e.next.i,
	            h = t[o],
	            l = t[o + 1],
	            u = t[s],
	            c = t[s + 1],
	            p = t[a],
	            d = t[a + 1],
	            f = h * c - l * u,
	            g = h * d - l * p,
	            m = p * c - d * u,
	            y = f - g - m;if (0 >= y) return !1;var x,
	            b,
	            _,
	            T,
	            E,
	            S,
	            A,
	            w = d - l,
	            C = h - p,
	            M = l - c,
	            R = u - h;if (void 0 !== r) {
	          var D = u > h ? p > h ? h : p : p > u ? u : p,
	              F = c > l ? d > l ? l : d : d > c ? c : d,
	              P = h > u ? h > p ? h : p : u > p ? u : p,
	              O = l > c ? l > d ? l : d : c > d ? c : d,
	              B = v(D, F, r, i, n),
	              L = v(P, O, r, i, n);for (A = e.nextZ; A && A.z <= L;) {
	            if (x = A.i, A = A.nextZ, x !== o && x !== a && (b = t[x], _ = t[x + 1], T = w * b + C * _ - g, T >= 0 && (E = M * b + R * _ + f, E >= 0 && (S = y - T - E, S >= 0 && (T && E || T && S || E && S))))) return !1;
	          }for (A = e.prevZ; A && A.z >= B;) {
	            if (x = A.i, A = A.prevZ, x !== o && x !== a && (b = t[x], _ = t[x + 1], T = w * b + C * _ - g, T >= 0 && (E = M * b + R * _ + f, E >= 0 && (S = y - T - E, S >= 0 && (T && E || T && S || E && S))))) return !1;
	          }
	        } else for (A = e.next.next; A !== e.prev;) {
	          if (x = A.i, A = A.next, b = t[x], _ = t[x + 1], T = w * b + C * _ - g, T >= 0 && (E = M * b + R * _ + f, E >= 0 && (S = y - T - E, S >= 0 && (T && E || T && S || E && S)))) return !1;
	        }return !0;
	      }function h(t, e, r, i) {
	        var n = e;do {
	          var o = n.prev,
	              s = n.next.next;if (o.i !== s.i && b(t, o.i, n.i, n.next.i, s.i) && T(t, o, s) && T(t, s, o)) {
	            r.push(o.i / i), r.push(n.i / i), r.push(s.i / i), o.next = s, s.prev = o;var a = n.prevZ,
	                h = n.nextZ && n.nextZ.nextZ;a && (a.nextZ = h), h && (h.prevZ = a), n = e = s;
	          }n = n.next;
	        } while (n !== e);return n;
	      }function l(t, e, r, i, n, a, h) {
	        var l = e;do {
	          for (var u = l.next.next; u !== l.prev;) {
	            if (l.i !== u.i && m(t, l, u)) {
	              var c = S(l, u);return l = o(t, l, l.next), c = o(t, c, c.next), s(t, l, r, i, n, a, h), void s(t, c, r, i, n, a, h);
	            }u = u.next;
	          }l = l.next;
	        } while (l !== e);
	      }function u(t, e, r, i) {
	        var s,
	            a,
	            h,
	            l,
	            u,
	            p = [];for (s = 0, a = e.length; a > s; s++) {
	          h = e[s] * i, l = a - 1 > s ? e[s + 1] * i : t.length, u = o(t, n(t, h, l, i, !1)), u && p.push(g(t, u));
	        }for (p.sort(function (e, r) {
	          return t[e.i] - t[r.i];
	        }), s = 0; s < p.length; s++) {
	          c(t, p[s], r), r = o(t, r, r.next);
	        }return r;
	      }function c(t, e, r) {
	        if (r = p(t, e, r)) {
	          var i = S(r, e);o(t, i, i.next);
	        }
	      }function p(t, e, r) {
	        var i,
	            n,
	            o,
	            s = r,
	            a = e.i,
	            h = t[a],
	            l = t[a + 1],
	            u = -(1 / 0);do {
	          if (n = s.i, o = s.next.i, l <= t[n + 1] && l >= t[o + 1]) {
	            var c = t[n] + (l - t[n + 1]) * (t[o] - t[n]) / (t[o + 1] - t[n + 1]);h >= c && c > u && (u = c, i = t[n] < t[o] ? s : s.next);
	          }s = s.next;
	        } while (s !== r);if (!i) return null;var p,
	            d,
	            f,
	            v,
	            g,
	            m,
	            y = t[i.i],
	            x = t[i.i + 1],
	            b = h * x - l * y,
	            _ = h * l - l * u,
	            E = l - l,
	            S = h - u,
	            A = l - x,
	            w = y - h,
	            C = b - _ - (u * x - l * y),
	            M = 0 >= C ? -1 : 1,
	            R = i,
	            D = 1 / 0;for (s = i.next; s !== R;) {
	          p = t[s.i], d = t[s.i + 1], f = h - p, f >= 0 && p >= y && (v = (E * p + S * d - _) * M, v >= 0 && (g = (A * p + w * d + b) * M, g >= 0 && C * M - v - g >= 0 && (m = Math.abs(l - d) / f, D > m && T(t, s, e) && (i = s, D = m)))), s = s.next;
	        }return i;
	      }function d(t, e, r, i, n) {
	        var o = e;do {
	          null === o.z && (o.z = v(t[o.i], t[o.i + 1], r, i, n)), o.prevZ = o.prev, o.nextZ = o.next, o = o.next;
	        } while (o !== e);o.prevZ.nextZ = null, o.prevZ = null, f(o);
	      }function f(t) {
	        var e,
	            r,
	            i,
	            n,
	            o,
	            s,
	            a,
	            h,
	            l = 1;do {
	          for (r = t, t = null, o = null, s = 0; r;) {
	            for (s++, i = r, a = 0, e = 0; l > e && (a++, i = i.nextZ, i); e++) {}for (h = l; a > 0 || h > 0 && i;) {
	              0 === a ? (n = i, i = i.nextZ, h--) : 0 !== h && i ? r.z <= i.z ? (n = r, r = r.nextZ, a--) : (n = i, i = i.nextZ, h--) : (n = r, r = r.nextZ, a--), o ? o.nextZ = n : t = n, n.prevZ = o, o = n;
	            }r = i;
	          }o.nextZ = null, l *= 2;
	        } while (s > 1);return t;
	      }function v(t, e, r, i, n) {
	        return t = 1e3 * (t - r) / n, t = 16711935 & (t | t << 8), t = 252645135 & (t | t << 4), t = 858993459 & (t | t << 2), t = 1431655765 & (t | t << 1), e = 1e3 * (e - i) / n, e = 16711935 & (e | e << 8), e = 252645135 & (e | e << 4), e = 858993459 & (e | e << 2), e = 1431655765 & (e | e << 1), t | e << 1;
	      }function g(t, e) {
	        var r = e,
	            i = e;do {
	          t[r.i] < t[i.i] && (i = r), r = r.next;
	        } while (r !== e);return i;
	      }function m(t, e, r) {
	        return !_(t, e, e.i, r.i) && T(t, e, r) && T(t, r, e) && E(t, e, e.i, r.i);
	      }function y(t, e, r, i) {
	        var n = (t[r + 1] - t[e + 1]) * (t[i] - t[r]) - (t[r] - t[e]) * (t[i + 1] - t[r + 1]);return n > 0 ? 1 : 0 > n ? -1 : 0;
	      }function x(t, e, r) {
	        return t[e] === t[r] && t[e + 1] === t[r + 1];
	      }function b(t, e, r, i, n) {
	        return y(t, e, r, i) !== y(t, e, r, n) && y(t, i, n, e) !== y(t, i, n, r);
	      }function _(t, e, r, i) {
	        var n = e;do {
	          var o = n.i,
	              s = n.next.i;if (o !== r && s !== r && o !== i && s !== i && b(t, o, s, r, i)) return !0;n = n.next;
	        } while (n !== e);return !1;
	      }function T(t, e, r) {
	        return -1 === y(t, e.prev.i, e.i, e.next.i) ? -1 !== y(t, e.i, r.i, e.next.i) && -1 !== y(t, e.i, e.prev.i, r.i) : -1 === y(t, e.i, r.i, e.prev.i) || -1 === y(t, e.i, e.next.i, r.i);
	      }function E(t, e, r, i) {
	        var n = e,
	            o = !1,
	            s = (t[r] + t[i]) / 2,
	            a = (t[r + 1] + t[i + 1]) / 2;do {
	          var h = n.i,
	              l = n.next.i;t[h + 1] > a != t[l + 1] > a && s < (t[l] - t[h]) * (a - t[h + 1]) / (t[l + 1] - t[h + 1]) + t[h] && (o = !o), n = n.next;
	        } while (n !== e);return o;
	      }function S(t, e) {
	        var r = new w(t.i),
	            i = new w(e.i),
	            n = t.next,
	            o = e.prev;return t.next = e, e.prev = t, r.next = n, n.prev = r, i.next = r, r.prev = i, o.next = i, i.prev = o, i;
	      }function A(t, e) {
	        var r = new w(t);return e ? (r.next = e.next, r.prev = e, e.next.prev = r, e.next = r) : (r.prev = r, r.next = r), r;
	      }function w(t) {
	        this.i = t, this.prev = null, this.next = null, this.z = null, this.prevZ = null, this.nextZ = null;
	      }e.exports = i;
	    }, {}], 11: [function (t, e, r) {
	      "use strict";
	      function i(t, e, r) {
	        this.fn = t, this.context = e, this.once = r || !1;
	      }function n() {}var o = "function" != typeof Object.create ? "~" : !1;n.prototype._events = void 0, n.prototype.listeners = function (t, e) {
	        var r = o ? o + t : t,
	            i = this._events && this._events[r];if (e) return !!i;if (!i) return [];if (this._events[r].fn) return [this._events[r].fn];for (var n = 0, s = this._events[r].length, a = new Array(s); s > n; n++) {
	          a[n] = this._events[r][n].fn;
	        }return a;
	      }, n.prototype.emit = function (t, e, r, i, n, s) {
	        var a = o ? o + t : t;if (!this._events || !this._events[a]) return !1;var h,
	            l,
	            u = this._events[a],
	            c = arguments.length;if ("function" == typeof u.fn) {
	          switch (u.once && this.removeListener(t, u.fn, void 0, !0), c) {case 1:
	              return u.fn.call(u.context), !0;case 2:
	              return u.fn.call(u.context, e), !0;case 3:
	              return u.fn.call(u.context, e, r), !0;case 4:
	              return u.fn.call(u.context, e, r, i), !0;case 5:
	              return u.fn.call(u.context, e, r, i, n), !0;case 6:
	              return u.fn.call(u.context, e, r, i, n, s), !0;}for (l = 1, h = new Array(c - 1); c > l; l++) {
	            h[l - 1] = arguments[l];
	          }u.fn.apply(u.context, h);
	        } else {
	          var p,
	              d = u.length;for (l = 0; d > l; l++) {
	            switch (u[l].once && this.removeListener(t, u[l].fn, void 0, !0), c) {case 1:
	                u[l].fn.call(u[l].context);break;case 2:
	                u[l].fn.call(u[l].context, e);break;case 3:
	                u[l].fn.call(u[l].context, e, r);break;default:
	                if (!h) for (p = 1, h = new Array(c - 1); c > p; p++) {
	                  h[p - 1] = arguments[p];
	                }u[l].fn.apply(u[l].context, h);}
	          }
	        }return !0;
	      }, n.prototype.on = function (t, e, r) {
	        var n = new i(e, r || this),
	            s = o ? o + t : t;return this._events || (this._events = o ? {} : Object.create(null)), this._events[s] ? this._events[s].fn ? this._events[s] = [this._events[s], n] : this._events[s].push(n) : this._events[s] = n, this;
	      }, n.prototype.once = function (t, e, r) {
	        var n = new i(e, r || this, !0),
	            s = o ? o + t : t;return this._events || (this._events = o ? {} : Object.create(null)), this._events[s] ? this._events[s].fn ? this._events[s] = [this._events[s], n] : this._events[s].push(n) : this._events[s] = n, this;
	      }, n.prototype.removeListener = function (t, e, r, i) {
	        var n = o ? o + t : t;if (!this._events || !this._events[n]) return this;var s = this._events[n],
	            a = [];if (e) if (s.fn) (s.fn !== e || i && !s.once || r && s.context !== r) && a.push(s);else for (var h = 0, l = s.length; l > h; h++) {
	          (s[h].fn !== e || i && !s[h].once || r && s[h].context !== r) && a.push(s[h]);
	        }return a.length ? this._events[n] = 1 === a.length ? a[0] : a : delete this._events[n], this;
	      }, n.prototype.removeAllListeners = function (t) {
	        return this._events ? (t ? delete this._events[o ? o + t : t] : this._events = o ? {} : Object.create(null), this) : this;
	      }, n.prototype.off = n.prototype.removeListener, n.prototype.addListener = n.prototype.on, n.prototype.setMaxListeners = function () {
	        return this;
	      }, n.prefixed = o, e.exports = n;
	    }, {}], 12: [function (t, e, r) {
	      "use strict";
	      function i(t) {
	        if (null == t) throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t);
	      }e.exports = Object.assign || function (t, e) {
	        for (var r, n, o = i(t), s = 1; s < arguments.length; s++) {
	          r = arguments[s], n = Object.keys(Object(r));for (var a = 0; a < n.length; a++) {
	            o[n[a]] = r[n[a]];
	          }
	        }return o;
	      };
	    }, {}], 13: [function (e, r, i) {
	      (function (e) {
	        !function () {
	          function i(t) {
	            var e = !1;return function () {
	              if (e) throw new Error("Callback was already called.");e = !0, t.apply(n, arguments);
	            };
	          }var n,
	              o,
	              s = {};n = this, null != n && (o = n.async), s.noConflict = function () {
	            return n.async = o, s;
	          };var a = Object.prototype.toString,
	              h = Array.isArray || function (t) {
	            return "[object Array]" === a.call(t);
	          },
	              l = function l(t, e) {
	            if (t.forEach) return t.forEach(e);for (var r = 0; r < t.length; r += 1) {
	              e(t[r], r, t);
	            }
	          },
	              u = function u(t, e) {
	            if (t.map) return t.map(e);var r = [];return l(t, function (t, i, n) {
	              r.push(e(t, i, n));
	            }), r;
	          },
	              c = function c(t, e, r) {
	            return t.reduce ? t.reduce(e, r) : (l(t, function (t, i, n) {
	              r = e(r, t, i, n);
	            }), r);
	          },
	              p = function p(t) {
	            if (Object.keys) return Object.keys(t);var e = [];for (var r in t) {
	              t.hasOwnProperty(r) && e.push(r);
	            }return e;
	          };"undefined" != typeof e && e.nextTick ? (s.nextTick = e.nextTick, s.setImmediate = "undefined" != typeof setImmediate ? function (t) {
	            setImmediate(t);
	          } : s.nextTick) : "function" == typeof setImmediate ? (s.nextTick = function (t) {
	            setImmediate(t);
	          }, s.setImmediate = s.nextTick) : (s.nextTick = function (t) {
	            setTimeout(t, 0);
	          }, s.setImmediate = s.nextTick), s.each = function (t, e, r) {
	            function n(e) {
	              e ? (r(e), r = function r() {}) : (o += 1, o >= t.length && r());
	            }if (r = r || function () {}, !t.length) return r();var o = 0;l(t, function (t) {
	              e(t, i(n));
	            });
	          }, s.forEach = s.each, s.eachSeries = function (t, e, r) {
	            if (r = r || function () {}, !t.length) return r();var i = 0,
	                n = function n() {
	              e(t[i], function (e) {
	                e ? (r(e), r = function r() {}) : (i += 1, i >= t.length ? r() : n());
	              });
	            };n();
	          }, s.forEachSeries = s.eachSeries, s.eachLimit = function (t, e, r, i) {
	            var n = d(e);n.apply(null, [t, r, i]);
	          }, s.forEachLimit = s.eachLimit;var d = function d(t) {
	            return function (e, r, i) {
	              if (i = i || function () {}, !e.length || 0 >= t) return i();var n = 0,
	                  o = 0,
	                  s = 0;!function a() {
	                if (n >= e.length) return i();for (; t > s && o < e.length;) {
	                  o += 1, s += 1, r(e[o - 1], function (t) {
	                    t ? (i(t), i = function i() {}) : (n += 1, s -= 1, n >= e.length ? i() : a());
	                  });
	                }
	              }();
	            };
	          },
	              f = function f(t) {
	            return function () {
	              var e = Array.prototype.slice.call(arguments);return t.apply(null, [s.each].concat(e));
	            };
	          },
	              v = function v(t, e) {
	            return function () {
	              var r = Array.prototype.slice.call(arguments);return e.apply(null, [d(t)].concat(r));
	            };
	          },
	              g = function g(t) {
	            return function () {
	              var e = Array.prototype.slice.call(arguments);return t.apply(null, [s.eachSeries].concat(e));
	            };
	          },
	              m = function m(t, e, r, i) {
	            if (e = u(e, function (t, e) {
	              return { index: e, value: t };
	            }), i) {
	              var n = [];t(e, function (t, e) {
	                r(t.value, function (r, i) {
	                  n[t.index] = i, e(r);
	                });
	              }, function (t) {
	                i(t, n);
	              });
	            } else t(e, function (t, e) {
	              r(t.value, function (t) {
	                e(t);
	              });
	            });
	          };s.map = f(m), s.mapSeries = g(m), s.mapLimit = function (t, e, r, i) {
	            return y(e)(t, r, i);
	          };var y = function y(t) {
	            return v(t, m);
	          };s.reduce = function (t, e, r, i) {
	            s.eachSeries(t, function (t, i) {
	              r(e, t, function (t, r) {
	                e = r, i(t);
	              });
	            }, function (t) {
	              i(t, e);
	            });
	          }, s.inject = s.reduce, s.foldl = s.reduce, s.reduceRight = function (t, e, r, i) {
	            var n = u(t, function (t) {
	              return t;
	            }).reverse();s.reduce(n, e, r, i);
	          }, s.foldr = s.reduceRight;var x = function x(t, e, r, i) {
	            var n = [];e = u(e, function (t, e) {
	              return { index: e, value: t };
	            }), t(e, function (t, e) {
	              r(t.value, function (r) {
	                r && n.push(t), e();
	              });
	            }, function (t) {
	              i(u(n.sort(function (t, e) {
	                return t.index - e.index;
	              }), function (t) {
	                return t.value;
	              }));
	            });
	          };s.filter = f(x), s.filterSeries = g(x), s.select = s.filter, s.selectSeries = s.filterSeries;var b = function b(t, e, r, i) {
	            var n = [];e = u(e, function (t, e) {
	              return { index: e, value: t };
	            }), t(e, function (t, e) {
	              r(t.value, function (r) {
	                r || n.push(t), e();
	              });
	            }, function (t) {
	              i(u(n.sort(function (t, e) {
	                return t.index - e.index;
	              }), function (t) {
	                return t.value;
	              }));
	            });
	          };s.reject = f(b), s.rejectSeries = g(b);var _ = function _(t, e, r, i) {
	            t(e, function (t, e) {
	              r(t, function (r) {
	                r ? (i(t), i = function i() {}) : e();
	              });
	            }, function (t) {
	              i();
	            });
	          };s.detect = f(_), s.detectSeries = g(_), s.some = function (t, e, r) {
	            s.each(t, function (t, i) {
	              e(t, function (t) {
	                t && (r(!0), r = function r() {}), i();
	              });
	            }, function (t) {
	              r(!1);
	            });
	          }, s.any = s.some, s.every = function (t, e, r) {
	            s.each(t, function (t, i) {
	              e(t, function (t) {
	                t || (r(!1), r = function r() {}), i();
	              });
	            }, function (t) {
	              r(!0);
	            });
	          }, s.all = s.every, s.sortBy = function (t, e, r) {
	            s.map(t, function (t, r) {
	              e(t, function (e, i) {
	                e ? r(e) : r(null, { value: t, criteria: i });
	              });
	            }, function (t, e) {
	              if (t) return r(t);var i = function i(t, e) {
	                var r = t.criteria,
	                    i = e.criteria;return i > r ? -1 : r > i ? 1 : 0;
	              };r(null, u(e.sort(i), function (t) {
	                return t.value;
	              }));
	            });
	          }, s.auto = function (t, e) {
	            e = e || function () {};var r = p(t),
	                i = r.length;if (!i) return e();var n = {},
	                o = [],
	                a = function a(t) {
	              o.unshift(t);
	            },
	                u = function u(t) {
	              for (var e = 0; e < o.length; e += 1) {
	                if (o[e] === t) return void o.splice(e, 1);
	              }
	            },
	                d = function d() {
	              i--, l(o.slice(0), function (t) {
	                t();
	              });
	            };a(function () {
	              if (!i) {
	                var t = e;e = function e() {}, t(null, n);
	              }
	            }), l(r, function (r) {
	              var i = h(t[r]) ? t[r] : [t[r]],
	                  o = function o(t) {
	                var i = Array.prototype.slice.call(arguments, 1);if (i.length <= 1 && (i = i[0]), t) {
	                  var o = {};l(p(n), function (t) {
	                    o[t] = n[t];
	                  }), o[r] = i, e(t, o), e = function e() {};
	                } else n[r] = i, s.setImmediate(d);
	              },
	                  f = i.slice(0, Math.abs(i.length - 1)) || [],
	                  v = function v() {
	                return c(f, function (t, e) {
	                  return t && n.hasOwnProperty(e);
	                }, !0) && !n.hasOwnProperty(r);
	              };if (v()) i[i.length - 1](o, n);else {
	                var g = function g() {
	                  v() && (u(g), i[i.length - 1](o, n));
	                };a(g);
	              }
	            });
	          }, s.retry = function (t, e, r) {
	            var i = 5,
	                n = [];"function" == typeof t && (r = e, e = t, t = i), t = parseInt(t, 10) || i;var o = function o(i, _o2) {
	              for (var a = function a(t, e) {
	                return function (r) {
	                  t(function (t, i) {
	                    r(!t || e, { err: t, result: i });
	                  }, _o2);
	                };
	              }; t;) {
	                n.push(a(e, !(t -= 1)));
	              }s.series(n, function (t, e) {
	                e = e[e.length - 1], (i || r)(e.err, e.result);
	              });
	            };return r ? o() : o;
	          }, s.waterfall = function (t, e) {
	            if (e = e || function () {}, !h(t)) {
	              var r = new Error("First argument to waterfall must be an array of functions");return e(r);
	            }if (!t.length) return e();var i = function i(t) {
	              return function (r) {
	                if (r) e.apply(null, arguments), e = function e() {};else {
	                  var n = Array.prototype.slice.call(arguments, 1),
	                      o = t.next();n.push(o ? i(o) : e), s.setImmediate(function () {
	                    t.apply(null, n);
	                  });
	                }
	              };
	            };i(s.iterator(t))();
	          };var T = function T(t, e, r) {
	            if (r = r || function () {}, h(e)) t.map(e, function (t, e) {
	              t && t(function (t) {
	                var r = Array.prototype.slice.call(arguments, 1);r.length <= 1 && (r = r[0]), e.call(null, t, r);
	              });
	            }, r);else {
	              var i = {};t.each(p(e), function (t, r) {
	                e[t](function (e) {
	                  var n = Array.prototype.slice.call(arguments, 1);n.length <= 1 && (n = n[0]), i[t] = n, r(e);
	                });
	              }, function (t) {
	                r(t, i);
	              });
	            }
	          };s.parallel = function (t, e) {
	            T({ map: s.map, each: s.each }, t, e);
	          }, s.parallelLimit = function (t, e, r) {
	            T({ map: y(e), each: d(e) }, t, r);
	          }, s.series = function (t, e) {
	            if (e = e || function () {}, h(t)) s.mapSeries(t, function (t, e) {
	              t && t(function (t) {
	                var r = Array.prototype.slice.call(arguments, 1);r.length <= 1 && (r = r[0]), e.call(null, t, r);
	              });
	            }, e);else {
	              var r = {};s.eachSeries(p(t), function (e, i) {
	                t[e](function (t) {
	                  var n = Array.prototype.slice.call(arguments, 1);n.length <= 1 && (n = n[0]), r[e] = n, i(t);
	                });
	              }, function (t) {
	                e(t, r);
	              });
	            }
	          }, s.iterator = function (t) {
	            var e = function e(r) {
	              var i = function i() {
	                return t.length && t[r].apply(null, arguments), i.next();
	              };return i.next = function () {
	                return r < t.length - 1 ? e(r + 1) : null;
	              }, i;
	            };return e(0);
	          }, s.apply = function (t) {
	            var e = Array.prototype.slice.call(arguments, 1);return function () {
	              return t.apply(null, e.concat(Array.prototype.slice.call(arguments)));
	            };
	          };var E = function E(t, e, r, i) {
	            var n = [];t(e, function (t, e) {
	              r(t, function (t, r) {
	                n = n.concat(r || []), e(t);
	              });
	            }, function (t) {
	              i(t, n);
	            });
	          };s.concat = f(E), s.concatSeries = g(E), s.whilst = function (t, e, r) {
	            t() ? e(function (i) {
	              return i ? r(i) : void s.whilst(t, e, r);
	            }) : r();
	          }, s.doWhilst = function (t, e, r) {
	            t(function (i) {
	              if (i) return r(i);var n = Array.prototype.slice.call(arguments, 1);e.apply(null, n) ? s.doWhilst(t, e, r) : r();
	            });
	          }, s.until = function (t, e, r) {
	            t() ? r() : e(function (i) {
	              return i ? r(i) : void s.until(t, e, r);
	            });
	          }, s.doUntil = function (t, e, r) {
	            t(function (i) {
	              if (i) return r(i);var n = Array.prototype.slice.call(arguments, 1);e.apply(null, n) ? r() : s.doUntil(t, e, r);
	            });
	          }, s.queue = function (t, e) {
	            function r(t, e, r, i) {
	              return t.started || (t.started = !0), h(e) || (e = [e]), 0 == e.length ? s.setImmediate(function () {
	                t.drain && t.drain();
	              }) : void l(e, function (e) {
	                var n = { data: e, callback: "function" == typeof i ? i : null };r ? t.tasks.unshift(n) : t.tasks.push(n), t.saturated && t.tasks.length === t.concurrency && t.saturated(), s.setImmediate(t.process);
	              });
	            }void 0 === e && (e = 1);var n = 0,
	                o = { tasks: [], concurrency: e, saturated: null, empty: null, drain: null, started: !1, paused: !1, push: function push(t, e) {
	                r(o, t, !1, e);
	              }, kill: function kill() {
	                o.drain = null, o.tasks = [];
	              }, unshift: function unshift(t, e) {
	                r(o, t, !0, e);
	              }, process: function process() {
	                if (!o.paused && n < o.concurrency && o.tasks.length) {
	                  var e = o.tasks.shift();o.empty && 0 === o.tasks.length && o.empty(), n += 1;var r = function r() {
	                    n -= 1, e.callback && e.callback.apply(e, arguments), o.drain && o.tasks.length + n === 0 && o.drain(), o.process();
	                  },
	                      s = i(r);t(e.data, s);
	                }
	              }, length: function length() {
	                return o.tasks.length;
	              }, running: function running() {
	                return n;
	              }, idle: function idle() {
	                return o.tasks.length + n === 0;
	              }, pause: function pause() {
	                o.paused !== !0 && (o.paused = !0, o.process());
	              }, resume: function resume() {
	                o.paused !== !1 && (o.paused = !1, o.process());
	              } };return o;
	          }, s.priorityQueue = function (t, e) {
	            function r(t, e) {
	              return t.priority - e.priority;
	            }function i(t, e, r) {
	              for (var i = -1, n = t.length - 1; n > i;) {
	                var o = i + (n - i + 1 >>> 1);r(e, t[o]) >= 0 ? i = o : n = o - 1;
	              }return i;
	            }function n(t, e, n, o) {
	              return t.started || (t.started = !0), h(e) || (e = [e]), 0 == e.length ? s.setImmediate(function () {
	                t.drain && t.drain();
	              }) : void l(e, function (e) {
	                var a = { data: e, priority: n, callback: "function" == typeof o ? o : null };t.tasks.splice(i(t.tasks, a, r) + 1, 0, a), t.saturated && t.tasks.length === t.concurrency && t.saturated(), s.setImmediate(t.process);
	              });
	            }var o = s.queue(t, e);return o.push = function (t, e, r) {
	              n(o, t, e, r);
	            }, delete o.unshift, o;
	          }, s.cargo = function (t, e) {
	            var r = !1,
	                i = [],
	                n = { tasks: i, payload: e, saturated: null, empty: null, drain: null, drained: !0, push: function push(t, r) {
	                h(t) || (t = [t]), l(t, function (t) {
	                  i.push({ data: t, callback: "function" == typeof r ? r : null }), n.drained = !1, n.saturated && i.length === e && n.saturated();
	                }), s.setImmediate(n.process);
	              }, process: function o() {
	                if (!r) {
	                  if (0 === i.length) return n.drain && !n.drained && n.drain(), void (n.drained = !0);var s = "number" == typeof e ? i.splice(0, e) : i.splice(0, i.length),
	                      a = u(s, function (t) {
	                    return t.data;
	                  });n.empty && n.empty(), r = !0, t(a, function () {
	                    r = !1;var t = arguments;l(s, function (e) {
	                      e.callback && e.callback.apply(null, t);
	                    }), o();
	                  });
	                }
	              }, length: function length() {
	                return i.length;
	              }, running: function running() {
	                return r;
	              } };return n;
	          };var S = function S(t) {
	            return function (e) {
	              var r = Array.prototype.slice.call(arguments, 1);e.apply(null, r.concat([function (e) {
	                var r = Array.prototype.slice.call(arguments, 1);"undefined" != typeof console && (e ? console.error && console.error(e) : console[t] && l(r, function (e) {
	                  console[t](e);
	                }));
	              }]));
	            };
	          };s.log = S("log"), s.dir = S("dir"), s.memoize = function (t, e) {
	            var r = {},
	                i = {};e = e || function (t) {
	              return t;
	            };var n = function n() {
	              var n = Array.prototype.slice.call(arguments),
	                  o = n.pop(),
	                  a = e.apply(null, n);a in r ? s.nextTick(function () {
	                o.apply(null, r[a]);
	              }) : a in i ? i[a].push(o) : (i[a] = [o], t.apply(null, n.concat([function () {
	                r[a] = arguments;var t = i[a];delete i[a];for (var e = 0, n = t.length; n > e; e++) {
	                  t[e].apply(null, arguments);
	                }
	              }])));
	            };return n.memo = r, n.unmemoized = t, n;
	          }, s.unmemoize = function (t) {
	            return function () {
	              return (t.unmemoized || t).apply(null, arguments);
	            };
	          }, s.times = function (t, e, r) {
	            for (var i = [], n = 0; t > n; n++) {
	              i.push(n);
	            }return s.map(i, e, r);
	          }, s.timesSeries = function (t, e, r) {
	            for (var i = [], n = 0; t > n; n++) {
	              i.push(n);
	            }return s.mapSeries(i, e, r);
	          }, s.seq = function () {
	            var t = arguments;return function () {
	              var e = this,
	                  r = Array.prototype.slice.call(arguments),
	                  i = r.pop();s.reduce(t, r, function (t, r, i) {
	                r.apply(e, t.concat([function () {
	                  var t = arguments[0],
	                      e = Array.prototype.slice.call(arguments, 1);i(t, e);
	                }]));
	              }, function (t, r) {
	                i.apply(e, [t].concat(r));
	              });
	            };
	          }, s.compose = function () {
	            return s.seq.apply(null, Array.prototype.reverse.call(arguments));
	          };var A = function A(t, e) {
	            var r = function r() {
	              var r = this,
	                  i = Array.prototype.slice.call(arguments),
	                  n = i.pop();return t(e, function (t, e) {
	                t.apply(r, i.concat([e]));
	              }, n);
	            };if (arguments.length > 2) {
	              var i = Array.prototype.slice.call(arguments, 2);return r.apply(this, i);
	            }return r;
	          };s.applyEach = f(A), s.applyEachSeries = g(A), s.forever = function (t, e) {
	            function r(i) {
	              if (i) {
	                if (e) return e(i);throw i;
	              }t(r);
	            }r();
	          }, "undefined" != typeof r && r.exports ? r.exports = s : "undefined" != typeof t && t.amd ? t([], function () {
	            return s;
	          }) : n.async = s;
	        }();
	      }).call(this, e("_process"));
	    }, { _process: 4 }], 14: [function (t, e, r) {
	      arguments[4][11][0].apply(r, arguments);
	    }, { dup: 11 }], 15: [function (t, e, r) {
	      function i(t, e) {
	        a.call(this), e = e || 10, this.baseUrl = t || "", this.progress = 0, this.loading = !1, this._progressChunk = 0, this._beforeMiddleware = [], this._afterMiddleware = [], this._boundLoadResource = this._loadResource.bind(this), this._boundOnLoad = this._onLoad.bind(this), this._buffer = [], this._numToLoad = 0, this._queue = n.queue(this._boundLoadResource, e), this.resources = {};
	      }var n = t("async"),
	          o = t("url"),
	          s = t("./Resource"),
	          a = t("eventemitter3");i.prototype = Object.create(a.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.add = i.prototype.enqueue = function (t, e, r, i) {
	        if (Array.isArray(t)) {
	          for (var n = 0; n < t.length; ++n) {
	            this.add(t[n]);
	          }return this;
	        }if ("object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) && (i = e || t.callback || t.onComplete, r = t, e = t.url, t = t.name || t.key || t.url), "string" != typeof e && (i = r, r = e, e = t), "string" != typeof e) throw new Error("No url passed to add resource to loader.");if ("function" == typeof r && (i = r, r = null), this.resources[t]) throw new Error('Resource with name "' + t + '" already exists.');return e = this._handleBaseUrl(e), this.resources[t] = new s(t, e, r), "function" == typeof i && this.resources[t].once("afterMiddleware", i), this._numToLoad++, this._queue.started ? (this._queue.push(this.resources[t]), this._progressChunk = (100 - this.progress) / (this._queue.length() + this._queue.running())) : (this._buffer.push(this.resources[t]), this._progressChunk = 100 / this._buffer.length), this;
	      }, i.prototype._handleBaseUrl = function (t) {
	        var e = o.parse(t);return e.protocol || 0 === e.pathname.indexOf("//") ? t : this.baseUrl.length && this.baseUrl.lastIndexOf("/") !== this.baseUrl.length - 1 && t.lastIndexOf("/") !== t.length - 1 ? this.baseUrl + "/" + t : this.baseUrl + t;
	      }, i.prototype.before = i.prototype.pre = function (t) {
	        return this._beforeMiddleware.push(t), this;
	      }, i.prototype.after = i.prototype.use = function (t) {
	        return this._afterMiddleware.push(t), this;
	      }, i.prototype.reset = function () {
	        this.progress = 0, this.loading = !1, this._progressChunk = 0, this._buffer.length = 0, this._numToLoad = 0, this._queue.kill(), this._queue.started = !1, this.resources = {};
	      }, i.prototype.load = function (t) {
	        if ("function" == typeof t && this.once("complete", t), this._queue.started) return this;this.emit("start", this);for (var e = 0; e < this._buffer.length; ++e) {
	          this._queue.push(this._buffer[e]);
	        }return this._buffer.length = 0, this;
	      }, i.prototype._loadResource = function (t, e) {
	        var r = this;t._dequeue = e, this._runMiddleware(t, this._beforeMiddleware, function () {
	          t.load(r._boundOnLoad);
	        });
	      }, i.prototype._onComplete = function () {
	        this.emit("complete", this, this.resources);
	      }, i.prototype._onLoad = function (t) {
	        this.progress += this._progressChunk, this.emit("progress", this, t), t.error ? this.emit("error", t.error, this, t) : this.emit("load", this, t), this._runMiddleware(t, this._afterMiddleware, function () {
	          t.emit("afterMiddleware", t), this._numToLoad--, 0 === this._numToLoad && this._onComplete();
	        }), t._dequeue();
	      }, i.prototype._runMiddleware = function (t, e, r) {
	        var i = this;n.eachSeries(e, function (e, r) {
	          e.call(i, t, r);
	        }, r.bind(this, t));
	      }, i.LOAD_TYPE = s.LOAD_TYPE, i.XHR_READY_STATE = s.XHR_READY_STATE, i.XHR_RESPONSE_TYPE = s.XHR_RESPONSE_TYPE;
	    }, { "./Resource": 16, async: 13, eventemitter3: 14, url: 9 }], 16: [function (t, e, r) {
	      function i(t, e, r) {
	        if (s.call(this), r = r || {}, "string" != typeof t || "string" != typeof e) throw new Error("Both name and url are required for constructing a resource.");this.name = t, this.url = e, this.isDataUrl = 0 === this.url.indexOf("data:"), this.data = null, this.crossOrigin = r.crossOrigin === !0 ? "anonymous" : null, this.loadType = r.loadType || this._determineLoadType(), this.xhrType = r.xhrType, this.error = null, this.xhr = null, this.isJson = !1, this.isXml = !1, this.isImage = !1, this.isAudio = !1, this.isVideo = !1, this._dequeue = null, this._boundComplete = this.complete.bind(this), this._boundOnError = this._onError.bind(this), this._boundOnProgress = this._onProgress.bind(this), this._boundXhrOnError = this._xhrOnError.bind(this), this._boundXhrOnAbort = this._xhrOnAbort.bind(this), this._boundXhrOnLoad = this._xhrOnLoad.bind(this), this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);
	      }function n(t) {
	        return t.toString().replace("object ", "");
	      }function o(t, e, r) {
	        e && 0 === e.indexOf(".") && (e = e.substring(1)), e && (t[e] = r);
	      }var s = t("eventemitter3"),
	          a = t("url"),
	          h = !(!window.XDomainRequest || "withCredentials" in new XMLHttpRequest()),
	          l = null;i.prototype = Object.create(s.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.complete = function () {
	        this.data && this.data.removeEventListener && (this.data.removeEventListener("error", this._boundOnError), this.data.removeEventListener("load", this._boundComplete), this.data.removeEventListener("progress", this._boundOnProgress), this.data.removeEventListener("canplaythrough", this._boundComplete)), this.xhr && (this.xhr.removeEventListener ? (this.xhr.removeEventListener("error", this._boundXhrOnError), this.xhr.removeEventListener("abort", this._boundXhrOnAbort), this.xhr.removeEventListener("progress", this._boundOnProgress), this.xhr.removeEventListener("load", this._boundXhrOnLoad)) : (this.xhr.onerror = null, this.xhr.ontimeout = null, this.xhr.onprogress = null, this.xhr.onload = null)), this.emit("complete", this);
	      }, i.prototype.load = function (t) {
	        switch (this.emit("start", this), t && this.once("complete", t), "string" != typeof this.crossOrigin && (this.crossOrigin = this._determineCrossOrigin(this.url)), this.loadType) {case i.LOAD_TYPE.IMAGE:
	            this._loadImage();break;case i.LOAD_TYPE.AUDIO:
	            this._loadElement("audio");break;case i.LOAD_TYPE.VIDEO:
	            this._loadElement("video");break;case i.LOAD_TYPE.XHR:default:
	            h && this.crossOrigin ? this._loadXdr() : this._loadXhr();}
	      }, i.prototype._loadImage = function () {
	        this.data = new Image(), this.crossOrigin && (this.data.crossOrigin = this.crossOrigin), this.data.src = this.url, this.isImage = !0, this.data.addEventListener("error", this._boundOnError, !1), this.data.addEventListener("load", this._boundComplete, !1), this.data.addEventListener("progress", this._boundOnProgress, !1);
	      }, i.prototype._loadElement = function (t) {
	        if (this.data = document.createElement(t), Array.isArray(this.url)) for (var e = 0; e < this.url.length; ++e) {
	          this.data.appendChild(this._createSource(t, this.url[e]));
	        } else this.data.appendChild(this._createSource(t, this.url));this["is" + t[0].toUpperCase() + t.substring(1)] = !0, this.data.addEventListener("error", this._boundOnError, !1), this.data.addEventListener("load", this._boundComplete, !1), this.data.addEventListener("progress", this._boundOnProgress, !1), this.data.addEventListener("canplaythrough", this._boundComplete, !1), this.data.load();
	      }, i.prototype._loadXhr = function () {
	        "string" != typeof this.xhrType && (this.xhrType = this._determineXhrType());var t = this.xhr = new XMLHttpRequest();t.open("GET", this.url, !0), t.responseType = this.xhrType === i.XHR_RESPONSE_TYPE.JSON || this.xhrType === i.XHR_RESPONSE_TYPE.DOCUMENT ? i.XHR_RESPONSE_TYPE.TEXT : this.xhrType, t.addEventListener("error", this._boundXhrOnError, !1), t.addEventListener("abort", this._boundXhrOnAbort, !1), t.addEventListener("progress", this._boundOnProgress, !1), t.addEventListener("load", this._boundXhrOnLoad, !1), t.send();
	      }, i.prototype._loadXdr = function () {
	        "string" != typeof this.xhrType && (this.xhrType = this._determineXhrType());var t = this.xhr = new XDomainRequest();t.timeout = 5e3, t.onerror = this._boundXhrOnError, t.ontimeout = this._boundXdrOnTimeout, t.onprogress = this._boundOnProgress, t.onload = this._boundXhrOnLoad, t.open("GET", this.url, !0), setTimeout(function () {
	          t.send();
	        }, 0);
	      }, i.prototype._createSource = function (t, e, r) {
	        r || (r = t + "/" + e.substr(e.lastIndexOf(".") + 1));var i = document.createElement("source");return i.src = e, i.type = r, i;
	      }, i.prototype._onError = function (t) {
	        this.error = new Error("Failed to load element using " + t.target.nodeName), this.complete();
	      }, i.prototype._onProgress = function (t) {
	        t && t.lengthComputable && this.emit("progress", this, t.loaded / t.total);
	      }, i.prototype._xhrOnError = function () {
	        this.error = new Error(n(this.xhr) + " Request failed. Status: " + this.xhr.status + ', text: "' + this.xhr.statusText + '"'), this.complete();
	      }, i.prototype._xhrOnAbort = function () {
	        this.error = new Error(n(this.xhr) + " Request was aborted by the user."), this.complete();
	      }, i.prototype._xdrOnTimeout = function () {
	        this.error = new Error(n(this.xhr) + " Request timed out."), this.complete();
	      }, i.prototype._xhrOnLoad = function () {
	        var t = this.xhr,
	            e = void 0 !== t.status ? t.status : 200;if (200 === e || 204 === e || 0 === e && t.responseText.length > 0) {
	          if (this.xhrType === i.XHR_RESPONSE_TYPE.TEXT) this.data = t.responseText;else if (this.xhrType === i.XHR_RESPONSE_TYPE.JSON) try {
	            this.data = JSON.parse(t.responseText), this.isJson = !0;
	          } catch (r) {
	            this.error = new Error("Error trying to parse loaded json:", r);
	          } else if (this.xhrType === i.XHR_RESPONSE_TYPE.DOCUMENT) try {
	            if (window.DOMParser) {
	              var n = new DOMParser();this.data = n.parseFromString(t.responseText, "text/xml");
	            } else {
	              var o = document.createElement("div");o.innerHTML = t.responseText, this.data = o;
	            }this.isXml = !0;
	          } catch (r) {
	            this.error = new Error("Error trying to parse loaded xml:", r);
	          } else this.data = t.response || t.responseText;
	        } else this.error = new Error("[" + t.status + "]" + t.statusText + ":" + t.responseURL);this.complete();
	      }, i.prototype._determineCrossOrigin = function (t, e) {
	        if (0 === t.indexOf("data:")) return "";e = e || window.location, l || (l = document.createElement("a")), l.href = t, t = a.parse(l.href);var r = !t.port && "" === e.port || t.port === e.port;return t.hostname === e.hostname && r && t.protocol === e.protocol ? "" : "anonymous";
	      }, i.prototype._determineXhrType = function () {
	        return i._xhrTypeMap[this._getExtension()] || i.XHR_RESPONSE_TYPE.TEXT;
	      }, i.prototype._determineLoadType = function () {
	        return i._loadTypeMap[this._getExtension()] || i.LOAD_TYPE.XHR;
	      }, i.prototype._getExtension = function () {
	        var t,
	            e = this.url;if (this.isDataUrl) {
	          var r = e.indexOf("/");t = e.substring(r + 1, e.indexOf(";", r));
	        } else {
	          var i = e.indexOf("?");-1 !== i && (e = e.substring(0, i)), t = e.substring(e.lastIndexOf(".") + 1);
	        }return t;
	      }, i.prototype._getMimeFromXhrType = function (t) {
	        switch (t) {case i.XHR_RESPONSE_TYPE.BUFFER:
	            return "application/octet-binary";case i.XHR_RESPONSE_TYPE.BLOB:
	            return "application/blob";case i.XHR_RESPONSE_TYPE.DOCUMENT:
	            return "application/xml";case i.XHR_RESPONSE_TYPE.JSON:
	            return "application/json";case i.XHR_RESPONSE_TYPE.DEFAULT:case i.XHR_RESPONSE_TYPE.TEXT:default:
	            return "text/plain";}
	      }, i.LOAD_TYPE = { XHR: 1, IMAGE: 2, AUDIO: 3, VIDEO: 4 }, i.XHR_READY_STATE = { UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4 }, i.XHR_RESPONSE_TYPE = { DEFAULT: "text", BUFFER: "arraybuffer", BLOB: "blob", DOCUMENT: "document", JSON: "json", TEXT: "text" }, i._loadTypeMap = { gif: i.LOAD_TYPE.IMAGE, png: i.LOAD_TYPE.IMAGE, bmp: i.LOAD_TYPE.IMAGE, jpg: i.LOAD_TYPE.IMAGE, jpeg: i.LOAD_TYPE.IMAGE, tif: i.LOAD_TYPE.IMAGE, tiff: i.LOAD_TYPE.IMAGE, webp: i.LOAD_TYPE.IMAGE, tga: i.LOAD_TYPE.IMAGE }, i._xhrTypeMap = { xhtml: i.XHR_RESPONSE_TYPE.DOCUMENT, html: i.XHR_RESPONSE_TYPE.DOCUMENT, htm: i.XHR_RESPONSE_TYPE.DOCUMENT, xml: i.XHR_RESPONSE_TYPE.DOCUMENT, tmx: i.XHR_RESPONSE_TYPE.DOCUMENT, tsx: i.XHR_RESPONSE_TYPE.DOCUMENT, svg: i.XHR_RESPONSE_TYPE.DOCUMENT, gif: i.XHR_RESPONSE_TYPE.BLOB, png: i.XHR_RESPONSE_TYPE.BLOB, bmp: i.XHR_RESPONSE_TYPE.BLOB, jpg: i.XHR_RESPONSE_TYPE.BLOB, jpeg: i.XHR_RESPONSE_TYPE.BLOB, tif: i.XHR_RESPONSE_TYPE.BLOB, tiff: i.XHR_RESPONSE_TYPE.BLOB, webp: i.XHR_RESPONSE_TYPE.BLOB, tga: i.XHR_RESPONSE_TYPE.BLOB, json: i.XHR_RESPONSE_TYPE.JSON, text: i.XHR_RESPONSE_TYPE.TEXT, txt: i.XHR_RESPONSE_TYPE.TEXT }, i.setExtensionLoadType = function (t, e) {
	        o(i._loadTypeMap, t, e);
	      }, i.setExtensionXhrType = function (t, e) {
	        o(i._xhrTypeMap, t, e);
	      };
	    }, { eventemitter3: 14, url: 9 }], 17: [function (t, e, r) {
	      e.exports = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encodeBinary: function encodeBinary(t) {
	          for (var e, r = "", i = new Array(4), n = 0, o = 0, s = 0; n < t.length;) {
	            for (e = new Array(3), o = 0; o < e.length; o++) {
	              e[o] = n < t.length ? 255 & t.charCodeAt(n++) : 0;
	            }switch (i[0] = e[0] >> 2, i[1] = (3 & e[0]) << 4 | e[1] >> 4, i[2] = (15 & e[1]) << 2 | e[2] >> 6, i[3] = 63 & e[2], s = n - (t.length - 1)) {case 2:
	                i[3] = 64, i[2] = 64;break;case 1:
	                i[3] = 64;}for (o = 0; o < i.length; o++) {
	              r += this._keyStr.charAt(i[o]);
	            }
	          }return r;
	        } };
	    }, {}], 18: [function (t, e, r) {
	      e.exports = t("./Loader"), e.exports.Resource = t("./Resource"), e.exports.middleware = { caching: { memory: t("./middlewares/caching/memory") }, parsing: { blob: t("./middlewares/parsing/blob") } };
	    }, { "./Loader": 15, "./Resource": 16, "./middlewares/caching/memory": 19, "./middlewares/parsing/blob": 20 }], 19: [function (t, e, r) {
	      var i = {};e.exports = function () {
	        return function (t, e) {
	          i[t.url] ? (t.data = i[t.url], t.complete()) : (t.once("complete", function () {
	            i[this.url] = this.data;
	          }), e());
	        };
	      };
	    }, {}], 20: [function (t, e, r) {
	      var i = t("../../Resource"),
	          n = t("../../b64");window.URL = window.URL || window.webkitURL, e.exports = function () {
	        return function (t, e) {
	          if (!t.data) return e();if (t.xhr && t.xhrType === i.XHR_RESPONSE_TYPE.BLOB) {
	            if (window.Blob && "string" != typeof t.data) {
	              if (0 === t.data.type.indexOf("image")) {
	                var r = URL.createObjectURL(t.data);t.blob = t.data, t.data = new Image(), t.data.src = r, t.isImage = !0, t.data.onload = function () {
	                  URL.revokeObjectURL(r), t.data.onload = null, e();
	                };
	              }
	            } else {
	              var o = t.xhr.getResponseHeader("content-type");o && 0 === o.indexOf("image") && (t.data = new Image(), t.data.src = "data:" + o + ";base64," + n.encodeBinary(t.xhr.responseText), t.isImage = !0, t.data.onload = function () {
	                t.data.onload = null, e();
	              });
	            }
	          } else e();
	        };
	      };
	    }, { "../../Resource": 16, "../../b64": 17 }], 21: [function (t, e, r) {
	      e.exports = { name: "pixi.js", version: "3.0.7", description: "Pixi.js is a fast lightweight 2D library that works across all devices.", author: "Mat Groves", contributors: ["Chad Engler <chad@pantherdev.com>", "Richard Davey <rdavey@gmail.com>"], main: "./src/index.js", homepage: "http://goodboydigital.com/", bugs: "https://github.com/GoodBoyDigital/pixi.js/issues", license: "MIT", repository: { type: "git", url: "https://github.com/GoodBoyDigital/pixi.js.git" }, scripts: { start: "gulp && gulp watch", test: "gulp && testem ci", build: "gulp", docs: "jsdoc -c ./gulp/util/jsdoc.conf.json -R README.md" }, files: ["bin/", "src/"], dependencies: { async: "^0.9.0", brfs: "^1.4.0", earcut: "^2.0.1", eventemitter3: "^1.1.0", "object-assign": "^2.0.0", "resource-loader": "^1.6.1" }, devDependencies: { browserify: "^10.2.3", chai: "^3.0.0", del: "^1.2.0", gulp: "^3.9.0", "gulp-cached": "^1.1.0", "gulp-concat": "^2.5.2", "gulp-debug": "^2.0.1", "gulp-jshint": "^1.11.0", "gulp-mirror": "^0.4.0", "gulp-plumber": "^1.0.1", "gulp-rename": "^1.2.2", "gulp-sourcemaps": "^1.5.2", "gulp-uglify": "^1.2.0", "gulp-util": "^3.0.5", "jaguarjs-jsdoc": "git+https://github.com/davidshimjs/jaguarjs-jsdoc.git", jsdoc: "^3.3.0", "jshint-summary": "^0.4.0", minimist: "^1.1.1", mocha: "^2.2.5", "require-dir": "^0.3.0", "run-sequence": "^1.1.0", testem: "^0.8.3", "vinyl-buffer": "^1.0.0", "vinyl-source-stream": "^1.1.0", watchify: "^3.2.1" }, browserify: { transform: ["brfs"] } };
	    }, {}], 22: [function (t, e, r) {
	      var i = { VERSION: t("../../package.json").version, PI_2: 2 * Math.PI, RAD_TO_DEG: 180 / Math.PI, DEG_TO_RAD: Math.PI / 180, TARGET_FPMS: .06, RENDERER_TYPE: { UNKNOWN: 0, WEBGL: 1, CANVAS: 2 }, BLEND_MODES: { NORMAL: 0, ADD: 1, MULTIPLY: 2, SCREEN: 3, OVERLAY: 4, DARKEN: 5, LIGHTEN: 6, COLOR_DODGE: 7, COLOR_BURN: 8, HARD_LIGHT: 9, SOFT_LIGHT: 10, DIFFERENCE: 11, EXCLUSION: 12, HUE: 13, SATURATION: 14, COLOR: 15, LUMINOSITY: 16 }, DRAW_MODES: { POINTS: 0, LINES: 1, LINE_LOOP: 2, LINE_STRIP: 3, TRIANGLES: 4, TRIANGLE_STRIP: 5, TRIANGLE_FAN: 6 }, SCALE_MODES: { DEFAULT: 0, LINEAR: 0, NEAREST: 1 }, RETINA_PREFIX: /@(.+)x/, RESOLUTION: 1, FILTER_RESOLUTION: 1, DEFAULT_RENDER_OPTIONS: { view: null, resolution: 1, antialias: !1, forceFXAA: !1, autoResize: !1, transparent: !1, backgroundColor: 0, clearBeforeRender: !0, preserveDrawingBuffer: !1 }, SHAPES: { POLY: 0, RECT: 1, CIRC: 2, ELIP: 3, RREC: 4 }, SPRITE_BATCH_SIZE: 2e3 };e.exports = i;
	    }, { "../../package.json": 21 }], 23: [function (t, e, r) {
	      function i() {
	        o.call(this), this.children = [];
	      }var n = t("../math"),
	          o = t("./DisplayObject"),
	          s = t("../textures/RenderTexture"),
	          a = new n.Matrix();i.prototype = Object.create(o.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { width: { get: function get() {
	            return this.scale.x * this.getLocalBounds().width;
	          }, set: function set(t) {
	            var e = this.getLocalBounds().width;this.scale.x = 0 !== e ? t / e : 1, this._width = t;
	          } }, height: { get: function get() {
	            return this.scale.y * this.getLocalBounds().height;
	          }, set: function set(t) {
	            var e = this.getLocalBounds().height;this.scale.y = 0 !== e ? t / e : 1, this._height = t;
	          } } }), i.prototype.addChild = function (t) {
	        return this.addChildAt(t, this.children.length);
	      }, i.prototype.addChildAt = function (t, e) {
	        if (t === this) return t;if (e >= 0 && e <= this.children.length) return t.parent && t.parent.removeChild(t), t.parent = this, this.children.splice(e, 0, t), t.emit("added", this), t;throw new Error(t + "addChildAt: The index " + e + " supplied is out of bounds " + this.children.length);
	      }, i.prototype.swapChildren = function (t, e) {
	        if (t !== e) {
	          var r = this.getChildIndex(t),
	              i = this.getChildIndex(e);if (0 > r || 0 > i) throw new Error("swapChildren: Both the supplied DisplayObjects must be children of the caller.");this.children[r] = e, this.children[i] = t;
	        }
	      }, i.prototype.getChildIndex = function (t) {
	        var e = this.children.indexOf(t);if (-1 === e) throw new Error("The supplied DisplayObject must be a child of the caller");return e;
	      }, i.prototype.setChildIndex = function (t, e) {
	        if (0 > e || e >= this.children.length) throw new Error("The supplied index is out of bounds");var r = this.getChildIndex(t);this.children.splice(r, 1), this.children.splice(e, 0, t);
	      }, i.prototype.getChildAt = function (t) {
	        if (0 > t || t >= this.children.length) throw new Error("getChildAt: Supplied index " + t + " does not exist in the child list, or the supplied DisplayObject is not a child of the caller");return this.children[t];
	      }, i.prototype.removeChild = function (t) {
	        var e = this.children.indexOf(t);if (-1 !== e) return this.removeChildAt(e);
	      }, i.prototype.removeChildAt = function (t) {
	        var e = this.getChildAt(t);return e.parent = null, this.children.splice(t, 1), e.emit("removed", this), e;
	      }, i.prototype.removeChildren = function (t, e) {
	        var r = t || 0,
	            i = "number" == typeof e ? e : this.children.length,
	            n = i - r;if (n > 0 && i >= n) {
	          for (var o = this.children.splice(r, n), s = 0; s < o.length; ++s) {
	            o[s].parent = null;
	          }return o;
	        }if (0 === n && 0 === this.children.length) return [];throw new RangeError("removeChildren: numeric values are outside the acceptable range.");
	      }, i.prototype.generateTexture = function (t, e, r) {
	        var i = this.getLocalBounds(),
	            n = new s(t, 0 | i.width, 0 | i.height, r, e);return a.tx = -i.x, a.ty = -i.y, n.render(this, a), n;
	      }, i.prototype.updateTransform = function () {
	        if (this.visible) {
	          this.displayObjectUpdateTransform();for (var t = 0, e = this.children.length; e > t; ++t) {
	            this.children[t].updateTransform();
	          }
	        }
	      }, i.prototype.containerUpdateTransform = i.prototype.updateTransform, i.prototype.getBounds = function () {
	        if (!this._currentBounds) {
	          if (0 === this.children.length) return n.Rectangle.EMPTY;for (var t, e, r, i = 1 / 0, o = 1 / 0, s = -(1 / 0), a = -(1 / 0), h = !1, l = 0, u = this.children.length; u > l; ++l) {
	            var c = this.children[l];c.visible && (h = !0, t = this.children[l].getBounds(), i = i < t.x ? i : t.x, o = o < t.y ? o : t.y, e = t.width + t.x, r = t.height + t.y, s = s > e ? s : e, a = a > r ? a : r);
	          }if (!h) return n.Rectangle.EMPTY;var p = this._bounds;p.x = i, p.y = o, p.width = s - i, p.height = a - o, this._currentBounds = p;
	        }return this._currentBounds;
	      }, i.prototype.containerGetBounds = i.prototype.getBounds, i.prototype.getLocalBounds = function () {
	        var t = this.worldTransform;this.worldTransform = n.Matrix.IDENTITY;for (var e = 0, r = this.children.length; r > e; ++e) {
	          this.children[e].updateTransform();
	        }return this.worldTransform = t, this._currentBounds = null, this.getBounds(n.Matrix.IDENTITY);
	      }, i.prototype.renderWebGL = function (t) {
	        if (this.visible && !(this.worldAlpha <= 0) && this.renderable) {
	          var e, r;if (this._mask || this._filters) {
	            for (t.currentRenderer.flush(), this._filters && t.filterManager.pushFilter(this, this._filters), this._mask && t.maskManager.pushMask(this, this._mask), t.currentRenderer.start(), this._renderWebGL(t), e = 0, r = this.children.length; r > e; e++) {
	              this.children[e].renderWebGL(t);
	            }t.currentRenderer.flush(), this._mask && t.maskManager.popMask(this, this._mask), this._filters && t.filterManager.popFilter(), t.currentRenderer.start();
	          } else for (this._renderWebGL(t), e = 0, r = this.children.length; r > e; ++e) {
	            this.children[e].renderWebGL(t);
	          }
	        }
	      }, i.prototype._renderWebGL = function (t) {}, i.prototype._renderCanvas = function (t) {}, i.prototype.renderCanvas = function (t) {
	        if (this.visible && !(this.alpha <= 0) && this.renderable) {
	          this._mask && t.maskManager.pushMask(this._mask, t), this._renderCanvas(t);for (var e = 0, r = this.children.length; r > e; ++e) {
	            this.children[e].renderCanvas(t);
	          }this._mask && t.maskManager.popMask(t);
	        }
	      }, i.prototype.destroy = function (t) {
	        if (o.prototype.destroy.call(this), t) for (var e = 0, r = this.children.length; r > e; ++e) {
	          this.children[e].destroy(t);
	        }this.removeChildren(), this.children = null;
	      };
	    }, { "../math": 32, "../textures/RenderTexture": 70, "./DisplayObject": 24 }], 24: [function (t, e, r) {
	      function i() {
	        s.call(this), this.position = new n.Point(), this.scale = new n.Point(1, 1), this.pivot = new n.Point(0, 0), this.rotation = 0, this.alpha = 1, this.visible = !0, this.renderable = !0, this.parent = null, this.worldAlpha = 1, this.worldTransform = new n.Matrix(), this.filterArea = null, this._sr = 0, this._cr = 1, this._bounds = new n.Rectangle(0, 0, 1, 1), this._currentBounds = null, this._mask = null, this._cacheAsBitmap = !1, this._cachedObject = null;
	      }var n = t("../math"),
	          o = t("../textures/RenderTexture"),
	          s = t("eventemitter3"),
	          a = t("../const"),
	          h = new n.Matrix();i.prototype = Object.create(s.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { x: { get: function get() {
	            return this.position.x;
	          }, set: function set(t) {
	            this.position.x = t;
	          } }, y: { get: function get() {
	            return this.position.y;
	          }, set: function set(t) {
	            this.position.y = t;
	          } }, worldVisible: { get: function get() {
	            var t = this;do {
	              if (!t.visible) return !1;t = t.parent;
	            } while (t);return !0;
	          } }, mask: { get: function get() {
	            return this._mask;
	          }, set: function set(t) {
	            this._mask && (this._mask.renderable = !0), this._mask = t, this._mask && (this._mask.renderable = !1);
	          } }, filters: { get: function get() {
	            return this._filters && this._filters.slice();
	          }, set: function set(t) {
	            this._filters = t && t.slice();
	          } } }), i.prototype.updateTransform = function () {
	        var t,
	            e,
	            r,
	            i,
	            n,
	            o,
	            s = this.parent.worldTransform,
	            h = this.worldTransform;this.rotation % a.PI_2 ? (this.rotation !== this.rotationCache && (this.rotationCache = this.rotation, this._sr = Math.sin(this.rotation), this._cr = Math.cos(this.rotation)), t = this._cr * this.scale.x, e = this._sr * this.scale.x, r = -this._sr * this.scale.y, i = this._cr * this.scale.y, n = this.position.x, o = this.position.y, (this.pivot.x || this.pivot.y) && (n -= this.pivot.x * t + this.pivot.y * r, o -= this.pivot.x * e + this.pivot.y * i), h.a = t * s.a + e * s.c, h.b = t * s.b + e * s.d, h.c = r * s.a + i * s.c, h.d = r * s.b + i * s.d, h.tx = n * s.a + o * s.c + s.tx, h.ty = n * s.b + o * s.d + s.ty) : (t = this.scale.x, i = this.scale.y, n = this.position.x - this.pivot.x * t, o = this.position.y - this.pivot.y * i, h.a = t * s.a, h.b = t * s.b, h.c = i * s.c, h.d = i * s.d, h.tx = n * s.a + o * s.c + s.tx, h.ty = n * s.b + o * s.d + s.ty), this.worldAlpha = this.alpha * this.parent.worldAlpha, this._currentBounds = null;
	      }, i.prototype.displayObjectUpdateTransform = i.prototype.updateTransform, i.prototype.getBounds = function (t) {
	        return n.Rectangle.EMPTY;
	      }, i.prototype.getLocalBounds = function () {
	        return this.getBounds(n.Matrix.IDENTITY);
	      }, i.prototype.toGlobal = function (t) {
	        return this.displayObjectUpdateTransform(), this.worldTransform.apply(t);
	      }, i.prototype.toLocal = function (t, e) {
	        return e && (t = e.toGlobal(t)), this.displayObjectUpdateTransform(), this.worldTransform.applyInverse(t);
	      }, i.prototype.renderWebGL = function (t) {}, i.prototype.renderCanvas = function (t) {}, i.prototype.generateTexture = function (t, e, r) {
	        var i = this.getLocalBounds(),
	            n = new o(t, 0 | i.width, 0 | i.height, e, r);return h.tx = -i.x, h.ty = -i.y, n.render(this, h), n;
	      }, i.prototype.destroy = function () {
	        this.position = null, this.scale = null, this.pivot = null, this.parent = null, this._bounds = null, this._currentBounds = null, this._mask = null, this.worldTransform = null, this.filterArea = null;
	      };
	    }, { "../const": 22, "../math": 32, "../textures/RenderTexture": 70, eventemitter3: 11 }], 25: [function (t, e, r) {
	      function i() {
	        n.call(this), this.fillAlpha = 1, this.lineWidth = 0, this.lineColor = 0, this.graphicsData = [], this.tint = 16777215, this._prevTint = 16777215, this.blendMode = u.BLEND_MODES.NORMAL, this.currentPath = null, this._webGL = {}, this.isMask = !1, this.boundsPadding = 0, this._localBounds = new l.Rectangle(0, 0, 1, 1), this.dirty = !0, this.glDirty = !1, this.boundsDirty = !0, this.cachedSpriteDirty = !1;
	      }var n = t("../display/Container"),
	          o = t("../textures/Texture"),
	          s = t("../renderers/canvas/utils/CanvasBuffer"),
	          a = t("../renderers/canvas/utils/CanvasGraphics"),
	          h = t("./GraphicsData"),
	          l = t("../math"),
	          u = t("../const"),
	          c = new l.Point();i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, {}), i.prototype.clone = function () {
	        var t = new i();t.renderable = this.renderable, t.fillAlpha = this.fillAlpha, t.lineWidth = this.lineWidth, t.lineColor = this.lineColor, t.tint = this.tint, t.blendMode = this.blendMode, t.isMask = this.isMask, t.boundsPadding = this.boundsPadding, t.dirty = this.dirty, t.glDirty = this.glDirty, t.cachedSpriteDirty = this.cachedSpriteDirty;for (var e = 0; e < this.graphicsData.length; ++e) {
	          t.graphicsData.push(this.graphicsData[e].clone());
	        }return t.currentPath = t.graphicsData[t.graphicsData.length - 1], t.updateLocalBounds(), t;
	      }, i.prototype.lineStyle = function (t, e, r) {
	        return this.lineWidth = t || 0, this.lineColor = e || 0, this.lineAlpha = void 0 === r ? 1 : r, this.currentPath && (this.currentPath.shape.points.length ? this.drawShape(new l.Polygon(this.currentPath.shape.points.slice(-2))) : (this.currentPath.lineWidth = this.lineWidth, this.currentPath.lineColor = this.lineColor, this.currentPath.lineAlpha = this.lineAlpha)), this;
	      }, i.prototype.moveTo = function (t, e) {
	        return this.drawShape(new l.Polygon([t, e])), this;
	      }, i.prototype.lineTo = function (t, e) {
	        return this.currentPath.shape.points.push(t, e), this.dirty = !0, this;
	      }, i.prototype.quadraticCurveTo = function (t, e, r, i) {
	        this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [0, 0]) : this.moveTo(0, 0);var n,
	            o,
	            s = 20,
	            a = this.currentPath.shape.points;0 === a.length && this.moveTo(0, 0);for (var h = a[a.length - 2], l = a[a.length - 1], u = 0, c = 1; s >= c; ++c) {
	          u = c / s, n = h + (t - h) * u, o = l + (e - l) * u, a.push(n + (t + (r - t) * u - n) * u, o + (e + (i - e) * u - o) * u);
	        }return this.dirty = this.boundsDirty = !0, this;
	      }, i.prototype.bezierCurveTo = function (t, e, r, i, n, o) {
	        this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [0, 0]) : this.moveTo(0, 0);for (var s, a, h, l, u, c = 20, p = this.currentPath.shape.points, d = p[p.length - 2], f = p[p.length - 1], v = 0, g = 1; c >= g; ++g) {
	          v = g / c, s = 1 - v, a = s * s, h = a * s, l = v * v, u = l * v, p.push(h * d + 3 * a * v * t + 3 * s * l * r + u * n, h * f + 3 * a * v * e + 3 * s * l * i + u * o);
	        }return this.dirty = this.boundsDirty = !0, this;
	      }, i.prototype.arcTo = function (t, e, r, i, n) {
	        this.currentPath ? 0 === this.currentPath.shape.points.length && this.currentPath.shape.points.push(t, e) : this.moveTo(t, e);var o = this.currentPath.shape.points,
	            s = o[o.length - 2],
	            a = o[o.length - 1],
	            h = a - e,
	            l = s - t,
	            u = i - e,
	            c = r - t,
	            p = Math.abs(h * c - l * u);if (1e-8 > p || 0 === n) (o[o.length - 2] !== t || o[o.length - 1] !== e) && o.push(t, e);else {
	          var d = h * h + l * l,
	              f = u * u + c * c,
	              v = h * u + l * c,
	              g = n * Math.sqrt(d) / p,
	              m = n * Math.sqrt(f) / p,
	              y = g * v / d,
	              x = m * v / f,
	              b = g * c + m * l,
	              _ = g * u + m * h,
	              T = l * (m + y),
	              E = h * (m + y),
	              S = c * (g + x),
	              A = u * (g + x),
	              w = Math.atan2(E - _, T - b),
	              C = Math.atan2(A - _, S - b);this.arc(b + t, _ + e, n, w, C, l * u > c * h);
	        }return this.dirty = this.boundsDirty = !0, this;
	      }, i.prototype.arc = function (t, e, r, i, n, o) {
	        if (o = o || !1, i === n) return this;!o && i >= n ? n += 2 * Math.PI : o && n >= i && (i += 2 * Math.PI);var s = o ? -1 * (i - n) : n - i,
	            a = 40 * Math.ceil(Math.abs(s) / (2 * Math.PI));if (0 === s) return this;var h = t + Math.cos(i) * r,
	            l = e + Math.sin(i) * r;this.currentPath ? o && this.filling ? this.currentPath.shape.points.push(t, e) : this.currentPath.shape.points.push(h, l) : o && this.filling ? this.moveTo(t, e) : this.moveTo(h, l);for (var u = this.currentPath.shape.points, c = s / (2 * a), p = 2 * c, d = Math.cos(c), f = Math.sin(c), v = a - 1, g = v % 1 / v, m = 0; v >= m; m++) {
	          var y = m + g * m,
	              x = c + i + p * y,
	              b = Math.cos(x),
	              _ = -Math.sin(x);u.push((d * b + f * _) * r + t, (d * -_ + f * b) * r + e);
	        }return this.dirty = this.boundsDirty = !0, this;
	      }, i.prototype.beginFill = function (t, e) {
	        return this.filling = !0, this.fillColor = t || 0, this.fillAlpha = void 0 === e ? 1 : e, this.currentPath && this.currentPath.shape.points.length <= 2 && (this.currentPath.fill = this.filling, this.currentPath.fillColor = this.fillColor, this.currentPath.fillAlpha = this.fillAlpha), this;
	      }, i.prototype.endFill = function () {
	        return this.filling = !1, this.fillColor = null, this.fillAlpha = 1, this;
	      }, i.prototype.drawRect = function (t, e, r, i) {
	        return this.drawShape(new l.Rectangle(t, e, r, i)), this;
	      }, i.prototype.drawRoundedRect = function (t, e, r, i, n) {
	        return this.drawShape(new l.RoundedRectangle(t, e, r, i, n)), this;
	      }, i.prototype.drawCircle = function (t, e, r) {
	        return this.drawShape(new l.Circle(t, e, r)), this;
	      }, i.prototype.drawEllipse = function (t, e, r, i) {
	        return this.drawShape(new l.Ellipse(t, e, r, i)), this;
	      }, i.prototype.drawPolygon = function (t) {
	        var e = t;if (!Array.isArray(e)) {
	          e = new Array(arguments.length);for (var r = 0; r < e.length; ++r) {
	            e[r] = arguments[r];
	          }
	        }return this.drawShape(new l.Polygon(e)), this;
	      }, i.prototype.clear = function () {
	        return this.lineWidth = 0, this.filling = !1, this.dirty = !0, this.clearDirty = !0, this.graphicsData = [], this;
	      }, i.prototype.generateTexture = function (t, e, r) {
	        e = e || 1;var i = this.getLocalBounds(),
	            n = new s(i.width * e, i.height * e),
	            h = o.fromCanvas(n.canvas, r);return h.baseTexture.resolution = e, n.context.scale(e, e), n.context.translate(-i.x, -i.y), a.renderGraphics(this, n.context), h;
	      }, i.prototype._renderWebGL = function (t) {
	        this.glDirty && (this.dirty = !0, this.glDirty = !1), t.setObjectRenderer(t.plugins.graphics), t.plugins.graphics.render(this);
	      }, i.prototype._renderCanvas = function (t) {
	        if (this.isMask !== !0) {
	          this._prevTint !== this.tint && (this.dirty = !0, this._prevTint = this.tint);var e = t.context,
	              r = this.worldTransform;this.blendMode !== t.currentBlendMode && (t.currentBlendMode = this.blendMode, e.globalCompositeOperation = t.blendModes[t.currentBlendMode]);var i = t.resolution;e.setTransform(r.a * i, r.b * i, r.c * i, r.d * i, r.tx * i, r.ty * i), a.renderGraphics(this, e);
	        }
	      }, i.prototype.getBounds = function (t) {
	        if (!this._currentBounds) {
	          if (!this.renderable) return l.Rectangle.EMPTY;this.boundsDirty && (this.updateLocalBounds(), this.glDirty = !0, this.cachedSpriteDirty = !0, this.boundsDirty = !1);var e = this._localBounds,
	              r = e.x,
	              i = e.width + e.x,
	              n = e.y,
	              o = e.height + e.y,
	              s = t || this.worldTransform,
	              a = s.a,
	              h = s.b,
	              u = s.c,
	              c = s.d,
	              p = s.tx,
	              d = s.ty,
	              f = a * i + u * o + p,
	              v = c * o + h * i + d,
	              g = a * r + u * o + p,
	              m = c * o + h * r + d,
	              y = a * r + u * n + p,
	              x = c * n + h * r + d,
	              b = a * i + u * n + p,
	              _ = c * n + h * i + d,
	              T = f,
	              E = v,
	              S = f,
	              A = v;S = S > g ? g : S, S = S > y ? y : S, S = S > b ? b : S, A = A > m ? m : A, A = A > x ? x : A, A = A > _ ? _ : A, T = g > T ? g : T, T = y > T ? y : T, T = b > T ? b : T, E = m > E ? m : E, E = x > E ? x : E, E = _ > E ? _ : E, this._bounds.x = S, this._bounds.width = T - S, this._bounds.y = A, this._bounds.height = E - A, this._currentBounds = this._bounds;
	        }return this._currentBounds;
	      }, i.prototype.containsPoint = function (t) {
	        this.worldTransform.applyInverse(t, c);for (var e = this.graphicsData, r = 0; r < e.length; r++) {
	          var i = e[r];if (i.fill && i.shape && i.shape.contains(c.x, c.y)) return !0;
	        }return !1;
	      }, i.prototype.updateLocalBounds = function () {
	        var t = 1 / 0,
	            e = -(1 / 0),
	            r = 1 / 0,
	            i = -(1 / 0);if (this.graphicsData.length) for (var n, o, s, a, h, l, c = 0; c < this.graphicsData.length; c++) {
	          var p = this.graphicsData[c],
	              d = p.type,
	              f = p.lineWidth;if (n = p.shape, d === u.SHAPES.RECT || d === u.SHAPES.RREC) s = n.x - f / 2, a = n.y - f / 2, h = n.width + f, l = n.height + f, t = t > s ? s : t, e = s + h > e ? s + h : e, r = r > a ? a : r, i = a + l > i ? a + l : i;else if (d === u.SHAPES.CIRC) s = n.x, a = n.y, h = n.radius + f / 2, l = n.radius + f / 2, t = t > s - h ? s - h : t, e = s + h > e ? s + h : e, r = r > a - l ? a - l : r, i = a + l > i ? a + l : i;else if (d === u.SHAPES.ELIP) s = n.x, a = n.y, h = n.width + f / 2, l = n.height + f / 2, t = t > s - h ? s - h : t, e = s + h > e ? s + h : e, r = r > a - l ? a - l : r, i = a + l > i ? a + l : i;else {
	            o = n.points;for (var v = 0; v < o.length; v += 2) {
	              s = o[v], a = o[v + 1], t = t > s - f ? s - f : t, e = s + f > e ? s + f : e, r = r > a - f ? a - f : r, i = a + f > i ? a + f : i;
	            }
	          }
	        } else t = 0, e = 0, r = 0, i = 0;var g = this.boundsPadding;this._localBounds.x = t - g, this._localBounds.width = e - t + 2 * g, this._localBounds.y = r - g, this._localBounds.height = i - r + 2 * g;
	      }, i.prototype.drawShape = function (t) {
	        this.currentPath && this.currentPath.shape.points.length <= 2 && this.graphicsData.pop(), this.currentPath = null;var e = new h(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, t);return this.graphicsData.push(e), e.type === u.SHAPES.POLY && (e.shape.closed = e.shape.closed || this.filling, this.currentPath = e), this.dirty = this.boundsDirty = !0, e;
	      }, i.prototype.destroy = function () {
	        n.prototype.destroy.apply(this, arguments);for (var t = 0; t < this.graphicsData.length; ++t) {
	          this.graphicsData[t].destroy();
	        }for (var e in this._webgl) {
	          for (var r = 0; r < this._webgl[e].data.length; ++r) {
	            this._webgl[e].data[r].destroy();
	          }
	        }this.graphicsData = null, this.currentPath = null, this._webgl = null, this._localBounds = null;
	      };
	    }, { "../const": 22, "../display/Container": 23, "../math": 32, "../renderers/canvas/utils/CanvasBuffer": 44, "../renderers/canvas/utils/CanvasGraphics": 45, "../textures/Texture": 71, "./GraphicsData": 26 }], 26: [function (t, e, r) {
	      function i(t, e, r, i, n, o, s) {
	        this.lineWidth = t, this.lineColor = e, this.lineAlpha = r, this._lineTint = e, this.fillColor = i, this.fillAlpha = n, this._fillTint = i, this.fill = o, this.shape = s, this.type = s.type;
	      }i.prototype.constructor = i, e.exports = i, i.prototype.clone = function () {
	        return new i(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.fill, this.shape);
	      }, i.prototype.destroy = function () {
	        this.shape = null;
	      };
	    }, {}], 27: [function (t, e, r) {
	      function i(t) {
	        a.call(this, t), this.graphicsDataPool = [], this.primitiveShader = null, this.complexPrimitiveShader = null, this.maximumSimplePolySize = 200;
	      }var n = t("../../utils"),
	          o = t("../../math"),
	          s = t("../../const"),
	          a = t("../../renderers/webgl/utils/ObjectRenderer"),
	          h = t("../../renderers/webgl/WebGLRenderer"),
	          l = t("./WebGLGraphicsData"),
	          u = t("earcut");i.prototype = Object.create(a.prototype), i.prototype.constructor = i, e.exports = i, h.registerPlugin("graphics", i), i.prototype.onContextChange = function () {}, i.prototype.destroy = function () {
	        a.prototype.destroy.call(this);for (var t = 0; t < this.graphicsDataPool.length; ++t) {
	          this.graphicsDataPool[t].destroy();
	        }this.graphicsDataPool = null;
	      }, i.prototype.render = function (t) {
	        var e,
	            r = this.renderer,
	            i = r.gl,
	            o = r.shaderManager.plugins.primitiveShader;t.dirty && this.updateGraphics(t, i);var s = t._webGL[i.id];r.blendModeManager.setBlendMode(t.blendMode);for (var a = 0; a < s.data.length; a++) {
	          1 === s.data[a].mode ? (e = s.data[a], r.stencilManager.pushStencil(t, e, r), i.uniform1f(r.shaderManager.complexPrimitiveShader.uniforms.alpha._location, t.worldAlpha * e.alpha), i.drawElements(i.TRIANGLE_FAN, 4, i.UNSIGNED_SHORT, 2 * (e.indices.length - 4)), r.stencilManager.popStencil(t, e, r)) : (e = s.data[a], o = r.shaderManager.primitiveShader, r.shaderManager.setShader(o), i.uniformMatrix3fv(o.uniforms.translationMatrix._location, !1, t.worldTransform.toArray(!0)), i.uniformMatrix3fv(o.uniforms.projectionMatrix._location, !1, r.currentRenderTarget.projectionMatrix.toArray(!0)), i.uniform3fv(o.uniforms.tint._location, n.hex2rgb(t.tint)), i.uniform1f(o.uniforms.alpha._location, t.worldAlpha), i.bindBuffer(i.ARRAY_BUFFER, e.buffer), i.vertexAttribPointer(o.attributes.aVertexPosition, 2, i.FLOAT, !1, 24, 0), i.vertexAttribPointer(o.attributes.aColor, 4, i.FLOAT, !1, 24, 8), i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.indexBuffer), i.drawElements(i.TRIANGLE_STRIP, e.indices.length, i.UNSIGNED_SHORT, 0));
	        }
	      }, i.prototype.updateGraphics = function (t) {
	        var e = this.renderer.gl,
	            r = t._webGL[e.id];r || (r = t._webGL[e.id] = { lastIndex: 0, data: [], gl: e }), t.dirty = !1;var i;if (t.clearDirty) {
	          for (t.clearDirty = !1, i = 0; i < r.data.length; i++) {
	            var n = r.data[i];n.reset(), this.graphicsDataPool.push(n);
	          }r.data = [], r.lastIndex = 0;
	        }var o;for (i = r.lastIndex; i < t.graphicsData.length; i++) {
	          var a = t.graphicsData[i];if (a.type === s.SHAPES.POLY) {
	            if (a.points = a.shape.points.slice(), a.shape.closed && (a.points[0] !== a.points[a.points.length - 2] || a.points[1] !== a.points[a.points.length - 1]) && a.points.push(a.points[0], a.points[1]), a.fill && a.points.length >= 6) if (a.points.length < 2 * this.maximumSimplePolySize) {
	              o = this.switchMode(r, 0);var h = this.buildPoly(a, o);h || (o = this.switchMode(r, 1), this.buildComplexPoly(a, o));
	            } else o = this.switchMode(r, 1), this.buildComplexPoly(a, o);a.lineWidth > 0 && (o = this.switchMode(r, 0), this.buildLine(a, o));
	          } else o = this.switchMode(r, 0), a.type === s.SHAPES.RECT ? this.buildRectangle(a, o) : a.type === s.SHAPES.CIRC || a.type === s.SHAPES.ELIP ? this.buildCircle(a, o) : a.type === s.SHAPES.RREC && this.buildRoundedRectangle(a, o);r.lastIndex++;
	        }for (i = 0; i < r.data.length; i++) {
	          o = r.data[i], o.dirty && o.upload();
	        }
	      }, i.prototype.switchMode = function (t, e) {
	        var r;return t.data.length ? (r = t.data[t.data.length - 1], (r.points.length > 32e4 || r.mode !== e || 1 === e) && (r = this.graphicsDataPool.pop() || new l(t.gl), r.mode = e, t.data.push(r))) : (r = this.graphicsDataPool.pop() || new l(t.gl), r.mode = e, t.data.push(r)), r.dirty = !0, r;
	      }, i.prototype.buildRectangle = function (t, e) {
	        var r = t.shape,
	            i = r.x,
	            o = r.y,
	            s = r.width,
	            a = r.height;if (t.fill) {
	          var h = n.hex2rgb(t.fillColor),
	              l = t.fillAlpha,
	              u = h[0] * l,
	              c = h[1] * l,
	              p = h[2] * l,
	              d = e.points,
	              f = e.indices,
	              v = d.length / 6;d.push(i, o), d.push(u, c, p, l), d.push(i + s, o), d.push(u, c, p, l), d.push(i, o + a), d.push(u, c, p, l), d.push(i + s, o + a), d.push(u, c, p, l), f.push(v, v, v + 1, v + 2, v + 3, v + 3);
	        }if (t.lineWidth) {
	          var g = t.points;t.points = [i, o, i + s, o, i + s, o + a, i, o + a, i, o], this.buildLine(t, e), t.points = g;
	        }
	      }, i.prototype.buildRoundedRectangle = function (t, e) {
	        var r = t.shape,
	            i = r.x,
	            o = r.y,
	            s = r.width,
	            a = r.height,
	            h = r.radius,
	            l = [];if (l.push(i, o + h), this.quadraticBezierCurve(i, o + a - h, i, o + a, i + h, o + a, l), this.quadraticBezierCurve(i + s - h, o + a, i + s, o + a, i + s, o + a - h, l), this.quadraticBezierCurve(i + s, o + h, i + s, o, i + s - h, o, l), this.quadraticBezierCurve(i + h, o, i, o, i, o + h + 1e-10, l), t.fill) {
	          var c = n.hex2rgb(t.fillColor),
	              p = t.fillAlpha,
	              d = c[0] * p,
	              f = c[1] * p,
	              v = c[2] * p,
	              g = e.points,
	              m = e.indices,
	              y = g.length / 6,
	              x = u(l, null, 2),
	              b = 0;for (b = 0; b < x.length; b += 3) {
	            m.push(x[b] + y), m.push(x[b] + y), m.push(x[b + 1] + y), m.push(x[b + 2] + y), m.push(x[b + 2] + y);
	          }for (b = 0; b < l.length; b++) {
	            g.push(l[b], l[++b], d, f, v, p);
	          }
	        }if (t.lineWidth) {
	          var _ = t.points;t.points = l, this.buildLine(t, e), t.points = _;
	        }
	      }, i.prototype.quadraticBezierCurve = function (t, e, r, i, n, o, s) {
	        function a(t, e, r) {
	          var i = e - t;return t + i * r;
	        }for (var h, l, u, c, p, d, f = 20, v = s || [], g = 0, m = 0; f >= m; m++) {
	          g = m / f, h = a(t, r, g), l = a(e, i, g), u = a(r, n, g), c = a(i, o, g), p = a(h, u, g), d = a(l, c, g), v.push(p, d);
	        }return v;
	      }, i.prototype.buildCircle = function (t, e) {
	        var r,
	            i,
	            o = t.shape,
	            a = o.x,
	            h = o.y;t.type === s.SHAPES.CIRC ? (r = o.radius, i = o.radius) : (r = o.width, i = o.height);var l = 40,
	            u = 2 * Math.PI / l,
	            c = 0;if (t.fill) {
	          var p = n.hex2rgb(t.fillColor),
	              d = t.fillAlpha,
	              f = p[0] * d,
	              v = p[1] * d,
	              g = p[2] * d,
	              m = e.points,
	              y = e.indices,
	              x = m.length / 6;for (y.push(x), c = 0; l + 1 > c; c++) {
	            m.push(a, h, f, v, g, d), m.push(a + Math.sin(u * c) * r, h + Math.cos(u * c) * i, f, v, g, d), y.push(x++, x++);
	          }y.push(x - 1);
	        }if (t.lineWidth) {
	          var b = t.points;for (t.points = [], c = 0; l + 1 > c; c++) {
	            t.points.push(a + Math.sin(u * c) * r, h + Math.cos(u * c) * i);
	          }this.buildLine(t, e), t.points = b;
	        }
	      }, i.prototype.buildLine = function (t, e) {
	        var r = 0,
	            i = t.points;if (0 !== i.length) {
	          if (t.lineWidth % 2) for (r = 0; r < i.length; r++) {
	            i[r] += .5;
	          }var s = new o.Point(i[0], i[1]),
	              a = new o.Point(i[i.length - 2], i[i.length - 1]);if (s.x === a.x && s.y === a.y) {
	            i = i.slice(), i.pop(), i.pop(), a = new o.Point(i[i.length - 2], i[i.length - 1]);var h = a.x + .5 * (s.x - a.x),
	                l = a.y + .5 * (s.y - a.y);i.unshift(h, l), i.push(h, l);
	          }var u,
	              c,
	              p,
	              d,
	              f,
	              v,
	              g,
	              m,
	              y,
	              x,
	              b,
	              _,
	              T,
	              E,
	              S,
	              A,
	              w,
	              C,
	              M,
	              R,
	              D,
	              F,
	              P,
	              O = e.points,
	              B = e.indices,
	              L = i.length / 2,
	              I = i.length,
	              N = O.length / 6,
	              U = t.lineWidth / 2,
	              k = n.hex2rgb(t.lineColor),
	              j = t.lineAlpha,
	              X = k[0] * j,
	              G = k[1] * j,
	              Y = k[2] * j;for (p = i[0], d = i[1], f = i[2], v = i[3], y = -(d - v), x = p - f, P = Math.sqrt(y * y + x * x), y /= P, x /= P, y *= U, x *= U, O.push(p - y, d - x, X, G, Y, j), O.push(p + y, d + x, X, G, Y, j), r = 1; L - 1 > r; r++) {
	            p = i[2 * (r - 1)], d = i[2 * (r - 1) + 1], f = i[2 * r], v = i[2 * r + 1], g = i[2 * (r + 1)], m = i[2 * (r + 1) + 1], y = -(d - v), x = p - f, P = Math.sqrt(y * y + x * x), y /= P, x /= P, y *= U, x *= U, b = -(v - m), _ = f - g, P = Math.sqrt(b * b + _ * _), b /= P, _ /= P, b *= U, _ *= U, S = -x + d - (-x + v), A = -y + f - (-y + p), w = (-y + p) * (-x + v) - (-y + f) * (-x + d), C = -_ + m - (-_ + v), M = -b + f - (-b + g), R = (-b + g) * (-_ + v) - (-b + f) * (-_ + m), D = S * M - C * A, Math.abs(D) < .1 ? (D += 10.1, O.push(f - y, v - x, X, G, Y, j), O.push(f + y, v + x, X, G, Y, j)) : (u = (A * R - M * w) / D, c = (C * w - S * R) / D, F = (u - f) * (u - f) + (c - v) + (c - v), F > 19600 ? (T = y - b, E = x - _, P = Math.sqrt(T * T + E * E), T /= P, E /= P, T *= U, E *= U, O.push(f - T, v - E), O.push(X, G, Y, j), O.push(f + T, v + E), O.push(X, G, Y, j), O.push(f - T, v - E), O.push(X, G, Y, j), I++) : (O.push(u, c), O.push(X, G, Y, j), O.push(f - (u - f), v - (c - v)), O.push(X, G, Y, j)));
	          }for (p = i[2 * (L - 2)], d = i[2 * (L - 2) + 1], f = i[2 * (L - 1)], v = i[2 * (L - 1) + 1], y = -(d - v), x = p - f, P = Math.sqrt(y * y + x * x), y /= P, x /= P, y *= U, x *= U, O.push(f - y, v - x), O.push(X, G, Y, j), O.push(f + y, v + x), O.push(X, G, Y, j), B.push(N), r = 0; I > r; r++) {
	            B.push(N++);
	          }B.push(N - 1);
	        }
	      }, i.prototype.buildComplexPoly = function (t, e) {
	        var r = t.points.slice();if (!(r.length < 6)) {
	          var i = e.indices;e.points = r, e.alpha = t.fillAlpha, e.color = n.hex2rgb(t.fillColor);for (var o, s, a = 1 / 0, h = -(1 / 0), l = 1 / 0, u = -(1 / 0), c = 0; c < r.length; c += 2) {
	            o = r[c], s = r[c + 1], a = a > o ? o : a, h = o > h ? o : h, l = l > s ? s : l, u = s > u ? s : u;
	          }r.push(a, l, h, l, h, u, a, u);var p = r.length / 2;for (c = 0; p > c; c++) {
	            i.push(c);
	          }
	        }
	      }, i.prototype.buildPoly = function (t, e) {
	        var r = t.points;if (!(r.length < 6)) {
	          var i = e.points,
	              o = e.indices,
	              s = r.length / 2,
	              a = n.hex2rgb(t.fillColor),
	              h = t.fillAlpha,
	              l = a[0] * h,
	              c = a[1] * h,
	              p = a[2] * h,
	              d = u(r, null, 2);if (!d) return !1;var f = i.length / 6,
	              v = 0;for (v = 0; v < d.length; v += 3) {
	            o.push(d[v] + f), o.push(d[v] + f), o.push(d[v + 1] + f), o.push(d[v + 2] + f), o.push(d[v + 2] + f);
	          }for (v = 0; s > v; v++) {
	            i.push(r[2 * v], r[2 * v + 1], l, c, p, h);
	          }return !0;
	        }
	      };
	    }, { "../../const": 22, "../../math": 32, "../../renderers/webgl/WebGLRenderer": 48, "../../renderers/webgl/utils/ObjectRenderer": 62, "../../utils": 76, "./WebGLGraphicsData": 28, earcut: 10 }], 28: [function (t, e, r) {
	      function i(t) {
	        this.gl = t, this.color = [0, 0, 0], this.points = [], this.indices = [], this.buffer = t.createBuffer(), this.indexBuffer = t.createBuffer(), this.mode = 1, this.alpha = 1, this.dirty = !0, this.glPoints = null, this.glIndices = null;
	      }i.prototype.constructor = i, e.exports = i, i.prototype.reset = function () {
	        this.points.length = 0, this.indices.length = 0;
	      }, i.prototype.upload = function () {
	        var t = this.gl;this.glPoints = new Float32Array(this.points), t.bindBuffer(t.ARRAY_BUFFER, this.buffer), t.bufferData(t.ARRAY_BUFFER, this.glPoints, t.STATIC_DRAW), this.glIndices = new Uint16Array(this.indices), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, this.glIndices, t.STATIC_DRAW), this.dirty = !1;
	      }, i.prototype.destroy = function () {
	        this.color = null, this.points = null, this.indices = null, this.gl.deleteBuffer(this.buffer), this.gl.deleteBuffer(this.indexBuffer), this.gl = null, this.buffer = null, this.indexBuffer = null, this.glPoints = null, this.glIndices = null;
	      };
	    }, {}], 29: [function (t, e, r) {
	      var i = e.exports = Object.assign(t("./const"), t("./math"), { utils: t("./utils"), ticker: t("./ticker"), DisplayObject: t("./display/DisplayObject"), Container: t("./display/Container"), Sprite: t("./sprites/Sprite"), ParticleContainer: t("./particles/ParticleContainer"), SpriteRenderer: t("./sprites/webgl/SpriteRenderer"), ParticleRenderer: t("./particles/webgl/ParticleRenderer"), Text: t("./text/Text"), Graphics: t("./graphics/Graphics"), GraphicsData: t("./graphics/GraphicsData"), GraphicsRenderer: t("./graphics/webgl/GraphicsRenderer"), Texture: t("./textures/Texture"), BaseTexture: t("./textures/BaseTexture"), RenderTexture: t("./textures/RenderTexture"), VideoBaseTexture: t("./textures/VideoBaseTexture"), TextureUvs: t("./textures/TextureUvs"), CanvasRenderer: t("./renderers/canvas/CanvasRenderer"), CanvasGraphics: t("./renderers/canvas/utils/CanvasGraphics"), CanvasBuffer: t("./renderers/canvas/utils/CanvasBuffer"), WebGLRenderer: t("./renderers/webgl/WebGLRenderer"), ShaderManager: t("./renderers/webgl/managers/ShaderManager"), Shader: t("./renderers/webgl/shaders/Shader"), ObjectRenderer: t("./renderers/webgl/utils/ObjectRenderer"), RenderTarget: t("./renderers/webgl/utils/RenderTarget"), AbstractFilter: t("./renderers/webgl/filters/AbstractFilter"), FXAAFilter: t("./renderers/webgl/filters/FXAAFilter"), SpriteMaskFilter: t("./renderers/webgl/filters/SpriteMaskFilter"), autoDetectRenderer: function autoDetectRenderer(t, e, r, n) {
	          return t = t || 800, e = e || 600, !n && i.utils.isWebGLSupported() ? new i.WebGLRenderer(t, e, r) : new i.CanvasRenderer(t, e, r);
	        } });
	    }, { "./const": 22, "./display/Container": 23, "./display/DisplayObject": 24, "./graphics/Graphics": 25, "./graphics/GraphicsData": 26, "./graphics/webgl/GraphicsRenderer": 27, "./math": 32, "./particles/ParticleContainer": 38, "./particles/webgl/ParticleRenderer": 40, "./renderers/canvas/CanvasRenderer": 43, "./renderers/canvas/utils/CanvasBuffer": 44, "./renderers/canvas/utils/CanvasGraphics": 45, "./renderers/webgl/WebGLRenderer": 48, "./renderers/webgl/filters/AbstractFilter": 49, "./renderers/webgl/filters/FXAAFilter": 50, "./renderers/webgl/filters/SpriteMaskFilter": 51, "./renderers/webgl/managers/ShaderManager": 55, "./renderers/webgl/shaders/Shader": 60, "./renderers/webgl/utils/ObjectRenderer": 62, "./renderers/webgl/utils/RenderTarget": 64, "./sprites/Sprite": 66, "./sprites/webgl/SpriteRenderer": 67, "./text/Text": 68, "./textures/BaseTexture": 69, "./textures/RenderTexture": 70, "./textures/Texture": 71, "./textures/TextureUvs": 72, "./textures/VideoBaseTexture": 73, "./ticker": 75, "./utils": 76 }], 30: [function (t, e, r) {
	      function i() {
	        this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0;
	      }var n = t("./Point");i.prototype.constructor = i, e.exports = i, i.prototype.fromArray = function (t) {
	        this.a = t[0], this.b = t[1], this.c = t[3], this.d = t[4], this.tx = t[2], this.ty = t[5];
	      }, i.prototype.toArray = function (t, e) {
	        this.array || (this.array = new Float32Array(9));var r = e || this.array;return t ? (r[0] = this.a, r[1] = this.b, r[2] = 0, r[3] = this.c, r[4] = this.d, r[5] = 0, r[6] = this.tx, r[7] = this.ty, r[8] = 1) : (r[0] = this.a, r[1] = this.c, r[2] = this.tx, r[3] = this.b, r[4] = this.d, r[5] = this.ty, r[6] = 0, r[7] = 0, r[8] = 1), r;
	      }, i.prototype.apply = function (t, e) {
	        e = e || new n();var r = t.x,
	            i = t.y;return e.x = this.a * r + this.c * i + this.tx, e.y = this.b * r + this.d * i + this.ty, e;
	      }, i.prototype.applyInverse = function (t, e) {
	        e = e || new n();var r = 1 / (this.a * this.d + this.c * -this.b),
	            i = t.x,
	            o = t.y;return e.x = this.d * r * i + -this.c * r * o + (this.ty * this.c - this.tx * this.d) * r, e.y = this.a * r * o + -this.b * r * i + (-this.ty * this.a + this.tx * this.b) * r, e;
	      }, i.prototype.translate = function (t, e) {
	        return this.tx += t, this.ty += e, this;
	      }, i.prototype.scale = function (t, e) {
	        return this.a *= t, this.d *= e, this.c *= t, this.b *= e, this.tx *= t, this.ty *= e, this;
	      }, i.prototype.rotate = function (t) {
	        var e = Math.cos(t),
	            r = Math.sin(t),
	            i = this.a,
	            n = this.c,
	            o = this.tx;return this.a = i * e - this.b * r, this.b = i * r + this.b * e, this.c = n * e - this.d * r, this.d = n * r + this.d * e, this.tx = o * e - this.ty * r, this.ty = o * r + this.ty * e, this;
	      }, i.prototype.append = function (t) {
	        var e = this.a,
	            r = this.b,
	            i = this.c,
	            n = this.d;return this.a = t.a * e + t.b * i, this.b = t.a * r + t.b * n, this.c = t.c * e + t.d * i, this.d = t.c * r + t.d * n, this.tx = t.tx * e + t.ty * i + this.tx, this.ty = t.tx * r + t.ty * n + this.ty, this;
	      }, i.prototype.prepend = function (t) {
	        var e = this.tx;if (1 !== t.a || 0 !== t.b || 0 !== t.c || 1 !== t.d) {
	          var r = this.a,
	              i = this.c;this.a = r * t.a + this.b * t.c, this.b = r * t.b + this.b * t.d, this.c = i * t.a + this.d * t.c, this.d = i * t.b + this.d * t.d;
	        }return this.tx = e * t.a + this.ty * t.c + t.tx, this.ty = e * t.b + this.ty * t.d + t.ty, this;
	      }, i.prototype.invert = function () {
	        var t = this.a,
	            e = this.b,
	            r = this.c,
	            i = this.d,
	            n = this.tx,
	            o = t * i - e * r;return this.a = i / o, this.b = -e / o, this.c = -r / o, this.d = t / o, this.tx = (r * this.ty - i * n) / o, this.ty = -(t * this.ty - e * n) / o, this;
	      }, i.prototype.identity = function () {
	        return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0, this;
	      }, i.prototype.clone = function () {
	        var t = new i();return t.a = this.a, t.b = this.b, t.c = this.c, t.d = this.d, t.tx = this.tx, t.ty = this.ty, t;
	      }, i.prototype.copy = function (t) {
	        return t.a = this.a, t.b = this.b, t.c = this.c, t.d = this.d, t.tx = this.tx, t.ty = this.ty, t;
	      }, i.IDENTITY = new i(), i.TEMP_MATRIX = new i();
	    }, { "./Point": 31 }], 31: [function (t, e, r) {
	      function i(t, e) {
	        this.x = t || 0, this.y = e || 0;
	      }i.prototype.constructor = i, e.exports = i, i.prototype.clone = function () {
	        return new i(this.x, this.y);
	      }, i.prototype.copy = function (t) {
	        this.set(t.x, t.y);
	      }, i.prototype.equals = function (t) {
	        return t.x === this.x && t.y === this.y;
	      }, i.prototype.set = function (t, e) {
	        this.x = t || 0, this.y = e || (0 !== e ? this.x : 0);
	      };
	    }, {}], 32: [function (t, e, r) {
	      e.exports = { Point: t("./Point"), Matrix: t("./Matrix"), Circle: t("./shapes/Circle"), Ellipse: t("./shapes/Ellipse"), Polygon: t("./shapes/Polygon"), Rectangle: t("./shapes/Rectangle"), RoundedRectangle: t("./shapes/RoundedRectangle") };
	    }, { "./Matrix": 30, "./Point": 31, "./shapes/Circle": 33, "./shapes/Ellipse": 34, "./shapes/Polygon": 35, "./shapes/Rectangle": 36, "./shapes/RoundedRectangle": 37 }], 33: [function (t, e, r) {
	      function i(t, e, r) {
	        this.x = t || 0, this.y = e || 0, this.radius = r || 0, this.type = o.SHAPES.CIRC;
	      }var n = t("./Rectangle"),
	          o = t("../../const");i.prototype.constructor = i, e.exports = i, i.prototype.clone = function () {
	        return new i(this.x, this.y, this.radius);
	      }, i.prototype.contains = function (t, e) {
	        if (this.radius <= 0) return !1;var r = this.x - t,
	            i = this.y - e,
	            n = this.radius * this.radius;return r *= r, i *= i, n >= r + i;
	      }, i.prototype.getBounds = function () {
	        return new n(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
	      };
	    }, { "../../const": 22, "./Rectangle": 36 }], 34: [function (t, e, r) {
	      function i(t, e, r, i) {
	        this.x = t || 0, this.y = e || 0, this.width = r || 0, this.height = i || 0, this.type = o.SHAPES.ELIP;
	      }var n = t("./Rectangle"),
	          o = t("../../const");i.prototype.constructor = i, e.exports = i, i.prototype.clone = function () {
	        return new i(this.x, this.y, this.width, this.height);
	      }, i.prototype.contains = function (t, e) {
	        if (this.width <= 0 || this.height <= 0) return !1;var r = (t - this.x) / this.width,
	            i = (e - this.y) / this.height;return r *= r, i *= i, 1 >= r + i;
	      }, i.prototype.getBounds = function () {
	        return new n(this.x - this.width, this.y - this.height, this.width, this.height);
	      };
	    }, { "../../const": 22, "./Rectangle": 36 }], 35: [function (t, e, r) {
	      function i(t) {
	        var e = t;if (!Array.isArray(e)) {
	          e = new Array(arguments.length);for (var r = 0; r < e.length; ++r) {
	            e[r] = arguments[r];
	          }
	        }if (e[0] instanceof n) {
	          for (var i = [], s = 0, a = e.length; a > s; s++) {
	            i.push(e[s].x, e[s].y);
	          }e = i;
	        }this.closed = !0, this.points = e, this.type = o.SHAPES.POLY;
	      }var n = t("../Point"),
	          o = t("../../const");i.prototype.constructor = i, e.exports = i, i.prototype.clone = function () {
	        return new i(this.points.slice());
	      }, i.prototype.contains = function (t, e) {
	        for (var r = !1, i = this.points.length / 2, n = 0, o = i - 1; i > n; o = n++) {
	          var s = this.points[2 * n],
	              a = this.points[2 * n + 1],
	              h = this.points[2 * o],
	              l = this.points[2 * o + 1],
	              u = a > e != l > e && (h - s) * (e - a) / (l - a) + s > t;u && (r = !r);
	        }return r;
	      };
	    }, { "../../const": 22, "../Point": 31 }], 36: [function (t, e, r) {
	      function i(t, e, r, i) {
	        this.x = t || 0, this.y = e || 0, this.width = r || 0, this.height = i || 0, this.type = n.SHAPES.RECT;
	      }var n = t("../../const");i.prototype.constructor = i, e.exports = i, i.EMPTY = new i(0, 0, 0, 0), i.prototype.clone = function () {
	        return new i(this.x, this.y, this.width, this.height);
	      }, i.prototype.contains = function (t, e) {
	        return this.width <= 0 || this.height <= 0 ? !1 : t >= this.x && t < this.x + this.width && e >= this.y && e < this.y + this.height ? !0 : !1;
	      };
	    }, { "../../const": 22 }], 37: [function (t, e, r) {
	      function i(t, e, r, i, o) {
	        this.x = t || 0, this.y = e || 0, this.width = r || 0, this.height = i || 0, this.radius = o || 20, this.type = n.SHAPES.RREC;
	      }var n = t("../../const");i.prototype.constructor = i, e.exports = i, i.prototype.clone = function () {
	        return new i(this.x, this.y, this.width, this.height, this.radius);
	      }, i.prototype.contains = function (t, e) {
	        return this.width <= 0 || this.height <= 0 ? !1 : t >= this.x && t <= this.x + this.width && e >= this.y && e <= this.y + this.height ? !0 : !1;
	      };
	    }, { "../../const": 22 }], 38: [function (t, e, r) {
	      function i(t, e) {
	        n.call(this), this._properties = [!1, !0, !1, !1, !1], this._size = t || 15e3, this._buffers = null, this._updateStatic = !1, this.interactiveChildren = !1, this.blendMode = o.BLEND_MODES.NORMAL, this.roundPixels = !0, this.setProperties(e);
	      }var n = t("../display/Container"),
	          o = t("../const");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.setProperties = function (t) {
	        t && (this._properties[0] = "scale" in t ? !!t.scale : this._properties[0], this._properties[1] = "position" in t ? !!t.position : this._properties[1], this._properties[2] = "rotation" in t ? !!t.rotation : this._properties[2], this._properties[3] = "uvs" in t ? !!t.uvs : this._properties[3], this._properties[4] = "alpha" in t ? !!t.alpha : this._properties[4]);
	      }, i.prototype.updateTransform = function () {
	        this.displayObjectUpdateTransform();
	      }, i.prototype.renderWebGL = function (t) {
	        this.visible && !(this.worldAlpha <= 0) && this.children.length && this.renderable && (t.setObjectRenderer(t.plugins.particle), t.plugins.particle.render(this));
	      }, i.prototype.addChildAt = function (t, e) {
	        if (t === this) return t;if (e >= 0 && e <= this.children.length) return t.parent && t.parent.removeChild(t), t.parent = this, this.children.splice(e, 0, t), this._updateStatic = !0, t;throw new Error(t + "addChildAt: The index " + e + " supplied is out of bounds " + this.children.length);
	      }, i.prototype.removeChildAt = function (t) {
	        var e = this.getChildAt(t);return e.parent = null, this.children.splice(t, 1), this._updateStatic = !0, e;
	      }, i.prototype.renderCanvas = function (t) {
	        if (this.visible && !(this.worldAlpha <= 0) && this.children.length && this.renderable) {
	          var e = t.context,
	              r = this.worldTransform,
	              i = !0,
	              n = 0,
	              o = 0,
	              s = 0,
	              a = 0;e.globalAlpha = this.worldAlpha, this.displayObjectUpdateTransform();for (var h = 0; h < this.children.length; ++h) {
	            var l = this.children[h];if (l.visible) {
	              var u = l.texture.frame;if (e.globalAlpha = this.worldAlpha * l.alpha, l.rotation % (2 * Math.PI) === 0) i && (e.setTransform(r.a, r.b, r.c, r.d, r.tx, r.ty), i = !1), n = l.anchor.x * -u.width * l.scale.x + l.position.x + .5, o = l.anchor.y * -u.height * l.scale.y + l.position.y + .5, s = u.width * l.scale.x, a = u.height * l.scale.y;else {
	                i || (i = !0), l.displayObjectUpdateTransform();var c = l.worldTransform;t.roundPixels ? e.setTransform(c.a, c.b, c.c, c.d, 0 | c.tx, 0 | c.ty) : e.setTransform(c.a, c.b, c.c, c.d, c.tx, c.ty), n = l.anchor.x * -u.width + .5, o = l.anchor.y * -u.height + .5, s = u.width, a = u.height;
	              }e.drawImage(l.texture.baseTexture.source, u.x, u.y, u.width, u.height, n, o, s, a);
	            }
	          }
	        }
	      }, i.prototype.destroy = function () {
	        if (n.prototype.destroy.apply(this, arguments), this._buffers) for (var t = 0; t < this._buffers.length; ++t) {
	          this._buffers[t].destroy();
	        }this._properties = null, this._buffers = null;
	      };
	    }, { "../const": 22, "../display/Container": 23 }], 39: [function (t, e, r) {
	      function i(t, e, r) {
	        this.gl = t, this.vertSize = 2, this.vertByteSize = 4 * this.vertSize, this.size = r, this.dynamicProperties = [], this.staticProperties = [];for (var i = 0; i < e.length; i++) {
	          var n = e[i];n.dynamic ? this.dynamicProperties.push(n) : this.staticProperties.push(n);
	        }this.staticStride = 0, this.staticBuffer = null, this.staticData = null, this.dynamicStride = 0, this.dynamicBuffer = null, this.dynamicData = null, this.initBuffers();
	      }i.prototype.constructor = i, e.exports = i, i.prototype.initBuffers = function () {
	        var t,
	            e,
	            r = this.gl,
	            i = 0;for (this.dynamicStride = 0, t = 0; t < this.dynamicProperties.length; t++) {
	          e = this.dynamicProperties[t], e.offset = i, i += e.size, this.dynamicStride += e.size;
	        }this.dynamicData = new Float32Array(this.size * this.dynamicStride * 4), this.dynamicBuffer = r.createBuffer(), r.bindBuffer(r.ARRAY_BUFFER, this.dynamicBuffer), r.bufferData(r.ARRAY_BUFFER, this.dynamicData, r.DYNAMIC_DRAW);var n = 0;for (this.staticStride = 0, t = 0; t < this.staticProperties.length; t++) {
	          e = this.staticProperties[t], e.offset = n, n += e.size, this.staticStride += e.size;
	        }this.staticData = new Float32Array(this.size * this.staticStride * 4), this.staticBuffer = r.createBuffer(), r.bindBuffer(r.ARRAY_BUFFER, this.staticBuffer), r.bufferData(r.ARRAY_BUFFER, this.staticData, r.DYNAMIC_DRAW);
	      }, i.prototype.uploadDynamic = function (t, e, r) {
	        for (var i = this.gl, n = 0; n < this.dynamicProperties.length; n++) {
	          var o = this.dynamicProperties[n];o.uploadFunction(t, e, r, this.dynamicData, this.dynamicStride, o.offset);
	        }i.bindBuffer(i.ARRAY_BUFFER, this.dynamicBuffer), i.bufferSubData(i.ARRAY_BUFFER, 0, this.dynamicData);
	      }, i.prototype.uploadStatic = function (t, e, r) {
	        for (var i = this.gl, n = 0; n < this.staticProperties.length; n++) {
	          var o = this.staticProperties[n];o.uploadFunction(t, e, r, this.staticData, this.staticStride, o.offset);
	        }i.bindBuffer(i.ARRAY_BUFFER, this.staticBuffer), i.bufferSubData(i.ARRAY_BUFFER, 0, this.staticData);
	      }, i.prototype.bind = function () {
	        var t,
	            e,
	            r = this.gl;for (r.bindBuffer(r.ARRAY_BUFFER, this.dynamicBuffer), t = 0; t < this.dynamicProperties.length; t++) {
	          e = this.dynamicProperties[t], r.vertexAttribPointer(e.attribute, e.size, r.FLOAT, !1, 4 * this.dynamicStride, 4 * e.offset);
	        }for (r.bindBuffer(r.ARRAY_BUFFER, this.staticBuffer), t = 0; t < this.staticProperties.length; t++) {
	          e = this.staticProperties[t], r.vertexAttribPointer(e.attribute, e.size, r.FLOAT, !1, 4 * this.staticStride, 4 * e.offset);
	        }
	      }, i.prototype.destroy = function () {
	        this.dynamicProperties = null, this.dynamicData = null, this.gl.deleteBuffer(this.dynamicBuffer), this.staticProperties = null, this.staticData = null, this.gl.deleteBuffer(this.staticBuffer);
	      };
	    }, {}], 40: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.size = 15e3;var e = 6 * this.size;this.indices = new Uint16Array(e);for (var r = 0, i = 0; e > r; r += 6, i += 4) {
	          this.indices[r + 0] = i + 0, this.indices[r + 1] = i + 1, this.indices[r + 2] = i + 2, this.indices[r + 3] = i + 0, this.indices[r + 4] = i + 2, this.indices[r + 5] = i + 3;
	        }this.shader = null, this.indexBuffer = null, this.properties = null, this.tempMatrix = new h.Matrix();
	      }var n = t("../../renderers/webgl/utils/ObjectRenderer"),
	          o = t("../../renderers/webgl/WebGLRenderer"),
	          s = t("./ParticleShader"),
	          a = t("./ParticleBuffer"),
	          h = t("../../math");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, o.registerPlugin("particle", i), i.prototype.onContextChange = function () {
	        var t = this.renderer.gl;this.shader = new s(this.renderer.shaderManager), this.indexBuffer = t.createBuffer(), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, this.indices, t.STATIC_DRAW), this.properties = [{ attribute: this.shader.attributes.aVertexPosition, dynamic: !1, size: 2, uploadFunction: this.uploadVertices, offset: 0 }, { attribute: this.shader.attributes.aPositionCoord, dynamic: !0, size: 2, uploadFunction: this.uploadPosition, offset: 0 }, { attribute: this.shader.attributes.aRotation, dynamic: !1, size: 1, uploadFunction: this.uploadRotation, offset: 0 }, { attribute: this.shader.attributes.aTextureCoord, dynamic: !1, size: 2, uploadFunction: this.uploadUvs, offset: 0 }, { attribute: this.shader.attributes.aColor, dynamic: !1, size: 1, uploadFunction: this.uploadAlpha, offset: 0 }];
	      }, i.prototype.start = function () {
	        var t = this.renderer.gl;t.activeTexture(t.TEXTURE0), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer);var e = this.shader;this.renderer.shaderManager.setShader(e);
	      }, i.prototype.render = function (t) {
	        var e = t.children,
	            r = e.length,
	            i = t._size;if (0 !== r) {
	          r > i && (r = i), t._buffers || (t._buffers = this.generateBuffers(t)), this.renderer.blendModeManager.setBlendMode(t.blendMode);var n = this.renderer.gl,
	              o = t.worldTransform.copy(this.tempMatrix);o.prepend(this.renderer.currentRenderTarget.projectionMatrix), n.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, !1, o.toArray(!0)), n.uniform1f(this.shader.uniforms.uAlpha._location, t.worldAlpha);var s = t._updateStatic,
	              a = e[0]._texture.baseTexture;if (a._glTextures[n.id]) n.bindTexture(n.TEXTURE_2D, a._glTextures[n.id]);else {
	            if (!this.renderer.updateTexture(a)) return;this.properties[0].dynamic && this.properties[3].dynamic || (s = !0);
	          }for (var h = 0, l = 0; r > l; l += this.size) {
	            var u = r - l;u > this.size && (u = this.size);var c = t._buffers[h++];c.uploadDynamic(e, l, u), s && c.uploadStatic(e, l, u), c.bind(this.shader), n.drawElements(n.TRIANGLES, 6 * u, n.UNSIGNED_SHORT, 0), this.renderer.drawCount++;
	          }t._updateStatic = !1;
	        }
	      }, i.prototype.generateBuffers = function (t) {
	        var e,
	            r = this.renderer.gl,
	            i = [],
	            n = t._size;for (e = 0; e < t._properties.length; e++) {
	          this.properties[e].dynamic = t._properties[e];
	        }for (e = 0; n > e; e += this.size) {
	          i.push(new a(r, this.properties, this.size, this.shader));
	        }return i;
	      }, i.prototype.uploadVertices = function (t, e, r, i, n, o) {
	        for (var s, a, h, l, u, c, p, d, f, v = 0; r > v; v++) {
	          s = t[e + v], a = s._texture, l = s.scale.x, u = s.scale.y, a.trim ? (h = a.trim, p = h.x - s.anchor.x * h.width, c = p + a.crop.width, f = h.y - s.anchor.y * h.height, d = f + a.crop.height) : (c = a._frame.width * (1 - s.anchor.x), p = a._frame.width * -s.anchor.x, d = a._frame.height * (1 - s.anchor.y), f = a._frame.height * -s.anchor.y), i[o] = p * l, i[o + 1] = f * u, i[o + n] = c * l, i[o + n + 1] = f * u, i[o + 2 * n] = c * l, i[o + 2 * n + 1] = d * u, i[o + 3 * n] = p * l, i[o + 3 * n + 1] = d * u, o += 4 * n;
	        }
	      }, i.prototype.uploadPosition = function (t, e, r, i, n, o) {
	        for (var s = 0; r > s; s++) {
	          var a = t[e + s].position;i[o] = a.x, i[o + 1] = a.y, i[o + n] = a.x, i[o + n + 1] = a.y, i[o + 2 * n] = a.x, i[o + 2 * n + 1] = a.y, i[o + 3 * n] = a.x, i[o + 3 * n + 1] = a.y, o += 4 * n;
	        }
	      }, i.prototype.uploadRotation = function (t, e, r, i, n, o) {
	        for (var s = 0; r > s; s++) {
	          var a = t[e + s].rotation;i[o] = a, i[o + n] = a, i[o + 2 * n] = a, i[o + 3 * n] = a, o += 4 * n;
	        }
	      }, i.prototype.uploadUvs = function (t, e, r, i, n, o) {
	        for (var s = 0; r > s; s++) {
	          var a = t[e + s]._texture._uvs;a ? (i[o] = a.x0, i[o + 1] = a.y0, i[o + n] = a.x1, i[o + n + 1] = a.y1, i[o + 2 * n] = a.x2, i[o + 2 * n + 1] = a.y2, i[o + 3 * n] = a.x3, i[o + 3 * n + 1] = a.y3, o += 4 * n) : (i[o] = 0, i[o + 1] = 0, i[o + n] = 0, i[o + n + 1] = 0, i[o + 2 * n] = 0, i[o + 2 * n + 1] = 0, i[o + 3 * n] = 0, i[o + 3 * n + 1] = 0, o += 4 * n);
	        }
	      }, i.prototype.uploadAlpha = function (t, e, r, i, n, o) {
	        for (var s = 0; r > s; s++) {
	          var a = t[e + s].alpha;i[o] = a, i[o + n] = a, i[o + 2 * n] = a, i[o + 3 * n] = a, o += 4 * n;
	        }
	      }, i.prototype.destroy = function () {
	        this.renderer.gl && this.renderer.gl.deleteBuffer(this.indexBuffer), n.prototype.destroy.apply(this, arguments), this.shader.destroy(), this.indices = null, this.tempMatrix = null;
	      };
	    }, { "../../math": 32, "../../renderers/webgl/WebGLRenderer": 48, "../../renderers/webgl/utils/ObjectRenderer": 62, "./ParticleBuffer": 39, "./ParticleShader": 41 }], 41: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t, ["attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "attribute vec2 aPositionCoord;", "attribute vec2 aScale;", "attribute float aRotation;", "uniform mat3 projectionMatrix;", "varying vec2 vTextureCoord;", "varying float vColor;", "void main(void){", "   vec2 v = aVertexPosition;", "   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);", "   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);", "   v = v + aPositionCoord;", "   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}"].join("\n"), ["precision lowp float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform sampler2D uSampler;", "uniform float uAlpha;", "void main(void){", "  vec4 color = texture2D(uSampler, vTextureCoord) * vColor * uAlpha;", "  if (color.a == 0.0) discard;", "  gl_FragColor = color;", "}"].join("\n"), { uAlpha: { type: "1f", value: 1 } }, { aPositionCoord: 0, aRotation: 0 });
	      }var n = t("../../renderers/webgl/shaders/TextureShader");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i;
	    }, { "../../renderers/webgl/shaders/TextureShader": 61 }], 42: [function (t, e, r) {
	      function i(t, e, r, i) {
	        if (a.call(this), n.sayHello(t), i) for (var h in s.DEFAULT_RENDER_OPTIONS) {
	          "undefined" == typeof i[h] && (i[h] = s.DEFAULT_RENDER_OPTIONS[h]);
	        } else i = s.DEFAULT_RENDER_OPTIONS;this.type = s.RENDERER_TYPE.UNKNOWN, this.width = e || 800, this.height = r || 600, this.view = i.view || document.createElement("canvas"), this.resolution = i.resolution, this.transparent = i.transparent, this.autoResize = i.autoResize || !1, this.blendModes = null, this.preserveDrawingBuffer = i.preserveDrawingBuffer, this.clearBeforeRender = i.clearBeforeRender, this._backgroundColor = 0, this._backgroundColorRgb = [0, 0, 0], this._backgroundColorString = "#000000", this.backgroundColor = i.backgroundColor || this._backgroundColor, this._tempDisplayObjectParent = { worldTransform: new o.Matrix(), worldAlpha: 1, children: [] }, this._lastObjectRendered = this._tempDisplayObjectParent;
	      }var n = t("../utils"),
	          o = t("../math"),
	          s = t("../const"),
	          a = t("eventemitter3");i.prototype = Object.create(a.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { backgroundColor: { get: function get() {
	            return this._backgroundColor;
	          }, set: function set(t) {
	            this._backgroundColor = t, this._backgroundColorString = n.hex2string(t), n.hex2rgb(t, this._backgroundColorRgb);
	          } } }), i.prototype.resize = function (t, e) {
	        this.width = t * this.resolution, this.height = e * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px");
	      }, i.prototype.destroy = function (t) {
	        t && this.view.parent && this.view.parent.removeChild(this.view), this.type = s.RENDERER_TYPE.UNKNOWN, this.width = 0, this.height = 0, this.view = null, this.resolution = 0, this.transparent = !1, this.autoResize = !1, this.blendModes = null, this.preserveDrawingBuffer = !1, this.clearBeforeRender = !1, this._backgroundColor = 0, this._backgroundColorRgb = null, this._backgroundColorString = null;
	      };
	    }, { "../const": 22, "../math": 32, "../utils": 76, eventemitter3: 11 }], 43: [function (t, e, r) {
	      function i(t, e, r) {
	        n.call(this, "Canvas", t, e, r), this.type = h.RENDERER_TYPE.CANVAS, this.context = this.view.getContext("2d", { alpha: this.transparent }), this.refresh = !0, this.maskManager = new o(), this.roundPixels = !1, this.currentScaleMode = h.SCALE_MODES.DEFAULT, this.currentBlendMode = h.BLEND_MODES.NORMAL, this.smoothProperty = "imageSmoothingEnabled", this.context.imageSmoothingEnabled || (this.context.webkitImageSmoothingEnabled ? this.smoothProperty = "webkitImageSmoothingEnabled" : this.context.mozImageSmoothingEnabled ? this.smoothProperty = "mozImageSmoothingEnabled" : this.context.oImageSmoothingEnabled ? this.smoothProperty = "oImageSmoothingEnabled" : this.context.msImageSmoothingEnabled && (this.smoothProperty = "msImageSmoothingEnabled")), this.initPlugins(), this._mapBlendModes(), this._tempDisplayObjectParent = { worldTransform: new a.Matrix(), worldAlpha: 1 }, this.resize(t, e);
	      }var n = t("../SystemRenderer"),
	          o = t("./utils/CanvasMaskManager"),
	          s = t("../../utils"),
	          a = t("../../math"),
	          h = t("../../const");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, s.pluginTarget.mixin(i), i.prototype.render = function (t) {
	        var e = t.parent;this._lastObjectRendered = t, t.parent = this._tempDisplayObjectParent, t.updateTransform(), t.parent = e, this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.globalAlpha = 1, this.currentBlendMode = h.BLEND_MODES.NORMAL, this.context.globalCompositeOperation = this.blendModes[h.BLEND_MODES.NORMAL], navigator.isCocoonJS && this.view.screencanvas && (this.context.fillStyle = "black", this.context.clear()), this.clearBeforeRender && (this.transparent ? this.context.clearRect(0, 0, this.width, this.height) : (this.context.fillStyle = this._backgroundColorString, this.context.fillRect(0, 0, this.width, this.height))), this.renderDisplayObject(t, this.context);
	      }, i.prototype.destroy = function (t) {
	        this.destroyPlugins(), n.prototype.destroy.call(this, t), this.context = null, this.refresh = !0, this.maskManager.destroy(), this.maskManager = null, this.roundPixels = !1, this.currentScaleMode = 0, this.currentBlendMode = 0, this.smoothProperty = null;
	      }, i.prototype.renderDisplayObject = function (t, e) {
	        var r = this.context;this.context = e, t.renderCanvas(this), this.context = r;
	      }, i.prototype.resize = function (t, e) {
	        n.prototype.resize.call(this, t, e), this.currentScaleMode = h.SCALE_MODES.DEFAULT, this.smoothProperty && (this.context[this.smoothProperty] = this.currentScaleMode === h.SCALE_MODES.LINEAR);
	      }, i.prototype._mapBlendModes = function () {
	        this.blendModes || (this.blendModes = {}, s.canUseNewCanvasBlendModes() ? (this.blendModes[h.BLEND_MODES.NORMAL] = "source-over", this.blendModes[h.BLEND_MODES.ADD] = "lighter", this.blendModes[h.BLEND_MODES.MULTIPLY] = "multiply", this.blendModes[h.BLEND_MODES.SCREEN] = "screen", this.blendModes[h.BLEND_MODES.OVERLAY] = "overlay", this.blendModes[h.BLEND_MODES.DARKEN] = "darken", this.blendModes[h.BLEND_MODES.LIGHTEN] = "lighten", this.blendModes[h.BLEND_MODES.COLOR_DODGE] = "color-dodge", this.blendModes[h.BLEND_MODES.COLOR_BURN] = "color-burn", this.blendModes[h.BLEND_MODES.HARD_LIGHT] = "hard-light", this.blendModes[h.BLEND_MODES.SOFT_LIGHT] = "soft-light", this.blendModes[h.BLEND_MODES.DIFFERENCE] = "difference", this.blendModes[h.BLEND_MODES.EXCLUSION] = "exclusion", this.blendModes[h.BLEND_MODES.HUE] = "hue", this.blendModes[h.BLEND_MODES.SATURATION] = "saturate", this.blendModes[h.BLEND_MODES.COLOR] = "color", this.blendModes[h.BLEND_MODES.LUMINOSITY] = "luminosity") : (this.blendModes[h.BLEND_MODES.NORMAL] = "source-over", this.blendModes[h.BLEND_MODES.ADD] = "lighter", this.blendModes[h.BLEND_MODES.MULTIPLY] = "source-over", this.blendModes[h.BLEND_MODES.SCREEN] = "source-over", this.blendModes[h.BLEND_MODES.OVERLAY] = "source-over", this.blendModes[h.BLEND_MODES.DARKEN] = "source-over", this.blendModes[h.BLEND_MODES.LIGHTEN] = "source-over", this.blendModes[h.BLEND_MODES.COLOR_DODGE] = "source-over", this.blendModes[h.BLEND_MODES.COLOR_BURN] = "source-over", this.blendModes[h.BLEND_MODES.HARD_LIGHT] = "source-over", this.blendModes[h.BLEND_MODES.SOFT_LIGHT] = "source-over", this.blendModes[h.BLEND_MODES.DIFFERENCE] = "source-over", this.blendModes[h.BLEND_MODES.EXCLUSION] = "source-over", this.blendModes[h.BLEND_MODES.HUE] = "source-over", this.blendModes[h.BLEND_MODES.SATURATION] = "source-over", this.blendModes[h.BLEND_MODES.COLOR] = "source-over", this.blendModes[h.BLEND_MODES.LUMINOSITY] = "source-over"));
	      };
	    }, { "../../const": 22, "../../math": 32, "../../utils": 76, "../SystemRenderer": 42, "./utils/CanvasMaskManager": 46 }], 44: [function (t, e, r) {
	      function i(t, e) {
	        this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.canvas.width = t, this.canvas.height = e;
	      }i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { width: { get: function get() {
	            return this.canvas.width;
	          }, set: function set(t) {
	            this.canvas.width = t;
	          } }, height: { get: function get() {
	            return this.canvas.height;
	          }, set: function set(t) {
	            this.canvas.height = t;
	          } } }), i.prototype.clear = function () {
	        this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	      }, i.prototype.resize = function (t, e) {
	        this.canvas.width = t, this.canvas.height = e;
	      }, i.prototype.destroy = function () {
	        this.context = null, this.canvas = null;
	      };
	    }, {}], 45: [function (t, e, r) {
	      var i = t("../../../const"),
	          n = {};e.exports = n, n.renderGraphics = function (t, e) {
	        var r = t.worldAlpha;t.dirty && (this.updateGraphicsTint(t), t.dirty = !1);for (var n = 0; n < t.graphicsData.length; n++) {
	          var o = t.graphicsData[n],
	              s = o.shape,
	              a = o._fillTint,
	              h = o._lineTint;if (e.lineWidth = o.lineWidth, o.type === i.SHAPES.POLY) {
	            e.beginPath();var l = s.points;e.moveTo(l[0], l[1]);for (var u = 1; u < l.length / 2; u++) {
	              e.lineTo(l[2 * u], l[2 * u + 1]);
	            }s.closed && e.lineTo(l[0], l[1]), l[0] === l[l.length - 2] && l[1] === l[l.length - 1] && e.closePath(), o.fill && (e.globalAlpha = o.fillAlpha * r, e.fillStyle = "#" + ("00000" + (0 | a).toString(16)).substr(-6), e.fill()), o.lineWidth && (e.globalAlpha = o.lineAlpha * r, e.strokeStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), e.stroke());
	          } else if (o.type === i.SHAPES.RECT) (o.fillColor || 0 === o.fillColor) && (e.globalAlpha = o.fillAlpha * r, e.fillStyle = "#" + ("00000" + (0 | a).toString(16)).substr(-6), e.fillRect(s.x, s.y, s.width, s.height)), o.lineWidth && (e.globalAlpha = o.lineAlpha * r, e.strokeStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), e.strokeRect(s.x, s.y, s.width, s.height));else if (o.type === i.SHAPES.CIRC) e.beginPath(), e.arc(s.x, s.y, s.radius, 0, 2 * Math.PI), e.closePath(), o.fill && (e.globalAlpha = o.fillAlpha * r, e.fillStyle = "#" + ("00000" + (0 | a).toString(16)).substr(-6), e.fill()), o.lineWidth && (e.globalAlpha = o.lineAlpha * r, e.strokeStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), e.stroke());else if (o.type === i.SHAPES.ELIP) {
	            var c = 2 * s.width,
	                p = 2 * s.height,
	                d = s.x - c / 2,
	                f = s.y - p / 2;e.beginPath();var v = .5522848,
	                g = c / 2 * v,
	                m = p / 2 * v,
	                y = d + c,
	                x = f + p,
	                b = d + c / 2,
	                _ = f + p / 2;e.moveTo(d, _), e.bezierCurveTo(d, _ - m, b - g, f, b, f), e.bezierCurveTo(b + g, f, y, _ - m, y, _), e.bezierCurveTo(y, _ + m, b + g, x, b, x), e.bezierCurveTo(b - g, x, d, _ + m, d, _), e.closePath(), o.fill && (e.globalAlpha = o.fillAlpha * r, e.fillStyle = "#" + ("00000" + (0 | a).toString(16)).substr(-6), e.fill()), o.lineWidth && (e.globalAlpha = o.lineAlpha * r, e.strokeStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), e.stroke());
	          } else if (o.type === i.SHAPES.RREC) {
	            var T = s.x,
	                E = s.y,
	                S = s.width,
	                A = s.height,
	                w = s.radius,
	                C = Math.min(S, A) / 2 | 0;w = w > C ? C : w, e.beginPath(), e.moveTo(T, E + w), e.lineTo(T, E + A - w), e.quadraticCurveTo(T, E + A, T + w, E + A), e.lineTo(T + S - w, E + A), e.quadraticCurveTo(T + S, E + A, T + S, E + A - w), e.lineTo(T + S, E + w), e.quadraticCurveTo(T + S, E, T + S - w, E), e.lineTo(T + w, E), e.quadraticCurveTo(T, E, T, E + w), e.closePath(), (o.fillColor || 0 === o.fillColor) && (e.globalAlpha = o.fillAlpha * r, e.fillStyle = "#" + ("00000" + (0 | a).toString(16)).substr(-6), e.fill()), o.lineWidth && (e.globalAlpha = o.lineAlpha * r, e.strokeStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), e.stroke());
	          }
	        }
	      }, n.renderGraphicsMask = function (t, e) {
	        var r = t.graphicsData.length;if (0 !== r) {
	          e.beginPath();for (var n = 0; r > n; n++) {
	            var o = t.graphicsData[n],
	                s = o.shape;if (o.type === i.SHAPES.POLY) {
	              var a = s.points;e.moveTo(a[0], a[1]);for (var h = 1; h < a.length / 2; h++) {
	                e.lineTo(a[2 * h], a[2 * h + 1]);
	              }a[0] === a[a.length - 2] && a[1] === a[a.length - 1] && e.closePath();
	            } else if (o.type === i.SHAPES.RECT) e.rect(s.x, s.y, s.width, s.height), e.closePath();else if (o.type === i.SHAPES.CIRC) e.arc(s.x, s.y, s.radius, 0, 2 * Math.PI), e.closePath();else if (o.type === i.SHAPES.ELIP) {
	              var l = 2 * s.width,
	                  u = 2 * s.height,
	                  c = s.x - l / 2,
	                  p = s.y - u / 2,
	                  d = .5522848,
	                  f = l / 2 * d,
	                  v = u / 2 * d,
	                  g = c + l,
	                  m = p + u,
	                  y = c + l / 2,
	                  x = p + u / 2;e.moveTo(c, x), e.bezierCurveTo(c, x - v, y - f, p, y, p), e.bezierCurveTo(y + f, p, g, x - v, g, x), e.bezierCurveTo(g, x + v, y + f, m, y, m), e.bezierCurveTo(y - f, m, c, x + v, c, x), e.closePath();
	            } else if (o.type === i.SHAPES.RREC) {
	              var b = s.x,
	                  _ = s.y,
	                  T = s.width,
	                  E = s.height,
	                  S = s.radius,
	                  A = Math.min(T, E) / 2 | 0;S = S > A ? A : S, e.moveTo(b, _ + S), e.lineTo(b, _ + E - S), e.quadraticCurveTo(b, _ + E, b + S, _ + E), e.lineTo(b + T - S, _ + E), e.quadraticCurveTo(b + T, _ + E, b + T, _ + E - S), e.lineTo(b + T, _ + S), e.quadraticCurveTo(b + T, _, b + T - S, _), e.lineTo(b + S, _), e.quadraticCurveTo(b, _, b, _ + S), e.closePath();
	            }
	          }
	        }
	      }, n.updateGraphicsTint = function (t) {
	        if (16777215 !== t.tint) for (var e = (t.tint >> 16 & 255) / 255, r = (t.tint >> 8 & 255) / 255, i = (255 & t.tint) / 255, n = 0; n < t.graphicsData.length; n++) {
	          var o = t.graphicsData[n],
	              s = 0 | o.fillColor,
	              a = 0 | o.lineColor;o._fillTint = ((s >> 16 & 255) / 255 * e * 255 << 16) + ((s >> 8 & 255) / 255 * r * 255 << 8) + (255 & s) / 255 * i * 255, o._lineTint = ((a >> 16 & 255) / 255 * e * 255 << 16) + ((a >> 8 & 255) / 255 * r * 255 << 8) + (255 & a) / 255 * i * 255;
	        }
	      };
	    }, { "../../../const": 22 }], 46: [function (t, e, r) {
	      function i() {}var n = t("./CanvasGraphics");i.prototype.constructor = i, e.exports = i, i.prototype.pushMask = function (t, e) {
	        e.context.save();var r = t.alpha,
	            i = t.worldTransform,
	            o = e.resolution;e.context.setTransform(i.a * o, i.b * o, i.c * o, i.d * o, i.tx * o, i.ty * o), t.texture || (n.renderGraphicsMask(t, e.context), e.context.clip()), t.worldAlpha = r;
	      }, i.prototype.popMask = function (t) {
	        t.context.restore();
	      }, i.prototype.destroy = function () {};
	    }, { "./CanvasGraphics": 45 }], 47: [function (t, e, r) {
	      var i = t("../../../utils"),
	          n = {};e.exports = n, n.getTintedTexture = function (t, e) {
	        var r = t.texture;e = n.roundColor(e);var i = "#" + ("00000" + (0 | e).toString(16)).substr(-6);if (r.tintCache = r.tintCache || {}, r.tintCache[i]) return r.tintCache[i];var o = n.canvas || document.createElement("canvas");if (n.tintMethod(r, e, o), n.convertTintToImage) {
	          var s = new Image();s.src = o.toDataURL(), r.tintCache[i] = s;
	        } else r.tintCache[i] = o, n.canvas = null;return o;
	      }, n.tintWithMultiply = function (t, e, r) {
	        var i = r.getContext("2d"),
	            n = t.crop;r.width = n.width, r.height = n.height, i.fillStyle = "#" + ("00000" + (0 | e).toString(16)).substr(-6), i.fillRect(0, 0, n.width, n.height), i.globalCompositeOperation = "multiply", i.drawImage(t.baseTexture.source, n.x, n.y, n.width, n.height, 0, 0, n.width, n.height), i.globalCompositeOperation = "destination-atop", i.drawImage(t.baseTexture.source, n.x, n.y, n.width, n.height, 0, 0, n.width, n.height);
	      }, n.tintWithOverlay = function (t, e, r) {
	        var i = r.getContext("2d"),
	            n = t.crop;r.width = n.width, r.height = n.height, i.globalCompositeOperation = "copy", i.fillStyle = "#" + ("00000" + (0 | e).toString(16)).substr(-6), i.fillRect(0, 0, n.width, n.height), i.globalCompositeOperation = "destination-atop", i.drawImage(t.baseTexture.source, n.x, n.y, n.width, n.height, 0, 0, n.width, n.height);
	      }, n.tintWithPerPixel = function (t, e, r) {
	        var n = r.getContext("2d"),
	            o = t.crop;r.width = o.width, r.height = o.height, n.globalCompositeOperation = "copy", n.drawImage(t.baseTexture.source, o.x, o.y, o.width, o.height, 0, 0, o.width, o.height);for (var s = i.hex2rgb(e), a = s[0], h = s[1], l = s[2], u = n.getImageData(0, 0, o.width, o.height), c = u.data, p = 0; p < c.length; p += 4) {
	          c[p + 0] *= a, c[p + 1] *= h, c[p + 2] *= l;
	        }n.putImageData(u, 0, 0);
	      }, n.roundColor = function (t) {
	        var e = n.cacheStepsPerColorChannel,
	            r = i.hex2rgb(t);return r[0] = Math.min(255, r[0] / e * e), r[1] = Math.min(255, r[1] / e * e), r[2] = Math.min(255, r[2] / e * e), i.rgb2hex(r);
	      }, n.cacheStepsPerColorChannel = 8, n.convertTintToImage = !1, n.canUseMultiply = i.canUseNewCanvasBlendModes(), n.tintMethod = n.canUseMultiply ? n.tintWithMultiply : n.tintWithPerPixel;
	    }, { "../../../utils": 76 }], 48: [function (t, e, r) {
	      function i(t, e, r) {
	        r = r || {}, n.call(this, "WebGL", t, e, r), this.type = f.RENDERER_TYPE.WEBGL, this.handleContextLost = this.handleContextLost.bind(this), this.handleContextRestored = this.handleContextRestored.bind(this), this.view.addEventListener("webglcontextlost", this.handleContextLost, !1), this.view.addEventListener("webglcontextrestored", this.handleContextRestored, !1), this._useFXAA = !!r.forceFXAA && r.antialias, this._FXAAFilter = null, this._contextOptions = { alpha: this.transparent, antialias: r.antialias, premultipliedAlpha: this.transparent && "notMultiplied" !== this.transparent, stencil: !0, preserveDrawingBuffer: r.preserveDrawingBuffer }, this.drawCount = 0, this.shaderManager = new o(this), this.maskManager = new s(this), this.stencilManager = new a(this), this.filterManager = new h(this), this.blendModeManager = new l(this), this.currentRenderTarget = null, this.currentRenderer = new c(this), this.initPlugins(), this._createContext(), this._initContext(), this._mapGlModes(), this._renderTargetStack = [];
	      }var n = t("../SystemRenderer"),
	          o = t("./managers/ShaderManager"),
	          s = t("./managers/MaskManager"),
	          a = t("./managers/StencilManager"),
	          h = t("./managers/FilterManager"),
	          l = t("./managers/BlendModeManager"),
	          u = t("./utils/RenderTarget"),
	          c = t("./utils/ObjectRenderer"),
	          p = t("./filters/FXAAFilter"),
	          d = t("../../utils"),
	          f = t("../../const");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, d.pluginTarget.mixin(i), i.glContextId = 0, i.prototype._createContext = function () {
	        var t = this.view.getContext("webgl", this._contextOptions) || this.view.getContext("experimental-webgl", this._contextOptions);if (this.gl = t, !t) throw new Error("This browser does not support webGL. Try using the canvas renderer");this.glContextId = i.glContextId++, t.id = this.glContextId, t.renderer = this;
	      }, i.prototype._initContext = function () {
	        var t = this.gl;t.disable(t.DEPTH_TEST), t.disable(t.CULL_FACE), t.enable(t.BLEND), this.renderTarget = new u(t, this.width, this.height, null, this.resolution, !0), this.setRenderTarget(this.renderTarget), this.emit("context", t), this.resize(this.width, this.height), this._useFXAA || (this._useFXAA = this._contextOptions.antialias && !t.getContextAttributes().antialias), this._useFXAA && (window.console.warn("FXAA antialiasing being used instead of native antialiasing"), this._FXAAFilter = [new p()]);
	      }, i.prototype.render = function (t) {
	        if (!this.gl.isContextLost()) {
	          this.drawCount = 0, this._lastObjectRendered = t, this._useFXAA && (this._FXAAFilter[0].uniforms.resolution.value.x = this.width, this._FXAAFilter[0].uniforms.resolution.value.y = this.height, t.filterArea = this.renderTarget.size, t.filters = this._FXAAFilter);var e = t.parent;t.parent = this._tempDisplayObjectParent, t.updateTransform(), t.parent = e;var r = this.gl;this.setRenderTarget(this.renderTarget), this.clearBeforeRender && (this.transparent ? r.clearColor(0, 0, 0, 0) : r.clearColor(this._backgroundColorRgb[0], this._backgroundColorRgb[1], this._backgroundColorRgb[2], 1), r.clear(r.COLOR_BUFFER_BIT)), this.renderDisplayObject(t, this.renderTarget);
	        }
	      }, i.prototype.renderDisplayObject = function (t, e, r) {
	        this.setRenderTarget(e), r && e.clear(), this.filterManager.setFilterStack(e.filterStack), t.renderWebGL(this), this.currentRenderer.flush();
	      }, i.prototype.setObjectRenderer = function (t) {
	        this.currentRenderer !== t && (this.currentRenderer.stop(), this.currentRenderer = t, this.currentRenderer.start());
	      }, i.prototype.setRenderTarget = function (t) {
	        this.currentRenderTarget !== t && (this.currentRenderTarget = t, this.currentRenderTarget.activate(), this.stencilManager.setMaskStack(t.stencilMaskStack));
	      }, i.prototype.resize = function (t, e) {
	        n.prototype.resize.call(this, t, e), this.filterManager.resize(t, e), this.renderTarget.resize(t, e), this.currentRenderTarget === this.renderTarget && (this.renderTarget.activate(), this.gl.viewport(0, 0, this.width, this.height));
	      }, i.prototype.updateTexture = function (t) {
	        if (t = t.baseTexture || t, t.hasLoaded) {
	          var e = this.gl;return t._glTextures[e.id] || (t._glTextures[e.id] = e.createTexture(), t.on("update", this.updateTexture, this), t.on("dispose", this.destroyTexture, this)), e.bindTexture(e.TEXTURE_2D, t._glTextures[e.id]), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultipliedAlpha), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t.source), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, t.scaleMode === f.SCALE_MODES.LINEAR ? e.LINEAR : e.NEAREST), t.mipmap && t.isPowerOfTwo ? (e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, t.scaleMode === f.SCALE_MODES.LINEAR ? e.LINEAR_MIPMAP_LINEAR : e.NEAREST_MIPMAP_NEAREST), e.generateMipmap(e.TEXTURE_2D)) : e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, t.scaleMode === f.SCALE_MODES.LINEAR ? e.LINEAR : e.NEAREST), t.isPowerOfTwo ? (e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.REPEAT)) : (e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE)), t._glTextures[e.id];
	        }
	      }, i.prototype.destroyTexture = function (t) {
	        t = t.baseTexture || t, t.hasLoaded && t._glTextures[this.gl.id] && this.gl.deleteTexture(t._glTextures[this.gl.id]);
	      }, i.prototype.handleContextLost = function (t) {
	        t.preventDefault();
	      }, i.prototype.handleContextRestored = function () {
	        this._initContext();for (var t in d.BaseTextureCache) {
	          d.BaseTextureCache[t]._glTextures.length = 0;
	        }
	      }, i.prototype.destroy = function (t) {
	        this.destroyPlugins(), this.view.removeEventListener("webglcontextlost", this.handleContextLost), this.view.removeEventListener("webglcontextrestored", this.handleContextRestored), n.prototype.destroy.call(this, t), this.uid = 0, this.shaderManager.destroy(), this.maskManager.destroy(), this.stencilManager.destroy(), this.filterManager.destroy(), this.shaderManager = null, this.maskManager = null, this.filterManager = null, this.blendModeManager = null, this.handleContextLost = null, this.handleContextRestored = null, this._contextOptions = null, this.drawCount = 0, this.gl = null;
	      }, i.prototype._mapGlModes = function () {
	        var t = this.gl;this.blendModes || (this.blendModes = {}, this.blendModes[f.BLEND_MODES.NORMAL] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.ADD] = [t.SRC_ALPHA, t.DST_ALPHA], this.blendModes[f.BLEND_MODES.MULTIPLY] = [t.DST_COLOR, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.SCREEN] = [t.SRC_ALPHA, t.ONE], this.blendModes[f.BLEND_MODES.OVERLAY] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.DARKEN] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.LIGHTEN] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.COLOR_DODGE] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.COLOR_BURN] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.HARD_LIGHT] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.SOFT_LIGHT] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.DIFFERENCE] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.EXCLUSION] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.HUE] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.SATURATION] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.COLOR] = [t.ONE, t.ONE_MINUS_SRC_ALPHA], this.blendModes[f.BLEND_MODES.LUMINOSITY] = [t.ONE, t.ONE_MINUS_SRC_ALPHA]), this.drawModes || (this.drawModes = {}, this.drawModes[f.DRAW_MODES.POINTS] = t.POINTS, this.drawModes[f.DRAW_MODES.LINES] = t.LINES, this.drawModes[f.DRAW_MODES.LINE_LOOP] = t.LINE_LOOP, this.drawModes[f.DRAW_MODES.LINE_STRIP] = t.LINE_STRIP, this.drawModes[f.DRAW_MODES.TRIANGLES] = t.TRIANGLES, this.drawModes[f.DRAW_MODES.TRIANGLE_STRIP] = t.TRIANGLE_STRIP, this.drawModes[f.DRAW_MODES.TRIANGLE_FAN] = t.TRIANGLE_FAN);
	      };
	    }, { "../../const": 22, "../../utils": 76, "../SystemRenderer": 42, "./filters/FXAAFilter": 50, "./managers/BlendModeManager": 52, "./managers/FilterManager": 53, "./managers/MaskManager": 54, "./managers/ShaderManager": 55, "./managers/StencilManager": 56, "./utils/ObjectRenderer": 62, "./utils/RenderTarget": 64 }], 49: [function (t, e, r) {
	      function i(t, e, r) {
	        this.shaders = [], this.padding = 0, this.uniforms = r || {}, this.vertexSrc = t || n.defaultVertexSrc, this.fragmentSrc = e || n.defaultFragmentSrc;
	      }var n = t("../shaders/TextureShader");i.prototype.constructor = i, e.exports = i, i.prototype.getShader = function (t) {
	        var e = t.gl,
	            r = this.shaders[e.id];return r || (r = new n(t.shaderManager, this.vertexSrc, this.fragmentSrc, this.uniforms, this.attributes), this.shaders[e.id] = r), r;
	      }, i.prototype.applyFilter = function (t, e, r, i) {
	        var n = this.getShader(t);t.filterManager.applyFilter(n, e, r, i);
	      }, i.prototype.syncUniform = function (t) {
	        for (var e = 0, r = this.shaders.length; r > e; ++e) {
	          this.shaders[e].syncUniform(t);
	        }
	      };
	    }, { "../shaders/TextureShader": 61 }], 50: [function (t, e, r) {
	      function i() {
	        n.call(this, "\nprecision mediump float;\n\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform vec2 resolution;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvarying vec2 vResolution;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\n\nvoid texcoords(vec2 fragCoord, vec2 resolution,\n            out vec2 v_rgbNW, out vec2 v_rgbNE,\n            out vec2 v_rgbSW, out vec2 v_rgbSE,\n            out vec2 v_rgbM) {\n    vec2 inverseVP = 1.0 / resolution.xy;\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n   vResolution = resolution;\n\n   //compute the texture coords and send them to varyings\n   texcoords(aTextureCoord * resolution, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}\n", 'precision lowp float;\n\n\n/**\nBasic FXAA implementation based on the code on geeks3d.com with the\nmodification that the texture2DLod stuff was removed since it\'s\nunsupported by WebGL.\n\n--\n\nFrom:\nhttps://github.com/mitsuhiko/webgl-meincraft\n\nCopyright (c) 2011 by Armin Ronacher.\n\nSome rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n\n    * Redistributions in binary form must reproduce the above\n      copyright notice, this list of conditions and the following\n      disclaimer in the documentation and/or other materials provided\n      with the distribution.\n\n    * The names of the contributors may not be used to endorse or\n      promote products derived from this software without specific\n      prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n#ifndef FXAA_REDUCE_MIN\n    #define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n    #define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n    #define FXAA_SPAN_MAX     8.0\n#endif\n\n//optimized version for mobile, where dependent\n//texture reads can be a bottleneck\nvec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n            vec2 v_rgbNW, vec2 v_rgbNE,\n            vec2 v_rgbSW, vec2 v_rgbSE,\n            vec2 v_rgbM) {\n    vec4 color;\n    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n    vec4 texColor = texture2D(tex, v_rgbM);\n    vec3 rgbM  = texColor.xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    mediump vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * inverseVP;\n\n    vec3 rgbA = 0.5 * (\n        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, texColor.a);\n    else\n        color = vec4(rgbB, texColor.a);\n    return color;\n}\n\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vResolution;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nuniform sampler2D uSampler;\n\n\nvoid main(void){\n\n    gl_FragColor = fxaa(uSampler, vTextureCoord * vResolution, vResolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\n}\n', {
	          resolution: { type: "v2", value: { x: 1, y: 1 } } });
	      }var n = t("./AbstractFilter");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager,
	            n = this.getShader(t);i.applyFilter(n, e, r);
	      };
	    }, { "./AbstractFilter": 49 }], 51: [function (t, e, r) {
	      function i(t) {
	        var e = new o.Matrix();n.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform sampler2D mask;\n\nvoid main(void)\n{\n    // check clip! this will stop the mask bleeding out from the edges\n    vec2 text = abs( vMaskCoord - 0.5 );\n    text = step(0.5, text);\n    float clip = 1.0 - max(text.y, text.x);\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    original *= (masky.r * masky.a * alpha * clip);\n    gl_FragColor = original;\n}\n", { mask: { type: "sampler2D", value: t._texture }, alpha: { type: "f", value: 1 }, otherMatrix: { type: "mat3", value: e.toArray(!0) } }), this.maskSprite = t, this.maskMatrix = e;
	      }var n = t("./AbstractFilter"),
	          o = t("../../../math");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager;this.uniforms.mask.value = this.maskSprite._texture, i.calculateMappedMatrix(e.frame, this.maskSprite, this.maskMatrix), this.uniforms.otherMatrix.value = this.maskMatrix.toArray(!0), this.uniforms.alpha.value = this.maskSprite.worldAlpha;var n = this.getShader(t);i.applyFilter(n, e, r);
	      }, Object.defineProperties(i.prototype, { map: { get: function get() {
	            return this.uniforms.mask.value;
	          }, set: function set(t) {
	            this.uniforms.mask.value = t;
	          } }, offset: { get: function get() {
	            return this.uniforms.offset.value;
	          }, set: function set(t) {
	            this.uniforms.offset.value = t;
	          } } });
	    }, { "../../../math": 32, "./AbstractFilter": 49 }], 52: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.currentBlendMode = 99999;
	      }var n = t("./WebGLManager");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.setBlendMode = function (t) {
	        if (this.currentBlendMode === t) return !1;this.currentBlendMode = t;var e = this.renderer.blendModes[this.currentBlendMode];return this.renderer.gl.blendFunc(e[0], e[1]), !0;
	      };
	    }, { "./WebGLManager": 57 }], 53: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.filterStack = [], this.filterStack.push({ renderTarget: t.currentRenderTarget, filter: [], bounds: null }), this.texturePool = [], this.textureSize = new h.Rectangle(0, 0, t.width, t.height), this.currentFrame = null;
	      }var n = t("./WebGLManager"),
	          o = t("../utils/RenderTarget"),
	          s = t("../../../const"),
	          a = t("../utils/Quad"),
	          h = t("../../../math");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.onContextChange = function () {
	        this.texturePool.length = 0;var t = this.renderer.gl;this.quad = new a(t);
	      }, i.prototype.setFilterStack = function (t) {
	        this.filterStack = t;
	      }, i.prototype.pushFilter = function (t, e) {
	        var r = t.filterArea ? t.filterArea.clone() : t.getBounds();r.x = 0 | r.x, r.y = 0 | r.y, r.width = 0 | r.width, r.height = 0 | r.height;var i = 0 | e[0].padding;if (r.x -= i, r.y -= i, r.width += 2 * i, r.height += 2 * i, this.renderer.currentRenderTarget.transform) {
	          var n = this.renderer.currentRenderTarget.transform;r.x += n.tx, r.y += n.ty, this.capFilterArea(r), r.x -= n.tx, r.y -= n.ty;
	        } else this.capFilterArea(r);if (r.width > 0 && r.height > 0) {
	          this.currentFrame = r;var o = this.getRenderTarget();this.renderer.setRenderTarget(o), o.clear(), this.filterStack.push({ renderTarget: o, filter: e });
	        } else this.filterStack.push({ renderTarget: null, filter: e });
	      }, i.prototype.popFilter = function () {
	        var t = this.filterStack.pop(),
	            e = this.filterStack[this.filterStack.length - 1],
	            r = t.renderTarget;if (t.renderTarget) {
	          var i = e.renderTarget,
	              n = this.renderer.gl;this.currentFrame = r.frame, this.quad.map(this.textureSize, r.frame), n.bindBuffer(n.ARRAY_BUFFER, this.quad.vertexBuffer), n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);var o = t.filter;if (n.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aVertexPosition, 2, n.FLOAT, !1, 0, 0), n.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aTextureCoord, 2, n.FLOAT, !1, 0, 32), n.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aColor, 4, n.FLOAT, !1, 0, 64), this.renderer.blendModeManager.setBlendMode(s.BLEND_MODES.NORMAL), 1 === o.length) o[0].uniforms.dimensions && (o[0].uniforms.dimensions.value[0] = this.renderer.width, o[0].uniforms.dimensions.value[1] = this.renderer.height, o[0].uniforms.dimensions.value[2] = this.quad.vertices[0], o[0].uniforms.dimensions.value[3] = this.quad.vertices[5]), o[0].applyFilter(this.renderer, r, i), this.returnRenderTarget(r);else {
	            for (var a = r, h = this.getRenderTarget(!0), l = 0; l < o.length - 1; l++) {
	              var u = o[l];u.uniforms.dimensions && (u.uniforms.dimensions.value[0] = this.renderer.width, u.uniforms.dimensions.value[1] = this.renderer.height, u.uniforms.dimensions.value[2] = this.quad.vertices[0], u.uniforms.dimensions.value[3] = this.quad.vertices[5]), u.applyFilter(this.renderer, a, h);var c = a;a = h, h = c;
	            }o[o.length - 1].applyFilter(this.renderer, a, i), this.returnRenderTarget(a), this.returnRenderTarget(h);
	          }return t.filter;
	        }
	      }, i.prototype.getRenderTarget = function (t) {
	        var e = this.texturePool.pop() || new o(this.renderer.gl, this.textureSize.width, this.textureSize.height, s.SCALE_MODES.LINEAR, this.renderer.resolution * s.FILTER_RESOLUTION);return e.frame = this.currentFrame, t && e.clear(!0), e;
	      }, i.prototype.returnRenderTarget = function (t) {
	        this.texturePool.push(t);
	      }, i.prototype.applyFilter = function (t, e, r, i) {
	        var n = this.renderer.gl;this.renderer.setRenderTarget(r), i && r.clear(), this.renderer.shaderManager.setShader(t), t.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(!0), t.syncUniforms(), n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, e.texture), n.drawElements(n.TRIANGLES, 6, n.UNSIGNED_SHORT, 0);
	      }, i.prototype.calculateMappedMatrix = function (t, e, r) {
	        var i = e.worldTransform.copy(h.Matrix.TEMP_MATRIX),
	            n = e._texture.baseTexture,
	            o = r.identity(),
	            s = this.textureSize.height / this.textureSize.width;o.translate(t.x / this.textureSize.width, t.y / this.textureSize.height), o.scale(1, s);var a = this.textureSize.width / n.width,
	            l = this.textureSize.height / n.height;return i.tx /= n.width * a, i.ty /= n.width * a, i.invert(), o.prepend(i), o.scale(1, 1 / s), o.scale(a, l), o.translate(e.anchor.x, e.anchor.y), o;
	      }, i.prototype.capFilterArea = function (t) {
	        t.x < 0 && (t.width += t.x, t.x = 0), t.y < 0 && (t.height += t.y, t.y = 0), t.x + t.width > this.textureSize.width && (t.width = this.textureSize.width - t.x), t.y + t.height > this.textureSize.height && (t.height = this.textureSize.height - t.y);
	      }, i.prototype.resize = function (t, e) {
	        this.textureSize.width = t, this.textureSize.height = e;for (var r = 0; r < this.texturePool.length; r++) {
	          this.texturePool[r].resize(t, e);
	        }
	      }, i.prototype.destroy = function () {
	        this.filterStack = null, this.offsetY = 0;for (var t = 0; t < this.texturePool.length; t++) {
	          this.texturePool[t].destroy();
	        }this.texturePool = null;
	      };
	    }, { "../../../const": 22, "../../../math": 32, "../utils/Quad": 63, "../utils/RenderTarget": 64, "./WebGLManager": 57 }], 54: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.stencilStack = [], this.reverse = !0, this.count = 0, this.alphaMaskPool = [];
	      }var n = t("./WebGLManager"),
	          o = t("../filters/SpriteMaskFilter");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.pushMask = function (t, e) {
	        e.texture ? this.pushSpriteMask(t, e) : this.pushStencilMask(t, e);
	      }, i.prototype.popMask = function (t, e) {
	        e.texture ? this.popSpriteMask(t, e) : this.popStencilMask(t, e);
	      }, i.prototype.pushSpriteMask = function (t, e) {
	        var r = this.alphaMaskPool.pop();r || (r = [new o(e)]), r[0].maskSprite = e, this.renderer.filterManager.pushFilter(t, r);
	      }, i.prototype.popSpriteMask = function () {
	        var t = this.renderer.filterManager.popFilter();this.alphaMaskPool.push(t);
	      }, i.prototype.pushStencilMask = function (t, e) {
	        this.renderer.stencilManager.pushMask(e);
	      }, i.prototype.popStencilMask = function (t, e) {
	        this.renderer.stencilManager.popMask(e);
	      };
	    }, { "../filters/SpriteMaskFilter": 51, "./WebGLManager": 57 }], 55: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.maxAttibs = 10, this.attribState = [], this.tempAttribState = [];for (var e = 0; e < this.maxAttibs; e++) {
	          this.attribState[e] = !1;
	        }this.stack = [], this._currentId = -1, this.currentShader = null;
	      }var n = t("./WebGLManager"),
	          o = t("../shaders/TextureShader"),
	          s = t("../shaders/ComplexPrimitiveShader"),
	          a = t("../shaders/PrimitiveShader"),
	          h = t("../../../utils");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, h.pluginTarget.mixin(i), e.exports = i, i.prototype.onContextChange = function () {
	        this.initPlugins();var t = this.renderer.gl;this.maxAttibs = t.getParameter(t.MAX_VERTEX_ATTRIBS), this.attribState = [];for (var e = 0; e < this.maxAttibs; e++) {
	          this.attribState[e] = !1;
	        }this.defaultShader = new o(this), this.primitiveShader = new a(this), this.complexPrimitiveShader = new s(this);
	      }, i.prototype.setAttribs = function (t) {
	        var e;for (e = 0; e < this.tempAttribState.length; e++) {
	          this.tempAttribState[e] = !1;
	        }for (var r in t) {
	          this.tempAttribState[t[r]] = !0;
	        }var i = this.renderer.gl;for (e = 0; e < this.attribState.length; e++) {
	          this.attribState[e] !== this.tempAttribState[e] && (this.attribState[e] = this.tempAttribState[e], this.attribState[e] ? i.enableVertexAttribArray(e) : i.disableVertexAttribArray(e));
	        }
	      }, i.prototype.setShader = function (t) {
	        return this._currentId === t.uid ? !1 : (this._currentId = t.uid, this.currentShader = t, this.renderer.gl.useProgram(t.program), this.setAttribs(t.attributes), !0);
	      }, i.prototype.destroy = function () {
	        n.prototype.destroy.call(this), this.destroyPlugins(), this.attribState = null, this.tempAttribState = null;
	      };
	    }, { "../../../utils": 76, "../shaders/ComplexPrimitiveShader": 58, "../shaders/PrimitiveShader": 59, "../shaders/TextureShader": 61, "./WebGLManager": 57 }], 56: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.stencilMaskStack = null;
	      }var n = t("./WebGLManager"),
	          o = t("../../../utils");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.setMaskStack = function (t) {
	        this.stencilMaskStack = t;var e = this.renderer.gl;0 === t.stencilStack.length ? e.disable(e.STENCIL_TEST) : e.enable(e.STENCIL_TEST);
	      }, i.prototype.pushStencil = function (t, e) {
	        this.renderer.currentRenderTarget.attachStencilBuffer();var r = this.renderer.gl,
	            i = this.stencilMaskStack;this.bindGraphics(t, e, this.renderer), 0 === i.stencilStack.length && (r.enable(r.STENCIL_TEST), r.clear(r.STENCIL_BUFFER_BIT), i.reverse = !0, i.count = 0), i.stencilStack.push(e);var n = i.count;r.colorMask(!1, !1, !1, !1), r.stencilFunc(r.ALWAYS, 0, 255), r.stencilOp(r.KEEP, r.KEEP, r.INVERT), 1 === e.mode ? (r.drawElements(r.TRIANGLE_FAN, e.indices.length - 4, r.UNSIGNED_SHORT, 0), i.reverse ? (r.stencilFunc(r.EQUAL, 255 - n, 255), r.stencilOp(r.KEEP, r.KEEP, r.DECR)) : (r.stencilFunc(r.EQUAL, n, 255), r.stencilOp(r.KEEP, r.KEEP, r.INCR)), r.drawElements(r.TRIANGLE_FAN, 4, r.UNSIGNED_SHORT, 2 * (e.indices.length - 4)), i.reverse ? r.stencilFunc(r.EQUAL, 255 - (n + 1), 255) : r.stencilFunc(r.EQUAL, n + 1, 255), i.reverse = !i.reverse) : (i.reverse ? (r.stencilFunc(r.EQUAL, n, 255), r.stencilOp(r.KEEP, r.KEEP, r.INCR)) : (r.stencilFunc(r.EQUAL, 255 - n, 255), r.stencilOp(r.KEEP, r.KEEP, r.DECR)), r.drawElements(r.TRIANGLE_STRIP, e.indices.length, r.UNSIGNED_SHORT, 0), i.reverse ? r.stencilFunc(r.EQUAL, n + 1, 255) : r.stencilFunc(r.EQUAL, 255 - (n + 1), 255)), r.colorMask(!0, !0, !0, !0), r.stencilOp(r.KEEP, r.KEEP, r.KEEP), i.count++;
	      }, i.prototype.bindGraphics = function (t, e) {
	        this._currentGraphics = t;var r,
	            i = this.renderer.gl;1 === e.mode ? (r = this.renderer.shaderManager.complexPrimitiveShader, this.renderer.shaderManager.setShader(r), i.uniformMatrix3fv(r.uniforms.translationMatrix._location, !1, t.worldTransform.toArray(!0)), i.uniformMatrix3fv(r.uniforms.projectionMatrix._location, !1, this.renderer.currentRenderTarget.projectionMatrix.toArray(!0)), i.uniform3fv(r.uniforms.tint._location, o.hex2rgb(t.tint)), i.uniform3fv(r.uniforms.color._location, e.color), i.uniform1f(r.uniforms.alpha._location, t.worldAlpha), i.bindBuffer(i.ARRAY_BUFFER, e.buffer), i.vertexAttribPointer(r.attributes.aVertexPosition, 2, i.FLOAT, !1, 8, 0), i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.indexBuffer)) : (r = this.renderer.shaderManager.primitiveShader, this.renderer.shaderManager.setShader(r), i.uniformMatrix3fv(r.uniforms.translationMatrix._location, !1, t.worldTransform.toArray(!0)), i.uniformMatrix3fv(r.uniforms.projectionMatrix._location, !1, this.renderer.currentRenderTarget.projectionMatrix.toArray(!0)), i.uniform3fv(r.uniforms.tint._location, o.hex2rgb(t.tint)), i.uniform1f(r.uniforms.alpha._location, t.worldAlpha), i.bindBuffer(i.ARRAY_BUFFER, e.buffer), i.vertexAttribPointer(r.attributes.aVertexPosition, 2, i.FLOAT, !1, 24, 0), i.vertexAttribPointer(r.attributes.aColor, 4, i.FLOAT, !1, 24, 8), i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.indexBuffer));
	      }, i.prototype.popStencil = function (t, e) {
	        var r = this.renderer.gl,
	            i = this.stencilMaskStack;if (i.stencilStack.pop(), i.count--, 0 === i.stencilStack.length) r.disable(r.STENCIL_TEST);else {
	          var n = i.count;this.bindGraphics(t, e, this.renderer), r.colorMask(!1, !1, !1, !1), 1 === e.mode ? (i.reverse = !i.reverse, i.reverse ? (r.stencilFunc(r.EQUAL, 255 - (n + 1), 255), r.stencilOp(r.KEEP, r.KEEP, r.INCR)) : (r.stencilFunc(r.EQUAL, n + 1, 255), r.stencilOp(r.KEEP, r.KEEP, r.DECR)), r.drawElements(r.TRIANGLE_FAN, 4, r.UNSIGNED_SHORT, 2 * (e.indices.length - 4)), r.stencilFunc(r.ALWAYS, 0, 255), r.stencilOp(r.KEEP, r.KEEP, r.INVERT), r.drawElements(r.TRIANGLE_FAN, e.indices.length - 4, r.UNSIGNED_SHORT, 0), i.reverse ? r.stencilFunc(r.EQUAL, n, 255) : r.stencilFunc(r.EQUAL, 255 - n, 255)) : (i.reverse ? (r.stencilFunc(r.EQUAL, n + 1, 255), r.stencilOp(r.KEEP, r.KEEP, r.DECR)) : (r.stencilFunc(r.EQUAL, 255 - (n + 1), 255), r.stencilOp(r.KEEP, r.KEEP, r.INCR)), r.drawElements(r.TRIANGLE_STRIP, e.indices.length, r.UNSIGNED_SHORT, 0), i.reverse ? r.stencilFunc(r.EQUAL, n, 255) : r.stencilFunc(r.EQUAL, 255 - n, 255)), r.colorMask(!0, !0, !0, !0), r.stencilOp(r.KEEP, r.KEEP, r.KEEP);
	        }
	      }, i.prototype.destroy = function () {
	        n.prototype.destroy.call(this), this.stencilMaskStack.stencilStack = null;
	      }, i.prototype.pushMask = function (t) {
	        this.renderer.setObjectRenderer(this.renderer.plugins.graphics), t.dirty && this.renderer.plugins.graphics.updateGraphics(t, this.renderer.gl), t._webGL[this.renderer.gl.id].data.length && this.pushStencil(t, t._webGL[this.renderer.gl.id].data[0], this.renderer);
	      }, i.prototype.popMask = function (t) {
	        this.renderer.setObjectRenderer(this.renderer.plugins.graphics), this.popStencil(t, t._webGL[this.renderer.gl.id].data[0], this.renderer);
	      };
	    }, { "../../../utils": 76, "./WebGLManager": 57 }], 57: [function (t, e, r) {
	      function i(t) {
	        this.renderer = t, this.renderer.on("context", this.onContextChange, this);
	      }i.prototype.constructor = i, e.exports = i, i.prototype.onContextChange = function () {}, i.prototype.destroy = function () {
	        this.renderer.off("context", this.onContextChange, this), this.renderer = null;
	      };
	    }, {}], 58: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t, ["attribute vec2 aVertexPosition;", "uniform mat3 translationMatrix;", "uniform mat3 projectionMatrix;", "uniform vec3 tint;", "uniform float alpha;", "uniform vec3 color;", "varying vec4 vColor;", "void main(void){", "   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);", "   vColor = vec4(color * alpha * tint, alpha);", "}"].join("\n"), ["precision mediump float;", "varying vec4 vColor;", "void main(void){", "   gl_FragColor = vColor;", "}"].join("\n"), { tint: { type: "3f", value: [0, 0, 0] }, alpha: { type: "1f", value: 0 }, color: { type: "3f", value: [0, 0, 0] }, translationMatrix: { type: "mat3", value: new Float32Array(9) }, projectionMatrix: { type: "mat3", value: new Float32Array(9) } }, { aVertexPosition: 0 });
	      }var n = t("./Shader");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i;
	    }, { "./Shader": 60 }], 59: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t, ["attribute vec2 aVertexPosition;", "attribute vec4 aColor;", "uniform mat3 translationMatrix;", "uniform mat3 projectionMatrix;", "uniform float alpha;", "uniform float flipY;", "uniform vec3 tint;", "varying vec4 vColor;", "void main(void){", "   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);", "   vColor = aColor * vec4(tint * alpha, alpha);", "}"].join("\n"), ["precision mediump float;", "varying vec4 vColor;", "void main(void){", "   gl_FragColor = vColor;", "}"].join("\n"), { tint: { type: "3f", value: [0, 0, 0] }, alpha: { type: "1f", value: 0 }, translationMatrix: { type: "mat3", value: new Float32Array(9) }, projectionMatrix: { type: "mat3", value: new Float32Array(9) } }, { aVertexPosition: 0, aColor: 0 });
	      }var n = t("./Shader");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i;
	    }, { "./Shader": 60 }], 60: [function (t, e, r) {
	      function i(t, e, r, i, o) {
	        if (!e || !r) throw new Error("Pixi.js Error. Shader requires vertexSrc and fragmentSrc");this.uid = n.uid(), this.gl = t.renderer.gl, this.shaderManager = t, this.program = null, this.uniforms = i || {}, this.attributes = o || {}, this.textureCount = 1, this.vertexSrc = e, this.fragmentSrc = r, this.init();
	      }var n = t("../../../utils");i.prototype.constructor = i, e.exports = i, i.prototype.init = function () {
	        this.compile(), this.gl.useProgram(this.program), this.cacheUniformLocations(Object.keys(this.uniforms)), this.cacheAttributeLocations(Object.keys(this.attributes));
	      }, i.prototype.cacheUniformLocations = function (t) {
	        for (var e = 0; e < t.length; ++e) {
	          this.uniforms[t[e]]._location = this.gl.getUniformLocation(this.program, t[e]);
	        }
	      }, i.prototype.cacheAttributeLocations = function (t) {
	        for (var e = 0; e < t.length; ++e) {
	          this.attributes[t[e]] = this.gl.getAttribLocation(this.program, t[e]);
	        }
	      }, i.prototype.compile = function () {
	        var t = this.gl,
	            e = this._glCompile(t.VERTEX_SHADER, this.vertexSrc),
	            r = this._glCompile(t.FRAGMENT_SHADER, this.fragmentSrc),
	            i = t.createProgram();return t.attachShader(i, e), t.attachShader(i, r), t.linkProgram(i), t.getProgramParameter(i, t.LINK_STATUS) || (console.error("Pixi.js Error: Could not initialize shader."), console.error("gl.VALIDATE_STATUS", t.getProgramParameter(i, t.VALIDATE_STATUS)), console.error("gl.getError()", t.getError()), "" !== t.getProgramInfoLog(i) && console.warn("Pixi.js Warning: gl.getProgramInfoLog()", t.getProgramInfoLog(i)), t.deleteProgram(i), i = null), t.deleteShader(e), t.deleteShader(r), this.program = i;
	      }, i.prototype.syncUniform = function (t) {
	        var e,
	            r,
	            i = t._location,
	            o = t.value,
	            s = this.gl;switch (t.type) {case "b":case "bool":case "boolean":
	            s.uniform1i(i, o ? 1 : 0);break;case "i":case "1i":
	            s.uniform1i(i, o);break;case "f":case "1f":
	            s.uniform1f(i, o);break;case "2f":
	            s.uniform2f(i, o[0], o[1]);break;case "3f":
	            s.uniform3f(i, o[0], o[1], o[2]);break;case "4f":
	            s.uniform4f(i, o[0], o[1], o[2], o[3]);break;case "v2":
	            s.uniform2f(i, o.x, o.y);break;case "v3":
	            s.uniform3f(i, o.x, o.y, o.z);break;case "v4":
	            s.uniform4f(i, o.x, o.y, o.z, o.w);break;case "1iv":
	            s.uniform1iv(i, o);break;case "2iv":
	            s.uniform2iv(i, o);break;case "3iv":
	            s.uniform3iv(i, o);break;case "4iv":
	            s.uniform4iv(i, o);break;case "1fv":
	            s.uniform1fv(i, o);break;case "2fv":
	            s.uniform2fv(i, o);break;case "3fv":
	            s.uniform3fv(i, o);break;case "4fv":
	            s.uniform4fv(i, o);break;case "m2":case "mat2":case "Matrix2fv":
	            s.uniformMatrix2fv(i, t.transpose, o);break;case "m3":case "mat3":case "Matrix3fv":
	            s.uniformMatrix3fv(i, t.transpose, o);break;case "m4":case "mat4":case "Matrix4fv":
	            s.uniformMatrix4fv(i, t.transpose, o);break;case "c":
	            "number" == typeof o && (o = n.hex2rgb(o)), s.uniform3f(i, o[0], o[1], o[2]);break;case "iv1":
	            s.uniform1iv(i, o);break;case "iv":
	            s.uniform3iv(i, o);break;case "fv1":
	            s.uniform1fv(i, o);break;case "fv":
	            s.uniform3fv(i, o);break;case "v2v":
	            for (t._array || (t._array = new Float32Array(2 * o.length)), e = 0, r = o.length; r > e; ++e) {
	              t._array[2 * e] = o[e].x, t._array[2 * e + 1] = o[e].y;
	            }s.uniform2fv(i, t._array);break;case "v3v":
	            for (t._array || (t._array = new Float32Array(3 * o.length)), e = 0, r = o.length; r > e; ++e) {
	              t._array[3 * e] = o[e].x, t._array[3 * e + 1] = o[e].y, t._array[3 * e + 2] = o[e].z;
	            }s.uniform3fv(i, t._array);break;case "v4v":
	            for (t._array || (t._array = new Float32Array(4 * o.length)), e = 0, r = o.length; r > e; ++e) {
	              t._array[4 * e] = o[e].x, t._array[4 * e + 1] = o[e].y, t._array[4 * e + 2] = o[e].z, t._array[4 * e + 3] = o[e].w;
	            }s.uniform4fv(i, t._array);break;case "t":case "sampler2D":
	            if (!t.value || !t.value.baseTexture.hasLoaded) break;s.activeTexture(s["TEXTURE" + this.textureCount]);var a = t.value.baseTexture._glTextures[s.id];a || (this.initSampler2D(t), a = t.value.baseTexture._glTextures[s.id]), s.bindTexture(s.TEXTURE_2D, a), s.uniform1i(t._location, this.textureCount), this.textureCount++;break;default:
	            console.warn("Pixi.js Shader Warning: Unknown uniform type: " + t.type);}
	      }, i.prototype.syncUniforms = function () {
	        this.textureCount = 1;for (var t in this.uniforms) {
	          this.syncUniform(this.uniforms[t]);
	        }
	      }, i.prototype.initSampler2D = function (t) {
	        var e = this.gl,
	            r = t.value.baseTexture;if (r.hasLoaded) if (t.textureData) {
	          var i = t.textureData;r._glTextures[e.id] = e.createTexture(), e.bindTexture(e.TEXTURE_2D, r._glTextures[e.id]), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, r.premultipliedAlpha), e.texImage2D(e.TEXTURE_2D, 0, i.luminance ? e.LUMINANCE : e.RGBA, e.RGBA, e.UNSIGNED_BYTE, r.source), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, i.magFilter ? i.magFilter : e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, i.wrapS ? i.wrapS : e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, i.wrapS ? i.wrapS : e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, i.wrapT ? i.wrapT : e.CLAMP_TO_EDGE);
	        } else this.shaderManager.renderer.updateTexture(r);
	      }, i.prototype.destroy = function () {
	        this.gl.deleteProgram(this.program), this.gl = null, this.uniforms = null, this.attributes = null, this.vertexSrc = null, this.fragmentSrc = null;
	      }, i.prototype._glCompile = function (t, e) {
	        var r = this.gl.createShader(t);return this.gl.shaderSource(r, e), this.gl.compileShader(r), this.gl.getShaderParameter(r, this.gl.COMPILE_STATUS) ? r : (console.log(this.gl.getShaderInfoLog(r)), null);
	      };
	    }, { "../../../utils": 76 }], 61: [function (t, e, r) {
	      function i(t, e, r, o, s) {
	        var a = { uSampler: { type: "sampler2D", value: 0 }, projectionMatrix: { type: "mat3", value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) } };if (o) for (var h in o) {
	          a[h] = o[h];
	        }var l = { aVertexPosition: 0, aTextureCoord: 0, aColor: 0 };if (s) for (var u in s) {
	          l[u] = s[u];
	        }e = e || i.defaultVertexSrc, r = r || i.defaultFragmentSrc, n.call(this, t, e, r, a, l);
	      }var n = t("./Shader");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.defaultVertexSrc = ["precision lowp float;", "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec4 aColor;", "uniform mat3 projectionMatrix;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "void main(void){", "   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = vec4(aColor.rgb * aColor.a, aColor.a);", "}"].join("\n"), i.defaultFragmentSrc = ["precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void){", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}"].join("\n");
	    }, { "./Shader": 60 }], 62: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t);
	      }var n = t("../managers/WebGLManager");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.start = function () {}, i.prototype.stop = function () {
	        this.flush();
	      }, i.prototype.flush = function () {}, i.prototype.render = function (t) {};
	    }, { "../managers/WebGLManager": 57 }], 63: [function (t, e, r) {
	      function i(t) {
	        this.gl = t, this.vertices = new Float32Array([0, 0, 200, 0, 200, 200, 0, 200]), this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), this.colors = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), this.indices = new Uint16Array([0, 1, 2, 0, 3, 2]), this.vertexBuffer = t.createBuffer(), this.indexBuffer = t.createBuffer(), t.bindBuffer(t.ARRAY_BUFFER, this.vertexBuffer), t.bufferData(t.ARRAY_BUFFER, 128, t.DYNAMIC_DRAW), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, this.indices, t.STATIC_DRAW), this.upload();
	      }i.prototype.constructor = i, i.prototype.map = function (t, e) {
	        var r = 0,
	            i = 0;this.uvs[0] = r, this.uvs[1] = i, this.uvs[2] = r + e.width / t.width, this.uvs[3] = i, this.uvs[4] = r + e.width / t.width, this.uvs[5] = i + e.height / t.height, this.uvs[6] = r, this.uvs[7] = i + e.height / t.height, r = e.x, i = e.y, this.vertices[0] = r, this.vertices[1] = i, this.vertices[2] = r + e.width, this.vertices[3] = i, this.vertices[4] = r + e.width, this.vertices[5] = i + e.height, this.vertices[6] = r, this.vertices[7] = i + e.height, this.upload();
	      }, i.prototype.upload = function () {
	        var t = this.gl;t.bindBuffer(t.ARRAY_BUFFER, this.vertexBuffer), t.bufferSubData(t.ARRAY_BUFFER, 0, this.vertices), t.bufferSubData(t.ARRAY_BUFFER, 32, this.uvs), t.bufferSubData(t.ARRAY_BUFFER, 64, this.colors);
	      }, e.exports = i;
	    }, {}], 64: [function (t, e, r) {
	      var i = t("../../../math"),
	          n = t("../../../utils"),
	          o = t("../../../const"),
	          s = t("./StencilMaskStack"),
	          a = function a(t, e, r, _a, h, l) {
	        if (this.gl = t, this.frameBuffer = null, this.texture = null, this.size = new i.Rectangle(0, 0, 1, 1), this.resolution = h || o.RESOLUTION, this.projectionMatrix = new i.Matrix(), this.transform = null, this.frame = null, this.stencilBuffer = null, this.stencilMaskStack = new s(), this.filterStack = [{ renderTarget: this, filter: [], bounds: this.size }], this.scaleMode = _a || o.SCALE_MODES.DEFAULT, this.root = l, !this.root) {
	          this.frameBuffer = t.createFramebuffer(), this.texture = t.createTexture(), t.bindTexture(t.TEXTURE_2D, this.texture), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, _a === o.SCALE_MODES.LINEAR ? t.LINEAR : t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, _a === o.SCALE_MODES.LINEAR ? t.LINEAR : t.NEAREST);var u = n.isPowerOfTwo(e, r);u ? (t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.REPEAT), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.REPEAT)) : (t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE)), t.bindFramebuffer(t.FRAMEBUFFER, this.frameBuffer), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, this.texture, 0);
	        }this.resize(e, r);
	      };a.prototype.constructor = a, e.exports = a, a.prototype.clear = function (t) {
	        var e = this.gl;t && e.bindFramebuffer(e.FRAMEBUFFER, this.frameBuffer), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT);
	      }, a.prototype.attachStencilBuffer = function () {
	        if (!this.stencilBuffer && !this.root) {
	          var t = this.gl;this.stencilBuffer = t.createRenderbuffer(), t.bindRenderbuffer(t.RENDERBUFFER, this.stencilBuffer), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_STENCIL_ATTACHMENT, t.RENDERBUFFER, this.stencilBuffer), t.renderbufferStorage(t.RENDERBUFFER, t.DEPTH_STENCIL, this.size.width * this.resolution, this.size.height * this.resolution);
	        }
	      }, a.prototype.activate = function () {
	        var t = this.gl;t.bindFramebuffer(t.FRAMEBUFFER, this.frameBuffer);var e = this.frame || this.size;this.calculateProjection(e), this.transform && this.projectionMatrix.append(this.transform), t.viewport(0, 0, e.width * this.resolution, e.height * this.resolution);
	      }, a.prototype.calculateProjection = function (t) {
	        var e = this.projectionMatrix;e.identity(), this.root ? (e.a = 1 / t.width * 2, e.d = -1 / t.height * 2, e.tx = -1 - t.x * e.a, e.ty = 1 - t.y * e.d) : (e.a = 1 / t.width * 2, e.d = 1 / t.height * 2, e.tx = -1 - t.x * e.a, e.ty = -1 - t.y * e.d);
	      }, a.prototype.resize = function (t, e) {
	        if (t = 0 | t, e = 0 | e, this.size.width !== t || this.size.height !== e) {
	          if (this.size.width = t, this.size.height = e, !this.root) {
	            var r = this.gl;r.bindTexture(r.TEXTURE_2D, this.texture), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, t * this.resolution, e * this.resolution, 0, r.RGBA, r.UNSIGNED_BYTE, null), this.stencilBuffer && (r.bindRenderbuffer(r.RENDERBUFFER, this.stencilBuffer), r.renderbufferStorage(r.RENDERBUFFER, r.DEPTH_STENCIL, t * this.resolution, e * this.resolution));
	          }var i = this.frame || this.size;this.calculateProjection(i);
	        }
	      }, a.prototype.destroy = function () {
	        var t = this.gl;t.deleteFramebuffer(this.frameBuffer), t.deleteTexture(this.texture), this.frameBuffer = null, this.texture = null;
	      };
	    }, { "../../../const": 22, "../../../math": 32, "../../../utils": 76, "./StencilMaskStack": 65 }], 65: [function (t, e, r) {
	      function i() {
	        this.stencilStack = [], this.reverse = !0, this.count = 0;
	      }i.prototype.constructor = i, e.exports = i;
	    }, {}], 66: [function (t, e, r) {
	      function i(t) {
	        s.call(this), this.anchor = new n.Point(), this._texture = null, this._width = 0, this._height = 0, this.tint = 16777215, this.blendMode = l.BLEND_MODES.NORMAL, this.shader = null, this.cachedTint = 16777215, this.texture = t || o.EMPTY;
	      }var n = t("../math"),
	          o = t("../textures/Texture"),
	          s = t("../display/Container"),
	          a = t("../renderers/canvas/utils/CanvasTinter"),
	          h = t("../utils"),
	          l = t("../const"),
	          u = new n.Point();i.prototype = Object.create(s.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { width: { get: function get() {
	            return this.scale.x * this.texture._frame.width;
	          }, set: function set(t) {
	            this.scale.x = t / this.texture._frame.width, this._width = t;
	          } }, height: { get: function get() {
	            return this.scale.y * this.texture._frame.height;
	          }, set: function set(t) {
	            this.scale.y = t / this.texture._frame.height, this._height = t;
	          } }, texture: { get: function get() {
	            return this._texture;
	          }, set: function set(t) {
	            this._texture !== t && (this._texture = t, this.cachedTint = 16777215, t && (t.baseTexture.hasLoaded ? this._onTextureUpdate() : t.once("update", this._onTextureUpdate, this)));
	          } } }), i.prototype._onTextureUpdate = function () {
	        this._width && (this.scale.x = this._width / this.texture.frame.width), this._height && (this.scale.y = this._height / this.texture.frame.height);
	      }, i.prototype._renderWebGL = function (t) {
	        t.setObjectRenderer(t.plugins.sprite), t.plugins.sprite.render(this);
	      }, i.prototype.getBounds = function (t) {
	        if (!this._currentBounds) {
	          var e,
	              r,
	              i,
	              n,
	              o = this._texture._frame.width,
	              s = this._texture._frame.height,
	              a = o * (1 - this.anchor.x),
	              h = o * -this.anchor.x,
	              l = s * (1 - this.anchor.y),
	              u = s * -this.anchor.y,
	              c = t || this.worldTransform,
	              p = c.a,
	              d = c.b,
	              f = c.c,
	              v = c.d,
	              g = c.tx,
	              m = c.ty;if (0 === d && 0 === f) 0 > p && (p *= -1), 0 > v && (v *= -1), e = p * h + g, r = p * a + g, i = v * u + m, n = v * l + m;else {
	            var y = p * h + f * u + g,
	                x = v * u + d * h + m,
	                b = p * a + f * u + g,
	                _ = v * u + d * a + m,
	                T = p * a + f * l + g,
	                E = v * l + d * a + m,
	                S = p * h + f * l + g,
	                A = v * l + d * h + m;e = y, e = e > b ? b : e, e = e > T ? T : e, e = e > S ? S : e, i = x, i = i > _ ? _ : i, i = i > E ? E : i, i = i > A ? A : i, r = y, r = b > r ? b : r, r = T > r ? T : r, r = S > r ? S : r, n = x, n = _ > n ? _ : n, n = E > n ? E : n, n = A > n ? A : n;
	          }if (this.children.length) {
	            var w = this.containerGetBounds();a = w.x, h = w.x + w.width, l = w.y, u = w.y + w.height, e = a > e ? e : a, i = l > i ? i : l, r = r > h ? r : h, n = n > u ? n : u;
	          }var C = this._bounds;C.x = e, C.width = r - e, C.y = i, C.height = n - i, this._currentBounds = C;
	        }return this._currentBounds;
	      }, i.prototype.getLocalBounds = function () {
	        return this._bounds.x = -this._texture._frame.width * this.anchor.x, this._bounds.y = -this._texture._frame.height * this.anchor.y, this._bounds.width = this._texture._frame.width, this._bounds.height = this._texture._frame.height, this._bounds;
	      }, i.prototype.containsPoint = function (t) {
	        this.worldTransform.applyInverse(t, u);var e,
	            r = this._texture._frame.width,
	            i = this._texture._frame.height,
	            n = -r * this.anchor.x;return u.x > n && u.x < n + r && (e = -i * this.anchor.y, u.y > e && u.y < e + i) ? !0 : !1;
	      }, i.prototype._renderCanvas = function (t) {
	        if (!(this.texture.crop.width <= 0 || this.texture.crop.height <= 0) && (this.blendMode !== t.currentBlendMode && (t.currentBlendMode = this.blendMode, t.context.globalCompositeOperation = t.blendModes[t.currentBlendMode]), this.texture.valid)) {
	          var e,
	              r,
	              i,
	              n,
	              o = this._texture,
	              s = this.worldTransform;if (t.context.globalAlpha = this.worldAlpha, t.smoothProperty && t.currentScaleMode !== o.baseTexture.scaleMode && (t.currentScaleMode = o.baseTexture.scaleMode, t.context[t.smoothProperty] = t.currentScaleMode === l.SCALE_MODES.LINEAR), o.rotate) {
	            var h = s.a,
	                u = s.b;s.a = -s.c, s.b = -s.d, s.c = h, s.d = u, i = o.crop.height, n = o.crop.width, e = o.trim ? o.trim.y - this.anchor.y * o.trim.height : this.anchor.y * -o._frame.height, r = o.trim ? o.trim.x - this.anchor.x * o.trim.width : this.anchor.x * -o._frame.width;
	          } else i = o.crop.width, n = o.crop.height, e = o.trim ? o.trim.x - this.anchor.x * o.trim.width : this.anchor.x * -o._frame.width, r = o.trim ? o.trim.y - this.anchor.y * o.trim.height : this.anchor.y * -o._frame.height;t.roundPixels ? (t.context.setTransform(s.a, s.b, s.c, s.d, s.tx * t.resolution | 0, s.ty * t.resolution | 0), e = 0 | e, r = 0 | r) : t.context.setTransform(s.a, s.b, s.c, s.d, s.tx * t.resolution, s.ty * t.resolution);var c = o.baseTexture.resolution;16777215 !== this.tint ? (this.cachedTint !== this.tint && (this.cachedTint = this.tint, this.tintedTexture = a.getTintedTexture(this, this.tint)), t.context.drawImage(this.tintedTexture, 0, 0, i * c, n * c, e * t.resolution, r * t.resolution, i * t.resolution, n * t.resolution)) : t.context.drawImage(o.baseTexture.source, o.crop.x * c, o.crop.y * c, i * c, n * c, e * t.resolution, r * t.resolution, i * t.resolution, n * t.resolution);
	        }
	      }, i.prototype.destroy = function (t, e) {
	        s.prototype.destroy.call(this), this.anchor = null, t && this._texture.destroy(e), this._texture = null, this.shader = null;
	      }, i.fromFrame = function (t) {
	        var e = h.TextureCache[t];if (!e) throw new Error('The frameId "' + t + '" does not exist in the texture cache');
	
	        return new i(e);
	      }, i.fromImage = function (t, e, r) {
	        return new i(o.fromImage(t, e, r));
	      };
	    }, { "../const": 22, "../display/Container": 23, "../math": 32, "../renderers/canvas/utils/CanvasTinter": 47, "../textures/Texture": 71, "../utils": 76 }], 67: [function (t, e, r) {
	      function i(t) {
	        n.call(this, t), this.vertSize = 5, this.vertByteSize = 4 * this.vertSize, this.size = s.SPRITE_BATCH_SIZE;var e = 4 * this.size * this.vertByteSize,
	            r = 6 * this.size;this.vertices = new ArrayBuffer(e), this.positions = new Float32Array(this.vertices), this.colors = new Uint32Array(this.vertices), this.indices = new Uint16Array(r);for (var i = 0, o = 0; r > i; i += 6, o += 4) {
	          this.indices[i + 0] = o + 0, this.indices[i + 1] = o + 1, this.indices[i + 2] = o + 2, this.indices[i + 3] = o + 0, this.indices[i + 4] = o + 2, this.indices[i + 5] = o + 3;
	        }this.currentBatchSize = 0, this.sprites = [], this.shader = null;
	      }var n = t("../../renderers/webgl/utils/ObjectRenderer"),
	          o = t("../../renderers/webgl/WebGLRenderer"),
	          s = t("../../const");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, o.registerPlugin("sprite", i), i.prototype.onContextChange = function () {
	        var t = this.renderer.gl;this.shader = this.renderer.shaderManager.defaultShader, this.vertexBuffer = t.createBuffer(), this.indexBuffer = t.createBuffer(), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, this.indices, t.STATIC_DRAW), t.bindBuffer(t.ARRAY_BUFFER, this.vertexBuffer), t.bufferData(t.ARRAY_BUFFER, this.vertices, t.DYNAMIC_DRAW), this.currentBlendMode = 99999;
	      }, i.prototype.render = function (t) {
	        var e = t._texture;this.currentBatchSize >= this.size && this.flush();var r = e._uvs;if (r) {
	          var i,
	              n,
	              o,
	              s,
	              a = t.anchor.x,
	              h = t.anchor.y;if (e.trim) {
	            var l = e.trim;n = l.x - a * l.width, i = n + e.crop.width, s = l.y - h * l.height, o = s + e.crop.height;
	          } else i = e._frame.width * (1 - a), n = e._frame.width * -a, o = e._frame.height * (1 - h), s = e._frame.height * -h;var u = this.currentBatchSize * this.vertByteSize,
	              c = t.worldTransform,
	              p = c.a,
	              d = c.b,
	              f = c.c,
	              v = c.d,
	              g = c.tx,
	              m = c.ty,
	              y = this.colors,
	              x = this.positions;this.renderer.roundPixels ? (x[u] = p * n + f * s + g | 0, x[u + 1] = v * s + d * n + m | 0, x[u + 5] = p * i + f * s + g | 0, x[u + 6] = v * s + d * i + m | 0, x[u + 10] = p * i + f * o + g | 0, x[u + 11] = v * o + d * i + m | 0, x[u + 15] = p * n + f * o + g | 0, x[u + 16] = v * o + d * n + m | 0) : (x[u] = p * n + f * s + g, x[u + 1] = v * s + d * n + m, x[u + 5] = p * i + f * s + g, x[u + 6] = v * s + d * i + m, x[u + 10] = p * i + f * o + g, x[u + 11] = v * o + d * i + m, x[u + 15] = p * n + f * o + g, x[u + 16] = v * o + d * n + m), x[u + 2] = r.x0, x[u + 3] = r.y0, x[u + 7] = r.x1, x[u + 8] = r.y1, x[u + 12] = r.x2, x[u + 13] = r.y2, x[u + 17] = r.x3, x[u + 18] = r.y3;var b = t.tint;y[u + 4] = y[u + 9] = y[u + 14] = y[u + 19] = (b >> 16) + (65280 & b) + ((255 & b) << 16) + (255 * t.worldAlpha << 24), this.sprites[this.currentBatchSize++] = t;
	        }
	      }, i.prototype.flush = function () {
	        if (0 !== this.currentBatchSize) {
	          var t,
	              e = this.renderer.gl;if (this.currentBatchSize > .5 * this.size) e.bufferSubData(e.ARRAY_BUFFER, 0, this.vertices);else {
	            var r = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);e.bufferSubData(e.ARRAY_BUFFER, 0, r);
	          }for (var i, n, o, s, a = 0, h = 0, l = null, u = this.renderer.blendModeManager.currentBlendMode, c = null, p = !1, d = !1, f = 0, v = this.currentBatchSize; v > f; f++) {
	            s = this.sprites[f], i = s._texture.baseTexture, n = s.blendMode, o = s.shader || this.shader, p = u !== n, d = c !== o, (l !== i || p || d) && (this.renderBatch(l, a, h), h = f, a = 0, l = i, p && (u = n, this.renderer.blendModeManager.setBlendMode(u)), d && (c = o, t = c.shaders ? c.shaders[e.id] : c, t || (t = c.getShader(this.renderer)), this.renderer.shaderManager.setShader(t), t.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(!0), t.syncUniforms(), e.activeTexture(e.TEXTURE0))), a++;
	          }this.renderBatch(l, a, h), this.currentBatchSize = 0;
	        }
	      }, i.prototype.renderBatch = function (t, e, r) {
	        if (0 !== e) {
	          var i = this.renderer.gl;t._glTextures[i.id] ? i.bindTexture(i.TEXTURE_2D, t._glTextures[i.id]) : this.renderer.updateTexture(t), i.drawElements(i.TRIANGLES, 6 * e, i.UNSIGNED_SHORT, 6 * r * 2), this.renderer.drawCount++;
	        }
	      }, i.prototype.start = function () {
	        var t = this.renderer.gl;t.bindBuffer(t.ARRAY_BUFFER, this.vertexBuffer), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer);var e = this.vertByteSize;t.vertexAttribPointer(this.shader.attributes.aVertexPosition, 2, t.FLOAT, !1, e, 0), t.vertexAttribPointer(this.shader.attributes.aTextureCoord, 2, t.FLOAT, !1, e, 8), t.vertexAttribPointer(this.shader.attributes.aColor, 4, t.UNSIGNED_BYTE, !0, e, 16);
	      }, i.prototype.destroy = function () {
	        this.renderer.gl.deleteBuffer(this.vertexBuffer), this.renderer.gl.deleteBuffer(this.indexBuffer), this.shader.destroy(), this.renderer = null, this.vertices = null, this.positions = null, this.colors = null, this.indices = null, this.vertexBuffer = null, this.indexBuffer = null, this.sprites = null, this.shader = null;
	      };
	    }, { "../../const": 22, "../../renderers/webgl/WebGLRenderer": 48, "../../renderers/webgl/utils/ObjectRenderer": 62 }], 68: [function (t, e, r) {
	      function i(t, e, r) {
	        this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.resolution = r || h.RESOLUTION, this._text = null, this._style = null;var i = o.fromCanvas(this.canvas);i.trim = new s.Rectangle(), n.call(this, i), this.text = t, this.style = e;
	      }var n = t("../sprites/Sprite"),
	          o = t("../textures/Texture"),
	          s = t("../math"),
	          a = t("../utils"),
	          h = t("../const");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.fontPropertiesCache = {}, i.fontPropertiesCanvas = document.createElement("canvas"), i.fontPropertiesContext = i.fontPropertiesCanvas.getContext("2d"), Object.defineProperties(i.prototype, { width: { get: function get() {
	            return this.dirty && this.updateText(), this.scale.x * this._texture._frame.width;
	          }, set: function set(t) {
	            this.scale.x = t / this._texture._frame.width, this._width = t;
	          } }, height: { get: function get() {
	            return this.dirty && this.updateText(), this.scale.y * this._texture._frame.height;
	          }, set: function set(t) {
	            this.scale.y = t / this._texture._frame.height, this._height = t;
	          } }, style: { get: function get() {
	            return this._style;
	          }, set: function set(t) {
	            t = t || {}, "number" == typeof t.fill && (t.fill = a.hex2string(t.fill)), "number" == typeof t.stroke && (t.stroke = a.hex2string(t.stroke)), "number" == typeof t.dropShadowColor && (t.dropShadowColor = a.hex2string(t.dropShadowColor)), t.font = t.font || "bold 20pt Arial", t.fill = t.fill || "black", t.align = t.align || "left", t.stroke = t.stroke || "black", t.strokeThickness = t.strokeThickness || 0, t.wordWrap = t.wordWrap || !1, t.wordWrapWidth = t.wordWrapWidth || 100, t.dropShadow = t.dropShadow || !1, t.dropShadowColor = t.dropShadowColor || "#000000", t.dropShadowAngle = t.dropShadowAngle || Math.PI / 6, t.dropShadowDistance = t.dropShadowDistance || 5, t.padding = t.padding || 0, t.textBaseline = t.textBaseline || "alphabetic", t.lineJoin = t.lineJoin || "miter", t.miterLimit = t.miterLimit || 10, this._style = t, this.dirty = !0;
	          } }, text: { get: function get() {
	            return this._text;
	          }, set: function set(t) {
	            t = t.toString() || " ", this._text !== t && (this._text = t, this.dirty = !0);
	          } } }), i.prototype.updateText = function () {
	        var t = this._style;this.context.font = t.font;for (var e = t.wordWrap ? this.wordWrap(this._text) : this._text, r = e.split(/(?:\r\n|\r|\n)/), i = new Array(r.length), n = 0, o = this.determineFontProperties(t.font), s = 0; s < r.length; s++) {
	          var a = this.context.measureText(r[s]).width;i[s] = a, n = Math.max(n, a);
	        }var h = n + t.strokeThickness;t.dropShadow && (h += t.dropShadowDistance), this.canvas.width = (h + this.context.lineWidth) * this.resolution;var l = this.style.lineHeight || o.fontSize + t.strokeThickness,
	            u = l * r.length;t.dropShadow && (u += t.dropShadowDistance), this.canvas.height = (u + 2 * this._style.padding) * this.resolution, this.context.scale(this.resolution, this.resolution), navigator.isCocoonJS && this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.context.font = t.font, this.context.strokeStyle = t.stroke, this.context.lineWidth = t.strokeThickness, this.context.textBaseline = t.textBaseline, this.context.lineJoin = t.lineJoin, this.context.miterLimit = t.miterLimit;var c, p;if (t.dropShadow) {
	          this.context.fillStyle = t.dropShadowColor;var d = Math.cos(t.dropShadowAngle) * t.dropShadowDistance,
	              f = Math.sin(t.dropShadowAngle) * t.dropShadowDistance;for (s = 0; s < r.length; s++) {
	            c = t.strokeThickness / 2, p = t.strokeThickness / 2 + s * l + o.ascent, "right" === t.align ? c += n - i[s] : "center" === t.align && (c += (n - i[s]) / 2), t.fill && this.context.fillText(r[s], c + d, p + f + this._style.padding);
	          }
	        }for (this.context.fillStyle = t.fill, s = 0; s < r.length; s++) {
	          c = t.strokeThickness / 2, p = t.strokeThickness / 2 + s * l + o.ascent, "right" === t.align ? c += n - i[s] : "center" === t.align && (c += (n - i[s]) / 2), t.stroke && t.strokeThickness && this.context.strokeText(r[s], c, p + this._style.padding), t.fill && this.context.fillText(r[s], c, p + this._style.padding);
	        }this.updateTexture();
	      }, i.prototype.updateTexture = function () {
	        var t = this._texture;t.baseTexture.hasLoaded = !0, t.baseTexture.resolution = this.resolution, t.baseTexture.width = this.canvas.width / this.resolution, t.baseTexture.height = this.canvas.height / this.resolution, t.crop.width = t._frame.width = this.canvas.width / this.resolution, t.crop.height = t._frame.height = this.canvas.height / this.resolution, t.trim.x = 0, t.trim.y = -this._style.padding, t.trim.width = t._frame.width, t.trim.height = t._frame.height - 2 * this._style.padding, this._width = this.canvas.width / this.resolution, this._height = this.canvas.height / this.resolution, t.baseTexture.emit("update", t.baseTexture), this.dirty = !1;
	      }, i.prototype.renderWebGL = function (t) {
	        this.dirty && this.updateText(), n.prototype.renderWebGL.call(this, t);
	      }, i.prototype._renderCanvas = function (t) {
	        this.dirty && this.updateText(), n.prototype._renderCanvas.call(this, t);
	      }, i.prototype.determineFontProperties = function (t) {
	        var e = i.fontPropertiesCache[t];if (!e) {
	          e = {};var r = i.fontPropertiesCanvas,
	              n = i.fontPropertiesContext;n.font = t;var o = Math.ceil(n.measureText("|MÉq").width),
	              s = Math.ceil(n.measureText("M").width),
	              a = 2 * s;s = 1.4 * s | 0, r.width = o, r.height = a, n.fillStyle = "#f00", n.fillRect(0, 0, o, a), n.font = t, n.textBaseline = "alphabetic", n.fillStyle = "#000", n.fillText("|MÉq", 0, s);var h,
	              l,
	              u = n.getImageData(0, 0, o, a).data,
	              c = u.length,
	              p = 4 * o,
	              d = 0,
	              f = !1;for (h = 0; s > h; h++) {
	            for (l = 0; p > l; l += 4) {
	              if (255 !== u[d + l]) {
	                f = !0;break;
	              }
	            }if (f) break;d += p;
	          }for (e.ascent = s - h, d = c - p, f = !1, h = a; h > s; h--) {
	            for (l = 0; p > l; l += 4) {
	              if (255 !== u[d + l]) {
	                f = !0;break;
	              }
	            }if (f) break;d -= p;
	          }e.descent = h - s, e.fontSize = e.ascent + e.descent, i.fontPropertiesCache[t] = e;
	        }return e;
	      }, i.prototype.wordWrap = function (t) {
	        for (var e = "", r = t.split("\n"), i = this._style.wordWrapWidth, n = 0; n < r.length; n++) {
	          for (var o = i, s = r[n].split(" "), a = 0; a < s.length; a++) {
	            var h = this.context.measureText(s[a]).width,
	                l = h + this.context.measureText(" ").width;0 === a || l > o ? (a > 0 && (e += "\n"), e += s[a], o = i - h) : (o -= l, e += " " + s[a]);
	          }n < r.length - 1 && (e += "\n");
	        }return e;
	      }, i.prototype.getBounds = function (t) {
	        return this.dirty && this.updateText(), n.prototype.getBounds.call(this, t);
	      }, i.prototype.destroy = function (t) {
	        this.context = null, this.canvas = null, this._style = null, this._texture.destroy(void 0 === t ? !0 : t);
	      };
	    }, { "../const": 22, "../math": 32, "../sprites/Sprite": 66, "../textures/Texture": 71, "../utils": 76 }], 69: [function (t, e, r) {
	      function i(t, e, r) {
	        s.call(this), this.uid = n.uid(), this.resolution = r || 1, this.width = 100, this.height = 100, this.realWidth = 100, this.realHeight = 100, this.scaleMode = e || o.SCALE_MODES.DEFAULT, this.hasLoaded = !1, this.isLoading = !1, this.source = null, this.premultipliedAlpha = !0, this.imageUrl = null, this.isPowerOfTwo = !1, this.mipmap = !1, this._glTextures = [], t && this.loadSource(t);
	      }var n = t("../utils"),
	          o = t("../const"),
	          s = t("eventemitter3");i.prototype = Object.create(s.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.update = function () {
	        this.realWidth = this.source.naturalWidth || this.source.width, this.realHeight = this.source.naturalHeight || this.source.height, this.width = this.realWidth / this.resolution, this.height = this.realHeight / this.resolution, this.isPowerOfTwo = n.isPowerOfTwo(this.realWidth, this.realHeight), this.emit("update", this);
	      }, i.prototype.loadSource = function (t) {
	        var e = this.isLoading;if (this.hasLoaded = !1, this.isLoading = !1, e && this.source && (this.source.onload = null, this.source.onerror = null), this.source = t, (this.source.complete || this.source.getContext) && this.source.width && this.source.height) this._sourceLoaded();else if (!t.getContext) {
	          this.isLoading = !0;var r = this;t.onload = function () {
	            t.onload = null, t.onerror = null, r.isLoading && (r.isLoading = !1, r._sourceLoaded(), r.emit("loaded", r));
	          }, t.onerror = function () {
	            t.onload = null, t.onerror = null, r.isLoading && (r.isLoading = !1, r.emit("error", r));
	          }, t.complete && t.src && (this.isLoading = !1, t.onload = null, t.onerror = null, t.width && t.height ? (this._sourceLoaded(), e && this.emit("loaded", this)) : e && this.emit("error", this));
	        }
	      }, i.prototype._sourceLoaded = function () {
	        this.hasLoaded = !0, this.update();
	      }, i.prototype.destroy = function () {
	        this.imageUrl ? (delete n.BaseTextureCache[this.imageUrl], delete n.TextureCache[this.imageUrl], this.imageUrl = null, navigator.isCocoonJS || (this.source.src = "")) : this.source && this.source._pixiId && delete n.BaseTextureCache[this.source._pixiId], this.source = null, this.dispose();
	      }, i.prototype.dispose = function () {
	        this.emit("dispose", this), this._glTextures.length = 0;
	      }, i.prototype.updateSourceImage = function (t) {
	        this.source.src = t, this.loadSource(this.source);
	      }, i.fromImage = function (t, e, r) {
	        var o = n.BaseTextureCache[t];if (void 0 === e && 0 !== t.indexOf("data:") && (e = !0), !o) {
	          var s = new Image();e && (s.crossOrigin = ""), o = new i(s, r), o.imageUrl = t, s.src = t, n.BaseTextureCache[t] = o, o.resolution = n.getResolutionOfUrl(t);
	        }return o;
	      }, i.fromCanvas = function (t, e) {
	        t._pixiId || (t._pixiId = "canvas_" + n.uid());var r = n.BaseTextureCache[t._pixiId];return r || (r = new i(t, e), n.BaseTextureCache[t._pixiId] = r), r;
	      };
	    }, { "../const": 22, "../utils": 76, eventemitter3: 11 }], 70: [function (t, e, r) {
	      function i(t, e, r, i, c) {
	        if (!t) throw new Error("Unable to create RenderTexture, you must pass a renderer into the constructor.");e = e || 100, r = r || 100, c = c || u.RESOLUTION;var p = new n();if (p.width = e, p.height = r, p.resolution = c, p.scaleMode = i || u.SCALE_MODES.DEFAULT, p.hasLoaded = !0, o.call(this, p, new l.Rectangle(0, 0, e, r)), this.width = e, this.height = r, this.resolution = c, this.render = null, this.renderer = t, this.renderer.type === u.RENDERER_TYPE.WEBGL) {
	          var d = this.renderer.gl;this.textureBuffer = new s(d, this.width, this.height, p.scaleMode, this.resolution), this.baseTexture._glTextures[d.id] = this.textureBuffer.texture, this.filterManager = new a(this.renderer), this.filterManager.onContextChange(), this.filterManager.resize(e, r), this.render = this.renderWebGL, this.renderer.currentRenderer.start(), this.renderer.currentRenderTarget.activate();
	        } else this.render = this.renderCanvas, this.textureBuffer = new h(this.width * this.resolution, this.height * this.resolution), this.baseTexture.source = this.textureBuffer.canvas;this.valid = !0, this._updateUvs();
	      }var n = t("./BaseTexture"),
	          o = t("./Texture"),
	          s = t("../renderers/webgl/utils/RenderTarget"),
	          a = t("../renderers/webgl/managers/FilterManager"),
	          h = t("../renderers/canvas/utils/CanvasBuffer"),
	          l = t("../math"),
	          u = t("../const"),
	          c = new l.Matrix();i.prototype = Object.create(o.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.resize = function (t, e, r) {
	        (t !== this.width || e !== this.height) && (this.valid = t > 0 && e > 0, this.width = this._frame.width = this.crop.width = t, this.height = this._frame.height = this.crop.height = e, r && (this.baseTexture.width = this.width, this.baseTexture.height = this.height), this.valid && (this.textureBuffer.resize(this.width, this.height), this.filterManager && this.filterManager.resize(this.width, this.height)));
	      }, i.prototype.clear = function () {
	        this.valid && (this.renderer.type === u.RENDERER_TYPE.WEBGL && this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer), this.textureBuffer.clear());
	      }, i.prototype.renderWebGL = function (t, e, r, i) {
	        if (this.valid) {
	          if (i = void 0 !== i ? i : !0, this.textureBuffer.transform = e, this.textureBuffer.activate(), t.worldAlpha = 1, i) {
	            t.worldTransform.identity(), t.currentBounds = null;var n,
	                o,
	                s = t.children;for (n = 0, o = s.length; o > n; ++n) {
	              s[n].updateTransform();
	            }
	          }var a = this.renderer.filterManager;this.renderer.filterManager = this.filterManager, this.renderer.renderDisplayObject(t, this.textureBuffer, r), this.renderer.filterManager = a;
	        }
	      }, i.prototype.renderCanvas = function (t, e, r, i) {
	        if (this.valid) {
	          i = !!i;var n = t.worldTransform,
	              o = c;o.identity(), e && o.append(e), t.worldTransform = o, t.worldAlpha = 1;var s,
	              a,
	              h = t.children;for (s = 0, a = h.length; a > s; ++s) {
	            h[s].updateTransform();
	          }r && this.textureBuffer.clear(), t.worldTransform = n;var l = this.textureBuffer.context,
	              u = this.renderer.resolution;this.renderer.resolution = this.resolution, this.renderer.renderDisplayObject(t, l), this.renderer.resolution = u;
	        }
	      }, i.prototype.destroy = function () {
	        o.prototype.destroy.call(this, !0), this.textureBuffer.destroy(), this.filterManager && this.filterManager.destroy(), this.renderer = null;
	      }, i.prototype.getImage = function () {
	        var t = new Image();return t.src = this.getBase64(), t;
	      }, i.prototype.getBase64 = function () {
	        return this.getCanvas().toDataURL();
	      }, i.prototype.getCanvas = function () {
	        if (this.renderer.type === u.RENDERER_TYPE.WEBGL) {
	          var t = this.renderer.gl,
	              e = this.textureBuffer.size.width,
	              r = this.textureBuffer.size.height,
	              i = new Uint8Array(4 * e * r);t.bindFramebuffer(t.FRAMEBUFFER, this.textureBuffer.frameBuffer), t.readPixels(0, 0, e, r, t.RGBA, t.UNSIGNED_BYTE, i), t.bindFramebuffer(t.FRAMEBUFFER, null);var n = new h(e, r),
	              o = n.context.getImageData(0, 0, e, r);return o.data.set(i), n.context.putImageData(o, 0, 0), n.canvas;
	        }return this.textureBuffer.canvas;
	      }, i.prototype.getPixels = function () {
	        var t, e;if (this.renderer.type === u.RENDERER_TYPE.WEBGL) {
	          var r = this.renderer.gl;t = this.textureBuffer.size.width, e = this.textureBuffer.size.height;var i = new Uint8Array(4 * t * e);return r.bindFramebuffer(r.FRAMEBUFFER, this.textureBuffer.frameBuffer), r.readPixels(0, 0, t, e, r.RGBA, r.UNSIGNED_BYTE, i), r.bindFramebuffer(r.FRAMEBUFFER, null), i;
	        }return t = this.textureBuffer.canvas.width, e = this.textureBuffer.canvas.height, this.textureBuffer.canvas.getContext("2d").getImageData(0, 0, t, e).data;
	      }, i.prototype.getPixel = function (t, e) {
	        if (this.renderer.type === u.RENDERER_TYPE.WEBGL) {
	          var r = this.renderer.gl,
	              i = new Uint8Array(4);return r.bindFramebuffer(r.FRAMEBUFFER, this.textureBuffer.frameBuffer), r.readPixels(t, e, 1, 1, r.RGBA, r.UNSIGNED_BYTE, i), r.bindFramebuffer(r.FRAMEBUFFER, null), i;
	        }return this.textureBuffer.canvas.getContext("2d").getImageData(t, e, 1, 1).data;
	      };
	    }, { "../const": 22, "../math": 32, "../renderers/canvas/utils/CanvasBuffer": 44, "../renderers/webgl/managers/FilterManager": 53, "../renderers/webgl/utils/RenderTarget": 64, "./BaseTexture": 69, "./Texture": 71 }], 71: [function (t, e, r) {
	      function i(t, e, r, n, o) {
	        a.call(this), this.noFrame = !1, e || (this.noFrame = !0, e = new h.Rectangle(0, 0, 1, 1)), t instanceof i && (t = t.baseTexture), this.baseTexture = t, this._frame = e, this.trim = n, this.valid = !1, this.requiresUpdate = !1, this._uvs = null, this.width = 0, this.height = 0, this.crop = r || e, this.rotate = !!o, t.hasLoaded ? (this.noFrame && (e = new h.Rectangle(0, 0, t.width, t.height), t.on("update", this.onBaseTextureUpdated, this)), this.frame = e) : t.once("loaded", this.onBaseTextureLoaded, this);
	      }var n = t("./BaseTexture"),
	          o = t("./VideoBaseTexture"),
	          s = t("./TextureUvs"),
	          a = t("eventemitter3"),
	          h = t("../math"),
	          l = t("../utils");i.prototype = Object.create(a.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { frame: { get: function get() {
	            return this._frame;
	          }, set: function set(t) {
	            if (this._frame = t, this.noFrame = !1, this.width = t.width, this.height = t.height, !this.trim && !this.rotate && (t.x + t.width > this.baseTexture.width || t.y + t.height > this.baseTexture.height)) throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);this.valid = t && t.width && t.height && this.baseTexture.hasLoaded, this.trim ? (this.width = this.trim.width, this.height = this.trim.height, this._frame.width = this.trim.width, this._frame.height = this.trim.height) : this.crop = t, this.valid && this._updateUvs();
	          } } }), i.prototype.update = function () {
	        this.baseTexture.update();
	      }, i.prototype.onBaseTextureLoaded = function (t) {
	        this.frame = this.noFrame ? new h.Rectangle(0, 0, t.width, t.height) : this._frame, this.emit("update", this);
	      }, i.prototype.onBaseTextureUpdated = function (t) {
	        this._frame.width = t.width, this._frame.height = t.height, this.emit("update", this);
	      }, i.prototype.destroy = function (t) {
	        this.baseTexture && (t && this.baseTexture.destroy(), this.baseTexture.off("update", this.onBaseTextureUpdated, this), this.baseTexture.off("loaded", this.onBaseTextureLoaded, this), this.baseTexture = null), this._frame = null, this._uvs = null, this.trim = null, this.crop = null, this.valid = !1;
	      }, i.prototype.clone = function () {
	        return new i(this.baseTexture, this.frame, this.crop, this.trim, this.rotate);
	      }, i.prototype._updateUvs = function () {
	        this._uvs || (this._uvs = new s()), this._uvs.set(this.crop, this.baseTexture, this.rotate);
	      }, i.fromImage = function (t, e, r) {
	        var o = l.TextureCache[t];return o || (o = new i(n.fromImage(t, e, r)), l.TextureCache[t] = o), o;
	      }, i.fromFrame = function (t) {
	        var e = l.TextureCache[t];if (!e) throw new Error('The frameId "' + t + '" does not exist in the texture cache');return e;
	      }, i.fromCanvas = function (t, e) {
	        return new i(n.fromCanvas(t, e));
	      }, i.fromVideo = function (t, e) {
	        return "string" == typeof t ? i.fromVideoUrl(t, e) : new i(o.fromVideo(t, e));
	      }, i.fromVideoUrl = function (t, e) {
	        return new i(o.fromUrl(t, e));
	      }, i.addTextureToCache = function (t, e) {
	        l.TextureCache[e] = t;
	      }, i.removeTextureFromCache = function (t) {
	        var e = l.TextureCache[t];return delete l.TextureCache[t], delete l.BaseTextureCache[t], e;
	      }, i.EMPTY = new i(new n());
	    }, { "../math": 32, "../utils": 76, "./BaseTexture": 69, "./TextureUvs": 72, "./VideoBaseTexture": 73, eventemitter3: 11 }], 72: [function (t, e, r) {
	      function i() {
	        this.x0 = 0, this.y0 = 0, this.x1 = 1, this.y1 = 0, this.x2 = 1, this.y2 = 1, this.x3 = 0, this.y3 = 1;
	      }e.exports = i, i.prototype.set = function (t, e, r) {
	        var i = e.width,
	            n = e.height;r ? (this.x0 = (t.x + t.height) / i, this.y0 = t.y / n, this.x1 = (t.x + t.height) / i, this.y1 = (t.y + t.width) / n, this.x2 = t.x / i, this.y2 = (t.y + t.width) / n, this.x3 = t.x / i, this.y3 = t.y / n) : (this.x0 = t.x / i, this.y0 = t.y / n, this.x1 = (t.x + t.width) / i, this.y1 = t.y / n, this.x2 = (t.x + t.width) / i, this.y2 = (t.y + t.height) / n, this.x3 = t.x / i, this.y3 = (t.y + t.height) / n);
	      };
	    }, {}], 73: [function (t, e, r) {
	      function i(t, e) {
	        if (!t) throw new Error("No video source element specified.");(t.readyState === t.HAVE_ENOUGH_DATA || t.readyState === t.HAVE_FUTURE_DATA) && t.width && t.height && (t.complete = !0), o.call(this, t, e), this.autoUpdate = !1, this._onUpdate = this._onUpdate.bind(this), this._onCanPlay = this._onCanPlay.bind(this), t.complete || (t.addEventListener("canplay", this._onCanPlay), t.addEventListener("canplaythrough", this._onCanPlay), t.addEventListener("play", this._onPlayStart.bind(this)), t.addEventListener("pause", this._onPlayStop.bind(this))), this.__loaded = !1;
	      }function n(t, e) {
	        e || (e = "video/" + t.substr(t.lastIndexOf(".") + 1));var r = document.createElement("source");return r.src = t, r.type = e, r;
	      }var o = t("./BaseTexture"),
	          s = t("../utils");i.prototype = Object.create(o.prototype), i.prototype.constructor = i, e.exports = i, i.prototype._onUpdate = function () {
	        this.autoUpdate && (window.requestAnimationFrame(this._onUpdate), this.update());
	      }, i.prototype._onPlayStart = function () {
	        this.autoUpdate || (window.requestAnimationFrame(this._onUpdate), this.autoUpdate = !0);
	      }, i.prototype._onPlayStop = function () {
	        this.autoUpdate = !1;
	      }, i.prototype._onCanPlay = function () {
	        this.hasLoaded = !0, this.source && (this.source.removeEventListener("canplay", this._onCanPlay), this.source.removeEventListener("canplaythrough", this._onCanPlay), this.width = this.source.videoWidth, this.height = this.source.videoHeight, this.source.play(), this.__loaded || (this.__loaded = !0, this.emit("loaded", this)));
	      }, i.prototype.destroy = function () {
	        this.source && this.source._pixiId && (delete s.BaseTextureCache[this.source._pixiId], delete this.source._pixiId), o.prototype.destroy.call(this);
	      }, i.fromVideo = function (t, e) {
	        t._pixiId || (t._pixiId = "video_" + s.uid());var r = s.BaseTextureCache[t._pixiId];return r || (r = new i(t, e), s.BaseTextureCache[t._pixiId] = r), r;
	      }, i.fromUrl = function (t, e) {
	        var r = document.createElement("video");if (Array.isArray(t)) for (var o = 0; o < t.length; ++o) {
	          r.appendChild(n(t.src || t, t.mime));
	        } else r.appendChild(n(t.src || t, t.mime));return r.load(), r.play(), i.fromVideo(r, e);
	      }, i.fromUrls = i.fromUrl;
	    }, { "../utils": 76, "./BaseTexture": 69 }], 74: [function (t, e, r) {
	      function i() {
	        var t = this;this._tick = function (e) {
	          t._requestId = null, t.started && (t.update(e), t.started && null === t._requestId && t._emitter.listeners(s, !0) && (t._requestId = requestAnimationFrame(t._tick)));
	        }, this._emitter = new o(), this._requestId = null, this._maxElapsedMS = 100, this.autoStart = !1, this.deltaTime = 1, this.elapsedMS = 1 / n.TARGET_FPMS, this.lastTime = 0, this.speed = 1, this.started = !1;
	      }var n = t("../const"),
	          o = t("eventemitter3"),
	          s = "tick";Object.defineProperties(i.prototype, { FPS: { get: function get() {
	            return 1e3 / this.elapsedMS;
	          } }, minFPS: { get: function get() {
	            return 1e3 / this._maxElapsedMS;
	          }, set: function set(t) {
	            var e = Math.min(Math.max(0, t) / 1e3, n.TARGET_FPMS);this._maxElapsedMS = 1 / e;
	          } } }), i.prototype._requestIfNeeded = function () {
	        null === this._requestId && this._emitter.listeners(s, !0) && (this.lastTime = performance.now(), this._requestId = requestAnimationFrame(this._tick));
	      }, i.prototype._cancelIfNeeded = function () {
	        null !== this._requestId && (cancelAnimationFrame(this._requestId), this._requestId = null);
	      }, i.prototype._startIfPossible = function () {
	        this.started ? this._requestIfNeeded() : this.autoStart && this.start();
	      }, i.prototype.add = function (t, e) {
	        return this._emitter.on(s, t, e), this._startIfPossible(), this;
	      }, i.prototype.addOnce = function (t, e) {
	        return this._emitter.once(s, t, e), this._startIfPossible(), this;
	      }, i.prototype.remove = function (t, e) {
	        return this._emitter.off(s, t, e), this._emitter.listeners(s, !0) || this._cancelIfNeeded(), this;
	      }, i.prototype.start = function () {
	        this.started || (this.started = !0, this._requestIfNeeded());
	      }, i.prototype.stop = function () {
	        this.started && (this.started = !1, this._cancelIfNeeded());
	      }, i.prototype.update = function (t) {
	        var e;t = t || performance.now(), e = this.elapsedMS = t - this.lastTime, e > this._maxElapsedMS && (e = this._maxElapsedMS), this.deltaTime = e * n.TARGET_FPMS * this.speed, this._emitter.emit(s, this.deltaTime), this.lastTime = t;
	      }, e.exports = i;
	    }, { "../const": 22, eventemitter3: 11 }], 75: [function (t, e, r) {
	      var i = t("./Ticker"),
	          n = new i();n.autoStart = !0, e.exports = { shared: n, Ticker: i };
	    }, { "./Ticker": 74 }], 76: [function (t, e, r) {
	      var i = t("../const"),
	          n = e.exports = { _uid: 0, _saidHello: !1, pluginTarget: t("./pluginTarget"), async: t("async"), uid: function uid() {
	          return ++n._uid;
	        }, hex2rgb: function hex2rgb(t, e) {
	          return e = e || [], e[0] = (t >> 16 & 255) / 255, e[1] = (t >> 8 & 255) / 255, e[2] = (255 & t) / 255, e;
	        }, hex2string: function hex2string(t) {
	          return t = t.toString(16), t = "000000".substr(0, 6 - t.length) + t, "#" + t;
	        }, rgb2hex: function rgb2hex(t) {
	          return (255 * t[0] << 16) + (255 * t[1] << 8) + 255 * t[2];
	        }, canUseNewCanvasBlendModes: function canUseNewCanvasBlendModes() {
	          if ("undefined" == typeof document) return !1;var t = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/",
	              e = "AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==",
	              r = new Image();r.src = t + "AP804Oa6" + e;var i = new Image();i.src = t + "/wCKxvRF" + e;var n = document.createElement("canvas");n.width = 6, n.height = 1;var o = n.getContext("2d");o.globalCompositeOperation = "multiply", o.drawImage(r, 0, 0), o.drawImage(i, 2, 0);var s = o.getImageData(2, 0, 1, 1).data;return 255 === s[0] && 0 === s[1] && 0 === s[2];
	        }, getNextPowerOfTwo: function getNextPowerOfTwo(t) {
	          if (t > 0 && 0 === (t & t - 1)) return t;for (var e = 1; t > e;) {
	            e <<= 1;
	          }return e;
	        }, isPowerOfTwo: function isPowerOfTwo(t, e) {
	          return t > 0 && 0 === (t & t - 1) && e > 0 && 0 === (e & e - 1);
	        }, getResolutionOfUrl: function getResolutionOfUrl(t) {
	          var e = i.RETINA_PREFIX.exec(t);return e ? parseFloat(e[1]) : 1;
	        }, sayHello: function sayHello(t) {
	          if (!n._saidHello) {
	            if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
	              var e = ["\n %c %c %c 可爱的 H5模板--赞鱼鱼 " + " - ✰ " + t + " ✰  %c  %c  http://www.zanyuyu.com/  %c %c ♥%c♥%c♥ \n\n", "background: #ff66a5; padding:5px 0;", "background: #ff66a5; padding:5px 0;", "color: #ff66a5; background: #030307; padding:5px 0;", "background: #ff66a5; padding:5px 0;", "background: #ffc3dc; padding:5px 0;", "background: #ff66a5; padding:5px 0;", "color: #ff2424; background: #fff; padding:5px 0;", "color: #ff2424; background: #fff; padding:5px 0;", "color: #ff2424; background: #fff; padding:5px 0;"];window.console.log.apply(console, e);
	            } else window.console && window.console.log("可爱的 H5模板--赞鱼鱼 " + " - " + t + " - http://www.zanyuyu.com/");n._saidHello = !0;
	          }
	        }, isWebGLSupported: function isWebGLSupported() {
	          var t = { stencil: !0 };try {
	            if (!window.WebGLRenderingContext) return !1;var e = document.createElement("canvas"),
	                r = e.getContext("webgl", t) || e.getContext("experimental-webgl", t);return !(!r || !r.getContextAttributes().stencil);
	          } catch (i) {
	            return !1;
	          }
	        }, TextureCache: {}, BaseTextureCache: {} };
	    }, { "../const": 22, "./pluginTarget": 77, async: 2 }], 77: [function (t, e, r) {
	      function i(t) {
	        t.__plugins = {}, t.registerPlugin = function (e, r) {
	          t.__plugins[e] = r;
	        }, t.prototype.initPlugins = function () {
	          this.plugins = this.plugins || {};for (var e in t.__plugins) {
	            this.plugins[e] = new t.__plugins[e](this);
	          }
	        }, t.prototype.destroyPlugins = function () {
	          for (var t in this.plugins) {
	            this.plugins[t].destroy(), this.plugins[t] = null;
	          }this.plugins = null;
	        };
	      }e.exports = { mixin: function mixin(t) {
	          i(t);
	        } };
	    }, {}], 78: [function (t, e, r) {
	      var i = t("./core"),
	          n = t("./mesh"),
	          o = t("./extras"),
	          s = t("./filters");i.SpriteBatch = function () {
	        throw new ReferenceError("SpriteBatch does not exist any more, please use the new ParticleContainer instead.");
	      }, i.AssetLoader = function () {
	        throw new ReferenceError("The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.");
	      }, Object.defineProperties(i, { Stage: { get: function get() {
	            return console.warn("You do not need to use a PIXI Stage any more, you can simply render any container."), i.Container;
	          } }, DisplayObjectContainer: { get: function get() {
	            return console.warn("DisplayObjectContainer has been shortened to Container, please use Container from now on."), i.Container;
	          } }, Strip: { get: function get() {
	            return console.warn("The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on."), n.Mesh;
	          } }, Rope: { get: function get() {
	            return console.warn("The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on."), n.Rope;
	          } }, MovieClip: { get: function get() {
	            return console.warn("The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on."), o.MovieClip;
	          } }, TilingSprite: { get: function get() {
	            return console.warn("The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on."), o.TilingSprite;
	          } }, BitmapText: { get: function get() {
	            return console.warn("The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on."), o.BitmapText;
	          } }, blendModes: { get: function get() {
	            return console.warn("The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on."), i.BLEND_MODES;
	          } }, scaleModes: { get: function get() {
	            return console.warn("The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on."), i.SCALE_MODES;
	          } }, BaseTextureCache: { get: function get() {
	            return console.warn("The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on."), i.utils.BaseTextureCache;
	          } }, TextureCache: { get: function get() {
	            return console.warn("The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on."), i.utils.TextureCache;
	          } }, math: { get: function get() {
	            return console.warn("The math namespace is deprecated, please access members already accessible on PIXI."), i;
	          } } }), i.Sprite.prototype.setTexture = function (t) {
	        this.texture = t, console.warn("setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;");
	      }, o.BitmapText.prototype.setText = function (t) {
	        this.text = t, console.warn("setText is now deprecated, please use the text property, e.g : myBitmapText.text = 'my text';");
	      }, i.Text.prototype.setText = function (t) {
	        this.text = t, console.warn("setText is now deprecated, please use the text property, e.g : myText.text = 'my text';");
	      }, i.Text.prototype.setStyle = function (t) {
	        this.style = t, console.warn("setStyle is now deprecated, please use the style property, e.g : myText.style = style;");
	      }, i.Texture.prototype.setFrame = function (t) {
	        this.frame = t, console.warn("setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;");
	      }, Object.defineProperties(s, { AbstractFilter: { get: function get() {
	            return console.warn("filters.AbstractFilter is an undocumented alias, please use AbstractFilter from now on."), i.AbstractFilter;
	          } }, FXAAFilter: { get: function get() {
	            return console.warn("filters.FXAAFilter is an undocumented alias, please use FXAAFilter from now on."), i.FXAAFilter;
	          } }, SpriteMaskFilter: { get: function get() {
	            return console.warn("filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on."), i.SpriteMaskFilter;
	          } } }), i.utils.uuid = function () {
	        return console.warn("utils.uuid() is deprecated, please use utils.uid() from now on."), i.utils.uid();
	      };
	    }, { "./core": 29, "./extras": 85, "./filters": 102, "./mesh": 126 }], 79: [function (t, e, r) {
	      function i(t, e) {
	        n.Container.call(this), e = e || {}, this.textWidth = 0, this.textHeight = 0, this._glyphs = [], this._font = { tint: void 0 !== e.tint ? e.tint : 16777215, align: e.align || "left", name: null, size: 0 }, this.font = e.font, this._text = t, this.maxWidth = 0, this.dirty = !1, this.updateText();
	      }var n = t("../core");i.prototype = Object.create(n.Container.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { tint: { get: function get() {
	            return this._font.tint;
	          }, set: function set(t) {
	            this._font.tint = "number" == typeof t && t >= 0 ? t : 16777215, this.dirty = !0;
	          } }, align: { get: function get() {
	            return this._font.align;
	          }, set: function set(t) {
	            this._font.align = t || "left", this.dirty = !0;
	          } }, font: { get: function get() {
	            return this._font;
	          }, set: function set(t) {
	            t && ("string" == typeof t ? (t = t.split(" "), this._font.name = 1 === t.length ? t[0] : t.slice(1).join(" "), this._font.size = t.length >= 2 ? parseInt(t[0], 10) : i.fonts[this._font.name].size) : (this._font.name = t.name, this._font.size = "number" == typeof t.size ? t.size : parseInt(t.size, 10)), this.dirty = !0);
	          } }, text: { get: function get() {
	            return this._text;
	          }, set: function set(t) {
	            t = t.toString() || " ", this._text !== t && (this._text = t, this.dirty = !0);
	          } } }), i.prototype.updateText = function () {
	        for (var t = i.fonts[this._font.name], e = new n.Point(), r = null, o = [], s = 0, a = 0, h = [], l = 0, u = this._font.size / t.size, c = -1, p = 0; p < this.text.length; p++) {
	          var d = this.text.charCodeAt(p);if (c = /(\s)/.test(this.text.charAt(p)) ? p : c, /(?:\r\n|\r|\n)/.test(this.text.charAt(p))) h.push(s), a = Math.max(a, s), l++, e.x = 0, e.y += t.lineHeight, r = null;else if (-1 !== c && this.maxWidth > 0 && e.x * u > this.maxWidth) o.splice(c, p - c), p = c, c = -1, h.push(s), a = Math.max(a, s), l++, e.x = 0, e.y += t.lineHeight, r = null;else {
	            var f = t.chars[d];f && (r && f.kerning[r] && (e.x += f.kerning[r]), o.push({ texture: f.texture, line: l, charCode: d, position: new n.Point(e.x + f.xOffset, e.y + f.yOffset) }), s = e.x + (f.texture.width + f.xOffset), e.x += f.xAdvance, r = d);
	          }
	        }h.push(s), a = Math.max(a, s);var v = [];for (p = 0; l >= p; p++) {
	          var g = 0;"right" === this._font.align ? g = a - h[p] : "center" === this._font.align && (g = (a - h[p]) / 2), v.push(g);
	        }var m = o.length,
	            y = this.tint;for (p = 0; m > p; p++) {
	          var x = this._glyphs[p];x ? x.texture = o[p].texture : (x = new n.Sprite(o[p].texture), this._glyphs.push(x)), x.position.x = (o[p].position.x + v[o[p].line]) * u, x.position.y = o[p].position.y * u, x.scale.x = x.scale.y = u, x.tint = y, x.parent || this.addChild(x);
	        }for (p = m; p < this._glyphs.length; ++p) {
	          this.removeChild(this._glyphs[p]);
	        }this.textWidth = a * u, this.textHeight = (e.y + t.lineHeight) * u;
	      }, i.prototype.updateTransform = function () {
	        this.validate(), this.containerUpdateTransform();
	      }, i.prototype.getLocalBounds = function () {
	        return this.validate(), n.Container.prototype.getLocalBounds.call(this);
	      }, i.prototype.validate = function () {
	        this.dirty && (this.updateText(), this.dirty = !1);
	      }, i.fonts = {};
	    }, { "../core": 29 }], 80: [function (t, e, r) {
	      function i(t) {
	        n.Sprite.call(this, t[0]), this._textures = t, this.animationSpeed = 1, this.loop = !0, this.onComplete = null, this._currentTime = 0, this.playing = !1;
	      }var n = t("../core");i.prototype = Object.create(n.Sprite.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { totalFrames: { get: function get() {
	            return this._textures.length;
	          } }, textures: { get: function get() {
	            return this._textures;
	          }, set: function set(t) {
	            this._textures = t, this.texture = this._textures[Math.floor(this._currentTime) % this._textures.length];
	          } }, currentFrame: { get: function get() {
	            return Math.floor(this._currentTime) % this._textures.length;
	          } } }), i.prototype.stop = function () {
	        this.playing && (this.playing = !1, n.ticker.shared.remove(this.update, this));
	      }, i.prototype.play = function () {
	        this.playing || (this.playing = !0, n.ticker.shared.add(this.update, this));
	      }, i.prototype.gotoAndStop = function (t) {
	        this.stop(), this._currentTime = t;var e = Math.floor(this._currentTime);this._texture = this._textures[e % this._textures.length];
	      }, i.prototype.gotoAndPlay = function (t) {
	        this._currentTime = t, this.play();
	      }, i.prototype.update = function (t) {
	        this._currentTime += this.animationSpeed * t;var e = Math.floor(this._currentTime);0 > e ? this.loop ? this._texture = this._textures[this._textures.length - 1 + e % this._textures.length] : (this.gotoAndStop(0), this.onComplete && this.onComplete()) : this.loop || e < this._textures.length ? this._texture = this._textures[e % this._textures.length] : e >= this._textures.length && (this.gotoAndStop(this.textures.length - 1), this.onComplete && this.onComplete());
	      }, i.prototype.destroy = function () {
	        this.stop(), n.Sprite.prototype.destroy.call(this);
	      }, i.fromFrames = function (t) {
	        for (var e = [], r = 0; r < t.length; ++r) {
	          e.push(new n.Texture.fromFrame(t[r]));
	        }return new i(e);
	      }, i.fromImages = function (t) {
	        for (var e = [], r = 0; r < t.length; ++r) {
	          e.push(new n.Texture.fromImage(t[r]));
	        }return new i(e);
	      };
	    }, { "../core": 29 }], 81: [function (t, e, r) {
	      function i(t, e, r) {
	        n.Sprite.call(this, t), this.tileScale = new n.Point(1, 1), this.tilePosition = new n.Point(0, 0), this._width = e || 100, this._height = r || 100, this._uvs = new n.TextureUvs(), this._canvasPattern = null, this.shader = new n.AbstractFilter(["precision lowp float;", "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec4 aColor;", "uniform mat3 projectionMatrix;", "uniform vec4 uFrame;", "uniform vec4 uTransform;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "void main(void){", "   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);", "   vec2 coord = aTextureCoord;", "   coord -= uTransform.xy;", "   coord /= uTransform.zw;", "   vTextureCoord = coord;", "   vColor = vec4(aColor.rgb * aColor.a, aColor.a);", "}"].join("\n"), ["precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform vec4 uFrame;", "uniform vec2 uPixelSize;", "void main(void){", "   vec2 coord = mod(vTextureCoord, uFrame.zw);", "   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);", "   coord += uFrame.xy;", "   gl_FragColor =  texture2D(uSampler, coord) * vColor ;", "}"].join("\n"), { uFrame: { type: "4fv", value: [0, 0, 1, 1] }, uTransform: { type: "4fv", value: [0, 0, 1, 1] }, uPixelSize: { type: "2fv", value: [1, 1] } });
	      }var n = t("../core"),
	          o = new n.Point();i.prototype = Object.create(n.Sprite.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { width: { get: function get() {
	            return this._width;
	          }, set: function set(t) {
	            this._width = t;
	          } }, height: { get: function get() {
	            return this._height;
	          }, set: function set(t) {
	            this._height = t;
	          } } }), i.prototype._onTextureUpdate = function () {}, i.prototype._renderWebGL = function (t) {
	        var e = this._texture;if (e && e._uvs) {
	          var r = e._uvs,
	              i = e._frame.width,
	              n = e._frame.height,
	              o = e.baseTexture.width,
	              s = e.baseTexture.height;e._uvs = this._uvs, e._frame.width = this.width, e._frame.height = this.height, this.shader.uniforms.uPixelSize.value[0] = 1 / o, this.shader.uniforms.uPixelSize.value[1] = 1 / s, this.shader.uniforms.uFrame.value[0] = r.x0, this.shader.uniforms.uFrame.value[1] = r.y0, this.shader.uniforms.uFrame.value[2] = r.x1 - r.x0, this.shader.uniforms.uFrame.value[3] = r.y2 - r.y0, this.shader.uniforms.uTransform.value[0] = this.tilePosition.x % (i * this.tileScale.x) / this._width, this.shader.uniforms.uTransform.value[1] = this.tilePosition.y % (n * this.tileScale.y) / this._height, this.shader.uniforms.uTransform.value[2] = o / this._width * this.tileScale.x, this.shader.uniforms.uTransform.value[3] = s / this._height * this.tileScale.y, t.setObjectRenderer(t.plugins.sprite), t.plugins.sprite.render(this), e._uvs = r, e._frame.width = i, e._frame.height = n;
	        }
	      }, i.prototype._renderCanvas = function (t) {
	        var e = this._texture;if (e.baseTexture.hasLoaded) {
	          var r = t.context,
	              i = this.worldTransform,
	              o = t.resolution,
	              s = e.baseTexture,
	              a = this.tilePosition.x % (e._frame.width * this.tileScale.x),
	              h = this.tilePosition.y % (e._frame.height * this.tileScale.y);if (!this._canvasPattern) {
	            var l = new n.CanvasBuffer(e._frame.width, e._frame.height);l.context.drawImage(s.source, -e._frame.x, -e._frame.y), this._canvasPattern = l.context.createPattern(l.canvas, "repeat");
	          }r.globalAlpha = this.worldAlpha, r.setTransform(i.a * o, i.b * o, i.c * o, i.d * o, i.tx * o, i.ty * o), r.scale(this.tileScale.x, this.tileScale.y), r.translate(a + this.anchor.x * -this._width, h + this.anchor.y * -this._height), this.blendMode !== t.currentBlendMode && (t.currentBlendMode = this.blendMode, r.globalCompositeOperation = t.blendModes[t.currentBlendMode]), r.fillStyle = this._canvasPattern, r.fillRect(-a, -h, this._width / this.tileScale.x, this._height / this.tileScale.y);
	        }
	      }, i.prototype.getBounds = function () {
	        var t,
	            e,
	            r,
	            i,
	            n = this._width,
	            o = this._height,
	            s = n * (1 - this.anchor.x),
	            a = n * -this.anchor.x,
	            h = o * (1 - this.anchor.y),
	            l = o * -this.anchor.y,
	            u = this.worldTransform,
	            c = u.a,
	            p = u.b,
	            d = u.c,
	            f = u.d,
	            v = u.tx,
	            g = u.ty,
	            m = c * a + d * l + v,
	            y = f * l + p * a + g,
	            x = c * s + d * l + v,
	            b = f * l + p * s + g,
	            _ = c * s + d * h + v,
	            T = f * h + p * s + g,
	            E = c * a + d * h + v,
	            S = f * h + p * a + g;t = m, t = t > x ? x : t, t = t > _ ? _ : t, t = t > E ? E : t, r = y, r = r > b ? b : r, r = r > T ? T : r, r = r > S ? S : r, e = m, e = x > e ? x : e, e = _ > e ? _ : e, e = E > e ? E : e, i = y, i = b > i ? b : i, i = T > i ? T : i, i = S > i ? S : i;var A = this._bounds;return A.x = t, A.width = e - t, A.y = r, A.height = i - r, this._currentBounds = A, A;
	      }, i.prototype.containsPoint = function (t) {
	        this.worldTransform.applyInverse(t, o);var e,
	            r = this._width,
	            i = this._height,
	            n = -r * this.anchor.x;return o.x > n && o.x < n + r && (e = -i * this.anchor.y, o.y > e && o.y < e + i) ? !0 : !1;
	      }, i.prototype.destroy = function () {
	        n.Sprite.prototype.destroy.call(this), this.tileScale = null, this._tileScaleOffset = null, this.tilePosition = null, this._uvs = null;
	      }, i.fromFrame = function (t, e, r) {
	        var o = n.utils.TextureCache[t];if (!o) throw new Error('The frameId "' + t + '" does not exist in the texture cache ' + this);return new i(o, e, r);
	      }, i.fromImage = function (t, e, r, o, s) {
	        return new i(n.Texture.fromImage(t, o, s), e, r);
	      };
	    }, { "../core": 29 }], 82: [function (t, e, r) {
	      var i = t("../core"),
	          n = i.DisplayObject,
	          o = new i.Matrix();n.prototype._cacheAsBitmap = !1, n.prototype._originalRenderWebGL = null, n.prototype._originalRenderCanvas = null, n.prototype._originalUpdateTransform = null, n.prototype._originalHitTest = null, n.prototype._originalDestroy = null, n.prototype._cachedSprite = null, Object.defineProperties(n.prototype, { cacheAsBitmap: { get: function get() {
	            return this._cacheAsBitmap;
	          }, set: function set(t) {
	            this._cacheAsBitmap !== t && (this._cacheAsBitmap = t, t ? (this._originalRenderWebGL = this.renderWebGL, this._originalRenderCanvas = this.renderCanvas, this._originalUpdateTransform = this.updateTransform, this._originalGetBounds = this.getBounds, this._originalDestroy = this.destroy, this._originalContainsPoint = this.containsPoint, this.renderWebGL = this._renderCachedWebGL, this.renderCanvas = this._renderCachedCanvas, this.destroy = this._cacheAsBitmapDestroy) : (this._cachedSprite && this._destroyCachedDisplayObject(), this.renderWebGL = this._originalRenderWebGL, this.renderCanvas = this._originalRenderCanvas, this.getBounds = this._originalGetBounds, this.destroy = this._originalDestroy, this.updateTransform = this._originalUpdateTransform, this.containsPoint = this._originalContainsPoint));
	          } } }), n.prototype._renderCachedWebGL = function (t) {
	        !this.visible || this.worldAlpha <= 0 || !this.renderable || (this._initCachedDisplayObject(t), this._cachedSprite.worldAlpha = this.worldAlpha, t.setObjectRenderer(t.plugins.sprite), t.plugins.sprite.render(this._cachedSprite));
	      }, n.prototype._initCachedDisplayObject = function (t) {
	        if (!this._cachedSprite) {
	          t.currentRenderer.flush();var e = this.getLocalBounds().clone();if (this._filters) {
	            var r = this._filters[0].padding;e.x -= r, e.y -= r, e.width += 2 * r, e.height += 2 * r;
	          }var n = t.currentRenderTarget,
	              s = t.filterManager.filterStack,
	              a = new i.RenderTexture(t, 0 | e.width, 0 | e.height),
	              h = o;h.tx = -e.x, h.ty = -e.y, this.renderWebGL = this._originalRenderWebGL, a.render(this, h, !0, !0), t.setRenderTarget(n), t.filterManager.filterStack = s, this.renderWebGL = this._renderCachedWebGL, this.updateTransform = this.displayObjectUpdateTransform, this.getBounds = this._getCachedBounds, this._cachedSprite = new i.Sprite(a), this._cachedSprite.worldTransform = this.worldTransform, this._cachedSprite.anchor.x = -(e.x / e.width), this._cachedSprite.anchor.y = -(e.y / e.height), this.updateTransform(), this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
	        }
	      }, n.prototype._renderCachedCanvas = function (t) {
	        !this.visible || this.worldAlpha <= 0 || !this.renderable || (this._initCachedDisplayObjectCanvas(t), this._cachedSprite.worldAlpha = this.worldAlpha, this._cachedSprite.renderCanvas(t));
	      }, n.prototype._initCachedDisplayObjectCanvas = function (t) {
	        if (!this._cachedSprite) {
	          var e = this.getLocalBounds(),
	              r = t.context,
	              n = new i.RenderTexture(t, 0 | e.width, 0 | e.height),
	              s = o;s.tx = -e.x, s.ty = -e.y, this.renderCanvas = this._originalRenderCanvas, n.render(this, s, !0), t.context = r, this.renderCanvas = this._renderCachedCanvas, this.updateTransform = this.displayObjectUpdateTransform, this.getBounds = this._getCachedBounds, this._cachedSprite = new i.Sprite(n), this._cachedSprite.worldTransform = this.worldTransform, this._cachedSprite.anchor.x = -(e.x / e.width), this._cachedSprite.anchor.y = -(e.y / e.height), this.updateTransform(), this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
	        }
	      }, n.prototype._getCachedBounds = function () {
	        return this._cachedSprite._currentBounds = null, this._cachedSprite.getBounds();
	      }, n.prototype._destroyCachedDisplayObject = function () {
	        this._cachedSprite._texture.destroy(), this._cachedSprite = null;
	      }, n.prototype._cacheAsBitmapDestroy = function () {
	        this.cacheAsBitmap = !1, this._originalDestroy();
	      };
	    }, { "../core": 29 }], 83: [function (t, e, r) {
	      var i = t("../core");i.DisplayObject.prototype.name = null, i.Container.prototype.getChildByName = function (t) {
	        for (var e = 0; e < this.children.length; e++) {
	          if (this.children[e].name === t) return this.children[e];
	        }return null;
	      };
	    }, { "../core": 29 }], 84: [function (t, e, r) {
	      var i = t("../core");i.DisplayObject.prototype.getGlobalPosition = function (t) {
	        return t = t || new i.Point(), this.parent ? (this.displayObjectUpdateTransform(), t.x = this.worldTransform.tx, t.y = this.worldTransform.ty) : (t.x = this.position.x, t.y = this.position.y), t;
	      };
	    }, { "../core": 29 }], 85: [function (t, e, r) {
	      t("./cacheAsBitmap"), t("./getChildByName"), t("./getGlobalPosition"), e.exports = { MovieClip: t("./MovieClip"), TilingSprite: t("./TilingSprite"), BitmapText: t("./BitmapText") };
	    }, { "./BitmapText": 79, "./MovieClip": 80, "./TilingSprite": 81, "./cacheAsBitmap": 82, "./getChildByName": 83, "./getGlobalPosition": 84 }], 86: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nuniform vec4 dimensions;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nfloat character(float n, vec2 p)\n{\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\n    if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)\n    {\n        if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n    }\n    return 0.0;\n}\n\nvoid main()\n{\n    vec2 uv = gl_FragCoord.xy;\n\n    vec3 col = texture2D(uSampler, floor( uv / pixelSize ) * pixelSize / dimensions.xy).rgb;\n\n    float gray = (col.r + col.g + col.b) / 3.0;\n\n    float n =  65536.0;             // .\n    if (gray > 0.2) n = 65600.0;    // :\n    if (gray > 0.3) n = 332772.0;   // *\n    if (gray > 0.4) n = 15255086.0; // o\n    if (gray > 0.5) n = 23385164.0; // &\n    if (gray > 0.6) n = 15252014.0; // 8\n    if (gray > 0.7) n = 13199452.0; // @\n    if (gray > 0.8) n = 11512810.0; // #\n\n    vec2 p = mod( uv / ( pixelSize * 0.5 ), 2.0) - vec2(1.0);\n    col = col * character(n, p);\n\n    gl_FragColor = vec4(col, 1.0);\n}\n", { dimensions: { type: "4fv", value: new Float32Array([0, 0, 0, 0]) }, pixelSize: { type: "1f", value: 8 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { size: { get: function get() {
	            return this.uniforms.pixelSize.value;
	          }, set: function set(t) {
	            this.uniforms.pixelSize.value = t;
	          } } });
	    }, { "../../core": 29 }], 87: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this), this.blurXFilter = new o(), this.blurYFilter = new s(), this.defaultFilter = new n.AbstractFilter();
	      }var n = t("../../core"),
	          o = t("../blur/BlurXFilter"),
	          s = t("../blur/BlurYFilter");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager.getRenderTarget(!0);this.defaultFilter.applyFilter(t, e, r), this.blurXFilter.applyFilter(t, e, i), t.blendModeManager.setBlendMode(n.BLEND_MODES.SCREEN), this.blurYFilter.applyFilter(t, i, r), t.blendModeManager.setBlendMode(n.BLEND_MODES.NORMAL), t.filterManager.returnRenderTarget(i);
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.blurXFilter.blur;
	          }, set: function set(t) {
	            this.blurXFilter.blur = this.blurYFilter.blur = t;
	          } }, blurX: { get: function get() {
	            return this.blurXFilter.blur;
	          }, set: function set(t) {
	            this.blurXFilter.blur = t;
	          } }, blurY: { get: function get() {
	            return this.blurYFilter.blur;
	          }, set: function set(t) {
	            this.blurYFilter.blur = t;
	          } } });
	    }, { "../../core": 29, "../blur/BlurXFilter": 90, "../blur/BlurYFilter": 91 }], 88: [function (t, e, r) {
	      function i(t, e) {
	        n.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform float dirX;\nuniform float dirY;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[3];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[0] = aTextureCoord + vec2( (0.004 * strength) * dirX, (0.004 * strength) * dirY );\n    vBlurTexCoords[1] = aTextureCoord + vec2( (0.008 * strength) * dirX, (0.008 * strength) * dirY );\n    vBlurTexCoords[2] = aTextureCoord + vec2( (0.012 * strength) * dirX, (0.012 * strength) * dirY );\n\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[3];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vTextureCoord     ) * 0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0]) * 0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1]) * 0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2]) * 0.004431848411938341;\n}\n", { strength: { type: "1f", value: 1 }, dirX: { type: "1f", value: t || 0 }, dirY: { type: "1f", value: e || 0 } }), this.defaultFilter = new n.AbstractFilter(), this.passes = 1, this.dirX = t || 0, this.dirY = e || 0, this.strength = 4;
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r, i) {
	        var n = this.getShader(t);if (this.uniforms.strength.value = this.strength / 4 / this.passes * (e.frame.width / e.size.width), 1 === this.passes) t.filterManager.applyFilter(n, e, r, i);else {
	          var o = t.filterManager.getRenderTarget(!0);t.filterManager.applyFilter(n, e, o, i);for (var s = 0; s < this.passes - 2; s++) {
	            t.filterManager.applyFilter(n, o, o, i);
	          }t.filterManager.applyFilter(n, o, r, i), t.filterManager.returnRenderTarget(o);
	        }
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.strength;
	          }, set: function set(t) {
	            this.padding = .5 * t, this.strength = t;
	          } }, dirX: { get: function get() {
	            return this.dirX;
	          }, set: function set(t) {
	            this.uniforms.dirX.value = t;
	          } }, dirY: { get: function get() {
	            return this.dirY;
	          }, set: function set(t) {
	            this.uniforms.dirY.value = t;
	          } } });
	    }, { "../../core": 29 }], 89: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this), this.blurXFilter = new o(), this.blurYFilter = new s();
	      }var n = t("../../core"),
	          o = t("./BlurXFilter"),
	          s = t("./BlurYFilter");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager.getRenderTarget(!0);this.blurXFilter.applyFilter(t, e, i), this.blurYFilter.applyFilter(t, i, r), t.filterManager.returnRenderTarget(i);
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.blurXFilter.blur;
	          }, set: function set(t) {
	            this.padding = .5 * Math.abs(t), this.blurXFilter.blur = this.blurYFilter.blur = t;
	          } }, passes: { get: function get() {
	            return this.blurXFilter.passes;
	          }, set: function set(t) {
	            this.blurXFilter.passes = this.blurYFilter.passes = t;
	          } }, blurX: { get: function get() {
	            return this.blurXFilter.blur;
	          }, set: function set(t) {
	            this.blurXFilter.blur = t;
	          } }, blurY: { get: function get() {
	            return this.blurYFilter.blur;
	          }, set: function set(t) {
	            this.blurYFilter.blur = t;
	          } } });
	    }, { "../../core": 29, "./BlurXFilter": 90, "./BlurYFilter": 91 }], 90: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.012 * strength, 0.0);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(-0.008 * strength, 0.0);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.004 * strength, 0.0);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2( 0.004 * strength, 0.0);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2( 0.008 * strength, 0.0);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2( 0.012 * strength, 0.0);\n\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n}\n", { strength: { type: "1f", value: 1 } }), this.passes = 1, this.strength = 4;
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r, i) {
	        var n = this.getShader(t);if (this.uniforms.strength.value = this.strength / 4 / this.passes * (e.frame.width / e.size.width), 1 === this.passes) t.filterManager.applyFilter(n, e, r, i);else {
	          for (var o = t.filterManager.getRenderTarget(!0), s = e, a = o, h = 0; h < this.passes - 1; h++) {
	            t.filterManager.applyFilter(n, s, a, !0);var l = a;a = s, s = l;
	          }t.filterManager.applyFilter(n, s, r, i), t.filterManager.returnRenderTarget(o);
	        }
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.strength;
	          }, set: function set(t) {
	            this.padding = .5 * Math.abs(t), this.strength = t;
	          } } });
	    }, { "../../core": 29 }], 91: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);\n\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n}\n", { strength: { type: "1f", value: 1 } }), this.passes = 1, this.strength = 4;
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r, i) {
	        var n = this.getShader(t);if (this.uniforms.strength.value = Math.abs(this.strength) / 4 / this.passes * (e.frame.height / e.size.height), 1 === this.passes) t.filterManager.applyFilter(n, e, r, i);else {
	          for (var o = t.filterManager.getRenderTarget(!0), s = e, a = o, h = 0; h < this.passes - 1; h++) {
	            t.filterManager.applyFilter(n, s, a, !0);var l = a;a = s, s = l;
	          }t.filterManager.applyFilter(n, s, r, i), t.filterManager.returnRenderTarget(o);
	        }
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.strength;
	          }, set: function set(t) {
	            this.padding = .5 * Math.abs(t), this.strength = t;
	          } } });
	    }, { "../../core": 29 }], 92: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 delta;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta * percent);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n", { delta: { type: "v2", value: { x: .1, y: 0 } } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i;
	    }, { "../../core": 29 }], 93: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[25];\n\nvoid main(void)\n{\n\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.r = (m[0] * c.r);\n        gl_FragColor.r += (m[1] * c.g);\n        gl_FragColor.r += (m[2] * c.b);\n        gl_FragColor.r += (m[3] * c.a);\n        gl_FragColor.r += m[4];\n\n    gl_FragColor.g = (m[5] * c.r);\n        gl_FragColor.g += (m[6] * c.g);\n        gl_FragColor.g += (m[7] * c.b);\n        gl_FragColor.g += (m[8] * c.a);\n        gl_FragColor.g += m[9];\n\n     gl_FragColor.b = (m[10] * c.r);\n        gl_FragColor.b += (m[11] * c.g);\n        gl_FragColor.b += (m[12] * c.b);\n        gl_FragColor.b += (m[13] * c.a);\n        gl_FragColor.b += m[14];\n\n     gl_FragColor.a = (m[15] * c.r);\n        gl_FragColor.a += (m[16] * c.g);\n        gl_FragColor.a += (m[17] * c.b);\n        gl_FragColor.a += (m[18] * c.a);\n        gl_FragColor.a += m[19];\n\n}\n", { m: { type: "1fv", value: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype._loadMatrix = function (t, e) {
	        e = !!e;var r = t;e && (this._multiply(r, this.uniforms.m.value, t), r = this._colorMatrix(r)), this.uniforms.m.value = r;
	      }, i.prototype._multiply = function (t, e, r) {
	        return t[0] = e[0] * r[0] + e[1] * r[5] + e[2] * r[10] + e[3] * r[15], t[1] = e[0] * r[1] + e[1] * r[6] + e[2] * r[11] + e[3] * r[16], t[2] = e[0] * r[2] + e[1] * r[7] + e[2] * r[12] + e[3] * r[17], t[3] = e[0] * r[3] + e[1] * r[8] + e[2] * r[13] + e[3] * r[18], t[4] = e[0] * r[4] + e[1] * r[9] + e[2] * r[14] + e[3] * r[19], t[5] = e[5] * r[0] + e[6] * r[5] + e[7] * r[10] + e[8] * r[15], t[6] = e[5] * r[1] + e[6] * r[6] + e[7] * r[11] + e[8] * r[16], t[7] = e[5] * r[2] + e[6] * r[7] + e[7] * r[12] + e[8] * r[17], t[8] = e[5] * r[3] + e[6] * r[8] + e[7] * r[13] + e[8] * r[18], t[9] = e[5] * r[4] + e[6] * r[9] + e[7] * r[14] + e[8] * r[19], t[10] = e[10] * r[0] + e[11] * r[5] + e[12] * r[10] + e[13] * r[15], t[11] = e[10] * r[1] + e[11] * r[6] + e[12] * r[11] + e[13] * r[16], t[12] = e[10] * r[2] + e[11] * r[7] + e[12] * r[12] + e[13] * r[17], t[13] = e[10] * r[3] + e[11] * r[8] + e[12] * r[13] + e[13] * r[18], t[14] = e[10] * r[4] + e[11] * r[9] + e[12] * r[14] + e[13] * r[19], t[15] = e[15] * r[0] + e[16] * r[5] + e[17] * r[10] + e[18] * r[15], t[16] = e[15] * r[1] + e[16] * r[6] + e[17] * r[11] + e[18] * r[16], t[17] = e[15] * r[2] + e[16] * r[7] + e[17] * r[12] + e[18] * r[17], t[18] = e[15] * r[3] + e[16] * r[8] + e[17] * r[13] + e[18] * r[18], t[19] = e[15] * r[4] + e[16] * r[9] + e[17] * r[14] + e[18] * r[19], t;
	      }, i.prototype._colorMatrix = function (t) {
	        var e = new Float32Array(t);return e[4] /= 255, e[9] /= 255, e[14] /= 255, e[19] /= 255, e;
	      }, i.prototype.brightness = function (t, e) {
	        var r = [t, 0, 0, 0, 0, 0, t, 0, 0, 0, 0, 0, t, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(r, e);
	      }, i.prototype.greyscale = function (t, e) {
	        var r = [t, t, t, 0, 0, t, t, t, 0, 0, t, t, t, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(r, e);
	      }, i.prototype.grayscale = i.prototype.greyscale, i.prototype.blackAndWhite = function (t) {
	        var e = [.3, .6, .1, 0, 0, .3, .6, .1, 0, 0, .3, .6, .1, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.hue = function (t, e) {
	        t = (t || 0) / 180 * Math.PI;var r = Math.cos(t),
	            i = Math.sin(t),
	            n = .213,
	            o = .715,
	            s = .072,
	            a = [n + r * (1 - n) + i * -n, o + r * -o + i * -o, s + r * -s + i * (1 - s), 0, 0, n + r * -n + .143 * i, o + r * (1 - o) + .14 * i, s + r * -s + i * -.283, 0, 0, n + r * -n + i * -(1 - n), o + r * -o + i * o, s + r * (1 - s) + i * s, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(a, e);
	      }, i.prototype.contrast = function (t, e) {
	        var r = (t || 0) + 1,
	            i = -128 * (r - 1),
	            n = [r, 0, 0, 0, i, 0, r, 0, 0, i, 0, 0, r, 0, i, 0, 0, 0, 1, 0];this._loadMatrix(n, e);
	      }, i.prototype.saturate = function (t, e) {
	        var r = 2 * (t || 0) / 3 + 1,
	            i = (r - 1) * -.5,
	            n = [r, i, i, 0, 0, i, r, i, 0, 0, i, i, r, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(n, e);
	      }, i.prototype.desaturate = function (t) {
	        this.saturate(-1);
	      }, i.prototype.negative = function (t) {
	        var e = [0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.sepia = function (t) {
	        var e = [.393, .7689999, .18899999, 0, 0, .349, .6859999, .16799999, 0, 0, .272, .5339999, .13099999, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.technicolor = function (t) {
	        var e = [1.9125277891456083, -.8545344976951645, -.09155508482755585, 0, 11.793603434377337, -.3087833385928097, 1.7658908555458428, -.10601743074722245, 0, -70.35205161461398, -.231103377548616, -.7501899197440212, 1.847597816108189, 0, 30.950940869491138, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.polaroid = function (t) {
	        var e = [1.438, -.062, -.062, 0, 0, -.122, 1.378, -.122, 0, 0, -.016, -.016, 1.483, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.toBGR = function (t) {
	        var e = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.kodachrome = function (t) {
	        var e = [1.1285582396593525, -.3967382283601348, -.03992559172921793, 0, 63.72958762196502, -.16404339962244616, 1.0835251566291304, -.05498805115633132, 0, 24.732407896706203, -.16786010706155763, -.5603416277695248, 1.6014850761964943, 0, 35.62982807460946, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.browni = function (t) {
	        var e = [.5997023498159715, .34553243048391263, -.2708298674538042, 0, 47.43192855600873, -.037703249837783157, .8609577587992641, .15059552388459913, 0, -36.96841498319127, .24113635128153335, -.07441037908422492, .44972182064877153, 0, -7.562075277591283, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.vintage = function (t) {
	        var e = [.6279345635605994, .3202183420819367, -.03965408211312453, 0, 9.651285835294123, .02578397704808868, .6441188644374771, .03259127616149294, 0, 7.462829176470591, .0466055556782719, -.0851232987247891, .5241648018700465, 0, 5.159190588235296, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.colorTone = function (t, e, r, i, n) {
	        t = t || .2, e = e || .15, r = r || 16770432, i = i || 3375104;var o = (r >> 16 & 255) / 255,
	            s = (r >> 8 & 255) / 255,
	            a = (255 & r) / 255,
	            h = (i >> 16 & 255) / 255,
	            l = (i >> 8 & 255) / 255,
	            u = (255 & i) / 255,
	            c = [.3, .59, .11, 0, 0, o, s, a, t, 0, h, l, u, e, 0, o - h, s - l, a - u, 0, 0];this._loadMatrix(c, n);
	      }, i.prototype.night = function (t, e) {
	        t = t || .1;var r = [-2 * t, -t, 0, 0, 0, -t, 0, t, 0, 0, 0, t, 2 * t, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(r, e);
	      }, i.prototype.predator = function (t, e) {
	        var r = [11.224130630493164 * t, -4.794486999511719 * t, -2.8746118545532227 * t, 0 * t, .40342438220977783 * t, -3.6330697536468506 * t, 9.193157196044922 * t, -2.951810836791992 * t, 0 * t, -1.316135048866272 * t, -3.2184197902679443 * t, -4.2375030517578125 * t, 7.476448059082031 * t, 0 * t, .8044459223747253 * t, 0, 0, 0, 1, 0];this._loadMatrix(r, e);
	      }, i.prototype.lsd = function (t) {
	        var e = [2, -.4, .5, 0, 0, -.5, 2, -.4, 0, 0, -.4, -.5, 3, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(e, t);
	      }, i.prototype.reset = function () {
	        var t = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];this._loadMatrix(t, !1);
	      }, Object.defineProperties(i.prototype, { matrix: { get: function get() {
	            return this.uniforms.m.value;
	          }, set: function set(t) {
	            this.uniforms.m.value = t;
	          } } });
	    }, { "../../core": 29 }], 94: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float step;\n\nvoid main(void)\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    color = floor(color * step) / step;\n\n    gl_FragColor = color;\n}\n", { step: { type: "1f", value: 5 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { step: { get: function get() {
	            return this.uniforms.step.value;
	          }, set: function set(t) {
	            this.uniforms.step.value = t;
	          } } });
	    }, { "../../core": 29 }], 95: [function (t, e, r) {
	      function i(t, e, r) {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n", { matrix: { type: "1fv", value: new Float32Array(t) }, texelSize: { type: "v2", value: { x: 1 / e, y: 1 / r } } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { matrix: { get: function get() {
	            return this.uniforms.matrix.value;
	          }, set: function set(t) {
	            this.uniforms.matrix.value = new Float32Array(t);
	          } }, width: { get: function get() {
	            return 1 / this.uniforms.texelSize.value.x;
	          }, set: function set(t) {
	            this.uniforms.texelSize.value.x = 1 / t;
	          } }, height: { get: function get() {
	            return 1 / this.uniforms.texelSize.value.y;
	          }, set: function set(t) {
	            this.uniforms.texelSize.value.y = 1 / t;
	          } } });
	    }, { "../../core": 29 }], 96: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n    if (lum < 1.00)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n}\n");
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i;
	    }, { "../../core": 29 }], 97: [function (t, e, r) {
	      function i(t) {
	        var e = new n.Matrix();t.renderable = !1, n.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec2 scale;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nvoid main(void)\n{\n   vec4 original =  texture2D(uSampler, vTextureCoord);\n   vec4 map =  texture2D(mapSampler, vMapCoord);\n\n   map -= 0.5;\n   map.xy *= scale;\n\n   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y));\n}\n", { mapSampler: { type: "sampler2D", value: t.texture }, otherMatrix: { type: "mat3", value: e.toArray(!0) }, scale: { type: "v2", value: { x: 1, y: 1 } } }), this.maskSprite = t, this.maskMatrix = e, this.scale = new n.Point(20, 20);
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager;i.calculateMappedMatrix(e.frame, this.maskSprite, this.maskMatrix), this.uniforms.otherMatrix.value = this.maskMatrix.toArray(!0), this.uniforms.scale.value.x = this.scale.x * (1 / e.frame.width), this.uniforms.scale.value.y = this.scale.y * (1 / e.frame.height);var n = this.getShader(t);i.applyFilter(n, e, r);
	      }, Object.defineProperties(i.prototype, { map: { get: function get() {
	            return this.uniforms.mapSampler.value;
	          }, set: function set(t) {
	            this.uniforms.mapSampler.value = t;
	          } } });
	    }, { "../../core": 29 }], 98: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 dimensions;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * dimensions.xy;\n   vec2 point = vec2(\n       c * tex.x - s * tex.y,\n       s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n", { scale: { type: "1f", value: 1 }, angle: { type: "1f", value: 5 }, dimensions: { type: "4fv", value: [0, 0, 0, 0] } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { scale: { get: function get() {
	            return this.uniforms.scale.value;
	          }, set: function set(t) {
	            this.uniforms.scale.value = t;
	          } }, angle: { get: function get() {
	            return this.uniforms.angle.value;
	          }, set: function set(t) {
	            this.uniforms.angle.value = t;
	          } } });
	    }, { "../../core": 29 }], 99: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform vec2 offset;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition+offset), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);\n\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n", "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform vec3 color;\nuniform float alpha;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec4 sum = vec4(0.0);\n\n    sum += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    sum += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    sum += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    sum += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    sum += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    sum += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    sum += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n\n    gl_FragColor = vec4( color.rgb * sum.a * alpha, sum.a * alpha );\n}\n", { blur: { type: "1f", value: 1 / 512 }, color: { type: "c", value: [0, 0, 0] }, alpha: { type: "1f", value: .7 }, offset: { type: "2f", value: [5, 5] }, strength: { type: "1f", value: 1 } }), this.passes = 1, this.strength = 4;
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r, i) {
	        var n = this.getShader(t);if (this.uniforms.strength.value = this.strength / 4 / this.passes * (e.frame.height / e.size.height), 1 === this.passes) t.filterManager.applyFilter(n, e, r, i);else {
	          for (var o = t.filterManager.getRenderTarget(!0), s = e, a = o, h = 0; h < this.passes - 1; h++) {
	            t.filterManager.applyFilter(n, s, a, i);var l = a;a = s, s = l;
	          }t.filterManager.applyFilter(n, s, r, i), t.filterManager.returnRenderTarget(o);
	        }
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.strength;
	          }, set: function set(t) {
	            this.padding = .5 * t, this.strength = t;
	          } } });
	    }, { "../../core": 29 }], 100: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this), this.blurXFilter = new o(), this.blurYTintFilter = new s(), this.defaultFilter = new n.AbstractFilter(), this.padding = 30, this._dirtyPosition = !0, this._angle = 45 * Math.PI / 180, this._distance = 10, this.alpha = .75, this.hideObject = !1, this.blendMode = n.BLEND_MODES.MULTIPLY;
	      }var n = t("../../core"),
	          o = t("../blur/BlurXFilter"),
	          s = t("./BlurYTintFilter");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager.getRenderTarget(!0);this._dirtyPosition && (this._dirtyPosition = !1, this.blurYTintFilter.uniforms.offset.value[0] = Math.sin(this._angle) * this._distance, this.blurYTintFilter.uniforms.offset.value[1] = Math.cos(this._angle) * this._distance), this.blurXFilter.applyFilter(t, e, i), t.blendModeManager.setBlendMode(this.blendMode), this.blurYTintFilter.applyFilter(t, i, r), t.blendModeManager.setBlendMode(n.BLEND_MODES.NORMAL), this.hideObject || this.defaultFilter.applyFilter(t, e, r), t.filterManager.returnRenderTarget(i);
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.blurXFilter.blur;
	          }, set: function set(t) {
	            this.blurXFilter.blur = this.blurYTintFilter.blur = t;
	          } }, blurX: { get: function get() {
	            return this.blurXFilter.blur;
	          }, set: function set(t) {
	            this.blurXFilter.blur = t;
	          } }, blurY: { get: function get() {
	            return this.blurYTintFilter.blur;
	          }, set: function set(t) {
	            this.blurYTintFilter.blur = t;
	          } }, color: { get: function get() {
	            return n.utils.rgb2hex(this.blurYTintFilter.uniforms.color.value);
	          }, set: function set(t) {
	            this.blurYTintFilter.uniforms.color.value = n.utils.hex2rgb(t);
	          } }, alpha: { get: function get() {
	            return this.blurYTintFilter.uniforms.alpha.value;
	          }, set: function set(t) {
	            this.blurYTintFilter.uniforms.alpha.value = t;
	          } }, distance: { get: function get() {
	            return this._distance;
	          }, set: function set(t) {
	            this._dirtyPosition = !0, this._distance = t;
	          } }, angle: { get: function get() {
	            return this._angle;
	          }, set: function set(t) {
	            this._dirtyPosition = !0, this._angle = t;
	          } } });
	    }, { "../../core": 29, "../blur/BlurXFilter": 90, "./BlurYTintFilter": 99 }], 101: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform float gray;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);\n}\n", { gray: { type: "1f", value: 1 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { gray: { get: function get() {
	            return this.uniforms.gray.value;
	          }, set: function set(t) {
	            this.uniforms.gray.value = t;
	          } } });
	    }, { "../../core": 29 }], 102: [function (t, e, r) {
	      e.exports = { AsciiFilter: t("./ascii/AsciiFilter"), BloomFilter: t("./bloom/BloomFilter"), BlurFilter: t("./blur/BlurFilter"), BlurXFilter: t("./blur/BlurXFilter"), BlurYFilter: t("./blur/BlurYFilter"), BlurDirFilter: t("./blur/BlurDirFilter"), ColorMatrixFilter: t("./color/ColorMatrixFilter"), ColorStepFilter: t("./color/ColorStepFilter"), ConvolutionFilter: t("./convolution/ConvolutionFilter"), CrossHatchFilter: t("./crosshatch/CrossHatchFilter"), DisplacementFilter: t("./displacement/DisplacementFilter"), DotScreenFilter: t("./dot/DotScreenFilter"), GrayFilter: t("./gray/GrayFilter"), DropShadowFilter: t("./dropshadow/DropShadowFilter"), InvertFilter: t("./invert/InvertFilter"), NoiseFilter: t("./noise/NoiseFilter"), NormalMapFilter: t("./normal/NormalMapFilter"), PixelateFilter: t("./pixelate/PixelateFilter"), RGBSplitFilter: t("./rgb/RGBSplitFilter"), ShockwaveFilter: t("./shockwave/ShockwaveFilter"), SepiaFilter: t("./sepia/SepiaFilter"), SmartBlurFilter: t("./blur/SmartBlurFilter"), TiltShiftFilter: t("./tiltshift/TiltShiftFilter"), TiltShiftXFilter: t("./tiltshift/TiltShiftXFilter"), TiltShiftYFilter: t("./tiltshift/TiltShiftYFilter"), TwistFilter: t("./twist/TwistFilter") };
	    }, { "./ascii/AsciiFilter": 86, "./bloom/BloomFilter": 87, "./blur/BlurDirFilter": 88, "./blur/BlurFilter": 89, "./blur/BlurXFilter": 90, "./blur/BlurYFilter": 91, "./blur/SmartBlurFilter": 92, "./color/ColorMatrixFilter": 93, "./color/ColorStepFilter": 94, "./convolution/ConvolutionFilter": 95, "./crosshatch/CrossHatchFilter": 96, "./displacement/DisplacementFilter": 97, "./dot/DotScreenFilter": 98, "./dropshadow/DropShadowFilter": 100, "./gray/GrayFilter": 101, "./invert/InvertFilter": 103, "./noise/NoiseFilter": 104, "./normal/NormalMapFilter": 105, "./pixelate/PixelateFilter": 106, "./rgb/RGBSplitFilter": 107, "./sepia/SepiaFilter": 108, "./shockwave/ShockwaveFilter": 109, "./tiltshift/TiltShiftFilter": 111, "./tiltshift/TiltShiftXFilter": 112, "./tiltshift/TiltShiftYFilter": 113, "./twist/TwistFilter": 114 }], 103: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform float invert;\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);\n}\n", { invert: { type: "1f", value: 1 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { invert: { get: function get() {
	            return this.uniforms.invert.value;
	          }, set: function set(t) {
	            this.uniforms.invert.value = t;
	          } } });
	    }, { "../../core": 29 }], 104: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float noise;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    float diff = (rand(vTextureCoord) - 0.5) * noise;\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    gl_FragColor = color;\n}\n", { noise: { type: "1f", value: .5 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { noise: { get: function get() {
	            return this.uniforms.noise.value;
	          }, set: function set(t) {
	            this.uniforms.noise.value = t;
	          } } });
	    }, { "../../core": 29 }], 105: [function (t, e, r) {
	      function i(t) {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D displacementMap;\nuniform sampler2D uSampler;\n\nuniform vec4 dimensions;\n\nconst vec2 Resolution = vec2(1.0,1.0);      //resolution of screen\nuniform vec3 LightPos;    //light position, normalized\nconst vec4 LightColor = vec4(1.0, 1.0, 1.0, 1.0);      //light RGBA -- alpha is intensity\nconst vec4 AmbientColor = vec4(1.0, 1.0, 1.0, 0.5);    //ambient RGBA -- alpha is intensity\nconst vec3 Falloff = vec3(0.0, 1.0, 0.2);         //attenuation coefficients\n\nuniform vec3 LightDir; // = vec3(1.0, 0.0, 1.0);\n\nuniform vec2 mapDimensions; // = vec2(256.0, 256.0);\n\n\nvoid main(void)\n{\n    vec2 mapCords = vTextureCoord.xy;\n\n    vec4 color = texture2D(uSampler, vTextureCoord.st);\n    vec3 nColor = texture2D(displacementMap, vTextureCoord.st).rgb;\n\n\n    mapCords *= vec2(dimensions.x/512.0, dimensions.y/512.0);\n\n    mapCords.y *= -1.0;\n    mapCords.y += 1.0;\n\n    // RGBA of our diffuse color\n    vec4 DiffuseColor = texture2D(uSampler, vTextureCoord);\n\n    // RGB of our normal map\n    vec3 NormalMap = texture2D(displacementMap, mapCords).rgb;\n\n    // The delta position of light\n    // vec3 LightDir = vec3(LightPos.xy - (gl_FragCoord.xy / Resolution.xy), LightPos.z);\n    vec3 LightDir = vec3(LightPos.xy - (mapCords.xy), LightPos.z);\n\n    // Correct for aspect ratio\n    // LightDir.x *= Resolution.x / Resolution.y;\n\n    // Determine distance (used for attenuation) BEFORE we normalize our LightDir\n    float D = length(LightDir);\n\n    // normalize our vectors\n    vec3 N = normalize(NormalMap * 2.0 - 1.0);\n    vec3 L = normalize(LightDir);\n\n    // Pre-multiply light color with intensity\n    // Then perform 'N dot L' to determine our diffuse term\n    vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);\n\n    // pre-multiply ambient color with intensity\n    vec3 Ambient = AmbientColor.rgb * AmbientColor.a;\n\n    // calculate attenuation\n    float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );\n\n    // the calculation which brings it all together\n    vec3 Intensity = Ambient + Diffuse * Attenuation;\n    vec3 FinalColor = DiffuseColor.rgb * Intensity;\n    gl_FragColor = vColor * vec4(FinalColor, DiffuseColor.a);\n\n    // gl_FragColor = vec4(1.0, 0.0, 0.0, Attenuation); // vColor * vec4(FinalColor, DiffuseColor.a);\n\n/*\n    // normalise color\n    vec3 normal = normalize(nColor * 2.0 - 1.0);\n\n    vec3 deltaPos = vec3( (light.xy - gl_FragCoord.xy) / resolution.xy, light.z );\n\n    float lambert = clamp(dot(normal, lightDir), 0.0, 1.0);\n\n    float d = sqrt(dot(deltaPos, deltaPos));\n    float att = 1.0 / ( attenuation.x + (attenuation.y*d) + (attenuation.z*d*d) );\n\n    vec3 result = (ambientColor * ambientIntensity) + (lightColor.rgb * lambert) * att;\n    result *= color.rgb;\n\n    gl_FragColor = vec4(result, 1.0);\n*/\n}\n", { displacementMap: { type: "sampler2D", value: t }, scale: { type: "2f", value: { x: 15, y: 15 } }, offset: { type: "2f", value: { x: 0, y: 0 } }, mapDimensions: { type: "2f", value: { x: 1, y: 1 } }, dimensions: { type: "4f", value: [0, 0, 0, 0] }, LightPos: { type: "3f", value: [0, 1, 0] } }), t.baseTexture._powerOf2 = !0, t.baseTexture.hasLoaded ? this.onTextureLoaded() : t.baseTexture.once("loaded", this.onTextureLoaded, this);
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.onTextureLoaded = function () {
	        this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width, this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
	      }, Object.defineProperties(i.prototype, { map: { get: function get() {
	            return this.uniforms.displacementMap.value;
	          }, set: function set(t) {
	            this.uniforms.displacementMap.value = t;
	          } }, scale: { get: function get() {
	            return this.uniforms.scale.value;
	          }, set: function set(t) {
	            this.uniforms.scale.value = t;
	          } }, offset: { get: function get() {
	            return this.uniforms.offset.value;
	          }, set: function set(t) {
	            this.uniforms.offset.value = t;
	          } } });
	    }, { "../../core": 29 }], 106: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 dimensions;\nuniform vec2 pixelSize;\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord;\n\n    vec2 size = dimensions.xy / pixelSize;\n\n    vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;\n\n    gl_FragColor = texture2D(uSampler, color);\n}\n", { dimensions: { type: "4fv", value: new Float32Array([0, 0, 0, 0]) }, pixelSize: { type: "v2", value: { x: 10, y: 10 } } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { size: { get: function get() {
	            return this.uniforms.pixelSize.value;
	          }, set: function set(t) {
	            this.uniforms.pixelSize.value = t;
	          } } });
	    }, { "../../core": 29 }], 107: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 dimensions;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nvoid main(void)\n{\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\n}\n", { red: { type: "v2", value: { x: 20, y: 20 } }, green: { type: "v2", value: { x: -20, y: 20 } }, blue: { type: "v2", value: { x: 20, y: -20 } }, dimensions: { type: "4fv", value: [0, 0, 0, 0] } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { red: { get: function get() {
	            return this.uniforms.red.value;
	          }, set: function set(t) {
	            this.uniforms.red.value = t;
	          } }, green: { get: function get() {
	            return this.uniforms.green.value;
	          }, set: function set(t) {
	            this.uniforms.green.value = t;
	          } }, blue: { get: function get() {
	            return this.uniforms.blue.value;
	          }, set: function set(t) {
	            this.uniforms.blue.value = t;
	          } } });
	    }, { "../../core": 29 }], 108: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float sepia;\n\nconst mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);\n}\n", { sepia: { type: "1f", value: 1 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { sepia: { get: function get() {
	            return this.uniforms.sepia.value;
	          }, set: function set(t) {
	            this.uniforms.sepia.value = t;
	          } } });
	    }, { "../../core": 29 }], 109: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision lowp float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nuniform vec2 center;\nuniform vec3 params; // 10.0, 0.8, 0.1\nuniform float time;\n\nvoid main()\n{\n    vec2 uv = vTextureCoord;\n    vec2 texCoord = uv;\n\n    float dist = distance(uv, center);\n\n    if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )\n    {\n        float diff = (dist - time);\n        float powDiff = 1.0 - pow(abs(diff*params.x), params.y);\n\n        float diffTime = diff  * powDiff;\n        vec2 diffUV = normalize(uv - center);\n        texCoord = uv + (diffUV * diffTime);\n    }\n\n    gl_FragColor = texture2D(uSampler, texCoord);\n}\n", { center: { type: "v2", value: { x: .5, y: .5 } }, params: { type: "v3", value: { x: 10, y: .8, z: .1 } }, time: { type: "1f", value: 0 } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { center: { get: function get() {
	            return this.uniforms.center.value;
	          }, set: function set(t) {
	            this.uniforms.center.value = t;
	          } }, params: { get: function get() {
	            return this.uniforms.params.value;
	          }, set: function set(t) {
	            this.uniforms.params.value = t;
	          } }, time: { get: function get() {
	            return this.uniforms.time.value;
	          }, set: function set(t) {
	            this.uniforms.time.value = t;
	          } } });
	    }, { "../../core": 29 }], 110: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n", { blur: { type: "1f", value: 100 }, gradientBlur: { type: "1f", value: 600 }, start: { type: "v2", value: { x: 0, y: window.innerHeight / 2 } }, end: { type: "v2", value: { x: 600, y: window.innerHeight / 2 } }, delta: { type: "v2", value: { x: 30, y: 30 } }, texSize: { type: "v2", value: { x: window.innerWidth, y: window.innerHeight } } }), this.updateDelta();
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.updateDelta = function () {
	        this.uniforms.delta.value.x = 0, this.uniforms.delta.value.y = 0;
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.uniforms.blur.value;
	          }, set: function set(t) {
	            this.uniforms.blur.value = t;
	          } }, gradientBlur: { get: function get() {
	            return this.uniforms.gradientBlur.value;
	          }, set: function set(t) {
	            this.uniforms.gradientBlur.value = t;
	          } }, start: { get: function get() {
	            return this.uniforms.start.value;
	          }, set: function set(t) {
	            this.uniforms.start.value = t, this.updateDelta();
	          } }, end: { get: function get() {
	            return this.uniforms.end.value;
	          }, set: function set(t) {
	            this.uniforms.end.value = t, this.updateDelta();
	          } } });
	    }, { "../../core": 29 }], 111: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this), this.tiltShiftXFilter = new o(), this.tiltShiftYFilter = new s();
	      }var n = t("../../core"),
	          o = t("./TiltShiftXFilter"),
	          s = t("./TiltShiftYFilter");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.applyFilter = function (t, e, r) {
	        var i = t.filterManager.getRenderTarget(!0);this.tiltShiftXFilter.applyFilter(t, e, i), this.tiltShiftYFilter.applyFilter(t, i, r), t.filterManager.returnRenderTarget(i);
	      }, Object.defineProperties(i.prototype, { blur: { get: function get() {
	            return this.tiltShiftXFilter.blur;
	          }, set: function set(t) {
	            this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = t;
	          } }, gradientBlur: { get: function get() {
	            return this.tiltShiftXFilter.gradientBlur;
	          }, set: function set(t) {
	            this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = t;
	          } }, start: { get: function get() {
	            return this.tiltShiftXFilter.start;
	          }, set: function set(t) {
	            this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = t;
	          } }, end: { get: function get() {
	            return this.tiltShiftXFilter.end;
	          }, set: function set(t) {
	            this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = t;
	          } } });
	    }, { "../../core": 29, "./TiltShiftXFilter": 112, "./TiltShiftYFilter": 113 }], 112: [function (t, e, r) {
	      function i() {
	        n.call(this);
	      }var n = t("./TiltShiftAxisFilter");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.updateDelta = function () {
	        var t = this.uniforms.end.value.x - this.uniforms.start.value.x,
	            e = this.uniforms.end.value.y - this.uniforms.start.value.y,
	            r = Math.sqrt(t * t + e * e);this.uniforms.delta.value.x = t / r, this.uniforms.delta.value.y = e / r;
	      };
	    }, { "./TiltShiftAxisFilter": 110 }], 113: [function (t, e, r) {
	      function i() {
	        n.call(this);
	      }var n = t("./TiltShiftAxisFilter");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.updateDelta = function () {
	        var t = this.uniforms.end.value.x - this.uniforms.start.value.x,
	            e = this.uniforms.end.value.y - this.uniforms.start.value.y,
	            r = Math.sqrt(t * t + e * e);this.uniforms.delta.value.x = -e / r, this.uniforms.delta.value.y = t / r;
	      };
	    }, { "./TiltShiftAxisFilter": 110 }], 114: [function (t, e, r) {
	      function i() {
	        n.AbstractFilter.call(this, null, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\n\nvoid main(void)\n{\n   vec2 coord = vTextureCoord - offset;\n   float dist = length(coord);\n\n   if (dist < radius)\n   {\n       float ratio = (radius - dist) / radius;\n       float angleMod = ratio * ratio * angle;\n       float s = sin(angleMod);\n       float c = cos(angleMod);\n       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\n   }\n\n   gl_FragColor = texture2D(uSampler, coord+offset);\n}\n", { radius: { type: "1f", value: .5 }, angle: { type: "1f", value: 5 }, offset: { type: "v2", value: { x: .5, y: .5 } } });
	      }var n = t("../../core");i.prototype = Object.create(n.AbstractFilter.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { offset: { get: function get() {
	            return this.uniforms.offset.value;
	          }, set: function set(t) {
	            this.uniforms.offset.value = t;
	          } }, radius: { get: function get() {
	            return this.uniforms.radius.value;
	          }, set: function set(t) {
	            this.uniforms.radius.value = t;
	          } }, angle: { get: function get() {
	            return this.uniforms.angle.value;
	          }, set: function set(t) {
	            this.uniforms.angle.value = t;
	          } } });
	    }, { "../../core": 29 }], 115: [function (t, e, r) {
	      function i() {
	        this.global = new n.Point(), this.target = null, this.originalEvent = null;
	      }var n = t("../core");i.prototype.constructor = i, e.exports = i, i.prototype.getLocalPosition = function (t, e, r) {
	        var i = t.worldTransform,
	            o = r ? r : this.global,
	            s = i.a,
	            a = i.c,
	            h = i.tx,
	            l = i.b,
	            u = i.d,
	            c = i.ty,
	            p = 1 / (s * u + a * -l);return e = e || new n.Point(), e.x = u * p * o.x + -a * p * o.x + (c * a - h * u) * p, e.y = s * p * o.y + -l * p * o.y + (-c * s + h * l) * p, e;
	      };
	    }, { "../core": 29 }], 116: [function (t, e, r) {
	      function i(t, e) {
	        e = e || {}, this.renderer = t, this.autoPreventDefault = void 0 !== e.autoPreventDefault ? e.autoPreventDefault : !0, this.interactionFrequency = e.interactionFrequency || 10, this.mouse = new o(), this.eventData = { stopped: !1, target: null, type: null, data: this.mouse, stopPropagation: function stopPropagation() {
	            this.stopped = !0;
	          } }, this.interactiveDataPool = [], this.interactionDOMElement = null, this.eventsAdded = !1, this.onMouseUp = this.onMouseUp.bind(this), this.processMouseUp = this.processMouseUp.bind(this), this.onMouseDown = this.onMouseDown.bind(this), this.processMouseDown = this.processMouseDown.bind(this), this.onMouseMove = this.onMouseMove.bind(this), this.processMouseMove = this.processMouseMove.bind(this), this.onMouseOut = this.onMouseOut.bind(this), this.processMouseOverOut = this.processMouseOverOut.bind(this), this.onTouchStart = this.onTouchStart.bind(this), this.processTouchStart = this.processTouchStart.bind(this), this.onTouchEnd = this.onTouchEnd.bind(this), this.processTouchEnd = this.processTouchEnd.bind(this), this.onTouchMove = this.onTouchMove.bind(this), this.processTouchMove = this.processTouchMove.bind(this), this.last = 0, this.currentCursorStyle = "inherit", this._tempPoint = new n.Point(), this.resolution = 1, this.setTargetElement(this.renderer.view, this.renderer.resolution);
	      }var n = t("../core"),
	          o = t("./InteractionData");Object.assign(n.DisplayObject.prototype, t("./interactiveTarget")), i.prototype.constructor = i, e.exports = i, i.prototype.setTargetElement = function (t, e) {
	        this.removeEvents(), this.interactionDOMElement = t, this.resolution = e || 1, this.addEvents();
	      }, i.prototype.addEvents = function () {
	        this.interactionDOMElement && (n.ticker.shared.add(this.update, this), window.navigator.msPointerEnabled && (this.interactionDOMElement.style["-ms-content-zooming"] = "none", this.interactionDOMElement.style["-ms-touch-action"] = "none"), window.document.addEventListener("mousemove", this.onMouseMove, !0), this.interactionDOMElement.addEventListener("mousedown", this.onMouseDown, !0), this.interactionDOMElement.addEventListener("mouseout", this.onMouseOut, !0), this.interactionDOMElement.addEventListener("touchstart", this.onTouchStart, !0), this.interactionDOMElement.addEventListener("touchend", this.onTouchEnd, !0), this.interactionDOMElement.addEventListener("touchmove", this.onTouchMove, !0), window.addEventListener("mouseup", this.onMouseUp, !0), this.eventsAdded = !0);
	      }, i.prototype.removeEvents = function () {
	        this.interactionDOMElement && (n.ticker.shared.remove(this.update), window.navigator.msPointerEnabled && (this.interactionDOMElement.style["-ms-content-zooming"] = "", this.interactionDOMElement.style["-ms-touch-action"] = ""), window.document.removeEventListener("mousemove", this.onMouseMove, !0), this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, !0), this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, !0), this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, !0), this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, !0), this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, !0), this.interactionDOMElement = null, window.removeEventListener("mouseup", this.onMouseUp, !0), this.eventsAdded = !1);
	      }, i.prototype.update = function (t) {
	        if (this._deltaTime += t, !(this._deltaTime < this.interactionFrequency) && (this._deltaTime = 0, this.interactionDOMElement)) {
	          if (this.didMove) return void (this.didMove = !1);this.cursor = "inherit", this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, !0), this.currentCursorStyle !== this.cursor && (this.currentCursorStyle = this.cursor, this.interactionDOMElement.style.cursor = this.cursor);
	        }
	      }, i.prototype.dispatchEvent = function (t, e, r) {
	        r.stopped || (r.target = t, r.type = e, t.emit(e, r), t[e] && t[e](r));
	      }, i.prototype.mapPositionToPoint = function (t, e, r) {
	        var i = this.interactionDOMElement.getBoundingClientRect();t.x = (e - i.left) * (this.interactionDOMElement.width / i.width) / this.resolution, t.y = (r - i.top) * (this.interactionDOMElement.height / i.height) / this.resolution;
	      }, i.prototype.processInteractive = function (t, e, r, i, n) {
	        if (!e.visible) return !1;var o = e.children,
	            s = !1;if (n = n || e.interactive, e.interactiveChildren) for (var a = o.length - 1; a >= 0; a--) {
	          !s && i ? s = this.processInteractive(t, o[a], r, !0, n) : this.processInteractive(t, o[a], r, !1, !1);
	        }return n && (i && (e.hitArea ? (e.worldTransform.applyInverse(t, this._tempPoint), s = e.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) : e.containsPoint && (s = e.containsPoint(t))), e.interactive && r(e, s)), s;
	      }, i.prototype.onMouseDown = function (t) {
	        this.mouse.originalEvent = t, this.eventData.data = this.mouse, this.eventData.stopped = !1, this.mapPositionToPoint(this.mouse.global, t.clientX, t.clientY), this.autoPreventDefault && this.mouse.originalEvent.preventDefault(), this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, !0);
	      }, i.prototype.processMouseDown = function (t, e) {
	        var r = this.mouse.originalEvent,
	            i = 2 === r.button || 3 === r.which;e && (t[i ? "_isRightDown" : "_isLeftDown"] = !0, this.dispatchEvent(t, i ? "rightdown" : "mousedown", this.eventData));
	      }, i.prototype.onMouseUp = function (t) {
	        this.mouse.originalEvent = t, this.eventData.data = this.mouse, this.eventData.stopped = !1, this.mapPositionToPoint(this.mouse.global, t.clientX, t.clientY), this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, !0);
	      }, i.prototype.processMouseUp = function (t, e) {
	        var r = this.mouse.originalEvent,
	            i = 2 === r.button || 3 === r.which,
	            n = i ? "_isRightDown" : "_isLeftDown";e ? (this.dispatchEvent(t, i ? "rightup" : "mouseup", this.eventData), t[n] && (t[n] = !1, this.dispatchEvent(t, i ? "rightclick" : "click", this.eventData))) : t[n] && (t[n] = !1, this.dispatchEvent(t, i ? "rightupoutside" : "mouseupoutside", this.eventData));
	      }, i.prototype.onMouseMove = function (t) {
	        this.mouse.originalEvent = t, this.eventData.data = this.mouse, this.eventData.stopped = !1, this.mapPositionToPoint(this.mouse.global, t.clientX, t.clientY), this.didMove = !0, this.cursor = "inherit", this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, !0), this.currentCursorStyle !== this.cursor && (this.currentCursorStyle = this.cursor, this.interactionDOMElement.style.cursor = this.cursor);
	      }, i.prototype.processMouseMove = function (t, e) {
	        this.dispatchEvent(t, "mousemove", this.eventData), this.processMouseOverOut(t, e);
	      }, i.prototype.onMouseOut = function (t) {
	        this.mouse.originalEvent = t, this.eventData.stopped = !1, this.mapPositionToPoint(this.mouse.global, t.clientX, t.clientY), this.interactionDOMElement.style.cursor = "inherit", this.mapPositionToPoint(this.mouse.global, t.clientX, t.clientY), this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, !1);
	      }, i.prototype.processMouseOverOut = function (t, e) {
	        e ? (t._over || (t._over = !0, this.dispatchEvent(t, "mouseover", this.eventData)), t.buttonMode && (this.cursor = t.defaultCursor)) : t._over && (t._over = !1, this.dispatchEvent(t, "mouseout", this.eventData));
	      }, i.prototype.onTouchStart = function (t) {
	        this.autoPreventDefault && t.preventDefault();for (var e = t.changedTouches, r = e.length, i = 0; r > i; i++) {
	          var n = e[i],
	              o = this.getTouchData(n);o.originalEvent = t, this.eventData.data = o, this.eventData.stopped = !1, this.processInteractive(o.global, this.renderer._lastObjectRendered, this.processTouchStart, !0), this.returnTouchData(o);
	        }
	      }, i.prototype.processTouchStart = function (t, e) {
	        e && (t._touchDown = !0, this.dispatchEvent(t, "touchstart", this.eventData));
	      }, i.prototype.onTouchEnd = function (t) {
	        this.autoPreventDefault && t.preventDefault();for (var e = t.changedTouches, r = e.length, i = 0; r > i; i++) {
	          var n = e[i],
	              o = this.getTouchData(n);o.originalEvent = t, this.eventData.data = o, this.eventData.stopped = !1, this.processInteractive(o.global, this.renderer._lastObjectRendered, this.processTouchEnd, !0), this.returnTouchData(o);
	        }
	      }, i.prototype.processTouchEnd = function (t, e) {
	        e ? (this.dispatchEvent(t, "touchend", this.eventData), t._touchDown && (t._touchDown = !1, this.dispatchEvent(t, "tap", this.eventData))) : t._touchDown && (t._touchDown = !1, this.dispatchEvent(t, "touchendoutside", this.eventData));
	      }, i.prototype.onTouchMove = function (t) {
	        this.autoPreventDefault && t.preventDefault();for (var e = t.changedTouches, r = e.length, i = 0; r > i; i++) {
	          var n = e[i],
	              o = this.getTouchData(n);o.originalEvent = t, this.eventData.data = o, this.eventData.stopped = !1, this.processInteractive(o.global, this.renderer._lastObjectRendered, this.processTouchMove, !1), this.returnTouchData(o);
	        }
	      }, i.prototype.processTouchMove = function (t, e) {
	        e = e, this.dispatchEvent(t, "touchmove", this.eventData);
	      }, i.prototype.getTouchData = function (t) {
	        var e = this.interactiveDataPool.pop();return e || (e = new o()), e.identifier = t.identifier, this.mapPositionToPoint(e.global, t.clientX, t.clientY), navigator.isCocoonJS && (e.global.x = e.global.x / this.resolution, e.global.y = e.global.y / this.resolution), t.globalX = e.global.x, t.globalY = e.global.y, e;
	      }, i.prototype.returnTouchData = function (t) {
	        this.interactiveDataPool.push(t);
	      }, i.prototype.destroy = function () {
	        this.removeEvents(), this.renderer = null, this.mouse = null, this.eventData = null, this.interactiveDataPool = null, this.interactionDOMElement = null, this.onMouseUp = null, this.processMouseUp = null, this.onMouseDown = null, this.processMouseDown = null, this.onMouseMove = null, this.processMouseMove = null, this.onMouseOut = null, this.processMouseOverOut = null, this.onTouchStart = null, this.processTouchStart = null, this.onTouchEnd = null, this.processTouchEnd = null, this.onTouchMove = null, this.processTouchMove = null, this._tempPoint = null;
	      }, n.WebGLRenderer.registerPlugin("interaction", i), n.CanvasRenderer.registerPlugin("interaction", i);
	    }, { "../core": 29, "./InteractionData": 115, "./interactiveTarget": 118 }], 117: [function (t, e, r) {
	      e.exports = { InteractionData: t("./InteractionData"), InteractionManager: t("./InteractionManager"), interactiveTarget: t("./interactiveTarget") };
	    }, { "./InteractionData": 115, "./InteractionManager": 116, "./interactiveTarget": 118 }], 118: [function (t, e, r) {
	      var i = { interactive: !1, buttonMode: !1, interactiveChildren: !0, defaultCursor: "pointer", _over: !1, _touchDown: !1 };e.exports = i;
	    }, {}], 119: [function (t, e, r) {
	      function i(t, e) {
	        var r = {},
	            i = t.data.getElementsByTagName("info")[0],
	            n = t.data.getElementsByTagName("common")[0];r.font = i.getAttribute("face"), r.size = parseInt(i.getAttribute("size"), 10), r.lineHeight = parseInt(n.getAttribute("lineHeight"), 10), r.chars = {};for (var a = t.data.getElementsByTagName("char"), h = 0; h < a.length; h++) {
	          var l = parseInt(a[h].getAttribute("id"), 10),
	              u = new o.Rectangle(parseInt(a[h].getAttribute("x"), 10) + e.frame.x, parseInt(a[h].getAttribute("y"), 10) + e.frame.y, parseInt(a[h].getAttribute("width"), 10), parseInt(a[h].getAttribute("height"), 10));r.chars[l] = { xOffset: parseInt(a[h].getAttribute("xoffset"), 10), yOffset: parseInt(a[h].getAttribute("yoffset"), 10), xAdvance: parseInt(a[h].getAttribute("xadvance"), 10), kerning: {}, texture: new o.Texture(e.baseTexture, u) };
	        }var c = t.data.getElementsByTagName("kerning");for (h = 0; h < c.length; h++) {
	          var p = parseInt(c[h].getAttribute("first"), 10),
	              d = parseInt(c[h].getAttribute("second"), 10),
	              f = parseInt(c[h].getAttribute("amount"), 10);r.chars[d].kerning[p] = f;
	        }t.bitmapFont = r, s.BitmapText.fonts[r.font] = r;
	      }var n = t("resource-loader").Resource,
	          o = t("../core"),
	          s = t("../extras"),
	          a = t("path");e.exports = function () {
	        return function (t, e) {
	          if (!t.data || !t.isXml) return e();if (0 === t.data.getElementsByTagName("page").length || 0 === t.data.getElementsByTagName("info").length || null === t.data.getElementsByTagName("info")[0].getAttribute("face")) return e();var r = a.dirname(t.url);"." === r && (r = ""), this.baseUrl && r && ("/" === this.baseUrl.charAt(this.baseUrl.length - 1) && (r += "/"), r = r.replace(this.baseUrl, "")), r && "/" !== r.charAt(r.length - 1) && (r += "/");var s = r + t.data.getElementsByTagName("page")[0].getAttribute("file");if (o.utils.TextureCache[s]) i(t, o.utils.TextureCache[s]), e();else {
	            var h = { crossOrigin: t.crossOrigin, loadType: n.LOAD_TYPE.IMAGE };this.add(t.name + "_image", s, h, function (r) {
	              i(t, r.texture), e();
	            });
	          }
	        };
	      };
	    }, { "../core": 29, "../extras": 85, path: 3, "resource-loader": 18 }], 120: [function (t, e, r) {
	      e.exports = { Loader: t("./loader"), bitmapFontParser: t("./bitmapFontParser"), spritesheetParser: t("./spritesheetParser"), textureParser: t("./textureParser"), Resource: t("resource-loader").Resource };
	    }, { "./bitmapFontParser": 119, "./loader": 121, "./spritesheetParser": 122, "./textureParser": 123, "resource-loader": 18 }], 121: [function (t, e, r) {
	      function i(t, e) {
	        n.call(this, t, e);for (var r = 0; r < i._pixiMiddleware.length; ++r) {
	          this.use(i._pixiMiddleware[r]());
	        }
	      }var n = t("resource-loader"),
	          o = t("./textureParser"),
	          s = t("./spritesheetParser"),
	          a = t("./bitmapFontParser");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i._pixiMiddleware = [n.middleware.parsing.blob, o, s, a], i.addPixiMiddleware = function (t) {
	        i._pixiMiddleware.push(t);
	      };var h = n.Resource;h.setExtensionXhrType("fnt", h.XHR_RESPONSE_TYPE.DOCUMENT);
	    }, { "./bitmapFontParser": 119, "./spritesheetParser": 122, "./textureParser": 123, "resource-loader": 18 }], 122: [function (t, e, r) {
	      var i = t("resource-loader").Resource,
	          n = t("path"),
	          o = t("../core");e.exports = function () {
	        return function (t, e) {
	          if (!t.data || !t.isJson || !t.data.frames) return e();var r = { crossOrigin: t.crossOrigin, loadType: i.LOAD_TYPE.IMAGE },
	              s = n.dirname(t.url.replace(this.baseUrl, "")),
	              a = o.utils.getResolutionOfUrl(t.url);this.add(t.name + "_image", s + "/" + t.data.meta.image, r, function (r) {
	            t.textures = {};var i = t.data.frames;for (var n in i) {
	              var s = i[n].frame;if (s) {
	                var h = null,
	                    l = null;if (h = i[n].rotated ? new o.Rectangle(s.x, s.y, s.h, s.w) : new o.Rectangle(s.x, s.y, s.w, s.h), i[n].trimmed && (l = new o.Rectangle(i[n].spriteSourceSize.x / a, i[n].spriteSourceSize.y / a, i[n].sourceSize.w / a, i[n].sourceSize.h / a)), i[n].rotated) {
	                  var u = h.width;h.width = h.height, h.height = u;
	                }h.x /= a, h.y /= a, h.width /= a, h.height /= a, t.textures[n] = new o.Texture(r.texture.baseTexture, h, h.clone(), l, i[n].rotated), o.utils.TextureCache[n] = t.textures[n];
	              }
	            }e();
	          });
	        };
	      };
	    }, { "../core": 29, path: 3, "resource-loader": 18 }], 123: [function (t, e, r) {
	      var i = t("../core");e.exports = function () {
	        return function (t, e) {
	          t.data && t.isImage && (t.texture = new i.Texture(new i.BaseTexture(t.data, null, i.utils.getResolutionOfUrl(t.url))), i.utils.TextureCache[t.url] = t.texture), e();
	        };
	      };
	    }, { "../core": 29 }], 124: [function (t, e, r) {
	      function i(t, e, r, o, s) {
	        n.Container.call(this), this._texture = null, this.uvs = r || new Float32Array([0, 1, 1, 1, 1, 0, 0, 1]), this.vertices = e || new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]), this.indices = o || new Uint16Array([0, 1, 2, 3]), this.dirty = !0, this.blendMode = n.BLEND_MODES.NORMAL, this.canvasPadding = 0, this.drawMode = s || i.DRAW_MODES.TRIANGLE_MESH, this.texture = t;
	      }var n = t("../core"),
	          o = new n.Point(),
	          s = new n.Polygon();i.prototype = Object.create(n.Container.prototype), i.prototype.constructor = i, e.exports = i, Object.defineProperties(i.prototype, { texture: { get: function get() {
	            return this._texture;
	          }, set: function set(t) {
	            this._texture !== t && (this._texture = t, t && (t.baseTexture.hasLoaded ? this._onTextureUpdate() : t.once("update", this._onTextureUpdate, this)));
	          } } }), i.prototype._renderWebGL = function (t) {
	        t.setObjectRenderer(t.plugins.mesh), t.plugins.mesh.render(this);
	      }, i.prototype._renderCanvas = function (t) {
	        var e = t.context,
	            r = this.worldTransform;t.roundPixels ? e.setTransform(r.a, r.b, r.c, r.d, 0 | r.tx, 0 | r.ty) : e.setTransform(r.a, r.b, r.c, r.d, r.tx, r.ty), this.drawMode === i.DRAW_MODES.TRIANGLE_MESH ? this._renderCanvasTriangleMesh(e) : this._renderCanvasTriangles(e);
	      }, i.prototype._renderCanvasTriangleMesh = function (t) {
	        for (var e = this.vertices, r = this.uvs, i = e.length / 2, n = 0; i - 2 > n; n++) {
	          var o = 2 * n;this._renderCanvasDrawTriangle(t, e, r, o, o + 2, o + 4);
	        }
	      }, i.prototype._renderCanvasTriangles = function (t) {
	        for (var e = this.vertices, r = this.uvs, i = this.indices, n = i.length, o = 0; n > o; o += 3) {
	          var s = 2 * i[o],
	              a = 2 * i[o + 1],
	              h = 2 * i[o + 2];this._renderCanvasDrawTriangle(t, e, r, s, a, h);
	        }
	      }, i.prototype._renderCanvasDrawTriangle = function (t, e, r, i, n, o) {
	        var s = this._texture.baseTexture.source,
	            a = this._texture.baseTexture.width,
	            h = this._texture.baseTexture.height,
	            l = e[i],
	            u = e[n],
	            c = e[o],
	            p = e[i + 1],
	            d = e[n + 1],
	            f = e[o + 1],
	            v = r[i] * a,
	            g = r[n] * a,
	            m = r[o] * a,
	            y = r[i + 1] * h,
	            x = r[n + 1] * h,
	            b = r[o + 1] * h;if (this.canvasPadding > 0) {
	          var _ = this.canvasPadding / this.worldTransform.a,
	              T = this.canvasPadding / this.worldTransform.d,
	              E = (l + u + c) / 3,
	              S = (p + d + f) / 3,
	              A = l - E,
	              w = p - S,
	              C = Math.sqrt(A * A + w * w);l = E + A / C * (C + _), p = S + w / C * (C + T), A = u - E, w = d - S, C = Math.sqrt(A * A + w * w), u = E + A / C * (C + _), d = S + w / C * (C + T), A = c - E, w = f - S, C = Math.sqrt(A * A + w * w), c = E + A / C * (C + _), f = S + w / C * (C + T);
	        }t.save(), t.beginPath(), t.moveTo(l, p), t.lineTo(u, d), t.lineTo(c, f), t.closePath(), t.clip();var M = v * x + y * m + g * b - x * m - y * g - v * b,
	            R = l * x + y * c + u * b - x * c - y * u - l * b,
	            D = v * u + l * m + g * c - u * m - l * g - v * c,
	            F = v * x * c + y * u * m + l * g * b - l * x * m - y * g * c - v * u * b,
	            P = p * x + y * f + d * b - x * f - y * d - p * b,
	            O = v * d + p * m + g * f - d * m - p * g - v * f,
	            B = v * x * f + y * d * m + p * g * b - p * x * m - y * g * f - v * d * b;t.transform(R / M, P / M, D / M, O / M, F / M, B / M), t.drawImage(s, 0, 0), t.restore();
	      }, i.prototype.renderMeshFlat = function (t) {
	        var e = this.context,
	            r = t.vertices,
	            i = r.length / 2;e.beginPath();for (var n = 1; i - 2 > n; n++) {
	          var o = 2 * n,
	              s = r[o],
	              a = r[o + 2],
	              h = r[o + 4],
	              l = r[o + 1],
	              u = r[o + 3],
	              c = r[o + 5];e.moveTo(s, l), e.lineTo(a, u), e.lineTo(h, c);
	        }e.fillStyle = "#FF0000", e.fill(), e.closePath();
	      }, i.prototype._onTextureUpdate = function () {
	        this.updateFrame = !0;
	      }, i.prototype.getBounds = function (t) {
	        if (!this._currentBounds) {
	          for (var e = t || this.worldTransform, r = e.a, i = e.b, o = e.c, s = e.d, a = e.tx, h = e.ty, l = -(1 / 0), u = -(1 / 0), c = 1 / 0, p = 1 / 0, d = this.vertices, f = 0, v = d.length; v > f; f += 2) {
	            var g = d[f],
	                m = d[f + 1],
	                y = r * g + o * m + a,
	                x = s * m + i * g + h;c = c > y ? y : c, p = p > x ? x : p, l = y > l ? y : l, u = x > u ? x : u;
	          }if (c === -(1 / 0) || u === 1 / 0) return n.Rectangle.EMPTY;var b = this._bounds;b.x = c, b.width = l - c, b.y = p, b.height = u - p, this._currentBounds = b;
	        }return this._currentBounds;
	      }, i.prototype.containsPoint = function (t) {
	        if (!this.getBounds().contains(t.x, t.y)) return !1;this.worldTransform.applyInverse(t, o);var e,
	            r,
	            n = this.vertices,
	            a = s.points;if (this.drawMode === i.DRAW_MODES.TRIANGLES) {
	          var h = this.indices;for (r = this.indices.length, e = 0; r > e; e += 3) {
	            var l = 2 * h[e],
	                u = 2 * h[e + 1],
	                c = 2 * h[e + 2];if (a[0] = n[l], a[1] = n[l + 1], a[2] = n[u], a[3] = n[u + 1], a[4] = n[c], a[5] = n[c + 1], s.contains(o.x, o.y)) return !0;
	          }
	        } else for (r = n.length, e = 0; r > e; e += 6) {
	          if (a[0] = n[e], a[1] = n[e + 1], a[2] = n[e + 2], a[3] = n[e + 3], a[4] = n[e + 4], a[5] = n[e + 5], s.contains(o.x, o.y)) return !0;
	        }return !1;
	      }, i.DRAW_MODES = { TRIANGLE_MESH: 0, TRIANGLES: 1 };
	    }, { "../core": 29 }], 125: [function (t, e, r) {
	      function i(t, e) {
	        n.call(this, t), this.points = e, this.vertices = new Float32Array(4 * e.length), this.uvs = new Float32Array(4 * e.length), this.colors = new Float32Array(2 * e.length), this.indices = new Uint16Array(2 * e.length), this._ready = !0, this.refresh();
	      }var n = t("./Mesh"),
	          o = t("../core");i.prototype = Object.create(n.prototype), i.prototype.constructor = i, e.exports = i, i.prototype.refresh = function () {
	        var t = this.points;if (!(t.length < 1) && this._texture._uvs) {
	          var e = this.uvs,
	              r = this.indices,
	              i = this.colors,
	              n = this._texture._uvs,
	              s = new o.Point(n.x0, n.y0),
	              a = new o.Point(n.x2 - n.x0, n.y2 - n.y0);e[0] = 0 + s.x, e[1] = 0 + s.y, e[2] = 0 + s.x, e[3] = 1 * a.y + s.y, i[0] = 1, i[1] = 1, r[0] = 0, r[1] = 1;for (var h, l, u, c = t.length, p = 1; c > p; p++) {
	            h = t[p], l = 4 * p, u = p / (c - 1), e[l] = u * a.x + s.x, e[l + 1] = 0 + s.y, e[l + 2] = u * a.x + s.x, e[l + 3] = 1 * a.y + s.y, l = 2 * p, i[l] = 1, i[l + 1] = 1, l = 2 * p, r[l] = l, r[l + 1] = l + 1;
	          }this.dirty = !0;
	        }
	      }, i.prototype._onTextureUpdate = function () {
	        n.prototype._onTextureUpdate.call(this), this._ready && this.refresh();
	      }, i.prototype.updateTransform = function () {
	        var t = this.points;if (!(t.length < 1)) {
	          for (var e, r, i, n, o, s, a = t[0], h = 0, l = 0, u = this.vertices, c = t.length, p = 0; c > p; p++) {
	            r = t[p], i = 4 * p, e = p < t.length - 1 ? t[p + 1] : r, l = -(e.x - a.x), h = e.y - a.y, n = 10 * (1 - p / (c - 1)), n > 1 && (n = 1), o = Math.sqrt(h * h + l * l), s = this._texture.height / 2, h /= o, l /= o, h *= s, l *= s, u[i] = r.x + h, u[i + 1] = r.y + l, u[i + 2] = r.x - h, u[i + 3] = r.y - l, a = r;
	          }this.containerUpdateTransform();
	        }
	      };
	    }, { "../core": 29, "./Mesh": 124 }], 126: [function (t, e, r) {
	      e.exports = { Mesh: t("./Mesh"), Rope: t("./Rope"), MeshRenderer: t("./webgl/MeshRenderer"), MeshShader: t("./webgl/MeshShader") };
	    }, { "./Mesh": 124, "./Rope": 125, "./webgl/MeshRenderer": 127, "./webgl/MeshShader": 128 }], 127: [function (t, e, r) {
	      function i(t) {
	        n.ObjectRenderer.call(this, t), this.indices = new Uint16Array(15e3);for (var e = 0, r = 0; 15e3 > e; e += 6, r += 4) {
	          this.indices[e + 0] = r + 0, this.indices[e + 1] = r + 1, this.indices[e + 2] = r + 2, this.indices[e + 3] = r + 0, this.indices[e + 4] = r + 2, this.indices[e + 5] = r + 3;
	        }
	      }var n = t("../../core"),
	          o = t("../Mesh");i.prototype = Object.create(n.ObjectRenderer.prototype), i.prototype.constructor = i, e.exports = i, n.WebGLRenderer.registerPlugin("mesh", i), i.prototype.onContextChange = function () {}, i.prototype.render = function (t) {
	        t._vertexBuffer || this._initWebGL(t);var e = this.renderer,
	            r = e.gl,
	            i = t._texture.baseTexture,
	            n = e.shaderManager.plugins.meshShader,
	            s = t.drawMode === o.DRAW_MODES.TRIANGLE_MESH ? r.TRIANGLE_STRIP : r.TRIANGLES;e.blendModeManager.setBlendMode(t.blendMode), r.uniformMatrix3fv(n.uniforms.translationMatrix._location, !1, t.worldTransform.toArray(!0)), r.uniformMatrix3fv(n.uniforms.projectionMatrix._location, !1, e.currentRenderTarget.projectionMatrix.toArray(!0)), r.uniform1f(n.uniforms.alpha._location, t.worldAlpha), t.dirty ? (t.dirty = !1, r.bindBuffer(r.ARRAY_BUFFER, t._vertexBuffer), r.bufferData(r.ARRAY_BUFFER, t.vertices, r.STATIC_DRAW), r.vertexAttribPointer(n.attributes.aVertexPosition, 2, r.FLOAT, !1, 0, 0), r.bindBuffer(r.ARRAY_BUFFER, t._uvBuffer), r.bufferData(r.ARRAY_BUFFER, t.uvs, r.STATIC_DRAW), r.vertexAttribPointer(n.attributes.aTextureCoord, 2, r.FLOAT, !1, 0, 0), r.activeTexture(r.TEXTURE0), i._glTextures[r.id] ? r.bindTexture(r.TEXTURE_2D, i._glTextures[r.id]) : this.renderer.updateTexture(i), r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, t._indexBuffer), r.bufferData(r.ELEMENT_ARRAY_BUFFER, t.indices, r.STATIC_DRAW)) : (r.bindBuffer(r.ARRAY_BUFFER, t._vertexBuffer), r.bufferSubData(r.ARRAY_BUFFER, 0, t.vertices), r.vertexAttribPointer(n.attributes.aVertexPosition, 2, r.FLOAT, !1, 0, 0), r.bindBuffer(r.ARRAY_BUFFER, t._uvBuffer), r.vertexAttribPointer(n.attributes.aTextureCoord, 2, r.FLOAT, !1, 0, 0), r.activeTexture(r.TEXTURE0), i._glTextures[r.id] ? r.bindTexture(r.TEXTURE_2D, i._glTextures[r.id]) : this.renderer.updateTexture(i), r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, t._indexBuffer), r.bufferSubData(r.ELEMENT_ARRAY_BUFFER, 0, t.indices)), r.drawElements(s, t.indices.length, r.UNSIGNED_SHORT, 0);
	      }, i.prototype._initWebGL = function (t) {
	        var e = this.renderer.gl;t._vertexBuffer = e.createBuffer(), t._indexBuffer = e.createBuffer(), t._uvBuffer = e.createBuffer(), e.bindBuffer(e.ARRAY_BUFFER, t._vertexBuffer), e.bufferData(e.ARRAY_BUFFER, t.vertices, e.DYNAMIC_DRAW), e.bindBuffer(e.ARRAY_BUFFER, t._uvBuffer), e.bufferData(e.ARRAY_BUFFER, t.uvs, e.STATIC_DRAW), t.colors && (t._colorBuffer = e.createBuffer(), e.bindBuffer(e.ARRAY_BUFFER, t._colorBuffer), e.bufferData(e.ARRAY_BUFFER, t.colors, e.STATIC_DRAW)), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, t._indexBuffer), e.bufferData(e.ELEMENT_ARRAY_BUFFER, t.indices, e.STATIC_DRAW);
	      }, i.prototype.flush = function () {}, i.prototype.start = function () {
	        var t = this.renderer.shaderManager.plugins.meshShader;this.renderer.shaderManager.setShader(t);
	      }, i.prototype.destroy = function () {};
	    }, { "../../core": 29, "../Mesh": 124 }], 128: [function (t, e, r) {
	      function i(t) {
	        n.Shader.call(this, t, ["precision lowp float;", "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "uniform mat3 translationMatrix;", "uniform mat3 projectionMatrix;", "varying vec2 vTextureCoord;", "void main(void){", "   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "}"].join("\n"), ["precision lowp float;", "varying vec2 vTextureCoord;", "uniform float alpha;", "uniform sampler2D uSampler;", "void main(void){", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * alpha ;", "}"].join("\n"), { alpha: { type: "1f", value: 0 }, translationMatrix: { type: "mat3", value: new Float32Array(9) }, projectionMatrix: { type: "mat3", value: new Float32Array(9) } }, { aVertexPosition: 0, aTextureCoord: 0 });
	      }var n = t("../../core");i.prototype = Object.create(n.Shader.prototype), i.prototype.constructor = i, e.exports = i, n.ShaderManager.registerPlugin("meshShader", i);
	    }, { "../../core": 29 }], 129: [function (t, e, r) {
	      Object.assign || (Object.assign = t("object-assign"));
	    }, { "object-assign": 12 }], 130: [function (t, e, r) {
	      t("./Object.assign"), t("./requestAnimationFrame");
	    }, { "./Object.assign": 129, "./requestAnimationFrame": 131 }], 131: [function (t, e, r) {
	      (function (t) {
	        if (Date.now && Date.prototype.getTime || (Date.now = function () {
	          return new Date().getTime();
	        }), !t.performance || !t.performance.now) {
	          var e = Date.now();t.performance || (t.performance = {}), t.performance.now = function () {
	            return Date.now() - e;
	          };
	        }for (var r = Date.now(), i = ["ms", "moz", "webkit", "o"], n = 0; n < i.length && !t.requestAnimationFrame; ++n) {
	          t.requestAnimationFrame = t[i[n] + "RequestAnimationFrame"], t.cancelAnimationFrame = t[i[n] + "CancelAnimationFrame"] || t[i[n] + "CancelRequestAnimationFrame"];
	        }t.requestAnimationFrame || (t.requestAnimationFrame = function (t) {
	          if ("function" != typeof t) throw new TypeError(t + "is not a function");var e = Date.now(),
	              i = 16 + r - e;return 0 > i && (i = 0), r = e, setTimeout(function () {
	            r = Date.now(), t(performance.now());
	          }, i);
	        }), t.cancelAnimationFrame || (t.cancelAnimationFrame = function (t) {
	          clearTimeout(t);
	        });
	      }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
	    }, {}] }, {}, [1])(1);
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7).setImmediate))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(8);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(9)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }
]);
//# sourceMappingURL=main.js.map