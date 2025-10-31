/**
 * Tipps panel for user's keyboard control
 * 
 * @author Stanislav Snisar
 * @version 1.0.0
 * @created 07.2024
 * @module src/components/TippsPanel
 */

import './TippsPanel.scss';

export function TippsPanel() {
  //const [someState, setSomeState] = useState(initialValue);

  return (<div id="tipps-panel" className="widget">
    <img src="control-tipps.png" alt="User control tipps" />
  </div>);
}
