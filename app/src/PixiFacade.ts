import * as PIXI from "pixi.js";
import settings from "./settings.ts";

type SpriteCreationSpecs = {
  frameId: string;
  anchor?: number;
};

class PixiFacade {
  app: PIXI.Application;
  container: PIXI.Container;

  constructor() {
    this.app = new PIXI.Application();
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
  }

  async init(): Promise<void> {
    await this.app.init({
      width: settings.consts.STAGE_WIDTH_PIXEL,
      height: settings.consts.STAGE_HEIGHT_PIXEL,
      backgroundColor: 0x333333,
    });

    const gameContainer = document.getElementById("gameContainer");
    if (gameContainer) {
      gameContainer.appendChild(this.app.canvas);
      console.log("Pixi stage created");
    } else {
      console.error("gameContainer element not found");
    }

    this.app.stage.addChild(this.container);
  }

  async loadAtlas(callBack: (loader: null, resources: { atlas: PIXI.Spritesheet }) => void): Promise<void> {
    const spritesheet = await PIXI.Assets.load(settings.atlas);
    callBack(null, { atlas: spritesheet });
  }

  createThenAddSprite(spriteCreationSpecs: SpriteCreationSpecs): PIXI.Sprite {
    const texture = PIXI.Texture.from(spriteCreationSpecs.frameId);
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(
      typeof spriteCreationSpecs.anchor !== "undefined"
        ? spriteCreationSpecs.anchor
        : 0.5
    );
    this.container.addChild(sprite);
    return sprite;
  }

  step(): void {
    this.app.renderer.render(this.app.stage);
  }

  setVisible(visible: boolean): void {
    this.app.canvas.style.display = visible ? "block" : "none";
  }
}

export default PixiFacade;
export type { SpriteCreationSpecs };
