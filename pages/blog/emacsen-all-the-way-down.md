# OSX: It's Emacsen all the way down

London, 2014-03-22.

Coming from a long time Linux/Windows experience, OSX's keyboard
mapping might seem weird and confusing. Main contributor to this is
%[⌥]% (alt) in a different place and usage of
%[⌘]% to invoke main keyboard shortcuts (as
opposed to the Ctrl key on PCs).

That accidentally frees the %[Ctrl]% key from
providing the traditional
[CUA](http://en.wikipedia.org/wiki/IBM_Common_User_Access) shortcuts
for copy/paste/etc. I don't know who to thank for it, but somebody at
Apple made the %[Ctrl]% key emulate most common
Emacs key bindings for text manipulation. (I suspect it might be there
since a long time ago, due to OSX's and NeXTStep's UNIX heritage.)

Here's a quick list of things that I've tried in TextEdit but it works
in practically **every** OSX app:

Moving around:

- %[Ctrl]% %[A]%, %[Ctrl]% %[E]%: jump to the beginning/end of the line
- %[Ctrl]% %[F]%, %[Ctrl]% %[B]%: one char forward/backward
- %[Ctrl]% %[P]%, %[Ctrl]% %[N]%: one line up/down
- %[Ctrl]% %[L]%: show current line in the centre of the screen
- %[Ctrl]% %[V]%: jump one page down (with caret, %[Page Down]% scrolls but leaves the caret where it was)

Editing:

- %[Ctrl]% %[T]%: move a character to the right: `s`|`b` → `bs`| (caret moves along so we can drag a character to the right as far as we want by repeating the combo)
- %[Ctrl]% %[K]%: cut ("kill") text to the end of the line/kill empty line/kill selection and put it in a buffer (different one from system's clipboard)
- %[Ctrl]% %[Y]%: paste ("yank") the last thing that was killed from that buffer
- %[Ctrl]% %[H]%: %[Backspace]% (in Emacs this shortcut is for the help system)
- %[Ctrl]% %[D]%: delete a character before caret, opposite of %[Backspace]%
- %[Ctrl]% %[O]%: insert empty line

The advantage of having those is obvious when you're an Emacs
user. (muscle memory yada yada yada). But if you're not, you might still
want to use them from time to time:

1. you might be too lazy and refuse to use arrow buttons (or you want to keep your hands in a little more ergonomic position)
2. some things like killing lines (%[Ctrl]% %[K]%) or swapping letters (%[Ctrl]% %[T]%) are not available otherwise. %[Ctrl]% %[T]% is quite useful for correcting typos. (My hands insist on typing "transf*ro*m" instead of "transf*or*m" all the time…)
3. %[Home]% and %[End]% have different meaning on a Mac than they have on a PC (scrolling to the begging and end of the document instead of jumping on the current line). Instead of %[Ctrl]% %[A]% and %[Ctrl]% %[E]% you can use %[⌘]% %[←]% and %[⌘]% %[→]% or %[⌥]% %[↑]% and %[⌥]% %[↓]%.

Using those shortcuts makes even more sense if you map your %[Caps Lock]% to %[Ctrl]% (which
is very [easy to setup on
OSX](http://stackoverflow.com/questions/15435253/how-to-remap-the-caps-lock-key-to-control-in-os-x-10-8)). As
far as I know there's no system-wide support for vim shortcuts at this
time.