import React, { useReducer, useState, useMemo } from "react";
import { Card, PokerGameState, BetAmount, BET_AMOUNTS, EvaluatedHand } from "./types";
import { HouseAI } from "./houseAI";
import { evaluateHand } from "./evaluateHand";
import { PokerDeck } from "./deck";
import { OuterPanel, InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { SquareIcon } from "components/ui/SquareIcon";
import { ITEM_DETAILS } from "features/game/types/images";
import Decimal from "decimal.js-light";

// Reducer for game state
const initialGameState: PokerGameState = {
  status: "idle",
  playerHand: [],
  playerChips: 0,
  houseHand: [],
  communityCards: [],
  initialBetAmount: 0,
  currentBet: 0,
  potAmount: 0,
  playerBetAmount: 0,
  houseBetAmount: 0,
  totalPlayerBetAcrossGame: 0,
  totalHouseBetAcrossGame: 0,
  playerEvalHand: null,
  houseEvalHand: null,
  gameNumber: 0,
  totalWinnings: 0,
  totalLosses: 0,
};

type GameAction =
  | { type: "START_GAME"; startingChips: number }
  | { type: "PLACE_BET"; amount: BetAmount }
  | { type: "DEAL_HOLE_CARDS"; playerHand: Card[]; houseHand: Card[] }
  | { type: "PLAYER_ACTION"; action: "bet" | "check" | "fold" }
  | { type: "HOUSE_ACTION"; action: "call" | "check" | "fold"; amount?: number }
  | { type: "RESET_STREET_BETS" }
  | { type: "DEAL_FLOP"; cards: Card[] }
  | { type: "DEAL_RIVER"; cards: Card[] }
  | { type: "SHOW_CARDS" }
  | { type: "GAME_OVER"; winner: "player" | "house" | "tie"; winAmount: number; playerEvalHand?: EvaluatedHand; houseEvalHand?: EvaluatedHand }
  | { type: "PLAY_AGAIN"; startingChips: number };

function gameReducer(state: PokerGameState, action: GameAction): PokerGameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        status: "betting",
        gameNumber: state.gameNumber + 1,
        playerHand: [],
        houseHand: [],
        communityCards: [],
        potAmount: 0,
        playerBetAmount: 0,
        houseBetAmount: 0,
        totalPlayerBetAcrossGame: 0,
        totalHouseBetAcrossGame: 0,
        currentBet: 0,
        playerChips: action.startingChips,
      };

    case "PLACE_BET":
      return {
        ...state,
        playerChips: state.playerChips - action.amount,
        potAmount: state.potAmount + action.amount,
        playerBetAmount: action.amount,
        totalPlayerBetAcrossGame: state.totalPlayerBetAcrossGame + action.amount,
        initialBetAmount: action.amount,
        currentBet: action.amount,
      };

    case "DEAL_HOLE_CARDS":
      return {
        ...state,
        playerHand: action.playerHand,
        houseHand: action.houseHand,
        status: "preflop_betting",
      };

    case "PLAYER_ACTION":
      if (action.action === "fold") {
        return { ...state, status: "gameover" };
      }

      if (action.action === "bet") {
        // Player bets - must bet their total accumulated so far
        const betAmount = state.totalPlayerBetAcrossGame;
        return {
          ...state,
          playerChips: state.playerChips - betAmount,
          potAmount: state.potAmount + betAmount,
          playerBetAmount: betAmount,
          totalPlayerBetAcrossGame: state.totalPlayerBetAcrossGame + betAmount,
        };
      }

      if (action.action === "check") {
        // Player checks - stays in without additional bet
        return state;
      }

      return state;

    case "HOUSE_ACTION":
      if (action.action === "fold") {
        return { ...state, status: "gameover" };
      }

      if (action.action === "check" || action.action === "call") {
        // House calls with specified amount, or checks (amount = 0)
        const amount = action.amount ?? 0;
        if (amount > 0) {
          return {
            ...state,
            potAmount: state.potAmount + amount,
            houseBetAmount: amount,
            totalHouseBetAcrossGame: state.totalHouseBetAcrossGame + amount,
          };
        }
        return state;
      }

      return state;

    case "RESET_STREET_BETS":
      return {
        ...state,
        currentBet: 0,
        playerBetAmount: 0,
        houseBetAmount: 0,
      };

    case "DEAL_FLOP":
      return {
        ...state,
        communityCards: action.cards,
        status: "postflop_betting",
        currentBet: 0,
        playerBetAmount: 0,
        houseBetAmount: 0,
      };

    case "DEAL_RIVER":
      return {
        ...state,
        communityCards: [...state.communityCards, ...action.cards],
        status: "showdown",
        currentBet: 0,
        playerBetAmount: 0,
        houseBetAmount: 0,
      };

    case "SHOW_CARDS":
      return { ...state, status: "showdown" };

    case "GAME_OVER":
      const winnings = action.winner === "player" ? action.winAmount : 0;
      return {
        ...state,
        status: "gameover",
        playerChips: state.playerChips + winnings,
        playerEvalHand: action.playerEvalHand ?? null,
        houseEvalHand: action.houseEvalHand ?? null,
        totalWinnings: state.totalWinnings + winnings,
        totalLosses: state.totalLosses + (action.winner === "house" ? action.winAmount : 0),
      };

    case "PLAY_AGAIN":
      return {
        ...initialGameState,
        totalWinnings: state.totalWinnings,
        totalLosses: state.totalLosses,
        playerChips: action.startingChips,
      };

    default:
      return state;
  }
}

