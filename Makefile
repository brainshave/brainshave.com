TMPDIR = /tmp/szywon.pl

INPUTS = $(shell find . -regextype posix-extended -iregex '.*\.jade$$|.*\.md$$' \
	| grep -vP '^\.\/templates\/' | cut -c 3-) # get rid of templates dir and './' in the begining of paths
STYLS = $(sort $(wildcard styles/*.styl))

OUTPUTS_MARKDOWN = $(filter %.html,$(INPUTS:%.md=%.html))
OUTPUTS_JADE = $(filter %.html,$(INPUTS:%.jade=%.html))

INDEX = index.json

GET_TITLE = sed -rn 's/^\#\s*([^\#].*)/\1/pg' | head -1
GET_DATE  = grep -oP '\d{4}-\d{2}-\d{2}' | head -1
ESCAPE_JSON = sed -r 's/"/\\"/g'

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
JADE = jade --pretty --path templates/basic.jade --obj "{\"index\":`cat index.json`}"

# Add to --compress disable pretty printing
STYLUS = stylus --use ../node_modules/nib

MARKDOWN = marked

TEMPLATE = "extends $(1)"\
	"\nprepend title"\
	"\n  |$(2)"\
	"\nblock article"\
	"\n  include ../../../../../../../../$(3)"

TARGETS = $(INDEX) $(OUTPUTS_JADE) $(OUTPUTS_MARKDOWN) styles/all.css

all: $(TARGETS)

clean:
	rm -rf $(TMPDIR) $(TARGETS)

styles/all.css: $(STYLS) Makefile
	cat $(STYLS) | $(STYLUS) > $@

$(TMPDIR)/%.html : %.md
	$(call ENSURE_DIR,$@)
	$(MARKDOWN) < $< > $@

# Generating index.json
$(INDEX) : $(INPUTS) Makefile
	echo -n [ > $(INDEX)
	for INPUT in $(INPUTS); do\
		DATE=$$(cat $$INPUT | $(GET_DATE));\
		if [ -n "$$DATE" ]; then\
			TITLE=$$(cat $$INPUT | $(GET_TITLE) | $(ESCAPE_JSON));\
			HREF=$${INPUT/.md/.html};\
			echo '{"date":"'$$DATE'","source":"'$$INPUT'","href":"'$$HREF'","title":"'$$TITLE'"}';\
		fi;\
	done | sort --ignore-case --reverse | while read -r LINE; do\
		if [ -z "$$FIRST_LINE" ]; then\
			FIRST_LINE=1;\
		else\
			echo ",";\
		fi;\
		echo -n $$LINE;\
	done >> $(INDEX)
	echo ] >> $(INDEX)

.SECONDEXPANSION:

$(OUTPUTS_JADE) : %.html : %.jade $$(call GET_JADE_DEPS,$$*.jade) Makefile
	$(JADE) < $< > $@

$(OUTPUTS_MARKDOWN) : %.html : $(TMPDIR)/%.html $$(call GET_JADE_DEPS,$$(call GET_TEMPLATE_BY_DIR,$$*)) Makefile
	echo -e $(call TEMPLATE,$(call GET_DIR_NAME,$*),$(shell cat $*.md | $(GET_TITLE)),$<) | $(JADE) > $@
