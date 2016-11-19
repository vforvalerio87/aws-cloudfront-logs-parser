Usage:

First of all, rename 'config.sample.json' to 'config.json' and insert appropriate values.
Specify a "roleArn" if you want to use temporary credentials from a role, otherwise ignore it.

Log to console
```
node . ${statusCode}
```

Output to file ${outputFileName}.log
```
node . ${statusCode} ${outputFileName}
```