interface PokerGameProps {
  initialChips?: number;
  onClose?: () => void;
}

export const PokerGame: React.FC<PokerGameProps> = ({ initialChips = 100, onClose }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [deck, setDeck] = useState<PokerDeck | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetAmount>(10);
  const houseAI = new HouseAI();
  const [gameStarted, setGameStarted] = useState(false);

  // Use provided initialChips directly
  const realChips = useMemo(() => {
    return initialChips;
  }, [initialChips]);

  // Helper function to send messages to parent window
  const sendMessageToParent = (event: string, data?: any) => {
    window.parent.postMessage({ event, ...data }, "*");
  };

  const startGame = () => {
    const newDeck = new PokerDeck();
    setDeck(newDeck);
    dispatch({ type: "START_GAME", startingChips: realChips });
  };

  const placeBet = () => {
    dispatch({ type: "PLACE_BET", amount: selectedBet });
    
    // Signal game attempt has started to parent
    if (!gameStarted) {
      sendMessageToParent("attemptStarted");
      setGameStarted(true);
    }
    
    // Deal hole cards
    if (deck) {
      const playerHand = [deck.deal(), deck.deal()];
      const houseHand = [deck.deal(), deck.deal()];
      dispatch({
        type: "DEAL_HOLE_CARDS",
        playerHand,
        houseHand,
      });

      // House automatically matches the initial bet
      setTimeout(() => {
        dispatch({ type: "HOUSE_ACTION", action: "call", amount: selectedBet });
      }, 500);
    }
  };

  const handlePlayerAction = (action: "bet" | "check" | "fold") => {
    if (action === "fold") {
      dispatch({ type: "PLAYER_ACTION", action });
      
      // Fold: Player loses all chips they've bet so far
      dispatch({
        type: "GAME_OVER",
        winner: "house",
        winAmount: gameState.potAmount,
      });
      return;
    }

    // Pre-calculate how much the player will bet (before dispatch)
    // In cumulative system: player bets their total accumulated so far
    const amountPlayerWillBet = action === "bet" ? gameState.totalPlayerBetAcrossGame : 0;
    
    // Calculate the new pot amount based on the action
    const potAfterPlayerAction = gameState.potAmount + amountPlayerWillBet;

    dispatch({ type: "PLAYER_ACTION", action });
    
    // No inventory deduction needed for portal version - tracking handled by parent

    // After player checks/bets, house responds
    setTimeout(() => {
      const streetIndex =
        gameState.status === "preflop_betting"
          ? 0
          : gameState.status === "postflop_betting"
          ? 1
          : 2;

      const houseDecision = houseAI.decideBetAction(
        gameState.houseHand,
        gameState.communityCards,
        potAfterPlayerAction, // Use calculated pot, not stale gameState
        gameState.currentBet,
        realChips,
        streetIndex
      );

      if (houseDecision === "fold") {
        dispatch({
          type: "GAME_OVER",
          winner: "player",
          winAmount: potAfterPlayerAction,
        });
        return;
      }

      // House responds - call if player bet, check if player checked
      const houseAction = action === "bet" ? "call" : "check";
      const houseAmount = action === "bet" ? amountPlayerWillBet : 0;
      dispatch({ type: "HOUSE_ACTION", action: houseAction, amount: houseAmount });

      // After house acts, move to next street or showdown
      setTimeout(() => {
        if (gameState.status === "preflop_betting") {
          // Deal flop
          if (deck) {
            const flopCards = [deck.deal(), deck.deal(), deck.deal()];
            dispatch({ type: "DEAL_FLOP", cards: flopCards });
          }
        } else if (gameState.status === "postflop_betting") {
          // Deal turn and river, then evaluate (no more betting)
          if (deck) {
            const riverCards = [deck.deal(), deck.deal()];
            dispatch({ type: "DEAL_RIVER", cards: riverCards });
            
            // After river is dealt, evaluate hands
            setTimeout(() => {
              // Combine flop (in gameState.communityCards) + river (riverCards we just dealt)
              const allCommunityCards = gameState.communityCards.concat(riverCards);
              const allPlayerCards = gameState.playerHand.concat(allCommunityCards);
              const allHouseCards = gameState.houseHand.concat(allCommunityCards);
              
              const playerEval = evaluateHand(allPlayerCards.slice(0, 5));
              const houseEval = evaluateHand(allHouseCards.slice(0, 5));

              let winner: "player" | "house" | "tie" = "tie";
              if (playerEval.ranking > houseEval.ranking) {
                winner = "player";
              } else if (houseEval.ranking > playerEval.ranking) {
                winner = "house";
              }

              // Calculate final pot amount (after house matches)
              const potAfterHouseAction = potAfterPlayerAction + (action === "bet" ? amountPlayerWillBet : 0);

              setTimeout(() => {
                // Update inventory based on game result
                // For portal version, send score to parent for prize tracking
                let score = 0;
                if (winner === "player") {
                  // Player wins the entire pot
                  score = potAfterHouseAction;
                } else if (winner === "house") {
                  // Player loses - no score
                  score = 0;
                } else {
                  // Tie: Both players get their bets back (return full pot)
                  score = potAfterHouseAction;
                }
                
                // Submit score to parent portal
                if (score > 0) {
                  sendMessageToParent("scoreSubmitted", { score });
                }
                
                dispatch({
                  type: "GAME_OVER",
                  winner,
                  winAmount: potAfterHouseAction,
                  playerEvalHand: playerEval,
                  houseEvalHand: houseEval,
                });
              }, 1500);
            }, 800);
          }
        }
      }, 800);
    }, 500);
  };

  if (gameState.status === "idle") {
    return (
      <OuterPanel>
        <div className="flex flex-col gap-6 p-6">
          {/* Title - Centered */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2">♠ POKER ♠</h2>
            <div className="text-center">
              <Label type="info">Texas Hold'em vs The House</Label>
            </div>
          </div>

          {/* Player Stats */}
          <InnerPanel className="bg-yellow-100 p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-700 font-semibold">CHIPS</div>
                <div className="text-2xl font-bold text-yellow-700">{gameState.playerChips}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700 font-semibold">GAMES PLAYED</div>
                <div className="text-2xl font-bold text-yellow-700">{gameState.gameNumber}</div>
              </div>
            </div>
          </InnerPanel>

          {/* Stats */}
          {gameState.totalWinnings > 0 && (
            <InnerPanel className="bg-green-100 p-3">
              <div className="text-center">
                <div className="text-sm text-green-700 font-semibold">WINNINGS</div>
                <div className="text-xl font-bold text-green-800">+{gameState.totalWinnings}</div>
              </div>
            </InnerPanel>
          )}

          {gameState.totalLosses > 0 && (
            <InnerPanel className="bg-red-100 p-3">
              <div className="text-center">
                <div className="text-sm text-red-700 font-semibold">LOSSES</div>
                <div className="text-xl font-bold text-red-800">-{gameState.totalLosses}</div>
              </div>
            </InnerPanel>
          )}

          {/* Start Button */}
          <button
            onClick={startGame}
            className="w-full px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-lg text-lg"
          >
            🎯 START GAME
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 active:scale-95 transition-all"
            >
              EXIT
            </button>
          )}
        </div>
      </OuterPanel>
    );
  }

  if (gameState.status === "betting" && gameState.playerHand.length === 0) {
    return (
      <OuterPanel>
        <div className="flex flex-col gap-6 p-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold">PLACE YOUR BET</h2>
          </div>

          {/* Chips Available */}
          <InnerPanel className="bg-yellow-100 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700 font-semibold">CHIPS AVAILABLE</div>
              <div className="text-2xl font-bold text-yellow-700">{gameState.playerChips}</div>
            </div>
          </InnerPanel>

          {/* Bet Selection */}
          <div>
            <div className="text-center font-bold mb-3 text-gray-800">SELECT BET AMOUNT</div>
            <div className="grid grid-cols-3 gap-2">
              {BET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedBet(amount)}
                  disabled={gameState.playerChips < amount}
                  className={`py-3 rounded-lg font-bold transition-all active:scale-95 ${
                    selectedBet === amount
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : gameState.playerChips < amount
                      ? "bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed"
                      : "bg-blue-400 text-white hover:bg-blue-500 shadow"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Bet Display */}
          <InnerPanel className="bg-blue-100 p-4 text-center border-2 border-blue-400">
            <div className="text-sm text-blue-700 font-semibold">YOUR BET</div>
            <div className="text-3xl font-bold text-blue-800">{selectedBet}</div>
          </InnerPanel>

          {/* Action Buttons */}
          <div className="flex gap-3 h-14">
            <button
              onClick={placeBet}
              disabled={gameState.playerChips < selectedBet}
              className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              ✓ DEAL IN
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 active:scale-95 transition-all"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </OuterPanel>
    );
  }

  // Card display component with custom suit images
  const CardDisplay = ({ card, hidden = false }: { card?: Card; hidden?: boolean }) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-900 rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg">
          🎴
        </div>
      );
    }
    if (!card) {
      return <div className="w-16 h-24" />;
    }

    const suitImages: Record<string, string> = {
      Kale: ITEM_DETAILS.Kale.image,
      Barley: ITEM_DETAILS.Barley.image,
      Wheat: ITEM_DETAILS.Wheat.image,
      Radish: ITEM_DETAILS.Radish.image,
    };

    return (
      <div className="w-16 h-24 bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden relative">
        {/* Rank in corner */}
        <div className="absolute top-1 left-1 text-base font-bold leading-none z-10 text-black">{card.rank}</div>
        {/* Suit icon centered */}
        <div className="w-full h-full flex items-center justify-center">
          <SquareIcon icon={suitImages[card.suit]} width={24} />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <OuterPanel className="w-full h-full sm:max-w-2xl sm:max-h-full overflow-y-auto">
        <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
        {/* Game Stats - Chips only at top right */}
        <div className="flex justify-end items-center px-2 gap-1">
          <span className="text-4xl font-bold text-green-700">{gameState.playerChips}</span>
        </div>

        {/* House Area */}
        <InnerPanel className="bg-gray-700 p-4 text-white">
          <div className="text-center font-bold mb-2">🏠 HOUSE</div>
          <div className="flex gap-2 justify-center mb-2">
            {gameState.houseHand.map((card, i) => (
              <CardDisplay
                key={i}
                card={card}
                hidden={gameState.status !== "showdown" && gameState.status !== "gameover"}
              />
            ))}
          </div>
        </InnerPanel>

        {/* Community Cards */}
        <InnerPanel className="bg-green-700 p-4">
          <div className="text-center text-white font-bold mb-2">🎯 COMMUNITY CARDS</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {[0, 1, 2, 3, 4].map((i) => {
              const card = gameState.communityCards[i];
              // Cards are revealed as they're added
              if (i < gameState.communityCards.length) {
                return <CardDisplay key={i} card={card} />;
              }
              // Show faced-down cards for unrevealed community cards
              return (
                <div
                  key={i}
                  className="w-16 h-24 bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-900 rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg"
                >
                  🎴
                </div>
              );
            })}
          </div>
          {/* Pot Display - Centered under community cards */}
          <div className="text-center text-white font-bold mt-3 text-lg">Pot: {gameState.potAmount}</div>
        </InnerPanel>

        {/* Player Area */}
        <InnerPanel className="bg-blue-700 p-4 text-white border-4 border-yellow-400">
          <div className="text-center font-bold mb-2">👤 YOUR HAND</div>
          <div className="flex gap-2 justify-center mb-2">
            {gameState.playerHand.map((card, i) => (
              <CardDisplay key={i} card={card} />
            ))}
          </div>
        </InnerPanel>

        {/* Game State Info */}
        <InnerPanel className="bg-yellow-100 p-3 text-center">
          <div className="text-sm font-bold text-gray-700">
            {gameState.status === "preflop_betting"
              ? "🎰 PREFLOP - YOUR ACTION"
              : gameState.status === "postflop_betting"
              ? "🎯 FLOP - YOUR ACTION"
              : "🏁 SHOWDOWN"}
          </div>
        </InnerPanel>

        {/* Action Buttons - Fixed Height Container */}
        <div className="min-h-20 flex flex-col gap-2">
          {(gameState.status === "preflop_betting" ||
            gameState.status === "postflop_betting") && (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => handlePlayerAction("bet")}
                disabled={gameState.playerChips < gameState.totalPlayerBetAcrossGame}
                className="flex-1 px-4 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                💰 BET ({gameState.totalPlayerBetAcrossGame})
              </button>
              <button
                onClick={() => handlePlayerAction("check")}
                className="flex-1 px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition-all shadow-lg"
              >
                ✓ CHECK
              </button>
              <button
                onClick={() => handlePlayerAction("fold")}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-all shadow-lg"
              >
                ✕ FOLD
              </button>
            </div>
          )}

          {gameState.status === "showdown" && (
            <InnerPanel className="bg-purple-100 p-4 text-center border-2 border-purple-400">
              <div className="text-lg font-bold text-purple-800">Evaluating hands...</div>
            </InnerPanel>
          )}

          {gameState.status === "gameover" && (
            <div className="flex flex-col gap-3">
              <InnerPanel
                className={`p-4 text-center ${
                  gameState.playerChips > gameState.playerBetAmount + gameState.potAmount
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-red-100 border-2 border-red-500"
                }`}
              >
                <div className="text-2xl font-bold">
                  {gameState.playerChips > gameState.playerBetAmount + gameState.potAmount
                    ? "🎉 YOU WON!"
                    : "💥 YOU LOST"}
                </div>
              </InnerPanel>

              {/* Display Evaluated Hands */}
              {gameState.playerEvalHand && gameState.houseEvalHand && (
                <InnerPanel className="bg-purple-100 p-4 border-2 border-purple-400">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-xs font-semibold text-gray-600">YOUR HAND</div>
                      <div className="text-lg font-bold text-purple-800">{gameState.playerEvalHand.rankingName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">HOUSE HAND</div>
                      <div className="text-lg font-bold text-purple-800">{gameState.houseEvalHand.rankingName}</div>
                    </div>
                  </div>
                </InnerPanel>
              )}

              <button
                onClick={() => {
                  dispatch({ type: "PLAY_AGAIN", startingChips: realChips });
                  if (deck) {
                    setDeck(new PokerDeck());
                    dispatch({ type: "START_GAME", startingChips: realChips });
                  }
                }}
                className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-lg"
              >
                🔄 PLAY AGAIN
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 active:scale-95 transition-all"
                >
                  EXIT POKER
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </OuterPanel>
    </div>
  );
};
