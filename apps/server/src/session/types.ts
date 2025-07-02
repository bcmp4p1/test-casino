export enum Fruit {
  Cherry = 'C',
  Lemon = 'L',
  Orange = 'O',
  Watermelon = 'W',
}

export const FRUIT_REWARDS: Record<Fruit, number> = {
  [Fruit.Cherry]: 10,
  [Fruit.Lemon]: 20,
  [Fruit.Orange]: 30,
  [Fruit.Watermelon]: 40,
};

export type SlotResult = [Fruit, Fruit, Fruit];