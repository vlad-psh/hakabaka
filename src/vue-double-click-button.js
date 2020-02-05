Vue.component('vue-double-click-button', {
  props: {
  },
  data() {
    return {
      state: 'default' // default -> waiting -> clicked
    }
  },
  methods: {
    click() {
      if (this.state === 'default') {
        this.state = 'waiting';
        setTimeout(() => {
          this.state = 'default';
        }, 1000);
      } else if (this.state === 'waiting') {
        this.state = 'clicked';
        this.$emit('click');
      }
    }
  },
  template: `
<div class="vue-double-click-button no-refocus" :class="state" @click="click">
  <div class="timeout"></div>
  <div class="title"><slot></slot></div>
</div>
`
});
