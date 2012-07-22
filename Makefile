main.css : main.styl Makefile
	stylus --use ../node_modules/nib < $< > $@
