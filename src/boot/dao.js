import Vue from 'vue'
import md5 from 'md5'

Vue.prototype.$getConstitutionHash = async (dacId) => {
  console.log(Vue.prototype.$wax, process.env.daoTokenContract, dacId)
  const constRes = await Vue.prototype.$wax.rpc.get_table_rows({
    code: process.env.daoTokenContract,
    scope: dacId,
    table: 'memberterms',
    index_position: 2,
    key_type: 'i64',
    limit: 1
  })
  if (!constRes.rows.length) {
    throw new Error(`Could not find current terms for ${dacId}`)
  }
  try {
    const urlRes = await fetch(constRes.rows[0].terms)
    const constitutionText = await urlRes.text()
    const constitutionMd5 = md5(constitutionText)

    if (constitutionMd5 !== constRes.rows[0].hash) {
      console.error('Downloaded constitution doesnt match on chain hash')
      return constRes.rows[0].hash
    }

    return constitutionMd5
  } catch (e) {
    throw new Error(`Could not fetch constitution from ${constRes.rows[0].terms}`)
  }
}

Vue.prototype.$getStakeRequirement = async (dacId) => {
  const configRes = await Vue.prototype.$wax.rpc.get_table_rows({
    code: process.env.daoContract,
    scope: dacId,
    table: 'config2'
  })
  // console.log(configRes.rows[0].lockupasset.quantity)
  if (configRes.rows.length) {
    return configRes.rows[0].lockupasset.quantity
  }
  return null
}

Vue.prototype.$getStake = async (dacId, account) => {
  const stakeRes = await Vue.prototype.$wax.rpc.get_table_rows({
    code: process.env.daoTokenContract,
    scope: dacId,
    table: 'stakes',
    lower_bound: account,
    upper_bound: account
  })
  // console.log(configRes.rows[0].lockupasset.quantity)
  if (stakeRes.rows.length) {
    return stakeRes.rows[0].stake
  }
  return null
}
