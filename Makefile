STYLS = $(wildcard styles/*.styl)
# CSSS = $(STYLS:.styl=.css) styles/all.css
TMPDIR = /tmp/szywon.pl

POSTS = $(wildcard blog/*.md)
POSTS_HTML = $(POSTS:.md=.html)

# $(CSSS)

TARGETS = $(TMPDIR)/blog $(POSTS_HTML) index.html styles/all.css

GET_TITLE = $(shell sed -rn 's/^\#\s*([^\#].*)/\1/pg' $(1) | head -1)
GET_DATE  = $(shell grep -oP '\d{4}-\d{2}-\d{2}' $(1) | head -1)

GET_DEPS = $(shell DEPS=""; NEW_DEPS=$(1);\
	while [ -n "$$NEW_DEPS" ]; do\
		DEPS="$$DEPS $$NEW_DEPS";\
		NEW_DEPS=`sed -nr 's/\s*(extends|include)\s+([a-zA-Z_-]+)/templates\/\2.jade/pg' $$NEW_DEPS`;\
	done;\
	echo $$DEPS)

all: $(TARGETS)

styles/all.css: $(STYLS) Makefile
	cat $(STYLS) | stylus --compress --use ../node_modules/nib > $@

$(TMPDIR) :
	mkdir -p $(TMPDIR)

$(TMPDIR)/blog :
	mkdir -p $(TMPDIR)/blog

index.html : $(call GET_DEPS,index.jade) Makefile
	@echo $@ DEPS $^
	jade --pretty --path templates/basic.jade < $< > $@

$(TMPDIR)/blog/%.html : blog/%.md
	marked < $< > $@

blog/%.html : $(TMPDIR)/blog/%.html blog/%.md $(call GET_DEPS,templates/blog.jade) Makefile
	@echo $@ DEPS $^
	echo -e "extends blog"\
		"\nprepend title"\
		"\n  |$(call GET_TITLE,blog/$*.md)"\
		"\nappend article"\
		"\n  include ../../../../../../../../$<" \
		| jade --pretty --path templates/basic.jade > $@

clean:
	rm -rf $(TMPDIR) $(TARGETS)
