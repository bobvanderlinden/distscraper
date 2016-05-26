#!/bin/bash
set -o errexit

SIZE=48
GSIZE=${SIZE}x${SIZE}
RESIZE=("-resize" "$GSIZE" "-gravity" "center" "-extent" "$GSIZE")

DST=out/logos
mkdir -p $DST

TMP=tmp/logos
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
xmlstarlet ed -d "//*[@id='g2809']" -d "//*[@id='g5326']" -d "//*[@id='text4418']" -d "//*[@id='text2634']" -d "//*[@id='text2638']" $TMP/archlinux.svg >| $TMP/archlinux_logo.svg
convert -background none $TMP/archlinux_logo.svg -trim ${RESIZE[@]} $DST/archlinux.png

# OpenSUSE
retrieve http://upload.wikimedia.org/wikipedia/commons/d/d0/OpenSUSE_Logo.svg $TMP/opensuse.svg
xmlstarlet ed -d "//*[@id='path45']" -d "//*[@id='path43']" -d "//*[@id='path41']" -d "//*[@id='path39']" -d "//*[@id='path35']" -d "//*[@id='path33']" -d "//*[@id='path31']" -d "//*[@id='path29']" -d "//*[@id='path27']" $TMP/opensuse.svg >| $TMP/opensuse_logo.svg
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

# FreeBSD
retrieve http://upload.wikimedia.org/wikipedia/en/d/df/Freebsd_logo.svg $TMP/freebsd.svg
xmlstarlet ed -d "//*[@id='g4795']" $TMP/freebsd.svg >| $TMP/freebsd_logo.svg
convert -background none $TMP/freebsd_logo.svg -trim ${RESIZE[@]} $DST/freebsd.png

# Gentoo
retrieve http://upload.wikimedia.org/wikipedia/commons/4/48/Gentoo_Linux_logo_matte.svg $TMP/gentoo.svg
convert -background none $TMP/gentoo.svg -trim ${RESIZE[@]} $DST/gentoo.png

# XBMCbuntu
retrieve http://upload.wikimedia.org/wikipedia/commons/5/5c/XBMC_Logo.svg $TMP/xbmcbuntu.svg
convert -background none $TMP/xbmcbuntu.svg -trim ${RESIZE[@]} $DST/xbmcbuntu.png

# Linux Mint
retrieve http://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_Linux_Mint.png $TMP/linuxmint.png
convert -background none $TMP/linuxmint.png -trim ${RESIZE[@]} $DST/linuxmint.png

# RIPLinuX
retrieve http://wiki.amahi.org/images/4/48/Riplinux-logo.png $TMP/riplinux.png
convert -background none $TMP/riplinux.png -trim ${RESIZE[@]} $DST/riplinux.png

# Xubuntu
retrieve http://upload.wikimedia.org/wikipedia/commons/b/b1/Xubuntu_Logo2.svg $TMP/xubuntu.svg
convert -background none $TMP/xubuntu.svg -trim ${RESIZE[@]} $DST/xubuntu.png

# Kubuntu
retrieve http://upload.wikimedia.org/wikipedia/commons/b/b0/Kubuntu-logo-lucid.svg $TMP/kubuntu.svg
xmlstarlet ed -N "svg=http://www.w3.org/2000/svg" -d "/svg:svg/svg:g/svg:g[not(@id='g3647')]" $TMP/kubuntu.svg >| $TMP/kubuntu_logo.svg
convert -background none $TMP/kubuntu_logo.svg -trim ${RESIZE[@]} $DST/kubuntu.png

# Lubuntu
retrieve http://upload.wikimedia.org/wikipedia/commons/2/27/Lubuntu_logo.svg $TMP/lubuntu.svg
xmlstarlet ed -N "svg=http://www.w3.org/2000/svg" -d "/svg:svg/*[not(position()=1)]" $TMP/lubuntu.svg >| $TMP/lubuntu_logo.svg
convert -background none $TMP/lubuntu_logo.svg -trim ${RESIZE[@]} $DST/lubuntu.png

# Peppermint
retrieve https://upload.wikimedia.org/wikipedia/commons/6/62/PEPPERMINT.png $TMP/peppermint.png
convert -background none $TMP/peppermint.png -trim ${RESIZE[@]} $DST/peppermint.png

