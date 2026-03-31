import { NPC_WEARABLES, NPCName } from "lib/npcs";
import { getAnimationUrl } from "features/world/lib/animations";

export class PortalNPC extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite | undefined;
  private isReady = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    npcName: NPCName,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    // Set initial size so the container can be made interactive
    // This will be updated when the sprite loads
    this.setSize(96, 64);

    this.loadNPC(npcName);
  }

  private async loadNPC(npcName: NPCName) {
    try {
      // Get the NPC's wearables
      const wearables = NPC_WEARABLES[npcName];
      if (!wearables) {
        console.error(`No wearables found for NPC: ${npcName}`);
        return;
      }

      // Use getAnimationUrl to build the spritesheet URL with all idle animation frames
      const animationUrl = getAnimationUrl(wearables, ["idle"]);
      const textureKey = `npc_${npcName}_spritesheet`;

      // Only load if not already loaded
      if (this.scene.textures.exists(textureKey)) {
        this.createSprite(textureKey, npcName);
        return;
      }

      // Load the spritesheet
      const loader = this.scene.load.spritesheet(textureKey, animationUrl, {
        frameWidth: 96,
        frameHeight: 64,
      });

      // Handle the file completion event
      loader.once(`filecomplete-spritesheet-${textureKey}`, () => {
        this.createSprite(textureKey, npcName);
      });

      // Start loading if not already started
      if (!this.scene.load.isLoading()) {
        this.scene.load.start();
      }
    } catch (error) {
      console.error(`Failed to load NPC ${npcName}:`, error);
    }
  }

  private createSprite(textureKey: string, npcName: NPCName) {
    if (this.isReady) return;

    try {
      // Create the sprite at origin 0.5, 0.5 (centered)
      this.sprite = this.scene.add
        .sprite(0, 0, textureKey)
        .setOrigin(0.5, 0.5);
      this.add(this.sprite);

      // Create idle animation - frames 0-8 based on BumpkinContainer pattern
      const animationKey = `${npcName}_idle`;
      if (!this.scene.anims.exists(animationKey)) {
        this.scene.anims.create({
          key: animationKey,
          frames: this.scene.anims.generateFrameNumbers(textureKey, {
            start: 0,
            end: 8,
          }),
          repeat: -1,
          frameRate: 5,
        });
      }

      // Play the animation
      this.sprite.play(animationKey, true);
      this.isReady = true;
    } catch (error) {
      console.error(`Failed to create sprite for NPC:`, error);
    }
  }

  isLoaded(): boolean {
    return this.isReady;
  }
}
