import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

export default class GoogleChartsService extends Service {
  @tracked loaded = false;

  async load() {
    await this.loadTask.perform();
  }

  @(task(function* () {
    let api = yield loadJsApi();
    yield loadCoreChart(api);
    this.loaded = true;
    document.dispatchEvent(createEvent('googleChartsLoaded'));
  }).drop())
  loadTask;
}

async function loadScript(src) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function loadJsApi() {
  if (!window.google) {
    await loadScript('https://www.google.com/jsapi');
  }
  return window.google;
}

async function loadCoreChart(api) {
  await new Promise(resolve => {
    api.load('visualization', '1.0', {
      packages: ['corechart'],
      callback: resolve,
    });
  });
}

function createEvent(name) {
  let event = document.createEvent('Event');
  event.initEvent(name, true, true);
  return event;
}
