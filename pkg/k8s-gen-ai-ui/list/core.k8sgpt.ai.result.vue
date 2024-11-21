<script >
import { defineComponent } from 'vue';
import ResourceTable from '@shell/components/ResourceTable.vue';
// Note - cannot component cannot be type="ts" because line below has no typing so failing build (requires line in type-gen)
import ResourceFetch from '@shell/mixins/resource-fetch';
import {
  NAME as NAME_COL, AGE
} from '@shell/config/table-headers';

export default defineComponent({
  name: 'k8sgpt-result-list',

  components: {
    ResourceTable
  },

  mixins:     [ResourceFetch],

  props: {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:     Object,
      required: true,
    },
    useQueryParamsForSimpleFiltering: {
      type:    Boolean,
      default: false
    }
  },

  async fetch() {
    await this.$fetchType(this.resource);
  },

  data() {
    return {
      headers: [
        {
          name:       'resource-link',
          labelKey:   'results.table.columns.object',
          sort:       ['spec.name'],
          search:     ['spec.name'],
          value:      'resource',
          formatter:  'InvolvedObjectLink',
        },
        {
          name:        'kind',
          labelKey:    'results.table.columns.kind',
          value:       'spec.kind',
          sort: ['spec.kind'],
          search: ['spec.kind'],
        },
        {
          ...NAME_COL,
          labelKey: 'results.table.columns.name',
        },
        {
          name:        'backend',
          labelKey:    'results.table.columns.backend',
          value:       'spec.backend',
          sort: ['spec.backend'],
          search: ['spec.backend'],
        },
        {
          name:        'lifecycle',
          labelKey:    'results.table.columns.lifecycle',
          value:       'status.lifecycle',
          sort: ['spec.lifecycle'],
          search: ['spec.lifecycle'],
        },
        AGE
      ]
    }
  }
})

</script>

<template>
  <ResourceTable
    :headers="headers"
    :schema="schema"
    :rows="rows"
    :loading="loading"
    :use-query-params-for-simple-filtering="useQueryParamsForSimpleFiltering"
    :force-update-live-and-delayed="forceUpdateLiveAndDelayed"
  />
</template>
