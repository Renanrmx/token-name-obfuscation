import ObfuscatorToken from '../scripts/token.js';

const NPC_NAME = "npc"
const PC_NAME = "pc"
const PLACEHOLDER_NAME = "???"
const MACRO_ID = "Un8uPUTK9Z5tieXv"

let initiateWith = async function(name, assert) {
    let foundryToken = game.scenes.active.tokens.getName(name);
    assert.ok(foundryToken, "Token for "+ name + " not found in scene");
    let token = new ObfuscatorToken(foundryToken);
    return {token, foundryToken}
}

let initiateWithGroup = async function(name, assert) {
    let foundryTokens = []
    for (let tokenData of game.scenes.active.tokens.contents) {
        if (tokenData.actor.name === name) {
            foundryTokens.push(tokenData)
        };
    };
    assert.ok(foundryTokens.length > 0, "Tokens for "+ name + " not found in scene");
    return foundryTokens
}

export let tnoTokenTests = (context) => {
    const {describe, it, assert, afterEach} = context;
    describe('TNO Token Tests', () => {
        describe('Single Token Tests', () => {
            it('Verify expected token setup', async () => {
                const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
                assert.equal(token.nameState, token.STATE_OFF, "Unexpected starting state ON");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
            });
            it('Set token states', async () => {
                const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
                await token.setState(token.STATE_OFF)
                assert.equal(token.nameState, token.STATE_OFF, "Failed to set state to off");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
                await token.setState(token.STATE_ON)
                assert.equal(token.nameState, token.STATE_ON, "Token name obfuscation is off");
                assert.equal(foundryToken.name, PLACEHOLDER_NAME, "unexpected name:" + foundryToken.name);
                await token.setState(token.STATE_OFF)
                assert.equal(token.nameState, token.STATE_OFF, "Token name obfuscation is on");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
            });
            it('Toggle token states directly', async () => {
                const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
                await token.setState(token.STATE_OFF)
                assert.equal(token.nameState, token.STATE_OFF, "Failed to set state to off");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
                await token.advanceState();
                assert.equal(token.nameState, token.STATE_ON, "Token name obfuscation is off");
                assert.equal(foundryToken.name, PLACEHOLDER_NAME, "unexpected name:" + foundryToken.name);
                await token.advanceState();
                assert.equal(token.nameState, token.STATE_OFF, "Token name obfuscation is on");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
            });
            it('Toggle token states with macro', async () => {
                const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
                await token.setState(token.STATE_OFF)
                assert.equal(token.nameState, token.STATE_OFF, "Failed to set state to off");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);

                // toggle state for one token with macro
                let tnoMacro = await game.packs.get("token-name-obfuscation.tno-macros").getDocument(MACRO_ID);
                await foundryToken.object.release();
                await foundryToken.object.control();
                await tnoMacro.execute();
                assert.equal(token.nameState, token.STATE_ON, "Token name obfuscation is off");
                assert.equal(foundryToken.name, PLACEHOLDER_NAME, "unexpected name:" + foundryToken.name);

                // activate macro again
                await tnoMacro.execute();
                assert.equal(token.nameState, token.STATE_OFF, "Token name obfuscation is on");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
            });
            it('Toggle token states with button', async () => {
                const {token, foundryToken} = await initiateWith(NPC_NAME, assert);
                await token.setState(token.STATE_OFF)
                assert.equal(token.nameState, token.STATE_OFF, "Failed to set state to off");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);

                // toggle state for one token with HUD button
                await foundryToken.object.release();
                await foundryToken.object.control();
                await foundryToken.object._onClickRight(new Event({}))
                await waitForHUD()
                let buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0]
                assert.ok(buttonOn, "Expected to find HUD button");
                await buttonOn.click()
                await delay(200)
                assert.equal(token.nameState, token.STATE_ON, "Token name obfuscation is off");
                assert.equal(foundryToken.name, PLACEHOLDER_NAME, "unexpected name:" + foundryToken.name);

                // toggle state for one token with HUD button
                await foundryToken.object.release();
                await foundryToken.object.control();
                await foundryToken.object._onClickRight(new Event({}))
                await waitForHUD()
                buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0]
                assert.ok(buttonOn, "Expected to find HUD button");
                await buttonOn.click()
                await delay(200)
                assert.equal(token.nameState, token.STATE_OFF, "Token name obfuscation is on");
                assert.equal(foundryToken.name, NPC_NAME, "unexpected name:" + foundryToken.name);
            });
        });
        describe('Multi Token Tests', () => {
            it('Toggle same-state tokens with macro', async () => {
                let foundryTokens = await initiateWithGroup(NPC_NAME, assert)

                let tnoMacro = await game.packs.get("token-name-obfuscation.tno-macros").getDocument(MACRO_ID);
                // activate macro
                for (let token of foundryTokens) {
                    await token.object.release();
                    await token.object.control({releaseOthers: false});
                }
                await tnoMacro.execute();
                for (let token of foundryTokens) {
                    assert.equal(token.name, PLACEHOLDER_NAME, "unexpected name:" + token.name);
                }

                // activate macro again
                await tnoMacro.execute();
                for (let token of foundryTokens) {
                    assert.equal(token.name, NPC_NAME, "unexpected name:" + token.name);
                }
            });
            it('Toggle same-state tokens with button', async () => {
                let foundryTokens = await initiateWithGroup(NPC_NAME, assert)

                // activate HUD button
                for (let token of foundryTokens) {
                    await token.object.release();
                    await token.object.control({releaseOthers: false});
                }
                await foundryTokens[0].object._onClickRight(new Event({}))
                await waitForHUD()
                let buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0]
                assert.ok(buttonOn, "Expected to find HUD button");
                await buttonOn.click()
                await delay(200)
                for (let token of foundryTokens) {
                    assert.equal(token.name, PLACEHOLDER_NAME, "unexpected name:" + token.name);
                }

                // activate HUD button again
                for (let token of foundryTokens) {
                    await token.object.release();
                    await token.object.control({releaseOthers: false});
                }
                await foundryTokens[0].object._onClickRight(new Event({}))
                await waitForHUD()
                buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0]
                assert.ok(buttonOn, "Expected to find HUD button");
                await buttonOn.click()
                await delay(200)
                for (let token of foundryTokens) {
                    assert.equal(token.name, NPC_NAME, "unexpected name:" + token.name);
                }
            });
            it('Toggle mixed-state tokens with macro', async () => {
                const foundryTokens = await initiateWithGroup(NPC_NAME, assert)

                let tnoMacro = await game.packs.get("token-name-obfuscation.tno-macros").getDocument(MACRO_ID);

                //select one token and toggle
                await foundryTokens[0].object.release();
                await foundryTokens[0].object.control()
                await tnoMacro.execute();
                assert.equal(foundryTokens[0].name, PLACEHOLDER_NAME, "unexpected name:" + foundryTokens[0].name);

                // activate macro
                for (let token of foundryTokens) {
                    await token.object.release();
                    await token.object.control({releaseOthers: false});
                }
                await tnoMacro.execute();
                for (let token of foundryTokens) {
                    assert.equal(token.name, NPC_NAME, "unexpected name:" + token.name);
                }
            });
            it('Toggle mixed-state tokens with button', async () => {
                let foundryTokens = await initiateWithGroup(NPC_NAME, assert)

                //select one token and toggle
                await foundryTokens[0].object.release()
                await foundryTokens[0].object.control()
                await foundryTokens[0].object._onClickRight(new Event({}))
                await waitForHUD()
                let buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0]
                assert.ok(buttonOn, "Expected to find HUD button");
                await buttonOn.click()
                await delay(200)
                assert.equal(foundryTokens[0].name, PLACEHOLDER_NAME, "unexpected name:" + foundryTokens[0].name);

                // activate HUD button again
                for (let token of foundryTokens) {
                    await token.object.release();
                    await token.object.control({releaseOthers: false});
                }
                await foundryTokens[0].object._onClickRight(new Event({}))
                await waitForHUD()
                buttonOn = canvas.tokens.hud._element[0].getElementsByClassName("token-name-obfuscation")[0]
                assert.ok(buttonOn, "Expected to find HUD button");
                await buttonOn.click()
                await delay(200)
                for (let token of foundryTokens) {
                    assert.equal(token.name, NPC_NAME, "unexpected name:" + token.name);
                }
            });
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
