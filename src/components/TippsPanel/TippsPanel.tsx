import './TippsPanel.scss';

export function TippsPanel() {
  //const [someState, setSomeState] = useState(initialValue);

  return (<div id="tipps-panel" className="widget">
    <pre>&nbsp;&nbsp;&nbsp;&nbsp;W or &uarr;<br /><br />
      A or &larr;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&rarr; or D<br /><br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr; or S
    </pre>
  </div>);
}
