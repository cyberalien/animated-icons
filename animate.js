"use strict";

const tools = require('@iconify/tools');

/**
 * Default options
 *
 * @type {object}
 */
const defaults = {
    animationMultiplier: 1.8,
    animationSegments: 20,
    splitShortAnimations: true,
    reverseAnimationOrder: false,

    // Callback to add attributes to shape
    attributesCallback: (shape, index) => {
        let classNames = [
            'animation-delay-' + shape.animationDelay,
            'animation-duration-' + shape.animationDuration
        ];

        if (shape.stroke !== false && shape.ignoreStroke !== true) {
            // Stroke animation
            classNames.push('animate-stroke');
            classNames.push('stroke-length-' + shape.lengthBreakPoint);
            // classNames.push('shape-' + index);
        } else {
            // Fill animation
            classNames.push('animate-fill');
        }

        // Add class
        let className = shape.$node.attr('class');
        if (className !== void 0) {
            // Keep old class names
            className.split(/\s+/).forEach(part => {
                classNames.push(part);
            });
        }
        shape.$node.attr('class', classNames.join(' '));
    },

    // Individual configuration for icons
    iconsConfig: {},

    // List of length break points. If null, list is generated using options below
    breakPointList: null,

    // Options to generate custom break points list. Ignored if breakPointList is set
    minBreakPoint: 4, // > 0
    maxBreakPoint: 500, // > minBreakPoint
    breakPointMultiplier: 1.5, // > 1
};

