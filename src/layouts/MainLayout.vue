<template>
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
      <div style="padding: 0 20px">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import Login from 'components/Login.vue'

const linksData = [
  {
    title: 'Eyeke',
    caption: '',
    icon: 'public',
    link: '/planet/eyeke'
  },
  {
    title: 'Kavian',
    caption: '',
    icon: 'public',
    link: '/planet/kavian'
  },
  {
    title: 'Magor',
    caption: '',
    icon: 'public',
    link: '/planet/magor'
  },
  {
    title: 'Naron',
    caption: '',
    icon: 'public',
    link: '/planet/naron'
  },
  {
    title: 'Neri',
    caption: '',
    icon: 'public',
    link: '/planet/neri'
  },
  {
    title: 'Veles',
    caption: '',
    icon: 'public',
    link: '/planet/veles'
  }
]

export default {
  name: 'MainLayout',
  components: {
    EssentialLink,
    Login
  },
  data () {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData
    }
  },
  async mounted () {
    await this.$store.dispatch('ual/attemptAutoLogin')
  }
}
</script>
