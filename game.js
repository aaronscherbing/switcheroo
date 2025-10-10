// Switcheroo Game using PixiJS

// Card types
const CardType = {
    ATTACK: 'attack',        // Purple outline
    INSTANT: 'instant',      // Red outline - instant heal
    SHIELD: 'shield',        // Blue outline
    SPECIAL: 'special',      // Orange outline
    BARRIER: 'barrier',      // Black X
    BOOST: 'boost',          // Pink (attack boost)
    NORMAL: 'normal'
};

// Game constants
const GRID_ROWS = 4;
const GRID_COLS = 3;
const PLAYER_ROWS = 2;
const PLAYER_COLS = 3;
const TILE_SIZE = 80;
const TILE_PADDING = 10;
const MAX_HEARTS = 3;
const MOVES_PER_TURN = 2;
const NO_ATTACK_TURNS = 2;

class Card {
    constructor(type, value = 1, symbol = '') {
        this.type = type;
        this.value = value;
        this.symbol = symbol;
    }
}

class Game {
    constructor() {
        // Initialize PixiJS with v7 syntax
        this.app = new PIXI.Application({
            width: 1200,
            height: 900,
            backgroundColor: 0x2c3e50,
            antialias: true
        });
        document.body.appendChild(this.app.view);

        // Game state
        this.currentPlayer = 0; // 0 = bottom, 1 = top
        this.turnCount = [0, 0]; // Track turns for each player
        this.movesLeft = MOVES_PER_TURN;
        this.selectedTile = null;
        this.grid = []; // 4x3 grid
        this.playerSpaces = [[], []]; // Player 0 (bottom) and Player 1 (top)
        this.playerHearts = [MAX_HEARTS, MAX_HEARTS];
        this.deck = [];
        this.gameOver = false;

        // UI containers
        this.gridContainer = new PIXI.Container();
        this.player0Container = new PIXI.Container();
        this.player1Container = new PIXI.Container();
        this.uiContainer = new PIXI.Container();

        this.app.stage.addChild(this.gridContainer);
        this.app.stage.addChild(this.player0Container);
        this.app.stage.addChild(this.player1Container);
        this.app.stage.addChild(this.uiContainer);

        this.initGame();
    }

    initGame() {
        // Initialize deck with various cards
        this.createDeck();
        
        // Initialize grid
        for (let row = 0; row < GRID_ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                this.grid[row][col] = this.drawCard();
            }
        }

        // Initialize player spaces
        for (let player = 0; player < 2; player++) {
            for (let row = 0; row < PLAYER_ROWS; row++) {
                if (!this.playerSpaces[player][row]) {
                    this.playerSpaces[player][row] = [];
                }
                for (let col = 0; col < PLAYER_COLS; col++) {
                    this.playerSpaces[player][row][col] = null;
                }
            }
        }

