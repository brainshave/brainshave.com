# OSX: It's Emacsen all the way down

London, 2014-03-22.

Coming from a long time Linux/Windows experience, OSX's keyboard
mapping might seem weird and confusing. Main contributor to this is
<span class="key">⌥</span> (alt) in a different place and usage of
<span class="key">⌘</span> to invoke main keyboard shortcuts (as
opposed to the Ctrl key on PCs).

That accidentally frees the <span class="key">Ctrl</span> key from
providing the traditional
[CUA](http://en.wikipedia.org/wiki/IBM_Common_User_Access) shortcuts
for copy/paste/etc. I don't know who to thank for it, but somebody at
Apple made the <span class="key">Ctrl</span> key emulate most common
Emacs key bindings for text manipulation. (I suspect it might be there
since a long time ago, due to OSX's and NeXTStep's UNIX heritage.)

Here's a quick list of things that I've tried in TextEdit but it works
in practically **every** OSX app:

Moving around:

- <span class="key">Ctrl</span> <span class="key">A</span>, <span class="key">Ctrl</span> <span class="key">E</span>: jump to the beginning/end of the line
- <span class="key">Ctrl</span> <span class="key">F</span>, <span class="key">Ctrl</span> <span class="key">B</span>: one char forward/backward
- <span class="key">Ctrl</span> <span class="key">P</span>, <span class="key">Ctrl</span> <span class="key">N</span>: one line up/down
- <span class="key">Ctrl</span> <span class="key">L</span>: show current line in the centre of the screen
- <span class="key">Ctrl</span> <span class="key">V</span>: jump one page down (with caret, <span class="key">Page Down</span> scrolls but leaves the caret where it was)

Editing:

- <span class="key">Ctrl</span> <span class="key">T</span>: move a character to the right: `s`|`b` → `bs`| (caret moves along so we can drag a character to the right as far as we want by repeating the combo)
- <span class="key">Ctrl</span> <span class="key">K</span>: cut ("kill") text to the end of the line/kill empty line/kill selection and put it in a buffer (different one from system's clipboard)
- <span class="key">Ctrl</span> <span class="key">Y</span>: paste ("yank") the last thing that was killed from that buffer
- <span class="key">Ctrl</span> <span class="key">H</span>: <span class="key">Backspace</span> (in Emacs this shortcut is for the help system)
- <span class="key">Ctrl</span> <span class="key">D</span>: delete a character before caret, opposite of <span class="key">Backspace</span>
- <span class="key">Ctrl</span> <span class="key">O</span>: insert empty line

The advantage of having those is obvious when you're an Emacs
user. (muscle memory yada yada yada). But if you're not, you might still
want to use them from time to time:

1. you might be too lazy and refuse to use arrow buttons (or you want to keep your hands in a little more ergonomic position)
2. some things like killing lines (<span class="key">Ctrl</span> <span class="key">K</span>) or swapping letters (<span class="key">Ctrl</span> <span class="key">T</span>) are not available otherwise. <span class="key">Ctrl</span> <span class="key">T</span> is quite useful for correcting typos. (My hands insist on typing "transf**ro**m" instead of "transf**or**m" all the time…)
3. <span class="key">Home</span> and <span class="key">End</span> have different meaning on a Mac than they have on a PC (scrolling to the begging and end of the document instead of jumping on the current line). Instead of <span class="key">Ctrl</span> <span class="key">A</span> and <span class="key">Ctrl</span> <span class="key">E</span> you can use <span class="key">⌘</span> <span class="key">←</span> and <span class="key">⌘</span> <span class="key">→</span> or <span class="key">⌥</span> <span class="key">↑</span> and <span class="key">⌥</span> <span class="key">↓</span>.

Using those shortcuts makes even more sense if you map your <span
class="key">Caps Lock</span> to <span class="key">Ctrl</span> (which
is very [easy to setup on
OSX](http://stackoverflow.com/questions/15435253/how-to-remap-the-caps-lock-key-to-control-in-os-x-10-8)). As
far as I know there's no system-wide support for vim shortcuts at this
time.