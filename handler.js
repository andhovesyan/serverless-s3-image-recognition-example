'use strict';
const fs = require('fs');
const axios = require('axios');
const AWS = require('aws-sdk');
const imgCheck = require('./helpers/imgCheck');

AWS.config.update({region: 'us-west-2'});

module.exports.postprocess = async (event, context) => {
  const S3 = new AWS.S3();
  event.Records.forEach((record) => {
    S3.getObject({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    }, async (err, data) => {
      const state = await imgCheck(data.Body);
      if (state) {
        console.log('OK!');
      } else {
        console.log('Error occured');
      }
    });
  });
};

module.exports.webhook = async (event, context) => {
  const key = JSON.parse(event.body).Records[0].s3.object.key;
  const url = 'http://cdn.snap.menu/' + key;
  const res = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  const state = (await imgCheck(res.data)) ? 1 : 0;

  return {
    statusCode: 200,
    body: JSON.stringify({state})
  };
};
