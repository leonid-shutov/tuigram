#!/bin/sh
# Launcher installed as /usr/bin/tuigram by the .deb/.rpm packages.
# EXEC_NODE and EXEC_APP are rewritten at package build time to the bundled
# Node and the app root (see packaging/linux/build.sh). It mirrors install.sh's
# launcher: exec the private Node on tuigram.js, never the system one, so the
# better-sqlite3 addon always meets the Node ABI that installed it.
set -eu
exec "/usr/lib/tuigram/__NODE__/bin/node" "/usr/lib/tuigram/app/bin/tuigram.js" "$@"
