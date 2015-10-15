/**
 * Sample nodeJs Lambda function that is triggered by a S3 upload that creates a document in Nuxeo.
 * In order to localize the blob, Nuxeo expects the key of the object in S3 to be the digest (hash), so this key has to be provided when uploading the document in S3
 * ( if this key is not provided explicitly than the blob is uploaded into S3 using its filename as a key and it won't work)
 * Also,  this functions expects a S3 metadata called 'title' as the title of the document.
 * A sample upload of a document in S3 that will corectly trigger this function to create a document in Nuxeo is:
 *  aws s3api put-object --bucket bucketName --key $digest  --body $filePath --content-type $fileContentType--metadata title=$fileTitle
 *
 * The operation invoked on Nuxeo is CreateDocumentFromS3Blob and it expects the id of the parent document as an input.
 * 
 * 
 */
var aws = require('aws-sdk');
var s3 = new aws.S3({
    apiVersion : '2006-03-01'
});
var http = require('http');
var crypto = require('crypto');

var options = {
host : '52.26.252.66',
port : '8080',
method : 'POST',
path : '/nuxeo/site/automation/CreateDocumentFromS3Blob',
headers : {
'Accept' : 'application/json',
'Content-Type' : 'application/json+nxrequest'
},
auth : 'Administrator:Administrator'
};

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;

    var params = {
    Bucket : bucket,
    Key : key
    };

    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err);
            var message = "Error getting object " + key + " from bucket " + bucket + ". Make sure they exist and your bucket is in the same region as this function.";
            console.log(message);
            context.fail(message);
        } else {

            //Nuxeo expects the key to be the digest of the file
            // var digest = crypto.createHash('md5').update(data.Body).digest("hex");
            var title = data.Metadata.title !== undefined ? data.Metadata.title : key;
            //console.log('title :', data.Metadata.title);

            //the input is the id of the parent document
            var postData = JSON.stringify({
            "input" : "f04453f9-de1c-4a8d-9956-add074069813",
            "params" : {
            "filename" : title,
            "mimeType" : data.ContentType,
            "digest" : key,
            "length" : data.ContentLength
            }
            });

            var req = http.request(options, function(res) {
                res.on('data', function(response) {
                    console.log('Nuxeo response:' + response);
                    context.succeed('succeed');
                });

                res.on('end', function(response) {
                    context.succeed('end');
                });

            });
            req.write(postData);
            req.end();
        }
    });
};
