#!/bin/sh

rm tno.zip
cd .. && zip -x\*.git\* -r token-name-obfuscation/tno.zip token-name-obfuscation -x \*.git\* \*.sh \*test\* \*.vscode\*