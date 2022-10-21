import type { App, Plugin } from 'vue';
import Component from './Component.vue';

const Plugin = (app: App, params: any) => {
  let name = 'flat-pickr';
  /* istanbul ignore else */
  if (typeof params === 'string') name = params;

  app.component(name, Component);
};

Component.install = Plugin;

export default Component as typeof Component & Plugin;
