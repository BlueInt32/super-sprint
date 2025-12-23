type KeyState = {
  accelerate: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
};

class PlayerCommand {
  pressedKeys: Set<string>;
  keys: KeyState;
  handledKeys: string[];

  constructor() {
    this.pressedKeys = new Set();
    this.keys = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false
    };
    this.handledKeys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', ' '];
  }

  handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;

    if (this.handledKeys.includes(key)) {
      event.preventDefault();
    }

    if (this.pressedKeys.has(key)) {
      return;
    }

    let knowkey = true;
    switch (key) {
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'ArrowUp':
        this.keys.accelerate = true;
        break;
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ArrowDown':
        this.keys.brake = true;
        break;
      case ' ':
        this.keys.handbrake = true;
        break;
      default:
        knowkey = false;
    }

    if (knowkey) {
      this.pressedKeys.add(key);
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    const key = event.key;
    this.pressedKeys.delete(key);

    switch (key) {
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'ArrowUp':
        this.keys.accelerate = false;
        break;
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ArrowDown':
        this.keys.brake = false;
        break;
      case ' ':
        this.keys.handbrake = false;
        break;
    }
  }
}

export default new PlayerCommand();
export type { KeyState };
