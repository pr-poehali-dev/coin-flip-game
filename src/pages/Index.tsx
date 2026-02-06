import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type CoinSide = 'heads' | 'tails';
type GameResult = { bet: CoinSide; result: CoinSide; won: boolean; amount: number };

export default function Index() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [history, setHistory] = useState<GameResult[]>([]);

  const flipCoin = () => {
    if (balance < betAmount || isFlipping) return;

    setIsFlipping(true);
    setBalance(balance - betAmount);
    setResult(null);

    setTimeout(() => {
      const coinResult: CoinSide = Math.random() > 0.5 ? 'heads' : 'tails';
      const won = coinResult === selectedSide;
      
      setResult(coinResult);
      setIsFlipping(false);

      if (won) {
        setBalance((prev) => prev + betAmount * 2);
      }

      setHistory((prev) => [
        { bet: selectedSide, result: coinResult, won, amount: betAmount },
        ...prev.slice(0, 9),
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
            Крипто Флипер
          </h1>
          <p className="text-gray-400 text-lg">Орёл или Решка</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Balance & Controls */}
          <Card className="md:col-span-1 bg-gray-900/50 border-yellow-500/20 p-6 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Balance */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Баланс</p>
                <div className="text-4xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                  <Icon name="Coins" size={32} className="text-yellow-400" />
                  {balance}
                </div>
              </div>

              {/* Bet Amount */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ставка</label>
                <div className="flex gap-2 mb-3">
                  {[10, 50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      variant={betAmount === amount ? 'default' : 'outline'}
                      className={`flex-1 ${
                        betAmount === amount
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'border-yellow-500/30 hover:border-yellow-500'
                      }`}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
                <input
                  type="range"
                  min="10"
                  max={Math.min(balance, 500)}
                  step="10"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </div>

              {/* Side Selection */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Выбери сторону</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setSelectedSide('heads')}
                    variant="outline"
                    className={`h-20 ${
                      selectedSide === 'heads'
                        ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/30'
                        : 'border-gray-700 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">👑</div>
                      <div className="text-xs">Орёл</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setSelectedSide('tails')}
                    variant="outline"
                    className={`h-20 ${
                      selectedSide === 'tails'
                        ? 'bg-gray-500/20 border-gray-400 shadow-lg shadow-gray-400/30'
                        : 'border-gray-700 hover:border-gray-400/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">⚡</div>
                      <div className="text-xs">Решка</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Flip Button */}
              <Button
                onClick={flipCoin}
                disabled={balance < betAmount || isFlipping}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30"
              >
                {isFlipping ? 'Бросаем...' : `Бросить (${betAmount} монет)`}
              </Button>
            </div>
          </Card>

          {/* Coin Animation */}
          <Card className="md:col-span-1 bg-gray-900/50 border-yellow-500/20 p-8 backdrop-blur-sm flex items-center justify-center">
            <div className="relative">
              <div
                className={`w-48 h-48 rounded-full flex items-center justify-center text-7xl transition-all duration-500 ${
                  isFlipping ? 'animate-spin-flip' : ''
                } ${
                  result === 'heads'
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl shadow-yellow-500/50'
                    : result === 'tails'
                    ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-2xl shadow-gray-400/50'
                    : 'bg-gradient-to-br from-yellow-400 to-gray-400 shadow-2xl shadow-yellow-500/30'
                }`}
              >
                {isFlipping ? (
                  <Icon name="Sparkles" size={80} className="text-white animate-pulse" />
                ) : result === 'heads' ? (
                  <span>👑</span>
                ) : result === 'tails' ? (
                  <span>⚡</span>
                ) : (
                  <Icon name="Coins" size={80} className="text-white/80" />
                )}
              </div>
              
              {result && !isFlipping && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center animate-fade-in">
                  <p className={`text-2xl font-bold ${
                    history[0]?.won ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {history[0]?.won ? `+${betAmount * 2}` : `-${betAmount}`}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* History */}
          <Card className="md:col-span-1 bg-gray-900/50 border-yellow-500/20 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Icon name="History" size={20} />
              История игр
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">Сделай первую ставку!</p>
              ) : (
                history.map((game, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      game.won
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    } animate-fade-in`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {game.bet === 'heads' ? '👑' : '⚡'}
                        </span>
                        <Icon name="ArrowRight" size={16} className="text-gray-500" />
                        <span className="text-2xl">
                          {game.result === 'heads' ? '👑' : '⚡'}
                        </span>
                      </div>
                      <div className={`font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                        {game.won ? `+${game.amount * 2}` : `-${game.amount}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card className="bg-gray-900/50 border-yellow-500/20 p-4 text-center backdrop-blur-sm">
            <p className="text-gray-400 text-sm">Всего игр</p>
            <p className="text-2xl font-bold text-yellow-400">{history.length}</p>
          </Card>
          <Card className="bg-gray-900/50 border-green-500/20 p-4 text-center backdrop-blur-sm">
            <p className="text-gray-400 text-sm">Выигрышей</p>
            <p className="text-2xl font-bold text-green-400">
              {history.filter((g) => g.won).length}
            </p>
          </Card>
          <Card className="bg-gray-900/50 border-red-500/20 p-4 text-center backdrop-blur-sm">
            <p className="text-gray-400 text-sm">Проигрышей</p>
            <p className="text-2xl font-bold text-red-400">
              {history.filter((g) => !g.won).length}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
