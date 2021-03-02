<template>
  <div v-if="planet">
    <h1>Register as a candidate on {{planet.title}}</h1>

    <div class="row">
      <div class="col-6 q-pa-sm">
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
          }],  ['quote', 'unordered', 'ordered', 'outdent', 'indent'], ['viewsource']]"
          />

          <div class="mt-2" v-if="!insufficientDaoBalance">
            <b-button @click="submitProfile">Submit Profile</b-button>
          </div>

          <div class="mt-3">
            <div class="alert alert-warning">Registering as a candidate requires {{stakeRequirement}} tokens to be locked, you have {{daoTokenBalance}} available</div>
            <div class="alert alert-danger" v-if="insufficientDaoBalance">You do not have enough DAO tokens to register</div>
          </div>
        </form>
      </div>

      <div class="col-6 q-pa-sm">
        <h2>Preview</h2>
        <div v-if="profile.image">
          <img :src="profile.image" style="width: 435px" />
        </div>
        <div v-html="candidateDescSanitized"></div>
      </div>
    </div>

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
      stakeRequirement: '',
      daoTokenBalance: '',
      dacSymbol: '',
      insufficientDaoBalance: false,
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
      const [, sym] = this.planet.dac_symbol.split(',')
      this.dacSymbol = sym
      this.stakeRequirement = `0.0000 ${sym}`
      const sr = await this.$getStakeRequirement(dacName)
      if (sr) {
        this.stakeRequirement = sr
      }
      const tokenRes = await this.$wax.rpc.get_currency_balance(process.env.daoTokenContract, this.getAccountName.wax, sym)
      // console.log(tokenRes)
      this.daoTokenBalance = `0.0000 ${sym}`
      if (tokenRes.length) {
        this.daoTokenBalance = tokenRes[0]
      }
      const existingStake = await this.$getStake(this.getAccountName.wax)
      console.log(existingStake)
      const [balStr] = this.daoTokenBalance.split(' ')
      const [reqStr] = this.stakeRequirement.split(' ')
      let existingStr = `0.0000 ${sym}`
      if (existingStake) {
        [existingStr] = existingStake.split(' ')
      }
      if (parseFloat(reqStr) >= (parseFloat(balStr) + parseFloat(existingStr))) {
        this.insufficientDaoBalance = true
      }
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

      try {
        const hash = await this.$getConstitutionHash(this.dacName)
        console.log('got hash', hash)

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
              agreedterms: hash,
              dac_id: this.dacName
            }
          })
        }

        console.log('PLANET', this.planet)
        const stakeRequirement = await this.$getStakeRequirement(this.dacName)
        const [reqStr, daoStakeSym] = stakeRequirement.split(' ')
        const stake = await this.$getStake(this.dacName, this.getAccountName.wax)
        let stakeStr = '0'
        if (stake) {
          [stakeStr] = stake.split(' ')
        }
        const extraStake = parseFloat(reqStr) - parseFloat(stakeStr)
        console.log(`Staked ${stakeStr} (${stake}), required ${reqStr}`)
        if (extraStake > 0) {
          actions.push({
            account: process.env.daoTokenContract,
            name: 'stake',
            authorization: [{
              actor: this.getAccountName.wax,
              permission: 'active'
            }],
            data: {
              account: this.getAccountName.wax,
              quantity: `${extraStake.toFixed(4)} ${daoStakeSym}`
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
