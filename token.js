let DEBUG = true;

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
        state = state === this.STATE_OFF ? this.STATE_ON : this.STATE_OFF;

        await this._token.setFlag("token-name-obfuscation", "nameState", state);
        await this._handleObfuscation(state);
        return state;
    }

    async setState(state) {
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
        let baseName = game.actors.get(this._token.actorId).name;
        let update = {_id: this._token.actorId, name: baseName}
        await this._token.update(update);
    }

    async _turnOnObfuscation() {
        let placeholderName = "???";
        let update = {_id: this._token.actorId, name: placeholderName}
        await this._token.update(update);
    }

}
