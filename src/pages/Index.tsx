import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type CoinSide = 'heads' | 'tails';
type GameResult = { bet: CoinSide; result: CoinSide; won: boolean; amount: number };

const WALLET_ADDRESS = 'UQC2xEjVwozC1qw-VKV4cx5c1LmqAVfIJadhTxdc98pEZfqZ';
const TON_TO_COINS = 1000;

export default function Index() {
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(1);
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [showTopup, setShowTopup] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [topupAmount, setTopupAmount] = useState('1');
  const { toast } = useToast();

  useEffect(() => {
    const savedBalance = localStorage.getItem('coinflip_balance');
    const savedHistory = localStorage.getItem('coinflip_history');
    const savedTgId = localStorage.getItem('coinflip_tg_id');
    
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedTgId) setTelegramId(savedTgId);
  }, []);

  useEffect(() => {
    localStorage.setItem('coinflip_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('coinflip_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (telegramId) {
      localStorage.setItem('coinflip_tg_id', telegramId);
      const interval = setInterval(checkPayments, 30000);
      return () => clearInterval(interval);
    }
  }, [telegramId]);

  const checkPayments = async () => {
    if (!telegramId) return;
    
    try {
      const response = await fetch(
        `https://toncenter.com/api/v2/getTransactions?address=${WALLET_ADDRESS}&limit=10`
      );
      const data = await response.json();
      
      if (data.ok && data.result) {
        for (const tx of data.result) {
          if (tx.in_msg?.message === telegramId) {
            const amount = Number(tx.in_msg.value) / 1e9;
            const coins = Math.floor(amount * TON_TO_COINS);
            
            const lastCheck = localStorage.getItem('last_tx_lt');
            if (tx.transaction_id.lt > (lastCheck || '0')) {
              setBalance((prev) => prev + coins);
              localStorage.setItem('last_tx_lt', tx.transaction_id.lt);
              toast({
                title: '✅ Пополнение получено!',
                description: `+${coins} монет на ваш баланс`,
              });
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Payment check error:', error);
    }
  };

  const openTopup = () => {
    setShowTopup(true);
  };

  const generatePaymentLink = () => {
    if (!telegramId || !topupAmount) {
      toast({
        title: '⚠️ Ошибка',
        description: 'Укажите Telegram ID и сумму',
        variant: 'destructive',
      });
      return;
    }

    const tonAmount = Number(topupAmount);
    const link = `ton://transfer/${WALLET_ADDRESS}?amount=${tonAmount * 1e9}&text=${telegramId}`;
    window.open(link, '_blank');
    
    toast({
      title: '💎 Ссылка создана!',
      description: 'Откройте кошелёк TON для оплаты',
    });
  };

  const flipCoin = () => {
    if (balance < betAmount || isFlipping) return;

    const newBalance = balance - betAmount;
    setBalance(newBalance);
    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const coinResult: CoinSide = Math.random() > 0.5 ? 'heads' : 'tails';
      const won = coinResult === selectedSide;
      
      setResult(coinResult);
      setIsFlipping(false);

      let finalBalance = newBalance;
      if (won) {
        finalBalance = newBalance + betAmount * 2;
        setBalance(finalBalance);
      }

      const gameResult = { bet: selectedSide, result: coinResult, won, amount: betAmount };
      setHistory((prev) => [gameResult, ...prev.slice(0, 9)]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-3 pb-6">
      <div className="max-w-md mx-auto space-y-3">
        <div className="text-center pt-2 pb-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
            Крипто Флипер
          </h1>
          <p className="text-gray-400 text-sm">Орёл или Решка</p>
        </div>

        <Card className="bg-gray-900/50 border-yellow-500/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-xs">Баланс</p>
              <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                <Icon name="Coins" size={20} />
                {balance}
              </div>
            </div>
            <Button
              onClick={openTopup}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Icon name="Wallet" size={16} className="mr-1" />
              Пополнить
            </Button>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Ставка</label>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {[1, 5, 10, 50].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  size="sm"
                  variant={betAmount === amount ? 'default' : 'outline'}
                  className={`text-xs ${
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
              min="1"
              max={Math.min(balance || 1, 50)}
              step="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Выбери сторону</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setSelectedSide('heads')}
                variant="outline"
                size="sm"
                className={`h-14 ${
                  selectedSide === 'heads'
                    ? 'bg-yellow-500/20 border-yellow-500'
                    : 'border-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl">👑</div>
                  <div className="text-xs">Орёл</div>
                </div>
              </Button>
              <Button
                onClick={() => setSelectedSide('tails')}
                variant="outline"
                size="sm"
                className={`h-14 ${
                  selectedSide === 'tails'
                    ? 'bg-gray-500/20 border-gray-400'
                    : 'border-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs">Решка</div>
                </div>
              </Button>
            </div>
          </div>

          <Button
            onClick={flipCoin}
            disabled={balance < betAmount || isFlipping}
            className="w-full h-12 font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black disabled:opacity-50"
          >
            {isFlipping ? 'Бросаем...' : `Бросить (${betAmount} монет)`}
          </Button>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20 p-4 backdrop-blur-sm">
          <div className="relative flex items-center justify-center py-4">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl ${
                isFlipping ? 'animate-spin-flip' : ''
              } ${
                result === 'heads'
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-xl shadow-yellow-500/50'
                  : result === 'tails'
                  ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-xl shadow-gray-400/50'
                  : 'bg-gradient-to-br from-yellow-400 to-gray-400'
              }`}
            >
              {isFlipping ? (
                <Icon name="Sparkles" size={48} className="text-white animate-pulse" />
              ) : result === 'heads' ? (
                <span>👑</span>
              ) : result === 'tails' ? (
                <span>⚡</span>
              ) : (
                <Icon name="Coins" size={48} className="text-white/80" />
              )}
            </div>
          </div>
          
          {result && !isFlipping && (
            <div className="text-center animate-fade-in">
              <p className={`text-xl font-bold ${
                history[0]?.won ? 'text-green-400' : 'text-red-400'
              }`}>
                {history[0]?.won ? `+${betAmount * 2}` : `-${betAmount}`}
              </p>
            </div>
          )}
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20 p-3 backdrop-blur-sm">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <Icon name="History" size={16} />
            История
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-xs">Пока нет игр</p>
            ) : (
              history.map((game, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-xs ${
                    game.won
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{game.bet === 'heads' ? '👑' : '⚡'}</span>
                      <Icon name="ArrowRight" size={12} className="text-gray-500" />
                      <span className="text-lg">{game.result === 'heads' ? '👑' : '⚡'}</span>
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

        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gray-900/50 border-yellow-500/20 p-2 text-center">
            <p className="text-gray-400 text-xs">Игр</p>
            <p className="text-lg font-bold text-yellow-400">{history.length}</p>
          </Card>
          <Card className="bg-gray-900/50 border-green-500/20 p-2 text-center">
            <p className="text-gray-400 text-xs">Побед</p>
            <p className="text-lg font-bold text-green-400">
              {history.filter((g) => g.won).length}
            </p>
          </Card>
          <Card className="bg-gray-900/50 border-red-500/20 p-2 text-center">
            <p className="text-gray-400 text-xs">Проигр</p>
            <p className="text-lg font-bold text-red-400">
              {history.filter((g) => !g.won).length}
            </p>
          </Card>
        </div>
      </div>

      <Dialog open={showTopup} onOpenChange={setShowTopup}>
        <DialogContent className="bg-gray-900 border-yellow-500/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Пополнение баланса</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Ваш Telegram ID</label>
              <Input
                type="number"
                placeholder="123456789"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Найдите свой ID в боте @userinfobot
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Сумма в TON</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                1 TON = {TON_TO_COINS} монет
              </p>
            </div>

            <div className="bg-gray-800 rounded p-3 text-xs">
              <p className="text-gray-400 mb-2">Адрес кошелька:</p>
              <p className="font-mono text-yellow-400 break-all text-[10px]">{WALLET_ADDRESS}</p>
              <p className="text-gray-400 mt-2">Memo: {telegramId || '(введите Telegram ID)'}</p>
            </div>

            <Button
              onClick={generatePaymentLink}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Открыть TON кошелёк
            </Button>

            <p className="text-xs text-gray-500 text-center">
              После оплаты баланс пополнится автоматически в течение 1 минуты
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
