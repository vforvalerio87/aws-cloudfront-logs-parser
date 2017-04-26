'use strict'

const config = require('./config')
const AWS = require('aws-sdk')
const fs = require('fs')
const path = process.argv[3]
const zlib = require('zlib')

if (path) {
  try {
    fs.unlinkSync(`${path}.log`)
  } catch (err) {}
}

if (config.roleArn && config.roleArn.substr(0, 3) === 'arn') {
  AWS.config.credentials = new AWS.TemporaryCredentials({RoleArn: config.roleArn})
}

const s3 = new AWS.S3()

const params = {
  Bucket: config.bucket,
  Prefix: config.prefix
}

s3.listObjectsV2(params).promise()
  .then(data => {
    data.Contents.forEach(content => {
      const params = {
        Bucket: config.bucket, 
        Key: content.Key
      }
      s3.getObject(params).promise()
        .then(data => {
          zlib.gunzip(data.Body, (err, data) => {
            if (err) throw err
            else if (data) {
              data.toString().split('\n').forEach(line => {
                if (line.indexOf(`${process.argv[2]}\thttp`) !== -1) {
                  console.log(line) 
                  if (path) {
                    fs.appendFile(`./${path}.log`, `${line}\n`, (err) => {
                      if (err) throw err 
                    })
                  }
                }
              })
            }
          })
        })
        .catch(err => {
          throw err
        })
    })
  })
  .catch(err => {
    throw err
  })
