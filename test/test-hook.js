import { tnoTokenTests } from './token-tests.js';
import { tnoSettingsTests } from './settings-tests.js';
export function hookTests() {
    if (game.world.data.name.includes("test")) {
        console.log("TNO | Registering tests");
        quench.registerBatch("tno.token", tnoTokenTests,  { displayName: "TNO: Token Tests" });
        quench.registerBatch("tno.settings", tnoSettingsTests,  { displayName: "TNO: Settings Tests" });
    }
}
