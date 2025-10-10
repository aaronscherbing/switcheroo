# Switcheroo

A strategic two-player card game built with PixiJS.

## How to Play

### Setup
- 3x4 grid in the center with random cards
- Each player has a 3x2 play area (6 spaces)
- Each player starts with 3 hearts

### Gameplay
1. **Taking Turns**: Players alternate turns
2. **Moves**: Each turn you get 2 tile moves
3. **Moving Tiles**: Click a tile in the grid, then click another tile to swap them
4. **Moving to Your Space**: Move tiles from the grid row closest to you into your play area
5. **Column Shift**: When you take a tile, other tiles in that column fall toward your space and a new tile spawns

### Card Types

- **Purple Outline (Attack)**: Spend to remove hearts from opponent
  - Symbol: -1, -2, etc.
  - Cannot be used in first 2 turns

- **Red Outline (Instant)**: Automatically spent when moved to your space
  - Symbol: i-1
  - Instant damage to opponent

- **Blue Outline (Shield)**: Spend anytime to gain hearts
  - Symbol: +1♥
  - Can store for later use

- **Orange Outline (Special)**: Special actions
  - Symbol: +M (extra move)
  - Click to activate

- **Black X (Barrier)**: Cannot be moved!
  - Symbol: ⊗
  - Clogs up space if it gets to your area

- **Orange-Purple (Boost)**: Attack booster
  - Symbol: +1
  - Use with attack cards for extra damage

### Winning
- Reduce opponent's hearts to 0
- Last player with hearts wins!

## Running the Game

Simply open `index.html` in a web browser. No build process required!

## Controls
- **Click tiles** in the grid to select and swap them
- **Click cards** in your play area to spend them
- **End Turn** button to pass to the next player

