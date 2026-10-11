// Parts the quote from the input: a rule that joins the box's own border at both ends (`├──┤`),
// so the box reads as one with two compartments. The negative margins reach it over the border
// columns; it is coloured like the border (see focus and blur) and shown with the quote.
Text({ fg: config.theme.border, flexShrink: 0, wrapMode: 'none', marginX: -1, visible: false });
