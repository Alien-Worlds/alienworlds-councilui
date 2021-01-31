<template>
  <div>
    <div v-if="getAccountName.wax">Logged in as {{getAccountName.wax}} <b-button href="#" @click="logout('wax')">Log out</b-button></div>
    <div v-else><b-button href="#" @click="login('wax')">Log in</b-button></div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Login',
  computed: {
    ...mapGetters({
      getAccountName: 'ual/getAccountName'
    })
  },
  methods: {
    async logout (network) {
      console.log('logout of network ', network)
      this.$store.dispatch('ual/logout', network)
    },
    async login (network) {
      console.log('login to network ', network)
      this.$store.dispatch('ual/renderLoginModal', network, { root: true })
    }
  }
}
</script>
