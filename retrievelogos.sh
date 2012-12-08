#!/bin/bash
set -o errexit

SIZE=32
GSIZE=${SIZE}x${SIZE}
RESIZE=("-resize" "$GSIZE" "-gravity" "center" "-extent" "$GSIZE")

DST=logos
mkdir -p $DST

TMP=logos/tmp
mkdir -p $TMP

function retrieve()
{
	url="$1"
	destination="$2"
	[ -f $destination ] || wget "$url" -O "$destination"
}

# Ubuntu
retrieve http://design.ubuntu.com/wp-content/uploads/logo-ubuntu_cof-orange-hex.svg $TMP/ubuntu.svg
convert -background none $TMP/ubuntu.svg ${RESIZE[@]} $DST/ubuntu.png

# Fedora
retrieve https://upload.wikimedia.org/wikipedia/commons/3/3f/Fedora_logo.svg $TMP/fedora.svg
convert -background none $TMP/fedora.svg ${RESIZE[@]} $DST/fedora.png

# ArchLinux
retrieve http://upload.wikimedia.org/wikipedia/en/a/ac/Archlinux-official-fullcolour.svg $TMP/archlinux.svg
xml ed -d "//*[@id='g2809']" -d "//*[@id='g5326']" -d "//*[@id='text4418']" -d "//*[@id='text2634']" -d "//*[@id='text2638']" $TMP/archlinux.svg >| $TMP/archlinux_logo.svg
convert -background none $TMP/archlinux_logo.svg -trim ${RESIZE[@]} $DST/archlinux.png

# OpenSUSE
retrieve http://upload.wikimedia.org/wikipedia/commons/d/d0/OpenSUSE_Logo.svg $TMP/opensuse.svg
xml ed -d "//*[@id='path45']" -d "//*[@id='path43']" -d "//*[@id='path41']" -d "//*[@id='path39']" -d "//*[@id='path35']" -d "//*[@id='path33']" -d "//*[@id='path31']" -d "//*[@id='path29']" -d "//*[@id='path27']" $TMP/opensuse.svg >| $TMP/opensuse_logo.svg
convert -background none $TMP/opensuse_logo.svg -trim ${RESIZE[@]} $DST/opensuse.png

#SliTaz
retrieve http://www.slitaz.org/images/artwork/slitaz-spider.svg $TMP/slitaz.svg
convert -background none $TMP/slitaz.svg -trim ${RESIZE[@]} $DST/slitaz.png

# Debian
retrieve http://upload.wikimedia.org/wikipedia/commons/6/66/Openlogo-debianV2.svg $TMP/debian.svg
convert -background none $TMP/debian.svg -trim ${RESIZE[@]} $DST/debian.png

# Crunchbang
retrieve http://crunchbanglinux.org/images/logo-48-48.png $TMP/crunchbanglinux_48x48.png
convert -background none $TMP/crunchbanglinux_48x48.png ${RESIZE[@]} $DST/crunchbang.png

# GeeXboX
retrieve http://distrowatch.com/images/yvzhuwbpy/geexbox.png $TMP/geexbox.png
convert -background none $TMP/geexbox.png -crop 91x65+0+0 -trim ${RESIZE[@]} $DST/geexbox.png

# grml
retrieve http://distrowatch.com/images/yvzhuwbpy/grml.png $TMP/grml.png
convert -background none $TMP/grml.png -crop 91x60+0+0 -trim ${RESIZE[@]} $DST/grml.png
