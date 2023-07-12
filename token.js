import Settings from "./settings.js";

let DEBUG = false;

const debugLog = (...args) => {
    if (DEBUG) {
        console.log(...args);
    }
};

export default class ObfuscatorToken {
    STATE_ON = "on";
    STATE_OFF = "off";
    _token;

    constructor(token) {
        this._token = token;
    }

    get nameState() {
        let state = this._token.getFlag("token-name-obfuscation", "nameState");
        return typeof state === "undefined" ? this.STATE_OFF : state;
    }

    async advanceState() {
        let state = this.nameState;
        state = state === this.STATE_ON ? this.STATE_OFF : this.STATE_ON;

        debugLog("TNO | advanceState() | Setting obfuscation state to", state)
        await this._token.setFlag("token-name-obfuscation", "nameState", state);
        await this._handleObfuscation(state);
        return state;
    }

    async setState(state) {
        debugLog("TNO | setState() | Setting obfuscation state to", state)
        await this._token.setFlag("token-name-obfuscation", "nameState", state);
        await this._handleObfuscation(state);
    }

    // Private internal methods

    async _handleObfuscation(state) {
        switch (state) {
            case this.STATE_OFF:
                await this._turnOffObfuscation();
                break;
            case this.STATE_ON:
                await this._turnOnObfuscation();
                break;
            default:
                await this._turnOffObfuscation();
        }
    }

    async _turnOffObfuscation() {
        let newName = getNameWithAffixes(this._token.name, Settings.placeholderName, game.actors.get(this._token.actorId).name)
        debugLog("TNO | _turnOffObfuscation() | Setting token name to", newName)
        let update = {_id: this._token.actorId, name: newName}
        await this._token.update(update);
    }

    async _turnOnObfuscation() {
        let newName = getNameWithAffixes(this._token.name, game.actors.get(this._token.actorId).name, Settings.placeholderName)
        debugLog("TNO | _turnOnObfuscation() | Setting token name to", newName)
        let update = {_id: this._token.actorId, name: newName}
        await this._token.update(update);
    }
}

function getNameWithAffixes(actualName, expectedName, newName) {
    if (Settings.allowPreserveAffixes && actualName.length > expectedName.length && actualName.includes(expectedName)) {
        let affixes = actualName.split(expectedName)
        return affixes[0] + newName + affixes[1]
    }
    return newName
}