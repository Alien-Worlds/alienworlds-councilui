<template>
  <div>
    <div v-if="getAccountName.wax">
      <div class="islogged active">
        <span class="status">Logged in </span> <span>{{getAccountName.wax}}</span>
        <a class="button logoutbtn active" @click="logout('wax', $event)">Log Out</a>
      </div>
    </div>
    <div v-else>
      <div class="notlogged active"><a class="button loginbtn" @click="login('wax', $event)">Log In</a></div>
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
