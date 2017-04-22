# Animated SVG icons set

This is set of SVG icons with stroke animations.
Some icons do not have stroke, so they have basic opacity fill animation instead.


## Sample

See final/test.html


## How to use it

To use these icons in your projects you need to include stylesheet and SimpleSVG script.

Add this to document header:

    <link rel="stylesheet" href="https://cdn.simplesvg.com/css/arty.css" />
    
Add this to document before ```</body>``` or in header:

    <script src="//cdn.simplesvg.com/js/"></script>
    
To use any icon from set write this:

    <span class="simple-svg" data-icon="arty-stroke-16-close"></span>

For list of available icons see final/test.html


## How to re-build icons

To re-build icons set run ```node parse```

You can use this code to make custom icon sets. See documentation on https://simplesvg.com/


# License

Code and icons are released with MIT license.

© 2017 Vjacheslav Trushkin
