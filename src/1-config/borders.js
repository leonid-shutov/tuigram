// Frame style for every panel and bubble. `asciiBorders` is the escape hatch for terminals
// whose font has no box-drawing coverage: `"asciiBorders": true` in config.json.
const styles = ['rounded', 'heavy', 'single', 'double'];
const configuredStyle = source.borderStyle;

const ascii = {
  topLeft: '+',
  topRight: '+',
  bottomLeft: '+',
  bottomRight: '+',
  horizontal: '-',
  vertical: '|',
  topT: '+',
  bottomT: '+',
  leftT: '+',
  rightT: '+',
  cross: '+',
};

// The cursor thickens a bubble's outline rather than filling it. A fill cannot work here: a
// terminal paints whole cells, the bubble's outer ring of cells *is* its border, so filling
// them paints above and below the stroke, and not filling them leaves a one-row stripe.
// Thickness is a shape cue, which is also what a border that only changed hue was missing.
const asciiHeavy = {
  ...ascii,
  topLeft: '#',
  topRight: '#',
  bottomLeft: '#',
  bottomRight: '#',
  horizontal: '=',
  vertical: '#',
};
const style = styles.some((candidate) => candidate === configuredStyle) ? configuredStyle : 'rounded';

({
  style,
  chars: source.asciiBorders === true ? ascii : undefined,
  // Heavy is the thickest set, so a heavy frame has to reach for double instead.
  cursorChars:
    source.asciiBorders === true ? asciiHeavy : style === 'heavy' ? tui.BorderChars.double : tui.BorderChars.heavy,
});
