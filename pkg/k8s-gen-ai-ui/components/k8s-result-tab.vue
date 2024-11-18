<script lang="ts">
import { K8SGPT_RESOURCES, K8sGptResult } from '../types/resource-types';
import { defineComponent } from 'vue';
import Loading from '@shell/components/Loading.vue';
import { Store } from 'vuex';


export default defineComponent({
  components: {
    Loading,
  },

  props: {
    resource: {
      type:    Object,
      default: () => ({})
    }
  },

  async fetch() {
    // const store = this.resource. this .$store as unknown as Store<any>;
      const store = (this as any).$store as Store<any>;

    const namespaceName = this.resource.namespace + '/' + this.resource.name

    const results: K8sGptResult[] = await store.dispatch('cluster/findAll', {
      type: K8SGPT_RESOURCES.RESULT
    })
    const result = results.find(r => r.spec.name === namespaceName)

    this.result = result
  },

  data() {
    return {
      result: undefined as K8sGptResult | undefined
    }
  }
})

</script>

<template>
  
  <Loading v-if="$fetchState.pending" /><!-- TODO: RC context -->
  <div v-else>
    <div v-for="e in result?.spec.error" v-clean-html="e.text.replaceAll('\n', '<br><br>')"/>
    <br><br>

    <div v-clean-html="result?.spec.details.replaceAll('\n', '<br><br>')"/>
  </div>
</template>

<style lang="scss" scoped>
</style>