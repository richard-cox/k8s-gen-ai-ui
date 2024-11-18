import { importTypes } from '@rancher/auto-import';
import { TabLocation, TableColumnLocation } from '@rancher/shell/core/types';
import { IPlugin } from '@shell/core/types';
import { K8SGPT_RESOURCES, K8sGptResult } from './types/resource-types';
import { POD } from '@shell/config/types';

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  plugin.addTableColumn(TableColumnLocation.RESOURCE, {
    resource: [K8SGPT_RESOURCES.RESULT],
  }, {
    name: 'name',
    labelKey: 'results.table.result-column.name',
    sort:          ['spec.name'],
    search: ['spec.name'],
    getValue: (r: K8sGptResult) => {
      const [namespace, name] = r.spec.name.split('/')
      return {  
        kind: r.spec.kind,
        name,
        namespace,
      }
    },
    formatter:     'InvolvedObjectLink',
  });

  plugin.addTab(
    TabLocation.RESOURCE_DETAIL
    ,{
      resource: [POD],
    }, {
      name: 'k8sgpt',
      labelKey: 'pod.result.tab-label',
      component: () => import('./components/k8s-result-tab.vue'),
    }
  )

  // Load a product
  // plugin.addProduct(require('./product'));
}
