<template>
  <div id="container">
    <div v-bind:class="['overlay', {active: alertError}]">
      <div class="overlaywrap">
        <div v-bind:class="['type', 'error', {active: alertError}]">
          <div class="icon"></div>
          <h3 class="title">Error</h3>
          <p>{{alertError}}</p>
          <a class="button invert close" @click="closeDialog">Ok</a>
        </div>
      </div>
    </div>
    <div v-bind:class="['overlay', {active: alertInfo}]">
      <div class="overlaywrap">
        <div v-bind:class="['type', 'success', {active: alertInfo}]">
          <div class="icon"></div>
          <h3 class="title">Success</h3>
          <p>{{alertInfo}}</p>
          <a class="button invert close" @click="closeDialog">Ok</a>
        </div>
      </div>
    </div>

    <div class="wrapper">

      <!-- -------------------Navigation------------------- -->
      <nav v-bind:class="{active: showMenu}">
        <router-link tag="div" to="/planet/eyeke" v-bind:class="['item', 'eyeke']"><div class="planet"><div class="globe"></div></div>Eyeke</router-link>
        <router-link tag="div" to="/planet/kavian" v-bind:class="['item', 'kavian']"><div class="planet"><div class="globe"></div></div>Kavian</router-link>
        <router-link tag="div" to="/planet/magor" v-bind:class="['item', 'magor']"><div class="planet"><div class="globe"></div></div>Magor</router-link>
        <router-link tag="div" to="/planet/naron" v-bind:class="['item', 'naron']"><div class="planet"><div class="globe"></div></div>Naron</router-link>
        <router-link tag="div" to="/planet/neri" v-bind:class="['item', 'neri']"><div class="planet"><div class="globe"></div></div>Neri</router-link>
        <router-link tag="div" to="/planet/veles" v-bind:class="['item', 'veles']"><div class="planet"><div class="globe"></div></div>Veles</router-link>
      </nav>

      <router-view />
      <!-- -------------------GENERAL Voting Layout, For Loading Information -------------------
      ------------------------------------------------------------------------------------------
      -->
    </div>

    <!-- -------------------Profile Bar, Doubles as the Top Header------------------- -->
    <div class="profile">
      <div class="mobile-menu" @click="showMenu = !showMenu"></div>
      <!-- -------------------Log-In and other Logging Status------------------- -->
      <div class="login"><login></login></div>
      <div class="watermark"><div class="logo"></div><div class="title">Planetary Councils</div></div>
    </div>

    <!-- -------------------Background Animated Elements------------------- -->
    <div class="background">
      <div class="gradients grad1"></div>
      <div class="gradients grad2"></div>
      <div class="gradients grad3"></div>
      <div class="planetbg"></div>
      <div class="objects"><div class="grid"></div><div class="lines"></div><div class="dots"></div></div>
      <div class="sky"></div>
      <div class="fade"></div>
    </div>

  </div>
  <!--
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Planetary Councils
        </q-toolbar-title>
        <login></login>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          <img src="https://alienworlds.io/assets/images/our-logo3-128x50.png" alt="Alien Worlds" class="img-fluid">
        </q-item-label>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <div style="padding: 20px">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>-->
</template>

<script>
// import EssentialLink from 'components/EssentialLink.vue'
import { mapGetters } from 'vuex'
import Login from 'components/Login.vue'

export default {
  name: 'MainLayout',
  components: {
    Login
  },
  data () {
    return {
      planetName: '',
      showMenu: false
    }
  },
  computed: {
    ...mapGetters({
      alertError: 'global/getError',
      alertInfo: 'global/getInfo'
    })
  },
  watch: {
    '$route.params.planetname': function (planetname) {
      this.showMenu = false
    }
  },
  methods: {
    async closeDialog () {
      await this.$store.commit('global/setError', '')
      await this.$store.commit('global/setInfo', '')
    }
  },
  async mounted () {
    await this.$store.dispatch('ual/attemptAutoLogin')
    // await this.$store.commit('global/setInfo', 'new testing error')
    this.planetName = this.$route.params.planetname
  }
}
</script>
