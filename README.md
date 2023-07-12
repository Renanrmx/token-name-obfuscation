# Token Name Obfuscation module for Foundry VTT

This module makes it easy to toggle token names between their original names and a placeholder name, using a HUD toggle button or a simple macro. This allows GMs to leave token name visibility on by default without revealing enemy/NPC information before a dramatic moment

## Features

* Toggle between actor name and placeholder name
* Update multiple tokens at once
* Preserve prefixes or suffixes (works with Token Mold and similar modules)
![Example](media/tno-example.gif)

## Known Issues

* Unintentional prefixes/suffixes - Changing the placeholder name can sometimes result in the module thinking that part of the new placeholder name is a suffix/prefix of the old placeholder name. Try to avoid picking a new placeholder name that contains an older placeholder name, or turn off the Preserve Affixes setting
* Inconsistent name/flag states - Using ctrl+z to revert a change may alter a token's name without a corresponding update to its nameState flag. This will probably only cause issues with prefixes/suffixes. Try to always use the provided button or macro, or turn off the Preserve Affixes setting
