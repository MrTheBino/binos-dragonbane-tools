import { ScenePlayerHUDDB } from "./src/apps/ScenePlayerHUDDB.mjs";

Hooks.once("init", () => {
	foundry.applications.handlebars.loadTemplates([
		"modules/binos-dragonbane-tools/templates/apps/scene-player-hud.hbs",
	]);
});

Hooks.once("ready", () => {
	const sceneHUD = ScenePlayerHUDDB.open();
	game.binosDragonbaneTools = { sceneHUD };
});

function refreshSceneHUD() {
	foundry.applications.instances.get("binos-scene-player-hud-db")?.render();
}

Hooks.on("canvasReady",  refreshSceneHUD);
Hooks.on("createToken",  refreshSceneHUD);
Hooks.on("deleteToken",  refreshSceneHUD);
Hooks.on("updateToken",  refreshSceneHUD);
Hooks.on("updateActor", (actor) => {
	if (actor.type !== "character") return;
	const hud = foundry.applications.instances.get("binos-scene-player-hud-db");
	hud?.refreshCharacter(actor);
});
