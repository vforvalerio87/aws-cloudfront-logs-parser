'use strict';

const config = require('./config');

const AWS = require('aws-sdk');

if (config.roleArn && config.roleArn.substr(0, 3) === 'arn') {
  AWS.config.credentials = new AWS.TemporaryCredentials({RoleArn: config.roleArn});
}

const fs = require('fs');
const path = process.argv[3];

if (path) {
  try {
    fs.unlinkSync(`${path}.log`);
  } catch (err) {}
};

const zlib = require('zlib');

const s3 = new AWS.S3();

const params = {
  Bucket: config.bucket,
  Prefix: config.prefix
};

s3.listObjectsV2(params, (err, data) => {
  if (err) throw err;
  const contents = data.Contents;
  const l = contents.length;
  for (let i = 0; i < l; i++) {
    const params = {
      Bucket: config.bucket, 
      Key: contents[i].Key
    };

    s3.getObject(params, (err, data) => {
      if (err) throw err;
      const body = data.Body; 
      zlib.gunzip(body, (err, data) => {
        if (err) throw err;

        const lines = data.toString().split('\n'); 
        const l = lines.length;
        for (let i = 0; i < l; i++) {
          const line = lines[i];
          if (line.indexOf(`${process.argv[2]}\thttp`) !== -1) {
            console.log(line); 
            if (path) {
              fs.appendFile(`./${path}.log`, `${line}\n`, (err) => {
                if (err) throw err; 
              });
            }
          }
        } 
      });
    });
  }
});
