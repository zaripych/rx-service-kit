import { IServiceConfig } from './shared';
import { createTestEpic } from './testEpic';

const config: IServiceConfig = {
  defaultPort: 4010,

  spy: async spy => {
    spy.log(/debug-.*/);
  },

  sockets: async () => {
    return {
      '/events': createTestEpic(),
      '/binary-performance-test': createTestEpic(),
    };
  },
};

export default config;
