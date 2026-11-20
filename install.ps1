# tuigram installer for Windows: a private Node.js plus tuigram from npm, no prerequisites.
#
#   irm https://raw.githubusercontent.com/leonid-shutov/tuigram/master/install.ps1 | iex
#
# `irm | iex` can't pass options; this form can (see -Help):
#
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/leonid-shutov/tuigram/master/install.ps1))) -Version 1.7.0
#
# The Windows twin of install.sh, and the same recipe: tuigram needs Node >= 26.4 (node:ffi),
# opentui's per-platform library and better-sqlite3's native addon, which is ABI-bound to the
# Node that installed it, so this fetches the Node the release asks for (its `engines.node`) into
# its own folder and installs tuigram with that Node's npm.
#
# Layout (the folder can be changed with -InstallDir or TUIGRAM_INSTALL_DIR):
#   %LOCALAPPDATA%\Programs\tuigram\bin\tuigram.cmd    launcher; only this folder goes on PATH
#   %LOCALAPPDATA%\Programs\tuigram\install.json       receipt: tells bin/channel.js this is a script install
#   %LOCALAPPDATA%\Programs\tuigram\node-vX.Y.Z-win-<arch>\
#   %LOCALAPPDATA%\Programs\tuigram\node_modules\tuigram\
#
# Running it again upgrades in place; `tuigram upgrade` and the in-app upgrade do exactly that.
#
# Written for Windows PowerShell 5.1, which every Windows 10 and 11 has, and kept to ASCII: 5.1
# reads a saved .ps1 without a BOM in the ANSI code page. Under `irm | iex` this runs in the
# user's own session, so it never calls `exit` (that would close their window), reports how it
# went in $LASTEXITCODE instead, and keeps its functions and settings inside the script block
# below, which is only run on the last line: a download cut off midway runs nothing.

param(
  [string]$Version = '',
  [string]$InstallDir = '',
  [switch]$NoModifyPath,
  [switch]$Uninstall,
  [switch]$Help
)

