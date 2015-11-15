

$prettyfierPath = './PrettyfyJson.exe'

# $PSScriptRoot is equal to the directory where the script is launched from !
$directoryContainingJsonFiles = $PSScriptRoot 



& $prettyfierPath $directoryContainingJsonFiles 