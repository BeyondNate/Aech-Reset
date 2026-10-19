function parseUTC(fechaString) {
  if (!fechaString) return null;
  return new Date(fechaString.endsWith('Z') ? fechaString : fechaString + 'Z');
}

module.exports = { parseUTC };