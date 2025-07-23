import './SpeedScorePanel.scss';

export function SpeedScorePanel({ speed, score }: { speed: number, score: number }) {
  return (<div id="speed-score-panel" className="widget">
    <p>Current game</p><br /><br />
    <div>Speed: <span id="speed-label">{!speed ? '' : speed}</span></div>
    <div>Score: <span id="score-label">{score}</span></div>
  </div>);
}