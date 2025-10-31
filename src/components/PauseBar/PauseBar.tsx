/**
 * Pause text bar
 * 
 * @author Stanislav Snisar
 * @version 1.0.0
 * @created 07.2024
 * @module components/PauseBar
 */

import './PauseBar.scss';

export function PauseBar({ msg }: { msg: string }) {
  return (<div id="pause-bar">{msg}</div>);
}