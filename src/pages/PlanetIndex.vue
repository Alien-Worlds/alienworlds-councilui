<template>
  <div v-if="planet">
    <h1>{{planet.title}}</h1>
    <b-container>
      <b-row>
        <b-col sm="2"><img :src="planet.fullImage" style="max-width:150px" /></b-col>
        <b-col sm="10">
          {{planet.metadata.description}}
          <p><router-link :to="'/register/' + planetName">Register as a Candidate</router-link></p>
        </b-col>
      </b-row>
    </b-container>

    <hr />

    <div v-if="candidatesLoaded">
      <b-card-group columns style="color:#000" v-if="candidates.length">
        <b-card
          :title="candidate.profile.givenName + ' ' + candidate.profile.familyName"
          :img-src="candidate.profile.image"
          :img-alt="candidate.profile.givenName + ' ' + candidate.profile.familyName"
          img-top
          v-for="candidate in candidates"
          :key="candidate.candidate_name"
        >
          <b-card-text>
            <b-card-text><small>{{candidate.candidate_name}} - {{candidate.total_votes}} Votes</small></b-card-text>
            {{candidate.short_description}}
          </b-card-text>
          <template #footer>
            <b-container fluid>
              <b-row>
                <b-col class="text-right"><b-button @click="viewCandidate(candidate)">More</b-button></b-col>
              </b-row>
            </b-container>
          </template>
        </b-card>
      </b-card-group>

      <div v-else>
        No candidates registered for this planet
      </div>
    </div>

    <div v-if="!candidatesLoaded">Loading...</div>

    <b-modal id="candidate-detail-modal" hide-footer style="background-color:#000">
      <template #modal-title>
        {{candidateDetail.title}}
      </template>
      <div class="d-block text-center" v-html="candidateDetail.description">
      </div>
      <b-button class="mt-3" block @click="$bvModal.hide('candidate-detail-modal')">Close</b-button>
    </b-modal>
  </div>
</template>

<script>
import sanitizeHtml from 'sanitize-html'

export default {
  name: 'PlanetIndex',
  data () {
    return {
      planetName: '',
      planet: null,
      candidates: [],
      candidatesLoaded: false,
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
        return c
      })

      this.candidatesLoaded = true
    },
    viewCandidate (candidate) {
      this.candidateDetail.title = candidate.profile.givenName + ' ' + candidate.profile.familyName
      this.candidateDetail.description = candidate.profile.description
      this.$bvModal.show('candidate-detail-modal')
    }
  },
  watch: {
    '$route.params.planetname': function (planetname) {
      this.candidatesLoaded = false
      this.planetName = planetname
      this.loadPlanet(planetname)
    }
  },
  async mounted () {
    this.planetName = this.$route.params.planetname
    this.loadPlanet(this.$route.params.planetname)
  }
}
</script>
