# Bino's Dragonbane Tools

A [Foundry VTT](https://foundryvtt.com/) **v14** module for the
[Dragonbane](https://foundryvtt.com/packages/dragonbane) game system. It adds a compact
**player HUD** to the scene canvas that shows every player character's vitals at a glance —
hit points, willpower points, armor, and conditions 



## Requirements

- Foundry VTT **v14** or later.
- The **Dragonbane** game system.

## Installation

This module is distributed via **GitHub Releases** (it is not listed on the Foundry package
hub). In Foundry, go to **Add-on Modules → Install Module** and paste this Manifest URL:

```
https://github.com/MrTheBino/binos-dragonbane-tools/releases/latest/download/module.json
```

Alternatively, download `module.zip` from the
[latest release](https://github.com/MrTheBino/binos-dragonbane-tools/releases/latest) and extract it into your
Foundry `Data/modules/` directory.

## Usage

Enable the module in your world (**Game Settings → Manage Modules**). Once active, the HUD
appears automatically on the canvas next to the scene controls, populated from the player
character tokens on the active scene.

- Type a number in an HP/WP field and press <kbd>Enter</kbd> to set it directly.
- Type `+3` or `-5` and press <kbd>Enter</kbd> to apply damage or healing relative to the
  current value.
- (GM) Click a portrait to open the character sheet.

## License

Released under the [MIT License](LICENSE).

Dragonbane is a trademark of Fria Ligan AB. This module is an independent, fan-made tool and
is not affiliated with or endorsed by Fria Ligan.
