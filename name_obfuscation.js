// import Settings from "./settings.js";
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

let DEBUG = true;

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

        let token = new ObfuscatorToken(hud.object.document);

        // Only allow GM
        if (!game.user.isGM) return;

        // Set up HUD button
        TokenHUD.addButton(
            token,
            hudHtml,
            Obfuscator.toggleName,
        );
    }

    static async toggleName(token) {
        let newState = await token.advanceState();
        if (canvas.tokens.controlled.length > 1) {
            Obfuscator.toggleGroup(newState)
        }
        debugLog(`Obfuscation is now ${newState} for selected tokens`);
    }

    static async toggleGroup(newState) {
        let i = 0;
        while (i < canvas.tokens.controlled.length) {
            let tokenData = canvas.tokens.controlled[i].document;
            let token = new ObfuscatorToken(tokenData);
            await token.setState(newState);
            i++;
        }
    }

//   static setupQuenchTesting() {
//     console.log("Torch | --- In test environment - load test code...");
//     import("./test/test-hook.js")
//       .then((obj) => {
//         try {
//           obj.hookTests();
//           console.log("Torch | --- Tests ready");
//         } catch (err) {
//           console.log("Torch | --- Error registering test code", err);
//         }
//       })
//       .catch((err) => {
//         console.log("Torch | --- No test code found", err);
//       });
//   }
}

Hooks.on("ready", () => {
    Hooks.on("renderTokenHUD", (app, html, data) => {
        if (Settings.allowHUDButton === true) {
            Obfuscator.addObfuscatorButton(app, html, data);
        }
    });
//   Hooks.on("renderControlsReference", (app, html, data) => {
//     html.find("div").first().append(Settings.helpText);
//   });
});

Hooks.once("init", () => {
  // Only load and initialize test suite if we're in a test environment
//   if (game.world.id.startsWith("torch-test-")) {
//     Torch.setupQuenchTesting();
//   }
  Settings.register();
  console.log("Token Name Obfuscation settings registered");
});

console.log("Token Name Obfuscation module loaded");
