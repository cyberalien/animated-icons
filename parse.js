/**
 * This is a sample file
 */
"use strict";

const fs = require('fs');
const tools = require('simple-svg-tools');
const Animate = require('./animate');

/**
 * Return style
 *
 * @param attr
 * @returns {string}
 */
function transform(attr) {
    var rotate = attr.rotate ? attr.rotate : 0;

    function rotation() {
        while (rotate < 1) {
            rotate += 4;
        }
        while (rotate > 4) {
            rotate -= 4;
        }
        return 'rotate(' + (rotate * 90) + 'deg)';
    }

    if (attr.vFlip && attr.hFlip) {
        rotate += 2;
        return rotation();
    }

    if (attr.vFlip || attr.hFlip) {
        return (rotate ? rotation() + ' ' : '') + 'scale(' + (attr.hFlip ? '-' : '') + '1, ' + (attr.vFlip ? '-' : '') + '1)';
    }
    return rotation();
}

/**
 * Animation config
 *
 * @type {[number]}
 */
let breakPoints = [4, 6, 9, 13, 20, 30, 45, 68, 102, 153, 230, 345, 500];

/**
 * Maximum number of animation segments
 *
 * @type {number}
 */
let animationSegments = 20;

/**
 * One animation tick timer
 *
 * @type {number}
 */
let animationTick = 0.1;

/**
 * Minimum animation duration
 *
 * @type {number}
 */
let minAnimationDuration = 0.3;

let _doubleShapeAnimation = {1: 0, 3: 2};
let customAnimations = {
    filters: {
        splitShortAnimations: false
    },
    'grid-3-outline': {
        fill: true
    },
    'list-3-outline': {
        fill: true
    },
    sliders: {
        splitShortAnimations: false
    },
    'arrows-to-2-corners': {
        copy: {
            1: 0,
            3: 2, 4: 2, 5: 2
        },
        reverseAnimationOrder: true,
    },
    'arrows-from-2-corners': {
        copy: {
            1: 0,
            3: 2, 4: 2, 5: 2
        },
        splitShortAnimations: false,
        reverseAnimationOrder: true,
    },
    'arrows-to-corners': {
        copy: {
            1: 0, 2: 0, 3: 0,
            5: 4, 6: 4, 7: 4,
            8: 4, 9: 4, 10: 4, 11: 4
        },
        reverseAnimationOrder: true,
    },
    'arrows-from-corners': {
        copy: {
            1: 0, 2: 0, 3: 0,
            5: 4, 6: 4, 7: 4,
            8: 4, 9: 4, 10: 4, 11: 4
        },
        reverseAnimationOrder: true,
    },
    'mail': {
        copy: {2: 1}
    },
    'mail-opened': {
        copy: {2: 1}
    },
    'arrows-horizontal': {
        copy: {
            1: 0,
            3: 2, 4: 2, 5: 2
        }
    },
    'double-arrow-horizontal': {
        copy: {
            1: 0,
            3: 2, 4: 2, 5: 2
        }
    },
    code: {
        copy: {2: 0}
    },
    italic: {
        copy: {2: 1}
    },
    undo: {
        splitShortAnimations: false
    },
    smile: {
        copy: {3: 2}
    },
    eraser: {
        splitShortAnimations: false,
        extraDelay: {3: 2}
    },
    paintbrush: {
        splitShortAnimations: false,
        copy: {1: 0}
    },
    'align-center': {
        copy: {1: 0, 3: 2, 5: 4}
    },
    'align-justify': {
        copy: {1: 0, 3: 2, 5: 4}
    },
    'align-vertical': {
        copy: {1: 0, 3: 2, 5: 4}
    },
    link: {
        copy: {1: 0}
    },
    unlink: {
        copy: {1: 0}
    },
    picture: {
        splitShortAnimations: false,
        extraDelay: {
            1: 4,
            3: 4
        }
    },
    'movie-alt': {
        copy: {1: 0, 3: 2}
    },
    quote: {
        copy: {3: 0, 4: 1, 5: 2},
        extraDelay: {1: -1, 2: 4}
    },
    'quote-end': {
        copy: {3: 0, 4: 1, 5: 2},
        extraDelay: {1: -1, 2: 4}
    },
    quotes: {
        copy: {3: 0, 4: 1, 5: 2},
        extraDelay: {1: -1, 2: 4}
    },
    users: {
        copy: {4: 2, 5: 3}
    },
    floppy: {
        splitShortAnimations: false,
        extraDelay: {3: 2}
    },
    award: {
        copy: {2: 1}
    },
    'panel-left': {
        copy: {3: 2},
        reverseAnimationOrder: true
    },
    'arrow-left': {
        copy: {2: 1}
    },
    'chevron-left': {
        copy: {1: 0}
    },
    'carets-vertical': {
        copy: {1: 0}
    },
    'carets-vertical-outline': {
        copy: {1: 0},
        fill: true
    },
    'caret-up-outline': {
        fill: true
    },
    'arc-270': {
        copy: {2: 1},
        extraDelay: {
            1: -2,
            2: -2
        }
    },
    'arc-180': {
        copy: {2: 1},
        extraDelay: {
            1: -2,
            2: -2
        }
    },
    'arc-90': {
        copy: {2: 1},
        extraDelay: {
            1: -2,
            2: -2
        }
    },
};

