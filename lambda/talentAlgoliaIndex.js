const algoliasearch = require("algoliasearch");
const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, ALGOLIA_TALENT_INDEX } = require("./env_constants");
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, {
  timeouts: {
    connect: 2, // connection timeout in seconds
    read: 5, // read timeout in seconds
    write: 30 // write timeout in seconds
  }
});
const talentIndex = client.initIndex(ALGOLIA_TALENT_INDEX);

module.exports = talentIndex;
