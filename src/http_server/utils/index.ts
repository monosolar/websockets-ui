export const getMessagePayload = (message: string) => {
  const payload = JSON.parse(message);
  payload.data = JSON.parse(payload?.data || '{}');

  return payload;
};

export const getPayloadByMessage = (payload: Record<string, any>) => {
  const message = JSON.stringify({
    ...payload,
    data: JSON.stringify(payload?.data || {}),
    id: 0,
  });

  return message;
};

export const getUuid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4() + s4()}-${s4()}`;
};

export const getIntRandom = (value: number) =>
  Math.floor(Math.random() * value);

/* export const getShipDecks = ({ position, direction, length, type }) => {
  const decks = new Set([]);

  switch (type) {
    case 'small':
      decks.add(position);
      break;
    case 'medium':
      break;
    case 'large':
      break;
    case 'huge':
      break;

    default:
      // eslint-disable-next-line no-unused-expressions
      null;
  }

  const decks = new Set([{ x: 1, y: 1 }]);

  return decks;
};
 */
