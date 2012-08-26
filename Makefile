STYLS = $(wildcard styles/*.styl)
# CSSS = $(STYLS:.styl=.css) styles/all.css
TMPDIR = /tmp/szywon.pl

POSTS = $(wildcard blog/*.md)
POSTS_HTML = $(POSTS:.md=.html)

# $(CSSS)

all: $(POSTS_HTML) index.html styles/all.css

styles/all.css: $(STYLS) Makefile
	cat $(STYLS) | stylus --compress --use ../node_modules/nib > $@

$(TMPDIR) :
	mkdir -p $(TMPDIR)

$(TMPDIR)/blog :
	mkdir -p $(TMPDIR)/blog

index.html : index.jade Makefile
	jade --pretty --path templates/basic.jade < $< > $@

$(TMPDIR)/blog/%.html : blog/%.md
	marked < $< > $@

blog/%.html : $(TMPDIR)/blog/%.html Makefile
	echo -e "extends blog\nappend title\n  | $@\nappend article\n  include ../../../../../../../../$<" | jade --pretty --path templates/base.jade > $@

clean:
	rm $(CSSS)
