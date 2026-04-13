# bootstrap.ps1 - Windows Dev Environment Bootstrap
# Run from PowerShell: .\bootstrap.ps1

$ErrorActionPreference = "Continue"
$results = @{}

Write-Host "`n=== Windows Dev Environment Bootstrap ===" -ForegroundColor Cyan

# ── 1. Tool detection & install ─────────────────────────────────────────────

function Test-Command($cmd) {
    return $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Get-VersionOrMissing($cmd, $vargs) {
    if (Test-Command $cmd) {
        try { return (& $cmd @vargs 2>&1) | Select-Object -First 1 | Out-String | ForEach-Object { $_.Trim() } } catch { return "error" }
    }
    return $null
}

$tools = @(
    @{ name = "git";    cmd = "git";    vargs = @("--version");  winget = "Git.Git" },
    @{ name = "gh";     cmd = "gh";     vargs = @("--version");  winget = "GitHub.cli" },
    @{ name = "node";   cmd = "node";   vargs = @("--version");  winget = "OpenJS.NodeJS.LTS" },
    @{ name = "npm";    cmd = "npm";    vargs = @("--version");  winget = $null },
    @{ name = "python"; cmd = "python"; vargs = @("--version");  winget = "Python.Python.3.12" }
)

Write-Host "`n[1/5] Checking tools..." -ForegroundColor Yellow

foreach ($tool in $tools) {
    $ver = Get-VersionOrMissing $tool.cmd $tool.vargs
    if ($ver) {
        $results[$tool.name] = $ver
        Write-Host "  [OK] $($tool.name): $ver" -ForegroundColor Green
    } else {
        $results[$tool.name] = "MISSING"
        Write-Host "  [!!] $($tool.name): NOT FOUND" -ForegroundColor Red
        if ($tool.winget) {
            Write-Host "       -> Run manually: winget install --id $($tool.winget) -e --source winget" -ForegroundColor DarkYellow
        } else {
            Write-Host "       -> Installed with parent package (check Node.js)" -ForegroundColor DarkYellow
        }
    }
}

# ── 2. PATH configuration ────────────────────────────────────────────────────

Write-Host "`n[2/5] Checking PATH entries..." -ForegroundColor Yellow

$pathsToEnsure = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312",
    "$env:LOCALAPPDATA\Programs\Python\Python312\Scripts",
    "$env:ProgramFiles\Git\cmd",
    "$env:ProgramFiles\GitHub CLI",
    "$env:ProgramFiles\nodejs"
)

$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
$missing = @()

foreach ($p in $pathsToEnsure) {
    if (Test-Path $p) {
        if ($currentPath -notlike "*$p*") {
            $missing += $p
            Write-Host "  [ADD] $p" -ForegroundColor DarkYellow
        } else {
            Write-Host "  [OK] $p" -ForegroundColor Green
        }
    } else {
        Write-Host "  [--] $p (directory not present, skipping)" -ForegroundColor DarkGray
    }
}

if ($missing.Count -gt 0) {
    $newPath = $currentPath + ";" + ($missing -join ";")
    [System.Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "  PATH updated. Restart your terminal for changes to take effect." -ForegroundColor DarkYellow
} else {
    Write-Host "  PATH looks good." -ForegroundColor Green
}

# ── 3. GitHub auth (non-interactive) ────────────────────────────────────────

Write-Host "`n[3/5] Checking GitHub auth..." -ForegroundColor Yellow

$ghAuth = $null
if (Test-Command "gh") {
    $ghAuth = & gh auth status 2>&1 | Out-String
    if ($ghAuth -match "Logged in") {
        $user = ($ghAuth | Select-String "account (.+?) \(").Matches[0].Groups[1].Value
        Write-Host "  [OK] Authenticated as: $user" -ForegroundColor Green
        $results["gh_auth"] = "authenticated as $user"
    } else {
        Write-Host "  [!!] Not authenticated with GitHub." -ForegroundColor Red
        Write-Host "       -> Run manually in your terminal:" -ForegroundColor DarkYellow
        Write-Host "          gh auth login --web" -ForegroundColor White
        Write-Host "       Or create a token at: https://github.com/settings/tokens/new" -ForegroundColor White
        Write-Host "       Then run: gh auth login --with-token < token.txt" -ForegroundColor White
        $results["gh_auth"] = "NOT AUTHENTICATED"
    }
} else {
    $results["gh_auth"] = "gh not installed"
}

# ── 4. Version verification ──────────────────────────────────────────────────

Write-Host "`n[4/5] Verification summary..." -ForegroundColor Yellow

$allOk = $true
foreach ($tool in $tools) {
    $status = $results[$tool.name]
    if ($status -eq "MISSING") {
        Write-Host "  [FAIL] $($tool.name)" -ForegroundColor Red
        $allOk = $false
    } else {
        Write-Host "  [PASS] $($tool.name): $status" -ForegroundColor Green
    }
}

# ── 5. Write environment state to CLAUDE.md ──────────────────────────────────

Write-Host "`n[5/5] Updating CLAUDE.md..." -ForegroundColor Yellow

$claudeMdPath = Join-Path $PSScriptRoot "CLAUDE.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

$envBlock = @"

## Environment State
_Last verified: $timestamp_

| Tool    | Version / Status |
|---------|-----------------|
| git     | $($results['git']) |
| gh      | $($results['gh']) |
| gh auth | $($results['gh_auth']) |
| node    | $($results['node']) |
| npm     | $($results['npm']) |
| python  | $($results['python']) |

- Shell: PowerShell + Git Bash (Windows)
- Node: LTS via winget / nodejs.org
- Python: 3.12 via winget / python.org
"@

if (Test-Path $claudeMdPath) {
    $existing = Get-Content $claudeMdPath -Raw
    # Remove any previous Environment State block
    $existing = $existing -replace "(?s)\n## Environment State.*", ""
    Set-Content $claudeMdPath ($existing.TrimEnd() + "`n" + $envBlock)
} else {
    Set-Content $claudeMdPath $envBlock
}

Write-Host "  CLAUDE.md updated at $claudeMdPath" -ForegroundColor Green

# ── Done ─────────────────────────────────────────────────────────────────────

Write-Host "`n=== Bootstrap complete ===" -ForegroundColor Cyan
if ($allOk) {
    Write-Host "All tools verified. Environment is ready." -ForegroundColor Green
} else {
    Write-Host "Some tools are missing. Follow the instructions above, then re-run bootstrap.ps1." -ForegroundColor Red
}
