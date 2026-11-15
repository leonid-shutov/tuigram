#!/usr/bin/env bash
# Builds tuigram's Linux system packages from the published npm tarball.
#
#   packaging/linux/build.sh --version 1.4.1 --arch x64 --format deb --out dist
#
# Nothing here runs at install time: it only stages files for dpkg-deb / rpmbuild /
# appimagetool, all of which run in GitHub Actions (see .github/workflows/release-linux.yml).
# The recipe mirrors install.sh on purpose: fetch the Node the release's `engines.node`
# asks for, then npm-install the tarball with that Node's own npm, so better-sqlite3's
# native addon always meets the Node ABI that runs it.
#
# Layout inside every artifact:
#   /usr/lib/tuigram/<node-vX.Y.Z-linux-<arch>>/   private Node
#   /usr/lib/tuigram/app/                          tuigram (rootDir; bin/channel.js `system`)
#   /usr/bin/tuigram                               launcher (execs the private Node)
#
# The AppImage carries the same tree under AppDir/usr/ with an AppRun that resolves
# through $APPDIR instead of /usr.
#
# Options:
#   --version <x.y.z>   tuigram version (must exist on the npm registry)
#   --arch <x64|arm64>  target arch (Node naming; mapped to deb/rpm names below)
#   --format <deb|rpm|appimage>  what to build
#   --out <dir>         where to drop the artifact (default: dist)
#
# Env:
#   TUIGRAM_NODE_MIRROR  Node.js download mirror (default: https://nodejs.org/dist)

set -euo pipefail

VERSION=''
ARCH=''
FORMAT=''
OUT='dist'
NODE_MIRROR=${TUIGRAM_NODE_MIRROR:-https://nodejs.org/dist}
NODE_MIRROR=${NODE_MIRROR%/}
REGISTRY='https://registry.npmjs.org/tuigram'

die() { printf 'build.sh: %s\n' "$*" >&2; exit 1; }
say() { printf 'build.sh: %s\n' "$*"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --version) VERSION=${2:?--version needs a value}; shift 2 ;;
    --arch) ARCH=${2:?--arch needs a value}; shift 2 ;;
    --format) FORMAT=${2:?--format needs a value}; shift 2 ;;
    --out) OUT=${2:?--out needs a value}; shift 2 ;;
    -h | --help) sed -n '2,/^$/p' "$0"; exit 0 ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

[ -n "$VERSION" ] || die '--version is required'
[ -n "$ARCH" ] || die '--arch is required'
[ -n "$FORMAT" ] || die '--format is required'
case "$ARCH" in x64 | arm64) ;; *) die "--arch must be x64 or arm64, not $ARCH" ;; esac
case "$FORMAT" in deb | rpm | appimage) ;; *) die "--format must be deb, rpm or appimage, not $FORMAT" ;; esac

case "$ARCH" in
  x64) DEB_ARCH=amd64; RPM_ARCH=x86_64; APPIMAGE_ARCH=x86_64 ;;
  arm64) DEB_ARCH=arm64; RPM_ARCH=aarch64; APPIMAGE_ARCH=aarch64 ;;
esac

ROOT=$(cd "$(dirname "$0")/../.." && pwd -P)
TMP=$(mktemp -d "$ROOT/.build-tmp.XXXXXX")
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT"
OUT=$(cd "$OUT" && pwd -P)

# The release's engines.node floor, from the registry manifest (same parse as install.sh).
ENGINES=$(curl -fsSL -H 'Accept: application/json' "$REGISTRY/$VERSION" \
  | sed -n 's/.*"engines":{[^}]*"node":"\([^"]*\)".*/\1/p')
[ -n "$ENGINES" ] || die "could not read engines.node for tuigram $VERSION"
NODE_MAJOR=$(printf '%s' "$ENGINES" | sed -n 's/^[^0-9]*\([0-9][0-9]*\).*/\1/p')
[ -n "$NODE_MAJOR" ] || die "could not make sense of engines.node: $ENGINES"
say "tuigram $VERSION needs $ENGINES"

# Latest Node $NODE_MAJOR for linux-$ARCH, verified against SHASUMS256.txt.
SUMS="$TMP/SHASUMS256.txt"
curl -fsSL -o "$SUMS" "$NODE_MIRROR/latest-v$NODE_MAJOR.x/SHASUMS256.txt" \
  || die "could not fetch Node.js $NODE_MAJOR release list from $NODE_MIRROR"
LINE=$(awk -v suffix="-linux-$ARCH.tar.gz" \
  'index($2, "node-v") == 1 && substr($2, length($2) - length(suffix) + 1) == suffix { print; exit }' "$SUMS")
