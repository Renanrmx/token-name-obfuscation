export default class Settings {
    static get placeholderName() {
        return game.settings.get("token-name-obfuscation", "defaultPlaceholder")
    }
    static get allowHUDButton() {
        return game.settings.get("token-name-obfuscation", "allowHUDButton")
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
    }
}