# Manjaro
retrieve http://git.manjaro.org/manjaro-linux-graphics/manjaro-logo/blobs/raw/master/logo.png $TMP/manjaro.png
convert -background none $TMP/manjaro.png -trim ${RESIZE[@]} $DST/manjaro.png

# Kali Linux
retrieve http://docs.kali.org/wp-content/uploads/2013/03/guy-tm.png $TMP/kalilinux.png
convert -background none $TMP/kalilinux.png -trim ${RESIZE[@]} $DST/kalilinux.png

# Fuduntu
retrieve http://www.fuduntu.org/images/logo.png $TMP/fuduntu.png
convert -background none $TMP/fuduntu.png -crop 48x48+0+0 -trim ${RESIZE[@]} $DST/fuduntu.png

# Clonezilla
retrieve http://upload.wikimedia.org/wikipedia/commons/6/6c/CZLogo2.png $TMP/clonezilla.png
convert -background none $TMP/clonezilla.png -trim ${RESIZE[@]} $DST/clonezilla.png

# Parted Magic
retrieve http://beefdrapes.partedmagic.com/source/pmagicons/pmagicons-1.0-noarch-1_pmagic.txz $TMP/pmagicons.txz
mkdir -p $TMP/pmagicons && tar xfJ $TMP/pmagicons.txz -C $TMP/pmagicons > /dev/null
cp $TMP/pmagicons/usr/share/icons/hicolor/${SIZE}x${SIZE}/apps/pmagic.png $DST/partedmagic.png

# Linux Lite
retrieve  http://www.linuxliteos.com/images/linux-lite-logo-360x360.png $TMP/linuxlite.png
convert -background none $TMP/linuxlite.png -trim ${RESIZE[@]} $DST/linuxlite.png

# GParted
retrieve http://upload.wikimedia.org/wikipedia/commons/7/71/Scalable_gparted.svg $TMP/gparted.svg
convert -background none $TMP/gparted.svg -trim ${RESIZE[@]} $DST/gparted.png

# FreeDOS
retrieve http://www.freedos.org/images/logos/fdfish-color-plain.svg $TMP/freedos.svg
convert -background none $TMP/freedos.svg -trim ${RESIZE[@]} $DST/freedos.png

# MemTest86+
retrieve http://softwarebakery.com/apps/drivedroid/distros/memtest86plus/logo.svg $TMP/memtest86plus.svg
convert -background none $TMP/memtest86plus.svg -trim ${RESIZE[@]} $DST/memtest86plus.png

# Trisquel
retrieve http://www.gnu.org/graphics/trisquel/trisquel.svg $TMP/trisquel.svg
convert -background none $TMP/trisquel.svg -trim ${RESIZE[@]} $DST/trisquel.png

# Tiny Core Linux
retrieve http://tinycore.linuxfreedom.com/images/TinycoreLogo.png $TMP/tinycorelinux.png
convert -background none $TMP/tinycorelinux.png -trim ${RESIZE[@]} $DST/tinycorelinux.png

# Mageia
retrieve http://www.mageia.org/g/media/logo/mageia-2013.svg $TMP/mageia.svg
xmlstarlet ed -N "svg=http://www.w3.org/2000/svg" -d "//*[@id='path4687-7-56-1-0-2-2-7']" -d "//*[@id='path4687-7-56-1-8']" -d "//*[@id='path4687-7-56-1-0-55']" -d "//*[@id='path4687-7-56-1-0-6-7']" -d "//*[@id='rect4708-59-5-7-0']" -d "//*[@id='path9360-1']" -d "//*[@id='path4687-7-56-1-8-5']" $TMP/mageia.svg >| $TMP/mageia_logo.svg
convert -background none $TMP/mageia_logo.svg -trim ${RESIZE[@]} $DST/mageia.png

# ophcrack
retrieve http://ophcrack.sourceforge.net/logo.png $TMP/ophcrack.png
convert -background none $TMP/ophcrack.png -trim ${RESIZE[@]} $DST/ophcrack.png

# RebeccaBlackOS
retrieve http://softwarebakery.com/apps/drivedroid/files/rebeccablackos.png $TMP/rebeccablackos.png
convert -background none $TMP/rebeccablackos.png -trim ${RESIZE[@]} $DST/rebeccablackos.png

# ZorinOS
retrieve http://c.fsdn.com/allura/p/zorin-os/icon $TMP/zorinos.png
convert -background none $TMP/zorinos.png -trim ${RESIZE[@]} $DST/zorinos.png

