<script>
import { BadgeState } from '@components/BadgeState';
export default {
  components: { BadgeState },
  props:      {
    value: {
      type:     Object,
      default: () => {}
    },
    row: {
      type:     Object,
      required: true
    },
    col: {
      type:    Object,
      default: () => {}
    },
  },

  data() {
    return {
      stateDisplay:    '',
      stateBackground: ''
    };
  },

  watch: {
    value: {
      handler() {
        this.stateDisplay = this.value?.stateDisplay;
        this.stateBackground = this.value?.stateBackground;
      },
      immediate: true
    }
  }
};
</script>

<template>
  <BadgeState
    v-if="stateBackground && stateDisplay"
    :color="stateBackground"
    :label="stateDisplay"
  />
</template>
