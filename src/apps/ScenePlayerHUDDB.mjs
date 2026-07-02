const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class ScenePlayerHUDDB extends HandlebarsApplicationMixin(ApplicationV2) {

	static DEFAULT_OPTIONS = {
		id: "binos-scene-player-hud-db",
		tag: "div",
		position: { width: "auto", height: "auto" },
		window: { frame: false, positioned: false },
	};

	static PARTS = {
		main: {
			template: "modules/binos-dragonbane-tools/templates/apps/scene-player-hud.hbs",
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.players = this.#getPlayerTokenData();
		return context;
	}

	#getPlayerTokenData() {
		const tokens = canvas.tokens?.placeables.filter(
			t => t.actor?.type === "character"
		) ?? [];

		return tokens.map(token => {
			const actor = token.actor;

			const hpValue   = actor.system.hitPoints?.value ?? 0;
			const hpMax     = actor.system.hitPoints?.max   ?? 1;
			const hpRaw     = (hpValue / hpMax) * 100;
			const hpPercent = Math.max(0, Math.min(99, hpRaw));

			let hpStatus = "healthy";
			if (hpPercent <= 25)      hpStatus = "critical";
			else if (hpPercent <= 50) hpStatus = "injured";
			else if (hpPercent <= 75) hpStatus = "hurt";

			const wpValue   = actor.system.willPoints?.value ?? 0;
			const wpMax     = actor.system.willPoints?.max   ?? 1;
			const wpRaw     = (wpValue / wpMax) * 100;
			const wpPercent = Math.max(0, Math.min(99, wpRaw));

			let wpStatus = "full";
			if (wpPercent <= 25)      wpStatus = "critical";
			else if (wpPercent <= 50) wpStatus = "low";
			else if (wpPercent <= 75) wpStatus = "medium";

			const armor = actor.getArmorValue?.() ?? 0;

			const conds = actor.system.conditions ?? {};
			const conditions = ["str", "con", "agl", "int", "wil", "cha"].map(key => {
				const fullName = game.i18n.localize(`DoD.conditions.${key}`);
				return {
					key,
					label:      fullName,
					shortLabel: fullName.slice(0, 3),
					active:     !!conds[key]?.value,
				};
			});

			return {
				tokenId:    token.id,
				uuid:       actor.uuid,
				img:        token.document.texture?.src ?? actor.img,
				name:       actor.name,
				armor,
				hpValue,
				hpMax,
				hpPercent,
				hpStatus,
				wpValue,
				wpMax,
				wpPercent,
				wpStatus,
				conditions,
			};
		});
	}

	_insertElement(element) {
		const existing = document.getElementById(element.id);
		const anchor   = document.querySelector("#scene-controls");

		if (!anchor) return;

		if (existing) {
			if (existing.parentElement !== anchor.parentElement) {
				existing.remove();
				anchor.insertAdjacentElement("afterend", element);
			} else {
				existing.replaceWith(element);
			}
		} else {
			anchor.insertAdjacentElement("afterend", element);
		}
	}

	_onRender(context, options) {
		if (game.user.isGM) {
			for (const portrait of this.element.querySelectorAll(".db-hud-portrait")) {
				portrait.style.cursor = "pointer";
				portrait.addEventListener("click", async () => {
					const uuid = portrait.closest(".db-hud-character").dataset.uuid;
					const actor = await fromUuid(uuid);
					actor?.sheet?.render(true);
				});
			}
		}

		for (const input of this.element.querySelectorAll(".scene-hud-stat-input")) {
			input.addEventListener("focus", function () { this.value = ""; });

			input.addEventListener("blur", function () { this.value = this.dataset.value; });

			input.addEventListener("keyup", async function (e) {
				if (e.key !== "Enter") return;
				e.preventDefault();
				e.stopPropagation();

				const actor = await fromUuid(this.dataset.uuid);
				if (!actor) return;

				const field      = this.dataset.field;
				const systemPath = field === "hp" ? "system.hitPoints.value" : "system.willPoints.value";
				const current    = Number(this.dataset.value);
				const max        = field === "hp" ? actor.system.hitPoints.max : actor.system.willPoints.max;
				const inputValue = this.value.trim();

				let newValue;
				if (inputValue.startsWith("+")) {
					newValue = current + parseInt(inputValue.slice(1), 10);
				} else if (inputValue.startsWith("-")) {
					newValue = current - parseInt(inputValue.slice(1), 10);
				} else {
					newValue = parseInt(inputValue, 10);
				}

				if (!isNaN(newValue)) {
					newValue = Math.max(0, Math.min(max, newValue));
					actor.update({ [systemPath]: newValue });
				}
				this.blur();
			});
		}
	}

	refreshCharacter(actor) {
		const el = this.element?.querySelector(`.db-hud-character[data-uuid="${actor.uuid}"]`);
		if (!el) return;

		const hpValue   = actor.system.hitPoints?.value ?? 0;
		const hpMax     = actor.system.hitPoints?.max   ?? 1;
		const hpPercent = Math.max(0, Math.min(99, (hpValue / hpMax) * 100));
		let hpStatus = "healthy";
		if (hpPercent <= 25)      hpStatus = "critical";
		else if (hpPercent <= 50) hpStatus = "injured";
		else if (hpPercent <= 75) hpStatus = "hurt";

		const hpBar = el.querySelector(".db-hud-bar.hp");
		hpBar.style.width = hpPercent + "%";
		hpBar.className   = `db-hud-bar hp ${hpStatus}`;

		const hpInput = el.querySelector(`.scene-hud-stat-input[data-field="hp"]`);
		hpInput.dataset.value = hpValue;
		if (document.activeElement !== hpInput) hpInput.value = hpValue;

		el.querySelector(`[data-field="hp-max"]`).value = hpMax;

		const wpValue   = actor.system.willPoints?.value ?? 0;
		const wpMax     = actor.system.willPoints?.max   ?? 1;
		const wpPercent = Math.max(0, Math.min(99, (wpValue / wpMax) * 100));
		let wpStatus = "full";
		if (wpPercent <= 25)      wpStatus = "critical";
		else if (wpPercent <= 50) wpStatus = "low";
		else if (wpPercent <= 75) wpStatus = "medium";

		const wpBar = el.querySelector(".db-hud-bar.wp");
		wpBar.style.width = wpPercent + "%";
		wpBar.className   = `db-hud-bar wp ${wpStatus}`;

		const wpInput = el.querySelector(`.scene-hud-stat-input[data-field="wp"]`);
		wpInput.dataset.value = wpValue;
		if (document.activeElement !== wpInput) wpInput.value = wpValue;

		el.querySelector(`[data-field="wp-max"]`).value = wpMax;

		const armor      = actor.getArmorValue?.() ?? 0;
		const armorEl    = el.querySelector(".db-hud-armor");
		const textNode   = [...armorEl.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
		if (textNode) textNode.textContent = ` ${armor}`;

		const conds = actor.system.conditions ?? {};
		for (const badge of el.querySelectorAll(".db-hud-condition")) {
			const active = !!conds[badge.dataset.condition]?.value;
			badge.classList.toggle("active", active);
		}
	}

	static open() {
		const existing = foundry.applications.instances.get("binos-scene-player-hud-db");
		if (existing) return existing;
		const app = new ScenePlayerHUDDB();
		app.render(true);
		return app;
	}
}
