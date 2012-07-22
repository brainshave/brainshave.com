STYLS = $(wildcard *.styl)
CSSS = $(STYLS:.styl=.css)

all: $(CSSS)

%.css : %.styl Makefile
	stylus --use ../node_modules/nib < $< > $@
