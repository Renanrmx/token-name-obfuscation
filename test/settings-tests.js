import ObfuscatorToken from '../scripts/token.js';
import Settings from '../scripts/settings.js';


const NPC_NAME = "npc";
const PC_NAME = "pc";
const PLACEHOLDER_NAME_UPDATE = "monster";
const MACRO_ID = "Un8uPUTK9Z5tieXv";

let initiateWith = async function(name, assert) {
    let foundryToken = game.scenes.active.tokens.getName(name);
    assert.ok(foundryToken, "Token for "+ name + " not found in scene");
    let token = new ObfuscatorToken(foundryToken);
    return {token, foundryToken};
}

let initiateWithGroup = async function(name, assert) {
    let foundryTokens = [];
    for (let tokenData of game.scenes.active.tokens.contents) {
        if (tokenData.actor.name === name) {
            foundryTokens.push(tokenData);
        };
    };
    assert.ok(foundryTokens.length > 0, "Tokens for "+ name + " not found in scene");
    return foundryTokens;
}

export let tnoSettingsTests = (context) => {
    const {describe, it, assert, afterEach} = context;
    describe('TNO Settings Tests', () => {
        it('Verify default setup', async () => {
            let placeholderDefault = game.settings.settings.get("token-name-obfuscation.defaultPlaceholder").default;
            let buttonDefault = game.settings.settings.get("token-name-obfuscation.allowHUDButton").default;
            let pcsDefault = game.settings.settings.get("token-name-obfuscation.allowPlayerOwned").default;
            let affixesDefault = game.settings.settings.get("token-name-obfuscation.allowPreserveAffixes").default;
            let duplicatesDefault = game.settings.settings.get("token-name-obfuscation.keepDuplicatesInSync").default;

            await game.settings.set("token-name-obfuscation", "defaultPlaceholder", placeholderDefault);
            await game.settings.set("token-name-obfuscation", "allowHUDButton", buttonDefault);
            await game.settings.set("token-name-obfuscation", "allowPlayerOwned", pcsDefault);
            await game.settings.set("token-name-obfuscation", "allowPreserveAffixes", affixesDefault);
            await game.settings.set("token-name-obfuscation", "keepDuplicatesInSync", duplicatesDefault);

            let placeholderSetting = Settings.placeholderName;
            let buttonSetting = Settings.allowHUDButton;
            let pcsSetting = Settings.allowPlayerOwned;
            let affixesSetting = Settings.allowPreserveAffixes;
            let duplicatesSetting = Settings.keepDuplicatesInSync;
            assert.equal(placeholderDefault, placeholderSetting, "Failed to reset defaultPlaceholder to default value. Current value:" + placeholderSetting);
            assert.equal(buttonDefault, buttonSetting, "Failed to reset allowHUDButton to default value. Current value:" + buttonSetting);
            assert.equal(pcsDefault, pcsSetting, "Failed to reset allowPlayerOwned to default value. Current value:" + pcsSetting);
            assert.equal(affixesDefault, affixesSetting, "Failed to reset allowPreserveAffixes to default value. Current value:" + affixesSetting);
            assert.equal(duplicatesDefault, duplicatesSetting, "Failed to reset keepDuplicatesInSync to default value. Current value:" + duplicatesSetting);
        });
        it('Default placeholder setting', async () => {
            const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
            let placeholderDefault = game.settings.settings.get("token-name-obfuscation.defaultPlaceholder").default;

            // change placeholder
            await game.settings.set("token-name-obfuscation", "defaultPlaceholder", PLACEHOLDER_NAME_UPDATE);
            let placeholderSetting = Settings.placeholderName;
            assert.equal(PLACEHOLDER_NAME_UPDATE, placeholderSetting, "Failed to set defaultPlaceholder to new value. Current value:" + placeholderSetting);
            await token.setState(token.STATE_ON);
            assert.equal(foundryToken.name, PLACEHOLDER_NAME_UPDATE, "unexpected name:" + foundryToken.name);
            await token.setState(token.STATE_OFF);

            // revert placeholder
            await game.settings.set("token-name-obfuscation", "defaultPlaceholder", placeholderDefault);
            placeholderSetting = Settings.placeholderName;
            assert.equal(placeholderDefault, placeholderSetting, "Failed to reset defaultPlaceholder to default value. Current value:" + placeholderSetting);
            await token.setState(token.STATE_ON);
            assert.equal(foundryToken.name, placeholderDefault, "unexpected name:" + foundryToken.name);
            await token.setState(token.STATE_OFF);
        });
        it('Allow HUD Button setting', async () => {
            const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
            let buttonDefault = game.settings.settings.get("token-name-obfuscation.allowHUDButton").default;

            // change button setting
            await game.settings.set("token-name-obfuscation", "allowHUDButton", !buttonDefault);
            let buttonSetting = Settings.allowHUDButton;
            assert.equal(!buttonDefault, buttonSetting, "Failed to set allowHUDButton to new value. Current value:" + buttonSetting);
            // toggle state for one token with HUD button
            await foundryToken.object.release();
            await foundryToken.object.control();
            await foundryToken.object._onClickRight(new Event({}));
            await waitForHUD();
            let buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0];
            assert.equal(buttonOn, undefined, "Found unexpected HUD button");

            // revert button setting
            await game.settings.set("token-name-obfuscation", "allowHUDButton", buttonDefault);
            buttonSetting = Settings.allowHUDButton;
            assert.equal(buttonDefault, buttonSetting, "Failed to set allowHUDButton to default. Current value:" + buttonSetting);
            // toggle state for one token with HUD button
            await foundryToken.object.release();
            await foundryToken.object.control();
            await foundryToken.object._onClickRight(new Event({}));
            await waitForHUD();
            buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0];
            assert.ok(buttonOn, "Expected HUD button to be present, but couldn't find it");
        });
        it('Allow owned tokens setting', async () => {
            const {token, foundryToken} = await initiateWith(PC_NAME, assert);
            let ownedDefault = game.settings.settings.get("token-name-obfuscation.allowPlayerOwned").default;

            // select another token to deselect main token
            // toggle state for one token with HUD button
            await foundryToken.object.release();
            await foundryToken.object.control();
            await foundryToken.object._onClickRight(new Event({}));
            await waitForHUD();
            let buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0];
            assert.equal(buttonOn, undefined, "Found unexpected HUD button");
            // directly change obfuscation state
            await token.setState(token.STATE_ON);
            assert.equal(token.nameState, token.STATE_OFF, "Obfuscation should not have turned on");
            assert.equal(foundryToken.name, PC_NAME, "unexpected name:" + foundryToken.name);

            // change allowPlayerOwned setting
            await game.settings.set("token-name-obfuscation", "allowPlayerOwned", !ownedDefault);
            let ownedSetting = Settings.allowPlayerOwned;
            assert.equal(!ownedDefault, ownedSetting, "Failed to set allowPlayerOwned to new value. Current value:" + ownedSetting);

            // select another token to deselect main token
            // toggle state for one token with HUD button
            await foundryToken.object.release();
            await foundryToken.object.control();
            await foundryToken.object._onClickRight(new Event({}));
            await waitForHUD();
            buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0];
            assert.ok(buttonOn, "Expected HUD button to be present, but couldn't find it");
            // directly change obfuscation state
            let placeholderSetting = Settings.placeholderName;
            await token.setState(token.STATE_ON);
            assert.equal(token.nameState, token.STATE_ON, "Obfuscation should have turned on");
            assert.equal(foundryToken.name, placeholderSetting, "unexpected name:" + foundryToken.name);
            // revert obfuscation state
            await token.setState(token.STATE_OFF);

            // revert allowPlayerOwned setting
            await game.settings.set("token-name-obfuscation", "allowPlayerOwned", ownedDefault);
            ownedSetting = Settings.allowPlayerOwned;
            assert.equal(ownedDefault, ownedSetting, "Failed to set allowPlayerOwned to default. Current value:" + ownedSetting);
        });
        it('Allow preserve affixes setting', async () => {
            const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
            let affixesDefault = game.settings.settings.get("token-name-obfuscation.allowPreserveAffixes").default;

            // manually give token a new name
            let placeholderSetting = Settings.placeholderName;
            let nameWithAffixes = "prefix" + foundryToken.name + "suffix";
            let placeholderWithAffixes = "prefix" + placeholderSetting + "suffix";
            let update = {_id: foundryToken.actorId, name: nameWithAffixes};
            await foundryToken.update(update);
            assert.equal(foundryToken.name, nameWithAffixes, "unexpected name after manual update:" + foundryToken.name);

            // directly change obfuscation state
            await token.setState(token.STATE_ON);
            assert.equal(token.nameState, token.STATE_ON, "Obfuscation should have turned on");
            assert.equal(foundryToken.name, placeholderWithAffixes, "unexpected name:" + foundryToken.name);
            await token.setState(token.STATE_OFF);
            assert.equal(token.nameState, token.STATE_OFF, "Obfuscation should have turned off");
            assert.equal(foundryToken.name, nameWithAffixes, "unexpected name:" + foundryToken.name);

            // change affixes setting
            await game.settings.set("token-name-obfuscation", "allowPreserveAffixes", !affixesDefault);
            let affixesSetting = Settings.allowPreserveAffixes;
            assert.equal(!affixesDefault, affixesSetting, "Failed to set allowPreserveAffixes to new value. Current value:" + affixesSetting);
            
            // directly change obfuscation state
            await token.setState(token.STATE_ON);
            assert.equal(token.nameState, token.STATE_ON, "Obfuscation should have turned on");
            assert.equal(foundryToken.name, placeholderSetting, "unexpected name:" + foundryToken.name);
            await token.setState(token.STATE_OFF);
            assert.equal(token.nameState, token.STATE_OFF, "Obfuscation should have turned off");
            assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);

            // revert affixes setting
            await game.settings.set("token-name-obfuscation", "allowPreserveAffixes", affixesDefault);
            affixesSetting = Settings.allowPreserveAffixes;
            assert.equal(affixesDefault, affixesSetting, "Failed to set allowPreserveAffixes to default. Current value:" + affixesSetting);
        });
        it('Keep duplicates in sync setting', async () => {
            const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
            const foundryTokens = await initiateWithGroup(NPC_NAME, assert);
            let duplicatesDefault = game.settings.settings.get("token-name-obfuscation.keepDuplicatesInSync").default;

            // turn duplicates setting on
            await game.settings.set("token-name-obfuscation", "keepDuplicatesInSync", !duplicatesDefault);
            let duplicatesSetting = Settings.keepDuplicatesInSync;
            assert.equal(!duplicatesDefault, duplicatesSetting, "Failed to set keepDuplicatesInSync to new value. Current value:" + duplicatesSetting);

            // toggle state for one token with HUD button
            await foundryToken.object.release();
            await foundryToken.object.control();
            await foundryToken.object._onClickRight(new Event({}));
            await waitForHUD();
            let buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0];
            assert.ok(buttonOn, "Expected to find HUD button");
            await buttonOn.click();
            await delay(200);
            assert.equal(token.nameState, token.STATE_ON, "Token name obfuscation is off");
            // check all tokens for new state
            let placeholderSetting = Settings.placeholderName;
            for (let token of foundryTokens) {
                if (foundryToken._id === token._id) {
                    continue;
                }
                assert.equal(token.name, placeholderSetting, "Unexpected token name:" + token.name);
            }

            // revert state for one token with macro instead of button
            let tnoMacro = await game.packs.get("token-name-obfuscation.tno-macros").getDocument(MACRO_ID);
            await foundryToken.object.release();
            await foundryToken.object.control();
            await tnoMacro.execute();
            assert.equal(token.nameState, token.STATE_OFF, "Token name obfuscation is on");
            for (let token of foundryTokens) {
                if (foundryToken._id === token._id) {
                    continue;
                }
                assert.equal(token.name, token.actor.name, "Unexpected token name:" + token.name);
            }

            // revert setting
            await game.settings.set("token-name-obfuscation", "keepDuplicatesInSync", duplicatesDefault);
            duplicatesSetting = Settings.keepDuplicatesInSync;
            assert.equal(duplicatesDefault, duplicatesSetting, "Failed to set keepDuplicatesInSync to new value. Current value:" + duplicatesSetting);

            // toggle state for one token with HUD button
            await foundryToken.object.release();
            await foundryToken.object.control();
            await foundryToken.object._onClickRight(new Event({}));
            await waitForHUD();
            buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0];
            assert.ok(buttonOn, "Expected to find HUD button");
            await buttonOn.click();
            await delay(200);
            assert.equal(token.nameState, token.STATE_ON, "Token name obfuscation is off");
            // check other tokens for old state
            for (let token of foundryTokens) {
                if (foundryToken._id === token._id) {
                    continue;
                }
                assert.equal(token.name, token.actor.name, "Unexpected token name:" + token.name);
            }
            // revert token
            await token.setState(token.STATE_OFF);
        });
    });
};

async function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function waitForHUD() {
    let n = 0;
    while (!canvas.tokens.hud._element) {
        n++;
        await delay(2 ** n);
    }
}
