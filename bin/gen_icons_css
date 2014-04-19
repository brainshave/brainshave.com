#!/bin/bash

mkdir -p icons
convert resources/icons.gif -crop 16x15 +repage icons/%d.gif

mv icons/{0,head}.gif
mv icons/{1,bug}.gif
mv icons/{2,archive}.gif
mv icons/{3,rss}.gif
mv icons/{4,photos}.gif
mv icons/{5,twitter}.gif
mv icons/{6,github}.gif
mv icons/{7,npm}.gif

function svg {
  name=$1

  convert icons/$name.gif /tmp/icon_$name.svg
  echo $(cat <<EOF
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg width="16" height="15" xmlns="http://www.w3.org/2000/svg" version="1.1">
EOF
    cat /tmp/icon_$name.svg | \
    sed 's/circle/rect/g' | \
      sed 's/cy/y/g' | \
      sed 's/cx/x/g' | \
      sed 's/r="1"/width="1" height="1"/g' | \
      grep black
echo "</svg>") | \
      sed 's/> </></g'
}

function css {
  name=$1

  data_gif=$(base64 < icons/$name.gif)
  data_svg="$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$(cat icons/$name.svg)")"

  echo ".icon.${name} {"
  echo "  .no_svg & { background-image: url(/icons/$name.gif); }"
  echo "  background-image: url(data:image/svg+xml;charset=UTF-8,$data_svg);"
  echo "}"
  echo
}

for name in head bug archive rss photos twitter github npm; do
  svg $name > icons/$name.svg
  css $name
done > styles/icons_files.less
