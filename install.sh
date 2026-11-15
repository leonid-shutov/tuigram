#!/usr/bin/env bash
# tuigram installer: a private Node.js plus tuigram from npm, no prerequisites.
#
#   curl -fsSL https://raw.githubusercontent.com/leonid-shutov/tuigram/master/install.sh | bash
#
# tuigram needs Node >= 26.4 (node:ffi), opentui's per-platform library and better-sqlite3's
# native addon, which is ABI-bound to the Node that installed it. So this fetches the Node the
# release asks for (its `engines.node`) into its own directory and installs tuigram with that
# Node's npm -- the same recipe as the Homebrew formula and the PKGBUILD, minus the system Node.
#
# Layout (both directories overridable, see --help):
#   ~/.local/bin/tuigram                     launcher: execs the private Node on tuigram.js
#   ~/.local/lib/tuigram/install.json        receipt: tells bin/channel.js this is a script install
#   ~/.local/lib/tuigram/node-vX.Y.Z-<os>-<arch>/
#   ~/.local/lib/tuigram/lib/node_modules/tuigram/
#
# Running it again upgrades in place; `tuigram upgrade` and the in-app upgrade do exactly that.
# Written for bash 3.2 (macOS's /bin/bash). Everything runs from `main` on the last line, so a
# download cut off mid-pipe runs nothing.

set -euo pipefail

INSTALLER_URL='https://raw.githubusercontent.com/leonid-shutov/tuigram/master/install.sh'
REGISTRY='https://registry.npmjs.org/tuigram'
# The first release whose bin/channel.js knows the `script` channel. An older one would see its
# own install as a plain npm prefix and upgrade itself through whatever npm is first on PATH.
MIN_VERSION='1.3.0'
# Marks a launcher as ours, so a re-run overwrites it but never someone else's `tuigram`.
LAUNCHER_MARK='# tuigram-installer launcher'

