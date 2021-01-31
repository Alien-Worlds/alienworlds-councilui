<template>
  <div v-if="planet">
    <h1>Register as a candidate on {{planet.title}}</h1>

    <form
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="true"
    >
      <b-alert show variant="success" v-if="candidate.active">You are currently registered as a candidate for {{planet.title}}</b-alert>

      <q-input label="First Name" v-model="profile.givenName" />
      <q-input label="Last Name" v-model="profile.familyName" />
      <q-input label="Image URL" v-model="profile.image" />
      <q-editor v-model="profile.description"
                :toolbar="[['bold', 'italic', 'strike', 'underline'], ['link', 'hr'], [
          {
            label: $q.lang.editor.formatting,
            icon: $q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          }], ['viewsource']]"
      />

      <b-button @click="submitProfile">Submit Profile</b-button>
    </form>

    <div v-html="candidateDescSanitized"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import sanitizeHtml from 'sanitize-html'

export default {
  name: 'RegisterCandidate',
  data () {
    return {
      planet: null,
      planetName: null,
      profile: { givenName: '', familyName: '', image: '', description: '' },
      dacName: null,
      member: { isMember: false, termsVersion: 0 },
      candidate: { active: false },
      candidateDescSanitized: ''
    }
  },
  computed: {
    ...mapGetters({
      getAccountName: 'ual/getAccountName'
    })
  },
  methods: {
    async loadPlanet (planetName) {
      this.planetName = planetName
      const res = await this.$wax.rpc.get_table_rows({
        code: process.env.federationContract,
        scope: process.env.federationContract,
        table: 'planets',
        lower_bound: `${planetName}.world`,
        upper_bound: `${planetName}.world`
      })
      this.planet = res.rows[0]

      let dacName = this.planetName
      if (dacName === 'neri') {
        dacName = 'nerix'
      }
      this.dacName = dacName
    },
    async loadCandidateInfo () {
      console.log('Load candidate info')
      if (!this.getAccountName.wax || !this.dacName) {
        return
      }

      // is registered member
      const res = await this.$wax.rpc.get_table_rows({
        code: process.env.daoTokenContract,
        scope: this.dacName,
        table: 'members',
        lower_bound: this.getAccountName.wax,
        upper_bound: this.getAccountName.wax
      })
      if (res && res.rows.length) {
        this.member.isMember = true
        this.member.termsVersion = res.rows[0].agreedtermsversion
      }
      // profile
      const url = `${process.env.dacApiEndpoint}/v1/eosdac/profile?account=${this.getAccountName.wax}`
      const resc = await fetch(url, { headers: { 'X-DAC-Name': this.dacName } })
      const json = await resc.json()
      const profile = json.results
      if (profile.length && profile[0].profile && profile[0].profile.description) {
        this.profile = profile[0].profile
      }

      // get already registered candidate info
      const candres = await this.$wax.rpc.get_table_rows({
        code: process.env.daoContract,
        scope: this.dacName,
        table: 'candidates',
        lower_bound: this.getAccountName.wax,
        upper_bound: this.getAccountName.wax
      })
      console.log(candres)
      if (candres && candres.rows.length && candres.rows[0].is_active) {
        this.candidate.active = true
      }
    },
    async submitProfile (evt) {
      evt.preventDefault()
      // const [, dacSym] = this.planet.dac_symbol.split(',')
      console.log(process.env)
      const actions = []

      if (!this.member.isMember) {
        actions.push({
          account: process.env.daoTokenContract,
          name: 'memberrege',
          authorization: [{
            actor: this.getAccountName.wax,
            permission: 'active'
          }],
          data: {
            sender: this.getAccountName.wax,
            agreedterms: '1a46b49d0375591b94d5cbb6de8ff728',
            dac_id: this.dacName
          }
        })
      }

      actions.push({
        account: process.env.daoContract,
        name: 'stprofile',
        authorization: [{
          actor: this.getAccountName.wax,
          permission: 'active'
        }],
        data: {
          cand: this.getAccountName.wax,
          profile: this.getProfileJson(),
          dac_id: this.dacName
        }
      })

      if (!this.candidate.active) {
        actions.push({
          account: process.env.daoContract,
          name: 'nominatecane',
          authorization: [{
            actor: this.getAccountName.wax,
            permission: 'active'
          }],
          data: {
            cand: this.getAccountName.wax,
            requestedpay: '0.0000 TLM',
            dac_id: this.dacName
          }
        })
      }

      // console.log(actions)
      try {
        const profileResp = await this.$store.dispatch('ual/transact', { actions, network: 'wax' })
        console.log(profileResp)
        if (profileResp.status === 'executed') {
          this.$showSuccess('Registration complete')
        }
      } catch (e) {
        this.$showError(e.message)
      }
    },
    getProfileJson () {
      const sanitizeOptions = {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'strike'],
        allowedAttributes: {
          a: ['href']
        },
        allowedIframeHostnames: ['www.youtube.com']
      }

      const obj = {
        givenName: sanitizeHtml(this.profile.givenName, sanitizeOptions),
        familyName: sanitizeHtml(this.profile.familyName, sanitizeOptions),
        image: sanitizeHtml(this.profile.image, sanitizeOptions),
        description: this.candidateDescSanitized
      }

      return JSON.stringify(obj)
    }
  },
  watch: {
    '$route.params.planetname': async function (planetname) {
      await this.loadPlanet(planetname)
      await this.loadCandidateInfo()
    },
    getAccountName: function (account) {
      console.log('Accounbt changed')
    },
    'profile.description': function (text) {
      const sanitizeOptions = {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'strike', 'iframe', 'br', 'p'],
        allowedAttributes: {
          a: ['href'],
          iframe: ['width', 'height', 'src', 'allow', 'allowfullscreen']
        },
        allowedIframeHostnames: ['www.youtube.com']
      }
      this.candidateDescSanitized = sanitizeHtml(text, sanitizeOptions)
    }
  },
  async mounted () {
    await this.loadPlanet(this.$route.params.planetname)
    await this.loadCandidateInfo()
  }
}
</script>
