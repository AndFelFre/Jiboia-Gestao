$files = Get-ChildItem -Path src -Filter *.ts* -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'abase/auth') {
        Write-Host "Fixing $($file.FullName)"
        $newContent = $content -replace 'abase/auth', '@/lib/supabase/auth'
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
    }
}
