Set WshShell = CreateObject("WScript.Shell")
' Get the directory of the current script
strPath = Left(WScript.ScriptPosition, InStrRev(WScript.ScriptPosition, "\"))
' Run the batch file hidden
WshShell.Run chr(34) & strPath & "run-php-server.bat" & chr(34), 0, False
