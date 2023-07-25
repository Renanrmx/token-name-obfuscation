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
        if (Settings.keepDuplicatesInSync) {
            await Obfuscator.toggleDuplicates(token.actorName, newState);
        }
        debugLog(`TNO | toggleName() | Setting obfuscation to \'${newState}\' for selected tokens`);
        if (canvas.tokens.controlled.length > 1) {
            Obfuscator.toggleGroup(newState);
        }
    }

    //Set state and name for all selected tokens to the new state for the token that spawned HUD button
    static async toggleGroup(newState) {
        for (tokenData of canvas.tokens.controlled) {
            // Skip obfuscation for player-owned tokens unless explicitly allowed
            if (tokenData.actor.hasPlayerOwner && !Settings.allowPlayerOwned) {
                continue;
            }

            let token = new ObfuscatorToken(tokenData.document);
            // Don't re-obfuscate tokens already in the target state
            if (token.nameState === newState) {
                continue;
            }

            await token.setState(newState);
            if (Settings.keepDuplicatesInSync) {
                await this.toggleDuplicates(token.actorName, newState);
            }
        }
    }

    //Set state and name for all duplicates of a token that was just toggled
    static async toggleDuplicates(actorName, newState) {
        for (tokenData of game.scenes.active.tokens.contents) {
            // Ignore tokens from different actors
            if (tokenData.actor.name !== actorName) {
                continue;
            }
            // Skip obfuscation for player-owned tokens unless explicitly allowed
            if (tokenData.actor.hasPlayerOwner && !Settings.allowPlayerOwned) {
                continue;
            }

            let token = new ObfuscatorToken(tokenData);
            // Skip tokens that are already in the target state
            if (token.nameState === newState) {
                continue;
            };

            await token.setState(newState);
        };
    }

    static setupQuenchTesting() {
        debugLog("TNO | --- In test environment - load test code...");
        import("../test/test-hook.js")
            .then((obj) => {
            try {
                obj.hookTests();
                debugLog("TNO | --- Tests ready");
            } catch (err) {
                debugLog("TNO | --- Error registering test code", err);
            }
            })
            .catch((err) => {
                debugLog("TNO | --- No test code found", err);
            });
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
    // Only load and initialize test suite if we're in a test environment
    if (game.world.title.includes("tno-test")) {
        Obfuscator.setupQuenchTesting();
    }
    Settings.register();
    debugLog("TNO | Token Name Obfuscation settings registered");
});

console.log("TNO | Token Name Obfuscation module loaded");
