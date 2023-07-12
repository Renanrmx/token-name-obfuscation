const BUTTON_HTML = `<div class="control-icon token-name-obfuscation"><i class="fa-solid fa-mask"></i></div>`;

export default class TokenHUD {
    //Add a name obfuscation button to the Token HUD - called from renderTokenHUD hook
    static async addButton(
        token,
        hudHtml,
        toggleName,
    ) {
        let state = token.nameState;
        let tbutton = $(BUTTON_HTML);
        if (state === token.STATE_ON) {
            tbutton.addClass("active");
        }
        hudHtml.find(".col.right").prepend(tbutton);
        tbutton.find("i").click(async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await toggleName(token);
            TokenHUD.syncButtonState(tbutton, token);
        });
    }

    static syncButtonState(tbutton, token) {
        let state = token.nameState;
        if (state === token.STATE_ON) {
            tbutton.addClass("active");
        } else {
            tbutton.removeClass("active");
        }
    }

}
