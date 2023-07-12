export default class Settings {
    static get placeholderName() {
        return game.settings.get("token-name-obfuscation", "defaultPlaceholder")
    }
    static get allowHUDButton() {
        return game.settings.get("token-name-obfuscation", "allowHUDButton")
    }
    static get allowPlayerOwned() {
        return game.settings.get("token-name-obfuscation", "allowPlayerOwned")
    }
    static get allowPreserveAffixes() {
        return game.settings.get("token-name-obfuscation", "allowPreserveAffixes")
    }

    static register() {
        game.settings.register("token-name-obfuscation", "defaultPlaceholder", {
            name: game.i18n.localize("tno.defaultPlaceholder.name"),
            hint: game.i18n.localize("tno.defaultPlaceholder.hint"),
            scope: "world",
            config: true,
            default: "???",
            type: String,
        });
        game.settings.register("token-name-obfuscation", "allowHUDButton", {
            name: game.i18n.localize("tno.allowHUDButton.name"),
            hint: game.i18n.localize("tno.allowHUDButton.hint"),
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
        });
        game.settings.register("token-name-obfuscation", "allowPlayerOwned", {
            name: game.i18n.localize("tno.allowPlayerOwned.name"),
            hint: game.i18n.localize("tno.allowPlayerOwned.hint"),
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
        });
        game.settings.register("token-name-obfuscation", "allowPreserveAffixes", {
            name: game.i18n.localize("tno.allowPreserveAffixes.name"),
            hint: game.i18n.localize("tno.allowPreserveAffixes.hint"),
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
        });
    }
}