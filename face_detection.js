const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const { CLARIFAI_KEY } = require("./env_constants");
const fs = require('fs');

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${CLARIFAI_KEY}`);

exports.isFacePresent = async function(image) {
  const response = await postModelOutputs(image, 'd02b4508df58432fbb84e800597b8959');

  if (!response.outputs || (response.outputs && response.outputs.length === 0)) {
    throw new Error("Zero outputs from Clarifai response. One expected.");
  }
  const output = response.outputs[0];
  const regions = output.data.regions;
  
  return regions.length > 0;
}

function postModelOutputs(image, modelId) {
  return new Promise((resolve, reject) => {
    const imageBytes = fs.readFileSync(image);

    stub.PostModelOutputs(
      {
          model_id: modelId,
          inputs: [{data: {image: { base64: imageBytes }}}]
      },
      metadata,
      (err, response) => {
          if (err) {
              reject(err);
              return;
          }

          if (response.status.code !== 10000) {
            const e = new Error("Post inputs failed, status: " + response.status.description);
            reject(e);
            return;
          }
  
          resolve(response);
      }
    );
  });
}
