<template>
  <div v-bind:class="['intro', 'contents', {active: isActive}]">
    <div class="logo"></div>
    <h1 class="title">Planetary Councils</h1>
    <p>Welcome Explorer - Every planet needs the best people to run it and the Alien Worlds DAO system lets you decide who has control - Maybe you should be the leader!</p>
    <login></login>
  </div>
</template>

<script>
import Login from 'components/Login.vue'
export default {
  name: 'PageIndex',
  components: {
    Login
  },
  data () {
    return {
      isActive: true
    }
  },
  async beforeUnmount () {
    this.isActive = false
  }
}
</script>
