import {
  differenceBy,
  flatten, get, groupBy, includes, keys, map, shuffle,
} from 'lodash';
import PandaBridge from 'pandasuite-bridge';

import './index.css';

let properties = null;

PandaBridge.init(() => {
  PandaBridge.onLoad((pandaData) => {
    properties = pandaData.properties;
  });

  PandaBridge.onUpdate((pandaData) => {
    properties = pandaData.properties;
  });

  PandaBridge.listen('search', ([args]) => {
    const { source, limit, intruder } = properties;
    const { symbole } = args;

    if (source && symbole) {
      const registre = groupBy(source, (item) => get(item, 'fields.registre'));
      const nbToTake = Math.max(1, Math.floor((limit * (1 - intruder)) / keys(registre).length));

      const result = flatten(map(registre, (items) => shuffle(items.filter((item) => includes(get(item, 'fields.symbole'), symbole))).slice(0, nbToTake)));
      const nbToFill = limit - result.length;

      const queryable = {
        results: shuffle(result.concat(shuffle(differenceBy(source, result, 'id')).slice(0, nbToFill))),
      };

      PandaBridge.send('results', [queryable]);
      PandaBridge.send(PandaBridge.UPDATED, {
        queryable,
      });
    }
  });
});
