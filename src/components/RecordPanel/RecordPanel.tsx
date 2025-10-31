/**
 * Record panel for user's best score
 * 
 * @author Stanislav Snisar
 * @version 1.0.0
 * @created 07.2024
 * @module components/RecordPanel
 */

import './RecordPanel.scss';

export function RecordPanel({ currentRecord }: { currentRecord: number }) {
  return (<div id="record-panel" className="widget">Current record: {currentRecord}</div>);
}