module.exports = (svg, options) => {
    return new Promise((fulfill, reject) => {
        options = options === void 0 ? {} : options;
        Object.keys(defaults).forEach(key => {
            if (options[key] === void 0) {
                options[key] = defaults[key];
            }
        });

        // Generate break points
        if (options.breakPointList === null) {
            options.breakPointList = [];
            let bp = options.minBreakPoint,
                max = options.maxBreakPoint,
                list = options.breakPointList;
            while (bp < max) {
                list.push(Math.floor(bp));
                bp *= options.breakPointMultiplier;
            }
            if (list[list.length - 1] < max) {
                list.push(max);
            }
        } else {
            options.breakPointList.sort((a, b) => a - b);
            options.minBreakPoint = options.breakPointList[0];
            options.maxBreakPoint = options.breakPointList[options.breakPointList.length - 1];
        }

        // Convert arguments to collection
        let collection = svg instanceof tools.Collection;
        let items;
        if (collection) {
            items = svg;
        } else {
            items = new tools.Collection();
            items.add('icon', svg);
        }

        // Get shape lengths
        tools.ShapeLengths(items).then(results => {
            Object.keys(results).forEach(key => {
                // @var {{length: number, $node: object, fill: string|false, stroke: string|false} shapes
                let shapes = results[key],
                    config = typeof options.iconsConfig === 'function' ? options.iconsConfig(key, shapes) : (
                        options.iconsConfig[key] === void 0 ? {} : options.iconsConfig[key]
                    ),
                    strokeCount = 0,
                    fillCount = 0,
                    shapeCount = 0,
                    maxLength = 0,
                    totalLength = 0,
                    lengths = {};

                config = Object.assign({}, options, config);
                if (config.reverseAnimationOrder) {
                    shapes = shapes.reverse();
                }

                // For nodes that use fill count animation based on average of SVG dimensions
                let fillLength = (items.items[key].width + items.items[key].height) / 2;

                // Count number of shapes with fill and stroke
                shapes.forEach((shape, shapeIndex) => {
                    if (config.copy && config.copy[shapeIndex] !== void 0) {
                        return;
                    }

                    let stroke = shape.stroke !== false;
                    if (stroke && config.fill && (config.fill === true || config.fill[shapeIndex] === true)) {
                        stroke = false;
                        shape.ignoreStroke = true;
                    }

                    let length = config.extraLength ? (
                        typeof config.extraLength === 'number' ? config.extraLength : (config.extraLength[shapeIndex] === void 0 ? 0 : config.extraLength[shapeIndex])
                    ) : 0;

                    if (stroke) {
                        strokeCount ++;
                        length += shape.length;
                        totalLength += length;
                        maxLength = maxLength > length ? maxLength : length;
                    } else {
                        fillCount ++;
                        length += fillLength;
                        totalLength += length;
                    }
                    lengths[shapeIndex] = length;
                    shapeCount ++;
                });

                // if (!strokeCount && fillCount) {
                //     return;
                // }

                // Calculate total animation duration
                let totalDuration = 1 - Math.sqrt(1 / shapeCount) / 2; // between 0.5 and 1

                // Calculate animations for all shapes
                let shortLengthMax = maxLength * 0.3,
                    start = 0;
                (config.splitShortAnimations ? ['long', 'short'] : ['all']).forEach(lengthMatch => {
                    shapes.forEach((shape, shapeIndex) => {
                        if (config.copy && config.copy[shapeIndex] !== void 0) {
                            return;
                        }

                        // Get length
                        let length = lengths[shapeIndex];

                        // Skip nodes that don't match length
                        switch (lengthMatch) {
                            case 'long':
                                if (length < shortLengthMax) {
                                    return;
                                }
                                break;

                            case 'short':
                                if (length >= shortLengthMax) {
                                    return;
                                }
                        }

                        if (length >= config.maxBreakPoint) {
                            throw new Error('Shape' + (collection ? ' in icon ' + key : '') + ' is longer than biggest allowed length: ' + length);
                        }

                        let part = length * totalDuration / totalLength;
                        shape.animationDuration = Math.round(part * config.animationSegments);
                        shape.animationDelay = Math.round(start * config.animationSegments);
                        shape.lengthBreakPoint = config.breakPointList.reduce((a, b) =>
                            Math.min(a, b) >= length * 1.1 ? Math.min(a, b) : Math.max(a, b)
                        );
                        start += part;
                    });
                });

                // Copy shapes
                if (config.copy) {
                    Object.keys(config.copy).forEach(index => {
                        if (shapes[index] === void 0) {
                            throw new Error('Shape' + (collection ? ' in icon ' + key : '') + ' has copy instruction for shape that does not exist: ' + index);
                        }
                        let sourceIndex = config.copy[index];
                        if (shapes[sourceIndex] === void 0) {
                            throw new Error('Shape' + (collection ? ' in icon ' + key : '') + ' has copy instruction for shape that does not exist: ' + sourceIndex);
                        }
                        if (shapes[index].length !== shapes[sourceIndex].length) {
                            shapes.forEach(shape => {
                                shape.$node.attr('data-length', shape.length);
                            });
                            console.log(items.items[key].toString().replace(/</g, '\n<'));

                            throw new Error('Shapes ' + index + ' and ' + sourceIndex + (collection ? ' in icon ' + key : '') + ' have different lengths: ' + shapes[index].length + ' and ' + shapes[sourceIndex].length);
                        }

                        // Copy properties
                        Object.keys(shapes[sourceIndex]).forEach(attr => {
                            if (shapes[index][attr] === void 0) {
                                shapes[index][attr] = shapes[sourceIndex][attr];
                            }
                        });
                    });
                }

                // Apply timer changes
                if (config.delay) {
                    Object.keys(config.delay).forEach(index => {
                        shapes[index].animationDelay = config.delay[index];
                    });
                }
                if (config.extraDelay) {
                    if (typeof config.extraDelay === 'number') {
                        shapes.forEach(shape => shape.animationDelay += config.extraDelay);
                    } else {
                        Object.keys(config.extraDelay).forEach(index => {
                            shapes[index].animationDelay += config.extraDelay[index];
                        });
                    }
                }

                // Apply attributes
                shapes.forEach((result, index) => {
                    config.attributesCallback(result, index);
                });

                // Done
                if (config.reverseAnimationOrder) {
                    shapes = shapes.reverse();
                }
            });

            fulfill(collection ? results : results.icon);
        }).catch(err => {
            reject(err);
        });
    });
};