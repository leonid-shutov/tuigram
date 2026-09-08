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

({
  style: styles.some((style) => style === configuredStyle) ? configuredStyle : 'rounded',
  chars: source.asciiBorders === true ? ascii : undefined,
});
