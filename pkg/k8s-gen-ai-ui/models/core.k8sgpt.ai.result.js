// Note - cannot be ts because line below has no typing so failing build (requires line in type-gen)
// import SteveModel from  '@shell/plugins/steve/steve-class';
import SteveModel from '@shell/plugins/steve/steve-class'
import { STATES_ENUM, colorForState, stateDisplay } from '@shell/plugins/dashboard-store/resource-class';

export default class K8sGptResultModel extends SteveModel {

  get resource() {
    const splitName = this.splitName();

    return {
      kind: this.spec.kind,
      name: splitName.name,
      namespace: splitName.namespace,
    };
  }

  splitName() {
    const [namespace, name] = this.spec?.name?.split('/') || []
    return {
      name, 
      namespace
    }
  }

  get specState() {

    if (!this.spec) {
      return null;
    }

    if (this.spec.error?.length) {
      return this.parseState(STATES_ENUM.UNHEALTHY);
    }

    return this.parseState(STATES_ENUM.OTHER);
  }

  parseState(state) {
    return {
      stateDisplay: stateDisplay(state),
      stateBackground: colorForState(state).replace('text-', 'bg-'),
    }
  }

}