/**
 * List of aliases
 * @type {object}
 */
let aliases = {
    'list-3': [
        {
            name: 'list-3-rtl',
            hFlip: true
        },
    ],
    'list-3-outline': [
        {
            name: 'list-3-outline-rtl',
            hFlip: true
        },
    ],

    // double arrows
    '2-corners': [
        {
            name: '2-corners-rotated',
            hFlip: true
        }
    ],

    // caret
    'caret-up': [
        {
            name: 'caret-down',
            vFlip: true,
        }, {
            name: 'caret-left',
            rotate: 1,
            vFlip: true,
        }, {
            name: 'caret-right',
            rotate: 1,
        },
    ],

    'caret-up-outline': [
        {
            name: 'caret-down-outline',
            vFlip: true,
        }, {
            name: 'caret-left-outline',
            rotate: 1,
            vFlip: true,
        }, {
            name: 'caret-right-outline',
            rotate: 1,
        },
    ],

    // arrows
    'left': [
        {
            name: 'right',
            hFlip: true,
        }, {
            name: 'up',
            rotate: 1,
            vFlip: true,
        }, {
            name: 'down',
            rotate: 3,
        }
    ],

    // rotated items
    'horizontal': [
        {
            name: 'vertical',
            rotate: 1
        }
    ],
    'horizontal-outline': [
        {
            name: 'vertical-outline',
            rotate: 1
        }
    ],
    'vertical': [
        {
            name: 'horizontal',
            rotate: 3
        }
    ],
    'vertical-outline': [
        {
            name: 'horizontal-outline',
            rotate: 3
        }
    ],
    'search': [
        {
            name: 'search-rotated',
            rotate: 3
        }
    ],
    'filters': [
        {
            name: 'filters-horizontal',
            rotate: 3,
            hFlip: true
        }
    ],
};

// Get parameters
let args = {};

process.argv.slice(2).forEach(arg => {
    args[arg] = true;
});

// Create directories
try {
    fs.mkdirSync('final');
} catch (err) {
}
try {
    fs.mkdirSync('final/svg');
} catch (err) {
}

