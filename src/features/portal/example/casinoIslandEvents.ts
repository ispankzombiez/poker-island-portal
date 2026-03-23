/**
 * Event emitter for Casino Island chest interactions
 * Used to communicate between CasinoIslandScene and CasinoIsland component
 */
export const casinoIslandEvents = {
  onChestClicked: null as (() => void) | null,
  
  registerChestClickHandler(callback: (() => void) | null) {
    this.onChestClicked = callback;
  },
  
  emitChestClicked() {
    if (this.onChestClicked) {
      this.onChestClicked();
    }
  }
};
