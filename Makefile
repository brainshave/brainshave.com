STYLS = $(wildcard *.styl)
CSSS = $(STYLS:.styl=.css)

#all.css: $(STYLS) Makefile
#	cat $(STYLS) | stylus --compress --use ../node_modules/nib > all.css

all: $(CSSS)

%.css : %.styl Makefile
	stylus --use ../node_modules/nib < $< > $@

clean:
	rm *.css
