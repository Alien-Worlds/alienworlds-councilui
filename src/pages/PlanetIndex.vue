<template>
<!--  <div v-if="planet">-->
  <div class="wrapper" v-if="planet">
    <div id="info" v-bind:class="['contents', planet.planet_name.replace('.world', ''), {active: show}, {candidate: showRegister}]" v-if="loaded">
      <div class="theinfo">
        <h2 class="title">{{planet.title}}</h2>
        <div class="infocontent">
          <p>{{planet.metadata.description}}</p>
          <a class="button vote" @click="show = false;showVoting = true">View Candidates</a>
        </div>
        <div class="back" @click="showRegister = false" v-if="showRegister">Back to Planet Info</div>
        <register-candidate />
      </div>
      <div class="theplanet">
        <div class="globewrap"><div class="globe"></div></div>
        <a class="button invert register" @click="showRegister = true">Become a Candidate</a>
      </div>
    </div>

    <div id="voting" v-bind:class="['contents', planetName, {active: showVoting}]">
      <div class="back" v-if="!showingCandidate" @click="showVoting = false;show = true">Back to Planet Info</div>
      <div class="titlewrap">
        <h2 class="title">{{planet.title}}</h2><div class="globe"></div><h4>Candidates</h4>
      </div>
      <div v-bind:class="['candidateswrap', {viewbio: showingCandidate}]">
        <!-- -------------------Main Candidate Profile------------------- -->
        <div class="candprofile" v-for="candidate in candidates" :key="candidate.candidate_name">
          <div class="persona" @click="viewCandidate(candidate)">
            <div class="image" v-bind:style="{'backgroundImage': 'url(' + candidate.profile.image + ')'}" v-if="candidate.profile.image"></div>
            <div class="image" v-if="!candidate.profile.image"></div>
            <div class="personainfo">
              <div class="name">{{candidate.profile.givenName}} {{candidate.profile.familyName}}</div>
              <div class="votes"><div class="count">0</div></div>
            </div>
          </div>
          <!-- Add back once voting active
          <div class="votebtn"><div class="voteicon"></div></div>
           -->
        </div>
      </div>

      <!-- -------------------Separate loaded Bio Description, Used to pull in the Bio Informatio from the Profile/Candidate Registration------------------- -->
      <div v-bind:class="['biowrap', {active: showingCandidate}]">
        <div class="candprofile">
          <div class="persona">
            <div class="image" v-bind:style="{'backgroundImage': 'url(' + selectedCandidate.profile.image + ')'}" v-if="selectedCandidate.profile.image"></div>
            <div class="image" v-if="!selectedCandidate.profile.image"></div>
            <div class="personainfo"><div class="name">{{selectedCandidate.profile.givenName}} {{selectedCandidate.profile.familyName}}</div>
              <div class="votes"><div class="count">0</div></div></div>
          </div>
<!--          <div class="votebtn"><div class="voteicon"></div></div>-->
        </div>
        <div class="biodesc">
          <p v-html="selectedCandidate.profile.description"></p>
          <a class="button invert return" @click="showingCandidate = false">Back to Candidate List</a>
        </div>
      </div>

    </div>
  </div>

</template>

<script>
import sanitizeHtml from 'sanitize-html'
import RegisterCandidate from 'components/RegisterCandidate'

export default {
  name: 'PlanetIndex',
  components: {
    RegisterCandidate
  },
  data () {
    return {
      planetName: '',
      planet: null,
      candidates: [],
      candidatesLoaded: false,
      loaded: false,
      show: false,
      showVoting: false,
      showRegister: false,
      showingCandidate: false,
      selectedCandidate: { profile: {} },
      candidateDetail: {
        title: '',
        description: ''
      }
    }
  },
  methods: {
    async loadPlanet (planetName) {
      const res = await this.$wax.rpc.get_table_rows({
        code: process.env.federationContract,
        scope: process.env.federationContract,
        table: 'planets',
        lower_bound: `${planetName}.world`,
        upper_bound: `${planetName}.world`
      })
      this.planet = res.rows[0]
      this.planet.metadata = JSON.parse(this.planet.metadata)
      this.planet.fullImage = process.env.ipfsRoot + this.planet.metadata.img

      let dacName = this.planetName
      if (dacName === 'neri') {
        dacName = 'nerix'
      }
      this.dacName = dacName

      // get candidates
      const url = `${process.env.dacApiEndpoint}/v1/eosdac/candidates`
      const resc = await fetch(url, { headers: { 'X-DAC-Name': this.dacName } })
      const json = await resc.json()
      this.candidates = json.results.map(c => {
        const sanitizeOptions = {
          allowedTags: []
        }
        const plainDesc = sanitizeHtml(c.profile.description, sanitizeOptions)
        c.short_description = plainDesc.substr(0, 300)
        if (plainDesc.length > 300) {
          c.short_description += ' ...'
        }
        // TODO: Support all ipfs links
        console.log(c)
        c.profile.image = c.profile.image.replace('wax.atomichub', 'ipfs')
        if (c.profile.image.substr(0, 1) === 'Q') {
          c.profile.image = `https://ipfs.io/ipfs/${c.profile.image}`
        }
        console.log(c)
        return c
      })

      this.candidatesLoaded = true
      this.loaded = true

      setTimeout(() => {
        this.show = true
      }, 50)
    },
    viewCandidate (candidate) {
      this.selectedCandidate = candidate
      this.showingCandidate = true
    },
    scrollTop: function () {
      this.intervalId = setInterval(() => {
        if (window.pageYOffset === 0) {
          clearInterval(this.intervalId)
        }
        window.scroll(0, window.pageYOffset - 50)
      }, 20)
    }
  },
  watch: {
    '$route.params.planetname': function (planetname) {
      this.candidatesLoaded = false
      this.loaded = false
      this.show = false
      this.showVoting = false
      this.showRegister = false
      this.showingCandidate = false
      this.planetName = planetname
      this.loadPlanet(planetname)
      this.scrollTop()
    },
    showingCandidate: function () {
      this.scrollTop()
    }
  },
  async mounted () {
    this.planetName = this.$route.params.planetname
    this.loadPlanet(this.$route.params.planetname)
  }
}
</script>
