import './RecordPanel.scss';

export function RecordPanel({ currentRecord }: { currentRecord: number }) {
  return (<div id="record-panel" className="widget">Current record: {currentRecord}</div>);
}