[ -n "$LINE" ] || die "no Node.js $NODE_MAJOR build for linux-$ARCH on $NODE_MIRROR"
EXPECTED=${LINE%% *}
FILE=${LINE##* }
NODE_NAME=${FILE%.tar.gz}
say "bundling $NODE_NAME"

curl -fL --progress-bar -o "$TMP/$FILE" "$NODE_MIRROR/${NODE_NAME#node-}/$FILE" \
  || die "could not download $FILE"
ACTUAL=$(sha256sum "$TMP/$FILE" | awk '{ print $1 }')
[ "$ACTUAL" = "$EXPECTED" ] || die "$FILE failed its checksum (expected $EXPECTED, got $ACTUAL)"
tar -xzf "$TMP/$FILE" -C "$TMP"

NODE_DIR="$TMP/$NODE_NAME"
[ -x "$NODE_DIR/bin/node" ] || die "Node bundle has no bin/node"

# Install the published tarball (it already contains app-key.json, written at `npm publish`
# time by scripts/write-app-key.js) with the bundled Node's own npm, so the native addon
# matches its ABI. --allow-scripts names better-sqlite3 for npm's script allow-list -- the
# same reasoning as install.sh and the AUR PKGBUILD.
PREFIX="$TMP/npm-prefix"
PATH="$NODE_DIR/bin:$PATH" "$NODE_DIR/bin/node" "$NODE_DIR/lib/node_modules/npm/bin/npm-cli.js" \
  install --global --prefix "$PREFIX" \
  --allow-scripts=better-sqlite3 --ignore-scripts=false \
  --no-fund --no-audit --no-update-notifier --loglevel=error \
  "tuigram@$VERSION" || die "npm could not install tuigram $VERSION"

REPORTED=$("$NODE_DIR/bin/node" "$PREFIX/lib/node_modules/tuigram/bin/tuigram.js" --version) \
  || die 'the staged tuigram does not start'
[ "$REPORTED" = "$VERSION" ] || die "staged tuigram reports $REPORTED, expected $VERSION"
"$NODE_DIR/bin/node" -e 'new (require(process.argv[1]))(":memory:").close()' \
  "$PREFIX/lib/node_modules/tuigram/node_modules/better-sqlite3" \
  || die "better-sqlite3's native addon does not load under the bundled Node"

# Stage the shared tree: private Node + app + launcher.
STAGE="$TMP/stage"
APPDIR_LIB="$STAGE/usr/lib/tuigram"
mkdir -p "$APPDIR_LIB" "$STAGE/usr/bin" "$STAGE/usr/share/doc/tuigram"
mv "$TMP/$NODE_NAME" "$APPDIR_LIB/$NODE_NAME"
mv "$PREFIX/lib/node_modules/tuigram" "$APPDIR_LIB/app"
sed "s|__NODE__|$NODE_NAME|" "$ROOT/packaging/linux/launcher.sh" >"$STAGE/usr/bin/tuigram"
chmod 755 "$STAGE/usr/bin/tuigram"
cp "$ROOT/LICENSE" "$STAGE/usr/share/doc/tuigram/copyright" 2>/dev/null \
  || cp "$ROOT/LICENSE" "$STAGE/usr/share/doc/tuigram/LICENSE"
chmod 644 "$STAGE/usr/share/doc/tuigram/copyright" 2>/dev/null || true

build_deb() {
  mkdir -p "$STAGE/DEBIAN"
  INSTALLED_SIZE=$(du -sk "$STAGE/usr" | cut -f1)
  cat >"$STAGE/DEBIAN/control" <<EOF
Package: tuigram
Version: $VERSION
Section: net
Priority: optional
Architecture: $DEB_ARCH
Maintainer: Leonid Shutov <leonid.shutov@hey.com>
Description: Terminal UI client for Telegram
 A lightweight Telegram client for the terminal, with Vim-flavored navigation.
 .
 Ships its own Node.js runtime under /usr/lib/tuigram, so it needs no
 system-wide Node.
Depends: ca-certificates
Homepage: https://github.com/leonid-shutov/tuigram
Installed-Size: $INSTALLED_SIZE
EOF
  mkdir -p "$STAGE/usr/share/applications" "$STAGE/usr/share/icons/hicolor/scalable/apps"
  cp "$ROOT/packaging/linux/tuigram.desktop" "$STAGE/usr/share/applications/tuigram.desktop"
  cp "$ROOT/packaging/linux/tuigram.svg" "$STAGE/usr/share/icons/hicolor/scalable/apps/tuigram.svg"
  dpkg-deb --build --root-owner-group "$STAGE" "$OUT/tuigram_${VERSION}_${DEB_ARCH}.deb"
  say "wrote $OUT/tuigram_${VERSION}_${DEB_ARCH}.deb"
}

build_rpm() {
  RPMBUILD="$TMP/rpmbuild"
  mkdir -p "$RPMBUILD"/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
  cat >"$RPMBUILD/SPECS/tuigram.spec" <<EOF
Name:           tuigram
Version:        $VERSION
Release:        1%{?dist}
Summary:        Terminal UI client for Telegram
License:        MIT
URL:            https://github.com/leonid-shutov/tuigram
BuildArch:      $RPM_ARCH
Requires:       ca-certificates
# The payload is prebuilt above (npm tarball + bundled Node); no build needed.
BuildRequires:  coreutils

%description
A lightweight Telegram client for the terminal, with Vim-flavored navigation.
Ships its own Node.js runtime under /usr/lib/tuigram, so it needs no
system-wide Node.

%install
cp -a "$STAGE/usr" "%{buildroot}/usr"
mkdir -p "%{buildroot}/usr/share/applications" "%{buildroot}/usr/share/icons/hicolor/scalable/apps"
cp "$ROOT/packaging/linux/tuigram.desktop" "%{buildroot}/usr/share/applications/tuigram.desktop"
cp "$ROOT/packaging/linux/tuigram.svg" "%{buildroot}/usr/share/icons/hicolor/scalable/apps/tuigram.svg"

%files
/usr/bin/tuigram
/usr/lib/tuigram/
/usr/share/doc/tuigram/
/usr/share/applications/tuigram.desktop
/usr/share/icons/hicolor/scalable/apps/tuigram.svg

%changelog
* $(LC_ALL=C date '+%a %b %d %Y') tuigram $VERSION-1
- Release $VERSION
EOF
  rpmbuild --define "_topdir $RPMBUILD" -bb "$RPMBUILD/SPECS/tuigram.spec"
  RPM_OUT=$(find "$RPMBUILD/RPMS" -name '*.rpm' | head -n 1)
  [ -n "$RPM_OUT" ] || die 'rpmbuild produced no .rpm'
  cp "$RPM_OUT" "$OUT/"
  say "wrote $OUT/$(basename "$RPM_OUT")"
}

build_appimage() {
  APPDIR="$TMP/AppDir"
  mkdir -p "$APPDIR"
  cp -a "$STAGE/usr" "$APPDIR/usr"
  mkdir -p "$APPDIR/usr/share/applications" "$APPDIR/usr/share/icons/hicolor/scalable/apps"
  cp "$ROOT/packaging/linux/tuigram.desktop" "$APPDIR/tuigram.desktop"
  cp "$ROOT/packaging/linux/tuigram.desktop" "$APPDIR/usr/share/applications/tuigram.desktop"
  cp "$ROOT/packaging/linux/tuigram.svg" "$APPDIR/tuigram.svg"
  cp "$ROOT/packaging/linux/tuigram.svg" "$APPDIR/usr/share/icons/hicolor/scalable/apps/tuigram.svg"
  cat >"$APPDIR/AppRun" <<EOF
#!/bin/sh
HERE="\$(dirname "\$(readlink -f "\$0")")"
exec "\$HERE/usr/lib/tuigram/$NODE_NAME/bin/node" "\$HERE/usr/lib/tuigram/app/bin/tuigram.js" "\$@"
EOF
  chmod 755 "$APPDIR/AppRun"
  # appimagetool needs ARCH and a FUSE-less extraction mode in containers.
  export ARCH="$APPIMAGE_ARCH"
  if command -v appimagetool >/dev/null 2>&1; then TOOL=appimagetool;
  elif [ -x "$TMP/appimagetool" ]; then TOOL="$TMP/appimagetool";
  else
    case "$APPIMAGE_ARCH" in
      x86_64) TOOL_URL=https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage ;;
      aarch64) TOOL_URL=https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-aarch64.AppImage ;;
    esac
    curl -fL -o "$TMP/appimagetool" "$TOOL_URL" || die 'could not download appimagetool'
    chmod +x "$TMP/appimagetool"
    TOOL="$TMP/appimagetool"
  fi
  "$TOOL" --appimage-extract-and-run "$APPDIR" "$OUT/tuigram-${VERSION}-${APPIMAGE_ARCH}.AppImage" \
    || die 'appimagetool failed'
  say "wrote $OUT/tuigram-${VERSION}-${APPIMAGE_ARCH}.AppImage"
}

case "$FORMAT" in
  deb) build_deb ;;
  rpm) build_rpm ;;
  appimage) build_appimage ;;
esac
