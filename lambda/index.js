const { generateGetPresignedUrl } = require('./s3');
const TalentRepository = require('./repository/talent');
const { ResourceNotFound, ResourceValidationError } = require('./repository/errors');

exports.handler = async function(event) {
  try {
    const { query, limit, offset } = event.queryStringParameters;
    
    let talents;

    if (query) {
      talents = await TalentRepository.search({ query, limit, offset});
    } else {
      talents = await TalentRepository.findAll({ limit, offset });
    }

    const talentsWithS3PresignedUrl = talents.map(talent => {
      return {
        ...talent,
        profile_picture_url: generateGetPresignedUrl(talent.profile_picture_path)
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify(talentsWithS3PresignedUrl)
    }
  } catch (err) {
    let statusCode;
    let body;

    if (err instanceof ResourceNotFound) {
      statusCode = 404;
      body = JSON.stringify(err.responseJson);
    } else if (err instanceof ResourceValidationError) {
      statusCode = 400;
      body = JSON.stringify(err.responseJson);
    } else {
      console.error(err);
      statusCode = 500;
      body = 'Something broke!';
    }

    return { statusCode, body };
  }
}
