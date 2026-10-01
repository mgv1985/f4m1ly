$galleryRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$imageRoot = Join-Path $galleryRoot 'images'
$manifestPath = Join-Path $galleryRoot 'gallery-manifest.js'

$filenames = Get-ChildItem -LiteralPath $imageRoot -File |
  Where-Object { $_.Extension -match '^\.(webp|jpe?g|png|avif)$' } |
  Sort-Object Name |
  Select-Object -ExpandProperty Name

$json = $filenames | ConvertTo-Json
$content = "window.FLORAL_IMAGES = $json;`n"
[System.IO.File]::WriteAllText($manifestPath, $content, [System.Text.UTF8Encoding]::new($false))
Write-Output "Created gallery-manifest.js with $($filenames.Count) images."
