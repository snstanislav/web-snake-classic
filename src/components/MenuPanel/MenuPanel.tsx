import React, { useContext, useState, useRef } from 'react';
import { LevelSleepIntervals, GameContext } from '../../GameContext';
import './MenuPanel.scss';

export function MenuPanel({ startGameLoop, pause, refreshRecordPanel }: { startGameLoop: any, pause: any, refreshRecordPanel: any }) {
  const gameContext = useContext(GameContext);

  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState<number | null>(LevelSleepIntervals.First);
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });

  const toogleBtnRef = useRef<HTMLButtonElement | null>(null);

  const toogleDialog = () => {
    if (toogleBtnRef.current) {
      const toogleBtnRect = toogleBtnRef.current.getBoundingClientRect();
      setDialogPosition({ top: toogleBtnRect.bottom + 1, left: toogleBtnRect.left });
      if (gameContext?.isKeyPressAllowed.current) {
        pause();
      }
      !isDialogOpened ? setIsDialogOpened(true) : setIsDialogOpened(false);
    }
  }

  const closeDialog = () => setIsDialogOpened(false);

  const handleConfirm = () => {
    if (selectedSpeed !== null && gameContext) {
      gameContext.initGame(selectedSpeed);
      startGameLoop();
    }
    closeDialog();
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSpeed(parseInt(e.target.value, 10));
  }

  const clearRecord = () => {
    if (window.confirm("\n\nYou're trying to delete your current game record.\n\nAre you sure?!")) {
      localStorage.setItem("bestScore", "0");
      if (gameContext && gameContext.currentRecord.current) {
        gameContext.currentRecord.current = 0;
        refreshRecordPanel(0);
      }
    }
  };

  return (<div id="menu-panel" className="widget">
    <button ref={toogleBtnRef} onClick={toogleDialog}>Start new game</button>

    {isDialogOpened && (<div style={{
      position: 'absolute',
      top: `${dialogPosition.top}px`,
      left: `${dialogPosition.left}px`
    }} id="level-dialog-wraper" >
      <p>Choose speed</p>
      {
        Object.values(LevelSleepIntervals).filter(value => typeof value === "number").map((speed, index) => (
          <label key={speed}>
            <input type="radio" id={`lvl${index + 1}`} name="lvl" value={speed} checked={selectedSpeed === speed} onChange={handleRadioChange} />
            Level {index + 1}</label>
        ))}
      <div>
        <button id="level-dialog-confirm" onClick={handleConfirm}>Ok</button>
        <button id="level-dialog-cancel" onClick={closeDialog}>Cancel</button>
      </div>
    </div>)}

    <button onClick={clearRecord}>Clear record</button>
  </div>);
}