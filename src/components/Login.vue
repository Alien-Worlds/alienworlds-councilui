<template>
  <div>
    <div v-if="getAccountName.wax">
      <span class="status">Logged in as</span> <span> {{getAccountName.wax}}</span>
      <a role="button" tabindex="0" href="#" target="_self" class="button" @click="logout('wax', $event)">Log out</a>
    </div>
    <div v-else>
      <a role="button" tabindex="0" href="#" target="_self" class="button" @click="login('wax', $event)">Log in</a>
    </div>
  </div>
</template>

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
    async logout (network, event) {
      console.log('logout of network ', network)
      this.$store.dispatch('ual/logout', network)
      if (event) {
        event.preventDefault()
      }
      return false
    },
    async login (network, event) {
      console.log('login to network ', network)
      this.$store.dispatch('ual/renderLoginModal', network, { root: true })
      if (event) {
        event.preventDefault()
      }
      return false
    }
  }
}
</script>
