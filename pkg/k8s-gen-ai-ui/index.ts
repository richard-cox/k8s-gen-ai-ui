import { importTypes } from '@rancher/auto-import';
import { TabLocation, TableColumnLocation } from '@rancher/shell/core/types';
import { IPlugin } from '@shell/core/types';
import { K8SGPT_RESOURCES, K8sGptResult } from './types/resource-types';
import { POD, SERVICE } from '@shell/config/types';

const generateGenAiTableColumn = () => ({
  name: 'k8sgpt-state',
  labelKey: 'result-column.label',
  sort:   false,
  search: false,
  width: '100px',
  getValue: (p: any) => {
    // Note - there's not an easy way to fetch the required resources when we're just injecting a column
    // without overriding the entire list...
    if (!p?.$getters?.['haveAll']) {
      return;
    }

    if (!p.$getters['haveAll'](K8SGPT_RESOURCES.RESULT)) {
      p.$dispatch('findAll', {
        type: K8SGPT_RESOURCES.RESULT
      })

      return;
    }

    const k8sgptName = p.metadata.namespace + '/' + p.metadata.name;
    const results = p?.$getters?.['all'](K8SGPT_RESOURCES.RESULT);
    // Note - this isn't performant
    // - a local service which provided a map of resource -- result would be great, but how do we watch for updates (plumbing between service and sockets)?
    // - could override the model and provide helper, but there be dragons
    const result = results?.find((r: K8sGptResult) => r.spec.name === k8sgptName);
    return result?.specState
  },
  formatter:     'ResultState',
  formatterOpts: {
    arbitrary: true,
  }
})

const generateGenAiTab = () => ({
  name: 'k8sgpt',
  labelKey: 'result-tab.label',
  component: () => import('./components/k8s-result-tab.vue'),
})

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  plugin.addTableColumn(TableColumnLocation.RESOURCE, { resource: [POD, SERVICE] }, generateGenAiTableColumn());
  plugin.addTab(TabLocation.RESOURCE_DETAIL, { resource: [POD, SERVICE] }, generateGenAiTab())
}
