/**
 * SIEM/target icon + brand-colour metadata.
 *
 * SVGs are imported as raw strings (`?raw`) so they can be inlined with
 * `v-html` and tinted via `color` (the brand SVGs use `fill="currentColor"`).
 * Icons are sourced from detection.studio.
 */
import splunk from "../assets/siem/splunk.svg?raw";
import elasticsearch from "../assets/siem/elasticsearch.svg?raw";
import grafana from "../assets/siem/grafana.svg?raw";
import quickwit from "../assets/siem/quickwit.svg?raw";
import kql from "../assets/siem/kql.svg?raw";
import secops from "../assets/siem/secops.svg?raw";
import crowdstrike from "../assets/siem/crowdstrike.svg?raw";
import panther from "../assets/siem/panther.svg?raw";
import opensearch from "../assets/siem/opensearch.svg?raw";
import sqlite from "../assets/siem/sqlite.svg?raw";

/**
 * Per-target metadata keyed by the pySigma target id.
 * `color` is applied via inline style so the `currentColor` SVGs are tinted.
 */
export const SIEM_META = {
  splunk: { svg: splunk, color: "#74B036" },
  esql: { svg: elasticsearch, color: "#23BBB1" },
  lucene: { svg: elasticsearch, color: "#23BBB1" },
  eql: { svg: elasticsearch, color: "#23BBB1" },
  opensearch: { svg: opensearch, color: null },
  loki: { svg: grafana, color: "#F49D2A" },
  log_scale: { svg: crowdstrike, color: null },
  kusto: { svg: kql, color: null },
  panther: { svg: panther, color: null },
  quickwit: { svg: quickwit, color: null },
  secops: { svg: secops, color: null },
  sqlite: { svg: sqlite, color: null },
};

export function siemMeta(id) {
  return SIEM_META[id] || null;
}
