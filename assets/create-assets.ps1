$base64 = Get-Content "d:\Maven\desktop-dog-pet\assets\tray-icon-base64.txt" -Raw
$bytes = [Convert]::FromBase64String($base64)
[System.IO.File]::WriteAllBytes("d:\Maven\desktop-dog-pet\assets\tray-icon.png", $bytes)

$icoBytes = @()
$icoHeader = [byte[]]@(0, 0, 1, 0, 1, 0)
$icoBytes += $icoHeader
$icoEntry = [byte[]]@(32, 32, 0, 0, 1, 0, 32, 0)
$icoBytes += $icoEntry
$sizeBytes = [BitConverter]::GetBytes([uint32]$bytes.Length)
$icoBytes += $sizeBytes
$icoBytes += [BitConverter]::GetBytes([uint32]22)
$icoBytes += $bytes
[System.IO.File]::WriteAllBytes("d:\Maven\desktop-dog-pet\assets\icon.ico", [byte[]]$icoBytes)

$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F5E6D3"/>
      <stop offset="100%" style="stop-color:#E8D5C4"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="120" fill="url(#bg)"/>
  <ellipse cx="128" cy="140" rx="70" ry="45" fill="#F5E6D3"/>
  <ellipse cx="128" cy="100" rx="50" ry="40" fill="#F5E6D3"/>
  <ellipse cx="65" cy="70" rx="22" ry="40" fill="#8D6E63"/>
  <ellipse cx="191" cy="70" rx="22" ry="40" fill="#8D6E63"/>
  <ellipse cx="100" cy="95" rx="12" ry="14" fill="#FFFFFF"/>
  <ellipse cx="156" cy="95" rx="12" ry="14" fill="#FFFFFF"/>
  <ellipse cx="103" cy="98" rx="8" ry="10" fill="#5D4037"/>
  <ellipse cx="159" cy="98" rx="8" ry="10" fill="#5D4037"/>
  <ellipse cx="105" cy="95" rx="3" ry="3" fill="#FFFFFF"/>
  <ellipse cx="161" cy="95" rx="3" ry="3" fill="#FFFFFF"/>
  <ellipse cx="128" cy="125" rx="14" ry="10" fill="#4E342E"/>
  <ellipse cx="125" cy="122" rx="5" ry="3" fill="#6D4C41"/>
  <path d="M115 140 Q128 152 141 140" stroke="#8D6E63" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="128" cy="180" rx="45" ry="15" fill="#FFF8F0"/>
</svg>
"@
[System.IO.File]::WriteAllText("d:\Maven\desktop-dog-pet\assets\icon.svg", $svg, [System.Text.Encoding]::UTF8)

Write-Host "Assets created successfully!"