# UberStudent
retrieve http://softwarebakery.com/apps/drivedroid/files/uberstudent-logo.svg $TMP/uberstudent.svg
convert -background none $TMP/uberstudent.svg -trim ${RESIZE[@]} $DST/uberstudent.png

# Voyage Linux
retrieve http://softwarebakery.com/apps/drivedroid/files/voyagelinux.png $TMP/voyagelinux.png
convert -background none $TMP/voyagelinux.png -trim ${RESIZE[@]} $DST/voyagelinux.png

# elementary OS
retrieve https://upload.wikimedia.org/wikipedia/commons/d/db/Elementary_logo.svg $TMP/elementaryos.svg
convert -background none $TMP/elementaryos.svg -trim ${RESIZE[@]} $DST/elementaryos.png

# BBQLinux
retrieve https://raw.github.com/bbqlinux/bbqlinux-installer/master/src/usr/share/bbqlinux-installer/bbqlinux_icon_blue_48x48.png $DST/bbqlinux.png

# alphaOS
retrieve https://bitbucket-assetroot.s3.amazonaws.com/c/photos/2013/Sep/28/alphaos-logo-878642709-8_avatar.png $TMP/alphaos.png
convert -background none $TMP/alphaos.png -trim ${RESIZE[@]} $DST/alphaos.png

# SystemRescueCD
retrieve https://upload.wikimedia.org/wikipedia/commons/9/94/System-rescue-cd-logo-new.svg $TMP/systemrescuecd.svg
xmlstarlet ed -N "svg=http://www.w3.org/2000/svg" -d "//*[@id='text2837']" -d "//*[@id='text2831']" $TMP/systemrescuecd.svg >| $TMP/systemrescuecd_logo.svg
convert -background none $TMP/systemrescuecd_logo.svg -trim ${RESIZE[@]} $DST/systemrescuecd.png

# NixOS
retrieve https://nixos.org/logo/nixos-logo-only-hires.png $TMP/nixos.png
convert -background none $TMP/nixos.png -trim ${RESIZE[@]} $DST/nixos.png

# Super Grub2 Disk
retrieve http://www.supergrubdisk.org/wp-content/themes/SGD/images/S2.png $TMP/supergrub2disk.png
convert -background none $TMP/supergrub2disk.png -trim ${RESIZE[@]} $DST/supergrub2disk.png

# Puppy Linux
retrieve http://distro.ibiblio.org/puppylinux/puppy-slacko-5.7/puppylogo96.png $TMP/puppylinux.png
convert -background none $TMP/puppylinux.png -trim ${RESIZE[@]} $DST/puppylinux.png

# Slax
retrieve https://upload.wikimedia.org/wikipedia/en/b/ba/Slax_linux_logo.svg $TMP/slax.svg
convert -background none $TMP/slax.svg -trim ${RESIZE[@]} $DST/slax.png

# Evo/lution
retrieve http://softwarebakery.com/apps/drivedroid/files/evolution-logo.png $TMP/evolution.png
convert -background none $TMP/evolution.png -trim ${RESIZE[@]} $DST/evolution.png

# Antergos
retrieve http://storage.antergos.com/art/antergos-logo.svg $TMP/antergos.svg
xmlstarlet ed -d "/_:svg/_:g/*[@id!='g5349']" -d "/_:svg/_:g/_:g[@id='g5349']/*[@id='text5357']" $TMP/antergos.svg >| $TMP/antergos_logo.svg
inkscape --export-png=$DST/antergos.png --export-area-drawing --export-width=${SIZE} --export-height=${SIZE} $TMP/antergos_logo.svg

# Urix OS
retrieve http://softwarebakery.com/apps/drivedroid/files/urixos.svg $TMP/urixos.svg
inkscape --export-png=$TMP/urixos.png $TMP/urixos.svg 
convert -background none $TMP/urixos.png -trim ${RESIZE[@]} $DST/urixos.png

# Siduction
retrieve https://upload.wikimedia.org/wikipedia/commons/4/4b/Siduction_logo.svg $TMP/siduction.svg
inkscape --export-png=$TMP/siduction.png $TMP/siduction.svg
convert -background none $TMP/siduction.png -trim ${RESIZE[@]} $DST/siduction.png
