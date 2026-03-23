import mapJson from "assets/map/casino_island.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "features/world/scenes/BaseScene";
import { interactableModalManager } from "features/world/ui/InteractableModals";
import { translate } from "lib/i18n/translate";

export class CasinoIslandScene extends BaseScene {
  sceneId: SceneId = "casino-island";

  constructor() {
    super({
      name: "casino-island",
      map: { json: mapJson },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  preload() {
    super.preload();
    
    // Load tilemap JSON
    this.load.tilemapTiledJSON("casino_island", mapJson);
    
    // Load tilesheet image as "tileset" key for the map
    this.load.image("tileset", "world/tilesheet.png");
    
    this.load.image("stairs", "world/stairs_down.png");
    
    this.load.spritesheet("dealer", "world/dealer-npc.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Ambience SFX
    if (!this.sound.get("nature_1")) {
      const nature1 = this.sound.add("nature_1");
      nature1.play({ loop: true, volume: 0.01 });
    }

    // Shut down the sound when the scene changes
    this.events.once("shutdown", () => {
      this.sound.getAllPlaying().forEach((sound) => {
        sound.destroy();
      });
    });
  }

  async create() {
    this.map = this.make.tilemap({ key: "casino_island" });

    super.create();

    const _stairs = this.add.image(440, 47, "stairs");

    // Left side dealers (facing right, so flip them)
    const dealer1 = this.add.sprite(120, 310, "dealer").setScale(1).setFlipX(true);
    const dealer3 = this.add.sprite(120, 230, "dealer").setScale(1).setFlipX(true);
    const dealer5 = this.add.sprite(120, 150, "dealer").setScale(1).setFlipX(true);
    const dealer7 = this.add.sprite(120, 70, "dealer").setScale(1).setFlipX(true);

    // Right side dealers (facing left, normal)
    const dealer2 = this.add.sprite(360, 310, "dealer").setScale(1);
    const dealer4 = this.add.sprite(360, 230, "dealer").setScale(1);
    const dealer6 = this.add.sprite(360, 150, "dealer").setScale(1);

    // Slot machines near stairs (placeholder) - parallel to stairs, centered on map
    const slot1 = this.add.sprite(200, 47, "dealer").setScale(1);
    const slot2 = this.add.sprite(240, 47, "dealer").setScale(1);
    const slot3 = this.add.sprite(280, 47, "dealer").setScale(1);

    this.anims.create({
      key: "dealer_anim",
      frames: this.anims.generateFrameNumbers("dealer", { start: 0, end: 8 }),
      repeat: -1,
      frameRate: 10,
    });

    // Play animation on all sprites
    const allSprites = [dealer1, dealer2, dealer3, dealer4, dealer5, dealer6, dealer7, slot1, slot2, slot3];
    allSprites.forEach((sprite) => {
      sprite.play("dealer_anim", true);
    });

    // Table labels using text
    this.add.text(120, 325, "Roulette", {
      font: "bold 12px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(120, 245, "Blackjack", {
      font: "bold 11px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(120, 165, "Poker", {
      font: "bold 12px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(120, 86, "Game Desk", {
      font: "bold 9px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(360, 325, "Roulette", {
      font: "bold 12px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(360, 245, "Blackjack", {
      font: "bold 11px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(360, 165, "Poker", {
      font: "bold 12px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    this.add.text(240, 60, "Slots", {
      font: "bold 12px Arial",
      color: "#000000",
    }).setOrigin(0.5);

    // Make all dealers clickable
    [dealer1, dealer2, dealer3, dealer4, dealer5, dealer6, dealer7].forEach((dealer, index) => {
      dealer.setInteractive({ cursor: "pointer" }).on("pointerdown", () => {
        if (this.checkDistanceToSprite(dealer, 50)) {
          // Bottom row (index 0, 1): Roulette
          if (index === 0 || index === 1) {
            interactableModalManager.open("casino_island_roulette");
          }
          // Middle row (index 2, 3): Blackjack
          else if (index === 2 || index === 3) {
            interactableModalManager.open("casino_island_blackjack");
          }
          // Top row (index 4, 5): Poker
          else if (index === 4 || index === 5) {
            interactableModalManager.open("casino_island_poker");
          }
        } else {
          this.currentPlayer?.speak(translate("base.iam.far.away"));
        }
      });
    });

    // Make slot machines clickable
    [slot1, slot2, slot3].forEach((slot) => {
      this.physics.world.enable(slot);
      slot.setInteractive({ cursor: "pointer" }).on("pointerdown", () => {
        if (this.checkDistanceToSprite(slot, 50)) {
          interactableModalManager.open("casino_island_slots");
        } else {
          this.currentPlayer?.speak(translate("base.iam.far.away"));
        }
      });
    });

    // Handle clickable chests from the Tiled map
    const objectLayer = this.map.getObjectLayer("Collision");
    
    if (objectLayer) {
      objectLayer.objects.forEach((obj: any) => {
        // Check if this object is a chest (by name or custom property)
        if (obj.name && obj.name.toLowerCase().includes("chest")) {
          // Create a rectangle at the chest location
          const chest = this.add.rectangle(
            obj.x + obj.width / 2,
            obj.y + obj.height / 2,
            obj.width,
            obj.height,
            0x00ff00,
            0
          );

          chest.setInteractive({ cursor: "pointer" }).on("pointerdown", () => {
            if (this.checkDistanceToSprite(chest, 50)) {
              interactableModalManager.open("casino_island_daily_chest");
            } else {
              this.currentPlayer?.speak(translate("base.iam.far.away"));
            }
          });
        }
      });
    }
  }
}