usage() {
  cat <<EOF
tuigram installer

Usage: install.sh [options]

Options:
  -v, --version <version>  install this version instead of the latest
      --install-dir <dir>  where Node and tuigram go (default: ~/.local/lib/tuigram)
      --no-modify-path     don't add the launcher's directory to your shell's rc file
  -h, --help               show this message

Environment:
  TUIGRAM_INSTALL_DIR      same as --install-dir
  TUIGRAM_BIN_DIR          where the \`tuigram\` launcher goes (default: ~/.local/bin)
  TUIGRAM_NODE_MIRROR      Node.js download mirror (default: https://nodejs.org/dist)

Examples:
  curl -fsSL $INSTALLER_URL | bash
  curl -fsSL $INSTALLER_URL | bash -s -- --version 1.3.0
EOF
}

say() { printf '%s\n' "$*"; }
warn() { printf 'tuigram: %s\n' "$*" >&2; }
die() {
  warn "$*"
  exit 1
}

unsupported() {
  die "this installer supports Linux (glibc) and macOS on x64 and arm64, not $1.
  Install with npm instead, which needs Node.js 26.4 or newer:  npm install -g tuigram
  or with Homebrew:                                             brew install leonid-shutov/tap/tuigram"
}

need() { command -v "$1" >/dev/null 2>&1 || die "'$1' is required but not installed"; }

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{ print $1 }'
  else
    shasum -a 256 "$1" | awk '{ print $1 }'
  fi
}

# version_lt A B: whether A < B, comparing MAJOR.MINOR.PATCH numerically (a prerelease suffix is
# dropped, so 1.3.0-beta.1 counts as 1.3.0).
version_lt() {
  local a1 a2 a3 b1 b2 b3
  IFS=. read -r a1 a2 a3 <<<"${1%%-*}"
  IFS=. read -r b1 b2 b3 <<<"${2%%-*}"
  a1=${a1:-0} a2=${a2:-0} a3=${a3:-0} b1=${b1:-0} b2=${b2:-0} b3=${b3:-0}
  [ "$a1" -ne "$b1" ] && { [ "$a1" -lt "$b1" ]; return; }
  [ "$a2" -ne "$b2" ] && { [ "$a2" -lt "$b2" ]; return; }
  [ "$a3" -lt "$b3" ]
}

# A single-quoted shell word for $1, for the launcher.
shell_quote() { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"; }

# A value from an existing install.json. It is our own one-key-per-line format, written below.
receipt_value() {
  [ -f "$receipt" ] || return 0
  sed -n "s/^ *\"$1\": *\"\\([^\"]*\\)\".*/\\1/p" "$receipt"
}

# Curl that shows a progress bar only when someone is watching.
download() {
  if [ -t 2 ]; then
    curl -fL --progress-bar -o "$2" "$1"
  else
    curl -fsSL -o "$2" "$1"
  fi
}

detect_platform() {
  local kernel machine
  kernel=$(uname -s)
  machine=$(uname -m)
  case "$kernel" in
    Linux) os=linux ;;
    Darwin) os=darwin ;;
    *) unsupported "$kernel" ;;
  esac
  case "$machine" in
    x86_64 | amd64) arch=x64 ;;
    aarch64 | arm64) arch=arm64 ;;
    *) unsupported "$kernel $machine" ;;
  esac
  # An arm64 Mac running this shell under Rosetta reports x86_64; the native Node is the right one.
  if [ "$os" = darwin ] && [ "$arch" = x64 ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || true)" = 1 ]; then
    arch=arm64
  fi
  # nodejs.org publishes no musl builds. `ldd --version` exits non-zero on musl, hence `|| true`.
  if [ "$os" = linux ]; then
    local ldd_out=''
    if command -v ldd >/dev/null 2>&1; then ldd_out=$(ldd --version 2>&1 || true); fi
    case "$ldd_out" in *musl*) unsupported 'musl Linux' ;; esac
    [ ! -f /etc/alpine-release ] || unsupported 'Alpine Linux'
  fi
}

# Sets tuigram_version and node_major/node_min from the npm registry's manifest of $1.
resolve_tuigram() {
  local tag=$1 manifest="$tmp/manifest.json" status engines
  status=$(curl -sSL -H 'Accept: application/json' -o "$manifest" -w '%{http_code}' "$REGISTRY/$tag") ||
    die 'could not reach the npm registry'
  case "$status" in
    200) ;;
    404) die "tuigram $tag is not on npm (versions: https://www.npmjs.com/package/tuigram?activeTab=versions)" ;;
    *) die "the npm registry answered HTTP $status for tuigram $tag" ;;
  esac
  # The manifest is one line of compact JSON; its first "version" key is the top-level one.
  tuigram_version=$(grep -o '"version":"[^"]*"' "$manifest" | sed -n '1s/"version":"\(.*\)"/\1/p' || true)
  engines=$(sed -n 's/.*"engines":{[^}]*"node":"\([^"]*\)".*/\1/p' "$manifest")
  [ -n "$tuigram_version" ] || die 'could not read the version from the npm registry'
  [ -n "$engines" ] || die "could not read the Node.js version tuigram $tuigram_version needs"
  node_major=$(printf '%s' "$engines" | sed -n 's/^[^0-9]*\([0-9][0-9]*\).*/\1/p')
  node_min=$(printf '%s' "$engines" | sed -n 's/^[^0-9]*\([0-9][0-9.]*\).*/\1/p')
  [ -n "$node_major" ] || die "could not make sense of tuigram's engines.node: $engines"
  if version_lt "$tuigram_version" "$MIN_VERSION"; then
    die "this installer needs tuigram $MIN_VERSION or newer (asked for $tuigram_version)"
  fi
}

# Sets node_name (e.g. node-v26.13.1-linux-x64) and makes sure $install_dir/$node_name holds it,
# reusing a copy that is already there and verifying a fresh download against SHASUMS256.txt.
ensure_node() {
  local sums="$tmp/SHASUMS256.txt" line expected actual file node_version
  curl -fsSL -o "$sums" "$node_mirror/latest-v$node_major.x/SHASUMS256.txt" ||
    die "could not fetch the Node.js $node_major release list from $node_mirror"
  line=$(awk -v suffix="-$os-$arch.tar.gz" \
    'index($2, "node-v") == 1 && substr($2, length($2) - length(suffix) + 1) == suffix { print; exit }' "$sums")
  [ -n "$line" ] || die "no Node.js $node_major build for $os-$arch on $node_mirror"
  expected=${line%% *}
  file=${line##* }
  node_name=${file%.tar.gz}
  node_version=${node_name#node-}
  node_version=${node_version%%-*}
  if [ -n "$node_min" ] && version_lt "${node_version#v}" "$node_min"; then
    die "the newest Node.js $node_major ($node_version) is older than the $node_min tuigram needs"
  fi

  if [ -x "$install_dir/$node_name/bin/node" ]; then
    say "Node.js $node_version is already installed"
    return
  fi
  say "Downloading Node.js $node_version ($os-$arch)"
  download "$node_mirror/$node_version/$file" "$tmp/$file" || die "could not download $file"
  actual=$(sha256_of "$tmp/$file")
  [ "$actual" = "$expected" ] || die "$file failed its checksum (expected $expected, got $actual)"
  tar -xzf "$tmp/$file" -C "$tmp"
  rm -rf "${install_dir:?}/$node_name"
  mv "$tmp/$node_name" "$install_dir/$node_name"
}

# npm-installs tuigram into a staging prefix with the private Node, checks it boots, then swaps it
# in -- a failed install leaves the working one untouched.
install_tuigram() {
  local node_dir="$install_dir/$node_name" staging="$tmp/prefix" staged target
  staged="$staging/lib/node_modules/tuigram"
  target="$install_dir/lib/node_modules/tuigram"
  say "Installing tuigram $tuigram_version"
  # PATH first: npm runs better-sqlite3's install script (prebuild-install, or node-gyp as a
  # fallback) through `node` on PATH, and the addon it fetches must match this Node's ABI.
  # --allow-scripts names it for npm's script allow-list, and --ignore-scripts=false overrides a
  # user .npmrc that turns scripts off -- either way there would be no better_sqlite3.node and
  # the client would die on first login.
  PATH="$node_dir/bin:$PATH" "$node_dir/bin/node" "$node_dir/lib/node_modules/npm/bin/npm-cli.js" \
    install --global --prefix "$staging" \
    --allow-scripts=better-sqlite3 --ignore-scripts=false \
    --no-fund --no-audit --no-update-notifier --loglevel=error \
    "tuigram@$tuigram_version" ||
    die "npm could not install tuigram $tuigram_version"

  local reported
  reported=$("$node_dir/bin/node" "$staged/bin/tuigram.js" --version) ||
    die "the installed tuigram does not start"
  [ "$reported" = "$tuigram_version" ] || die "installed tuigram reports $reported, expected $tuigram_version"
  # better-sqlite3 loads its addon lazily, on the first Database -- a bare require proves nothing.
  "$node_dir/bin/node" -e 'new (require(process.argv[1]))(":memory:").close()' \
    "$staged/node_modules/better-sqlite3" ||
    die "better-sqlite3's native addon does not load under Node.js in $node_dir"

  mkdir -p "$install_dir/lib/node_modules"
  if [ -e "$target" ]; then mv "$target" "$tmp/previous-tuigram"; fi
  mv "$staged" "$target"
}

# Runs before anything is downloaded: never overwrite a `tuigram` this installer didn't write
# (npm's own bin symlink when npm's prefix is ~/.local, say).
check_launcher() {
  local launcher="$bin_dir/tuigram"
  if [ -e "$launcher" ] || [ -L "$launcher" ]; then
    grep -qF "$LAUNCHER_MARK" "$launcher" 2>/dev/null ||
      die "$launcher already exists and is not this installer's (another tuigram install?).
  Remove it, or choose another directory with TUIGRAM_BIN_DIR."
  fi
  return 0
}

write_launcher() {
  local launcher="$bin_dir/tuigram" next="$bin_dir/.tuigram.$$"
  mkdir -p "$bin_dir"
  {
    printf '#!/bin/sh\n'
    printf '%s\n' "$LAUNCHER_MARK"
    printf '# Written by %s; running it again rewrites this file.\n' "$INSTALLER_URL"
    printf 'exec %s %s "$@"\n' \
      "$(shell_quote "$install_dir/$node_name/bin/node")" \
      "$(shell_quote "$install_dir/lib/node_modules/tuigram/bin/tuigram.js")"
  } >"$next"
  chmod 755 "$next"
  mv -f "$next" "$launcher"
}

write_receipt() {
  local next="$install_dir/.install.json.$$"
  cat >"$next" <<EOF
{
  "installer": "$INSTALLER_URL",
  "binDir": "$bin_dir",
  "node": "$node_name",
  "tuigram": "$tuigram_version"
}
EOF
  mv -f "$next" "$receipt"
}

# Keeps the Node just installed and the one the previous launcher pointed at: an older tuigram
# still running has that one as its execPath, and its launcher loop respawns through it.
prune_node() {
  local previous=$1 dir name
  for dir in "$install_dir"/node-v*; do
    [ -d "$dir" ] || continue
    name=${dir##*/}
    if [ "$name" = "$node_name" ] || [ "$name" = "$previous" ]; then continue; fi
    rm -rf "$dir"
  done
}

# Sets path_added=1 when it appended to an rc file.
add_to_path() {
  local shell_name rc='' candidate line dir_expr
  case ":$PATH:" in *":$bin_dir:"*) return ;; esac

  dir_expr=$bin_dir
  case "$bin_dir" in "$HOME"/*) dir_expr="\$HOME/${bin_dir#"$HOME"/}" ;; esac
  shell_name=$(basename "${SHELL:-sh}")
  case "$shell_name" in
    fish)
      rc="${XDG_CONFIG_HOME:-$HOME/.config}/fish/config.fish"
      line="fish_add_path \"$dir_expr\""
      ;;
    zsh)
      for candidate in "${ZDOTDIR:-$HOME}/.zshrc" "${ZDOTDIR:-$HOME}/.zshenv"; do
        if [ -f "$candidate" ]; then
          rc=$candidate
          break
        fi
      done
      # A new Mac has no ~/.zshrc, and ~/.local/bin is not on its PATH: create it.
      rc=${rc:-${ZDOTDIR:-$HOME}/.zshrc}
      line="export PATH=\"$dir_expr:\$PATH\""
      ;;
    bash | sh | dash | ash)
      # macOS Terminal opens login shells, which read .bash_profile and not .bashrc.
      local candidates="$HOME/.bashrc $HOME/.bash_profile $HOME/.profile"
      [ "$os" = darwin ] && candidates="$HOME/.bash_profile $HOME/.profile $HOME/.bashrc"
      [ "$shell_name" = bash ] || candidates="$HOME/.profile"
      for candidate in $candidates; do
        if [ -f "$candidate" ]; then
          rc=$candidate
          break
        fi
      done
      line="export PATH=\"$dir_expr:\$PATH\""
      ;;
  esac

  if [ -z "$rc" ]; then
    warn "add $bin_dir to your PATH to run tuigram by name"
    return
  fi
  if [ -f "$rc" ] && grep -qxF "$line" "$rc"; then return; fi
  mkdir -p "$(dirname "$rc")"
  if printf '\n# tuigram\n%s\n' "$line" >>"$rc" 2>/dev/null; then
    say "Added $bin_dir to PATH in $rc"
    path_added=1
  else
    warn "could not write $rc; add this line to it yourself: $line"
  fi
}

main() {
  local requested='' modify_path=1
  install_dir=${TUIGRAM_INSTALL_DIR:-}
  node_mirror=${TUIGRAM_NODE_MIRROR:-https://nodejs.org/dist}
  node_mirror=${node_mirror%/}
  path_added=0

  while [ $# -gt 0 ]; do
    case "$1" in
      -h | --help)
        usage
        exit 0
        ;;
      -v | --version)
        [ -n "${2-}" ] || die '--version needs a version, e.g. --version 1.3.0'
        requested=${2#v}
        shift 2
        ;;
      --install-dir)
        [ -n "${2-}" ] || die '--install-dir needs a directory'
        install_dir=$2
        shift 2
        ;;
      --no-modify-path)
        modify_path=0
        shift
        ;;
      *) die "unknown option: $1 (see --help)" ;;
    esac
  done

  : "${HOME:?HOME is not set}"
  need curl
  need tar
  need awk
  command -v sha256sum >/dev/null 2>&1 || command -v shasum >/dev/null 2>&1 ||
    die "'sha256sum' or 'shasum' is required but not installed"
  detect_platform

  install_dir=${install_dir:-$HOME/.local/lib/tuigram}
  mkdir -p "$install_dir" || die "could not create $install_dir"
  # Physical path: bin/channel.js matches against realpathSync, so the receipt must agree with it.
  install_dir=$(cd "$install_dir" && pwd -P)
  receipt="$install_dir/install.json"
  # An upgrade (which passes only --install-dir) keeps the launcher where the first install put it.
  bin_dir=${TUIGRAM_BIN_DIR:-$(receipt_value binDir)}
  bin_dir=${bin_dir:-$HOME/.local/bin}
  case "$install_dir$bin_dir" in
    *'"'* | *\\*) die 'install paths must not contain double quotes or backslashes' ;;
  esac
  check_launcher

  mkdir "$install_dir/.lock" 2>/dev/null ||
    die "another install is running (if not, remove $install_dir/.lock)"
  tmp=''
  trap 'rm -rf "${tmp:-}" "$bin_dir/.tuigram.$$" "$install_dir/.install.json.$$"; rmdir "$install_dir/.lock" 2>/dev/null || true' EXIT
  trap 'exit 130' INT TERM
  tmp=$(mktemp -d "$install_dir/.tmp.XXXXXX")

  local previous_node
  previous_node=$(receipt_value node)

  resolve_tuigram "${requested:-latest}"
  ensure_node
  install_tuigram
  write_launcher
  write_receipt
  prune_node "$previous_node"
  if [ "$modify_path" = 1 ]; then add_to_path; fi

  local found
  found=$(command -v tuigram 2>/dev/null || true)
  if [ -n "$found" ] && [ "$found" != "$bin_dir/tuigram" ]; then
    warn "another tuigram ($found) comes first on your PATH and will run instead of this one"
  fi

  say ''
  say "tuigram $tuigram_version is installed."
  say ''
  if [ "$path_added" = 1 ]; then say "  exec \$SHELL      # or open a new terminal, to pick up PATH"; fi
  say '  tuigram          # start it'
  say ''
  say "To uninstall:  rm -rf '$install_dir' '$bin_dir/tuigram'"
}

main "$@"