        this.setupLayout();
        this.render();
    }

    createDeck() {
        // Create a variety of cards
        const cardDistribution = [
            { type: CardType.ATTACK, value: 1, count: 15, symbol: '-1' },
            { type: CardType.ATTACK, value: 2, count: 8, symbol: '-2' },
            { type: CardType.SHIELD, value: 1, count: 10, symbol: '+1♥' },
            { type: CardType.SPECIAL, value: 0, count: 8, symbol: '+M' },
            { type: CardType.BARRIER, value: 0, count: 6, symbol: '⊗' },
            { type: CardType.BOOST, value: 1, count: 5, symbol: '+1' },
            { type: CardType.INSTANT, value: 1, count: 8, symbol: '+1♥' }
        ];

        this.deck = [];
        cardDistribution.forEach(({type, value, count, symbol}) => {
            for (let i = 0; i < count; i++) {
                this.deck.push(new Card(type, value, symbol));
            }
        });

        // Shuffle deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCard() {
        if (this.deck.length === 0) {
            this.createDeck(); // Reshuffle if deck is empty
        }
        return this.deck.pop();
    }

    setupLayout() {
        const centerX = this.app.screen.width / 2;
        const centerY = this.app.screen.height / 2;

        // Position grid in center
        const gridWidth = GRID_COLS * (TILE_SIZE + TILE_PADDING);
        const gridHeight = GRID_ROWS * (TILE_SIZE + TILE_PADDING);
        this.gridContainer.x = centerX - gridWidth / 2;
        this.gridContainer.y = centerY - gridHeight / 2;

        // Position player 0 space (bottom)
        this.player0Container.x = centerX - gridWidth / 2;
        this.player0Container.y = this.gridContainer.y + gridHeight + 40;

        // Position player 1 space (top)
        this.player1Container.x = centerX - gridWidth / 2;
        this.player1Container.y = this.gridContainer.y - (PLAYER_ROWS * (TILE_SIZE + TILE_PADDING)) - 40;
    }

    render() {
        // Clear containers
        this.gridContainer.removeChildren();
        this.player0Container.removeChildren();
        this.player1Container.removeChildren();
        this.uiContainer.removeChildren();

        // Render grid
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const card = this.grid[row][col];
                if (card) {
                    const tile = this.createTile(card, col, row, 'grid');
                    this.gridContainer.addChild(tile);
                }
            }
        }

        // Render player spaces
        this.renderPlayerSpace(0);
        this.renderPlayerSpace(1);

        // Render UI (hearts, turn info, etc.)
        this.renderUI();
    }

    createTile(card, col, row, location, player = null) {
        const container = new PIXI.Container();
        const x = col * (TILE_SIZE + TILE_PADDING);
        const y = row * (TILE_SIZE + TILE_PADDING);
        
        container.x = x;
        container.y = y;

        // Tile background
        const tile = new PIXI.Graphics();
        tile.beginFill(0xf4e4c1);
        tile.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
        tile.endFill();

        // Draw outline based on card type
        const outlineColor = this.getCardColor(card.type);
        const outlineWidth = 4;
        tile.lineStyle(outlineWidth, outlineColor);
        tile.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);

        container.addChild(tile);

        // Draw symbol/value
        if (card.symbol) {
            const text = new PIXI.Text(card.symbol, {
                fontFamily: 'Arial',
                fontSize: card.type === CardType.BARRIER ? 40 : 24,
                fontWeight: 'bold',
                fill: 0x000000,
                align: 'center'
            });
            text.anchor.set(0.5);
            text.x = TILE_SIZE / 2;
            text.y = TILE_SIZE / 2;
            container.addChild(text);
        }

        // Make interactive if in grid
        if (location === 'grid' && !this.gameOver) {
            container.interactive = true;
            container.buttonMode = true;
            
            container.on('pointerdown', () => {
                if (this.movesLeft > 0) {
                    this.handleTileClick(row, col, location, player);
                }
            });

            container.on('pointerover', () => {
                tile.tint = 0xdddddd;
            });

            container.on('pointerout', () => {
                tile.tint = 0xffffff;
            });
        }

        // Store reference
        container._cardData = { card, row, col, location, player };

        return container;
    }

    getCardColor(type) {
        switch(type) {
            case CardType.ATTACK: return 0x9b59b6; // Purple
            case CardType.INSTANT: return 0xe74c3c; // Red
            case CardType.SHIELD: return 0x3498db; // Blue
            case CardType.SPECIAL: return 0xe67e22; // Orange
            case CardType.BARRIER: return 0x000000; // Black
            case CardType.BOOST: return 0xff69b4; // Pink (Hot Pink)
            default: return 0x95a5a6; // Gray
        }
    }

    handleTileClick(row, col, location, player) {
        if (this.gameOver) return;

        if (!this.selectedTile) {
            // First click - select tile
            if (location === 'grid') {
                const card = this.grid[row][col];
                if (card && card.type !== CardType.BARRIER) {
                    this.selectedTile = { row, col, location };
                    this.highlightSelection();
                }
            }
        } else {
            // Check if clicking the same tile (deselect)
            if (location === 'grid' && 
                this.selectedTile.row === row && 
                this.selectedTile.col === col &&
                this.selectedTile.location === location) {
                // Deselect without counting as a move
                this.selectedTile = null;
                this.render();
                return;
            }
            
            // Second click - determine action
            if (location === 'grid') {
                // Check if trying to swap with a barrier
                const targetCard = this.grid[row][col];
                if (targetCard && targetCard.type === CardType.BARRIER) {
                    this.showMessage("Can't move barriers!");
                    this.selectedTile = null;
                    this.render();
                    return;
                }
                
                // Swap tiles in grid
                this.swapTiles(this.selectedTile, { row, col, location });
                this.selectedTile = null;
                this.movesLeft--;
                
                // Don't auto-end turn, let player decide
                this.render();
            } else if (location === 'playerSpace') {
                // Move tile from grid edge to player space - must be same column
                const edgeRow = this.currentPlayer === 0 ? GRID_ROWS - 1 : 0;
                if (this.selectedTile.location === 'grid' && 
                    this.selectedTile.row === edgeRow && 
                    this.selectedTile.col === col) {
                    this.moveToPlayerSpace(this.selectedTile.col);
                    this.selectedTile = null;
                    this.movesLeft--;
                    
                    // Don't auto-end turn, let player decide
                    this.render();
                } else if (this.selectedTile.col !== col) {
                    this.showMessage('Must move to same column!');
                    this.selectedTile = null;
                    this.render();
                } else {
                    this.showMessage('Can only move from edge row!');
                    this.selectedTile = null;
                    this.render();
                }
            }
        }
    }

    swapTiles(tile1, tile2) {
        const card1 = this.grid[tile1.row][tile1.col];
        const card2 = this.grid[tile2.row][tile2.col];

        // Swap
        this.grid[tile1.row][tile1.col] = card2;
        this.grid[tile2.row][tile2.col] = card1;
    }

    moveToPlayerSpace(col) {
        const playerRow = this.currentPlayer === 0 ? GRID_ROWS - 1 : 0;
        const card = this.grid[playerRow][col];
        
        if (!card) return;

        // Find empty spot in player space - in the SAME COLUMN, dropping to bottom
        const emptySpot = this.findEmptyPlayerSpotInColumn(this.currentPlayer, col);
        if (emptySpot) {
            this.playerSpaces[this.currentPlayer][emptySpot.row][emptySpot.col] = card;
            this.grid[playerRow][col] = null;

            // Check if card is instant (red outline)
            if (card.type === CardType.INSTANT) {
                this.executeInstantCard(card);
                this.playerSpaces[this.currentPlayer][emptySpot.row][emptySpot.col] = null;
            }

            // Shift column tiles toward player (respecting barriers)
            this.shiftColumn(col);

            // Add new card from deck on the opposite side of any barrier
            const newRow = this.findSpawnRow(col);
            this.grid[newRow][col] = this.drawCard();
        } else {
            this.showMessage('Column is full!');
        }
    }

    findSpawnRow(col) {
        // Find where to spawn new card - opposite side of any barrier
        if (this.currentPlayer === 0) {
            // Player 0 took from bottom, spawn at top (or below topmost barrier)
            // Check if there's a barrier
            for (let row = 0; row < GRID_ROWS; row++) {
                if (this.grid[row][col] && this.grid[row][col].type === CardType.BARRIER) {
                    // Spawn just below the barrier
                    return row + 1 < GRID_ROWS ? row + 1 : row - 1;
                }
            }
            // No barrier, spawn at top
            return 0;
        } else {
            // Player 1 took from top, spawn at bottom (or above bottommost barrier)
            // Check if there's a barrier
            for (let row = GRID_ROWS - 1; row >= 0; row--) {
                if (this.grid[row][col] && this.grid[row][col].type === CardType.BARRIER) {
                    // Spawn just above the barrier
                    return row - 1 >= 0 ? row - 1 : row + 1;
                }
            }
            // No barrier, spawn at bottom
            return GRID_ROWS - 1;
        }
    }

    shiftColumn(col) {
        if (this.currentPlayer === 0) {
            // Player 0 (bottom) - shift down, but stop at barriers
            // Find the topmost barrier in the column
            let barrierRow = -1;
            for (let row = 0; row < GRID_ROWS; row++) {
                if (this.grid[row][col] && this.grid[row][col].type === CardType.BARRIER) {
                    barrierRow = row;
                    break;
                }
            }
            
            // Shift tiles from barrier (or top) down to bottom
            const startRow = barrierRow + 1;
            for (let row = GRID_ROWS - 1; row > startRow; row--) {
                if (!this.grid[row][col]) {
                    this.grid[row][col] = this.grid[row - 1][col];
                    this.grid[row - 1][col] = null;
                }
            }
        } else {
            // Player 1 (top) - shift up, but stop at barriers
            // Find the bottommost barrier in the column
            let barrierRow = GRID_ROWS;
            for (let row = GRID_ROWS - 1; row >= 0; row--) {
                if (this.grid[row][col] && this.grid[row][col].type === CardType.BARRIER) {
                    barrierRow = row;
                    break;
                }
            }
            
            // Shift tiles from barrier (or bottom) up to top
            const startRow = barrierRow - 1;
            for (let row = 0; row < startRow; row++) {
                if (!this.grid[row][col]) {
                    this.grid[row][col] = this.grid[row + 1][col];
                    this.grid[row + 1][col] = null;
                }
            }
        }
    }

    findEmptyPlayerSpotInColumn(player, col) {
        // Tiles drop to bottom for Player 1 (player 0), top for Player 2 (player 1)
        if (player === 0) {
            // Player 1 (bottom) - fill from bottom row up
            for (let row = PLAYER_ROWS - 1; row >= 0; row--) {
                if (!this.playerSpaces[player][row][col]) {
                    return { row, col };
                }
            }
        } else {
            // Player 2 (top) - fill from top row down
            for (let row = 0; row < PLAYER_ROWS; row++) {
                if (!this.playerSpaces[player][row][col]) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    findEmptyPlayerSpot(player, preferredCol) {
        // Try preferred column first
        for (let row = 0; row < PLAYER_ROWS; row++) {
            if (!this.playerSpaces[player][row][preferredCol]) {
                return { row, col: preferredCol };
            }
        }
        // Find any empty spot
        for (let col = 0; col < PLAYER_COLS; col++) {
            for (let row = 0; row < PLAYER_ROWS; row++) {
                if (!this.playerSpaces[player][row][col]) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    executeInstantCard(card) {
        // Execute instant effect - instant heal for current player
        if (card.type === CardType.INSTANT) {
            this.playerHearts[this.currentPlayer] = Math.min(MAX_HEARTS, this.playerHearts[this.currentPlayer] + card.value);
            this.showMessage(`+${card.value}♥ Instant Heal!`);
        }
    }

    renderPlayerSpace(player) {
        const container = player === 0 ? this.player0Container : this.player1Container;
        
        for (let row = 0; row < PLAYER_ROWS; row++) {
            for (let col = 0; col < PLAYER_COLS; col++) {
                const card = this.playerSpaces[player][row][col];
                
                // Draw empty slot
                const slotContainer = new PIXI.Container();
                slotContainer.x = col * (TILE_SIZE + TILE_PADDING);
                slotContainer.y = row * (TILE_SIZE + TILE_PADDING);
                
                const slot = new PIXI.Graphics();
                
                // Highlight slot if it's current player's turn and a tile is selected from edge in SAME COLUMN
                const shouldHighlight = player === this.currentPlayer && 
                                       !this.gameOver && 
                                       this.selectedTile && 
                                       this.selectedTile.location === 'grid' &&
                                       this.selectedTile.row === (this.currentPlayer === 0 ? GRID_ROWS - 1 : 0) &&
                                       this.selectedTile.col === col &&
                                       !card;
                
                if (shouldHighlight) {
                    slot.lineStyle(3, 0xf1c40f, 1);
                    slot.beginFill(0xf1c40f, 0.1);
                } else {
                    slot.lineStyle(2, 0x7f8c8d);
                }
                
                slot.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
                slot.endFill();
                
                slotContainer.addChild(slot);
                
                // Make slots clickable for tile placement
                if (player === this.currentPlayer && !this.gameOver && !card) {
                    slotContainer.interactive = true;
                    slotContainer.buttonMode = true;
                    slotContainer._slotData = { row, col, player };
                    
                    slotContainer.on('pointerdown', () => {
                        this.handleTileClick(row, col, 'playerSpace', player);
                    });
                    
                    slotContainer.on('pointerover', () => {
                        if (this.selectedTile) {
                            slot.clear();
                            slot.lineStyle(3, 0x2ecc71);
                            slot.beginFill(0x2ecc71, 0.2);
                            slot.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
                            slot.endFill();
                        }
                    });
                    
                    slotContainer.on('pointerout', () => {
                        this.render();
                    });
                }
                
                container.addChild(slotContainer);

                // Draw card if present
                if (card) {
                    const tile = this.createTileForPlayerSpace(card, col, row, player);
                    container.addChild(tile);
                }
            }
        }
    }

    createTileForPlayerSpace(card, col, row, player) {
        const container = new PIXI.Container();
        const x = col * (TILE_SIZE + TILE_PADDING);
        const y = row * (TILE_SIZE + TILE_PADDING);
        
        container.x = x;
        container.y = y;

        // Tile background
        const tile = new PIXI.Graphics();
        tile.beginFill(0xf4e4c1);
        tile.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
        tile.endFill();

        // Draw outline
        const outlineColor = this.getCardColor(card.type);
        tile.lineStyle(4, outlineColor);
        tile.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);

        container.addChild(tile);

        // Symbol
        if (card.symbol) {
            const text = new PIXI.Text(card.symbol, {
                fontFamily: 'Arial',
                fontSize: card.type === CardType.BARRIER ? 40 : 24,
                fontWeight: 'bold',
                fill: 0x000000,
                align: 'center'
            });
            text.anchor.set(0.5);
            text.x = TILE_SIZE / 2;
            text.y = TILE_SIZE / 2;
            container.addChild(text);
        }

        // Make clickable for spending cards - only spendable card types
        const canSpend = card.type === CardType.ATTACK || 
                        card.type === CardType.SHIELD || 
                        card.type === CardType.SPECIAL ||
                        card.type === CardType.BOOST;
        
        if (player === this.currentPlayer && !this.gameOver && canSpend) {
            container.interactive = true;
            container.buttonMode = true;
            
            container.on('pointerdown', () => {
                this.spendCard(player, row, col);
            });
            
            container.on('pointerover', () => {
                tile.tint = 0xdddddd;
            });

            container.on('pointerout', () => {
                tile.tint = 0xffffff;
            });
        }

        return container;
    }

    spendCard(player, row, col) {
        const card = this.playerSpaces[player][row][col];
        if (!card) return;

        // Check if attacks are allowed
        if (card.type === CardType.ATTACK && this.turnCount[player] < NO_ATTACK_TURNS) {
            this.showMessage(`No attacks allowed in first ${NO_ATTACK_TURNS} turns!`);
            return;
        }

        const opponent = 1 - player;

        switch(card.type) {
            case CardType.ATTACK:
                this.playerHearts[opponent] = Math.max(0, this.playerHearts[opponent] - card.value);
                this.playerSpaces[player][row][col] = null;
                this.checkGameOver();
                break;
            
            case CardType.SHIELD:
                this.playerHearts[player] = Math.min(MAX_HEARTS, this.playerHearts[player] + card.value);
                this.playerSpaces[player][row][col] = null;
                break;
            
            case CardType.SPECIAL:
                // Grant extra move
                this.movesLeft += 1;
                this.playerSpaces[player][row][col] = null;
                this.showMessage('+1 Move!');
                break;
        }

        this.render();
    }

    renderUI() {
        const margin = 20;
        
        // Player 1 label and hearts (bottom)
        const player1Label = new PIXI.Text('PLAYER 1', {
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: this.currentPlayer === 0 ? 0xf1c40f : 0xffffff,
            align: 'left'
        });
        player1Label.x = margin;
        player1Label.y = this.app.screen.height - 100;
        this.uiContainer.addChild(player1Label);
        
        for (let i = 0; i < MAX_HEARTS; i++) {
            const heart = this.createHeart(i < this.playerHearts[0]);
            heart.x = margin + i * 45;
            heart.y = this.app.screen.height - 60;
            this.uiContainer.addChild(heart);
        }

        // Player 2 label and hearts (top)
        const player2Label = new PIXI.Text('PLAYER 2', {
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: this.currentPlayer === 1 ? 0xf1c40f : 0xffffff,
            align: 'left'
        });
        player2Label.x = margin;
        player2Label.y = margin;
        this.uiContainer.addChild(player2Label);
        
        for (let i = 0; i < MAX_HEARTS; i++) {
            const heart = this.createHeart(i < this.playerHearts[1]);
            heart.x = margin + i * 45;
            heart.y = margin + 35;
            this.uiContainer.addChild(heart);
        }

        // Turn info
        const turnText = new PIXI.Text(
            `Player ${this.currentPlayer + 1}'s Turn\nMoves: ${this.movesLeft}`,
            {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                align: 'center'
            }
        );
        turnText.x = this.app.screen.width - 150;
        turnText.y = margin;
        this.uiContainer.addChild(turnText);

        // Instructions
        const instructions = new PIXI.Text(
            'Move tiles OR\nSpend cards from\nplay space\n\nClick End Turn\nwhen done',
            {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xbdc3c7,
                align: 'center'
            }
        );
        instructions.x = this.app.screen.width - 150;
        instructions.y = 80;
        this.uiContainer.addChild(instructions);

        // End turn button - make it bigger and more prominent
        const endTurnBtn = this.createButton('End Turn', this.app.screen.width - 150, 190, 120, 50);
        endTurnBtn.on('pointerdown', () => this.endTurn());
        this.uiContainer.addChild(endTurnBtn);

        // Legend
        this.renderLegend();

        // Game over screen
        if (this.gameOver) {
            this.renderGameOver();
        }
    }

    createHeart(filled) {
        const heart = new PIXI.Graphics();
        if (filled) {
            heart.beginFill(0xe74c3c);
        } else {
            heart.lineStyle(2, 0x7f8c8d);
        }
        
        // Simple heart shape (rectangle for now)
        heart.drawRoundedRect(0, 0, 35, 35, 5);
        heart.endFill();

        // Add heart symbol
        const text = new PIXI.Text('♥', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: filled ? 0xffffff : 0x7f8c8d
        });
        text.anchor.set(0.5);
        text.x = 17.5;
        text.y = 17.5;
        heart.addChild(text);

        return heart;
    }

    createButton(label, x, y, width = 120, height = 40) {
        const btn = new PIXI.Container();
        btn.x = x;
        btn.y = y;

        const bg = new PIXI.Graphics();
        bg.beginFill(0x3498db);
        bg.drawRoundedRect(0, 0, width, height, 5);
        bg.endFill();
        btn.addChild(bg);

        const text = new PIXI.Text(label, {
            fontFamily: 'Arial',
            fontSize: height > 40 ? 20 : 16,
            fontWeight: height > 40 ? 'bold' : 'normal',
            fill: 0xffffff
        });
        text.anchor.set(0.5);
        text.x = width / 2;
        text.y = height / 2;
        btn.addChild(text);

        btn.interactive = true;
        btn.buttonMode = true;
        btn.on('pointerover', () => bg.tint = 0xcccccc);
        btn.on('pointerout', () => bg.tint = 0xffffff);

        return btn;
    }

    endTurn() {
        if (this.gameOver) return;
        
        this.selectedTile = null;
        this.currentPlayer = 1 - this.currentPlayer;
        this.turnCount[this.currentPlayer]++;
        this.movesLeft = MOVES_PER_TURN;
        this.render();
        
        // Show flashy turn announcement
        this.showTurnAnnouncement();
    }

    showTurnAnnouncement() {
        const announcement = new PIXI.Container();
        
        // Semi-transparent background
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.85);
        bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        bg.endFill();
        announcement.addChild(bg);
        
        // Main text
        const mainText = new PIXI.Text(`PLAYER ${this.currentPlayer + 1}'S TURN`, {
            fontFamily: 'Arial',
            fontSize: 80,
            fontWeight: 'bold',
            fill: this.currentPlayer === 0 ? 0x3498db : 0xe74c3c,
            stroke: 0xffffff,
            strokeThickness: 6,
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 10,
            dropShadowDistance: 5
        });
        mainText.anchor.set(0.5);
        mainText.x = this.app.screen.width / 2;
        mainText.y = this.app.screen.height / 2;
        announcement.addChild(mainText);
        
        // Subtext
        const subText = new PIXI.Text('Get Ready!', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xf1c40f,
            align: 'center'
        });
        subText.anchor.set(0.5);
        subText.x = this.app.screen.width / 2;
        subText.y = this.app.screen.height / 2 + 70;
        announcement.addChild(subText);
        
        this.app.stage.addChild(announcement);
        
        // Animate and remove
        let alpha = 1;
        let scale = 0.5;
        const animate = () => {
            if (scale < 1) {
                scale += 0.05;
                mainText.scale.set(scale);
            }
            
            if (alpha > 0) {
                alpha -= 0.02;
                announcement.alpha = alpha;
                requestAnimationFrame(animate);
            } else {
                this.app.stage.removeChild(announcement);
            }
        };
        
        // Start fade out after 1 second
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 1000);
    }

    checkGameOver() {
        if (this.playerHearts[0] <= 0) {
            this.gameOver = true;
            this.winner = 1;
        } else if (this.playerHearts[1] <= 0) {
            this.gameOver = true;
            this.winner = 0;
        }
    }

    renderGameOver() {
        const overlay = new PIXI.Graphics();
        overlay.beginFill(0x000000, 0.7);
        overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.endFill();
        this.uiContainer.addChild(overlay);

        const text = new PIXI.Text(
            `Game Over!\nPlayer ${this.winner + 1} Wins!`,
            {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xffffff,
                align: 'center'
            }
        );
        text.anchor.set(0.5);
        text.x = this.app.screen.width / 2;
        text.y = this.app.screen.height / 2 - 50;
        this.uiContainer.addChild(text);

        const restartBtn = this.createButton('Restart', this.app.screen.width / 2 - 60, this.app.screen.height / 2 + 50);
        restartBtn.on('pointerdown', () => {
            this.gameOver = false;
            this.currentPlayer = 0;
            this.turnCount = [0, 0];
            this.movesLeft = MOVES_PER_TURN;
            this.playerHearts = [MAX_HEARTS, MAX_HEARTS];
            this.initGame();
        });
        this.uiContainer.addChild(restartBtn);
    }

    showMessage(msg) {
        const text = new PIXI.Text(msg, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xf39c12,
            stroke: 0x000000,
            strokeThickness: 2
        });
        text.anchor.set(0.5);
        text.x = this.app.screen.width / 2;
        text.y = this.app.screen.height / 2;
        this.uiContainer.addChild(text);

        setTimeout(() => {
            this.uiContainer.removeChild(text);
        }, 2000);
    }

    highlightSelection() {
        this.render();
        // Add highlight to selected tile
        if (this.selectedTile) {
            const highlight = new PIXI.Graphics();
            highlight.lineStyle(4, 0xf1c40f);
            const x = this.selectedTile.col * (TILE_SIZE + TILE_PADDING);
            const y = this.selectedTile.row * (TILE_SIZE + TILE_PADDING);
            highlight.drawRoundedRect(x, y, TILE_SIZE, TILE_SIZE, 8);
            this.gridContainer.addChild(highlight);
        }
    }

    renderLegend() {
        const legendX = 20;
        const legendY = this.app.screen.height / 2 - 150;
        const lineHeight = 30;

        const legendTitle = new PIXI.Text('CARD LEGEND:', {
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: 0xffffff
        });
        legendTitle.x = legendX;
        legendTitle.y = legendY;
        this.uiContainer.addChild(legendTitle);

        const legendItems = [
            { color: 0x9b59b6, text: 'Purple: Attack (-1, -2)', symbol: '-1' },
            { color: 0xe74c3c, text: 'Red: +1 Heart (instant)', symbol: '+1♥' },
            { color: 0x3498db, text: 'Blue: +1 Heart (save)', symbol: '+1♥' },
            { color: 0xe67e22, text: 'Orange: Extra Move', symbol: '+M' },
            { color: 0xff69b4, text: 'Pink: +1 Attack Boost', symbol: '+1' },
            { color: 0x000000, text: 'Black X: Barrier (blocks)', symbol: '⊗' }
        ];

        legendItems.forEach((item, index) => {
            const y = legendY + 30 + (index * lineHeight);

            // Color square
            const square = new PIXI.Graphics();
            square.beginFill(item.color);
            square.drawRoundedRect(legendX, y, 20, 20, 3);
            square.endFill();
            this.uiContainer.addChild(square);

            // Symbol
            const symbolText = new PIXI.Text(item.symbol, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'center'
            });
            symbolText.x = legendX + 10;
            symbolText.y = y + 10;
            symbolText.anchor.set(0.5);
            this.uiContainer.addChild(symbolText);

            // Description
            const desc = new PIXI.Text(item.text, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xecf0f1
            });
            desc.x = legendX + 30;
            desc.y = y + 3;
            this.uiContainer.addChild(desc);
        });

        // Attack restriction note
        const note = new PIXI.Text('*No attacks first 2 turns', {
            fontFamily: 'Arial',
            fontSize: 11,
            fill: 0xf39c12,
            fontStyle: 'italic'
        });
        note.x = legendX;
        note.y = legendY + 30 + (legendItems.length * lineHeight) + 10;
        this.uiContainer.addChild(note);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});

