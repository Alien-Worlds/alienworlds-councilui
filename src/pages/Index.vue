<template>
  <div v-bind:class="['intro', 'contents', {active: isActive}]">
    <div class="logo"></div>
    <h1 class="title">Planetary Councils</h1>
    <p>Welcome Explorer - Every planet needs the best people to run it and the Alien Worlds DAO system lets you decide who has control - Maybe you should be the leader!</p>
    <div v-if="!getAccountName.wax">
      <a role="button" tabindex="0" href="#" target="_self" class="button" @click="login('wax', $event)">Log in</a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'PageIndex',
  data () {
    return {
      isActive: true
    }
  },
  computed: {
    ...mapGetters({
      getAccountName: 'ual/getAccountName'
    })
  },
  methods: {
    async login (network, event) {
      this.$store.dispatch('ual/renderLoginModal', network, { root: true })
      if (event) {
        event.preventDefault()
      }
    }
  },
  async beforeUnmount () {
    this.isActive = false
  }
}
</script>
