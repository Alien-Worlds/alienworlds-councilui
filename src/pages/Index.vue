<template>
  <div v-bind:class="['intro', 'contents', {active: isActive}]">
    <div class="logo"></div>
    <h1 class="title">Planetary Councils</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla hendrerit dolor tellus. Aliquam porttitor urna eu purus placerat.</p>
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
