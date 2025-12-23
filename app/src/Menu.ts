import * as PIXI from 'pixi.js';
import settings from './settings.ts';
import Race from './Race.ts';

type MenuSpecs = {
  pixiStage: PIXI.Container;
  onMenuLoaded: () => void;
  onStartRace: (trackId: number) => void;
};

class Menu {
  pixiStage: PIXI.Container;
  specs: MenuSpecs;
  currentRace: Race | null;
  menuContainer: HTMLElement | null;
  track0Button: HTMLElement | null;
  track1Button: HTMLElement | null;
  controlsElement: HTMLElement | null;
  debugToggleButton: HTMLElement | null;
  menuButton: HTMLElement | null;

  constructor(specs: MenuSpecs) {
    this.pixiStage = specs.pixiStage;
    this.specs = specs;
    this.currentRace = null;

    this.menuContainer = document.getElementById('menuContainer');
    this.track0Button = document.getElementById('track0Button');
    this.track1Button = document.getElementById('track1Button');
    this.controlsElement = document.getElementById('controls');
    this.debugToggleButton = document.getElementById('debugToggleButton');
    this.menuButton = null;

    if (this.track0Button) {
      this.track0Button.onclick = () => {
        this.hideTrackButtons();
        this.showMenuButton();
        this.showDebugToggleButton();
        this.showControls();
        specs.onStartRace(0);
      };
    }

    if (this.track1Button) {
      this.track1Button.onclick = () => {
        this.hideTrackButtons();
        this.showMenuButton();
        this.showDebugToggleButton();
        this.showControls();
        specs.onStartRace(1);
      };
    }

    this.createMenuButton();
    this.createDebugToggleButton();

    specs.onMenuLoaded();
  }

  hideTrackButtons(): void {
    if (this.menuContainer) {
      this.menuContainer.style.display = 'none';
    }
  }

  showTrackButtons(): void {
    if (this.menuContainer) {
      this.menuContainer.style.display = 'flex';
    }
  }

  createMenuButton(): void {
    this.menuButton = document.getElementById('menuButton');
    if (this.menuButton) {
      this.menuButton.onclick = () => {
        window.location.reload();
      };
    }
  }

  showMenuButton(): void {
    if (this.menuButton) {
      this.menuButton.style.display = 'block';
    }
  }

  hideMenuButton(): void {
    if (this.menuButton) {
      this.menuButton.style.display = 'none';
    }
  }

  showControls(): void {
    if (this.controlsElement) {
      this.controlsElement.style.display = 'flex';
    }
  }

  hideControls(): void {
    if (this.controlsElement) {
      this.controlsElement.style.display = 'none';
    }
  }

  createDebugToggleButton(): void {
    if (this.debugToggleButton) {
      this.debugToggleButton.onclick = () => {
        settings.technical.debugDraw = !settings.technical.debugDraw;
        this.debugToggleButton!.textContent = settings.technical.debugDraw ? 'SPRITES' : 'DEBUG';

        if (this.currentRace) {
          if (this.currentRace.b2WorldFacade) {
            this.currentRace.b2WorldFacade.toggleDebugDraw();
          }
          if (this.currentRace.pixiFacade) {
            this.currentRace.pixiFacade.setVisible(!settings.technical.debugDraw);
          }
        }
      };
    }
  }

  showDebugToggleButton(): void {
    if (this.debugToggleButton) {
      this.debugToggleButton.style.display = 'block';
      this.updateDebugButtonText();
    }
  }

  updateDebugButtonText(): void {
    if (this.debugToggleButton) {
      this.debugToggleButton.textContent = settings.technical.debugDraw ? 'SPRITES' : 'DEBUG';
    }
  }

  setCurrentRace(race: Race): void {
    this.currentRace = race;
  }
}

export default Menu;
export type { MenuSpecs };
