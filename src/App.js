import React, { useState } from 'react';
import { Trophy, Play, RotateCcw, Plus, Trash2, UserPlus } from 'lucide-react';

const DeFAIClash = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);

  const pools = [
    { id: 'A', name: 'Pool A', apr: 5, lossChance: 0, loss: 0 },
    { id: 'B', name: 'Pool B', apr: 10, lossChance: 50, loss: 10 },
    { id: 'C', name: 'Pool C', apr: { min: -25, max: 25 }, lossChance: 0, loss: 'Random' },
    { id: 'D', name: 'Pool D', apr: 15, lossChance: 30, loss: 15 }
  ];

  const [currentYear, setCurrentYear] = useState(0);
  const [maxYears, setMaxYears] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundResults, setRoundResults] = useState(null);

  const addPlayer = () => {
    if (newPlayerName.trim() === '') return;
    
    const newPlayer = {
      id: Date.now(),
      name: newPlayerName.trim(),
      balance: 1000,
      poolChoice: null,
      yearResults: []
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const updatePlayerName = (playerId, newName) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, name: newName } : p
    ));
    setEditingPlayer(null);
  };

  const handlePoolSelection = (playerId, poolId) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, poolChoice: poolId } : p
    ));
  };

  const runYear = () => {
    if (currentYear >= maxYears) return;

    // Calculate pool outcomes once per pool
    const poolOutcomes = {};
    
    pools.forEach(pool => {
      if (pool.id === 'A') {
        poolOutcomes[pool.id] = pool.apr / 100;
      } else if (pool.id === 'B') {
        const loses = Math.random() < (pool.lossChance / 100);
        poolOutcomes[pool.id] = loses ? -(pool.loss / 100) : (pool.apr / 100);
      } else if (pool.id === 'C') {
        const randomYield = Math.random() * (pool.apr.max - pool.apr.min) + pool.apr.min;
        poolOutcomes[pool.id] = randomYield / 100;
      } else if (pool.id === 'D') {
        const loses = Math.random() < (pool.lossChance / 100);
        poolOutcomes[pool.id] = loses ? -(pool.loss / 100) : (pool.apr / 100);
      }
    });

    const results = players.map(player => {
      if (!player.poolChoice) {
        return {
          ...player,
          gain: 0,
          newBalance: player.balance,
          pool: 'None',
          apr: 0
        };
      }

      const pool = pools.find(p => p.id === player.poolChoice);
      const outcomeRate = poolOutcomes[player.poolChoice];
      const gain = player.balance * outcomeRate;
      const newBalance = player.balance + gain;

      return {
        ...player,
        gain: gain,
        newBalance: newBalance,
        pool: pool.name,
        apr: outcomeRate * 100
      };
    });

    setRoundResults(results);
    setPlayers(results.map(r => ({
      ...r,
      balance: r.newBalance,
      poolChoice: null,
      yearResults: [...r.yearResults, { year: currentYear + 1, gain: r.gain, pool: r.pool }]
    })));
    
    setCurrentYear(currentYear + 1);
  };

  const startGame = () => {
    if (players.length === 0) {
      alert('Por favor adicione pelo menos um jogador!');
      return;
    }
    setGameStarted(true);
    setCurrentYear(0);
    setRoundResults(null);
  };

  const resetGame = () => {
    setPlayers(players.map(p => ({
      ...p,
      balance: 1000,
      poolChoice: null,
      yearResults: []
    })));
    setCurrentYear(0);
    setGameStarted(false);
    setRoundResults(null);
  };

  const endGameEarly = () => {
    setCurrentYear(maxYears);
  };

  const getLeaderboard = () => {
    return [...players]
      .sort((a, b) => b.balance - a.balance)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));
  };

  const allPlayersSelected = players.every(p => p.poolChoice !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black text-center py-6 rounded-lg mb-8 border-2 border-green-500">
          <h1 className="text-5xl font-bold text-green-400 flex items-center justify-center gap-4">
            DeFAI Clash ⚡
          </h1>
          <p className="text-green-300 mt-2">Decentralized Finance AI Challenge</p>
          <p className="text-green-400 text-sm mt-1">Powered by Rivalz Network</p>
        </div>

        {!gameStarted ? (
          // Setup Phase
          <div className="space-y-6">
            {/* Game Settings */}
            <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Configurações do Jogo</h2>
              <div className="flex items-center gap-4">
                <label className="text-green-400">Anos Máximos:</label>
                <select 
                  value={maxYears} 
                  onChange={(e) => setMaxYears(Number(e.target.value))}
                  className="bg-gray-700 text-white px-4 py-2 rounded border border-green-500"
                >
                  <option value={3}>3 Anos</option>
                  <option value={4}>4 Anos</option>
                  <option value={5}>5 Anos</option>
                </select>
              </div>
            </div>

            {/* Add Players */}
            <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <UserPlus size={24} /> Adicionar Jogadores
              </h2>
              
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  placeholder="Digite o nome do jogador..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded border border-green-500 focus:outline-none focus:border-green-400"
                />
                <button
                  onClick={addPlayer}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold"
                >
                  <Plus size={20} /> Adicionar
                </button>
              </div>

              <div className="mb-4 text-green-300">
                Total de Jogadores: <span className="font-bold text-xl">{players.length}</span>
              </div>

              {players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {players.map((player) => (
                    <div key={player.id} className="bg-gray-700 p-3 rounded flex items-center justify-between border border-green-500">
                      {editingPlayer === player.id ? (
                        <input
                          type="text"
                          defaultValue={player.name}
                          autoFocus
                          onBlur={(e) => updatePlayerName(player.id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updatePlayerName(player.id, e.target.value);
                            }
                          }}
                          className="flex-1 bg-gray-600 text-white px-2 py-1 rounded"
                        />
                      ) : (
                        <div 
                          className="flex-1 text-green-300 font-medium cursor-pointer hover:text-green-200"
                          onClick={() => setEditingPlayer(player.id)}
                        >
                          {player.name}
                        </div>
                      )}
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-600 rounded">
                  Nenhum jogador adicionado ainda. Adicione jogadores para começar!
                </div>
              )}
            </div>

            {/* Pool Information */}
            <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Informações dos Pools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pools.map(pool => (
                  <div key={pool.id} className="bg-gray-700 p-4 rounded border border-green-500">
                    <div className="text-xl font-bold text-green-400 mb-2">Pool {pool.id}</div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>
                        <span className="font-semibold">APR:</span>{' '}
                        {typeof pool.apr === 'object' 
                          ? `${pool.apr.min}% a ${pool.apr.max}%` 
                          : `${pool.apr}%`}
                      </div>
                      <div>
                        <span className="font-semibold">Risco:</span>{' '}
                        {pool.id === 'C' 
                          ? 'Aleatório' 
                          : pool.lossChance === 0 
                            ? 'Sem risco' 
                            : `${pool.lossChance}% de chance`}
                      </div>
                      {pool.loss !== 0 && pool.id !== 'C' && (
                        <div>
                          <span className="font-semibold">Perda:</span> {pool.loss}%
                        </div>
                      )}
                      {pool.id === 'C' && (
                        <div>
                          <span className="font-semibold">Perda:</span> Aleatório
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-12 py-4 rounded-lg text-xl font-bold flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
              >
                <Play size={24} /> Começar Jogo
              </button>
            </div>
          </div>
        ) : (
          // Game Phase
          <>
            {/* Game Controls */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-green-500">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-green-400">
                    <div className="text-sm">Ano Atual:</div>
                    <div className="text-3xl font-bold">{currentYear} / {maxYears}</div>
                  </div>
                  <div className="text-green-400">
                    <div className="text-sm">Total de Jogadores:</div>
                    <div className="text-3xl font-bold">{players.length}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={runYear}
                    disabled={currentYear >= maxYears || !allPlayersSelected}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold disabled:cursor-not-allowed"
                  >
                    <Play size={20} /> Executar Ano {currentYear + 1}
                  </button>
                  {currentYear < maxYears && currentYear > 0 && (
                    <button
                      onClick={endGameEarly}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold"
                    >
                      Finalizar Jogo
                    </button>
                  )}
                  <button
                    onClick={resetGame}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold"
                  >
                    <RotateCcw size={20} /> Resetar
                  </button>
                </div>
              </div>

              {!allPlayersSelected && currentYear < maxYears && (
                <div className="mt-4 bg-yellow-900 text-yellow-200 p-3 rounded">
                  ⚠️ Todos os jogadores devem selecionar um pool antes de executar o ano!
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Player Selection */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Seleção de Pool dos Jogadores</h2>
                  
                  {/* Pool Legend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {pools.map(pool => (
                      <div key={pool.id} className="bg-gray-700 p-3 rounded border border-green-500">
                        <div className="font-bold text-green-400">Pool {pool.id}</div>
                        <div className="text-xs text-gray-300">
                          Retorno: {typeof pool.apr === 'object' ? `${pool.apr.min}% a ${pool.apr.max}%` : `${pool.apr}%`}
                        </div>
                        <div className="text-xs text-gray-300">
                          Perda: {pool.lossChance}% chance
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Players Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {players.map(player => (
                      <div key={player.id} className="bg-gray-700 p-3 rounded">
                        <div className="font-bold text-green-300 mb-2 truncate" title={player.name}>
                          {player.name}
                        </div>
                        <div className="text-sm text-gray-300 mb-2">${player.balance.toFixed(2)}</div>
                        <select
                          value={player.poolChoice || ''}
                          onChange={(e) => handlePoolSelection(player.id, e.target.value)}
                          disabled={currentYear >= maxYears}
                          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-green-500"
                        >
                          <option value="">Selecionar Pool</option>
                          {pools.map(pool => (
                            <option key={pool.id} value={pool.id}>Pool {pool.id}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Round Results */}
                {roundResults && (
                  <div className="bg-gray-800 rounded-lg p-6 mt-6 border border-green-500">
                    <h2 className="text-2xl font-bold text-green-400 mb-4">
                      Resultados do Ano {currentYear}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-500">
                            <th className="text-left text-green-400 p-2">Jogador</th>
                            <th className="text-left text-green-400 p-2">Pool</th>
                            <th className="text-right text-green-400 p-2">APR</th>
                            <th className="text-right text-green-400 p-2">Ganho/Perda</th>
                            <th className="text-right text-green-400 p-2">Novo Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roundResults.map(result => (
                            <tr key={result.id} className="border-b border-gray-700">
                              <td className="p-2 text-green-300">{result.name}</td>
                              <td className="p-2 text-gray-300">{result.pool}</td>
                              <td className={`p-2 text-right font-bold ${result.apr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {result.apr >= 0 ? '+' : ''}{result.apr.toFixed(2)}%
                              </td>
                              <td className={`p-2 text-right font-bold ${result.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {result.gain >= 0 ? '+' : ''}${result.gain.toFixed(2)}
                              </td>
                              <td className="p-2 text-right text-white font-bold">
                                ${result.newBalance.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg p-6 border border-green-500 sticky top-8">
                  <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-400" /> Classificação
                  </h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getLeaderboard().map((player, idx) => (
                      <div 
                        key={player.id}
                        className={`p-3 rounded flex items-center justify-between ${
                          idx === 0 ? 'bg-yellow-600' : 
                          idx === 1 ? 'bg-gray-600' : 
                          idx === 2 ? 'bg-orange-700' : 
                          'bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-xl font-bold text-white w-6">
                            {player.rank}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white truncate" title={player.name}>
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-300">${player.balance.toFixed(2)}</div>
                          </div>
                        </div>
                        {idx < 3 && <Trophy size={20} className="text-yellow-300 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {currentYear >= maxYears && (
                    <div className="mt-6 bg-green-600 p-4 rounded text-center">
                      <div className="text-2xl font-bold text-white mb-2">🏆 Fim de Jogo!</div>
                      <div className="text-white">
                        Vencedor: {getLeaderboard()[0].name}
                      </div>
                      <div className="text-white font-bold">
                        ${getLeaderboard()[0].balance.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeFAIClash;