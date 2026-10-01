$workspacePath = [System.IO.Path]::GetFullPath((Get-Location).Path)
$cachePath = [System.IO.Path]::GetFullPath((Join-Path $workspacePath '.next\cache'))
$expectedPath = 'D:\HAVIKAR\mantrakshata-website - Copy\.next\cache'
if ($cachePath -ne $expectedPath) { throw 'Cache target is outside the intended project.' }
if (Test-Path -LiteralPath $cachePath) { Remove-Item -LiteralPath $cachePath -Recurse -Force }
Write-Output 'Cleared generated Next build cache within the target project.'
