import Settings from "./settings.js";
import TokenHUD from "./hud.js";
import ObfuscatorToken from "./token.js";

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.        Stephen Hurd
 * ----------------------------------------------------------------------------
 */

let DEBUG = false;

let debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

class Obfuscator {
    /*
    * Add a name obfuscator button to the Token HUD - called from TokenHUD render hook
    */
    static async addObfuscatorButton(hud, hudHtml, hudData) {
        // Only allow GM
        if (!game.user.isGM) return;
        // Only allow non-player-owned tokens
        if (hud.object.actor.hasPlayerOwner && !Settings.allowPlayerOwned) return;

        let token = new ObfuscatorToken(hud.object.document);

        // Set up HUD button
        TokenHUD.addButton(
            token,
            hudHtml,
            Obfuscator.toggleName,
        );
    }

    //Toggle obfuscation state and name for token that spawned HUD button
    //Called from token HUD button
    static async toggleName(token) {
        let newState = await token.advanceState();
        debugLog(`TNO | toggleName() | Setting obfuscation to \'${newState}\' for selected tokens`);
        if (canvas.tokens.controlled.length > 1) {
            console.log("token._token._id:", token._token._id)
            Obfuscator.toggleGroup(newState);
        }
    }

    //Set state and name for all selected tokens to the new state for the token that spawned HUD button
    static async toggleGroup(newState) {
        let i = 0;
        while (i < canvas.tokens.controlled.length) {
            // Skip obfuscation for player-owned tokens unless explicitly alllowed
            if (canvas.tokens.controlled[i].actor.hasPlayerOwner && !Settings.allowPlayerOwned) {
                i++;
                continue;
            }

            let tokenData = canvas.tokens.controlled[i].document;
            let token = new ObfuscatorToken(tokenData);
            // Don't re-obfuscate tokens already in the target state
            if (token.nameState === newState) {
                i++;
                continue;
            }

            await token.setState(newState);
            i++;
        }
    }
}

Hooks.on("ready", () => {
    Hooks.on("renderTokenHUD", (app, html, data) => {
        if (Settings.allowHUDButton === true) {
            Obfuscator.addObfuscatorButton(app, html, data);
        }
    });
});

Hooks.once("init", () => {
  Settings.register();
  debugLog("TNO | Token Name Obfuscation settings registered");
});

console.log("TNO | Token Name Obfuscation module loaded");
