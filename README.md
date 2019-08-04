# Animated SVG icons set

This is set of SVG icons with stroke animations.
Some icons do not have stroke, so they have basic opacity fill animation instead.


## Sample

See [https://cyberalien.github.io/animated-icons/](https://cyberalien.github.io/animated-icons/)


## How to use it

This icons set is designed to be used with SimpleSVG framework.
To use these icons in your projects you need to include stylesheet and SimpleSVG script.

Add this to document header:

    <link rel="stylesheet" href="https://code.iconify.design/css/arty-animated.css" />
    
Add this to document before ```</body>``` or in header:

    <script src="https://code.iconify.design/1/1.0.3/iconify.min.js"></script>
    
To use any icon from set write line like this (replace data-icon value with icon name):

    <span class="iconify arty-animated" data-icon="arty-animated:16-close"></span>

For list of available icons see [https://cyberalien.github.io/animated-icons/](https://cyberalien.github.io/animated-icons/)

To set custom dimensions, color, transform see [https://iconify.design/](https://iconify.design/)


## How to re-build icons

To re-build icons set run ```node parse```

You can use this code to make custom icon sets. See documentation on [https://iconify.design/](https://iconify.design/)


# License

Code and icons are released with MIT license.

© 2017 - 2019 Vjacheslav Trushkin