& {
  $ErrorActionPreference = 'Stop'
  # 5.1 redraws its progress bar for every chunk, which makes a download several times slower.
  $ProgressPreference = 'SilentlyContinue'

  $InstallerUrl = 'https://raw.githubusercontent.com/leonid-shutov/tuigram/master/install.ps1'
  $Registry = 'https://registry.npmjs.org/tuigram'
  # The first release whose bin/channel.js upgrades a Windows script install by running this file
  # again. An older one would run install.sh's `bash -c curl ...` instead, which fails on Windows.
  $MinVersion = '1.7.0'
  # Marks a launcher as ours, so a re-run overwrites it but never someone else's tuigram.cmd.
  $LauncherMark = 'rem tuigram-installer launcher'

  function Show-Usage {
    Write-Host @"
tuigram installer for Windows

Usage:
  irm $InstallerUrl | iex
  & ([scriptblock]::Create((irm $InstallerUrl))) [options]

Options:
  -Version <version>    install this version instead of the latest
  -InstallDir <dir>     where Node and tuigram go (default: %LOCALAPPDATA%\Programs\tuigram)
  -NoModifyPath         don't add the launcher's folder to your PATH
  -Uninstall            remove tuigram (your sign-in and settings stay)
  -Help                 show this message

Environment:
  TUIGRAM_INSTALL_DIR   same as -InstallDir
  TUIGRAM_NODE_MIRROR   Node.js download mirror (default: https://nodejs.org/dist)
"@
  }

  function Say([string]$Text) { Write-Host $Text }
  function Warn([string]$Text) { Write-Host "tuigram: $Text" -ForegroundColor Yellow }

  # Fail's messages are meant for the user as they are; anything else that throws is a bug here,
  # and gets the line it came from (see the end of the script).
  function Fail([string]$Text) {
    $exception = New-Object System.Exception $Text
    $exception.Data['tuigram'] = $true
    throw $exception
  }

  # MAJOR.MINOR.PATCH, numerically; a prerelease suffix is dropped, so 1.7.0-beta.1 counts as 1.7.0.
  function ConvertTo-Version([string]$Text) {
    if ($Text -notmatch '^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?') { Fail "not a version: $Text" }
    $parts = @($Matches[1], $Matches[2], $Matches[3]) | ForEach-Object { if ($_) { [int]$_ } else { 0 } }
    New-Object System.Version $parts[0], $parts[1], $parts[2]
  }

  function Test-VersionLess([string]$A, [string]$B) { (ConvertTo-Version $A) -lt (ConvertTo-Version $B) }

  # The HTTP status of a failed web request, or $null when there was no answer at all. 5.1 throws
  # a WebException and 7 an HttpResponseException; both carry a Response with a StatusCode.
  function Get-HttpStatus($Record) {
    $response = $Record.Exception.PSObject.Properties['Response']
    if ($null -eq $response -or $null -eq $response.Value) { return $null }
    [int]$response.Value.StatusCode
  }

  # Runs a native command with its output on the console and returns its exit code. With
  # $ErrorActionPreference at 'Stop', 5.1 turns anything a native command writes to stderr into a
  # terminating error wherever stderr is redirected (CI, say), and npm writes its warnings there:
  # so 'Continue' for the call, and the exit code decides. An argument must not end in a
  # backslash: 5.1 quotes one with a space in it as "...\", which reads as an escaped quote.
  function Invoke-Native([string]$Exe, [string[]]$Arguments) {
    $ErrorActionPreference = 'Continue'
    & $Exe @Arguments | Out-Host
    $LASTEXITCODE
  }

  # The same, keeping stdout instead (trimmed, as one string) and dropping stderr.
  function Invoke-Captured([string]$Exe, [string[]]$Arguments) {
    $ErrorActionPreference = 'Continue'
    $output = & $Exe @Arguments 2>$null
    @{ Code = $LASTEXITCODE; Output = (@($output) -join "`n").Trim() }
  }

  # Windows Defender scans what npm just wrote and holds those files open for a moment, and a
  # rename fails with "access denied" meanwhile; so a move is tried for about three seconds.
  # Moving a folder whose DLLs a running tuigram has loaded still works: only deleting one fails.
  function Move-Retry([string]$From, [string]$To) {
    for ($attempt = 1; ; $attempt++) {
      try {
        [System.IO.Directory]::Move($From, $To)
        return
      } catch {
        if ($attempt -ge 10) { Fail "could not move $From to $To ($($_.Exception.Message))" }
        Start-Sleep -Milliseconds 300
      }
    }
  }

  # Deletes a folder if it can, and says whether it is gone. Through Node when there is one: it
  # handles paths past 260 characters and retries files antivirus has open, which .NET
  # Framework's Directory.Delete doesn't. A file in use (a DLL a running tuigram has loaded)
  # leaves the folder behind; the next run tries again.
  function Remove-Tree([string]$Path, [string]$NodeExe) {
    if (-not (Test-Path -LiteralPath $Path)) { return $true }
    if ($NodeExe -and (Test-Path -LiteralPath $NodeExe)) {
      $script = "require('fs').rmSync(process.argv[1], { recursive: true, force: true, maxRetries: 5 })"
      [void](Invoke-Captured $NodeExe @('-e', $script, $Path))
    } else {
      try { [System.IO.Directory]::Delete($Path, $true) } catch { $null = $_ }
    }
    -not (Test-Path -LiteralPath $Path)
  }

  # The machine's own architecture. $env:PROCESSOR_ARCHITECTURE is this process's, which on an
  # ARM64 PC running x64 PowerShell under emulation says AMD64.
  function Get-Arch {
    if ([Environment]::OSVersion.Version.Major -lt 10) { Fail 'tuigram needs Windows 10 or newer' }
    $key = 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment'
    $native = (Get-ItemProperty -LiteralPath $key).PROCESSOR_ARCHITECTURE
    if ($native -eq 'AMD64') { return 'x64' }
    if ($native -eq 'ARM64') { return 'arm64' }
    Fail "this installer supports 64-bit Windows on x64 and ARM64, not $native"
  }

  # The version and the Node it needs, from the npm registry's manifest of $Tag.
  function Resolve-Tuigram([string]$Tag) {
    try {
      $manifest = Invoke-RestMethod -UseBasicParsing -Uri "$Registry/$Tag" -Headers @{ Accept = 'application/json' }
    } catch {
      $status = Get-HttpStatus $_
      if ($status -eq 404) {
        Fail "tuigram $Tag is not on npm (versions: https://www.npmjs.com/package/tuigram?activeTab=versions)"
      }
      if ($null -ne $status) { Fail "the npm registry answered HTTP $status for tuigram $Tag" }
      Fail "could not reach the npm registry ($($_.Exception.Message))"
    }
    $found = [string]$manifest.version
    if (-not $found) { Fail 'could not read the version from the npm registry' }
    $engines = $null
    if ($manifest.engines) { $engines = [string]$manifest.engines.node }
    if (-not $engines) { Fail "could not read the Node.js version tuigram $found needs" }
    if ($engines -notmatch '(\d+)(?:\.\d+)*') { Fail "could not make sense of tuigram's engines.node: $engines" }
    $release = @{ Version = $found; NodeMajor = $Matches[1]; NodeMin = $Matches[0] }
    if (Test-VersionLess $found $MinVersion) {
      Fail "this installer needs tuigram $MinVersion or newer (asked for $found)"
    }
    $release
  }

  # Makes sure $Dir holds the newest Node of the major the release needs, verified against
  # SHASUMS256.txt, reusing one already there; returns its folder name (node-vX.Y.Z-win-<arch>).
  function Install-Node($Release, [string]$Arch, [string]$Dir, [string]$Mirror, [string]$Tmp) {
    $major = $Release.NodeMajor
    try {
      $sums = (Invoke-WebRequest -UseBasicParsing -Uri "$Mirror/latest-v$major.x/SHASUMS256.txt").Content
    } catch {
      Fail "could not fetch the Node.js $major release list from $Mirror ($($_.Exception.Message))"
    }
    if ($sums -is [byte[]]) { $sums = [System.Text.Encoding]::ASCII.GetString($sums) }

    $expected = $null
    foreach ($line in ($sums -split "`n")) {
      if ($line -match "^([0-9a-f]{64})\s+(node-(v[0-9.]+)-win-$Arch)\.zip\s*$") {
        $expected = $Matches[1]
        $name = $Matches[2]
        $nodeVersion = $Matches[3]
        break
      }
    }
    if (-not $expected) { Fail "no Node.js $major build for win-$Arch on $Mirror" }
    if (Test-VersionLess $nodeVersion $Release.NodeMin) {
      Fail "the newest Node.js $major ($nodeVersion) is older than the $($Release.NodeMin) tuigram needs"
    }

    $nodeDir = Join-Path $Dir $name
    # Both ends of it: a prune that a running tuigram interrupted can leave node.exe without npm.
    $complete = (Test-Path -LiteralPath (Join-Path $nodeDir 'node.exe')) -and
      (Test-Path -LiteralPath (Join-Path $nodeDir 'node_modules\npm\bin\npm-cli.js'))
    if ($complete) {
      Say "Node.js $nodeVersion is already installed"
      return $name
    }
    Say "Downloading Node.js $nodeVersion (win-$Arch)"
    $zip = Join-Path $Tmp "$name.zip"
    try {
      Invoke-WebRequest -UseBasicParsing -Uri "$Mirror/$nodeVersion/$name.zip" -OutFile $zip
    } catch {
      Fail "could not download $name.zip ($($_.Exception.Message))"
    }
    $actual = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) { Fail "$name.zip failed its checksum (expected $expected, got $actual)" }
    # Not Expand-Archive: on 5.1 it takes minutes for Node's few thousand files.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $Tmp)
    # Whatever is there is a leftover of an interrupted run.
    if (-not (Remove-Tree $nodeDir '')) { Fail "could not replace $nodeDir" }
    Move-Retry (Join-Path $Tmp $name) $nodeDir
    $name
  }

  # npm-installs tuigram into a staging prefix with the private Node, checks it starts, then
  # swaps it in: a failed install leaves the working one untouched.
  function Install-Tuigram($Release, [string]$Dir, [string]$NodeName, [string]$Tmp) {
    $nodeDir = Join-Path $Dir $NodeName
    $nodeExe = Join-Path $nodeDir 'node.exe'
    $npmCli = Join-Path $nodeDir 'node_modules\npm\bin\npm-cli.js'
    $staging = Join-Path $Tmp 'p'
    # Windows npm has no lib\ layer: a global package goes straight into <prefix>\node_modules.
    $staged = Join-Path $staging 'node_modules\tuigram'
    $target = Join-Path $Dir 'node_modules\tuigram'
    $version = $Release.Version

    Say "Installing tuigram $version"
    # Node first on PATH: npm runs better-sqlite3's install script through `node`, and the addon
    # it fetches must match this Node's ABI. --allow-scripts names it for npm's script
    # allow-list, and --ignore-scripts=false overrides a user .npmrc that turns scripts off:
    # either way there would be no better_sqlite3.node, and tuigram would die at its first login.
    $savedPath = $env:Path
    $env:Path = "$nodeDir;$env:Path"
    try {
      $code = Invoke-Native $nodeExe @(
        $npmCli, 'install', '--global', '--prefix', $staging,
        '--allow-scripts=better-sqlite3', '--ignore-scripts=false',
        '--no-fund', '--no-audit', '--no-update-notifier', '--loglevel=error',
        "tuigram@$version"
      )
    } finally {
      $env:Path = $savedPath
    }
    if ($code -ne 0) { Fail "npm could not install tuigram $version" }

    $reported = Invoke-Captured $nodeExe @((Join-Path $staged 'bin\tuigram.js'), '--version')
    if ($reported.Code -ne 0) { Fail 'the installed tuigram does not start' }
    if ($reported.Output -ne $version) { Fail "installed tuigram reports $($reported.Output), expected $version" }
    # better-sqlite3 loads its addon lazily, on the first Database: a bare require proves nothing.
    # No double quotes in the script: 5.1 passes them to a native command unescaped.
    $sqlite = Join-Path $staged 'node_modules\better-sqlite3'
    $check = Invoke-Captured $nodeExe @('-e', "new (require(process.argv[1]))(':memory:').close()", $sqlite)
    if ($check.Code -ne 0) { Fail "better-sqlite3's native addon does not load under Node.js in $nodeDir" }

    New-Item -ItemType Directory -Force -Path (Join-Path $Dir 'node_modules') | Out-Null
    $previous = Join-Path $Tmp 'old'
    if (Test-Path -LiteralPath $target) { Move-Retry $target $previous }
    try {
      Move-Retry $staged $target
    } catch {
      if (Test-Path -LiteralPath $previous) { Move-Retry $previous $target }
      throw
    }
  }

  # Refuses, before anything is downloaded, to take over a folder this installer didn't set up:
  # npm's own prefix (%APPDATA%\npm) holds node_modules\tuigram and a tuigram.cmd of its own.
  function Assert-Ours([string]$Dir) {
    $receipt = Join-Path $Dir 'install.json'
    if ((Test-Path -LiteralPath (Join-Path $Dir 'node_modules\tuigram')) -and -not (Test-Path -LiteralPath $receipt)) {
      Fail "$Dir already holds a tuigram this installer didn't put there (an npm install?). Choose another -InstallDir."
    }
    $launcher = Join-Path $Dir 'bin\tuigram.cmd'
    if ((Test-Path -LiteralPath $launcher) -and -not (Select-String -LiteralPath $launcher -SimpleMatch $LauncherMark -Quiet)) {
      Fail "$launcher already exists and is not this installer's. Remove it, or choose another -InstallDir."
    }
  }

  # npm's own .cmd shim (cmd-shim), pointed at the private Node. cmd reads a batch file a line at
  # a time while it runs, so the upgrade rewriting this file under a running tuigram could make it
  # run garbage afterwards; the last line is parsed whole before it runs, and its failing `goto`
  # ends the batch there, so cmd never reads the file again. That also passes Node's exit code
  # straight through, and keeps ctrl+c from asking "Terminate batch job (Y/N)?". Paths are
  # relative to the launcher (dp0, which the CALL gets right even when the launcher was started
  # by a quoted name): cmd reads a batch file in the OEM code page, so an absolute path under a
  # user folder like C:\Users\<Cyrillic name> would not survive being written into it.
  function Write-Launcher([string]$Dir, [string]$NodeName) {
    $bin = Join-Path $Dir 'bin'
    $launcher = Join-Path $bin 'tuigram.cmd'
    $text = (@(
        '@ECHO off',
        $LauncherMark,
        "rem Written by $InstallerUrl; running it again rewrites this file.",
        'GOTO start',
        ':find_dp0',
        'SET dp0=%~dp0',
        'EXIT /b',
        ':start',
        'SETLOCAL',
        'CALL :find_dp0',
        "endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & `"%dp0%..\$NodeName\node.exe`" `"%dp0%..\node_modules\tuigram\bin\tuigram.js`" %*"
      ) -join "`r`n") + "`r`n"
    if ((Test-Path -LiteralPath $launcher) -and ([System.IO.File]::ReadAllText($launcher) -eq $text)) { return }
    New-Item -ItemType Directory -Force -Path $bin | Out-Null
    $next = Join-Path $bin ".tuigram.$PID.cmd"
    [System.IO.File]::WriteAllText($next, $text, [System.Text.Encoding]::ASCII)
    Move-Item -LiteralPath $next -Destination $launcher -Force
  }

  function Read-ReceiptNode([string]$Dir) {
    try {
      $receipt = Get-Content -Raw -LiteralPath (Join-Path $Dir 'install.json') | ConvertFrom-Json
      [string]$receipt.node
    } catch {
      ''
    }
  }

  # Same keys as install.sh's, minus binDir: the launcher always sits in <dir>\bin here.
  function Write-Receipt([string]$Dir, [string]$NodeName, [string]$Version) {
    $text = "{`n  `"installer`": `"$InstallerUrl`",`n  `"node`": `"$NodeName`",`n  `"tuigram`": `"$Version`"`n}`n"
    $next = Join-Path $Dir ".install.$PID.json"
    [System.IO.File]::WriteAllText($next, $text, (New-Object System.Text.UTF8Encoding $false))
    Move-Item -LiteralPath $next -Destination (Join-Path $Dir 'install.json') -Force
  }

  # Keeps the Node just installed and the one the previous launcher pointed at: a tuigram still
  # running has that one as its execPath (the in-app upgrade runs this from it, too).
  function Remove-OldNodes([string]$Dir, [string]$Keep, [string]$Previous) {
    $nodeExe = Join-Path $Dir "$Keep\node.exe"
    foreach ($folder in @(Get-ChildItem -LiteralPath $Dir -Directory -Filter 'node-v*')) {
      if ($folder.Name -ne $Keep -and $folder.Name -ne $Previous) { [void](Remove-Tree $folder.FullName $nodeExe) }
    }
  }

  function Get-PathEntries([string]$Value) { @($Value -split ';' | Where-Object { $_ }) }

  # Whether a PATH entry (perhaps written with %VARIABLES%) names $Dir.
  function Test-SamePath([string]$Entry, [string]$Dir) {
    [Environment]::ExpandEnvironmentVariables($Entry).TrimEnd('\') -eq $Dir
  }

  # The user's PATH as stored, %USERPROFILE% and all: [Environment]::GetEnvironmentVariable would
  # expand those, and writing that back would pin them to today's values.
  function Get-UserPath {
    $key = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment')
    if ($null -eq $key) { return '' }
    try {
      [string]$key.GetValue('Path', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
    } finally {
      $key.Close()
    }
  }

  function Set-UserPath([string]$Value) {
    $key = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey('Environment')
    try {
      if ($Value) {
        $key.SetValue('Path', $Value, [Microsoft.Win32.RegistryValueKind]::ExpandString)
      } else {
        $key.DeleteValue('Path', $false)
      }
    } finally {
      $key.Close()
    }
    # Writing the registry tells no one; SetEnvironmentVariable announces a change to Explorer
    # (WM_SETTINGCHANGE), so terminals opened from now on see the new PATH.
    [Environment]::SetEnvironmentVariable('TUIGRAM_INSTALLER', '1', 'User')
    [Environment]::SetEnvironmentVariable('TUIGRAM_INSTALLER', $null, 'User')
  }

  # First among the user's own entries, so it wins over an npm install's %APPDATA%\npm; also put
  # on this window's PATH, so `tuigram` works here straight away. Says whether it changed PATH.
  function Add-ToPath([string]$Bin) {
    $entries = Get-PathEntries (Get-UserPath)
    $added = $false
    if (-not ($entries | Where-Object { Test-SamePath $_ $Bin })) {
      Set-UserPath ((@($Bin) + $entries) -join ';')
      Say "Added $Bin to your PATH"
      $added = $true
    }
    if (-not (Get-PathEntries $env:Path | Where-Object { Test-SamePath $_ $Bin })) { $env:Path = "$Bin;$env:Path" }
    $added
  }

  function Remove-FromPath([string]$Bin) {
    $entries = Get-PathEntries (Get-UserPath)
    $kept = @($entries | Where-Object { -not (Test-SamePath $_ $Bin) })
    if ($kept.Count -ne $entries.Count) { Set-UserPath ($kept -join ';') }
    $env:Path = (Get-PathEntries $env:Path | Where-Object { -not (Test-SamePath $_ $Bin) }) -join ';'
  }

  function Get-DataDirs {
    $home_ = [Environment]::GetFolderPath('UserProfile')
    $dirs = @(
      @('XDG_CONFIG_HOME', '.config'), @('XDG_DATA_HOME', '.local\share'),
      @('XDG_STATE_HOME', '.local\state'), @('XDG_CACHE_HOME', '.cache')
    )
    foreach ($pair in $dirs) {
      $base = [Environment]::GetEnvironmentVariable($pair[0])
      if (-not $base) { $base = Join-Path $home_ $pair[1] }
      $dir = Join-Path $base 'tuigram'
      if (Test-Path -LiteralPath $dir) { $dir }
    }
  }

  function Uninstall-Tuigram([string]$Dir) {
    if (-not (Test-Path -LiteralPath (Join-Path $Dir 'install.json'))) {
      Fail "$Dir holds no tuigram from this installer (no install.json), so nothing was removed"
    }
    # A running tuigram holds node.exe and its DLLs, which can't be deleted: stop before deleting
    # anything, rather than leave half an install.
    $running = @(Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        try { $_.Path -and $_.Path.StartsWith("$Dir\", [StringComparison]::OrdinalIgnoreCase) } catch { $false }
      })
    if ($running.Count -gt 0) { Fail 'tuigram is running; quit it first, then uninstall again' }

    Remove-FromPath (Join-Path $Dir 'bin')
    # The deep part through Node (see Remove-Tree), whose own node_modules is not in use; what's
    # left is shallow enough for .NET.
    $nodeExe = @(Get-ChildItem -LiteralPath $Dir -Directory -Filter 'node-v*' |
        ForEach-Object { Join-Path $_.FullName 'node.exe' } |
        Where-Object { Test-Path -LiteralPath $_ }) | Select-Object -First 1
    [void](Remove-Tree (Join-Path $Dir 'node_modules') $nodeExe)
    foreach ($folder in @(Get-ChildItem -LiteralPath $Dir -Directory -Filter 'node-v*')) {
      [void](Remove-Tree (Join-Path $folder.FullName 'node_modules') $nodeExe)
    }
    if (-not (Remove-Tree $Dir '')) { Fail "could not remove all of $Dir; delete what is left by hand" }

    Say "tuigram is uninstalled."
    $data = @(Get-DataDirs)
    if ($data.Count -gt 0) {
      Say ''
      Say 'Your sign-in, settings and cache are still here; delete these folders to remove them too:'
      foreach ($path in $data) { Say "  $path" }
    }
  }

  function Main {
    if ($Help) {
      Show-Usage
      return
    }
    # Under `irm | iex` these change the user's own session; both only ever add what's missing.
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

    $defaultDir = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Programs\tuigram'
    $dir = $InstallDir
    if (-not $dir) { $dir = $env:TUIGRAM_INSTALL_DIR }
    if (-not $dir) { $dir = $defaultDir }
    # Resolved against PowerShell's current location, which [IO.Path]::GetFullPath doesn't use.
    $dir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($dir).TrimEnd('\')

    if ($Uninstall) {
      Uninstall-Tuigram $dir
      return
    }

    $requested = ([string]$Version).TrimStart('v')
    if (-not $requested) { $requested = 'latest' }
    $mirror = $env:TUIGRAM_NODE_MIRROR
    if (-not $mirror) { $mirror = 'https://nodejs.org/dist' }
    $mirror = $mirror.TrimEnd('/')
    $bin = Join-Path $dir 'bin'
    $launcher = Join-Path $bin 'tuigram.cmd'

    $arch = Get-Arch
    Assert-Ours $dir
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    # Windows lets go of this lock when the process ends, however it ends: no stale lock to remove.
    try {
      $lock = [System.IO.File]::Open((Join-Path $dir '.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    } catch {
      Fail 'another tuigram install is running'
    }

    # Every variable this reads is set here first: an unset one would be looked up in the caller's
    # scope, which under `irm | iex` is the user's own session.
    $tmp = $null
    $nodeName = $null
    $release = $null
    $added = $false
    $previousNode = Read-ReceiptNode $dir
    $previousExe = ''
    if ($previousNode) { $previousExe = Join-Path $dir "$previousNode\node.exe" }
    try {
      # What earlier runs couldn't delete, files a running tuigram had open at the time.
      foreach ($old in @(Get-ChildItem -LiteralPath $dir -Directory -Filter '.t-*')) {
        [void](Remove-Tree $old.FullName $previousExe)
      }
      # Short: npm's tree goes in here, and .NET Framework still stops at 260 characters a path.
      $tmp = Join-Path $dir ('.t-' + [Guid]::NewGuid().ToString('N').Substring(0, 6))
      New-Item -ItemType Directory -Path $tmp | Out-Null

      $release = Resolve-Tuigram $requested
      $nodeName = Install-Node $release $arch $dir $mirror $tmp
      Install-Tuigram $release $dir $nodeName $tmp
      Write-Launcher $dir $nodeName
      Write-Receipt $dir $nodeName $release.Version
      Remove-OldNodes $dir $nodeName $previousNode
      if (-not $NoModifyPath) { $added = Add-ToPath $bin }
    } finally {
      if ($tmp) {
        $cleaner = $previousExe
        if ($nodeName) { $cleaner = Join-Path $dir "$nodeName\node.exe" }
        [void](Remove-Tree $tmp $cleaner)
      }
      $lock.Close()
      Remove-Item -LiteralPath (Join-Path $dir '.lock') -Force -ErrorAction SilentlyContinue
    }

    $found = Get-Command tuigram -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found -and $found.Source -and -not (Test-SamePath $found.Source $launcher)) {
      Warn "another tuigram ($($found.Source)) comes first on your PATH and will run instead of this one"
    }

    $uninstall = "& ([scriptblock]::Create((irm $InstallerUrl))) -Uninstall"
    if ($dir -ne $defaultDir) { $uninstall += " -InstallDir '$($dir -replace "'", "''")'" }
    Say ''
    Say "tuigram $($release.Version) is installed. Run it with:"
    Say ''
    Say '  tuigram'
    Say ''
    if ($added) { Say 'Terminals that were already open find it once reopened.' }
    Say "To uninstall:  $uninstall"
  }

  try {
    Main
    $global:LASTEXITCODE = 0
  } catch {
    $message = $_.Exception.Message
    if (-not $_.Exception.Data['tuigram']) { $message += " (install.ps1 line $($_.InvocationInfo.ScriptLineNumber))" }
    Write-Host "tuigram: $message" -ForegroundColor Red
    $global:LASTEXITCODE = 1
  }
}
