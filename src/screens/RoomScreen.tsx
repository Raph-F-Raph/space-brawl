import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/Ui';
import { useGame } from '../lib/GameContext';
import { makeStats } from '../game/engine';
import { MAX_HUMANS, Room, newCode, type LobbyPlayer } from '../lib/room';
import type { OnlineSession } from './ArenaScreen';

export function RoomScreen({ onBack, onStart }: { onBack: () => void; onStart: (s: OnlineSession) => void }) {
  const { character, ship, charLevel, shipLevel, profile } = useGame();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handedOver = useRef(false); // true quand la partie démarre : l'écran de jeu garde le salon
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    return () => {
      if (!handedOver.current) void roomRef.current?.leave();
    };
  }, []);

  if (!character || !ship) return null;
  const me = { name: profile?.username ?? 'Pilote', stats: makeStats(character, ship, charLevel, shipLevel) };

  async function open(isHost: boolean, roomCode: string) {
    setBusy(true);
    setError(null);
    const r = new Room(roomCode, isHost, me);
    roomRef.current = r;
    r.on('lobby', (list) => setPlayers(list));
    r.on('hostLeft', () => {
      setError("L'hôte a fermé le salon.");
      void r.leave();
      roomRef.current = null;
      setRoom(null);
      setPlayers([]);
    });
    if (!isHost) {
      r.on('start', (m) => {
        const myId = m.ids[r.key];
        if (myId === undefined) return;
        handedOver.current = true;
        onStart({ room: r, role: 'guest', myId, seed: m.seed, start: m });
      });
    }
    const err = await r.join();
    setBusy(false);
    if (err) {
      setError(err);
      roomRef.current = null;
      return;
    }
    setRoom(r);
  }

  function launch() {
    if (!room) return;
    const ids = room.assignIds();
    const humans = room.players
      .filter((p) => ids[p.key] !== undefined)
      .map((p) => ({ id: ids[p.key], name: p.name, stats: p.stats }));
    handedOver.current = true;
    onStart({ room, role: 'host', myId: 0, seed: Math.floor(Math.random() * 1e9), humans, ids });
  }

  async function leave() {
    await roomRef.current?.leave();
    roomRef.current = null;
    setRoom(null);
    setPlayers([]);
  }

  return (
    <div className="screen">
      <TopBar title="Salon entre amis" onBack={room ? () => void leave() : onBack} />
      <div className="scroll">
        {!room && (
          <div className="room-menu">
            <p className="legend">
              Joue en ligne avec tes amis (jusqu'à {MAX_HUMANS} pilotes). Les robots complètent les places vides pour arriver à 8.
            </p>
            {error && <p className="room-error">{error}</p>}
            <button className="btn btn-yellow" disabled={busy} onClick={() => void open(true, newCode())}>
              Créer un salon
            </button>
            <div className="room-join">
              <input
                className="room-code-input"
                value={code}
                maxLength={4}
                placeholder="CODE"
                autoCapitalize="characters"
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              />
              <button className="btn btn-blue" disabled={busy || code.length !== 4} onClick={() => void open(false, code)}>
                Rejoindre
              </button>
            </div>
            {busy && <div className="loader" />}
          </div>
        )}

        {room && (
          <div className="room-lobby">
            <p className="legend">{room.isHost ? 'Donne ce code à tes amis :' : 'Tu as rejoint le salon :'}</p>
            <div className="room-code">{room.code}</div>
            <ul className="board">
              {players.map((p, i) => (
                <li key={p.key} className={`board-row ${p.key === room.key ? 'me' : ''}`}>
                  <span className="board-rank">{p.host ? '👑' : `${i + 1}`}</span>
                  <span className="board-name">{p.name}</span>
                  <span className="board-score">{p.key === room.key ? 'Toi' : ''}</span>
                </li>
              ))}
            </ul>
            {room.isHost ? (
              <>
                <button className="btn btn-green" disabled={players.length < 2} onClick={launch}>
                  Lancer la partie
                </button>
                {players.length < 2 && <p className="legend">Attends qu'au moins un ami rejoigne le salon.</p>}
              </>
            ) : (
              <p className="legend">En attente du lancement par l'hôte…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
