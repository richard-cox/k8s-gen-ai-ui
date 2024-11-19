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
    const store = (this as any).$store as Store<any>;

    const results: K8sGptResult[] = await store.dispatch('cluster/findAll', {
      type: K8SGPT_RESOURCES.RESULT
    })
    const namespaceName = this.resource.namespace + '/' + this.resource.name

    this.result = results.find(r => r.spec.name === namespaceName)
  },

  data() {
    return {
      result: undefined as K8sGptResult | undefined,
      $store: undefined as Store<any> | undefined,
      $route: undefined as any | undefined,
    }
  },

  computed: {
    resultLink(): any {
      return {
        name:   'c-cluster-product-resource-id',
        params: {
          cluster:  this.$route?.params.cluster,
          product:  this.$store?.getters['productId'],
          resource: K8SGPT_RESOURCES.RESULT,
          id:       this.result?.id
        }
      }
    }
  }
})

</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else-if="result" class="text">
    <div v-if="result?.spec.error?.length" class="section errors ">
      <h4 class="label"><i class="icon icon-lg icon-error text-error" /> {{t('result-tab.errors')}}: </h4>
      <div class="content" v-for="e in result?.spec.error" v-clean-html="e.text.replaceAll('\n', '<br><br>')"/>
    </div>
    <div  class="section ">
      <h4 class="label"><i class="icon icon-lg icon-info-circle text-info" /> {{t('result-tab.details')}}:</h4>
      <div class="content" v-clean-html="result?.spec.details.replaceAll('\n', '<br><br>')"/>
    </div>
    <div  class="section ">
      <router-link v-if="resultLink" :to="resultLink" >{{t('result-tab.nativeLink')}}</router-link>
    </div>
  </div>
  <div v-else v-t="'result-tab.noState'"></div>
</template>

<style lang="scss" scoped>
.text {

  .section:not(:last-of-type) {
    margin-bottom: 20px;
  }

  .label {
    display: flex;
    align-items: center;
    height: 30px;

    i {
      margin-right: 5px
    }
  }

  .content {
    margin-left: 26px;
  }
}
</style>