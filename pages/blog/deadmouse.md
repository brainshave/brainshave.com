# Wireless Mouse Music Player Remote

Lublin, 2013-01-02.

I still use my computer to listen to music :P.
It's not like I play music only when I use my computer neither it's like I stare at the screen if I only want to listen.

For some time (about two years I guess), in several various incarnations, I had implemented this idea of using my wireless mouse as a remote control for a music player.
At some point it was a `xev` and `grep`-based script to control `mpd`, later it was a C++/Win32 thing for [foobar2000](http://foobar2000.org) and now it's a PyGTK-based app to steer [DeaDBeeF](http://deadbeef.sf.net) that's good enough to share it with the world :).
It's called **deadmouse**.

The idea was always the same: take the whole screen and intercept any clicks and scrolls allowing me to turn off the monitor and just listen.

## Usage

Scenario is simple: start DeadBeeF, setup a playlist and start deadmouse.
Here's an image of the button mapping:

![deadmouse button mapping](/blog/deadmouse-images/deadmouse.svg)

On some mice the back and forward buttons are arranged the other way.
Additionally, clicking the middle button (the wheel) puts the computer into sleep (and closes the program).
There's no option to quit the application using the mouse otherwise but the traditional %[Alt]% %[F4]%.
The right button is not used for anything at the moment.
(It could be used for closing program or sleeping but I think it's too easy to accidentally hit it.)

## Installation

Dependencies are: Python 2.x, PyGTK, dbus (for putting to sleep) and alsa-utils (for volume control).
The code lives at the moment as a part of the [0desk](https://github.com/brainshave/0desk) project and can be obtained from here:
[source view](https://github.com/brainshave/0desk/blob/master/bin/deadmouse), [raw link](https://raw.github.com/brainshave/0desk/master/bin/deadmouse).
To use the script without passing the whole path to it put it somewhere under your `$PATH` (like `/usr/local/bin` or `/usr/bin`).

## Customization

Not everybody uses DeadBeeF so it's extra easy customize the `deadmouse` script to become your `*mouse` of choice.
Just edit the `click_cmds` dictionary.
