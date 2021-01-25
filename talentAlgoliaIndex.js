const algoliasearch = require("algoliasearch");
const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, ALGOLIA_TALENT_INDEX } = require("./env_constants");
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
const talentIndex = client.initIndex(ALGOLIA_TALENT_INDEX);

module.exports = talentIndex;
