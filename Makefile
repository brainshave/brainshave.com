TMPDIR = /tmp/szywon.pl

INPUTS = $(shell find . -regextype posix-extended -iregex '.*\.jade$$|.*\.md$$' \
	| grep -vP '^\.\/templates\/' | cut -c 3-) # get rid of templates dir and './' in the begining of paths
STYLS = $(sort $(wildcard styles/*.styl))

OUTPUTS_MARKDOWN = $(filter %.html,$(INPUTS:%.md=%.html))
OUTPUTS_JADE = $(filter %.html,$(INPUTS:%.jade=%.html))

DEPS_MARKDOWN = $(OUTPUTS_MARKDOWN:%.html=$(TMPDIR)/%.d)
DEPS_JADE = $(OUTPUTS_JADE:%.html=$(TMPDIR)/%.d)

GET_TITLE = $(shell sed -rn 's/^\#\s*([^\#].*)/\1/pg' $(1) | head -1)
GET_DATE  = $(shell grep -oP '\d{4}-\d{2}-\d{2}' $(1) | head -1)

GET_JADE_DEPS = $(shell DEPS=""; NEW_DEPS=$(1);\
	echo $(1) >> /tmp/zxcv;\
	while [ -n "$$NEW_DEPS" ]; do\
		DEPS="$$DEPS $$NEW_DEPS";\
		NEW_DEPS=`sed -nr 's/^\s*(extends|include)\s+([a-zA-Z_-]+)/templates\/\2.jade/pg' $$NEW_DEPS`;\
	done;\
	echo $$DEPS)

ENSURE_DIR = mkdir -p $(dir $(1))

GET_DIR_NAME = $(subst /,,$(dir $(1)))
GET_TEMPLATE_BY_DIR = templates/$(call GET_DIR_NAME,$(1)).jade

# Remove --pretty to disable pretty printing
JADE = jade --pretty --path templates/basic.jade

# Add to --compress disable pretty printing
STYLUS = stylus --use ../node_modules/nib

MARKDOWN = marked

TEMPLATE = "extends $(1)"\
	"\nprepend title"\
	"\n  |$(2)"\
	"\nblock article"\
	"\n  include ../../../../../../../../$(3)"

TARGETS = $(OUTPUTS_JADE) $(OUTPUTS_MARKDOWN) styles/all.css

all: $(TARGETS)

clean:
	rm -rf $(TMPDIR) $(TARGETS)

styles/all.css: $(STYLS) Makefile
	cat $(STYLS) | $(STYLUS) > $@

$(TMPDIR)/%.html : %.md
	$(call ENSURE_DIR,$@)
	$(MARKDOWN) < $< > $@

.SECONDEXPANSION:

$(OUTPUTS_JADE) : %.html : %.jade $$(call GET_JADE_DEPS,$$*.jade) Makefile
	$(JADE) < $< > $@

$(OUTPUTS_MARKDOWN) : %.html : $(TMPDIR)/%.html $$(call GET_JADE_DEPS,$$(call GET_TEMPLATE_BY_DIR,$$*)) Makefile
	echo -e $(call TEMPLATE,$(call GET_DIR_NAME,$*),$(call GET_TITLE,$*.md),$<) | $(JADE) > $@
