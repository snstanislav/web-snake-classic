import './PauseBar.scss';

export function PauseBar({ msg }: { msg: string }) {
  return (<div id="pause-bar">{msg}</div>);
}