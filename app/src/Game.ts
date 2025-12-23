import settings from './settings.ts';
import PixiFacade from './PixiFacade.ts';
import Race from './Race.ts';
import StatsOverlay from './StatsOverlay.ts';
import playerCommand from './playerCommand.ts';
import Menu from './Menu.ts';
import urlHelper from './utils/urlHelper.ts';

class Game {
  currentRace: Race | null;
  menu: Menu | null;
  pixiFacade: PixiFacade;
  gameEvents: {
    frameStep: () => void;
    menuLoaded: () => void;
    startRace: (trackId?: number) => void;
  };

  constructor() {
    const config = urlHelper.loadQueryConfig();
    if (config.debug !== undefined) {
      settings.technical.debugDraw = (config.debug === 'true' || config.debug === true);
    }

    this.currentRace = null;
    this.menu = null;
    this.pixiFacade = new PixiFacade();

    this.gameEvents = {
      frameStep: () => {
        if (this.currentRace) {
          this.currentRace.update();
        }
        if (settings.technical.pixiActivated) {
          this.pixiFacade.step();
        }
        window.requestAnimationFrame(this.gameEvents.frameStep);
      },
      menuLoaded: () => {
        console.log('Pixi page loaded');
        window.requestAnimationFrame(this.gameEvents.frameStep);
      },
      startRace: (trackId?: number) => {
        console.log('Race creation !');
        const config = urlHelper.loadQueryConfig();
        console.log('URL config:', config);
        const selectedTrackId = (trackId !== undefined) ? trackId : config.track;
        console.log('Selected track:', selectedTrackId);
        this.currentRace = new Race({ trackId: selectedTrackId, pixiFacade: this.pixiFacade });
        this.menu!.setCurrentRace(this.currentRace);
        this.menu!.showMenuButton();
        window.requestAnimationFrame(this.gameEvents.frameStep);
      }
    };

    this.init();
  }

  async init(): Promise<void> {
    await this.pixiFacade.init();

    this.pixiFacade.loadAtlas((loader, resources) => {
      console.log("Atlas loaded ", resources);
      this.menu = new Menu({
        pixiStage: this.pixiFacade.container,
        onMenuLoaded: this.gameEvents.menuLoaded,
        onStartRace: this.gameEvents.startRace
      });
    });

    document.onkeydown = (event) => {
      playerCommand.handleKeyDown(event);
    };
    document.onkeyup = (event) => {
      playerCommand.handleKeyUp(event);
    };

    if (settings.technical.statsOverlay) {
      new StatsOverlay();
    }
  }
}

const game = new Game();
