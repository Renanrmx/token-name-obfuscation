export default class TokenHUD {
    //Add a name obfuscation button to the Token HUD - called from renderTokenHUD hook
    static async addButton(
        token,
        hudHtml,
        toggleName,
    ) {
        let button = document.createElement("div");
        button.classList.add("control-icon", "token-name-obfuscation");
        button.innerHTML = `<i class="fa-solid fa-mask"></i>`;
        button.title = game.i18n.localize("tno.tooltip");

        let state = token.nameState;
        if (state === token.STATE_ON) {
            button.classList.add("active");
        }

        $(button).click(async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await toggleName(token);
            this.syncButtonState(button, token);
        })
        hudHtml.find(".col.right").prepend(button);
    }

    static syncButtonState(button, token) {
        let state = token.nameState;
        if (state === token.STATE_ON) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    }

}
