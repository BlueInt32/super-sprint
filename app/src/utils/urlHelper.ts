import settings from '../settings.ts';

type QueryConfig = {
  track: number;
  cars: number[];
  debug?: boolean | string;
};

type ParsedQueryParams = {
  [key: string]: string;
};

const urlHelper = {
  loadQueryConfig(): QueryConfig {
    const urlParams = this.parseQueryString();
    const queryParams: QueryConfig = {
      track: settings.defaultSetup.trackId,
      cars: settings.defaultSetup.carIds
    };

    if (urlParams.hasOwnProperty('track')) {
      queryParams.track = parseInt(urlParams.track, 10);
    }

    if (urlParams.hasOwnProperty('cars')) {
      queryParams.cars = urlParams.cars.split(',').map((id) => parseInt(id, 10));
    }

    if (urlParams.hasOwnProperty('debug')) {
      queryParams.debug = urlParams.debug;
    }

    return queryParams;
  },

  parseQueryString(): ParsedQueryParams {
    const assoc: ParsedQueryParams = {};
    const keyValues = location.search.slice(1).split('&');
    const decode = (s: string) => decodeURIComponent(s.replace(/\+/g, ' '));

    for (const val of keyValues) {
      const key = val.split('=');
      if (key.length > 1) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    }
    return assoc;
  }
};

export default urlHelper;
export type { QueryConfig };