// Do stuff
let collection;
tools.ImportDir('original').then(result => {
    collection = result;

    // Rename icons
    collection.keys().forEach(key => {
        collection.rename(key, 'arty-animated:' + key);
    });

    // SVGO optimization
    return collection.promiseAll(svg => tools.SVGO(svg));
}).then(() => {
    // Clean up tags
    return collection.promiseAll(svg => tools.Tags(svg));
}).then(() => {
    // Get palette
    return collection.promiseAll(svg => tools.GetPalette(svg));
}).then(results => {
    // Replace colors
    let promises = [];

    Object.keys(results).forEach(key => {
        if (results[key].colors.length < 2) {
            // Add/change color for images with less than 2 colors
            promises.push(tools.ChangePalette(collection.items[key], {
                add: 'currentColor',
                default: 'currentColor'
            }));
        }
    });

    return Promise.all(promises);
}).then(() => {
    // SVGO optimization again. Might make files smaller after color/tags changes
    return collection.promiseAll(svg => tools.SVGO(svg));
}).then(() => {
    // Animate
    return Animate(collection, {
        breakPointList: breakPoints,
        animationSegments: animationSegments,
        iconsConfig: (key, shapes) => {
            let list = key.split('-'),
                temp = key;

            while (list.length) {
                if (customAnimations[temp] !== void 0) {
                    return customAnimations[temp];
                }
                list.shift();
                temp = list.join('-');
            }

            return {};
        }
    });
}).then(() => {
    // Add aliases
    collection.forEach((svg, key) => {
        let list = key.split(':'),
            prefix = list.shift() + ':',
            temp = key;

        list = list.shift().split('-');

        while (list.length) {
            if (aliases[temp] !== void 0) {
                svg.aliases = [];
                // Copy aliases, add prefix
                aliases[temp].forEach(alias => {
                    if (typeof alias === 'string') {
                        svg.aliases.push(prefix + alias);
                    } else {
                        let copy = Object.assign({}, alias);
                        copy.name = prefix + copy.name;
                        svg.aliases.push(copy);
                    }
                });
                return;
            }
            prefix += list.shift() + '-';
            temp = list.join('-');
        }
    });

    // Export as optimized SVG icons
    return tools.ExportDir(collection, 'final/svg');
}).then(() => {
    // Export as JSON
    return tools.ExportJSON(collection, 'final/arty.json', {
        minify: false,
        optimize: true
    });
}).then(() => {
    // Generate stylesheet
    let css = '@supports (animation: foo 1s) and (not (-ms-ime-align: auto)) and (not (overflow: -webkit-marquee)) {\n',
        i;

    // Fill
    css += '.arty-animated .animate-fill { animation: arty-svg-fill 0s forwards; opacity: 0; }\n';
    css += '@keyframes arty-svg-fill { from { opacity: 0; } to { opacity: 1; } }\n';

    // Stroke
    breakPoints.forEach(bp => {
        css += '.arty-animated .stroke-length-' + bp + ' { animation: arty-svg-length-' + bp + ' 0s forwards; stroke-dasharray: ' + bp + '; stroke-dashoffset: ' + bp + '; }\n';
        css += '@keyframes arty-svg-length-' + bp + ' { from { stroke-dashoffset: ' + bp + '; } to { stroke-dashoffset: 0; } }\n';
    });
    for (i = 0; i < animationSegments; i++) {
        // 1x speed
        css += '.arty-animated .animation-delay-' + i + ' { animation-delay: ' + (i * animationTick) + 's; }\n';
        css += '.arty-animated .animation-duration-' + i + ' { animation-duration: ' + (i * animationTick + minAnimationDuration) + 's; }\n';

        // 2x speed
        css += '.arty-animated2x .animation-delay-' + i + ' { animation-delay: ' + (i * animationTick) / 2 + 's; }\n';
        css += '.arty-animated2x .animation-duration-' + i + ' { animation-duration: ' + (i * animationTick + minAnimationDuration) / 2 + 's; }\n';
    }

    // Close @supports
    css += '}';

    fs.writeFileSync('final/arty.css', css, 'utf8');
    fs.writeFileSync('docs/arty.css', css, 'utf8');

    // Filter icons by dimensions
    let dimensions = {};
    collection.forEach(svg => {
        let key = svg.width + 'x' + svg.height;
        if (dimensions[key] === void 0) {
            dimensions[key] = {
                width: svg.width,
                height: svg.height
            };
        }
    });

    // Generate test file
    let html = `<!DOCTYPE html>
<html lang="en">
   <head>
       <meta charset="UTF-8">
       <link rel="stylesheet" href="./arty.css" />
       <style>
           html, body { margin: 0; padding: 0; }
           svg { display: inline-block; color: #606060; }
           svg:hover { color: #000; }
           div { overflow: hidden; clear: both; }
           span { float: left; margin: 8px; padding: 4px; border: 1px solid #ddd; position: relative; line-height: 0; }
           span.alias { border-color: #f4f4f4; }
           div.all span { margin: 16px; }
           div.all span:after { content: attr(title); position: absolute; left: 0; right: 0; bottom: -30px; text-align: center; font: 12px / 14px sans-serif; word-wrap: break-word; }
           div.all .shape-0 { stroke: #800; }
           div.all .shape-1 { stroke: #080; }
           div.all .shape-2 { stroke: #008; }
           div.all .shape-3 { stroke: #880; }
           div.all .shape-4 { stroke: #088; }
           div.all .shape-5 { stroke: #808; }
           div.all .shape-6 { stroke: #e20; }
           div.all .shape-7 { stroke: #20e; }
           div.all .shape-8 { stroke: #0e2; }
           div.all .shape-9 { stroke: #480; }
           div.all .shape-10 { stroke: #804; }
           div.all .shape-11 { stroke: #048; }
           div.all .shape-12 { stroke: #444; }
           p { margin: 8px 8px 0; padding: 0; font: 16px / 24px sans-serif; }
`;
    Object.keys(dimensions).forEach(key => {
        let item = dimensions[key];
        html += '           .side-' + key + ' svg { width: ' + (item.width / 8) + 'px; height: ' + (item.height / 8) + 'px; }\n';
    });
    html += `       </style>
   </head>
   <body>
<p>Icons list for animated-icons. See <a href="https://github.com/cyberalien/animated-icons/">Git repository</a>.</p>
<p>Hover icons set to restart animation.</p>
`;

    function addSVG(title, code, alias) {
        html += '<span title="' + title + '"' + (alias ? ' class="alias"' : '') + '>\n\t' + code + '\n</span>\n';
    }

    function addItem(svg, key) {
        addSVG(key, svg.toString(), false);

        // Add aliases
        if (svg.aliases) {
            svg.aliases.forEach(alias => {
                if (typeof alias === 'string') {
                    return;
                }

                let style = transform(alias);
                style = '-ms-transform: ' + style+ '; -webkit-transform: ' + style + '; transform: ' + style + ';';
                addSVG(alias.name, svg.toString().replace('<svg ', '<svg style="' + style + '"'), true)
            });
        }
    }

    // Add icons in small size
    Object.keys(dimensions).forEach(key => {
        let item = dimensions[key];
        html += '<div class="side-' + key + '">\n<p>Icons: ' + item.width + ' x ' + item.height + '</p>\n';
        collection.forEach((svg, key) => {
            if (svg.width === item.width && svg.height === item.height) {
                addItem(svg, key);
            }
        });
        html += '</div>\n';
    });

    // Add icons in original size
    if (args.debug) {
        html += '<div class="all">\n<p>Original size:</p>\n';
        collection.forEach((svg, key) => {
            addItem(svg, key);
        });
        html += '</div>\n';
    } else {
        html += '<p>Icons are shown in 1/8 of their size. To show icons in original size run "node parse debug".</p>\n';
    }

    html += `<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script>
$(document).ready(function() {
   $('body').addClass('arty-animated arty-animated2x');
   setTimeout(function() {
       $('body').removeClass('arty-animated arty-animated2x');
   }, 1500);
   $('div').mouseover(function() {
       $(this).addClass('arty-animated');
   }).mouseout(function() {
       $(this).removeClass('arty-animated');
   });
});
</script></body>
</html>
`;
    fs.writeFileSync('docs/index.html', html, 'utf8');

    console.log('Parsed ' + collection.length() + ' icons.');
}).catch(err => {
    console.log(err);
});